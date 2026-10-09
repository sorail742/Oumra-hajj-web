import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import type { Payment } from "../api/schemas";
import { RefundRequestFlow } from "./RefundRequestFlow";

const fetchMock = vi.fn();

/** Paiement explicitement factice (idée #58). */
const paiement = {
  id: "p1",
  bookingId: "r1",
  amount: 1000,
  currency: "GNF",
  installmentNumber: 1,
  method: "card",
  status: "succeeded",
  providerReference: "REF-FACTICE",
} as Payment;

beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("RefundRequestFlow (idée #58)", () => {
  it("affiche le taux, le montant et la règle calculés par le backend", async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        paymentId: "p1",
        eligibleRate: 0.5,
        refundableAmount: 500,
        currency: "GNF",
        rule: "agency_tier",
        daysBeforeDeparture: 40,
        tiers: [],
      }),
    );
    afficherAvecProviders(<RefundRequestFlow payment={paiement} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Demander un remboursement" }),
    );

    expect(await screen.findByText("50 %")).toBeInTheDocument();
    expect(
      screen.getByText("Barème de l'agence, à 40 jours du départ."),
    ).toBeInTheDocument();
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/api/payments/p1/refund-preview",
    );
    expect(
      screen.getByRole("button", { name: "Confirmer le remboursement" }),
    ).toBeEnabled();
  });

  it("bloque la confirmation quand plus rien n'est remboursable", async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        paymentId: "p1",
        eligibleRate: 0,
        refundableAmount: 0,
        currency: "GNF",
        rule: "not_refundable",
        daysBeforeDeparture: 2,
        tiers: [],
      }),
    );
    afficherAvecProviders(<RefundRequestFlow payment={paiement} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Demander un remboursement" }),
    );

    expect(
      await screen.findByText(/n'est plus remboursable/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirmer le remboursement" }),
    ).toBeDisabled();
  });
});
