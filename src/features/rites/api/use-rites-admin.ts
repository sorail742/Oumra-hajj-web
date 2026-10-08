"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import { riteSheetSchema, type RiteSheet } from "./schemas";

/**
 * Gestion des fiches de rites par l'administrateur — `GET /rites/sheets/admin`
 * (fiches validées ou non), `POST /rites/sheets`, `PATCH /rites/sheets/:id`,
 * `PATCH /rites/sheets/:id/validate`.
 *
 * Le backend ne publie jamais une fiche créée et **annule la validation de
 * toute fiche modifiée** (`RiteSheetsService.update`) : l'interface ne fait
 * qu'en informer, elle ne décide de rien.
 */
export type SaisieFiche = Pick<
  RiteSheet,
  "key" | "title" | "pilgrimageType" | "order" | "content" | "language"
> & { audioRef?: string };

export function useFichesAdmin() {
  const role = useRole();
  return useQuery({
    queryKey: keys.rites.admin(),
    queryFn: async () =>
      z
        .array(riteSheetSchema)
        .parse(await api.get<unknown>("/api/rites/sheets/admin")),
    enabled: role === "admin",
  });
}

function useInvaliderFiches() {
  const client = useQueryClient();
  // Le catalogue public change aussi quand une fiche est (dé)validée.
  return () => client.invalidateQueries({ queryKey: keys.rites.all });
}

export function useCreerFiche() {
  const invalider = useInvaliderFiches();
  return useMutation({
    mutationFn: async (saisie: SaisieFiche) =>
      riteSheetSchema.parse(
        await api.post<unknown>("/api/rites/sheets", saisie),
      ),
    onSuccess: invalider,
  });
}

export function useModifierFiche(id: string) {
  const invalider = useInvaliderFiches();
  return useMutation({
    mutationFn: async (saisie: SaisieFiche) =>
      riteSheetSchema.parse(
        await api.patch<unknown>(
          `/api/rites/sheets/${encodeURIComponent(id)}`,
          saisie,
        ),
      ),
    onSuccess: invalider,
  });
}

export function useValiderFiche() {
  const invalider = useInvaliderFiches();
  return useMutation({
    mutationFn: async (id: string) =>
      riteSheetSchema.parse(
        await api.patch<unknown>(
          `/api/rites/sheets/${encodeURIComponent(id)}/validate`,
        ),
      ),
    onSuccess: invalider,
  });
}
