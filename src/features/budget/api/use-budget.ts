"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";

/**
 * Simulateur de budget du pèlerin (backend #2) — `BudgetSimulationShape`
 * (`GET`/`POST /budget`, `DELETE /budget/:id`). Montants en GNF ; le prix
 * du forfait est relevé par le backend au moment de la simulation.
 */
export const budgetSchema = z.object({
  id: z.string(),
  packageId: z.string().nullable(),
  packagePrice: z.number(),
  pocketMoney: z.number(),
  gifts: z.number(),
  sacrifice: z.number(),
  insurance: z.number(),
  otherExpenses: z.number(),
  currency: z.string(),
  createdAt: z.string(),
});
export type Budget = z.infer<typeof budgetSchema>;

export const POSTES = [
  "pocketMoney",
  "gifts",
  "sacrifice",
  "insurance",
  "otherExpenses",
] as const;
export type Poste = (typeof POSTES)[number];

export function totalBudget(b: Pick<Budget, Poste | "packagePrice">): number {
  return POSTES.reduce((somme, poste) => somme + b[poste], b.packagePrice);
}

export function useMesBudgets() {
  const role = useRole();
  return useQuery({
    queryKey: keys.budget.mine(),
    queryFn: async () =>
      z.array(budgetSchema).parse(await api.get<unknown>("/api/budget/mine")),
    enabled: role === "pilgrim",
  });
}

export function useEnregistrerBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      budget: { packageId?: string } & Record<Poste, number>,
    ) => budgetSchema.parse(await api.post<unknown>("/api/budget", budget)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: keys.budget.mine() }),
  });
}

export function useSupprimerBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<unknown>(`/api/budget/${encodeURIComponent(id)}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: keys.budget.mine() }),
  });
}
