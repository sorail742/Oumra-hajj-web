import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { LegalDocumentAccessButton } from "./LegalDocumentAccessButton";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";

/**
 * Même garde-fou que `DocumentAccessButton.test.tsx` (règle 14) — une URL
 * signée n'est jamais réutilisée d'un clic à l'autre.
 */
const get = vi.fn();
vi.mock("@/lib/api/client", () => ({
  api: { get: (...args: unknown[]) => get(...args) },
}));

function afficher() {
  return afficherAvecProviders(
    <LegalDocumentAccessButton documentId="doc-1" />,
  );
}

describe("LegalDocumentAccessButton", () => {
  beforeEach(() => {
    get.mockReset();
  });

  it("refait un appel réseau frais à chaque clic", async () => {
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
