import type { ReactNode } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Croissant } from "@/components/shared/illustrations/Geometrie";
import { decoderPayloadUtile } from "@/lib/auth/jwt";
import { lireJetons } from "@/lib/auth/session";
import { UserMenu } from "./UserMenu";
import { MobileNav } from "./MobileNav";
import { NotificationBell } from "./NotificationBell";
import { PageContext } from "./PageContext";
import { SidebarAccount } from "./SidebarAccount";
import { SidebarBrand } from "./SidebarBrand";
import { SidebarNav } from "./SidebarNav";

/**
 * Coquille de l'espace authentifié — barre latérale posée sur le canevas
 * (marque et espace, navigation filtrée par rôle en sections,
 * `config/navigation.ts`, compte), puis un panneau de contenu avec son
 * en-tête (section courante, notifications, menu du compte). `data-slot="app-shell"` déclenche la règle
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
    <div data-slot="app-shell" className="bg-canvas flex h-svh">
      <aside className="hidden w-(--sidebar-width) shrink-0 flex-col lg:flex">
        <div className="p-3">
          <SidebarBrand role={role} />
        </div>
        <div className="scrollbar-fine flex-1 overflow-y-auto px-3 py-3">
          <SidebarNav />
        </div>
        <div className="border-sidebar-border mx-3 border-t py-3">
          <SidebarAccount />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:py-2 lg:pr-2">
        <div className="bg-panel flex min-h-0 flex-1 flex-col overflow-hidden lg:rounded-xl lg:border lg:shadow-(--shadow-card)">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <MobileNav marque={<SidebarBrand role={role} />} />
              <span className="lg:hidden">{marque}</span>
              <PageContext />
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <UserMenu />
            </div>
          </header>
          <main className="scrollbar-fine flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
