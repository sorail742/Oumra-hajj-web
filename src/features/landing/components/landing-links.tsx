import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "cn";

/**
 * Liens d'action de la page d'accueil. Pas `Button asChild` : la variante
 * `outline` de `ui/button` survole en `accent` (or), réservé aux marqueurs
 * de confiance (`docs/design-system.md`) — ici le survol reste neutre.
 */
const base =
  "inline-flex h-(--size-touch) items-center justify-center gap-2 rounded-md px-5 text-sm font-medium transition-colors duration-(--motion-fast) outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

const variantes = {
  primaire: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondaire: "border border-input bg-card text-foreground hover:bg-muted",
  discret: "text-primary underline-offset-4 hover:underline",
} as const;

export const ROUTES_ACCUEIL = {
  pelerin: "/otp",
  agence: "/login",
  inscriptionAgence: "/register-agency",
} as const;

export function LienAction({
  href,
  variante,
  children,
  className,
}: Readonly<{
  href: string;
  variante: keyof typeof variantes;
  children: ReactNode;
  className?: string;
}>) {
  return (
    <Link href={href} className={cn(base, variantes[variante], className)}>
      {children}
    </Link>
  );
}
