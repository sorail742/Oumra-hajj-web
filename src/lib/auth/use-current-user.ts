"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { roleSchema } from "./permissions";
import { useRole } from "./role-context";

/**
 * Identité de l'utilisateur courant — `GET /users/me` / `PATCH /users/me`
 * (`UserShape` backend). Partagé (en-tête, profil, tableau de bord) : vit
 * dans `lib/`, pas dans un `features/*`.
 *
 * `passportNumber` et `bloodType` sont des données sensibles : jamais
 * journalisées ; le cache est vidé à chaque ouverture et fermeture de
 * session (`use-auth.ts`, `LogoutButton`).
 */

export const contactUrgenceSchema = z.object({
  fullName: z.string(),
  phone: z.string(),
  relationship: z.string().optional(),
});

export const utilisateurSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
  role: roleSchema,
  preferredLanguage: z.string(),
  emergencyContact: contactUrgenceSchema.optional(),
  bloodType: z.string().optional(),
  passportNumber: z.string().optional(),
  agencyId: z.string().optional(),
  isActive: z.boolean(),
});

export type Utilisateur = z.infer<typeof utilisateurSchema>;

export interface MiseAJourProfil {
  fullName?: string;
  emergencyContact?: z.infer<typeof contactUrgenceSchema>;
  bloodType?: string;
  passportNumber?: string;
}

export function useCurrentUser() {
  const role = useRole();
  return useQuery({
    queryKey: keys.auth.me(),
    queryFn: async () =>
      utilisateurSchema.parse(await api.get<unknown>("/api/users/me")),
    enabled: role !== undefined,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMettreAJourProfil() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (miseAJour: MiseAJourProfil) =>
      utilisateurSchema.parse(
        await api.patch<unknown>("/api/users/me", miseAJour),
      ),
    onSuccess: (utilisateur) => {
      queryClient.setQueryData(keys.auth.me(), utilisateur);
    },
  });
}

/** Initiales pour l'avatar : « Aminata Diallo » → « AD ». */
export function initiales(nom: string): string {
  // Étiquettes entre crochets (« [DÉMO] ») ignorées ; première lettre de
  // chaque mot restant : « [DÉMO] Mariama Diallo » → « MD ».
  const lettres = nom
    .trim()
    .split(/\s+/)
    .filter((mot) => !/^\[.*\]$/.test(mot))
    .map((mot) => mot.match(/\p{L}/u)?.[0])
    .filter((lettre) => lettre !== undefined);
  const premiere = lettres[0] ?? "";
  const derniere = lettres.length > 1 ? (lettres.at(-1) ?? "") : "";
  return `${premiere}${derniere}`.toUpperCase() || "?";
}
