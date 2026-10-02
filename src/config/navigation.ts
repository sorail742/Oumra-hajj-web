import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  FileCheck,
  LayoutDashboard,
  Package,
  PackagePlus,
  ShieldCheck,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import type { Role } from "@/lib/auth/permissions";

/**
 * Navigation de l'espace authentifié — **seul** endroit où l'on décide
 * quel rôle voit quelle entrée (`CLAUDE.md` règle 5 : jamais de
 * `role === …` dans un composant). Filtrage d'affichage uniquement : le
 * backend reste la seule barrière (règle 12).
 *
 * `cle` est une clé de `messages/fr.json` › `nav`.
 */
export interface EntreeNavigation {
  href: string;
  cle: string;
  icone: LucideIcon;
  roles: readonly Role[];
}

const TOUS: readonly Role[] = ["pilgrim", "guide", "agency", "admin"];

export const NAVIGATION: readonly EntreeNavigation[] = [
  { href: "/dashboard", cle: "dashboard", icone: LayoutDashboard, roles: TOUS },
  { href: "/agencies", cle: "agencies", icone: Building2, roles: ["admin"] },
  { href: "/packages", cle: "packages", icone: Package, roles: TOUS },
  {
    href: "/my-packages",
    cle: "myPackages",
    icone: PackagePlus,
    roles: ["agency"],
  },
  {
    href: "/bookings",
    cle: "bookings",
    icone: ClipboardList,
    roles: ["pilgrim", "agency"],
  },
  {
    href: "/documents",
    cle: "documents",
    icone: FileCheck,
    roles: ["pilgrim", "agency"],
  },
  {
    href: "/payments",
    cle: "payments",
    icone: Wallet,
    roles: ["pilgrim", "agency"],
  },
  {
    href: "/groups",
    cle: "groups",
    icone: Users,
    roles: ["pilgrim", "guide", "agency"],
  },
  {
    href: "/calendar",
    cle: "calendar",
    icone: CalendarDays,
    roles: ["agency"],
  },
  {
    href: "/legal-documents",
    cle: "legalDocuments",
    icone: ShieldCheck,
    roles: ["agency"],
  },
  {
    href: "/reviews",
    cle: "reviews",
    icone: Star,
    roles: ["pilgrim", "agency"],
  },
  { href: "/rites", cle: "rites", icone: BookOpen, roles: TOUS },
];

/** Entrée active : correspondance exacte ou sous-chemin (`/bookings/123`). */
export function estActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
