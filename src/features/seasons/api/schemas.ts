import { z } from "zod";

/**
 * `SeasonComparisonShape` (`oumra-hajj-backend/src/types/season.types.ts`,
 * idée #65, lu le 2026-10-09) — une saison : année de départ et type.
 */
const montantSchema = z.object({ currency: z.string(), amount: z.number() });

export const seasonSchema = z.object({
  year: z.number(),
  type: z.enum(["oumra", "hadj"]),
  packages: z.number(),
  capacity: z.number(),
  bookings: z.number(),
  cancellations: z.number(),
  fillRate: z.number().optional(),
  cancellationRate: z.number().optional(),
  averagePrice: z.array(montantSchema).optional(),
  collected: z.array(montantSchema),
  reviews: z.number(),
  averageRating: z.number().optional(),
  disputes: z.number(),
});

export const seasonComparisonSchema = z.object({
  fromYear: z.number(),
  toYear: z.number(),
  seasons: z.array(seasonSchema),
});

export type Season = z.infer<typeof seasonSchema>;
export type SeasonComparison = z.infer<typeof seasonComparisonSchema>;
