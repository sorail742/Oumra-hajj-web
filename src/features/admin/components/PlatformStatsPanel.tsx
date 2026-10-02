"use client";

import { useTranslations } from "next-intl";
import { usePlatformStats } from "../api/use-platform-stats";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { Money } from "@/components/shared/Money";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { StatusKind } from "@/config/status-registry";
import { formatNombre, formatPourcentage } from "@/lib/format";

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
    <section className="bg-card space-y-4 rounded-lg border p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium">{titre}</h2>
        <span className="text-muted-foreground text-xs">
          {t("total", { total: formatNombre(total) })}
        </span>
      </div>
      <ul className="space-y-3">
        {lignes.map(([statut, nombre]) => {
          const part = total === 0 ? 0 : (nombre / total) * 100;
          return (
            <li key={statut} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <StatusBadge kind={kind} value={statut} />
                <span className="text-sm tabular-nums">
                  {formatNombre(nombre)}{" "}
                  <span className="text-muted-foreground text-xs">
                    ({formatPourcentage(part, 0)})
                  </span>
                </span>
              </div>
              <div aria-hidden className="bg-muted h-1.5 rounded-full">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${part}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      }
    >
      {(stats) => (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          </div>
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
