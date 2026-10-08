"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { estActive, GROUPES_NAVIGATION, NAVIGATION } from "@/config/navigation";
import { hasRole } from "@/lib/auth/permissions";
import { useRole } from "@/lib/auth/role-context";

/**
 * Liste de navigation de l'espace authentifié, filtrée par rôle depuis
 * `config/navigation.ts` et rangée en sections (`GROUPES_NAVIGATION`).
 * L'entrée active (`aria-current="page"`) est posée en relief sur le
 * canevas, marquée d'un trait de la couleur de marque.
 */
export function SidebarNav({
  onNavigate,
}: Readonly<{ onNavigate?: () => void }>) {
  const t = useTranslations("nav");
  const role = useRole();
  const pathname = usePathname();

  const entrees = NAVIGATION.filter((entree) => hasRole(role, entree.roles));
  const sections = GROUPES_NAVIGATION.map((groupe) => ({
    groupe,
    liens: entrees.filter((entree) => entree.groupe === groupe),
  })).filter((section) => section.liens.length > 0);

  return (
    <nav aria-label={t("mainNav")} className="space-y-6">
      {sections.map(({ groupe, liens }) => (
        <div key={groupe} className="space-y-1">
          <p className="text-sidebar-muted px-3 pb-1 text-2xs font-semibold tracking-wider uppercase">
            {t(`sections.${groupe}`)}
          </p>
          {liens.map(({ href, cle, icone: Icone }) => {
            const active = estActive(href, pathname);
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors duration-(--motion-fast)",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-(--shadow-card)"
                    : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-accent-foreground",
                )}
              >
                {active && (
                  <span
                    aria-hidden
                    className="bg-primary absolute inset-y-2 -left-2 w-1 rounded-r-sm"
                  />
                )}
                <Icone
                  aria-hidden
                  className={cn(
                    "size-4 shrink-0",
                    active ? "text-primary" : "text-sidebar-muted",
                  )}
                />
                <span className="truncate">{t(cle)}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
