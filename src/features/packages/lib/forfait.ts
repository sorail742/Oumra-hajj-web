import { differenceInCalendarDays, parseISO } from "date-fns";
import type { Package } from "../api/schemas";

/** Places encore disponibles — jamais négatif, même si le backend surréserve. */
export function placesRestantes(
  forfait: Pick<Package, "capacity" | "seatsTaken">,
): number {
  return Math.max(0, forfait.capacity - forfait.seatsTaken);
}

/** Taux de remplissage entre 0 et 1, pour la jauge de places. */
export function tauxRemplissage(
  forfait: Pick<Package, "capacity" | "seatsTaken">,
): number {
  if (forfait.capacity <= 0) return 1;
  return Math.min(1, forfait.seatsTaken / forfait.capacity);
}

/** Durée du séjour en jours, bornes incluses (du 1er au 15 → 15 jours). */
export function dureeJours(
  forfait: Pick<Package, "startDate" | "endDate">,
): number {
  return (
    differenceInCalendarDays(
      parseISO(forfait.endDate),
      parseISO(forfait.startDate),
    ) + 1
  );
}

/** Seul un forfait `open` avec au moins une place se réserve. */
export function estReservable(
  forfait: Pick<Package, "status" | "capacity" | "seatsTaken">,
): boolean {
  return forfait.status === "open" && placesRestantes(forfait) > 0;
}
