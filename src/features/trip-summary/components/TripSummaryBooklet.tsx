"use client";

import { useTranslations } from "next-intl";
import { Calendar, MapPin } from "lucide-react";
import { useTripSummary } from "../api/use-trip-summary";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/format";
import {
  PaymentsSection,
  ReviewSection,
  RitesSection,
  StepsSection,
} from "./TripSummarySections";

/**
 * Livret souvenir (idée #23) — n'affiche que ce que `TripSummaryShape`
 * contient réellement : pas de photos ni de Duas, absents du backend
 * (voir le commentaire de `trip-summary.types.ts`).
 */
export function TripSummaryBooklet({ bookingId }: { bookingId: string }) {
  const t = useTranslations("tripSummary");
  const query = useTripSummary(bookingId);

  return (
    <AsyncBoundary
      query={query}
      skeleton={<div className="h-64 bg-muted animate-pulse rounded-lg" />}
    >
      {(summary) => (
        <div className="space-y-8">
          <div className="rounded-xl border bg-card p-6 md:p-8 shadow-sm text-center space-y-3">
            <div className="text-sm text-muted-foreground">
              {t(summary.pilgrimageType === "hadj" ? "typeHadj" : "typeOumra")}
            </div>
            <h2 className="text-2xl text-primary">{summary.packageTitle}</h2>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden />
                {summary.agencyName}
              </span>
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4" aria-hidden />
                {formatDate(summary.startDate)} — {formatDate(summary.endDate)}
              </span>
            </div>
            <StatusBadge kind="booking" value={summary.status} />
          </div>

          <StepsSection steps={summary.steps} />
          <PaymentsSection summary={summary} />
          <RitesSection rites={summary.rites} />
          <ReviewSection review={summary.review} />
        </div>
      )}
    </AsyncBoundary>
  );
}
