import { Money } from "@/components/shared/Money";
import { formatNombre } from "@/lib/format";

/** Montant dans la devise du forfait : `Money` pour le GNF, code ISO sinon. */
export function Montant({
  valeur,
  devise,
}: Readonly<{ valeur: number; devise: string }>) {
  if (devise === "GNF") return <Money montant={valeur} />;
  return (
    <span className="font-mono tabular-nums">
      {formatNombre(valeur)} {devise}
    </span>
  );
}
