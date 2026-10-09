"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { seasonComparisonSchema } from "./schemas";

export function useComparatifSaisons(fromYear: number, toYear: number) {
  return useQuery({
    queryKey: keys.seasons.comparison({ fromYear, toYear }),
    queryFn: async () =>
      seasonComparisonSchema.parse(
        await api.get<unknown>("/api/seasons/comparison", {
          params: { fromYear, toYear },
        }),
      ),
    placeholderData: keepPreviousData,
  });
}
