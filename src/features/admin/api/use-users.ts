"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";

/**
 * Gestion des utilisateurs par l'administrateur (ticket #74) —
 * `GET /users?role=`, `PATCH /users/:id/suspend|reactivate`.
 *
 * `UserShape` du backend expose aussi groupe sanguin, numéro de passeport
 * et contact d'urgence : volontairement **hors schéma**, zod les retire —
 * une liste d'administration n'a pas à faire circuler ces données.
 */
export const ROLES_UTILISATEUR = [
  "pilgrim",
  "guide",
  "agency",
  "admin",
] as const;
export type RoleUtilisateur = (typeof ROLES_UTILISATEUR)[number];

export const adminUserSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
  role: z.enum(ROLES_UTILISATEUR),
  isActive: z.boolean(),
  createdAt: z.string(),
});
export type AdminUser = z.infer<typeof adminUserSchema>;

export function useUsers(role: RoleUtilisateur) {
  const roleCourant = useRole();
  return useQuery({
    queryKey: keys.admin.users({ role }),
    queryFn: async () =>
      z
        .array(adminUserSchema)
        .parse(await api.get<unknown>("/api/users", { params: { role } })),
    enabled: roleCourant === "admin",
  });
}

export function useChangerStatutCompte() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, actif }: { id: string; actif: boolean }) =>
      adminUserSchema.parse(
        await api.patch<unknown>(
          `/api/users/${encodeURIComponent(id)}/${actif ? "reactivate" : "suspend"}`,
        ),
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...keys.admin.all, "users"],
      }),
  });
}
