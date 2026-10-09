import { formatGNF, formatNombre } from "@/lib/format";

/**
 * Montant — `font-mono`, chiffres tabulaires, voir `docs/design-system.md`
 * §1/§2. En GNF par défaut ; une autre devise (champ libre côté backend,
 * voir `formatGNF`) s'affiche avec son code ISO, jamais sous le libellé GNF.
 */
export function Money({
  montant,
  devise = "GNF",
}: {
  montant: number;
  devise?: string;
}) {
  return (
    <span className="font-mono tabular-nums">
      {devise === "GNF"
        ? formatGNF(montant)
        : `${formatNombre(montant)} ${devise}`}
    </span>
  );
}
