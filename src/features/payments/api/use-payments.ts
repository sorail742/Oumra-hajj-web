"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import { bookingStatusSchema, paymentSchema } from "./schemas";

/** `GET /payments/mine` (pèlerin) ou `GET /payments/agency` (agence) — même pattern que `useBookings`. */
export function usePayments() {
  const role = useRole();
  const chemin =
    role === "agency" ? "/api/payments/agency" : "/api/payments/mine";
  const cle = role === "agency" ? keys.payments.agency() : keys.payments.mine();

  return useQuery({
    queryKey: cle,
    queryFn: async () => {
      const donnees = await api.get<unknown>(chemin);
      return z.array(paymentSchema).parse(donnees);
    },
    enabled: role === "agency" || role === "pilgrim",
  });
}

/** Statut de la réservation associée à un paiement — pour `RefundRequestFlow` uniquement, voir `schemas.ts`. */
export function useBookingStatusForRefund(bookingId: string, actif: boolean) {
  return useQuery({
    queryKey: keys.payments.bookingStatus(bookingId),
    queryFn: async () => {
      const donnees = await api.get<unknown>(`/api/bookings/${bookingId}`);
      return bookingStatusSchema.parse(donnees).status;
    },
    enabled: actif,
  });
}

/**
 * `POST /payments/:id/refund` — sans corps : le montant est calculé côté
 * serveur à partir du barème réel (voir `lib/refund-policy.ts`), jamais
 * envoyé par le client.
 */
export function useRequestRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      const donnees = await api.post<unknown>(
        `/api/payments/${paymentId}/refund`,
      );
      return paymentSchema.parse(donnees);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.payments.all });
    },
  });
}
