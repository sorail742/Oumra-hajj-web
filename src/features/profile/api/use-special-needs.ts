"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";

/**
 * Besoins spéciaux du pèlerin (idée #69) — `GET` / `PUT
 * /users/me/special-needs`. Données de santé : jamais journalisées, cache
 * vidé avec la session comme le reste de l'identité (`LogoutButton`).
 */
export const NIVEAUX_MOBILITE = ["none", "reduced", "wheelchair"] as const;

export const specialNeedsSchema = z.object({
  mobility: z.enum(NIVEAUX_MOBILITE),
  dietary: z.string().optional(),
  medical: z.string().optional(),
  assistance: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type SpecialNeeds = z.infer<typeof specialNeedsSchema>;
export type SaisieBesoins = Omit<SpecialNeeds, "updatedAt">;

export function useSpecialNeeds() {
  const role = useRole();
  return useQuery({
    queryKey: keys.specialNeeds.mine(),
    queryFn: async () =>
      specialNeedsSchema.parse(
        await api.get<unknown>("/api/users/me/special-needs"),
      ),
    enabled: role === "pilgrim",
  });
}

/** `PUT` : remplacement complet — un champ vide efface l'information. */
export function useEnregistrerBesoins() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (besoins: SaisieBesoins) =>
      specialNeedsSchema.parse(
        await api.put<unknown>("/api/users/me/special-needs", besoins),
      ),
    onSuccess: (besoins) =>
      queryClient.setQueryData(keys.specialNeeds.mine(), besoins),
  });
}
