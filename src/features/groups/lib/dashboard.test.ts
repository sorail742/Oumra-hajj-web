import { describe, expect, it } from "vitest";
import type { Group } from "../api/schemas";
import { prochaineEtapeItineraire } from "./dashboard";

const groupe: Group = {
  id: "g",
  packageId: "f",
  agencyId: "a",
  title: "Groupe factice",
  memberIds: [],
  locations: [],
  itinerary: [
    { label: "Départ (factice)", date: "2026-11-30T08:00:00.000Z" },
    { label: "Médine (factice)", date: "2026-12-01T08:00:00.000Z" },
    { label: "Arrivée (factice)", date: "2026-11-01T08:00:00.000Z" },
  ],
};

describe("prochaineEtapeItineraire", () => {
  it("renvoie l'étape à venir la plus proche, même si l'itinéraire n'est pas trié", () => {
    expect(
      prochaineEtapeItineraire(groupe, new Date("2026-11-15T12:00:00Z"))?.label,
    ).toBe("Départ (factice)");
  });

  it("inclut une étape du jour même, même déjà passée dans la journée", () => {
    expect(
      prochaineEtapeItineraire(groupe, new Date("2026-11-30T20:00:00Z"))?.label,
    ).toBe("Départ (factice)");
  });

  it("ne renvoie rien quand tout l'itinéraire est passé", () => {
    expect(
      prochaineEtapeItineraire(groupe, new Date("2027-01-01T00:00:00Z")),
    ).toBeUndefined();
  });
});
