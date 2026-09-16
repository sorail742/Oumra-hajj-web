"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import { bookingSchema } from "./schemas";

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
