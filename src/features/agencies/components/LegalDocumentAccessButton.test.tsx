import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { LegalDocumentAccessButton } from "./LegalDocumentAccessButton";
import messages from "@/messages/fr.json";

/**
 * Même garde-fou que `DocumentAccessButton.test.tsx` (règle 14) — une URL
 * signée n'est jamais réutilisée d'un clic à l'autre.
 */
const get = vi.fn();
vi.mock("@/lib/api/client", () => ({
  api: { get: (...args: unknown[]) => get(...args) },
}));

function afficher() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="fr" messages={messages}>
        <LegalDocumentAccessButton documentId="doc-1" />
      </NextIntlClientProvider>
    </QueryClientProvider>,
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
