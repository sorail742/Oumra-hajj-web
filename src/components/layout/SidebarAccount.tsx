"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight, UserRound } from "lucide-react";
import { initiales, useCurrentUser } from "@/lib/auth/use-current-user";
import { useRole } from "@/lib/auth/role-context";

/**
 * Pied de la barre latérale : la personne connectée (`GET /users/me`) et
 * l'accès à son profil. Le menu complet (déconnexion) reste dans l'en-tête.
 */
export function SidebarAccount({
  onNavigate,
}: Readonly<{ onNavigate?: () => void }>) {
  const t = useTranslations("nav");
  const role = useRole();
  const { data: utilisateur } = useCurrentUser();
  const nom = utilisateur?.fullName ?? "";

  return (
    <Link
      href="/profile"
      onClick={onNavigate}
      aria-label={t("profile")}
      className="hover:bg-sidebar-hover flex items-center gap-3 rounded-lg p-2 transition-colors duration-(--motion-fast)"
    >
      <span className="bg-primary-subtle text-primary inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
        {nom ? initiales(nom) : <UserRound aria-hidden className="size-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-sidebar-accent-foreground block truncate text-sm font-medium">
          {nom || t("profile")}
        </span>
        <span className="text-sidebar-muted block truncate text-xs">
          {utilisateur?.email ?? (role ? t(`roles.${role}`) : "")}
        </span>
      </span>
      <ChevronRight aria-hidden className="text-sidebar-muted size-4" />
    </Link>
  );
}
