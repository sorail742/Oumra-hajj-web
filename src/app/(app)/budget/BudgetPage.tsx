"use client";

import { BudgetSimulator } from "@/features/budget/components/BudgetSimulator";
import { SavedBudgets } from "@/features/budget/components/SavedBudgets";
import { usePackages } from "@/features/packages/api/use-packages";

/** Compose forfaits publiés et budget (règle 2). */
export function BudgetPage() {
  const { data: forfaits = [] } = usePackages({});
  return (
    <div className="space-y-8">
      <BudgetSimulator
        forfaits={forfaits.map((f) => ({
          id: f.id,
          titre: f.title,
          prix: f.price,
        }))}
      />
      <SavedBudgets titres={new Map(forfaits.map((f) => [f.id, f.title]))} />
    </div>
  );
}
