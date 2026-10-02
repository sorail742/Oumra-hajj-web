import { describe, expect, it } from "vitest";
import {
  dureeJours,
  estReservable,
  placesRestantes,
  tauxRemplissage,
} from "./forfait";

describe("forfait", () => {
  it("calcule les places restantes sans jamais descendre sous zéro", () => {
    expect(placesRestantes({ capacity: 20, seatsTaken: 3 })).toBe(17);
    expect(placesRestantes({ capacity: 20, seatsTaken: 25 })).toBe(0);
  });

  it("borne le taux de remplissage entre 0 et 1", () => {
    expect(tauxRemplissage({ capacity: 20, seatsTaken: 5 })).toBe(0.25);
    expect(tauxRemplissage({ capacity: 0, seatsTaken: 0 })).toBe(1);
  });

  it("compte la durée bornes incluses", () => {
    expect(
      dureeJours({
        startDate: "2026-11-01T00:00:00.000Z",
        endDate: "2026-11-15T00:00:00.000Z",
      }),
    ).toBe(15);
  });

  it("ne rend réservable qu'un forfait ouvert avec des places", () => {
    expect(estReservable({ status: "open", capacity: 20, seatsTaken: 3 })).toBe(
      true,
    );
    expect(
      estReservable({ status: "open", capacity: 20, seatsTaken: 20 }),
    ).toBe(false);
    expect(
      estReservable({ status: "closed", capacity: 20, seatsTaken: 0 }),
    ).toBe(false);
  });
});
