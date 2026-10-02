"use client";

import { ReserveButton } from "@/features/bookings/components/ReserveButton";
import { PackageDetailScreen } from "@/features/packages/components/PackageDetailScreen";
import { estReservable } from "@/features/packages/lib/forfait";

/**
 * Compose le détail d'un forfait (`features/packages`) et l'action de
 * réservation (`features/bookings`) — rôle d'une page, pas d'un feature
 * (`CLAUDE.md` règle 2). Composant client : le détail reçoit une fonction,
 * qui ne peut pas traverser la frontière serveur → client.
 */
export function DetailForfait({ id }: Readonly<{ id: string }>) {
  return (
    <PackageDetailScreen
      id={id}
      reserver={(forfait) => (
        <ReserveButton
          packageId={forfait.id}
          reservable={estReservable(forfait)}
        />
      )}
    />
  );
}
