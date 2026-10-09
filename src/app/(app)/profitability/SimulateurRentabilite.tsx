"use client";

import { useMyPackages } from "@/features/packages/api/use-my-packages";
import { ProfitabilitySimulator } from "@/features/profitability/components/ProfitabilitySimulator";

/** Compose forfaits de l'agence → simulateur (règle 2). */
export function SimulateurRentabilite() {
  const { data: forfaits = [] } = useMyPackages();
  return (
    <ProfitabilitySimulator
      forfaits={forfaits.map((f) => ({
        id: f.id,
        title: f.title,
        price: f.price,
        capacity: f.capacity,
      }))}
    />
  );
}
