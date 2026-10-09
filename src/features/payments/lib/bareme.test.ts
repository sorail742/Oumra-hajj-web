import { describe, expect, it } from "vitest";
import { lireBareme, versLignes } from "./bareme";

describe("lireBareme (idée #58)", () => {
  it("trie les paliers et convertit les pourcentages", () => {
    expect(
      lireBareme([
        { jours: "7", pourcentage: "20" },
        { jours: "60", pourcentage: "90" },
      ]),
    ).toEqual({
      paliers: [
        { minDaysBeforeDeparture: 60, rate: 0.9 },
        { minDaysBeforeDeparture: 7, rate: 0.2 },
      ],
    });
  });

  it("refuse une saisie invalide, un seuil en double ou un taux qui remonte", () => {
    expect(lireBareme([{ jours: "x", pourcentage: "10" }])).toEqual({
      erreur: "invalid",
    });
    expect(lireBareme([{ jours: "10", pourcentage: "150" }])).toEqual({
      erreur: "invalid",
    });
    expect(
      lireBareme([
        { jours: "30", pourcentage: "50" },
        { jours: "30", pourcentage: "40" },
      ]),
    ).toEqual({ erreur: "duplicate" });
    expect(
      lireBareme([
        { jours: "60", pourcentage: "30" },
        { jours: "7", pourcentage: "80" },
      ]),
    ).toEqual({ erreur: "increasing" });
  });

  it("repasse en lignes éditables", () => {
    expect(versLignes([{ minDaysBeforeDeparture: 30, rate: 0.5 }])).toEqual([
      { jours: "30", pourcentage: "50" },
    ]);
  });
});
