import { z } from "zod";

/**
 * `LoyaltyProgramShape`, `LoyaltyMemberShape`, `MyLoyaltyShape`
 * (`oumra-hajj-backend/src/types/loyalty.types.ts`, idée #47, lu le
 * 2026-10-09). Avantages accordés par l'agence : aucune remise automatique.
 */
export const PALIERS_MAX = 5;

export const loyaltyTierSchema = z.object({
  minTrips: z.number(),
  label: z.string(),
  benefit: z.string(),
});

export const loyaltyProgramSchema = z.object({
  agencyId: z.string(),
  agencyName: z.string(),
  tiers: z.array(loyaltyTierSchema),
});

export const loyaltyMemberSchema = z.object({
  pilgrimId: z.string(),
  pilgrimName: z.string(),
  trips: z.number(),
  lastTripEnd: z.string(),
  tier: loyaltyTierSchema.optional(),
});

export const myLoyaltySchema = z.object({
  agencyId: z.string(),
  agencyName: z.string(),
  trips: z.number(),
  tier: loyaltyTierSchema.optional(),
  nextTier: loyaltyTierSchema.extend({ tripsToGo: z.number() }).optional(),
});

export type LoyaltyTier = z.infer<typeof loyaltyTierSchema>;
export type LoyaltyProgram = z.infer<typeof loyaltyProgramSchema>;
export type LoyaltyMember = z.infer<typeof loyaltyMemberSchema>;
export type MyLoyalty = z.infer<typeof myLoyaltySchema>;
