"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Payment } from "../api/schemas";
import { PaymentForm } from "./PaymentForm";
import { PaymentTracking } from "./PaymentTracking";

/**
 * Régler une tranche depuis le dossier de réservation (ticket #39) :
 * formulaire, puis suivi du paiement lancé jusqu'à sa résolution.
 */
export function InitiatePaymentFlow({ bookingId }: { bookingId: string }) {
  const t = useTranslations("payments.initiate");
  const [enCours, setEnCours] = useState<{
    paiement: Payment;
    debut: number;
  } | null>(null);

  return (
    <section className="space-y-3 rounded-lg border p-4 md:p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-medium">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      {enCours ? (
        <PaymentTracking
          key={enCours.paiement.id}
          initial={enCours.paiement}
          debut={enCours.debut}
          onRestart={() => setEnCours(null)}
        />
      ) : (
        <PaymentForm
          bookingId={bookingId}
          onInitiated={(paiement) =>
            setEnCours({ paiement, debut: Date.now() })
          }
        />
      )}
    </section>
  );
}
