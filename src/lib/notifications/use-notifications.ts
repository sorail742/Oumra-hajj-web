"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";

/**
 * Notifications de l'utilisateur connecté (ticket #68) — `GET
 * /notifications?unreadOnly=` et `PATCH /notifications/:id/read`. Dans
 * `lib/` et non `features/` : la cloche de l'en-tête (coquille) et l'écran
 * `/notifications` s'en servent tous deux.
 *
 * `NotificationShape` (`src/types/notification.types.ts` du backend, relu
 * le 2026-10-02) ; `readAt` absent du JSON tant que non lue.
 */
export const notificationSchema = z.object({
  id: z.string(),
  type: z.enum([
    "booking_status",
    "payment",
    "document",
    "rite_reminder",
    "sos",
    "group_message",
    "moderation",
    "other",
  ]),
  title: z.string(),
  content: z.string(),
  isCritical: z.boolean(),
  readAt: z.string().optional(),
  createdAt: z.string(),
});
export type AppNotification = z.infer<typeof notificationSchema>;

/** Rafraîchissement de la cloche : pas de temps réel côté backend (#86). */
const INTERVALLE_RAFRAICHISSEMENT_MS = 60_000;

export function useNotifications(unreadOnly = false) {
  const role = useRole();
  return useQuery({
    queryKey: keys.notifications.list({ unreadOnly }),
    queryFn: async () => {
      const donnees = await api.get<unknown>("/api/notifications", {
        params: unreadOnly ? { unreadOnly: true } : undefined,
      });
      return z.array(notificationSchema).parse(donnees);
    },
    enabled: role !== undefined,
    refetchInterval: unreadOnly ? INTERVALLE_RAFRAICHISSEMENT_MS : false,
  });
}

export function useMarquerLue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      notificationSchema.parse(
        await api.patch<unknown>(
          `/api/notifications/${encodeURIComponent(id)}/read`,
        ),
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: keys.notifications.all }),
  });
}

/** Pas de route « tout marquer » côté backend : une requête par notification. */
export function useToutMarquerLu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: readonly string[]) => {
      await Promise.all(
        ids.map((id) =>
          api.patch<unknown>(
            `/api/notifications/${encodeURIComponent(id)}/read`,
          ),
        ),
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: keys.notifications.all }),
  });
}
