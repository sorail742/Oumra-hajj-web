import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { TreasuryCard } from "./TreasuryCard";
import { RoleProvider } from "@/lib/auth/role-context";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";

/** Montants explicitement factices. */
const fetchMock = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

function afficher() {
  return afficherAvecProviders(
    <RoleProvider role="agency">
      <TreasuryCard />
    </RoleProvider>,
  );
}

describe("TreasuryCard", () => {
  it("affiche les totaux et les encaissements prévus par mois", async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        totalExpected: 1500,
        totalCollected: 900,
        outstandingBalance: 600,
        projections: [{ month: "2027-02", expectedAmount: 600 }],
      }),
    );
    afficher();

    expect(await screen.findByText("Reste à encaisser")).toBeInTheDocument();
    expect(screen.getByText("février 2027")).toBeInTheDocument();
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/payments/agency/treasury");
  });

  it("annonce l'absence de réservation en cours", async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        totalExpected: 0,
        totalCollected: 0,
        outstandingBalance: 0,
        projections: [],
      }),
    );
    afficher();

    expect(
      await screen.findByText("Aucune réservation en cours pour le moment."),
    ).toBeInTheDocument();
  });
});
