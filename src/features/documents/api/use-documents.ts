"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
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

/**
 * Documents d'une réservation, côté agence (ticket #38). Le backend vérifie
 * que la réservation appartient bien à l'agence connectée (règle 12).
 */
export function useBookingDocuments(bookingId: string) {
  const role = useRole();
  return useQuery({
    queryKey: keys.documents.byBooking(bookingId),
    queryFn: async () => {
      const donnees = await api.get<unknown>("/api/documents", {
        params: { bookingId },
      });
      return z.array(documentSchema).parse(donnees);
    },
    enabled: role === "agency",
  });
}

/**
 * Valider ou refuser change aussi, potentiellement, l'étape « documents »
 * du dossier (`DocumentsService.maybeCompleteDocumentsStep` côté backend) :
 * la réservation est invalidée avec la liste.
 */
function useInvaliderApresDecision() {
  const queryClient = useQueryClient();
  return (bookingId: string) =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: keys.documents.byBooking(bookingId),
      }),
      queryClient.invalidateQueries({
        queryKey: keys.bookings.detail(bookingId),
      }),
    ]);
}

export function useValidateDocument() {
  const invalider = useInvaliderApresDecision();
  return useMutation({
    mutationFn: async (documentId: string) =>
      documentSchema.parse(
        await api.patch<unknown>(`/api/documents/${documentId}/validate`),
      ),
    onSuccess: (document) => invalider(document.bookingId),
  });
}

export function useRejectDocument() {
  const invalider = useInvaliderApresDecision();
  return useMutation({
    mutationFn: async ({
      documentId,
      reason,
    }: {
      documentId: string;
      reason: string;
    }) =>
      documentSchema.parse(
        await api.patch<unknown>(`/api/documents/${documentId}/reject`, {
          reason,
        }),
      ),
    onSuccess: (document) => invalider(document.bookingId),
  });
}
