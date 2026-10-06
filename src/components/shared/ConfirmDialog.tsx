"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Confirmation explicite d'une action (régénérer un lien, publier, refuser…)
 * dans un dialogue accessible — jamais `window.confirm`. `onConfirm` renvoie
 * une promesse : le dialogue se ferme seulement si elle aboutit.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  destructive = false,
  enCours,
  onConfirm,
}: Readonly<{
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  enCours: boolean;
  onConfirm: () => Promise<unknown>;
}>) {
  const tc = useTranslations("common");
  const [ouvert, setOuvert] = useState(false);

  function confirmer() {
    onConfirm()
      .then(() => setOuvert(false))
      .catch(() => undefined);
  }

  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-(--dialog-md)">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOuvert(false)}>
            {tc("cancel")}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={confirmer}
            disabled={enCours}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
