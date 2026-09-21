"use client";

import { useTranslations } from "next-intl";
import { useTripSummary } from "../api/use-trip-summary";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/format";
import { Users, Calendar, MapPin } from "lucide-react";

export function TripSummaryBooklet({ bookingId }: { bookingId: string }) {
  const t = useTranslations("tripSummary");
  const query = useTripSummary(bookingId);

  return (
    <div className="space-y-6">
      <AsyncBoundary
        query={query}
        skeleton={<div className="h-64 bg-muted animate-pulse rounded-lg" />}
        empty={
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        }
      >
        {(summary) => (
          <div className="space-y-8">
            <div className="rounded-xl border bg-card p-6 md:p-8 shadow-sm text-center space-y-4">
              <h2 className="text-2xl font-serif text-primary">
                {summary.packageTitle || t("defaultPackageTitle")}
              </h2>
              <div className="text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {summary.agencyName || t("defaultAgencyName")}
                </span>
              </div>
              
              {(summary.startDate || summary.endDate) && (
                <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm mt-4">
                  <Calendar className="h-4 w-4" />
                  {summary.startDate && formatDate(summary.startDate)}
                  {summary.startDate && summary.endDate && " — "}
                  {summary.endDate && formatDate(summary.endDate)}
                </div>
              )}
            </div>

            {summary.pilgrims && summary.pilgrims.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t("pilgrimsTitle")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {summary.pilgrims.map((pilgrim) => (
                    <div key={pilgrim.id} className="rounded-lg border p-4">
                      <div className="font-medium">
                        {pilgrim.firstName} {pilgrim.lastName}
                      </div>
                      {pilgrim.completedRitesCount !== undefined && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {t("completedRites", { count: pilgrim.completedRitesCount })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {!summary.pilgrims?.length && (
              <div className="text-center text-sm text-muted-foreground p-8 border border-dashed rounded-lg">
                {t("noPilgrimsFound")}
              </div>
            )}
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}

