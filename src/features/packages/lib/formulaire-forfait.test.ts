import { describe, expect, it } from "vitest";
import {
  schemaFormulaireForfait,
  valeursInitiales,
  versCorps,
  type ValeursForfait,
} from "./formulaire-forfait";

const m = {
  titleTooShort: "titre",
  required: "requis",
  priceInvalid: "prix",
  capacityInvalid: "capacité",
  endBeforeStart: "dates",
  stagesRequired: "étapes",
};
const schema = schemaFormulaireForfait(m);

const valide: ValeursForfait = {
  type: "oumra",
  title: "[DÉMO] Forfait factice",
  description: "",
  startDate: "2026-12-01",
  endDate: "2026-12-15",
  price: "30000000",
  capacity: "40",
  stages: [
    {
      city: "Médine",
      hotelName: "Hôtel factice",
      distanceToMosqueMeters: "250",
      startDate: "2026-12-01",
      endDate: "2026-12-06",
    },
  ],
  inclusions: "Vol (fictif)\n\n  Visa (fictif)  \n",
};

describe("formulaire de forfait", () => {
  it("accepte un forfait complet et le convertit vers le DTO backend", () => {
    expect(schema.safeParse(valide).success).toBe(true);
    expect(versCorps(valide)).toEqual({
      type: "oumra",
      title: "[DÉMO] Forfait factice",
      startDate: "2026-12-01",
      endDate: "2026-12-15",
      price: 30000000,
      currency: "GNF",
      capacity: 40,
      stages: [
        {
          city: "Médine",
          hotelName: "Hôtel factice",
          distanceToMosqueMeters: 250,
          startDate: "2026-12-01",
          endDate: "2026-12-06",
        },
      ],
      inclusions: ["Vol (fictif)", "Visa (fictif)"],
    });
  });

  it("omet une distance non renseignée", () => {
    const sansDistance = {
      ...valide,
      stages: [{ ...valide.stages[0]!, distanceToMosqueMeters: "" }],
    };
    expect(versCorps(sansDistance).stages[0]).not.toHaveProperty(
      "distanceToMosqueMeters",
    );
  });

  it.each([
    ["un prix non entier", { price: "12,5" }, "prix"],
    ["une capacité nulle", { capacity: "0" }, "capacité"],
    ["un retour avant le départ", { endDate: "2026-11-01" }, "dates"],
    ["aucune étape", { stages: [] }, "étapes"],
  ])("refuse %s", (_cas, patch, message) => {
    const resultat = schema.safeParse({ ...valide, ...patch });
    expect(resultat.success).toBe(false);
    expect(resultat.error?.issues.map((i) => i.message)).toContain(message);
  });

  it("pré-remplit depuis un forfait existant (dates au format du champ date)", () => {
    const initiales = valeursInitiales({
      id: "p1",
      agencyId: "a1",
      type: "hadj",
      title: "[DÉMO] Hadj",
      startDate: "2027-05-20T00:00:00.000Z",
      endDate: "2027-06-10T00:00:00.000Z",
      price: 95000000,
      currency: "GNF",
      capacity: 30,
      seatsTaken: 4,
      status: "open",
      stages: [],
      inclusions: ["Vol (fictif)"],
    });
    expect(initiales.startDate).toBe("2027-05-20");
    expect(initiales.price).toBe("95000000");
    expect(initiales.stages).toHaveLength(1);
    expect(initiales.inclusions).toBe("Vol (fictif)");
  });
});
