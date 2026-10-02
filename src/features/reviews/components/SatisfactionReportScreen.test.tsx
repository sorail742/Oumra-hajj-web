import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { SatisfactionReportScreen } from "./SatisfactionReportScreen";

vi.mock("@/lib/auth/role-context", () => ({ useRole: () => "agency" }));

const fetchMock = vi.fn();

/** Rapport factice. */
const rapport = {
  agencyId: "a1",
  agencyName: "Agence Factice",
  generatedAt: "2026-10-02T10:00:00.000Z",
  reviewCount: 4,
  reviewAverage: 4.25,
  ratingDistribution: [
    { rating: 5, count: 2 },
    { rating: 4, count: 1 },
    { rating: 3, count: 1 },
  ],
  reviews: [
    {
      rating: 5,
      comment: "Très bon accompagnement (factice)",
      createdAt: "2026-09-30T00:00:00.000Z",
    },
    { rating: 4, createdAt: "2026-09-29T00:00:00.000Z" },
  ],
};

beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("SatisfactionReportScreen (ticket #78)", () => {
  it("présente la note moyenne à la française, la répartition et les commentaires", async () => {
    fetchMock.mockResolvedValue(Response.json(rapport));
    afficherAvecProviders(<SatisfactionReportScreen />);

    expect(await screen.findByText("4,3 sur 5")).toBeInTheDocument();
    const repartition = screen
      .getByRole("heading", { name: "Répartition des notes" })
      .closest("section") as HTMLElement;
    expect(within(repartition).getAllByRole("listitem")).toHaveLength(5);
    expect(within(repartition).getByText("(50 %)")).toBeInTheDocument();
    expect(
      screen.getByText("Très bon accompagnement (factice)"),
    ).toBeInTheDocument();
  });

  it("propose l'export CSV par le proxy, et « pas encore de note » sans avis", async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        ...rapport,
        reviewCount: 0,
        reviewAverage: undefined,
        ratingDistribution: [],
        reviews: [],
      }),
    );
    afficherAvecProviders(<SatisfactionReportScreen />);

    expect(await screen.findByText("Pas encore de note")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Exporter en CSV" }),
    ).toHaveAttribute("href", "/api/reviews/agency/me/satisfaction-report/csv");
  });
});
