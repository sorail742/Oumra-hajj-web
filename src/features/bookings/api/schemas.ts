import { z } from "zod";

/**
 * `GET /bookings/mine` (pèlerin) et `GET /bookings/agency` (agence) ne
 * publient pas de schéma de réponse dans `openapi.json` — seuls les DTO
 * d'écriture (`CreateBookingDto`, `UpdateStepDto`) y figurent. Ce schéma
 * reprend l'exemple de référence de `docs/socle-frontend.md` §4, recoupé
 * avec `UpdateStepDto` (mêmes enums `key`/`status`). **À revérifier contre
 * une réponse réelle** avant de le considérer stable — voir
 * `docs/contrat-api.md` § Ne pas halluciner un champ absent de la réponse
 * observée.
 */
export const dossierStepSchema = z.object({
  key: z.enum(["payment", "visa", "flight", "vaccination", "documents"]),
  status: z.enum(["pending", "in_progress", "done"]),
  completedAt: z.string().optional(),
});

export const bookingSchema = z.object({
  id: z.string(),
  pilgrimId: z.string(),
  packageId: z.string(),
  agencyId: z.string(),
  status: z.enum(["pending_payment", "confirmed", "cancelled", "completed"]),
  steps: z.array(dossierStepSchema),
  createdAt: z.string().optional(),
});

export type DossierStep = z.infer<typeof dossierStepSchema>;
export type Booking = z.infer<typeof bookingSchema>;
