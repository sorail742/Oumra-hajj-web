"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import { riteProgressSchema, riteSheetSchema } from "./schemas";

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
