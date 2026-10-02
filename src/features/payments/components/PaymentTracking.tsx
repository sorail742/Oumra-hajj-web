"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { CopyButton } from "@/components/shared/CopyButton";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { DUREE_MAX_SUIVI_MS, usePaymentStatus } from "../api/use-payments";
import type { Payment } from "../api/schemas";

/**
 * Suivi d'un paiement lancé : référence copiable, statut rafraîchi jusqu'à
 * résolution (le webhook du fournisseur fait foi, jamais le client).
 */
export function PaymentTracking({
  initial,
  debut,
  onRestart,
}: {
  initial: Payment;
  debut: number;
  onRestart: () => void;
}) {
  const t = useTranslations("payments.initiate");
  const query = usePaymentStatus(initial.id, debut);
  const paiement = query.data ?? initial;
  // Bascule une seule fois, quand le suivi automatique s'arrête
  // (`usePaymentStatus` cesse d'interroger au même moment).
  const [delaiDepasse, setDelaiDepasse] = useState(false);
  useEffect(() => {
    const minuterie = setTimeout(
      () => setDelaiDepasse(true),
      Math.max(0, debut + DUREE_MAX_SUIVI_MS - Date.now()),
    );
    return () => clearTimeout(minuterie);
  }, [debut]);

  return (
    <div className="space-y-4" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Money montant={paiement.amount} />
        <StatusBadge kind="payment" value={paiement.status} />
      </div>

      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">
          {t("referenceLabel")}
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 break-all rounded-md bg-muted px-3 py-2 font-mono text-sm">
            {paiement.providerReference}
          </code>
          <CopyButton
            value={paiement.providerReference}
            label={t("copyReference")}
          />
        </div>
      </div>

      {paiement.status === "pending" && (
        <div className="flex items-start gap-3 rounded-md border p-3 text-sm">
          <Clock
            className="size-5 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <div>
            <p className="font-medium">{t("pendingTitle")}</p>
            <p className="text-muted-foreground">
              {delaiDepasse
                ? t("stillPendingDescription")
                : t("pendingDescription")}
            </p>
            {query.isError && (
              <p className="text-state-warning">{t("statusError")}</p>
            )}
          </div>
        </div>
      )}

      {paiement.status === "succeeded" && (
        <div className="flex items-start gap-3 rounded-md bg-state-success-bg p-3 text-sm text-state-success">
          <CheckCircle2 className="size-5 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">{t("succeededTitle")}</p>
            <p>
              {t("succeededDescription", {
                installment: paiement.installmentNumber,
              })}
            </p>
          </div>
        </div>
      )}

      {paiement.status === "failed" && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-md bg-state-danger-bg p-3 text-sm text-state-danger"
        >
          <XCircle className="size-5 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">{t("failedTitle")}</p>
            <p>{t("failedDescription")}</p>
          </div>
        </div>
      )}

      {paiement.status !== "pending" && (
        <Button
          type="button"
          variant={paiement.status === "failed" ? "default" : "outline"}
          onClick={onRestart}
        >
          {paiement.status === "failed" ? t("retry") : t("newPayment")}
        </Button>
      )}
    </div>
  );
}
