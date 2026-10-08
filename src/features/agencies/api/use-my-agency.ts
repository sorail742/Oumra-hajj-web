"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import { agencySchema } from "./schemas";

/**
 * Profil de l'agence connectée (ticket #47) — `GET` / `PATCH
 * /agencies/me`. Les coordonnées bancaires sont des données de paiement :
 * jamais journalisées, jamais mises dans l'URL.
 */
export function useMyAgency() {
  const role = useRole();
  return useQuery({
    queryKey: keys.agencies.me(),
    queryFn: async () =>
      agencySchema.parse(await api.get<unknown>("/api/agencies/me")),
    enabled: role === "agency",
  });
}

export interface MiseAJourAgence {
  address?: string;
  taxId?: string;
  tradeRegister?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
}

export function useUpdateMyAgency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (corps: MiseAJourAgence) =>
      agencySchema.parse(await api.patch<unknown>("/api/agencies/me", corps)),
    onSuccess: (agence) => {
      queryClient.setQueryData(keys.agencies.me(), agence);
    },
  });
}

/** Numéro de compte masqué : seuls les 4 derniers caractères restent lisibles. */
export function masquerCompte(numero: string): string {
  const visibles = numero.slice(-4);
  return `•••• ${visibles}`;
}
