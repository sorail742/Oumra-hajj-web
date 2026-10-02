"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";

/**
 * Guides de l'agence (ticket #64) — `GET` / `POST /agencies/me/guides`.
 * `UserSummaryShape` du backend : identité et contact, aucune donnée
 * sensible.
 */
export const guideSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
  isActive: z.boolean(),
});
export type Guide = z.infer<typeof guideSchema>;

export function useMyGuides() {
  const role = useRole();
  return useQuery({
    queryKey: keys.agencies.guides(),
    queryFn: async () =>
      z
        .array(guideSchema)
        .parse(await api.get<unknown>("/api/agencies/me/guides")),
    enabled: role === "agency",
  });
}

export function useAjouterGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (guide: {
      fullName: string;
      phone?: string;
      email?: string;
    }) =>
      guideSchema.parse(
        await api.post<unknown>("/api/agencies/me/guides", guide),
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: keys.agencies.guides() }),
  });
}
