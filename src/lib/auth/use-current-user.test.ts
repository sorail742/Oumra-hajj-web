import { describe, expect, it } from "vitest";
import { initiales } from "./use-current-user";

describe("initiales", () => {
  it.each([
    ["Aminata Diallo", "AD"],
    ["Mamadou Saliou Barry", "MB"],
    ["Fatou", "F"],
    ["  ", "?"],
  ])("%s → %s", (nom, attendu) => {
    expect(initiales(nom)).toBe(attendu);
  });
});
