import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { AgencyDirectoryScreen } from "./AgencyDirectoryScreen";

const fetchMock = vi.fn();

/** Annuaire explicitement factice. */
const annuaire = [
  {
    id: "a1",
    legalName: "Al Amane Voyages (factice)",
    address: "Conakry",
    validatedAt: "2026-09-01T00:00:00.000Z",
    trustScore: { reviewCount: 0, badge: "verified" },
  },
  {
    id: "a2",
    legalName: "Zamzam Évasion (factice)",
    trustScore: {
      reviewAverage: 4.5,
      reviewCount: 12,
      score: 88,
      badge: "trusted",
    },
  },
];

beforeEach(() => {
  fetchMock.mockResolvedValue(Response.json(annuaire));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("AgencyDirectoryScreen (idée #71)", () => {
  it("présente chaque agence validée avec ses avis, sans note inventée", async () => {
    afficherAvecProviders(
      <AgencyDirectoryScreen badge={(a) => <span>badge-{a.id}</span>} />,
    );

    expect(
      await screen.findByText("Al Amane Voyages (factice)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Pas encore d'avis")).toBeInTheDocument();
    expect(screen.getByText("4,5 / 5 · 12 avis")).toBeInTheDocument();
    expect(screen.getByText("badge-a2")).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Ses forfaits" })[1],
    ).toHaveAttribute("href", "/packages?agencyId=a2");
  });

  it("filtre par nom, sans tenir compte des accents", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<AgencyDirectoryScreen badge={() => null} />);

    await screen.findByText("Al Amane Voyages (factice)");
    await utilisateur.type(screen.getByRole("searchbox"), "evasion");

    expect(screen.queryByText("Al Amane Voyages (factice)")).toBeNull();
    expect(screen.getByText("Zamzam Évasion (factice)")).toBeInTheDocument();
  });
});
