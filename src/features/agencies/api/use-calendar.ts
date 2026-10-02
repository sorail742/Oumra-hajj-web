"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";

/**
 * `CalendarSubscriptionShape` (`Oumra-hadj-project/src/types/agency.types.ts`).
 * `subscriptionUrl` est un chemin relatif à l'origine du backend
 * (`/api/v1/calendar/agency/<jeton>/calendar.ics`), inutilisable tel quel par
 * un client calendrier : seul `token` sert à composer l'URL publiée.
 */
export const calendarSubscriptionSchema = z.object({
  token: z.string(),
  subscriptionUrl: z.string(),
});

export type CalendarSubscription = {
  token: string;
  /** URL absolue à coller dans Google Calendar / Outlook / Apple. */
  url: string;
};

/**
 * URL absolue du relais public `src/app/api/ics/agency/[token]/calendar.ics`,
 * sur l'origine de l'application — jamais celle du backend (ADR-0002).
 */
export function urlAbonnementCalendrier(
  token: string,
  origine: string,
): string {
  return `${origine}/api/ics/agency/${encodeURIComponent(token)}/calendar.ics`;
}

function versAbonnement(donnees: unknown): CalendarSubscription {
  const { token } = calendarSubscriptionSchema.parse(donnees);
  return { token, url: urlAbonnementCalendrier(token, window.location.origin) };
}

export function useCalendarSubscription() {
  const role = useRole();
  return useQuery({
    queryKey: keys.agencies.calendarSubscription(),
    queryFn: async () =>
      versAbonnement(
        await api.get<unknown>("/api/agencies/me/calendar-subscription"),
      ),
    enabled: role === "agency",
  });
}

export function useRegenerateCalendarSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      versAbonnement(
        await api.post<unknown>(
          "/api/agencies/me/calendar-subscription/regenerate",
        ),
      ),
    onSuccess: (abonnement) => {
      // L'ancien jeton est révoqué côté backend : remplacer immédiatement
      // le cache plutôt qu'invalider, pour ne jamais réafficher l'ancien lien.
      queryClient.setQueryData(
        keys.agencies.calendarSubscription(),
        abonnement,
      );
    },
  });
}
