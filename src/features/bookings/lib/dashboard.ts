import type { Booking, DossierStep } from "../api/schemas";
import { ORDRE_ETAPES } from "./dossier-steps";

/** Une réservation annulée ou terminée n'appelle plus d'action. */
export function estActive(reservation: Booking): boolean {
  return (
    reservation.status === "pending_payment" ||
    reservation.status === "confirmed"
  );
}

/**
 * Première étape non terminée, dans l'ordre du dossier. Une étape absente
 * de la réponse est traitée comme « à faire » (comme `BookingStepTracker`).
 */
export function prochaineEtape(
  reservation: Booking,
): DossierStep["key"] | undefined {
  const parCle = new Map(reservation.steps.map((e) => [e.key, e.status]));
  return ORDRE_ETAPES.find((cle) => parCle.get(cle) !== "done");
}

/** Dossiers actifs qui ont encore au moins une étape à faire. */
export function dossiersATraiter(reservations: Booking[]): Booking[] {
  return reservations.filter(
    (r) => estActive(r) && prochaineEtape(r) !== undefined,
  );
}
