import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import type { Profitability } from "../api/schemas";
import { ProfitabilitySimulator } from "./ProfitabilitySimulator";

const fetchMock = vi.fn();

/** Montants explicitement factices (idée #48). */
const resultat: Profitability = {
  currency: "GNF",
  price: 1000,
  capacity: 40,
  commissionRate: 0.05,
  costPerPilgrim: 700,
  fixedCostsTotal: 3000,
  unitContribution: 250,
  breakEvenPilgrims: 12,
  breakEvenReachable: true,
  minimumPrice: 842.11,
  scenarios: [
    {
      kind: "expected",
      pilgrims: 40,
      revenue: 40000,
      platformCommission: 2000,
      variableCosts: 28000,
      fixedCosts: 3000,
      margin: 7000,
      marginRate: 0.175,
      marginPerPilgrim: 175,
    },
  ],
};

beforeEach(() => {
  fetchMock.mockResolvedValue(Response.json(resultat));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("ProfitabilitySimulator (idée #48)", () => {
  it("exige prix et capacité pour une nouvelle offre", async () => {
    const user = userEvent.setup();
    afficherAvecProviders(<ProfitabilitySimulator forfaits={[]} />);

    await user.click(screen.getByRole("button", { name: "Simuler" }));

    expect(
      await screen.findByText("Indiquez le prix envisagé."),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("envoie les hypothèses sans taux de commission et affiche le résultat", async () => {
    const user = userEvent.setup();
    afficherAvecProviders(<ProfitabilitySimulator forfaits={[]} />);

    await user.type(screen.getByLabelText("Prix par pèlerin"), "1000");
    await user.type(screen.getByLabelText("Capacité"), "40");
    const parPelerin = "Coûts par pèlerin — montant de la ligne";
    await user.type(screen.getByLabelText(`${parPelerin} 1`), "500");
    await user.type(screen.getByLabelText(`${parPelerin} 2`), "150");
    await user.type(screen.getByLabelText(`${parPelerin} 3`), "50");
    await user.type(
      screen.getByLabelText("Coûts fixes du voyage — montant de la ligne 1"),
      "3000",
    );
    await user.click(screen.getByRole("button", { name: "Simuler" }));

    expect(await screen.findByText("Seuil de rentabilité")).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/profitability/simulation");
    const corps = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(corps).toEqual({
      price: 1000,
      capacity: 40,
      costsPerPilgrim: [
        { label: "Billet d'avion", amount: 500 },
        { label: "Hébergement", amount: 150 },
        { label: "Visa", amount: 50 },
      ],
      fixedCosts: [{ label: "Encadrement", amount: 3000 }],
    });
    expect(corps).not.toHaveProperty("commissionRate");
    expect(screen.getByText("12")).toBeInTheDocument();
  });
});
