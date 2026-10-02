import { z } from "zod";

/**
 * `PackageShape` / `PackageStageShape`
 * (`Oumra-hadj-project/src/types/package.types.ts`, relu le 2026-10-01) —
 * champs requis là où le backend les garantit.
 */
export const packageStageSchema = z.object({
  id: z.string(),
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
  currency: z.string(),
  capacity: z.number(),
  seatsTaken: z.number(),
  status: z.enum(["open", "full", "closed"]),
  stages: z.array(packageStageSchema),
  inclusions: z.array(z.string()),
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
