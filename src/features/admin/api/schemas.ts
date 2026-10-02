import { z } from "zod";

/**
 * `PlatformStatsShape` (`src/types/admin.types.ts` du backend, relu le
 * 2026-10-02) — `GET /admin/stats`. Les deux répartitions portent toujours
 * toutes les clés de leur enum (`countByStatus` les énumère), même à zéro.
 * `totalRevenue` : somme des paiements réussis, en GNF.
 */
export const platformStatsSchema = z.object({
  totalPilgrims: z.number(),
  totalGuides: z.number(),
  agenciesByStatus: z.object({
    pending: z.number(),
    approved: z.number(),
    rejected: z.number(),
  }),
  bookingsByStatus: z.object({
    pending_payment: z.number(),
    confirmed: z.number(),
    cancelled: z.number(),
    completed: z.number(),
  }),
  totalRevenue: z.number(),
});

export type PlatformStats = z.infer<typeof platformStatsSchema>;
