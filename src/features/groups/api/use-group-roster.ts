"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";

/**
 * `GroupRosterShape` (`oumra-hajj-backend/src/types/group.types.ts`,
 * idée #41, lu le 2026-10-08) — agence propriétaire et guide du groupe.
 * Contient des besoins spéciaux (données de santé, idée #69) : jamais
 * gardé en cache une fois la section fermée (`gcTime: 0`), jamais
 * journalisé.
 */
export const groupRosterMemberSchema = z.object({
  userId: z.string(),
  fullName: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
  bookingId: z.string().optional(),
  bookingStatus: z
    .enum(["pending_payment", "confirmed", "cancelled", "completed"])
    .optional(),
  emergencyContact: z
    .object({
      fullName: z.string(),
      phone: z.string(),
      relationship: z.string().optional(),
    })
    .optional(),
  specialNeeds: z
    .object({
      mobility: z.enum(["none", "reduced", "wheelchair"]),
      dietary: z.string().optional(),
      medical: z.string().optional(),
      assistance: z.string().optional(),
    })
    .optional(),
});

export const groupRosterSchema = z.object({
  groupId: z.string(),
  groupTitle: z.string(),
  generatedAt: z.string(),
  members: z.array(groupRosterMemberSchema),
});

export type GroupRosterMember = z.infer<typeof groupRosterMemberSchema>;

export function useGroupRoster(groupId: string) {
  return useQuery({
    queryKey: keys.groups.roster(groupId),
    queryFn: async () =>
      groupRosterSchema.parse(
        await api.get<unknown>(
          `/api/groups/${encodeURIComponent(groupId)}/roster`,
        ),
      ),
    gcTime: 0,
  });
}

/** Téléchargement CSV : le proxy relaie `Content-Disposition`. */
export function lienCsvListe(groupId: string): string {
  return `/api/groups/${encodeURIComponent(groupId)}/roster/csv`;
}
