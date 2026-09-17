"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import { reviewSchema, trustScoreSchema } from "./schemas";

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
