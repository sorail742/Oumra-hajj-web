"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useChangerStatutCompte, type AdminUser } from "../api/use-users";
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
 * Suspension ou réactivation d'un compte, confirmée (ticket #74). Un
 * compte suspendu ne peut plus renouveler sa session : le backend refuse
 * le jeton de rafraîchissement.
 */
export function AccountStatusDialog({
  utilisateur,
}: Readonly<{ utilisateur: AdminUser }>) {
  const t = useTranslations("adminUsers");
  const tc = useTranslations("common");
  const [ouvert, setOuvert] = useState(false);
  const changement = useChangerStatutCompte();
  const reactiver = !utilisateur.isActive;
  const cle = reactiver ? "reactivate" : "suspend";

  async function confirmer() {
    try {
      await changement.mutateAsync({ id: utilisateur.id, actif: reactiver });
      toast.success(t(`${cle}.done`, { name: utilisateur.fullName }));
      setOuvert(false);
    } catch {
      toast.error(t("error"));
    }
  }

  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={
            reactiver ? undefined : "text-destructive hover:text-destructive"
          }
        >
          {t(`${cle}.action`)}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-(--dialog-sm)">
        <DialogHeader>
          <DialogTitle>
            {t(`${cle}.title`, { name: utilisateur.fullName })}
          </DialogTitle>
          <DialogDescription>{t(`${cle}.body`)}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOuvert(false)}>
            {tc("cancel")}
          </Button>
          <Button
            variant={reactiver ? "default" : "destructive"}
            disabled={changement.isPending}
            onClick={() => {
              confirmer().catch(() => undefined);
            }}
          >
            {t(`${cle}.confirm`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
