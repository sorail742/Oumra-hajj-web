"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useEnvoyerDevis,
  useSupprimerDevis,
  useUnDevis,
} from "../api/use-quotes";
import { statutAffiche, type Quote } from "../api/schemas";
import { QuoteLinesTable } from "./QuoteLinesTable";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CopyButton } from "@/components/shared/CopyButton";
import { DetailSkeleton } from "@/components/shared/DetailSkeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateHeure, formatTelephone } from "@/lib/format";

/** Fiche d'un devis (idée #49) : envoi, lien client, réponse. */
export function QuoteDetailScreen({ id }: Readonly<{ id: string }>) {
  const query = useUnDevis(id);
  return (
    <AsyncBoundary
      query={query}
      skeleton={<DetailSkeleton />}
      isEmpty={() => false}
    >
      {(devis) => <Fiche devis={devis} />}
    </AsyncBoundary>
  );
}

function Fiche({ devis }: Readonly<{ devis: Quote }>) {
  const t = useTranslations("quotes.detail");
  const tt = useTranslations("quotes.clientTypes");
  const router = useRouter();
  const envoi = useEnvoyerDevis(devis.id);
  const suppression = useSupprimerDevis(devis.id);
  const lien =
    devis.shareToken && typeof window !== "undefined"
      ? `${window.location.origin}/quote/${devis.shareToken}`
      : undefined;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-mono text-sm">{devis.number}</p>
          <h2 className="text-xl font-semibold">{devis.clientName}</h2>
          <p className="text-muted-foreground text-sm">
            {tt(devis.clientType)} ·{" "}
            {t("pilgrims", { count: devis.pilgrimsCount })}
            {devis.packageTitle ? ` · ${devis.packageTitle}` : ""}
          </p>
        </div>
        <StatusBadge kind="quote" value={statutAffiche(devis)} />
      </header>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">{t("contact")}</dt>
          <dd>
            {devis.contactName}
            {devis.contactPhone && (
              <span className="block font-mono">
                {formatTelephone(devis.contactPhone)}
              </span>
            )}
            {devis.contactEmail && (
              <span className="block">{devis.contactEmail}</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("validUntil")}</dt>
          <dd className="tabular-nums">{formatDate(devis.validUntil)}</dd>
          {devis.respondedAt && (
            <dd className="text-muted-foreground tabular-nums">
              {t("respondedAt", { date: formatDateHeure(devis.respondedAt) })}
            </dd>
          )}
        </div>
      </dl>

      <QuoteLinesTable totaux={devis} />

      {devis.conditions && (
        <section className="space-y-1">
          <h3 className="font-medium">{t("conditions")}</h3>
          <p className="text-sm whitespace-pre-line">{devis.conditions}</p>
        </section>
      )}

      {devis.status === "draft" && (
        <div className="flex flex-wrap gap-2">
          <ConfirmDialog
            trigger={
              <Button>
                <Send aria-hidden className="size-4" />
                {t("send")}
              </Button>
            }
            title={t("sendTitle")}
            description={t("sendDescription")}
            confirmLabel={t("send")}
            enCours={envoi.isPending}
            onConfirm={async () => {
              await envoi.mutateAsync(undefined);
              toast.success(t("sent"));
            }}
          />
          <ConfirmDialog
            trigger={
              <Button variant="outline">
                <Trash2 aria-hidden className="size-4" />
                {t("delete")}
              </Button>
            }
            title={t("deleteTitle")}
            description={t("deleteDescription")}
            confirmLabel={t("delete")}
            destructive
            enCours={suppression.isPending}
            onConfirm={async () => {
              await suppression.mutateAsync(undefined);
              toast.success(t("deleted"));
              router.push("/quotes");
            }}
          />
          <p className="text-muted-foreground w-full text-xs">
            {t("draftHint")}
          </p>
        </div>
      )}

      {lien && devis.status === "sent" && !devis.expired && (
        <section className="bg-card space-y-2 rounded-lg border p-4">
          <h3 className="font-medium">{t("linkTitle")}</h3>
          <p className="text-muted-foreground text-sm">{t("linkHint")}</p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="bg-muted max-w-full truncate rounded px-2 py-1 font-mono text-xs">
              {lien}
            </code>
            <CopyButton value={lien} label={t("copyLink")} />
          </div>
        </section>
      )}
    </div>
  );
}
