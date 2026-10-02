"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LONGUEUR_MIN_MOTIF_REFUS_AGENCE,
  useApproveAgency,
  useRejectAgency,
} from "../api/use-agencies";

/**
 * Décision de l'administrateur sur une agence (ticket #31) : approbation
 * confirmée, ou refus au motif obligatoire, communiqué à l'agence.
 */

export function ApproveAgencyDialog({
  agencyId,
}: Readonly<{ agencyId: string }>) {
  const t = useTranslations("agencies.actions");
  const tc = useTranslations("common");
  const [ouvert, setOuvert] = useState(false);
  const approbation = useApproveAgency(agencyId);

  async function approuver() {
    try {
      await approbation.mutateAsync();
      toast.success(t("approveSuccess"));
      setOuvert(false);
    } catch {
      toast.error(t("approveError"));
    }
  }

  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger asChild>
        <Button>{t("approve")}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-(--dialog-sm)">
        <DialogHeader>
          <DialogTitle>{t("approveTitle")}</DialogTitle>
          <DialogDescription>{t("approveBody")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOuvert(false)}>
            {tc("cancel")}
          </Button>
          <Button
            disabled={approbation.isPending}
            onClick={() => {
              approuver().catch(() => undefined);
            }}
          >
            {t("approveConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RejectAgencyDialog({
  agencyId,
}: Readonly<{ agencyId: string }>) {
  const t = useTranslations("agencies.actions");
  const rejet = useRejectAgency(agencyId);

  return (
    <ReasonDialog
      minLength={LONGUEUR_MIN_MOTIF_REFUS_AGENCE}
      isPending={rejet.isPending}
      onSubmit={async (reason) => {
        await rejet.mutateAsync(reason);
        toast.success(t("rejectSuccess"));
      }}
      labels={{
        trigger: t("reject"),
        title: t("rejectTitle"),
        description: t("rejectBody"),
        reason: t("reasonLabel"),
        placeholder: t("reasonPlaceholder"),
        tooShort: t("reasonTooShort", { min: LONGUEUR_MIN_MOTIF_REFUS_AGENCE }),
        confirm: t("rejectConfirm"),
        pending: t("rejecting"),
        error: t("rejectError"),
      }}
    />
  );
}
