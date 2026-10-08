import { describe, expect, it } from "vitest";
import { formatCoordonnees, formatDistance } from "./index";

/** Intl sépare les milliers par une espace fine insécable : on la normalise. */
const espaces = (texte: string) => texte.replace(/\s/g, " ");

describe("formatDistance", () => {
  it("affiche les mètres arrondis à la dizaine sous le kilomètre", () => {
    expect(formatDistance(0)).toBe("0 m");
    expect(espaces(formatDistance(847))).toBe("850 m");
  });

  it("passe en kilomètres, une décimale sous 10 km", () => {
    expect(espaces(formatDistance(1234))).toBe("1,2 km");
    expect(espaces(formatDistance(342_400))).toBe("342 km");
  });
});

describe("formatCoordonnees", () => {
  it("garde cinq décimales", () => {
    expect(formatCoordonnees(21.4225, 39.8262)).toBe("21.42250, 39.82620");
  });
});
