import { z } from "zod";

/**
 * `ProfitabilitySimulationShape`
 * (`oumra-hajj-backend/src/types/profitability.types.ts`, idée #48, lu le
 * 2026-10-09) — rien n'est enregistré côté serveur ; le taux de commission
 * est lu en base, jamais envoyé par le navigateur.
 */
export const SCENARIOS = [
  "expected",
  "sold",
  "half",
  "three_quarters",
  "full",
] as const;

const scenarioSchema = z.object({
  kind: z.enum(SCENARIOS),
  pilgrims: z.number(),
  revenue: z.number(),
  platformCommission: z.number(),
  variableCosts: z.number(),
  fixedCosts: z.number(),
  margin: z.number(),
  marginRate: z.number().optional(),
  marginPerPilgrim: z.number().optional(),
});

export const profitabilitySchema = z.object({
  packageId: z.string().optional(),
  packageTitle: z.string().optional(),
  currency: z.string(),
  price: z.number(),
  capacity: z.number(),
  commissionRate: z.number(),
  costPerPilgrim: z.number(),
  fixedCostsTotal: z.number(),
  unitContribution: z.number(),
  breakEvenPilgrims: z.number().optional(),
  breakEvenReachable: z.boolean(),
  minimumPrice: z.number().optional(),
  scenarios: z.array(scenarioSchema),
});

export type Profitability = z.infer<typeof profitabilitySchema>;
export type ProfitabilityScenario = z.infer<typeof scenarioSchema>;

export interface LigneCout {
  label: string;
  amount: number;
}

export interface HypothesesRentabilite {
  packageId?: string;
  price?: number;
  capacity?: number;
  expectedPilgrims?: number;
  costsPerPilgrim: LigneCout[];
  fixedCosts: LigneCout[];
}
