"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import {
  myOnCallSchema,
  onCallCoverageSchema,
  onCallShiftSchema,
  type NouveauCreneau,
} from "./schemas";

/** Créneaux à venir de l'agence ; avec un forfait, aussi ceux de tous les voyages. */
export function useCreneaux(packageId: string | undefined) {
  return useQuery({
    queryKey: keys.onCall.shifts({ packageId }),
    queryFn: async () =>
      z.array(onCallShiftSchema).parse(
        await api.get<unknown>("/api/on-call/shifts", {
          params: { packageId },
        }),
      ),
  });
}

export function useCouverture(packageId: string) {
  return useQuery({
    queryKey: keys.onCall.coverage(packageId),
    queryFn: async () =>
      onCallCoverageSchema.parse(
        await api.get<unknown>(
          `/api/on-call/coverage/${encodeURIComponent(packageId)}`,
        ),
      ),
  });
}

/** Qui appeler maintenant, pour une réservation du pèlerin. */
export function useAstreinteReservation(bookingId: string | undefined) {
  return useQuery({
    queryKey: keys.onCall.booking(bookingId ?? ""),
    queryFn: async () =>
      myOnCallSchema.parse(
        await api.get<unknown>(
          `/api/on-call/booking/${encodeURIComponent(bookingId ?? "")}`,
        ),
      ),
    enabled: Boolean(bookingId),
    // Le contact en cours change au fil des créneaux.
    refetchInterval: 5 * 60 * 1000,
  });
}

/** Toute écriture rafraîchit créneaux et couverture. */
function useEcritureCreneau<V>(appel: (variables: V) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: appel,
    onSuccess: () => client.invalidateQueries({ queryKey: keys.onCall.all }),
  });
}

export function useCreerCreneau() {
  return useEcritureCreneau((creneau: NouveauCreneau) =>
    api.post<unknown>("/api/on-call/shifts", creneau),
  );
}

export function useSupprimerCreneau() {
  return useEcritureCreneau((id: string) =>
    api.delete<unknown>(`/api/on-call/shifts/${encodeURIComponent(id)}`),
  );
}
