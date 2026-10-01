import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { DocumentAccessButton } from "./DocumentAccessButton";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";

/**
 * Incarnation directe de `CLAUDE.md` règle 14 : l'URL signée n'est jamais
 * réutilisée d'un clic à l'autre, jamais assignée à un `src` persistant.
 */
const get = vi.fn();
vi.mock("@/lib/api/client", () => ({
  api: { get: (...args: unknown[]) => get(...args) },
}));

function afficher() {
  return afficherAvecProviders(<DocumentAccessButton documentId="doc-1" />);
}

/** Remplace `window.open` par un faux onglet dont on observe la navigation. */
function espionnerFenetre() {
  const fausseFenetre = { location: { href: "" }, opener: {} as unknown };
  const openSpy = vi
    .spyOn(window, "open")
    .mockReturnValue(fausseFenetre as unknown as Window);
  return { fausseFenetre, openSpy };
}

describe("DocumentAccessButton", () => {
  beforeEach(() => {
    get.mockReset();
  });

  it("ouvre un onglet vierge avant l'appel réseau, puis le navigue vers l'URL absolue reçue", async () => {
    get.mockResolvedValue({
      url: "https://backend.local/signed/1",
      expiresAt: "2026-01-01T00:05:00Z",
    });
    const { fausseFenetre, openSpy } = espionnerFenetre();

    afficher();
    fireEvent.click(screen.getByRole("button"));

    expect(openSpy).toHaveBeenCalledWith("", "_blank");
    expect(fausseFenetre.opener).toBeNull();
    await waitFor(() =>
      expect(fausseFenetre.location.href).toBe(
        "https://backend.local/signed/1",
      ),
    );

    openSpy.mockRestore();
  });

  it("réécrit un chemin relatif du backend (stockage local) vers le proxy", async () => {
    // Forme réelle renvoyée par LocalDiskStorageProvider (ticket #41).
    get.mockResolvedValue({
      url: "/api/v1/documents/files/jeton-factice",
      expiresAt: "2026-01-01T00:05:00Z",
    });
    const { fausseFenetre, openSpy } = espionnerFenetre();

    afficher();
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() =>
      expect(fausseFenetre.location.href).toBe(
        "/api/documents/files/jeton-factice",
      ),
    );

    openSpy.mockRestore();
  });

  it("refait un appel réseau frais à chaque clic, jamais une URL réutilisée depuis un cache", async () => {
    get
      .mockResolvedValueOnce({
        url: "https://backend.local/signed/1",
        expiresAt: "2026-01-01T00:05:00Z",
      })
      .mockResolvedValueOnce({
        url: "https://backend.local/signed/2",
        expiresAt: "2026-01-01T00:10:00Z",
      });
    vi.spyOn(window, "open").mockReturnValue({
      location: { href: "" },
    } as unknown as Window);

    afficher();
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(get).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
  });
});
