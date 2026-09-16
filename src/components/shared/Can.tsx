"use client";

import type { ReactNode } from "react";
import { hasRole, type ModeCan, type Role } from "@/lib/auth/permissions";
import { useRole } from "@/lib/auth/role-context";

/**
 * Garde par rôle — voir `CLAUDE.md` règle 5. **Ne remplace jamais une
 * vérification backend** (règle 12) : un contournement client-side ne
 * donne jamais accès à une donnée que le backend refuserait.
 */
export interface CanProps {
  role: Role | Role[];
  mode?: ModeCan;
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({
  role,
  mode = "any",
  fallback = null,
  children,
}: CanProps) {
  const roleActuel = useRole();
  return hasRole(roleActuel, role, mode) ? <>{children}</> : <>{fallback}</>;
}
