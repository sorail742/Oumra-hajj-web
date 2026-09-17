"use client";

import { useTranslations } from "next-intl";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * **Non négociable** — voir `CLAUDE.md` règle 13. Tout contenu de rite ou
 * de Dua affiché porte cet indicateur tant que `validated` n'est pas
 * `true`, envoyé par le backend, jamais déduit côté client. Bandeau fixe :
 * ne se ferme pas, ne se réduit pas en icône, n'est ni un tooltip ni une
 * alerte ni un toast (voir `docs/design-system.md` §4).
 *
 * `GET /rites/sheets` (public) ne renvoie aujourd'hui que des fiches déjà
 * validées côté backend (`RiteSheetsService.listPublished` filtre sur
 * `isValidated: true`) — ce composant lit quand même le champ réel plutôt
 * que de supposer `true` par construction : un filtre serveur qui change
 * un jour ne doit pas laisser passer du contenu non validé en silence.
 */
export function ReligiousContentNotice({
  validated,
  className,
}: {
  validated: boolean;
  className?: string;
}) {
  const t = useTranslations("rites");

  if (validated) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-state-warning-bg text-state-warning flex items-center gap-2 rounded-md px-3 py-2 text-sm",
        className,
      )}
    >
      <TriangleAlert className="size-4 shrink-0" aria-hidden />
      <span>{t("religiousContentNotice")}</span>
    </div>
  );
}
