import type { ReactNode } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Croissant } from "@/components/shared/illustrations/Geometrie";
import { decoderPayloadUtile } from "@/lib/auth/jwt";
import { lireJetons } from "@/lib/auth/session";
import { UserMenu } from "./UserMenu";
import { MobileNav } from "./MobileNav";
import { NotificationBell } from "./NotificationBell";
import { SidebarNav } from "./SidebarNav";

/**
 * Coquille de l'espace authentifié — barre latérale (navigation filtrée
 * par rôle, `config/navigation.ts`), en-tête (rôle, déconnexion, menu
 * mobile) et zone de contenu. `data-slot="app-shell"` déclenche la règle
 * `overflow: hidden` du `body` dans `globals.css` — une seule zone défile
 * par écran (`docs/design-system.md` § Surfaces et interaction).
 */
export async function AppShell({
  children,
}: Readonly<{ children: ReactNode }>) {
  const t = await getTranslations("nav");
  const tAccueil = await getTranslations("landing");
  const { role } = decoderPayloadUtile((await lireJetons()).accessToken);

  const marque = (
    <Link
      href="/dashboard"
      className="text-sidebar-foreground flex items-center gap-2 text-sm font-semibold tracking-tight"
    >
      <Croissant className="size-5" />
      {tAccueil("brand")}
    </Link>
  );

  // Visiteur anonyme sur un contenu public (catalogue, profil d'agence,
  // fiches de rites — `PREFIXES_PUBLIC_CONTENU` de `src/proxy.ts`) : pas
  // de menu de l'espace ni de déconnexion, mais l'accès aux deux parcours
  // de connexion.
  if (!role) {
    return (
      <div className="flex min-h-svh flex-col">
        <header className="bg-background flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <Croissant className="size-5" />
            {tAccueil("brand")}
          </Link>
          <nav
            aria-label={t("mainNav")}
            className="flex items-center gap-1 text-sm"
          >
            <Link
              href="/otp"
              className="hover:bg-muted hidden rounded-md px-3 py-2 sm:inline-flex"
            >
              {tAccueil("nav.pilgrim")}
            </Link>
            <Link
              href="/login"
              className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-md px-3 py-2 font-medium"
            >
              {tAccueil("nav.agency")}
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div data-slot="app-shell" className="flex h-svh">
      <aside className="bg-sidebar border-sidebar-border hidden w-(--sidebar-width) shrink-0 flex-col border-r lg:flex">
        <div className="flex h-14 items-center border-b px-4">{marque}</div>
        <div className="scrollbar-fine flex-1 overflow-y-auto p-2">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <MobileNav />
            <span className="lg:hidden">{marque}</span>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <UserMenu />
          </div>
        </header>
        <main className="scrollbar-fine flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
