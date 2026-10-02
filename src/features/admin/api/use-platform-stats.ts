"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import { platformStatsSchema } from "./schemas";

/** Statistiques de la plateforme (ticket #69) — administrateur seulement. */
export function usePlatformStats() {
  const role = useRole();
  return useQuery({
    queryKey: keys.admin.stats(),
    queryFn: async () =>
      platformStatsSchema.parse(await api.get<unknown>("/api/admin/stats")),
    enabled: role === "admin",
  });
}
