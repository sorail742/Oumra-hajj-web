import { z } from "zod";

/**
 * `AgencyDirectoryEntryShape` (`oumra-hajj-backend/src/types/agency.types.ts`,
 * idée #71, lu le 2026-10-08) — agences approuvées par l'administration,
 * données d'entreprise publiques seulement. Le score de confiance est
 * redéclaré ici (un `features/x` n'importe pas `features/y`, règle 2) ;
 * seuls les champs affichés sont lus.
 */
export const directoryEntrySchema = z.object({
  id: z.string(),
  legalName: z.string(),
  address: z.string().optional(),
  validatedAt: z.string().optional(),
  trustScore: z.object({
    score: z.number().optional(),
    reviewAverage: z.number().optional(),
    reviewCount: z.number(),
    badge: z.enum(["verified", "trusted"]).nullable(),
  }),
});

export type DirectoryEntry = z.infer<typeof directoryEntrySchema>;
