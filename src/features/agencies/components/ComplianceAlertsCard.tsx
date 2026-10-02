"use client";

import { useTranslations } from "next-intl";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { useComplianceAlerts } from "../api/use-legal-documents";

/** Agence : documents légaux expirés ou bientôt expirés (ticket #70). */
export function ComplianceAlertsCard() {
  const t = useTranslations("dashboard");
  const query = useComplianceAlerts();

  return (
    <AsyncBoundary
      query={query}
      skeleton={<StatCardSkeleton />}
      isEmpty={() => false}
    >
      {(alertes) => {
        const expires = alertes.filter((a) => a.status === "expired").length;
        return (
          <StatCard
            title={t("complianceTitle")}
            value={alertes.length}
            href="/legal-documents"
            linkLabel={t("seeCompliance")}
          >
            {alertes.length === 0
              ? t("complianceNone")
              : t("complianceDescription", {
                  expired: expires,
                  soon: alertes.length - expires,
                })}
          </StatCard>
        );
      }}
    </AsyncBoundary>
  );
}
