"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ouvrirDansNouvelOnglet } from "@/lib/api/url-backend";
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
