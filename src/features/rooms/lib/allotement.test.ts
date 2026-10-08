import { describe, expect, it } from "vitest";
import type { RoomBlock } from "../api/schemas";
import { placesInvendues, retrocessionProche } from "./allotement";

// Bloc explicitement factice (idée #40).
const bloc = (surcharge: Partial<RoomBlock>): RoomBlock => ({
  id: "bloc-1",
  packageId: "forfait-1",
  packageTitle: "[DÉMO] Oumra fictive",
  hotelName: "[DÉMO] Hôtel fictif",
  city: "La Mecque",
  roomType: "quadruple",
  roomCount: 2,
  bedsPerRoom: 4,
  totalBeds: 8,
  assignedBeds: 5,
  rooms: [],
  unassigned: [],
  ...surcharge,
});

const maintenant = new Date("2026-10-08T00:00:00Z");

describe("allotement", () => {
  it("compte les places invendues", () => {
    expect(placesInvendues(bloc({}))).toBe(3);
  });

  it("alerte quand la rétrocession approche avec des places invendues", () => {
    expect(
      retrocessionProche(bloc({ releaseDate: "2026-10-15" }), maintenant),
    ).toBe(true);
    expect(
      retrocessionProche(bloc({ releaseDate: "2026-12-01" }), maintenant),
    ).toBe(false);
  });

  it("n'alerte pas pour un bloc complet ou sans date", () => {
    expect(
      retrocessionProche(
        bloc({ releaseDate: "2026-10-10", assignedBeds: 8 }),
        maintenant,
      ),
    ).toBe(false);
    expect(retrocessionProche(bloc({}), maintenant)).toBe(false);
  });
});
