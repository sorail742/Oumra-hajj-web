import { describe, expect, it } from "vitest";
import { packageSchema } from "./schemas";

/** Exemple conforme à `PackageShape` — données factices explicites. */
const forfait = {
  id: "00000000-0000-4000-8000-000000000050",
  agencyId: "00000000-0000-4000-8000-000000000051",
  type: "oumra",
  title: "[DÉMO] Forfait factice",
  startDate: "2026-11-30T00:00:00.000Z",
  endDate: "2026-12-15T00:00:00.000Z",
  price: 30000000,
  currency: "GNF",
  capacity: 20,
  seatsTaken: 3,
  stages: [
    {
      id: "00000000-0000-4000-8000-000000000052",
      city: "Médine",
      hotelName: "Hôtel factice",
      distanceToMosqueMeters: 300,
      startDate: "2026-11-30T00:00:00.000Z",
      endDate: "2026-12-05T00:00:00.000Z",
    },
  ],
  inclusions: ["Vol (fictif)"],
  status: "open",
};

describe("packageSchema", () => {
  it("accepte la forme réelle renvoyée par le backend", () => {
    const resultat = packageSchema.parse(forfait);
    expect(resultat.seatsTaken).toBe(3);
    expect(resultat.stages[0]?.id).toBe("00000000-0000-4000-8000-000000000052");
  });

  it("accepte un forfait sans étape ni description (forfait de démonstration)", () => {
    expect(packageSchema.safeParse({ ...forfait, stages: [] }).success).toBe(
      true,
    );
  });

  it("exige seatsTaken, garanti par le backend", () => {
    const { seatsTaken: _ignore, ...sansPlaces } = forfait;
    expect(packageSchema.safeParse(sansPlaces).success).toBe(false);
  });
});
