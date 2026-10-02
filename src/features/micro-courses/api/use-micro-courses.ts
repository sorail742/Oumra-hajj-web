"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import { microCourseProgressSchema, microCourseSchema } from "./schemas";

/** Micro-cours de préparation (ticket #82) — catalogue public. */
export function useMicroCourses(category?: string) {
  return useQuery({
    queryKey: keys.microCourses.list({ category }),
    queryFn: async () => {
      const donnees = await api.get<unknown>("/api/micro-courses", {
        params: { category },
      });
      return z
        .array(microCourseSchema)
        .parse(donnees)
        .sort((a, b) => a.order - b.order);
    },
  });
}

export function useMicroCourse(id: string) {
  return useQuery({
    queryKey: keys.microCourses.detail(id),
    queryFn: async () =>
      microCourseSchema.parse(
        await api.get<unknown>(`/api/micro-courses/${encodeURIComponent(id)}`),
      ),
  });
}

/** Progression du pèlerin connecté ; rien pour un visiteur ou un autre rôle. */
export function useMyMicroCourseProgress() {
  const role = useRole();
  return useQuery({
    queryKey: keys.microCourses.progress(),
    queryFn: async () =>
      z
        .array(microCourseProgressSchema)
        .parse(await api.get<unknown>("/api/micro-courses/progress/mine")),
    enabled: role === "pilgrim",
  });
}

/**
 * Marque un cours terminé (ou non) — même route de synchronisation par
 * lot que l'application mobile (ADR 0007), avec un seul élément horodaté.
 */
export function useMarquerCours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      isCompleted,
    }: {
      courseId: string;
      isCompleted: boolean;
    }) =>
      api.post<unknown>("/api/micro-courses/progress/sync", {
        items: [
          { courseId, isCompleted, clientUpdatedAt: new Date().toISOString() },
        ],
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: keys.microCourses.progress() }),
  });
}

export function estTermine(
  progression:
    readonly { courseId: string; isCompleted: boolean }[] | undefined,
  courseId: string,
): boolean {
  return (progression ?? []).some(
    (p) => p.courseId === courseId && p.isCompleted,
  );
}
