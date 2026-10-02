"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { useBooking } from "@/features/bookings/api/use-bookings";
import { useMyReviews } from "@/features/reviews/api/use-reviews";
import { ReviewDialog } from "@/features/reviews/components/ReviewDialog";

/**
 * Compose réservations et avis (règle 2 : rôle d'une page) — ticket #59.
 * « Laisser un avis » n'apparaît que pour une réservation confirmée ou
 * terminée sans avis existant ; le backend reste juge (400 / 409).
 */
const ELIGIBLES = new Set(["confirmed", "completed"]);

export function AvisReservation({
  bookingId,
}: Readonly<{ bookingId: string }>) {
  const t = useTranslations("reviews.form");
  const { data: reservation } = useBooking(bookingId);
  const { data: avis } = useMyReviews();

  if (!reservation || !avis || !ELIGIBLES.has(reservation.status)) {
    return null;
  }
  if (avis.some((a) => a.bookingId === bookingId)) {
    return (
      <p className="text-muted-foreground flex items-center gap-2 text-sm">
        <CheckCircle2 aria-hidden className="text-state-success size-4" />
        {t("done")} ·{" "}
        <Link href="/reviews" className="text-primary hover:underline">
          {t("seeMine")}
        </Link>
      </p>
    );
  }
  return <ReviewDialog bookingId={bookingId} />;
}
