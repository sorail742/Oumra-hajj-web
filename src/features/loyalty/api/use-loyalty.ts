"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import {
  loyaltyMemberSchema,
  loyaltyProgramSchema,
  myLoyaltySchema,
  type LoyaltyTier,
} from "./schemas";

export function useProgrammeFidelite() {
  return useQuery({
    queryKey: keys.loyalty.program(),
    queryFn: async () =>
      loyaltyProgramSchema.parse(
        await api.get<unknown>("/api/loyalty/program/mine"),
      ),
  });
}

export function useMembresFideles() {
  return useQuery({
    queryKey: keys.loyalty.members(),
    queryFn: async () =>
      z
        .array(loyaltyMemberSchema)
        .parse(await api.get<unknown>("/api/loyalty/members")),
  });
}

export function useMaFidelite() {
  return useQuery({
    queryKey: keys.loyalty.mine(),
    queryFn: async () =>
      z
        .array(myLoyaltySchema)
        .parse(await api.get<unknown>("/api/loyalty/mine")),
  });
}

/** Remplace tous les paliers ; les membres changent de palier en conséquence. */
export function useRemplacerPaliers() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (tiers: LoyaltyTier[]) =>
      loyaltyProgramSchema.parse(
        await api.put<unknown>("/api/loyalty/program/mine", { tiers }),
      ),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.loyalty.all }),
  });
}
