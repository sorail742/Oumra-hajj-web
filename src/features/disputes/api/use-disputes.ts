"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import {
  disputeSchema,
  type Dispute,
  type DisputeStatus,
  type NouveauLitige,
} from "./schemas";

export function useLitiges(status: DisputeStatus | undefined) {
  return useQuery({
    queryKey: keys.disputes.list({ status }),
    queryFn: async () =>
      z
        .array(disputeSchema)
        .parse(await api.get<unknown>("/api/disputes", { params: { status } })),
  });
}

export function useLitige(id: string) {
  return useQuery({
    queryKey: keys.disputes.detail(id),
    queryFn: async () =>
      disputeSchema.parse(
        await api.get<unknown>(`/api/disputes/${encodeURIComponent(id)}`),
      ),
    // Le dialogue avance des deux côtés : relu régulièrement.
    refetchInterval: 30_000,
  });
}

/** Chaque action renvoie le litige à jour : il remplace le cache. */
function useActionLitige<V>(id: string, appel: (v: V) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (v: V) => disputeSchema.parse(await appel(v)),
    onSuccess: (litige: Dispute) => {
      client.setQueryData(keys.disputes.detail(id), litige);
      void client.invalidateQueries({ queryKey: keys.disputes.all });
    },
  });
}

const chemin = (id: string, action = "") =>
  `/api/disputes/${encodeURIComponent(id)}${action}`;

export function useEcrireLitige(id: string) {
  return useActionLitige(id, (content: string) =>
    api.post<unknown>(chemin(id, "/messages"), { content }),
  );
}

export function useResoudreLitige(id: string) {
  return useActionLitige(id, () => api.post<unknown>(chemin(id, "/resolve")));
}

export function useEscaladerLitige(id: string) {
  return useActionLitige(id, () => api.post<unknown>(chemin(id, "/escalate")));
}

export function useTrancherLitige(id: string) {
  return useActionLitige(id, (decision: string) =>
    api.post<unknown>(chemin(id, "/decision"), { decision }),
  );
}

export function useOuvrirLitige() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (litige: NouveauLitige) =>
      disputeSchema.parse(await api.post<unknown>("/api/disputes", litige)),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.disputes.all }),
  });
}
