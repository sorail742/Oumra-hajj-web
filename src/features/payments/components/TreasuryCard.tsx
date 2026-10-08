"use client";

import { useTranslations } from "next-intl";
import { useTresorerie } from "../api/use-treasury";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { Money } from "@/components/shared/Money";
import { StatCard, StatGrid } from "@/components/shared/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMois } from "@/lib/format";

/**
 * Trésorerie prévisionnelle de l'agence (ticket #38) : attendu, encaissé,
 * reste dû, puis les encaissements prévus mois par mois (plans d'épargne
 * des pèlerins, sinon solde dû 30 jours avant le départ).
 */
export function TreasuryCard() {
  const t = useTranslations("payments.treasury");
  const query = useTresorerie();

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-lg font-medium">{t("title")}</h2>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>
      <AsyncBoundary
        query={query}
        skeleton={<Skeleton className="h-40 w-full" />}
        isEmpty={(tr) => tr.totalExpected === 0}
        empty={<p className="text-muted-foreground text-sm">{t("empty")}</p>}
      >
        {(tresorerie) => (
          <div className="space-y-4">
            <StatGrid columns={3}>
              <StatCard
                title={t("expected")}
                value={<Money montant={tresorerie.totalExpected} />}
              />
              <StatCard
                title={t("collected")}
                value={<Money montant={tresorerie.totalCollected} />}
              />
              <StatCard
                title={t("outstanding")}
                value={<Money montant={tresorerie.outstandingBalance} />}
              />
            </StatGrid>
            {tresorerie.projections.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">{t("byMonth")}</h3>
                <ul className="bg-card divide-y rounded-lg border shadow-(--shadow-card)">
                  {tresorerie.projections.map((p) => (
                    <li
                      key={p.month}
                      className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                    >
                      <span className="capitalize">{formatMois(p.month)}</span>
                      <Money montant={p.expectedAmount} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </AsyncBoundary>
    </section>
  );
}
