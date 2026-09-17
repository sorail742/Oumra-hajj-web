"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useDocumentAccessUrl } from "../api/use-documents";

/**
 * Consulter, afficher, oublier — voir `CLAUDE.md` règle 14. Jamais de
 * `<img src>` persistant, jamais de stockage de l'URL signée au-delà de
 * cet appel : `useDocumentAccessUrl` refait un appel réseau à chaque clic.
 *
 * L'onglet est ouvert **avant** l'attente réseau (`window.open` synchrone
 * dans le gestionnaire de clic), puis navigué une fois l'URL obtenue — un
 * `window.open` après un `await` est bloqué par la plupart des
 * bloqueurs de popup.
 */
export function DocumentAccessButton({ documentId }: { documentId: string }) {
  const t = useTranslations("documents");
  const { mutateAsync, isPending } = useDocumentAccessUrl();

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
