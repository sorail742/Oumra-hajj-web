"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import { groupSchema } from "./schemas";

const CHEMIN_ET_CLE_PAR_ROLE = {
  agency: { chemin: "/api/groups/mine", cle: keys.groups.mine() },
  guide: { chemin: "/api/groups/assigned", cle: keys.groups.assigned() },
  pilgrim: { chemin: "/api/groups/joined", cle: keys.groups.joined() },
} as const;

/**
 * Trois routes de liste distinctes selon le rôle (`GET /groups/mine`
 * agence, `/assigned` guide, `/joined` pèlerin) — aucune route pour
 * l'admin, qui n'accède qu'au détail d'un groupe (voir
 * `GroupsService.findAuthorizedOrFail`).
 */
export function useGroups() {
  const role = useRole();
  const config =
    role && role in CHEMIN_ET_CLE_PAR_ROLE
      ? CHEMIN_ET_CLE_PAR_ROLE[role as keyof typeof CHEMIN_ET_CLE_PAR_ROLE]
      : undefined;

  return useQuery({
    queryKey: config?.cle ?? keys.groups.all,
    queryFn: async () => {
      const donnees = await api.get<unknown>(config!.chemin);
      return z.array(groupSchema).parse(donnees);
    },
    enabled: config !== undefined,
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: keys.groups.detail(id),
    queryFn: async () => {
      const donnees = await api.get<unknown>(`/api/groups/${id}`);
      return groupSchema.parse(donnees);
    },
  });
}

/** Création d'un groupe par l'agence (ticket #63) — `POST /groups`. */
export function useCreerGroupe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (corps: { packageId: string; title: string }) =>
      groupSchema.parse(await api.post<unknown>("/api/groups", corps)),
    onSuccess: (groupe) => {
      queryClient.setQueryData(keys.groups.detail(groupe.id), groupe);
      return queryClient.invalidateQueries({ queryKey: keys.groups.mine() });
    },
  });
}

/** Ajout d'une étape d'itinéraire par l'agence (ticket #65). */
export function useAjouterEtape(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (etape: {
      label: string;
      date: string;
      location?: string;
    }) =>
      groupSchema.parse(
        await api.post<unknown>(
          `/api/groups/${encodeURIComponent(groupId)}/itinerary`,
          etape,
        ),
      ),
    onSuccess: (groupe) => {
      queryClient.setQueryData(keys.groups.detail(groupId), groupe);
    },
  });
}

/** Assignation d'un guide de l'agence au groupe (ticket #64). */
export function useAssignerGuide(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (guideUserId: string) =>
      groupSchema.parse(
        await api.patch<unknown>(
          `/api/groups/${encodeURIComponent(groupId)}/guide`,
          { guideUserId },
        ),
      ),
    onSuccess: (groupe) => {
      queryClient.setQueryData(keys.groups.detail(groupId), groupe);
      return queryClient.invalidateQueries({ queryKey: keys.groups.mine() });
    },
  });
}

/**
 * Partage de position (ticket #85) : envoi volontaire de la position du
 * membre ou du guide. Les coordonnées ne sont jamais journalisées.
 */
export function useEnvoyerPosition(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (position: { lat: number; lng: number }) =>
      groupSchema.parse(
        await api.patch<unknown>(
          `/api/groups/${encodeURIComponent(groupId)}/location`,
          position,
        ),
      ),
    onSuccess: (groupe) => {
      queryClient.setQueryData(keys.groups.detail(groupId), groupe);
    },
  });
}

/** Arrêt du partage : le backend efface la dernière position connue. */
export function useArreterPartage(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.delete<unknown>(
        `/api/groups/${encodeURIComponent(groupId)}/location`,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: keys.groups.detail(groupId) }),
  });
}
