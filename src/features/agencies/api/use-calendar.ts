"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";

export const calendarSubscriptionSchema = z.object({
  url: z.string(),
});

export type CalendarSubscription = z.infer<typeof calendarSubscriptionSchema>;

export function useCalendarSubscription() {
  const role = useRole();
  return useQuery({
    queryKey: keys.agencies.calendarSubscription(),
    queryFn: async () => {
      const data = await api.get<unknown>(
        "/api/agencies/me/calendar-subscription",
      );
      return calendarSubscriptionSchema.parse(data);
    },
    enabled: role === "agency",
  });
}

export function useRegenerateCalendarSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const data = await api.post<unknown>(
        "/api/agencies/me/calendar-subscription/regenerate",
      );
      return calendarSubscriptionSchema.parse(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(keys.agencies.calendarSubscription(), data);
    },
  });
}
