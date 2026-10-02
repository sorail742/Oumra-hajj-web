import { describe, expect, it } from "vitest";
import { tripSummarySchema } from "./schemas";

/** Exemple conforme à `TripSummaryShape` — données factices explicites. */
const livret = {
  bookingId: "00000000-0000-4000-8000-000000000010",
  status: "completed",
  packageTitle: "Forfait factice Oumra",
  pilgrimageType: "oumra",
  startDate: "2026-03-01T00:00:00.000Z",
  endDate: "2026-03-15T00:00:00.000Z",
  agencyName: "Agence Factice SARL",
  steps: [
    { key: "payment", status: "done", completedAt: "2026-02-01T00:00:00.000Z" },
    { key: "visa", status: "in_progress" },
  ],
  totalPaid: 30000000,
  currency: "GNF",
  installmentsCount: 3,
  rites: [
    {
      riteKey: "tawaf",
      title: "Tawaf",
      completed: true,
      tawafCount: 7,
      saiCount: 0,
    },
    { riteKey: "fiche-retiree", completed: false, tawafCount: 0, saiCount: 0 },
  ],
  review: { rating: 5 },
};

describe("tripSummarySchema", () => {
  it("accepte la forme réelle renvoyée par le backend", () => {
    const resultat = tripSummarySchema.parse(livret);
    expect(resultat.steps).toHaveLength(2);
    expect(resultat.rites[1]?.title).toBeUndefined();
  });

  it("accepte un livret sans avis", () => {
    const { review: _ignore, ...sansAvis } = livret;
    expect(tripSummarySchema.safeParse(sansAvis).success).toBe(true);
  });

  it("rejette l'ancienne forme supposée { pilgrims[] }", () => {
    expect(
      tripSummarySchema.safeParse({ agencyName: "x", pilgrims: [] }).success,
    ).toBe(false);
  });
});
