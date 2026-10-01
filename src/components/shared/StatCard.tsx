import type { ReactNode } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * KPI du tableau de bord (`docs/design-system.md`, catalogue Lot B) : un
 * titre, une valeur, un détail et, si utile, un lien vers l'écran complet.
 * Le chargement passe par `StatCardSkeleton` (mêmes dimensions) dans
 * l'`AsyncBoundary` de l'appelant.
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
    <section className="flex flex-col gap-2 rounded-lg border bg-card p-4">
      <h2 className="text-sm text-muted-foreground">{title}</h2>
      {value !== undefined && (
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
      )}
      {children && <div className="text-sm">{children}</div>}
      {href && linkLabel && (
        <Link
          href={href}
          className="mt-auto text-sm text-primary hover:underline"
        >
          {linkLabel}
        </Link>
      )}
    </section>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4" aria-hidden>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-4 w-48" />
    </div>
  );
}
