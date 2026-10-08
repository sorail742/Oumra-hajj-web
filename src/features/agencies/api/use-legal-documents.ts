"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import {
  accessUrlSchema,
  agencySchema,
  legalDocumentAlertSchema,
} from "./schemas";

/** `GET /agencies/me/legal-documents/alerts` — agence uniquement. */
export function useComplianceAlerts() {
  const role = useRole();

  return useQuery({
    queryKey: keys.agencies.complianceAlerts(),
    queryFn: async () => {
      const donnees = await api.get<unknown>(
        "/api/agencies/me/legal-documents/alerts",
      );
      return z.array(legalDocumentAlertSchema).parse(donnees);
    },
    enabled: role === "agency",
  });
}

/**
 * Même garde-fou que `DocumentAccessButton` (règle 14) : une mutation, pas
 * une query — l'URL signée a une durée de vie courte, la resservir depuis
 * un cache TanStack Query risquerait une URL expirée.
 */
export function useLegalDocumentAccessUrl() {
  return useMutation({
    mutationFn: async (documentId: string) => {
      const donnees = await api.get<unknown>(
        `/api/agencies/me/legal-documents/${documentId}/access-url`,
      );
      return accessUrlSchema.parse(donnees);
    },
  });
}

export interface DepotDocumentLegal {
  fichier: File;
  label: string;
  /** Date `AAAA-MM-JJ` ; absente pour un document sans échéance. */
  expiresAt?: string;
}

/**
 * `POST /agencies/me/legal-documents` (multipart, ticket #48). Le backend
 * renvoie l'agence à jour : sa liste de documents remplace le cache de
 * `GET /agencies/me`, et les alertes d'échéance sont relues.
 */
export function useDeposerDocumentLegal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ fichier, label, expiresAt }: DepotDocumentLegal) => {
      const formulaire = new FormData();
      formulaire.append("file", fichier);
      formulaire.append("label", label);
      if (expiresAt) formulaire.append("expiresAt", expiresAt);
      return agencySchema.parse(
        await api.post<unknown>("/api/agencies/me/legal-documents", formulaire),
      );
    },
    onSuccess: (agence) => {
      queryClient.setQueryData(keys.agencies.me(), agence);
      return queryClient.invalidateQueries({
        queryKey: keys.agencies.complianceAlerts(),
      });
    },
  });
}
