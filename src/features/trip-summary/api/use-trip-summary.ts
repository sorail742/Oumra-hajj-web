"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { tripSummarySchema } from "./schemas";

export function useTripSummary(bookingId: string) {
  return useQuery({
    queryKey: keys.bookings.tripSummary(bookingId),
    queryFn: async () => {
      const data = await api.get<unknown>(`/api/trip-summary/${bookingId}`);
      return tripSummarySchema.parse(data);
    },
  });
}
