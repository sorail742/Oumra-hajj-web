import { getTranslations } from "next-intl/server";
import { Can } from "@/components/shared/Can";
import { StatGrid } from "@/components/shared/StatCard";
import { DashboardGreeting } from "@/components/layout/DashboardGreeting";
import { PlatformStatsPanel } from "@/features/admin/components/PlatformStatsPanel";
import { ComplianceAlertsCard } from "@/features/agencies/components/ComplianceAlertsCard";
import { BookingsToProcessCard } from "@/features/bookings/components/BookingsToProcessCard";
import { NextDossierStepCard } from "@/features/bookings/components/NextDossierStepCard";
import { AssignedGroupsCard } from "@/features/groups/components/AssignedGroupsCard";
import { SosQuickAccessCard } from "@/features/groups/components/SosQuickAccessCard";
import { PendingPaymentsCard } from "@/features/payments/components/PendingPaymentsCard";
import { RecentPaymentsCard } from "@/features/payments/components/RecentPaymentsCard";

/**
 * Accueil par rôle (ticket #70), composé des routes de liste existantes.
 * La page assemble les cartes de plusieurs domaines — c'est son rôle, un
 * `features/*` n'importe jamais un autre `features/*` (CLAUDE.md règle 2).
 * Administrateur : statistiques de la plateforme (ticket #69).
 */
export default async function DashboardPage() {
  const t = await getTranslations("dashboard");

  return (
    <div className="space-y-6">
      <Can role="pilgrim">
        <DashboardGreeting description={t("pilgrimDescription")} />
        <StatGrid columns={3}>
          <NextDossierStepCard />
          <PendingPaymentsCard />
          <SosQuickAccessCard />
        </StatGrid>
      </Can>
      <Can role="agency">
        <DashboardGreeting description={t("agencyDescription")} />
        <StatGrid columns={3}>
          <BookingsToProcessCard />
          <ComplianceAlertsCard />
          <RecentPaymentsCard />
        </StatGrid>
      </Can>
      <Can role="guide">
        <DashboardGreeting description={t("guideDescription")} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AssignedGroupsCard />
        </div>
      </Can>
      <Can role="admin">
        <DashboardGreeting description={t("adminDescription")} />
        <PlatformStatsPanel />
      </Can>
    </div>
  );
}
