"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import { expiryAlertSchema } from "./schemas";

/** Alertes d'expiration des pièces (ticket #57) — pèlerin et agence. */
async function chargerAlertes(bookingId: string) {
  const donnees = await api.get<unknown>("/api/documents/expiry-alerts", {
    params: { bookingId },
  });
  return z.array(expiryAlertSchema).parse(donnees);
}

function autorise(role: string | undefined): boolean {
  return role === "pilgrim" || role === "agency";
}

export function useExpiryAlerts(bookingId: string) {
  const role = useRole();
  return useQuery({
    queryKey: keys.documents.expiryAlerts(bookingId),
    queryFn: () => chargerAlertes(bookingId),
    enabled: autorise(role),
  });
}

/** Alertes de plusieurs dossiers à la fois (écran `/documents`). */
export function useExpiryAlertsForBookings(bookingIds: readonly string[]) {
  const role = useRole();
  return useQueries({
    queries: bookingIds.map((bookingId) => ({
      queryKey: keys.documents.expiryAlerts(bookingId),
      queryFn: () => chargerAlertes(bookingId),
      enabled: autorise(role),
    })),
    combine: (resultats) => resultats.flatMap((r) => r.data ?? []),
  });
}
