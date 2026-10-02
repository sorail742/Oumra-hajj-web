import type { ReactNode } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Croissant } from "@/components/shared/illustrations/Geometrie";
import { decoderPayloadUtile } from "@/lib/auth/jwt";
import { lireJetons } from "@/lib/auth/session";
import { LogoutButton } from "./LogoutButton";
import { MobileNav } from "./MobileNav";
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
          <div className="flex items-center gap-2">
            {role && (
              <span className="bg-primary-subtle text-primary hidden rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline-flex">
                {t(`roles.${role}`)}
              </span>
            )}
            <LogoutButton />
          </div>
        </header>
        <main className="scrollbar-fine flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
