"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import {
  quoteSchema,
  sharedQuoteSchema,
  type NouveauDevis,
  type QuoteStatus,
} from "./schemas";

export function useDevis(status: QuoteStatus | undefined) {
  return useQuery({
    queryKey: keys.quotes.list({ status }),
    queryFn: async () =>
      z
        .array(quoteSchema)
        .parse(await api.get<unknown>("/api/quotes", { params: { status } })),
  });
}

export function useUnDevis(id: string) {
  return useQuery({
    queryKey: keys.quotes.detail(id),
    queryFn: async () =>
      quoteSchema.parse(
        await api.get<unknown>(`/api/quotes/${encodeURIComponent(id)}`),
      ),
  });
}

function useEcritureDevis<V, R>(appel: (variables: V) => Promise<R>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: appel,
    onSuccess: () => client.invalidateQueries({ queryKey: keys.quotes.all }),
  });
}

export function useCreerDevis() {
  return useEcritureDevis(async (devis: NouveauDevis) =>
    quoteSchema.parse(await api.post<unknown>("/api/quotes", devis)),
  );
}

export function useEnvoyerDevis(id: string) {
  return useEcritureDevis(async () =>
    quoteSchema.parse(
      await api.post<unknown>(`/api/quotes/${encodeURIComponent(id)}/send`),
    ),
  );
}

export function useSupprimerDevis(id: string) {
  return useEcritureDevis(() =>
    api.delete<unknown>(`/api/quotes/${encodeURIComponent(id)}`),
  );
}

/** Lien client, sans session : le proxy relaie l'appel public du backend. */
export function useDevisPartage(token: string) {
  return useQuery({
    queryKey: keys.quotes.shared(token),
    queryFn: async () =>
      sharedQuoteSchema.parse(
        await api.get<unknown>(
          `/api/quotes/shared/${encodeURIComponent(token)}`,
        ),
      ),
  });
}

export function useRepondreDevis(token: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (accepte: boolean) =>
      sharedQuoteSchema.parse(
        await api.post<unknown>(
          `/api/quotes/shared/${encodeURIComponent(token)}/${accepte ? "accept" : "decline"}`,
        ),
      ),
    onSuccess: (devis) => client.setQueryData(keys.quotes.shared(token), devis),
  });
}
