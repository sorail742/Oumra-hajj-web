"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

/**
 * État « vide » d'un écran de données — voir `docs/design-system.md`
 * § Écriture : propose toujours l'étape suivante, ne se contente jamais de
 * « Aucune donnée. ». `title` par défaut vient de `messages/fr.json` ; un
 * écran réel passe un titre et une action concrets (voir l'écran
 * `packages`) plutôt que de garder ce repli générique.
 */
export interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  const t = useTranslations("common");

  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <p className="text-sm font-medium">{title ?? t("empty")}</p>
      {description ? (
        <p className="text-muted-foreground max-w-sm text-sm">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
