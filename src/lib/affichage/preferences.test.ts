import { describe, expect, it } from "vitest";
import { attributsAffichage, lirePreferences } from "./preferences";

describe("lirePreferences", () => {
  it("reprend des valeurs connues", () => {
    expect(lirePreferences("x-large", "high")).toEqual({
      texte: "x-large",
      contraste: "high",
    });
  });

  it("retombe sur le défaut pour une valeur absente ou inconnue", () => {
    expect(lirePreferences(undefined, "<script>")).toEqual({
      texte: "normal",
      contraste: "normal",
    });
  });
});

describe("attributsAffichage", () => {
  it("donne les attributs lus par globals.css", () => {
    expect(attributsAffichage({ texte: "large", contraste: "high" })).toEqual({
      "data-text-size": "large",
      "data-contrast": "high",
    });
  });
});
