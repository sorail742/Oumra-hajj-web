import type { StatusValue } from "@/config/status-registry";

/**
 * Miroir exact de `PaymentsService.REFUND_POLICY`
 * (`Oumra-hadj-project/src/modules/payments/payments.service.ts`, lu le
 * 2026-09-17) : 100 % si la réservation n'est pas encore confirmée (rien
 * n'est engagé côté agence), 50 % si confirmée (visa/hôtel déjà engagés
 * par l'agence), 0 % sinon (annulée ou déjà effectuée).
 *
 * Aucun endpoint ne publie ce barème — `POST /payments/:id/refund` le
 * calcule et l'applique **côté serveur**, sans jamais faire confiance à une
 * valeur envoyée par le client (voir `PaymentsService.requestRefund`, qui
 * relit `booking.status` lui-même). Un décalage ici ne produit donc qu'un
 * aperçu obsolète à l'écran, jamais un montant remboursé faux — mais
 * **à resynchroniser si `REFUND_POLICY` change côté backend.**
 */
export const REFUND_POLICY: Record<StatusValue<"booking">, number> = {
  pending_payment: 1,
  confirmed: 0.5,
  cancelled: 0,
  completed: 0,
};

export function tauxRemboursement(statut: StatusValue<"booking">): number {
  return REFUND_POLICY[statut];
}
