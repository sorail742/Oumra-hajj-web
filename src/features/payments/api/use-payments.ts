"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import { bookingStatusSchema, paymentSchema, type Payment } from "./schemas";

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

/** Corps de `POST /payments/initiate` (`InitiatePaymentDto`). */
export interface DemandePaiement {
  bookingId: string;
  amount: number;
  method: Payment["method"];
}

/**
 * Lance un paiement : le backend le crée en `pending` et renvoie sa
 * `providerReference`. Le statut n'est **jamais** déduit côté client — il
 * n'évolue que par le webhook du fournisseur (ADR 0006 backend), suivi par
 * `usePaymentStatus`. Le montant n'est ni journalisé ni conservé hors du
 * cache de requête.
 */
export function useInitiatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (demande: DemandePaiement) =>
      paymentSchema.parse(
        await api.post<unknown>("/api/payments/initiate", demande),
      ),
    onSuccess: (paiement) => {
      queryClient.setQueryData(keys.payments.detail(paiement.id), paiement);
      void queryClient.invalidateQueries({ queryKey: keys.payments.mine() });
    },
  });
}

/** Intervalle de rafraîchissement du statut tant que le paiement est `pending`. */
export const INTERVALLE_SUIVI_MS = 5_000;
/** Au-delà, on cesse d'interroger : le paiement apparaîtra dans la liste une fois confirmé. */
export const DUREE_MAX_SUIVI_MS = 15 * 60_000;

/**
 * Suivi du statut d'un paiement (`GET /payments/:id`) : rafraîchi toutes les
 * 5 s tant qu'il est `pending`, arrêté dès qu'il est résolu ou après
 * `DUREE_MAX_SUIVI_MS` depuis `debut`.
 */
export function usePaymentStatus(paymentId: string, debut: number) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: keys.payments.detail(paymentId),
    queryFn: async () => {
      const paiement = paymentSchema.parse(
        await api.get<unknown>(`/api/payments/${paymentId}`),
      );
      if (paiement.status !== "pending") {
        void queryClient.invalidateQueries({ queryKey: keys.payments.mine() });
      }
      return paiement;
    },
    refetchInterval: (query) =>
      query.state.data?.status === "pending" &&
      Date.now() - debut < DUREE_MAX_SUIVI_MS
        ? INTERVALLE_SUIVI_MS
        : false,
    refetchIntervalInBackground: false,
  });
}
