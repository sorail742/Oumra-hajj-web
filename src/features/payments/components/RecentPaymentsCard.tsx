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
              <ul className="divide-y">
                {recents.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
                  >
                    <span className="text-foreground font-medium">
                      <Money montant={p.amount} />
                    </span>
                    <span className="text-xs">
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
