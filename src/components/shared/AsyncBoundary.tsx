import type { ReactNode } from "react";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

/**
 * Les quatre états d'un écran de données, outillés une seule fois — voir
 * `CLAUDE.md` règle 6 et `docs/design-system.md` §7. Un écran ne
 * réimplémente jamais chargement/vide/erreur/nominal à la main.
 */

interface QueryLike<T> {
  data: T | undefined;
  isPending: boolean;
  isError: boolean;
  refetch: () => unknown;
}

export interface AsyncBoundaryProps<T> {
  query: QueryLike<T>;
  skeleton: ReactNode;
  empty?: ReactNode;
  /** Par défaut : vide si `data` est un tableau de longueur 0. */
  isEmpty?: (data: T) => boolean;
  children: (data: T) => ReactNode;
}

function videParDefaut<T>(data: T): boolean {
  return Array.isArray(data) && data.length === 0;
}

export function AsyncBoundary<T>({
  query,
  skeleton,
  empty,
  isEmpty = videParDefaut,
  children,
}: AsyncBoundaryProps<T>) {
  if (query.isPending) {
    return <>{skeleton}</>;
  }

  if (query.isError) {
    return <ErrorState onRetry={() => query.refetch()} />;
  }

  const donnees = query.data as T;

  if (isEmpty(donnees)) {
    return <>{empty ?? <EmptyState />}</>;
  }

  return <>{children(donnees)}</>;
}
