"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { accessUrlSchema, documentSchema } from "./schemas";

export function useMyDocuments() {
  return useQuery({
    queryKey: keys.documents.mine(),
    queryFn: async () => {
      const donnees = await api.get<unknown>("/api/documents/mine");
      return z.array(documentSchema).parse(donnees);
    },
  });
}

/**
 * **Volontairement une mutation, pas une query.** L'URL signée a une durée
 * de vie courte côté backend (voir ADR-0008 backend,
 * `docs/coding-rules-frontend.md` § Données sensibles) : une `useQuery`
 * mettrait le résultat en cache (`gcTime` par défaut, 5 min) et pourrait
 * resservir une URL expirée sans nouvel appel réseau. Chaque consultation
 * déclenche donc un appel frais — voir `DocumentAccessButton`.
 */
export function useDocumentAccessUrl() {
  return useMutation({
    mutationFn: async (documentId: string) => {
      const donnees = await api.get<unknown>(
        `/api/documents/${documentId}/access-url`,
      );
      return accessUrlSchema.parse(donnees);
    },
  });
}
