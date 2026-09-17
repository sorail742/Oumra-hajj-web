import { z } from "zod";

/**
 * Vérifié directement contre le code source du backend
 * (`Oumra-hadj-project/src/types/rite.types.ts`, `RiteSheetShape` /
 * `RiteProgressShape`, lu le 2026-09-17).
 */
export const riteSheetSchema = z.object({
  id: z.string(),
  key: z.string(),
  title: z.string(),
  pilgrimageType: z.enum(["oumra", "hadj", "both"]),
  order: z.number(),
  content: z.string(),
  audioRef: z.string().optional(),
  language: z.string(),
  version: z.number(),
  /** Voir `components/shared/ReligiousContentNotice.tsx` — jamais supposé `true`. */
  isValidated: z.boolean(),
  validatedById: z.string().optional(),
  validatedAt: z.string().optional(),
});

export type RiteSheet = z.infer<typeof riteSheetSchema>;

export const riteProgressSchema = z.object({
  id: z.string(),
  pilgrimId: z.string(),
  riteKey: z.string(),
  completed: z.boolean(),
  tawafCount: z.number(),
  saiCount: z.number(),
  clientUpdatedAt: z.string(),
});

export type RiteProgress = z.infer<typeof riteProgressSchema>;
