import { describe, expect, it } from "vitest";
import {
  schemaRentabilite,
  versHypotheses,
  type ValeursRentabilite,
} from "./formulaire-rentabilite";

const messages = {
  amountInvalid: "montant",
  labelRequired: "libellé",
  integerInvalid: "entier",
  priceRequired: "prix",
  capacityRequired: "capacité",
  expectedTooHigh: "trop",
};
const schema = schemaRentabilite(messages);

/** Montants explicitement factices (idée #48). */
const base: ValeursRentabilite = {
  packageId: "",
  price: "1000",
  capacity: "40",
  expectedPilgrims: "",
  costsPerPilgrim: [{ label: "Billet", amount: "500,50" }],
  fixedCosts: [{ label: "Guide", amount: "3000" }],
};

describe("formulaire de rentabilité (idée #48)", () => {
  it("convertit la saisie, virgule décimale comprise", () => {
    expect(versHypotheses(schema.parse(base))).toEqual({
      price: 1000,
      capacity: 40,
      costsPerPilgrim: [{ label: "Billet", amount: 500.5 }],
      fixedCosts: [{ label: "Guide", amount: 3000 }],
    });
  });

  it("exige prix et capacité pour une nouvelle offre seulement", () => {
    const vide = { ...base, price: "", capacity: "" };
    const erreurs = schema.safeParse(vide).error?.issues.map((i) => i.message);
    expect(erreurs).toEqual(["prix", "capacité"]);
    const avecForfait = schema.parse({ ...vide, packageId: "forfait-1" });
    expect(versHypotheses(avecForfait)).toEqual({
      packageId: "forfait-1",
      costsPerPilgrim: [{ label: "Billet", amount: 500.5 }],
      fixedCosts: [{ label: "Guide", amount: 3000 }],
    });
  });

  it("refuse un remplissage supérieur à la capacité et un montant illisible", () => {
    expect(
      schema.safeParse({ ...base, expectedPilgrims: "41" }).error?.issues[0]
        ?.message,
    ).toBe("trop");
    expect(
      schema.safeParse({
        ...base,
        fixedCosts: [{ label: "Guide", amount: "-3" }],
      }).success,
    ).toBe(false);
  });
});
