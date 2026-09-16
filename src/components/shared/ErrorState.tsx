"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

/**
 * État « erreur » d'un écran de données — message exploitable + bouton
 * Réessayer, voir `docs/design-system.md` § Écriture. `title`/`description`
 * par défaut viennent de `messages/fr.json` ; un appelant avec un message
 * plus précis (voir `docs/design-system.md` § Écriture, l'exemple du
 * document refusé) les passe en props — jamais de chaîne en dur ici.
 */
export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  const t = useTranslations("common");

  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-sm font-medium">{title ?? t("errorTitle")}</p>
      <p className="text-muted-foreground max-w-sm text-sm">
        {description ?? t("errorDescription")}
      </p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t("retry")}
        </Button>
      ) : null}
    </div>
  );
}
