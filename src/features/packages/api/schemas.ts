import { z } from "zod";

/**
 * `GET /packages` (`PackagesController_listPublic`, public, sans JWT) ne
 * publie pas de schéma de réponse dans `openapi.json` — seuls les DTO
 * d'écriture (`CreatePackageDto`, `PackageStageDto`) y figurent. Champs
 * d'écriture repris tels quels ; `id`/`agencyId`/`status` ajoutés comme
 * certainement présents sur une entité persistée. **À revérifier contre une
 * réponse réelle** avant de considérer ce schéma stable — voir
 * `docs/contrat-api.md` § Ne pas halluciner un champ absent de la réponse
 * observée.
 */
export const packageStageSchema = z.object({
  city: z.string(),
  hotelName: z.string(),
  distanceToMosqueMeters: z.number().optional(),
  startDate: z.string(),
  endDate: z.string(),
});

export const packageSchema = z.object({
  id: z.string(),
  agencyId: z.string(),
  type: z.enum(["oumra", "hadj"]),
  title: z.string(),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  price: z.number(),
  currency: z.string().optional(),
  capacity: z.number(),
  status: z.enum(["open", "full", "closed"]),
  stages: z.array(packageStageSchema),
  inclusions: z.array(z.string()).optional(),
});

export type Package = z.infer<typeof packageSchema>;
export type PackageStage = z.infer<typeof packageStageSchema>;

/** Filtres `GET /packages` — voir `openapi.json`, tous optionnels. */
export const packageFiltersSchema = z.object({
  type: z.enum(["oumra", "hadj"]).optional(),
  agencyId: z.string().optional(),
  maxBudget: z.number().optional(),
  familySize: z.number().optional(),
  startDateFrom: z.string().optional(),
  startDateTo: z.string().optional(),
});

export type PackageFilters = z.infer<typeof packageFiltersSchema>;
