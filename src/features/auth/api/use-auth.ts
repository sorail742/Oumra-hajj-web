"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

/**
 * Mutations d'authentification. Les deux ouvertures de session passent par
 * les Route Handlers `/api/session/*` (cookies `httpOnly`, ADR-0002) ; la
 * demande de code et l'inscription agence ne renvoient aucun jeton et
 * passent par le proxy générique.
 *
 * Toute ouverture de session vide le cache TanStack Query : rien d'un
 * compte précédent ne doit rester affiché au suivant.
 */

interface SessionOuverte {
  role: string | null;
}

export interface IdentifiantsAgence {
  email: string;
  password: string;
}

export interface VerificationCode {
  phone: string;
  code: string;
  fullName?: string;
}

export interface InscriptionAgence {
  legalName: string;
  contactEmail: string;
  contactPhone: string;
  password: string;
  address?: string;
}

export function useConnexionAgence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (identifiants: IdentifiantsAgence) =>
      api.post<SessionOuverte>("/api/session/agency", identifiants),
    onSuccess: () => queryClient.clear(),
  });
}

export function useDemandeCode() {
  return useMutation({
    mutationFn: (phone: string) =>
      api.post<unknown>("/api/auth/otp/request", { phone }),
  });
}

export function useVerificationCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (verification: VerificationCode) =>
      api.post<SessionOuverte>("/api/session/otp", verification),
    onSuccess: () => queryClient.clear(),
  });
}

export function useInscriptionAgence() {
  return useMutation({
    mutationFn: (inscription: InscriptionAgence) =>
      api.post<unknown>("/api/agencies/register", inscription),
  });
}
