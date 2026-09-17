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
import {
  useBookingStatusForRefund,
  useRequestRefund,
} from "../api/use-payments";
import { tauxRemboursement } from "../lib/refund-policy";
import type { Payment } from "../api/schemas";

/**
 * Jamais un simple `AlertDialog` — voir `docs/design-system.md` § Surfaces
 * et interaction : le pèlerin voit le pourcentage et le montant exacts
 * avant de confirmer. Le barème n'est chargé qu'à l'ouverture (`enabled:
 * ouvert`), pas pour chaque ligne de la liste.
 */
export function RefundRequestFlow({ payment }: { payment: Payment }) {
  const t = useTranslations("payments");
  const tc = useTranslations("common");
  const [ouvert, setOuvert] = useState(false);
  const bookingStatus = useBookingStatusForRefund(payment.bookingId, ouvert);
  const refund = useRequestRefund();

  const taux = bookingStatus.data
    ? tauxRemboursement(bookingStatus.data)
    : undefined;
  const montant = taux !== undefined ? payment.amount * taux : undefined;

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

        {bookingStatus.isPending ? (
          <p className="text-muted-foreground text-sm">{tc("loading")}</p>
        ) : taux === 0 ? (
          <p className="text-state-danger text-sm">{t("refundNotEligible")}</p>
        ) : montant !== undefined && taux !== undefined ? (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("refundRateLabel")}</dt>
              <dd className="font-mono">{Math.round(taux * 100)} %</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {t("refundAmountLabel")}
              </dt>
              <dd>
                <Money montant={montant} />
              </dd>
            </div>
          </dl>
        ) : null}

        <DialogFooter>
          <Button onClick={confirmer} disabled={!taux || refund.isPending}>
            {t("refundConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
