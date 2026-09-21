import type { ReactNode } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

/**
 * Coquille de l'espace authentifié — sidebar + header + zone de contenu.
 *
 * Volontairement minimale (Phase 0 du socle, voir `docs/socle-frontend.md`
 * §9) : navigation statique, pas de filtrage par rôle (`<Can>` et
 * `config/navigation.ts` arrivent en Phase 1). `data-slot="app-shell"`
 * déclenche la règle `overflow: hidden` du `body` dans `globals.css` — une
 * seule zone défile par écran (voir `docs/design-system.md` § Surfaces et
 * interaction).
 */
export async function AppShell({ children }: { children: ReactNode }) {
  const t = await getTranslations("nav");

  const liens = [
    { href: "/dashboard", label: t("dashboard") },
    { href: "/packages", label: t("packages") },
    { href: "/bookings", label: t("bookings") },
    { href: "/documents", label: t("documents") },
    { href: "/payments", label: t("payments") },
    { href: "/reviews", label: t("reviews") },
    { href: "/rites", label: t("rites") },
    { href: "/groups", label: t("groups") },
    { href: "/legal-documents", label: t("legalDocuments") },
    { href: "/settings", label: t("settings") },
  ];

  return (
    <div data-slot="app-shell" className="flex h-svh">
      <aside className="bg-sidebar border-sidebar-border hidden w-(--sidebar-width) shrink-0 flex-col border-r lg:flex">
        <div className="text-sidebar-foreground flex h-14 items-center border-b px-4 text-sm font-semibold">
          Oumra &amp; Hadj
        </div>
        <nav className="scrollbar-fine flex-1 space-y-1 overflow-y-auto p-2">
          {liens.map((lien) => (
            <Link
              key={lien.href}
              href={lien.href}
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground block rounded-md px-3 py-2 text-sm"
            >
              {lien.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background flex h-14 shrink-0 items-center border-b px-4">
          <span className="text-sm font-medium">Oumra &amp; Hadj</span>
        </header>
        <main className="scrollbar-fine flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
