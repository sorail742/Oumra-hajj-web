import type { ReactNode } from "react";
import { formatNombre, formatPourcentage } from "@/lib/format";

/**
 * Répartition d'un total (statuts, notes…) : libellé, nombre, part écrite
 * et barre d'une seule teinte qui ne fait que doubler la part — jamais la
 * couleur seule pour porter l'information.
 */
export interface ProportionItem {
  key: string;
  label: ReactNode;
  count: number;
}

export function ProportionList({
  items,
}: Readonly<{ items: readonly ProportionItem[] }>) {
  const total = items.reduce((somme, item) => somme + item.count, 0);
  return (
    <ul className="space-y-3">
      {items.map(({ key, label, count }) => {
        const part = total === 0 ? 0 : (count / total) * 100;
        return (
          <li key={key} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              {label}
              <span className="text-sm tabular-nums">
                {formatNombre(count)}{" "}
                <span className="text-muted-foreground text-xs">
                  ({formatPourcentage(part, 0)})
                </span>
              </span>
            </div>
            <div aria-hidden className="bg-muted h-1.5 rounded-full">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${part}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
