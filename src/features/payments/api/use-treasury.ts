"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";

/**
 * Trésorerie prévisionnelle de l'agence (ticket #38) —
 * `TreasuryProjectionShape` (`GET /payments/agency/treasury`). Montants en
 * GNF ; `month` au format `AAAA-MM`.
 */
export const treasurySchema = z.object({
  totalExpected: z.number(),
  totalCollected: z.number(),
  outstandingBalance: z.number(),
  projections: z.array(
    z.object({ month: z.string(), expectedAmount: z.number() }),
  ),
});
export type Treasury = z.infer<typeof treasurySchema>;

export function useTresorerie() {
  const role = useRole();
  return useQuery({
    queryKey: keys.payments.treasury(),
    queryFn: async () =>
      treasurySchema.parse(
        await api.get<unknown>("/api/payments/agency/treasury"),
      ),
    enabled: role === "agency",
  });
}
