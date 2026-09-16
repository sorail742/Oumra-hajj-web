import type { ReactNode } from "react";

/** Rangée de filtres, synchronisés à l'URL par l'appelant — voir `CLAUDE.md` règle 8. */
export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-end gap-3">{children}</div>;
}
