"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import { bookingSchema, type DossierStep } from "./schemas";

/**
 * Pas de `GET /bookings` unique : `GET /bookings/mine` (pèlerin) et
 * `GET /bookings/agency` (agence) sont deux routes distinctes, toutes deux
 * authentifiées (voir `openapi.json`). Ce hook choisit la bonne selon le
 * rôle courant plutôt que de laisser chaque écran le faire.
 */
export function useBookings() {
  const role = useRole();
  const chemin =
    role === "agency" ? "/api/bookings/agency" : "/api/bookings/mine";

  return useQuery({
    queryKey: keys.bookings.list({ role }),
    queryFn: async () => {
      const donnees = await api.get<unknown>(chemin);
      return z.array(bookingSchema).parse(donnees);
    },
    enabled: role === "agency" || role === "pilgrim",
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: keys.bookings.detail(id),
    queryFn: async () => {
      const donnees = await api.get<unknown>(`/api/bookings/${id}`);
      return bookingSchema.parse(donnees);
    },
  });
}

/**
 * `POST /bookings` (pèlerin) — le backend réserve la place, crée les cinq
 * étapes du dossier et la checklist de préparation. Invalide les forfaits
 * (places prises) et les réservations.
 */
export function useCreerReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (packageId: string) =>
      bookingSchema.parse(
        await api.post<unknown>("/api/bookings", { packageId }),
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.packages.all }),
        queryClient.invalidateQueries({ queryKey: keys.bookings.all }),
      ]),
  });
}

/** `PATCH /bookings/:id/step` (agence) — met à jour une étape du dossier. */
export function useMettreAJourEtape(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (etape: Pick<DossierStep, "key" | "status">) =>
      bookingSchema.parse(
        await api.patch<unknown>(
          `/api/bookings/${encodeURIComponent(bookingId)}/step`,
          etape,
        ),
      ),
    onSuccess: (reservation) => {
      queryClient.setQueryData(keys.bookings.detail(bookingId), reservation);
      return queryClient.invalidateQueries({ queryKey: keys.bookings.all });
    },
  });
}

/** `PATCH /bookings/:id/cancel` (pèlerin) — libère la place côté backend. */
export function useAnnulerReservation(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      bookingSchema.parse(
        await api.patch<unknown>(
          `/api/bookings/${encodeURIComponent(bookingId)}/cancel`,
        ),
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.bookings.all }),
        queryClient.invalidateQueries({ queryKey: keys.packages.all }),
      ]),
  });
}

/**
 * `PATCH /bookings/:id/group` (agence, ticket #54) — rattache la
 * réservation à un groupe : le backend ajoute le pèlerin aux membres du
 * groupe (seul moyen d'en ajouter un). Invalide aussi les groupes.
 */
export function useRattacherGroupe(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) =>
      bookingSchema.parse(
        await api.patch<unknown>(
          `/api/bookings/${encodeURIComponent(bookingId)}/group`,
          { groupId },
        ),
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.bookings.all }),
        queryClient.invalidateQueries({ queryKey: keys.groups.all }),
      ]),
  });
}
