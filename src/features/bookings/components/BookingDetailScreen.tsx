"use client";

import { useTranslations } from "next-intl";
import { useBooking } from "../api/use-bookings";
import type { Booking } from "../api/schemas";
import { BookingStepEditor } from "./BookingStepEditor";
import { BookingStepTracker } from "./BookingStepTracker";
import { CancelBookingDialog } from "./CancelBookingDialog";
import { Can } from "@/components/shared/Can";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

/** Une réservation annulée ou terminée ne s'annule plus (ticket #53). */
const ANNULABLE: ReadonlySet<Booking["status"]> = new Set([
  "pending_payment",
  "confirmed",
]);

export function BookingDetailScreen({ id }: Readonly<{ id: string }>) {
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
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm">{booking.id}</span>
            <StatusBadge kind="booking" value={booking.status} />
            {ANNULABLE.has(booking.status) && (
              <Can role="pilgrim">
                <span className="ml-auto">
                  <CancelBookingDialog bookingId={booking.id} />
                </span>
              </Can>
            )}
          </div>
          <div>
            <h2 className="mb-3 text-lg font-medium">{t("stepsTitle")}</h2>
            <Can
              role="agency"
              fallback={<BookingStepTracker steps={booking.steps} />}
            >
              <BookingStepEditor bookingId={booking.id} steps={booking.steps} />
            </Can>
          </div>
        </div>
      )}
    </AsyncBoundary>
  );
}
