"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api, construireUrl } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";

/**
 * `AccountingExportShape` (`oumra-hajj-backend/src/types/payment.types.ts`,
 * idée #57, lu le 2026-10-08) — journal des encaissements (`ENC`, débit)
 * et remboursements (`REM`, crédit) de l'agence sur une période. Montants
 * tels qu'enregistrés par le backend, jamais recalculés ici.
 */
export const accountingEntrySchema = z.object({
  date: z.string(),
  journal: z.enum(["ENC", "REM"]),
  pieceRef: z.string(),
  label: z.string(),
  debit: z.number(),
  credit: z.number(),
  currency: z.string(),
  method: z.enum(["mobile_money_orange", "mobile_money_mtn", "card"]),
  providerReference: z.string(),
  bookingId: z.string(),
  installmentNumber: z.number(),
  pilgrimName: z.string(),
  packageTitle: z.string(),
});

export const accountingExportSchema = z.object({
  from: z.string(),
  to: z.string(),
  currency: z.string(),
  totalCollected: z.number(),
  totalRefunded: z.number(),
  net: z.number(),
  entries: z.array(accountingEntrySchema),
});

export type AccountingEntry = z.infer<typeof accountingEntrySchema>;

/** Bornes `AAAA-MM-JJ` incluses ; absentes : mois en cours (backend). */
export interface PeriodeComptable {
  from?: string;
  to?: string;
}

/** Période inversée : inutile d'interroger le backend, qui la refuse. */
export function periodeValide({ from, to }: PeriodeComptable): boolean {
  return !from || !to || from <= to;
}

export function useJournalComptable(periode: PeriodeComptable) {
  return useQuery({
    enabled: periodeValide(periode),
    queryKey: keys.payments.accounting({ ...periode }),
    queryFn: async () =>
      accountingExportSchema.parse(
        await api.get<unknown>("/api/payments/agency/accounting", {
          params: { ...periode },
        }),
      ),
  });
}

/** Même journal en CSV (Excel FR / Sage) ; le proxy relaie le nom du fichier. */
export function lienCsvComptable(periode: PeriodeComptable): string {
  return construireUrl("/api/payments/agency/accounting/csv", { ...periode });
}
