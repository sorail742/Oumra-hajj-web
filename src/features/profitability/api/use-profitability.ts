"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { profitabilitySchema, type HypothesesRentabilite } from "./schemas";

/** Simulation à la demande : POST sans effet, aucun cache à invalider. */
export function useSimulerRentabilite() {
  return useMutation({
    mutationFn: async (hypotheses: HypothesesRentabilite) =>
      profitabilitySchema.parse(
        await api.post<unknown>("/api/profitability/simulation", hypotheses),
      ),
  });
}
