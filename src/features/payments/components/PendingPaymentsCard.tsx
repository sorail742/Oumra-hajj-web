"use client";

import { useTranslations } from "next-intl";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { usePayments } from "../api/use-payments";
import { paiementsEnAttente } from "../lib/dashboard";

/** Pèlerin : paiements lancés en attente de confirmation (ticket #70). */
export function PendingPaymentsCard() {
  const t = useTranslations("dashboard");
  const query = usePayments();

  return (
    <AsyncBoundary
      query={query}
      skeleton={<StatCardSkeleton />}
      isEmpty={() => false}
    >
      {(paiements) => {
        const nombre = paiementsEnAttente(paiements).length;
        return (
          <StatCard
            title={t("pendingPaymentsTitle")}
            value={nombre}
            href="/payments"
            linkLabel={t("seePayments")}
          >
            {nombre === 0
              ? t("pendingPaymentsNone")
              : t("pendingPaymentsDescription")}
          </StatCard>
        );
      }}
    </AsyncBoundary>
  );
}
