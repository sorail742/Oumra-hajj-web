import { describe, expect, it } from "vitest";
import { lireHypotheses } from "./hypotheses";

describe("lireHypotheses (idée #68)", () => {
  it("lit ratio et recrues de l'URL", () => {
    expect(lireHypotheses(new URLSearchParams("ratio=25&extra=3"))).toEqual({
      ratio: 25,
      recrues: 3,
    });
  });

  it("retombe sur les valeurs par défaut hors bornes ou illisibles", () => {
    expect(lireHypotheses(new URLSearchParams("ratio=2&extra=-1"))).toEqual({
      ratio: 40,
      recrues: 0,
    });
    expect(lireHypotheses(new URLSearchParams("ratio=abc"))).toEqual({
      ratio: 40,
      recrues: 0,
    });
  });
});
