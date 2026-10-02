"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { estActive, NAVIGATION } from "@/config/navigation";
import { hasRole } from "@/lib/auth/permissions";
import { useRole } from "@/lib/auth/role-context";

/**
 * Liste de navigation de l'espace authentifié, filtrée par rôle depuis
 * `config/navigation.ts`, avec l'entrée active mise en évidence
 * (`aria-current="page"`).
 */
export function SidebarNav({
  onNavigate,
}: Readonly<{ onNavigate?: () => void }>) {
  const t = useTranslations("nav");
  const role = useRole();
  const pathname = usePathname();

  const entrees = NAVIGATION.filter((entree) => hasRole(role, entree.roles));

  return (
    <nav aria-label={t("mainNav")} className="space-y-1">
      {entrees.map(({ href, cle, icone: Icone }) => {
        const active = estActive(href, pathname);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-(--motion-fast)",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icone aria-hidden className="size-4 shrink-0" />
            {t(cle)}
          </Link>
        );
      })}
    </nav>
  );
}
