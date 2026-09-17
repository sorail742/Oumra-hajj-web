"use client";

import { useQuery } from "@tanstack/react-query";
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
