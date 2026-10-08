"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
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
import { Money } from "@/components/shared/Money";
import { useRequestRefund } from "../api/use-payments";
import { useApercuRemboursement } from "../api/use-refund-policy";
import type { Payment } from "../api/schemas";

/**
 * Jamais un simple `AlertDialog` — voir `docs/design-system.md` § Surfaces
 * et interaction : le pèlerin voit le pourcentage, le montant et la règle
 * appliquée — calculés par le backend selon le barème figé sur la
 * réservation (idée #58) — avant de confirmer. L'aperçu n'est chargé qu'à
 * l'ouverture (`enabled: ouvert`), pas pour chaque ligne de la liste.
 */
export function RefundRequestFlow({ payment }: { payment: Payment }) {
  const t = useTranslations("payments");
  const tc = useTranslations("common");
  const [ouvert, setOuvert] = useState(false);
  const apercu = useApercuRemboursement(payment.id, ouvert);
  const refund = useRequestRefund();

  const taux = apercu.data?.eligibleRate;

  async function confirmer() {
    await refund.mutateAsync(payment.id);
    toast.success(t("refundSuccess"));
    setOuvert(false);
  }

  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t("refundAction")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-(--dialog-md)">
        <DialogHeader>
          <DialogTitle>{t("refundDialogTitle")}</DialogTitle>
          <DialogDescription>{t("refundDialogDescription")}</DialogDescription>
        </DialogHeader>

        {apercu.isPending ? (
          <p className="text-muted-foreground text-sm">{tc("loading")}</p>
        ) : apercu.isError || !apercu.data ? (
          <p className="text-state-danger text-sm">{t("refundPreviewError")}</p>
        ) : taux === 0 ? (
          <p className="text-state-danger text-sm">{t("refundNotEligible")}</p>
        ) : (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("refundRateLabel")}</dt>
              <dd className="font-mono">{Math.round((taux ?? 0) * 100)} %</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {t("refundAmountLabel")}
              </dt>
              <dd>
                <Money montant={apercu.data.refundableAmount} />
              </dd>
            </div>
            <p className="text-muted-foreground pt-1 text-xs">
              {t(`refundRules.${apercu.data.rule}`, {
                days: apercu.data.daysBeforeDeparture,
              })}
            </p>
          </dl>
        )}

        <DialogFooter>
          <Button onClick={confirmer} disabled={!taux || refund.isPending}>
            {t("refundConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
