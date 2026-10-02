import { z } from "zod";

/**
 * `BookingShape` / `DossierStepShape`
 * (`Oumra-hadj-project/src/types/booking.types.ts`, relu le 2026-10-01).
 * Une étape porte `updatedAt` (date du dernier changement de statut), pas
 * de `completedAt` : la date d'une étape terminée est son `updatedAt`, comme
 * le calcule `TripSummaryService` côté backend. Aucun `createdAt` sur une
 * réservation. Optionnels mappés `?? undefined` : absents du JSON.
 */
export const dossierStepSchema = z.object({
  key: z.enum(["payment", "visa", "flight", "vaccination", "documents"]),
  status: z.enum(["pending", "in_progress", "done"]),
  updatedAt: z.string(),
});

export const bookingSchema = z.object({
  id: z.string(),
  pilgrimId: z.string(),
  packageId: z.string(),
  agencyId: z.string(),
  groupId: z.string().optional(),
  status: z.enum(["pending_payment", "confirmed", "cancelled", "completed"]),
  steps: z.array(dossierStepSchema),
});

export type DossierStep = z.infer<typeof dossierStepSchema>;
export type Booking = z.infer<typeof bookingSchema>;
