"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ouvrirDansNouvelOnglet } from "@/lib/api/url-backend";
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
    try {
      await ouvrirDansNouvelOnglet(
        async () => (await mutateAsync(documentId)).url,
      );
    } catch {
      toast.error(t("openError"));
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={ouvrir} disabled={isPending}>
      {isPending ? t("opening") : t("view")}
    </Button>
  );
}
