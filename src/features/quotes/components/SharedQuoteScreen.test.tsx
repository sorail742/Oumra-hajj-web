import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import type { SharedQuote } from "../api/schemas";
import { SharedQuoteScreen } from "./SharedQuoteScreen";

const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast }));

const fetchMock = vi.fn();

/** Devis explicitement factice (idée #49). */
const devis: SharedQuote = {
  number: "DEV-2026-00001",
  issuer: {
    name: "Agence Factice",
    phone: "+224600000000",
    email: "agence@example.com",
  },
  clientName: "Mosquée Factice",
  pilgrimsCount: 30,
  currency: "GNF",
  lines: [{ label: "Forfait", quantity: 30, unitPrice: 1000, total: 30000 }],
  subtotal: 30000,
  discountRate: 0.1,
  discountAmount: 3000,
  totalAmount: 27000,
  conditions: "Acompte de 30 % à la signature.",
  validUntil: "2026-11-30T23:59:59.000Z",
  status: "sent",
  expired: false,
};

beforeEach(() => {
  fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
    Promise.resolve(
      Response.json(
        init?.method === "POST"
          ? {
              ...devis,
              status: "accepted",
              respondedAt: "2026-10-09T12:00:00.000Z",
            }
          : devis,
      ),
    ),
  );
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("SharedQuoteScreen (idée #49)", () => {
  it("montre le devis et enregistre l'accord du client", async () => {
    const user = userEvent.setup();
    afficherAvecProviders(<SharedQuoteScreen token="jeton-factice" />);

    expect(
      await screen.findByText("Devis pour Mosquée Factice"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Acompte de 30 % à la signature."),
    ).toBeInTheDocument();
    expect(screen.getByText(/^Remise \(10,0/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Accepter le devis" }));
    const dialogue = await screen.findByRole("dialog");
    await user.click(
      within(dialogue).getByRole("button", { name: "Accepter le devis" }),
    );

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Merci, l'agence est prévenue de votre accord.",
      ),
    );
    const appel = fetchMock.mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === "POST",
    );
    expect(String(appel?.[0])).toContain(
      "/api/quotes/shared/jeton-factice/accept",
    );
    expect(
      await screen.findByText(/Réponse enregistrée le/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Refuser" }),
    ).not.toBeInTheDocument();
  });

  it("ne propose pas de réponse sur un devis expiré", async () => {
    fetchMock.mockResolvedValue(Response.json({ ...devis, expired: true }));
    afficherAvecProviders(<SharedQuoteScreen token="jeton-factice" />);

    expect(
      await screen.findByText(/Ce devis n'est plus valable/),
    ).toBeInTheDocument();
    expect(screen.getByText("Expiré")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Accepter le devis" }),
    ).not.toBeInTheDocument();
  });

  it("explique un lien inconnu", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        { statusCode: 404, message: "Devis introuvable" },
        { status: 404 },
      ),
    );
    afficherAvecProviders(<SharedQuoteScreen token="inconnu" />);
    expect(await screen.findByText("Devis introuvable")).toBeInTheDocument();
  });
});
