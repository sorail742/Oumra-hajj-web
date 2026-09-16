"use client";

import { useTranslations } from "next-intl";
import { useBooking } from "../api/use-bookings";
import { BookingStepTracker } from "./BookingStepTracker";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingDetailScreen({ id }: { id: string }) {
  const t = useTranslations("bookings");
  const query = useBooking(id);

  return (
    <AsyncBoundary
      query={query}
      skeleton={
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      }
      isEmpty={() => false}
    >
      {(booking) => (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm">{booking.id}</span>
            <StatusBadge kind="booking" value={booking.status} />
          </div>
          <div>
            <h2 className="mb-3 text-lg font-medium">{t("stepsTitle")}</h2>
            <BookingStepTracker steps={booking.steps} />
          </div>
        </div>
      )}
    </AsyncBoundary>
  );
}
