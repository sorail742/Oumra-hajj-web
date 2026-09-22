import { z } from "zod";

export const tripSummaryPilgrimSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  completedRitesCount: z.number().optional(),
});

export const tripSummarySchema = z.object({
  bookingId: z.string().uuid().optional(),
  agencyName: z.string().optional(),
  packageTitle: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  pilgrims: z.array(tripSummaryPilgrimSchema).optional(),
});

export type TripSummary = z.infer<typeof tripSummarySchema>;
export type TripSummaryPilgrim = z.infer<typeof tripSummaryPilgrimSchema>;
