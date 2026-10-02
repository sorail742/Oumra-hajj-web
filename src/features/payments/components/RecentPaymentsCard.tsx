"use client";

import { useTranslations } from "next-intl";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { Money } from "@/components/shared/Money";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { usePayments } from "../api/use-payments";
import { paiementsRecents } from "../lib/dashboard";

const NOMBRE_RECENTS = 5;

/** Agence : derniers paiements confirmés (ticket #70). */
export function RecentPaymentsCard() {
  const t = useTranslations("dashboard");
  const query = usePayments();

  return (
    <AsyncBoundary
      query={query}
      skeleton={<StatCardSkeleton />}
      isEmpty={() => false}
    >
      {(paiements) => {
        const recents = paiementsRecents(paiements, NOMBRE_RECENTS);
        return (
          <StatCard
            title={t("recentPaymentsTitle")}
            href="/payments"
            linkLabel={t("seePayments")}
          >
            {recents.length === 0 ? (
              t("recentPaymentsNone")
            ) : (
              <ul className="space-y-1">
                {recents.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <Money montant={p.amount} />
                    <span className="text-muted-foreground">
                      <RelativeTime iso={p.confirmedAt} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </StatCard>
        );
      }}
    </AsyncBoundary>
  );
}
