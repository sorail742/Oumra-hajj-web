"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import { packageSchema } from "./schemas";
import type { CorpsForfait } from "../lib/formulaire-forfait";

/**
 * Forfaits de l'agence connectée (ticket #33) : `GET /packages/mine`,
 * `POST /packages`, `PATCH /packages/:id`, `PATCH /packages/:id/close`.
 * Le backend vérifie que le forfait appartient à l'agence (règle 12) et
 * refuse la création tant que l'agence n'est pas validée (409).
 */

export function useMyPackages() {
  const role = useRole();
  return useQuery({
    queryKey: keys.packages.mine(),
    queryFn: async () =>
      z
        .array(packageSchema)
        .parse(await api.get<unknown>("/api/packages/mine")),
    enabled: role === "agency",
  });
}

function useInvaliderForfaits() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: keys.packages.all });
}

export function useCreerForfait() {
  const invalider = useInvaliderForfaits();
  return useMutation({
    mutationFn: async (corps: CorpsForfait) =>
      packageSchema.parse(await api.post<unknown>("/api/packages", corps)),
    onSuccess: invalider,
  });
}

export function useModifierForfait(id: string) {
  const invalider = useInvaliderForfaits();
  return useMutation({
    mutationFn: async (corps: CorpsForfait) =>
      packageSchema.parse(
        await api.patch<unknown>(
          `/api/packages/${encodeURIComponent(id)}`,
          corps,
        ),
      ),
    onSuccess: invalider,
  });
}

export function useCloturerForfait() {
  const invalider = useInvaliderForfaits();
  return useMutation({
    mutationFn: async (id: string) =>
      packageSchema.parse(
        await api.patch<unknown>(
          `/api/packages/${encodeURIComponent(id)}/close`,
        ),
      ),
    onSuccess: invalider,
  });
}
