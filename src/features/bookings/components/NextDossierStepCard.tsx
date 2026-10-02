"use client";

import { useTranslations } from "next-intl";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useBookings } from "../api/use-bookings";
import { estActive, prochaineEtape } from "../lib/dashboard";
import { CLE_TRADUCTION_ETAPE } from "../lib/dossier-steps";

/** Pèlerin : prochaine étape de son dossier actif (ticket #70). */
export function NextDossierStepCard() {
  const t = useTranslations("dashboard");
  const tReservations = useTranslations("bookings");
  const query = useBookings();

  return (
    <AsyncBoundary
      query={query}
      skeleton={<StatCardSkeleton />}
      isEmpty={() => false}
    >
      {(reservations) => {
        const active = reservations.find(
          (r) => estActive(r) && prochaineEtape(r) !== undefined,
        );
        const etape = active ? prochaineEtape(active) : undefined;
        if (!active || !etape) {
          return (
            <StatCard
              title={t("nextStepTitle")}
              href="/packages"
              linkLabel={t("browsePackages")}
            >
              {t("nextStepNone")}
            </StatCard>
          );
        }
        return (
          <StatCard
            title={t("nextStepTitle")}
            value={tReservations(CLE_TRADUCTION_ETAPE[etape])}
            href={`/bookings/${active.id}`}
            linkLabel={t("openDossier")}
          >
            <StatusBadge kind="booking" value={active.status} />
          </StatCard>
        );
      }}
    </AsyncBoundary>
  );
}
