import { describe, expect, it } from "vitest";
import { heureLocaleVersIso } from "./heure-locale";

describe("heureLocaleVersIso (idée #63)", () => {
  it("lit l'heure saisie dans le fuseau de Conakry (UTC)", () => {
    expect(heureLocaleVersIso("2026-11-01T08:30")).toBe(
      "2026-11-01T08:30:00.000Z",
    );
  });

  it("refuse une saisie incomplète", () => {
    expect(heureLocaleVersIso("")).toBeUndefined();
    expect(heureLocaleVersIso("2026-11-01")).toBeUndefined();
  });
});
