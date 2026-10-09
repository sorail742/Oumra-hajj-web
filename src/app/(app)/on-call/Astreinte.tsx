"use client";

import { useSearchParams } from "next/navigation";
import { useBookings } from "@/features/bookings/api/use-bookings";
import { CreateOnCallShiftDialog } from "@/features/on-call/components/CreateOnCallShiftDialog";
import { MyOnCallCard } from "@/features/on-call/components/MyOnCallCard";
import { OnCallShiftsScreen } from "@/features/on-call/components/OnCallShiftsScreen";
import { usePackages } from "@/features/packages/api/use-packages";
import { useMyPackages } from "@/features/packages/api/use-my-packages";

/**
 * Compose plusieurs domaines (forfaits, réservations → astreinte) : rôle
 * d'un fichier de page, jamais d'un `features/*` (règle 2).
 */
export function CreerCreneau() {
  const params = useSearchParams();
  const { data: forfaits = [] } = useMyPackages();
  return (
    <CreateOnCallShiftDialog
      forfaitInitial={params.get("package") ?? undefined}
      forfaits={forfaits.map((f) => ({ id: f.id, title: f.title }))}
    />
  );
}

export function CreneauxAgence() {
  const { data: forfaits = [] } = useMyPackages();
  return (
    <OnCallShiftsScreen
      forfaits={forfaits.map((f) => ({ id: f.id, title: f.title }))}
    />
  );
}

export function AstreintePelerin() {
  const { data: reservations = [] } = useBookings();
  const { data: forfaits = [] } = usePackages({});
  const titres = new Map(forfaits.map((f) => [f.id, f.title]));
  return (
    <MyOnCallCard
      reservations={reservations
        .filter((r) => r.status !== "cancelled")
        .map((r) => ({
          id: r.id,
          libelle: titres.get(r.packageId) ?? `${r.id.slice(0, 8)}…`,
        }))}
    />
  );
}
