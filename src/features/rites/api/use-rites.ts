"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import {
  riteProgressSchema,
  riteSheetSchema,
  type RiteProgress,
} from "./schemas";

export type RiteSheetFilters = {
  pilgrimageType?: "oumra" | "hadj";
  language?: string;
};

/** `GET /rites/sheets` — `@Public()`, ne renvoie que des fiches déjà validées. */
export function useRiteSheets(filtres: RiteSheetFilters = {}) {
  return useQuery({
    queryKey: keys.rites.sheets(filtres),
    queryFn: async () => {
      const donnees = await api.get<unknown>("/api/rites/sheets", {
        params: filtres,
      });
      return z.array(riteSheetSchema).parse(donnees);
    },
  });
}

/** `GET /rites/progress` — pèlerin uniquement. */
export function useMyRiteProgress() {
  const role = useRole();

  return useQuery({
    queryKey: keys.rites.myProgress(),
    queryFn: async () => {
      const donnees = await api.get<unknown>("/api/rites/progress");
      return z.array(riteProgressSchema).parse(donnees);
    },
    enabled: role === "pilgrim",
  });
}

/** Changement saisi par le pèlerin sur un rite (ticket #79). */
export type ChangementRite = Partial<
  Pick<RiteProgress, "completed" | "tawafCount" | "saiCount">
> & { riteKey: string };

function remplacer(
  liste: RiteProgress[] | undefined,
  recus: readonly RiteProgress[],
): RiteProgress[] {
  const parCle = new Map((liste ?? []).map((p) => [p.riteKey, p]));
  for (const p of recus) parCle.set(p.riteKey, p);
  return [...parCle.values()];
}

/**
 * `POST /rites/progress/sync` avec un seul élément horodaté — même route
 * que l'application mobile. Le backend n'écrase que si l'horodatage client
 * est plus récent et renvoie l'état retenu : le cache prend toujours la
 * réponse du serveur, aucune saisie n'est perdue en silence.
 */
export function useSyncRite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (changement: ChangementRite) =>
      z.array(riteProgressSchema).parse(
        await api.post<unknown>("/api/rites/progress/sync", {
          items: [{ ...changement, clientUpdatedAt: new Date().toISOString() }],
        }),
      ),
    onSuccess: (recus) =>
      queryClient.setQueryData<RiteProgress[]>(keys.rites.myProgress(), (l) =>
        remplacer(l, recus),
      ),
  });
}

/** `PATCH /rites/progress/:riteKey/reset-counter` — remet les compteurs à zéro. */
export function useResetCompteurs(riteKey: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      riteProgressSchema.parse(
        await api.patch<unknown>(
          `/api/rites/progress/${encodeURIComponent(riteKey)}/reset-counter`,
        ),
      ),
    onSuccess: (recu) =>
      queryClient.setQueryData<RiteProgress[]>(keys.rites.myProgress(), (l) =>
        remplacer(l, [recu]),
      ),
  });
}
