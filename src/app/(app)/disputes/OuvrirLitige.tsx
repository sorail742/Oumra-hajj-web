"use client";

import { useBookings } from "@/features/bookings/api/use-bookings";
import { CreateDisputeDialog } from "@/features/disputes/components/CreateDisputeDialog";
import { usePackages } from "@/features/packages/api/use-packages";

/**
 * Compose trois domaines (réservations du pèlerin, titres des forfaits →
 * ouverture d'un litige) : rôle d'un fichier de page (règle 2).
 */
export function OuvrirLitige() {
  const { data: reservations = [] } = useBookings();
  const { data: forfaits = [] } = usePackages({});
  const titres = new Map(forfaits.map((f) => [f.id, f.title]));

  return (
    <CreateDisputeDialog
      reservations={reservations.map((r) => ({
        id: r.id,
        libelle: titres.get(r.packageId) ?? `${r.id.slice(0, 8)}…`,
      }))}
    />
  );
}
