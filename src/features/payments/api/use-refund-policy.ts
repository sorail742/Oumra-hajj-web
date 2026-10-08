"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";

/**
 * Barème de remboursement (idée #58 — `RefundPolicyShape`,
 * `RefundPreviewShape`, `oumra-hajj-backend/src/types/payment.types.ts`,
 * lu le 2026-10-08). Le calcul reste côté serveur : l'écran n'affiche que
 * ce que le backend applique (`GET /payments/:id/refund-preview`).
 */
export const refundTierSchema = z.object({
  minDaysBeforeDeparture: z.number(),
  rate: z.number(),
});

export const refundPolicySchema = z.object({
  agencyId: z.string(),
  tiers: z.array(refundTierSchema),
});

export const refundPreviewSchema = z.object({
  paymentId: z.string(),
  eligibleRate: z.number(),
  refundableAmount: z.number(),
  currency: z.string(),
  rule: z.enum([
    "unpaid_booking",
    "agency_tier",
    "platform_default",
    "not_refundable",
  ]),
  daysBeforeDeparture: z.number(),
  tiers: z.array(refundTierSchema),
});

export type RefundTier = z.infer<typeof refundTierSchema>;
export type RefundPreview = z.infer<typeof refundPreviewSchema>;

export function useApercuRemboursement(paymentId: string, actif: boolean) {
  return useQuery({
    queryKey: keys.payments.refundPreview(paymentId),
    queryFn: async () =>
      refundPreviewSchema.parse(
        await api.get<unknown>(
          `/api/payments/${encodeURIComponent(paymentId)}/refund-preview`,
        ),
      ),
    enabled: actif,
    // Le taux dépend du jour : toujours relu à l'ouverture.
    staleTime: 0,
  });
}

export function useBaremeAgence(agencyId: string | undefined) {
  return useQuery({
    queryKey: keys.payments.refundPolicy(agencyId ?? ""),
    queryFn: async () =>
      refundPolicySchema.parse(
        await api.get<unknown>(
          `/api/refund-policies/agency/${encodeURIComponent(agencyId ?? "")}`,
        ),
      ),
    enabled: agencyId !== undefined,
  });
}

export function useMonBareme() {
  return useQuery({
    queryKey: keys.payments.myRefundPolicy(),
    queryFn: async () =>
      refundPolicySchema.parse(
        await api.get<unknown>("/api/refund-policies/mine"),
      ),
  });
}

export function useEnregistrerBareme() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (tiers: RefundTier[]) =>
      refundPolicySchema.parse(
        await api.put<unknown>("/api/refund-policies/mine", { tiers }),
      ),
    onSuccess: (bareme) => {
      client.setQueryData(keys.payments.myRefundPolicy(), bareme);
      void client.invalidateQueries({
        queryKey: keys.payments.refundPolicy(bareme.agencyId),
      });
    },
  });
}
