import { z } from "zod";

/**
 * `TripSummaryShape` (`Oumra-hadj-project/src/types/trip-summary.types.ts`,
 * relu le 2026-10-01). Champs requis partout où le backend les garantit
 * (ticket #44) : un schéma entièrement optionnel laissait passer n'importe
 * quelle réponse et masquait l'écart de contrat. Les optionnels sont mappés
 * `?? undefined` côté backend — absents du JSON, jamais `null`.
 */
export const tripSummaryStepSchema = z.object({
  key: z.enum(["payment", "visa", "flight", "vaccination", "documents"]),
  status: z.enum(["pending", "in_progress", "done"]),
  completedAt: z.string().optional(),
});

/**
 * `title` n'est renseigné que pour une fiche **publiée**, donc validée
 * (`RiteSheetsService.listPublished` filtre sur `isValidated: true`) ;
 * absent si la fiche a été retirée depuis la progression.
 */
export const tripSummaryRiteSchema = z.object({
  riteKey: z.string(),
  title: z.string().optional(),
  completed: z.boolean(),
  tawafCount: z.number(),
  saiCount: z.number(),
});

export const tripSummaryReviewSchema = z.object({
  rating: z.number(),
  comment: z.string().optional(),
});

export const tripSummarySchema = z.object({
  bookingId: z.string(),
  status: z.enum(["pending_payment", "confirmed", "cancelled", "completed"]),
  packageTitle: z.string(),
  pilgrimageType: z.enum(["oumra", "hadj"]),
  startDate: z.string(),
  endDate: z.string(),
  agencyName: z.string(),
  steps: z.array(tripSummaryStepSchema),
  totalPaid: z.number(),
  currency: z.string(),
  installmentsCount: z.number(),
  rites: z.array(tripSummaryRiteSchema),
  review: tripSummaryReviewSchema.optional(),
});

export type TripSummary = z.infer<typeof tripSummarySchema>;
export type TripSummaryStep = z.infer<typeof tripSummaryStepSchema>;
export type TripSummaryRite = z.infer<typeof tripSummaryRiteSchema>;
