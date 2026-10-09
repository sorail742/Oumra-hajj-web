"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { capacitySimulationSchema } from "./schemas";

export function useSimulationCapacite(
  pilgrimsPerGuide: number,
  extraGuides: number,
) {
  return useQuery({
    queryKey: keys.capacity.simulation({ pilgrimsPerGuide, extraGuides }),
    queryFn: async () =>
      capacitySimulationSchema.parse(
        await api.get<unknown>("/api/capacity/simulation", {
          params: { pilgrimsPerGuide, extraGuides },
        }),
      ),
    // Les hypothèses changent au clavier : garder le résultat précédent.
    placeholderData: keepPreviousData,
  });
}
