import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Croissant } from "@/components/shared/illustrations/Geometrie";
import type { Role } from "@/lib/auth/permissions";

/**
 * Bloc de marque en tête de la barre latérale : logo, nom du produit et
 * espace courant (« Espace agence »…). Le rôle vient du JWT, comme
 * `<Can>` — libellé d'affichage seulement.
 */
export async function SidebarBrand({ role }: Readonly<{ role: Role }>) {
  const t = await getTranslations("nav");
  const tAccueil = await getTranslations("landing");

  return (
    <Link
      href="/dashboard"
      className="bg-sidebar-accent hover:bg-sidebar-accent/80 flex items-center gap-3 rounded-lg border p-2.5 shadow-(--shadow-card) transition-colors duration-(--motion-fast)"
    >
      <span className="bg-primary text-primary-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-md">
        <Croissant className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="text-sidebar-accent-foreground block truncate text-sm font-semibold tracking-tight">
          {tAccueil("brand")}
        </span>
        <span className="text-sidebar-muted block truncate text-xs">
          {t(`space.${role}`)}
        </span>
      </span>
    </Link>
  );
}
