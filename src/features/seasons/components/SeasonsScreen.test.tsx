import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import type { SeasonComparison } from "../api/schemas";
import { SeasonsScreen } from "./SeasonsScreen";

const routeur = { replace: vi.fn() };
let recherche = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => routeur,
  useSearchParams: () => recherche,
}));

const fetchMock = vi.fn();

/** Saisons explicitement factices (idée #65). */
const comparatif: SeasonComparison = {
  fromYear: 2025,
  toYear: 2026,
  seasons: [
    {
      year: 2026,
      type: "oumra",
      packages: 2,
      capacity: 20,
      bookings: 2,
      cancellations: 1,
      fillRate: 0.1,
      cancellationRate: 0.333,
      averagePrice: [{ currency: "GNF", amount: 1500 }],
      collected: [],
      reviews: 2,
      averageRating: 4.5,
      disputes: 1,
    },
  ],
};

beforeEach(() => {
  recherche = new URLSearchParams("from=2025&to=2026");
  fetchMock.mockResolvedValue(Response.json(comparatif));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("SeasonsScreen (idée #65)", () => {
  it("demande la période de l'URL et affiche une ligne par saison", async () => {
    afficherAvecProviders(<SeasonsScreen />);

    // Cartes sur mobile et tableau dès `sm` : les deux sont dans le DOM.
    expect(await screen.findAllByText("Oumra 2026")).toHaveLength(2);
    const url = String(fetchMock.mock.calls[0]?.[0]);
    expect(url).toContain("fromYear=2025");
    expect(url).toContain("toYear=2026");
    expect(screen.getAllByText("4,5 (2 avis)")).toHaveLength(2);
    expect(screen.getByText("2 / 20 (10,0 %)")).toBeInTheDocument();
  });

  it("propose d'autres années quand la période est vide", async () => {
    fetchMock.mockResolvedValue(Response.json({ ...comparatif, seasons: [] }));
    afficherAvecProviders(<SeasonsScreen />);
    expect(
      await screen.findByText("Aucun voyage sur cette période"),
    ).toBeInTheDocument();
  });
});
