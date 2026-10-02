"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronDown, UserRound } from "lucide-react";
import { formatTelephone } from "@/lib/format";
import { initiales, useCurrentUser } from "@/lib/auth/use-current-user";
import { useRole } from "@/lib/auth/role-context";
import { LogoutButton } from "./LogoutButton";

/**
 * Menu du compte (ticket #29) : nom et rôle (`GET /users/me`), accès au
 * profil, déconnexion. Fermé par Échap, par un clic à l'extérieur ou au
 * choix d'une entrée. Le rôle affiché vient du JWT, comme `<Can>`.
 */
export function UserMenu() {
  const t = useTranslations("nav");
  const role = useRole();
  const { data: utilisateur } = useCurrentUser();
  const [ouvert, setOuvert] = useState(false);
  const conteneur = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ouvert) return undefined;
    const surClic = (evenement: MouseEvent) => {
      if (!conteneur.current?.contains(evenement.target as Node))
        setOuvert(false);
    };
    const surTouche = (evenement: KeyboardEvent) => {
      if (evenement.key === "Escape") setOuvert(false);
    };
    document.addEventListener("mousedown", surClic);
    document.addEventListener("keydown", surTouche);
    return () => {
      document.removeEventListener("mousedown", surClic);
      document.removeEventListener("keydown", surTouche);
    };
  }, [ouvert]);

  const nom = utilisateur?.fullName ?? "";
  const libelleRole = role ? t(`roles.${role}`) : "";

  return (
    <div ref={conteneur} className="relative">
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-haspopup="menu"
        aria-label={t("accountMenu")}
        className="hover:bg-muted flex items-center gap-2 rounded-full py-1 pr-2 pl-1"
      >
        <span className="bg-primary text-primary-foreground inline-flex size-8 items-center justify-center rounded-full text-xs font-semibold">
          {nom ? initiales(nom) : <UserRound aria-hidden className="size-4" />}
        </span>
        <span className="hidden max-w-40 truncate text-sm font-medium sm:inline">
          {nom || libelleRole}
        </span>
        <ChevronDown aria-hidden className="text-muted-foreground size-4" />
      </button>
      {ouvert && (
        <div
          role="menu"
          className="bg-popover text-popover-foreground absolute right-0 z-40 mt-2 w-64 rounded-lg border p-2 shadow-(--shadow-overlay)"
        >
          <div className="border-b px-2 pt-1 pb-3">
            <p className="truncate text-sm font-semibold">{nom}</p>
            {utilisateur?.email && (
              <p className="text-muted-foreground truncate text-xs">
                {utilisateur.email}
              </p>
            )}
            {utilisateur?.phone && (
              <p className="text-muted-foreground truncate font-mono text-xs">
                {formatTelephone(utilisateur.phone)}
              </p>
            )}
            {libelleRole && (
              <span className="bg-primary-subtle text-primary mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium">
                {libelleRole}
              </span>
            )}
          </div>
          <div className="pt-2">
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOuvert(false)}
              className="hover:bg-muted flex h-9 items-center gap-2 rounded-md px-3 text-sm"
            >
              <UserRound aria-hidden className="size-4" />
              {t("profile")}
            </Link>
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
