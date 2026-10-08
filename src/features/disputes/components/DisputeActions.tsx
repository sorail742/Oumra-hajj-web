"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  useEscaladerLitige,
  useResoudreLitige,
  useTrancherLitige,
} from "../api/use-disputes";
import { estActif, peutEscalader, type Dispute } from "../api/schemas";
import { Can } from "@/components/shared/Can";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateHeure } from "@/lib/format";

/**
 * Actions de la médiation (idée #62) : le pèlerin clôt à l'amiable ou
 * demande l'arbitrage ; l'administration tranche un litige escaladé. Le
 * backend revérifie chaque transition.
 */
export function DisputeActions({ litige }: Readonly<{ litige: Dispute }>) {
  const t = useTranslations("disputes.actions");
  const resolution = useResoudreLitige(litige.id);
  const escalade = useEscaladerLitige(litige.id);
  const arbitrage = useTrancherLitige(litige.id);
  const [decision, setDecision] = useState("");

  const dialogue =
    litige.status === "open" || litige.status === "agency_responded";
  const escaladePossible = peutEscalader(litige);

  async function trancher(e: FormEvent) {
    e.preventDefault();
    try {
      await arbitrage.mutateAsync(decision.trim());
      toast.success(t("decided"));
      setDecision("");
    } catch {
      toast.error(t("error"));
    }
  }

  if (!estActif(litige.status)) return null;

  return (
    <>
      <Can role="pilgrim">
        {dialogue && (
          <section className="bg-card space-y-3 rounded-lg border p-4 shadow-(--shadow-card)">
            <h2 className="font-medium">{t("pilgrimTitle")}</h2>
            <div className="flex flex-wrap gap-2">
              <ConfirmDialog
                trigger={<Button variant="outline">{t("resolve")}</Button>}
                title={t("resolveTitle")}
                description={t("resolveDescription")}
                confirmLabel={t("resolve")}
                enCours={resolution.isPending}
                onConfirm={() => resolution.mutateAsync(undefined)}
              />
              <ConfirmDialog
                trigger={
                  <Button disabled={!escaladePossible}>{t("escalate")}</Button>
                }
                title={t("escalateTitle")}
                description={t("escalateDescription")}
                confirmLabel={t("escalate")}
                enCours={escalade.isPending}
                onConfirm={() => escalade.mutateAsync(undefined)}
              />
            </div>
            {!escaladePossible && (
              <p className="text-muted-foreground text-sm">
                {t("escalateLater", {
                  date: formatDateHeure(litige.escalationAvailableAt),
                })}
              </p>
            )}
          </section>
        )}
      </Can>
      <Can role="admin">
        {litige.status === "escalated" && (
          <form
            onSubmit={trancher}
            className="bg-card space-y-3 rounded-lg border p-4 shadow-(--shadow-card)"
          >
            <h2 className="font-medium">{t("adminTitle")}</h2>
            <div className="space-y-1">
              <Label htmlFor="decision">{t("decision")}</Label>
              <Textarea
                id="decision"
                rows={4}
                maxLength={2000}
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                {t("decisionHint")}
              </p>
            </div>
            <Button
              type="submit"
              disabled={decision.trim().length < 10 || arbitrage.isPending}
            >
              {t("decide")}
            </Button>
          </form>
        )}
      </Can>
    </>
  );
}
