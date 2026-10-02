import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { PackageDetailScreen } from "./PackageDetailScreen";

const fetchMock = vi.fn();

/** Forfait factice explicite (CLAUDE.md backend). */
const forfait = {
  id: "00000000-0000-4000-8000-000000000050",
  agencyId: "00000000-0000-4000-8000-000000000051",
  type: "oumra",
  title: "[DÉMO] Oumra factice — 15 jours",
  description: "Description factice.",
  startDate: "2026-11-30T00:00:00.000Z",
  endDate: "2026-12-14T00:00:00.000Z",
  price: 30000000,
  currency: "GNF",
  capacity: 20,
  seatsTaken: 17,
  status: "open",
  stages: [
    {
      id: "00000000-0000-4000-8000-000000000052",
      city: "Médine",
      hotelName: "Hôtel factice",
      distanceToMosqueMeters: 300,
      startDate: "2026-11-30T00:00:00.000Z",
      endDate: "2026-12-05T00:00:00.000Z",
    },
  ],
  inclusions: ["Vol (fictif)", "Visa (fictif)"],
};

beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("PackageDetailScreen", () => {
  it("affiche itinéraire, inclusions, places restantes et l'action fournie", async () => {
    fetchMock.mockResolvedValue(Response.json(forfait));
    afficherAvecProviders(
      <PackageDetailScreen
        id={forfait.id}
        reserver={(f) => <button type="button">réserver {f.id}</button>}
      />,
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: /oumra factice/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Médine")).toBeInTheDocument();
    expect(screen.getByText(/300 mètres de la mosquée/i)).toBeInTheDocument();
    expect(screen.getByText("Visa (fictif)")).toBeInTheDocument();
    expect(screen.getByText("3 places restantes")).toBeInTheDocument();
    expect(screen.getByText("15 jours")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /profil et les avis/i }),
    ).toHaveAttribute("href", `/agencies/${forfait.agencyId}`);
    expect(
      screen.getByRole("button", { name: `réserver ${forfait.id}` }),
    ).toBeInTheDocument();
  });

  it("dit clairement qu'un forfait est introuvable (404)", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        { statusCode: 404, timestamp: "", path: "", message: "x" },
        { status: 404 },
      ),
    );
    afficherAvecProviders(
      <PackageDetailScreen id="inconnu" reserver={() => null} />,
    );

    expect(
      await screen.findByText(/n'existe pas ou n'est plus disponible/i),
    ).toBeInTheDocument();
  });
});
