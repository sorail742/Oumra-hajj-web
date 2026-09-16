import { formatGNF } from "@/lib/format";

/** Montant en GNF — `font-mono`, chiffres tabulaires, voir `docs/design-system.md` §1/§2. */
export function Money({ montant }: { montant: number }) {
  return <span className="font-mono tabular-nums">{formatGNF(montant)}</span>;
}
