import { z } from "zod";

/**
 * `CapacitySimulationShape` (`oumra-hajj-backend/src/types/capacity.types.ts`,
 * idée #68, lu le 2026-10-09) — guides de l'agence face aux voyages à venir.
 */
export const RATIO_PAR_DEFAUT = 40;
export const RATIO_MIN = 5;
export const RATIO_MAX = 200;
export const RECRUES_MAX = 200;

const tripSchema = z.object({
  packageId: z.string(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  capacity: z.number(),
  seatsTaken: z.number(),
  guidesNeeded: z.number(),
  guidesAssigned: z.number(),
});

const periodSchema = z.object({
  from: z.string(),
  to: z.string(),
  packageIds: z.array(z.string()),
  plannedPilgrims: z.number(),
  soldPilgrims: z.number(),
  guidesNeeded: z.number(),
  guidesNeededForSold: z.number(),
});

export const capacitySimulationSchema = z.object({
  pilgrimsPerGuide: z.number(),
  guides: z.number(),
  extraGuides: z.number(),
  staff: z.number(),
  trips: z.array(tripSchema),
  periods: z.array(periodSchema),
  peak: periodSchema.optional(),
  spareGuidesAtPeak: z.number(),
  extraPilgrimsAtPeak: z.number(),
});

export type CapacitySimulation = z.infer<typeof capacitySimulationSchema>;
export type CapacityTrip = z.infer<typeof tripSchema>;
export type CapacityPeriod = z.infer<typeof periodSchema>;
