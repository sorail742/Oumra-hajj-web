import { describe, expect, it } from "vitest";
import {
  distanceMetres,
  filtrer,
  fraicheur,
  lireFiltre,
  positionsSuivies,
} from "./suivi";

const MAINTENANT = Date.parse("2026-10-08T12:00:00.000Z");
const ilYA = (minutes: number) =>
  new Date(MAINTENANT - minutes * 60_000).toISOString();

describe("fraicheur", () => {
  it("classe une position selon son âge", () => {
    expect(fraicheur(ilYA(1), MAINTENANT)).toBe("live");
    expect(fraicheur(ilYA(3), MAINTENANT)).toBe("live");
    expect(fraicheur(ilYA(10), MAINTENANT)).toBe("recent");
    expect(fraicheur(ilYA(31), MAINTENANT)).toBe("stale");
  });
});

describe("positionsSuivies", () => {
  const groupe = {
    guideId: "guide",
    locations: [
      { userId: "m-ancien", lat: 0, lng: 0, updatedAt: ilYA(40) },
      { userId: "moi", lat: 0, lng: 0, updatedAt: ilYA(5) },
      { userId: "guide", lat: 0, lng: 0, updatedAt: ilYA(2) },
      { userId: "m-recent", lat: 0, lng: 0, updatedAt: ilYA(1) },
    ],
  };

  it("trie du plus récent au plus ancien et numérote les seuls membres", () => {
    const resultat = positionsSuivies(groupe, "moi");
    expect(resultat.map((p) => [p.userId, p.role, p.numero])).toEqual([
      ["m-recent", "membre", 1],
      ["guide", "guide", 0],
      ["moi", "moi", 0],
      ["m-ancien", "membre", 2],
    ]);
  });

  it("filtre par fraîcheur et par rôle", () => {
    const positions = positionsSuivies(groupe, "moi");
    expect(filtrer(positions, "live", MAINTENANT).map((p) => p.userId)).toEqual(
      ["m-recent", "guide"],
    );
    expect(filtrer(positions, "guide", MAINTENANT)).toHaveLength(1);
    expect(
      filtrer(positions, "stale", MAINTENANT).map((p) => p.userId),
    ).toEqual(["m-ancien"]);
    expect(filtrer(positions, "all", MAINTENANT)).toHaveLength(4);
  });
});

describe("distanceMetres", () => {
  it("vaut zéro pour un même point", () => {
    expect(
      distanceMetres(
        { lat: 21.4225, lng: 39.8262 },
        { lat: 21.4225, lng: 39.8262 },
      ),
    ).toBe(0);
  });

  it("donne la distance La Mecque – Médine à quelques kilomètres près", () => {
    const km =
      distanceMetres(
        { lat: 21.4225, lng: 39.8262 },
        { lat: 24.4672, lng: 39.6111 },
      ) / 1000;
    expect(km).toBeGreaterThan(330);
    expect(km).toBeLessThan(345);
  });
});

describe("lireFiltre", () => {
  it("retombe sur « tous » pour une valeur inconnue", () => {
    expect(lireFiltre("live")).toBe("live");
    expect(lireFiltre("nimporte")).toBe("all");
    expect(lireFiltre(null)).toBe("all");
  });
});
