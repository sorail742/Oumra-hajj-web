"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import { checklistItemSchema, type ChecklistItem } from "./schemas";

/** Checklist de départ d'une réservation (ticket #56) — pèlerin seulement. */
export function useChecklist(bookingId: string) {
  const role = useRole();
  return useQuery({
    queryKey: keys.checklist.byBooking(bookingId),
    queryFn: async () => {
      const donnees = await api.get<unknown>(
        `/api/checklist/bookings/${bookingId}`,
      );
      return z.array(checklistItemSchema).parse(donnees);
    },
    enabled: role === "pilgrim",
  });
}

/** Coche ou décoche un élément ; la liste en cache est mise à jour en place. */
export function useBasculerElement(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      isCompleted,
    }: Pick<ChecklistItem, "id" | "isCompleted">) =>
      checklistItemSchema.parse(
        await api.patch<unknown>(`/api/checklist/${id}/status`, {
          isCompleted,
        }),
      ),
    onSuccess: (element) =>
      queryClient.setQueryData<ChecklistItem[]>(
        keys.checklist.byBooking(bookingId),
        (liste) => liste?.map((e) => (e.id === element.id ? element : e)),
      ),
  });
}
