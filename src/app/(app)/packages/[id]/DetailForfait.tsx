"use client";

import { ReserveButton } from "@/features/bookings/components/ReserveButton";
import { RefundPolicyCard } from "@/features/payments/components/RefundPolicyCard";
import { PackageDetailScreen } from "@/features/packages/components/PackageDetailScreen";
import { estReservable } from "@/features/packages/lib/forfait";

/**
 * Compose le détail d'un forfait (`features/packages`), l'action de
 * réservation (`features/bookings`) et le barème de remboursement de
 * l'agence (`features/payments`, idée #58) — rôle d'une page, pas d'un feature
 * (`CLAUDE.md` règle 2). Composant client : le détail reçoit une fonction,
 * qui ne peut pas traverser la frontière serveur → client.
 */
export function DetailForfait({ id }: Readonly<{ id: string }>) {
  return (
    <PackageDetailScreen
      id={id}
      reserver={(forfait) => (
        <div className="space-y-5">
          <ReserveButton
            packageId={forfait.id}
            reservable={estReservable(forfait)}
          />
          <RefundPolicyCard agencyId={forfait.agencyId} compact />
        </div>
      )}
    />
  );
}
