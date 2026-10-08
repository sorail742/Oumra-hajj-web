"use client";

import { useTranslations } from "next-intl";
import { usePlatformStats } from "../api/use-platform-stats";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { Money } from "@/components/shared/Money";
import { ProportionList } from "@/components/shared/ProportionList";
import {
  StatCard,
  StatCardSkeleton,
  StatGrid,
} from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { StatusKind } from "@/config/status-registry";
import { formatNombre } from "@/lib/format";

/**
 * Tableau de bord administrateur (ticket #69) — `GET /admin/stats`.
 * Chiffres clés en tuiles, puis deux répartitions par statut : chaque ligne
 * porte le badge du registre (libellé + ton, jamais la couleur seule), le
 * nombre et la part ; la barre, d'une seule teinte, ne fait que doubler la
 * part déjà écrite.
 */

function Repartition({
  titre,
  kind,
  valeurs,
}: Readonly<{
  titre: string;
  kind: StatusKind;
  valeurs: Record<string, number>;
}>) {
  const t = useTranslations("adminDashboard");
  const lignes = Object.entries(valeurs);
  const total = lignes.reduce((somme, [, n]) => somme + n, 0);

  return (
    <section className="bg-card space-y-4 rounded-lg border p-5 shadow-(--shadow-card)">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium">{titre}</h2>
        <span className="text-muted-foreground text-xs">
          {t("total", { total: formatNombre(total) })}
        </span>
      </div>
      <ProportionList
        items={lignes.map(([statut, nombre]) => ({
          key: statut,
          label: <StatusBadge kind={kind} value={statut} />,
          count: nombre,
        }))}
      />
    </section>
  );
}

export function PlatformStatsPanel() {
  const t = useTranslations("adminDashboard");
  const query = usePlatformStats();

  return (
    <AsyncBoundary
      query={query}
      isEmpty={() => false}
      skeleton={
        <StatGrid>
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </StatGrid>
      }
    >
      {(stats) => (
        <div className="space-y-4">
          <StatGrid>
            <StatCard
              title={t("pendingAgencies")}
              value={formatNombre(stats.agenciesByStatus.pending)}
              href="/agencies?status=pending"
              linkLabel={t("reviewAgencies")}
            >
              <span className="text-muted-foreground">
                {t("pendingAgenciesHint")}
              </span>
            </StatCard>
            <StatCard
              title={t("pilgrims")}
              value={formatNombre(stats.totalPilgrims)}
            />
            <StatCard
              title={t("guides")}
              value={formatNombre(stats.totalGuides)}
            />
            <StatCard
              title={t("revenue")}
              value={<Money montant={stats.totalRevenue} />}
            >
              <span className="text-muted-foreground">{t("revenueHint")}</span>
            </StatCard>
          </StatGrid>
          <div className="grid gap-4 lg:grid-cols-2">
            <Repartition
              titre={t("agenciesByStatus")}
              kind="agency"
              valeurs={stats.agenciesByStatus}
            />
            <Repartition
              titre={t("bookingsByStatus")}
              kind="booking"
              valeurs={stats.bookingsByStatus}
            />
          </div>
        </div>
      )}
    </AsyncBoundary>
  );
}
