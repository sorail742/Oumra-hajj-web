import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "cn";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * KPI du tableau de bord (`docs/design-system.md`, catalogue Lot B) : un
 * titre, une valeur, un détail et, si utile, un lien vers l'écran complet.
 * Le chargement passe par `StatCardSkeleton` (mêmes dimensions) dans
 * l'`AsyncBoundary` de l'appelant. Plusieurs KPI côte à côte se posent
 * dans une `StatGrid`, qui les réunit en une seule surface.
 */
export function StatCard({
  title,
  value,
  children,
  href,
  linkLabel,
}: {
  title: string;
  value?: ReactNode;
  children?: ReactNode;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <section
      data-slot="stat-card"
      className="bg-card flex flex-col gap-3 rounded-lg border p-5 shadow-(--shadow-card)"
    >
      <h2 className="text-muted-foreground text-sm font-medium">{title}</h2>
      {value !== undefined && (
        <div className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </div>
      )}
      {children && (
        <div className="text-muted-foreground text-sm">{children}</div>
      )}
      {href && linkLabel && (
        <Link
          href={href}
          className="text-primary group mt-auto inline-flex items-center gap-1 pt-1 text-sm font-medium"
        >
          {linkLabel}
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-(--motion-fast) group-hover:translate-x-0.5"
          />
        </Link>
      )}
    </section>
  );
}

export function StatCardSkeleton() {
  return (
    <div
      data-slot="stat-card"
      className="bg-card flex flex-col gap-3 rounded-lg border p-5"
      aria-hidden
    >
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-4 w-48" />
    </div>
  );
}

/**
 * Rangée de KPI réunis en une surface, séparés par un filet — comme une
 * ligne de chiffres d'un relevé. `columns` : nombre de colonnes sur grand
 * écran (une seule sous `sm`, deux jusqu'à `lg`).
 */
const COLONNES = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

export function StatGrid({
  columns = 4,
  children,
  className,
}: Readonly<{
  columns?: keyof typeof COLONNES;
  children: ReactNode;
  className?: string;
}>) {
  return (
    <div
      className={cn(
        // Le fond `bg-border` visible dans l'écart d'un pixel trace les
        // filets, quelle que soit la disposition de la grille.
        "bg-border grid gap-px overflow-hidden rounded-lg border shadow-(--shadow-card)",
        "[&>*]:bg-card [&>*]:min-w-0 [&_[data-slot=stat-card]]:h-full [&_[data-slot=stat-card]]:rounded-none [&_[data-slot=stat-card]]:border-0 [&_[data-slot=stat-card]]:shadow-none",
        COLONNES[columns],
        className,
      )}
    >
      {children}
    </div>
  );
}
