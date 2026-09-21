"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import { accessUrlSchema, legalDocumentAlertSchema } from "./schemas";

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
