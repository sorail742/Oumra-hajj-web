import { describe, expect, it } from "vitest";
import { initiales } from "./use-current-user";

describe("initiales", () => {
  it("prend la première et la dernière initiale", () => {
    expect(initiales("Mariama Diallo")).toBe("MD");
    expect(initiales("Aïcha")).toBe("A");
    expect(initiales("élodie bah camara")).toBe("ÉC");
  });

  it("ignore les étiquettes et la ponctuation", () => {
    expect(initiales("[DÉMO] Mariama Diallo")).toBe("MD");
    expect(initiales("(Agence) Al-Amane")).toBe("AA");
  });

  it("retombe sur « ? » sans lettre", () => {
    expect(initiales("   ")).toBe("?");
    expect(initiales("[DÉMO]")).toBe("?");
  });
});
