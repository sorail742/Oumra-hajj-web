import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { DocumentAccessButton } from "./DocumentAccessButton";
import messages from "@/messages/fr.json";

/**
 * Incarnation directe de `CLAUDE.md` règle 14 : l'URL signée n'est jamais
 * réutilisée d'un clic à l'autre, jamais assignée à un `src` persistant.
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
        <DocumentAccessButton documentId="doc-1" />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

describe("DocumentAccessButton", () => {
  beforeEach(() => {
    get.mockReset();
  });

  it("ouvre un onglet vierge avant l'appel réseau, puis le navigue vers l'URL reçue", async () => {
    get.mockResolvedValue({ url: "https://backend.local/signed/1" });
    const fausseFenetre = { location: { href: "" } };
    const openSpy = vi
      .spyOn(window, "open")
      .mockReturnValue(fausseFenetre as unknown as Window);

    afficher();
    fireEvent.click(screen.getByRole("button"));

    expect(openSpy).toHaveBeenCalledWith("", "_blank", "noopener,noreferrer");
    await waitFor(() =>
      expect(fausseFenetre.location.href).toBe(
        "https://backend.local/signed/1",
      ),
    );

    openSpy.mockRestore();
  });

  it("refait un appel réseau frais à chaque clic, jamais une URL réutilisée depuis un cache", async () => {
    get
      .mockResolvedValueOnce({ url: "https://backend.local/signed/1" })
      .mockResolvedValueOnce({ url: "https://backend.local/signed/2" });
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
