"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { packageSchema, type PackageFilters } from "./schemas";

/**
 * `GET /packages` — public (`listPublic`), filtres dans l'URL côté écran
 * (voir `CLAUDE.md` règle 8), validé à la frontière par zod (voir
 * `docs/socle-frontend.md` §4).
 */
export function usePackages(filters: PackageFilters) {
  return useQuery({
    queryKey: keys.packages.list(filters),
    queryFn: async () => {
      const donnees = await api.get<unknown>("/api/packages", {
        params: filters,
      });
      return z.array(packageSchema).parse(donnees);
    },
  });
}

/** `GET /packages/:id` — public (`findByIdOrFail`, 404 si inconnu). */
export function usePackage(id: string) {
  return useQuery({
    queryKey: keys.packages.detail(id),
    queryFn: async () =>
      packageSchema.parse(
        await api.get<unknown>(`/api/packages/${encodeURIComponent(id)}`),
      ),
  });
}
