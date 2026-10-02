import { getTranslations } from "next-intl/server";
import { Can } from "@/components/shared/Can";
import { PageHeader } from "@/components/shared/PageHeader";
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
 * Le tableau de bord administrateur relève du ticket #69.
 */
export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const grille = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />
      <Can role="pilgrim">
        <p className="text-sm text-muted-foreground">
          {t("pilgrimDescription")}
        </p>
        <div className={grille}>
          <NextDossierStepCard />
          <PendingPaymentsCard />
          <SosQuickAccessCard />
        </div>
      </Can>
      <Can role="agency">
        <p className="text-sm text-muted-foreground">
          {t("agencyDescription")}
        </p>
        <div className={grille}>
          <BookingsToProcessCard />
          <ComplianceAlertsCard />
          <RecentPaymentsCard />
        </div>
      </Can>
      <Can role="guide">
        <p className="text-sm text-muted-foreground">{t("guideDescription")}</p>
        <div className={grille}>
          <AssignedGroupsCard />
        </div>
      </Can>
      <Can role="admin">
        <p className="text-sm text-muted-foreground">{t("otherDescription")}</p>
      </Can>
    </div>
  );
}
