"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ReceiptText } from "lucide-react";
import { usePaymentDetail } from "../api/use-payments";
import type { Payment } from "../api/schemas";
import { CLE_TRADUCTION_METHODE } from "../lib/payment-method";
import { CopyButton } from "@/components/shared/CopyButton";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDateHeure } from "@/lib/format";

/**
 * Détail d'un paiement sans quitter la liste (ticket #76) : tranche,
 * montant, moyen, références copiables en `font-mono`, dates, reçu tant
 * que le paiement est réussi, remboursement éventuel. Aucune de ces
 * données n'est journalisée.
 */
function Ligne({
  libelle,
  children,
}: Readonly<{ libelle: string; children: ReactNode }>) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <dt className="text-muted-foreground text-sm">{libelle}</dt>
      <dd className="text-right text-sm">{children}</dd>
    </div>
  );
}

function Reference({ valeur }: Readonly<{ valeur: string }>) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-mono text-xs break-all">{valeur}</span>
      <CopyButton value={valeur} />
    </span>
  );
}

export function PaymentDetailDialog({
  payment,
}: Readonly<{ payment: Payment }>) {
  const t = useTranslations("payments.detail");
  const tp = useTranslations("payments");
  const [ouvert, setOuvert] = useState(false);
  const { data: paiement } = usePaymentDetail(payment, ouvert);

  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          {t("open")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-(--dialog-md)">
        <DialogHeader>
          <DialogTitle>
            {t("title", { numero: paiement.installmentNumber })}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <dl className="divide-y">
          <Ligne libelle={t("status")}>
            <StatusBadge kind="payment" value={paiement.status} />
          </Ligne>
          <Ligne libelle={t("amount")}>
            <Money montant={paiement.amount} />
          </Ligne>
          <Ligne libelle={t("method")}>
            {tp(CLE_TRADUCTION_METHODE[paiement.method])}
          </Ligne>
          <Ligne libelle={t("providerReference")}>
            <Reference valeur={paiement.providerReference} />
          </Ligne>
          <Ligne libelle={t("booking")}>
            <Reference valeur={paiement.bookingId} />
          </Ligne>
          {paiement.confirmedAt && (
            <Ligne libelle={t("confirmedAt")}>
              {formatDateHeure(paiement.confirmedAt)}
            </Ligne>
          )}
          {paiement.refundedAmount !== undefined && (
            <Ligne libelle={t("refundedAmount")}>
              <Money montant={paiement.refundedAmount} />
            </Ligne>
          )}
          {paiement.refundedAt && (
            <Ligne libelle={t("refundedAt")}>
              {formatDateHeure(paiement.refundedAt)}
            </Ligne>
          )}
        </dl>
        {paiement.status === "succeeded" && paiement.receiptRef && (
          <section
            aria-labelledby={`recu-${paiement.id}`}
            className="bg-state-success-bg space-y-2 rounded-lg p-4"
          >
            <h3
              id={`recu-${paiement.id}`}
              className="text-state-success flex items-center gap-2 text-sm font-semibold"
            >
              <ReceiptText aria-hidden className="size-4" />
              {t("receiptTitle")}
            </h3>
            <p className="text-sm">{t("receiptBody")}</p>
            <Reference valeur={paiement.receiptRef} />
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
}
