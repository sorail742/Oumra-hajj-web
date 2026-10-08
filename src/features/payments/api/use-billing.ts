"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { refundTierSchema } from "./use-refund-policy";

/**
 * Facture et contrat d'une réservation (idée #37 — `InvoiceShape`,
 * `ContractShape`, `oumra-hajj-backend/src/types/billing.types.ts`, lu le
 * 2026-10-08). La facture est émise par le backend à la première lecture
 * (numéro définitif) ; montants jamais recalculés ici.
 */
const partySchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  taxId: z.string().optional(),
  tradeRegister: z.string().optional(),
});

const methode = z.enum(["mobile_money_orange", "mobile_money_mtn", "card"]);

export const invoiceSchema = z.object({
  number: z.string(),
  issuedAt: z.string(),
  bookingId: z.string(),
  seller: partySchema,
  buyer: partySchema,
  packageTitle: z.string(),
  packageType: z.enum(["oumra", "hadj"]),
  startDate: z.string(),
  endDate: z.string(),
  totalAmount: z.number(),
  currency: z.string(),
  payments: z.array(
    z.object({
      date: z.string(),
      amount: z.number(),
      method: methode,
      status: z.enum(["pending", "succeeded", "failed", "refunded"]),
      receiptRef: z.string().optional(),
      refundedAmount: z.number().optional(),
    }),
  ),
  paid: z.number(),
  refunded: z.number(),
  balanceDue: z.number(),
});

export const contractSchema = z.object({
  bookingId: z.string(),
  generatedAt: z.string(),
  bookedAt: z.string(),
  agency: partySchema,
  pilgrim: partySchema,
  packageTitle: z.string(),
  packageType: z.enum(["oumra", "hadj"]),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  stages: z.array(
    z.object({
      city: z.string(),
      hotelName: z.string(),
      distanceToMosqueMeters: z.number().optional(),
      startDate: z.string(),
      endDate: z.string(),
    }),
  ),
  inclusions: z.array(z.string()),
  price: z.number(),
  currency: z.string(),
  balanceDueDate: z.string(),
  refundTiers: z.array(refundTierSchema),
});

export type Invoice = z.infer<typeof invoiceSchema>;
export type Contract = z.infer<typeof contractSchema>;
export type BillingParty = z.infer<typeof partySchema>;

export function useFacture(bookingId: string) {
  return useQuery({
    queryKey: keys.payments.invoice(bookingId),
    queryFn: async () =>
      invoiceSchema.parse(
        await api.get<unknown>(
          `/api/bookings/${encodeURIComponent(bookingId)}/invoice`,
        ),
      ),
  });
}

export function useContrat(bookingId: string) {
  return useQuery({
    queryKey: keys.payments.contract(bookingId),
    queryFn: async () =>
      contractSchema.parse(
        await api.get<unknown>(
          `/api/bookings/${encodeURIComponent(bookingId)}/contract`,
        ),
      ),
  });
}
