"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { useRejectDocument } from "../api/use-documents";
import { LONGUEUR_MIN_MOTIF_REFUS } from "../api/schemas";

/**
 * Refus d'un document avec motif obligatoire (ticket #38). Le motif est
 * ensuite affiché au pèlerin dans sa liste de documents.
 */
export function RejectDocumentDialog({
  documentId,
  disabled,
}: Readonly<{
  documentId: string;
  disabled?: boolean;
}>) {
  const t = useTranslations("documents.review");
  const rejet = useRejectDocument();

  return (
    <ReasonDialog
      size="sm"
      disabled={disabled}
      minLength={LONGUEUR_MIN_MOTIF_REFUS}
      isPending={rejet.isPending}
      onSubmit={async (reason) => {
        await rejet.mutateAsync({ documentId, reason });
        toast.success(t("rejectSuccess"));
      }}
      labels={{
        trigger: t("reject"),
        title: t("rejectDialogTitle"),
        description: t("rejectDialogDescription"),
        reason: t("reasonLabel"),
        placeholder: t("reasonPlaceholder"),
        tooShort: t("reasonTooShort", { min: LONGUEUR_MIN_MOTIF_REFUS }),
        confirm: t("rejectConfirm"),
        pending: t("rejecting"),
        error: t("rejectError"),
      }}
    />
  );
}
