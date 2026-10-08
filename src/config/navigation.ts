import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Calculator,
  Building2,
  CalendarDays,
  ClipboardList,
  FileCheck,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Package,
  PackagePlus,
  ShieldCheck,
  Siren,
  Star,
  UserCog,
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
  groupe: GroupeNavigation;
}

/**
 * Sections de la barre latérale, dans l'ordre d'affichage. Clé de
 * `messages/fr.json` › `nav.sections`. Une section sans entrée visible pour
 * le rôle n'est pas affichée.
 */
export const GROUPES_NAVIGATION = [
  "main",
  "journey",
  "agency",
  "learning",
] as const;

export type GroupeNavigation = (typeof GROUPES_NAVIGATION)[number];

const TOUS: readonly Role[] = ["pilgrim", "guide", "agency", "admin"];

export const NAVIGATION: readonly EntreeNavigation[] = [
  {
    href: "/dashboard",
    cle: "dashboard",
    icone: LayoutDashboard,
    roles: TOUS,
    groupe: "main",
  },
  {
    href: "/emergency",
    cle: "emergency",
    icone: Siren,
    roles: TOUS,
    groupe: "main",
  },
  {
    href: "/agencies",
    cle: "agencies",
    icone: Building2,
    roles: ["admin"],
    groupe: "main",
  },
  {
    href: "/users",
    cle: "users",
    icone: UserCog,
    roles: ["admin"],
    groupe: "main",
  },
  {
    href: "/packages",
    cle: "packages",
    icone: Package,
    roles: TOUS,
    groupe: "main",
  },
  {
    href: "/my-packages",
    cle: "myPackages",
    icone: PackagePlus,
    roles: ["agency"],
    groupe: "main",
  },
  {
    href: "/bookings",
    cle: "bookings",
    icone: ClipboardList,
    roles: ["pilgrim", "agency"],
    groupe: "main",
  },
  {
    href: "/documents",
    cle: "documents",
    icone: FileCheck,
    roles: ["pilgrim", "agency"],
    groupe: "journey",
  },
  {
    href: "/budget",
    cle: "budget",
    icone: Calculator,
    roles: ["pilgrim"],
    groupe: "journey",
  },
  {
    href: "/payments",
    cle: "payments",
    icone: Wallet,
    roles: ["pilgrim", "agency"],
    groupe: "journey",
  },
  {
    href: "/groups",
    cle: "groups",
    icone: Users,
    roles: ["pilgrim", "guide", "agency"],
    groupe: "journey",
  },
  {
    href: "/messaging",
    cle: "messaging",
    icone: MessageSquare,
    roles: ["pilgrim", "guide", "agency"],
    groupe: "journey",
  },
  {
    href: "/calendar",
    cle: "calendar",
    icone: CalendarDays,
    roles: ["agency"],
    groupe: "main",
  },
  {
    href: "/my-agency",
    cle: "myAgency",
    icone: Building2,
    roles: ["agency"],
    groupe: "agency",
  },
  {
    href: "/legal-documents",
    cle: "legalDocuments",
    icone: ShieldCheck,
    roles: ["agency"],
    groupe: "agency",
  },
  {
    href: "/reviews",
    cle: "reviews",
    icone: Star,
    roles: ["pilgrim", "agency"],
    groupe: "journey",
  },
  {
    href: "/rites",
    cle: "rites",
    icone: BookOpen,
    roles: TOUS,
    groupe: "learning",
  },
  {
    href: "/quiz",
    cle: "quiz",
    icone: ListChecks,
    roles: ["pilgrim", "guide", "admin"],
    groupe: "learning",
  },
  {
    href: "/micro-courses",
    cle: "microCourses",
    icone: GraduationCap,
    roles: TOUS,
    groupe: "learning",
  },
];

/** Entrée active : correspondance exacte ou sous-chemin (`/bookings/123`). */
export function estActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Entrée de la page courante (titre de la barre supérieure) : la plus
 * précise de celles qui correspondent — `/my-packages/new` relève de
 * « Mes forfaits », pas de « Forfaits ».
 */
export function entreeCourante(pathname: string): EntreeNavigation | undefined {
  return NAVIGATION.filter((e) => estActive(e.href, pathname)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0];
}
