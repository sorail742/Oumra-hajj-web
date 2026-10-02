"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import {
  accessUrlSchema,
  agencySchema,
  type Agency,
  type AgencyValidationStatus,
} from "./schemas";

/**
 * Validation des agences par l'administrateur (ticket #31) —
 * `GET /agencies?status=`, `GET /agencies/:id`, `PATCH .../approve|reject`.
 * Le backend vérifie le rôle (règle 12) ; `enabled` évite seulement un
 * appel voué au 403.
 */
export function useAgencies(status?: AgencyValidationStatus) {
  const role = useRole();
  return useQuery({
    queryKey: keys.agencies.list({ status }),
    queryFn: async () => {
      const donnees = await api.get<unknown>("/api/agencies", {
        params: { status },
      });
      return z.array(agencySchema).parse(donnees);
    },
    enabled: role === "admin",
  });
}

export function useAgency(id: string) {
  const role = useRole();
  return useQuery({
    queryKey: keys.agencies.detail(id),
    queryFn: async () =>
      agencySchema.parse(
        await api.get<unknown>(`/api/agencies/${encodeURIComponent(id)}`),
      ),
    enabled: role === "admin",
  });
}

function useApresDecision(id: string) {
  const queryClient = useQueryClient();
  return (agence: Agency) => {
    queryClient.setQueryData(keys.agencies.detail(id), agence);
    return queryClient.invalidateQueries({
      queryKey: [...keys.agencies.all, "list"],
    });
  };
}

export function useApproveAgency(id: string) {
  const apresDecision = useApresDecision(id);
  return useMutation({
    mutationFn: async () =>
      agencySchema.parse(
        await api.patch<unknown>(
          `/api/agencies/${encodeURIComponent(id)}/approve`,
        ),
      ),
    onSuccess: apresDecision,
  });
}

/** `RejectAgencyDto` : `reason` chaîne, 3 caractères minimum. */
export const LONGUEUR_MIN_MOTIF_REFUS_AGENCE = 3;

export function useRejectAgency(id: string) {
  const apresDecision = useApresDecision(id);
  return useMutation({
    mutationFn: async (reason: string) =>
      agencySchema.parse(
        await api.patch<unknown>(
          `/api/agencies/${encodeURIComponent(id)}/reject`,
          { reason },
        ),
      ),
    onSuccess: apresDecision,
  });
}

/**
 * Document légal d'une agence ouvert par l'administrateur — mutation, pas
 * query (règle 14) : URL signée fraîche à chaque clic, jamais en cache.
 */
export function useAdminLegalDocumentAccessUrl(agencyId: string) {
  return useMutation({
    mutationFn: async (documentId: string) =>
      accessUrlSchema.parse(
        await api.get<unknown>(
          `/api/agencies/${encodeURIComponent(agencyId)}/legal-documents/${encodeURIComponent(documentId)}/access-url`,
        ),
      ),
  });
}
