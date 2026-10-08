import { describe, expect, it } from "vitest";
import type { RiteSheet } from "../api/schemas";
import { fileDeModeration } from "./moderation";

const fiche = (id: string, isValidated: boolean, order: number) =>
  ({ id, isValidated, order }) as RiteSheet;

describe("fileDeModeration (ticket #62)", () => {
  it("place les fiches à valider en tête, chaque groupe dans l'ordre du parcours", () => {
    const resultat = fileDeModeration([
      fiche("publiee-2", true, 2),
      fiche("a-valider-3", false, 3),
      fiche("publiee-1", true, 1),
      fiche("a-valider-1", false, 1),
    ]);
    expect(resultat.map((f) => f.id)).toEqual([
      "a-valider-1",
      "a-valider-3",
      "publiee-1",
      "publiee-2",
    ]);
  });
});
