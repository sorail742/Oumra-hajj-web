import { z } from "zod";

/**
 * Vérifié directement contre le code source du backend
 * (`Oumra-hadj-project/src/types/review.types.ts` et `agency.types.ts`,
 * `ReviewShape`/`AgencyTrustScoreShape`, lu le 2026-09-17), pas inféré.
 */
export const reviewSchema = z.object({
  id: z.string(),
  pilgrimId: z.string(),
  agencyId: z.string(),
  bookingId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  createdAt: z.string(),
});

export type Review = z.infer<typeof reviewSchema>;

/**
 * `score`/`reviewAverage`/`completionRate` sont `undefined` pour une agence
 * neuve — **jamais une valeur fabriquée pour combler l'absence de
 * données** (voir `AgencyTrustScoreShape` côté backend, et
 * `docs/design-system.md` §7 : l'afficher comme « nouveau », jamais comme
 * un zéro qui laisserait croire à une mauvaise note).
 */
export const trustScoreSchema = z.object({
  agencyId: z.string(),
  score: z.number().min(0).max(100).optional(),
  reviewAverage: z.number().min(0).max(5).optional(),
  reviewCount: z.number(),
  completionRate: z.number().min(0).max(1).optional(),
  concludedBookingsCount: z.number(),
  badge: z.enum(["verified", "trusted"]).nullable(),
});

export type AgencyTrustScore = z.infer<typeof trustScoreSchema>;
