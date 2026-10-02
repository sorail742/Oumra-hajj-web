"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import {
  reviewSchema,
  satisfactionReportSchema,
  trustScoreSchema,
} from "./schemas";

/** `GET /reviews/mine` — pèlerin uniquement, voir `ReviewsController`. */
export function useMyReviews() {
  const role = useRole();

  return useQuery({
    queryKey: keys.reviews.mine(),
    queryFn: async () => {
      const donnees = await api.get<unknown>("/api/reviews/mine");
      return z.array(reviewSchema).parse(donnees);
    },
    enabled: role === "pilgrim",
  });
}

/** `GET /reviews/agency/:agencyId` — `@Public()`, aucune session requise. */
export function useAgencyReviews(agencyId: string) {
  return useQuery({
    queryKey: keys.reviews.byAgency(agencyId),
    queryFn: async () => {
      const donnees = await api.get<unknown>(`/api/reviews/agency/${agencyId}`);
      return z.array(reviewSchema).parse(donnees);
    },
  });
}

/** `GET /reviews/agency/:agencyId/trust-score` — `@Public()`. */
export function useAgencyTrustScore(agencyId: string) {
  return useQuery({
    queryKey: keys.reviews.trustScore(agencyId),
    queryFn: async () => {
      const donnees = await api.get<unknown>(
        `/api/reviews/agency/${agencyId}/trust-score`,
      );
      return trustScoreSchema.parse(donnees);
    },
  });
}

/** `POST /reviews` (pèlerin) — un avis par réservation (ticket #59). */
export function useDeposerAvis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (avis: {
      bookingId: string;
      rating: number;
      comment?: string;
    }) => reviewSchema.parse(await api.post<unknown>("/api/reviews", avis)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: keys.reviews.all }),
  });
}

/** Rapport de satisfaction de l'agence connectée (ticket #78). */
export function useSatisfactionReport() {
  const role = useRole();
  return useQuery({
    queryKey: keys.reviews.satisfactionReport(),
    queryFn: async () =>
      satisfactionReportSchema.parse(
        await api.get<unknown>("/api/reviews/agency/me/satisfaction-report"),
      ),
    enabled: role === "agency",
  });
}

/** Export CSV : même origine, le proxy ajoute le jeton (cookie httpOnly). */
export const LIEN_EXPORT_SATISFACTION_CSV =
  "/api/reviews/agency/me/satisfaction-report/csv";
