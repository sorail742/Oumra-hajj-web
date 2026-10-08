import { describe, expect, it } from "vitest";
import { pagesVisibles } from "./pages-visibles";

describe("pagesVisibles", () => {
  it("liste toutes les pages quand il y en a peu", () => {
    expect(pagesVisibles(0, 1)).toEqual([0]);
    expect(pagesVisibles(3, 7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it("garde le début groupé tant que la page courante en est proche", () => {
    expect(pagesVisibles(0, 25)).toEqual([0, 1, 2, 3, 4, "…", 24]);
    expect(pagesVisibles(2, 25)).toEqual([0, 1, 2, 3, 4, "…", 24]);
  });

  it("encadre la page courante au milieu", () => {
    expect(pagesVisibles(10, 25)).toEqual([0, "…", 9, 10, 11, "…", 24]);
  });

  it("garde la fin groupée près de la dernière page", () => {
    expect(pagesVisibles(24, 25)).toEqual([0, "…", 20, 21, 22, 23, 24]);
    expect(pagesVisibles(22, 25)).toEqual([0, "…", 20, 21, 22, 23, 24]);
  });

  it("n'affiche jamais plus de sept éléments", () => {
    for (let page = 0; page < 40; page += 1) {
      expect(pagesVisibles(page, 40).length).toBeLessThanOrEqual(7);
    }
  });
});
