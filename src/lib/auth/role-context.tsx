"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Role } from "./permissions";

/**
 * Identité de l'utilisateur courant, côté client — rôle pour `<Can>` et la
 * navigation, `userId` pour aligner un message envoyé/reçu dans
 * `ConversationView`. Posée une fois par rendu serveur (voir
 * `app/layout.tsx`, qui décode le payload depuis le cookie d'accès via
 * `lib/auth/jwt.ts`) et propagée ici en contexte plutôt que redécodée dans
 * chaque composant client. **Ne remplace jamais une vérification backend**
 * (voir `CLAUDE.md`, règle 12) — aucune route `/me` n'existe à ce jour pour
 * rafraîchir cette identité en cours de session sans navigation.
 */
interface SessionIdentite {
  role: Role | undefined;
  userId: string | undefined;
}

const SessionContext = createContext<SessionIdentite>({
  role: undefined,
  userId: undefined,
});

export function RoleProvider({
  role,
  userId = undefined,
  children,
}: { children: ReactNode } & Partial<SessionIdentite>) {
  return (
    <SessionContext.Provider value={{ role, userId }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useRole(): Role | undefined {
  return useContext(SessionContext).role;
}

export function useUserId(): string | undefined {
  return useContext(SessionContext).userId;
}
