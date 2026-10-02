"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ouvrirDansNouvelOnglet } from "@/lib/api/url-backend";

/**
 * Consulter, afficher, oublier — voir `CLAUDE.md` règle 14. L'URL signée
 * est redemandée à chaque clic (`obtenirUrl`, une mutation côté appelant,
 * jamais une query mise en cache), jamais stockée ni assignée à un `src`
 * persistant.
 *
 * L'onglet est ouvert **avant** l'attente réseau (`ouvrirDansNouvelOnglet`)
 * — un `window.open` après un `await` est bloqué par la plupart des
 * bloqueurs de popup. Partagé par les documents pèlerin et les documents
 * légaux d'agence (règle 2 : un `features/x` n'importe pas `features/y`).
 */
export function SignedUrlButton({
  obtenirUrl,
  isPending,
  labels,
}: {
  obtenirUrl: () => Promise<string>;
  isPending: boolean;
  labels: { view: string; opening: string; openError: string };
}) {
  async function ouvrir() {
    try {
      await ouvrirDansNouvelOnglet(obtenirUrl);
    } catch {
      toast.error(labels.openError);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={ouvrir} disabled={isPending}>
      {isPending ? labels.opening : labels.view}
    </Button>
  );
}
