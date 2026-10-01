"use client";

import { useTranslations } from "next-intl";
import { SignedUrlButton } from "@/components/shared/SignedUrlButton";
import { useLegalDocumentAccessUrl } from "../api/use-legal-documents";

/**
 * Consultation d'un document légal d'agence via URL signée fraîche à
 * chaque clic (`useLegalDocumentAccessUrl` est une mutation) — voir
 * `SignedUrlButton`.
 */
export function LegalDocumentAccessButton({
  documentId,
}: {
  documentId: string;
}) {
  const t = useTranslations("agencyCompliance");
  const { mutateAsync, isPending } = useLegalDocumentAccessUrl();

  return (
    <SignedUrlButton
      obtenirUrl={async () => (await mutateAsync(documentId)).url}
      isPending={isPending}
      labels={{
        view: t("view"),
        opening: t("opening"),
        openError: t("openError"),
      }}
    />
  );
}
