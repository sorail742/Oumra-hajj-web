import { describe, expect, it, vi } from "vitest";
import {
  ouvrirDansNouvelOnglet,
  urlNavigateurDepuisBackend,
} from "./url-backend";

describe("urlNavigateurDepuisBackend", () => {
  it("réécrit un chemin relatif /api/v1/... vers le proxy /api/...", () => {
    expect(urlNavigateurDepuisBackend("/api/v1/documents/files/jeton")).toBe(
      "/api/documents/files/jeton",
    );
  });

  it("laisse une URL absolue https inchangée", () => {
    expect(urlNavigateurDepuisBackend("https://stockage.test/signe?x=1")).toBe(
      "https://stockage.test/signe?x=1",
    );
  });

  it.each(["javascript:alert(1)", "//hote.test/x", "/autre/chemin", ""])(
    "refuse une forme non reconnue : %s",
    (url) => {
      expect(urlNavigateurDepuisBackend(url)).toBeNull();
    },
  );
});

describe("ouvrirDansNouvelOnglet", () => {
  it("ferme l'onglet vierge si l'URL ne peut pas être obtenue", async () => {
    const close = vi.fn();
    const openSpy = vi
      .spyOn(window, "open")
      .mockReturnValue({
        location: { href: "" },
        opener: {},
        close,
      } as unknown as Window);

    await expect(
      ouvrirDansNouvelOnglet(() => Promise.reject(new Error("réseau"))),
    ).rejects.toThrow();
    expect(close).toHaveBeenCalled();

    openSpy.mockRestore();
  });

  it("ferme l'onglet vierge si l'URL renvoyée n'est pas reconnue", async () => {
    const close = vi.fn();
    const fenetre = { location: { href: "" }, opener: {}, close };
    const openSpy = vi
      .spyOn(window, "open")
      .mockReturnValue(fenetre as unknown as Window);

    await expect(
      ouvrirDansNouvelOnglet(() => Promise.resolve("javascript:alert(1)")),
    ).rejects.toThrow();
    expect(close).toHaveBeenCalled();
    expect(fenetre.location.href).toBe("");

    openSpy.mockRestore();
  });
});
