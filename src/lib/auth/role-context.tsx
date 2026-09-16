"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Role } from "./permissions";

/**
 * Rôle de l'utilisateur courant, côté client — pour `<Can>` et la
 * navigation uniquement. Posé une fois par rendu serveur (voir
 * `app/layout.tsx`, qui décode le rôle depuis le cookie d'accès via
 * `lib/auth/jwt.ts`) et propagé ici en contexte plutôt que redécodé dans
 * chaque composant client. **Ne remplace jamais une vérification backend**
 * (voir `CLAUDE.md`, règle 12) — aucune route `/me` n'existe à ce jour pour
 * rafraîchir ce rôle en cours de session sans navigation.
 */
const RoleContext = createContext<Role | undefined>(undefined);

export function RoleProvider({
  role,
  children,
}: {
  role: Role | undefined;
  children: ReactNode;
}) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

export function useRole(): Role | undefined {
  return useContext(RoleContext);
}
