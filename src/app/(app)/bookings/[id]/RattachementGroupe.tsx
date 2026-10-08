"use client";

import { useBooking } from "@/features/bookings/api/use-bookings";
import { BookingGroupAssign } from "@/features/bookings/components/BookingGroupAssign";
import { useGroups } from "@/features/groups/api/use-groups";

/**
 * Compose réservations et groupes (règle 2 : rôle d'une page) — ticket
 * #54. Ne propose que les groupes de l'agence pour le forfait réservé ;
 * rien pour une réservation annulée.
 */
export function RattachementGroupe({
  bookingId,
}: Readonly<{ bookingId: string }>) {
  const { data: reservation } = useBooking(bookingId);
  const { data: groupes } = useGroups();

  if (!reservation || !groupes || reservation.status === "cancelled") {
    return null;
  }

  return (
    <BookingGroupAssign
      bookingId={bookingId}
      groupId={reservation.groupId}
      groupes={groupes
        .filter(
          (g) =>
            g.packageId === reservation.packageId ||
            g.id === reservation.groupId,
        )
        .map((g) => ({ id: g.id, label: g.title }))}
    />
  );
}
