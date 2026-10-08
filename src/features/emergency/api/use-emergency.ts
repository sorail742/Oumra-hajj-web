"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import {
  emergencyNumberSchema,
  myEmergencyContactsSchema,
  type EmergencyNumber,
} from "./schemas";

/** `GET /emergency/numbers` — public, saisi par l'administration. */
export function useEmergencyNumbers() {
  return useQuery({
    queryKey: keys.emergency.numbers(),
    queryFn: async () =>
      z
        .array(emergencyNumberSchema)
        .parse(await api.get<unknown>("/api/emergency/numbers")),
  });
}

/** `GET /emergency/contacts/mine` — pèlerin et guide seulement. */
export function useMyEmergencyContacts() {
  const role = useRole();
  return useQuery({
    queryKey: keys.emergency.contacts(),
    queryFn: async () =>
      myEmergencyContactsSchema.parse(
        await api.get<unknown>("/api/emergency/contacts/mine"),
      ),
    enabled: role === "pilgrim" || role === "guide",
  });
}

export type SaisieNumero = Omit<EmergencyNumber, "id">;

/** Création (`POST`) ou modification (`PATCH`) — administrateur. */
export function useEnregistrerNumero(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (numero: SaisieNumero) =>
      emergencyNumberSchema.parse(
        id
          ? await api.patch<unknown>(
              `/api/emergency/numbers/${encodeURIComponent(id)}`,
              numero,
            )
          : await api.post<unknown>("/api/emergency/numbers", numero),
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: keys.emergency.numbers() }),
  });
}

export function useSupprimerNumero(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.delete<unknown>(`/api/emergency/numbers/${encodeURIComponent(id)}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: keys.emergency.numbers() }),
  });
}
