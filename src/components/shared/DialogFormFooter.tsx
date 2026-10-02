"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

/**
 * Pied des formulaires en dialogue : « Annuler » puis le bouton d'envoi,
 * désactivé pendant l'envoi.
 */
export function DialogFormFooter({
  onCancel,
  enCours,
  variant = "default",
  children,
}: Readonly<{
  onCancel: () => void;
  enCours: boolean;
  variant?: "default" | "destructive";
  children: ReactNode;
}>) {
  const tc = useTranslations("common");
  return (
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onCancel}>
        {tc("cancel")}
      </Button>
      <Button type="submit" variant={variant} disabled={enCours}>
        {children}
      </Button>
    </DialogFooter>
  );
}
