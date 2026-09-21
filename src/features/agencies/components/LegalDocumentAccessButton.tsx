"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useLegalDocumentAccessUrl } from "../api/use-legal-documents";

/**
 * Même garde-fou que `features/documents/components/DocumentAccessButton`
 * (règle 14, CLAUDE.md) — dupliqué plutôt qu'importé (règle 2). Onglet
 * ouvert vierge avant l'appel réseau : un `window.open` après un `await`
 * est bloqué par la plupart des bloqueurs de popup.
 */
export function LegalDocumentAccessButton({
  documentId,
}: {
  documentId: string;
}) {
  const t = useTranslations("agencyCompliance");
  const { mutateAsync, isPending } = useLegalDocumentAccessUrl();

  async function ouvrir() {
    const fenetre = window.open("", "_blank", "noopener,noreferrer");
    const { url } = await mutateAsync(documentId);
    if (fenetre) {
      fenetre.location.href = url;
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={ouvrir} disabled={isPending}>
      {isPending ? t("opening") : t("view")}
    </Button>
  );
}
