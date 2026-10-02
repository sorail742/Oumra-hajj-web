"use client";

import { useTranslations } from "next-intl";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { useBookings } from "../api/use-bookings";
import { dossiersATraiter } from "../lib/dashboard";

/** Agence : dossiers actifs qui ont encore une étape à faire (ticket #70). */
export function BookingsToProcessCard() {
  const t = useTranslations("dashboard");
  const query = useBookings();

  return (
    <AsyncBoundary
      query={query}
      skeleton={<StatCardSkeleton />}
      isEmpty={() => false}
    >
      {(reservations) => {
        const nombre = dossiersATraiter(reservations).length;
        return (
          <StatCard
            title={t("toProcessTitle")}
            value={nombre}
            href="/bookings"
            linkLabel={t("seeBookings")}
          >
            {t("toProcessDescription", { total: reservations.length })}
          </StatCard>
        );
      }}
    </AsyncBoundary>
  );
}
