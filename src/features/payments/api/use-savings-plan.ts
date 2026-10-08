"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";

/**
 * Plan d'épargne d'une réservation (ticket 1 du backlog backend) —
 * `SavingsPlanShape`. `GET` renvoie un corps vide tant qu'aucun plan n'a
 * été créé : `null` ici. Montants en GNF.
 */
export const FREQUENCES = ["weekly", "monthly"] as const;
export type Frequence = (typeof FREQUENCES)[number];

export const planEpargneSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  targetAmount: z.number(),
  autoDeduct: z.boolean(),
  deductAmount: z.number().optional(),
  frequency: z.enum(FREQUENCES).optional(),
  nextDeductDate: z.string().optional(),
});
export type PlanEpargne = z.infer<typeof planEpargneSchema>;

export interface ReglagePlan {
  autoDeduct: boolean;
  deductAmount?: number;
  frequency?: Frequence;
}

const chemin = (bookingId: string) =>
  `/api/payments/bookings/${encodeURIComponent(bookingId)}/savings-plan`;

export function usePlanEpargne(bookingId: string) {
  const role = useRole();
  return useQuery({
    queryKey: keys.payments.savingsPlan(bookingId),
    queryFn: async () =>
      planEpargneSchema
        .nullable()
        .parse((await api.get<unknown>(chemin(bookingId))) ?? null),
    enabled: role === "pilgrim",
  });
}

export function useReglerPlanEpargne(bookingId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (reglage: ReglagePlan) =>
      planEpargneSchema.parse(
        await api.post<unknown>(chemin(bookingId), reglage),
      ),
    onSuccess: (plan) => {
      client.setQueryData(keys.payments.savingsPlan(bookingId), plan);
    },
  });
}
