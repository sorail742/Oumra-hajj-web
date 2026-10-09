import { describe, expect, it } from "vitest";
import { schemaPaliers, versPaliers, versValeurs } from "./formulaire-paliers";

const schema = schemaPaliers({
  tripsInvalid: "voyages",
  labelInvalid: "libellé",
  benefitInvalid: "avantage",
  duplicate: "doublon",
});

describe("formulaire des paliers (idée #47)", () => {
  it("convertit et trie les paliers", () => {
    const v = schema.parse({
      tiers: [
        { minTrips: "3", label: " Fidèle ", benefit: "Transfert offert" },
        { minTrips: "1", label: "Bienvenue", benefit: "Kit offert" },
      ],
    });
    expect(versPaliers(v)).toEqual([
      { minTrips: 1, label: "Bienvenue", benefit: "Kit offert" },
      { minTrips: 3, label: "Fidèle", benefit: "Transfert offert" },
    ]);
  });

  it("refuse deux paliers au même seuil et un seuil hors bornes", () => {
    const erreurs = schema
      .safeParse({
        tiers: [
          { minTrips: "2", label: "AA", benefit: "xx" },
          { minTrips: "02", label: "BB", benefit: "yy" },
          { minTrips: "0", label: "CC", benefit: "zz" },
        ],
      })
      .error?.issues.map((i) => i.message);
    expect(erreurs).toEqual(["voyages", "doublon"]);
  });

  it("repart des paliers enregistrés", () => {
    expect(
      versValeurs([{ minTrips: 2, label: "A", benefit: "B" }]).tiers[0],
    ).toEqual({ minTrips: "2", label: "A", benefit: "B" });
  });
});
