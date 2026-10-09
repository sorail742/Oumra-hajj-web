"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";

/**
 * Planning des guides (idée #42 — `GuideScheduleShape`,
 * `oumra-hajj-backend/src/types/guide-planning.types.ts`, lu le
 * 2026-10-08) : groupes et indisponibilités par guide, chevauchements
 * calculés par le backend.
 */
export const planningEntrySchema = z.object({
  kind: z.enum(["group", "unavailability"]),
  id: z.string(),
  label: z.string(),
  packageTitle: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
});

export const guideScheduleSchema = z.object({
  guideId: z.string(),
  guideName: z.string(),
  entries: z.array(planningEntrySchema),
  conflicts: z.array(
    z.object({
      firstId: z.string(),
      secondId: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    }),
  ),
});

export type GuideSchedule = z.infer<typeof guideScheduleSchema>;
export type PlanningEntry = z.infer<typeof planningEntrySchema>;

export interface Fenetre {
  from?: string;
  to?: string;
}

export function usePlanningAgence(fenetre: Fenetre) {
  return useQuery({
    queryKey: keys.guidePlanning.agency({ ...fenetre }),
    queryFn: async () =>
      z.array(guideScheduleSchema).parse(
        await api.get<unknown>("/api/guide-planning", {
          params: { ...fenetre },
        }),
      ),
  });
}

export function useMonPlanning(fenetre: Fenetre) {
  return useQuery({
    queryKey: keys.guidePlanning.mine({ ...fenetre }),
    queryFn: async () =>
      guideScheduleSchema.parse(
        await api.get<unknown>("/api/guide-planning/mine", {
          params: { ...fenetre },
        }),
      ),
  });
}

export interface NouvelleIndisponibilite {
  guideId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

function useEcriturePlanning<V>(appel: (v: V) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: appel,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: keys.guidePlanning.all }),
  });
}

export function useAjouterIndisponibilite() {
  return useEcriturePlanning((corps: NouvelleIndisponibilite) =>
    api.post<unknown>("/api/guide-planning/unavailabilities", corps),
  );
}

export function useSupprimerIndisponibilite() {
  return useEcriturePlanning((id: string) =>
    api.delete<unknown>(
      `/api/guide-planning/unavailabilities/${encodeURIComponent(id)}`,
    ),
  );
}
