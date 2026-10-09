"use client";

import { useMyPackages } from "@/features/packages/api/use-my-packages";
import { CreateQuoteDialog } from "@/features/quotes/components/CreateQuoteDialog";

/** Compose forfaits de l'agence → devis (règle 2). */
export function NouveauDevis() {
  const { data: forfaits = [] } = useMyPackages();
  return (
    <CreateQuoteDialog
      forfaits={forfaits.map((f) => ({
        id: f.id,
        title: f.title,
        price: f.price,
      }))}
    />
  );
}
