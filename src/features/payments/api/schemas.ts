import { z } from "zod";

/**
 * `GET /payments/mine`/`/payments/agency`/`/payments/{id}` ne publient pas
 * de schéma de réponse dans `openapi.json`. **Vérifié directement contre le
 * code source du backend** (`Oumra-hadj-project/src/types/payment.types.ts`,
 * `PaymentShape`, lu le 2026-09-17) plutôt qu'inféré — contrairement aux
 * domaines précédents, ce schéma n'est pas une hypothèse.
 */
export const paymentSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  amount: z.number(),
  currency: z.string(),
  installmentNumber: z.number(),
  method: z.enum(["mobile_money_orange", "mobile_money_mtn", "card"]),
  status: z.enum(["pending", "succeeded", "failed", "refunded"]),
  providerReference: z.string(),
  receiptRef: z.string().optional(),
  confirmedAt: z.string().optional(),
  refundedAmount: z.number().optional(),
  refundedAt: z.string().optional(),
});

export type Payment = z.infer<typeof paymentSchema>;

/**
 * Forme minimale de `GET /bookings/:id` utile ici : seul `status` compte
 * pour l'aperçu du barème de remboursement. Ne réutilise pas
 * `features/bookings/api/schemas.ts` (règle 2, `features/x` n'importe
 * jamais `features/y`).
 */
export const bookingStatusSchema = z.object({
  status: z.enum(["pending_payment", "confirmed", "cancelled", "completed"]),
});
