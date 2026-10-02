"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";

/**
 * Vue famille (ticket #75) — lien de suivi en lecture seule pour un proche
 * sans compte. Le jeton est un secret : jamais journalisé, jamais mis en
 * cache au-delà de l'écran qui l'affiche.
 *
 * `FamilyViewLinkShape` / `FamilyViewShape` (`src/types/booking.types.ts`
 * du backend, relu le 2026-10-02). `viewUrl` pointe vers l'API, pas vers
 * la page : on compose `/family/:token` côté web.
 */
export const familyLinkSchema = z.object({ token: z.string() });

export const familyViewSchema = z.object({
  pilgrimFullName: z.string(),
  packageTitle: z.string(),
  status: z.enum(["pending_payment", "confirmed", "cancelled", "completed"]),
  steps: z.array(
    z.object({
      key: z.enum(["payment", "visa", "flight", "vaccination", "documents"]),
      status: z.enum(["pending", "in_progress", "done"]),
      updatedAt: z.string(),
    }),
  ),
  location: z
    .object({ lat: z.number(), lng: z.number(), updatedAt: z.string() })
    .optional(),
  latestItineraryStep: z
    .object({
      label: z.string(),
      date: z.string(),
      location: z.string().optional(),
    })
    .optional(),
});
export type FamilyView = z.infer<typeof familyViewSchema>;

export function cheminVueFamille(token: string): string {
  return `/family/${encodeURIComponent(token)}`;
}

export function useFamilyLink(bookingId: string) {
  const role = useRole();
  return useQuery({
    queryKey: keys.familyView.link(bookingId),
    queryFn: async () =>
      familyLinkSchema.parse(
        await api.get<unknown>(
          `/api/bookings/${encodeURIComponent(bookingId)}/family-view-link`,
        ),
      ),
    enabled: role === "pilgrim",
    gcTime: 0,
  });
}

export function useRegenererLien(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      familyLinkSchema.parse(
        await api.post<unknown>(
          `/api/bookings/${encodeURIComponent(bookingId)}/family-view-link/regenerate`,
        ),
      ),
    onSuccess: (lien) => {
      queryClient.setQueryData(keys.familyView.link(bookingId), lien);
    },
  });
}

/** Page publique : aucune session requise (`@Public()` côté backend). */
export function useFamilyView(token: string) {
  return useQuery({
    queryKey: keys.familyView.view(token),
    queryFn: async () =>
      familyViewSchema.parse(
        await api.get<unknown>(`/api/family-view/${encodeURIComponent(token)}`),
      ),
    gcTime: 0,
  });
}
