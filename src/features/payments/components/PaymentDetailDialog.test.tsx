import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import type { Payment } from "../api/schemas";
import { PaymentDetailDialog } from "./PaymentDetailDialog";

const fetchMock = vi.fn();

/** Paiement factice — références explicitement factices. */
const paiement: Payment = {
  id: "p1",
  bookingId: "RESERVATION-FACTICE",
  amount: 5000000,
  currency: "GNF",
  installmentNumber: 2,
  method: "mobile_money_orange",
  status: "succeeded",
  providerReference: "OPERATEUR-FACTICE-001",
  receiptRef: "RECU-FACTICE-001",
  confirmedAt: "2026-10-01T10:00:00.000Z",
};

beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("PaymentDetailDialog (ticket #76)", () => {
  it("rafraîchit le paiement à l'ouverture et affiche le reçu d'un paiement réussi", async () => {
    fetchMock.mockResolvedValue(Response.json(paiement));
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<PaymentDetailDialog payment={paiement} />);

    expect(fetchMock).not.toHaveBeenCalled();
    await utilisateur.click(screen.getByRole("button", { name: "Détails" }));

    const dialogue = await screen.findByRole("dialog", {
      name: "Tranche n° 2",
    });
    expect(within(dialogue).getByText("OPERATEUR-FACTICE-001")).toHaveClass(
      "font-mono",
    );
    expect(
      within(dialogue).getByRole("heading", { name: "Reçu de paiement" }),
    ).toBeInTheDocument();
    expect(within(dialogue).getByText("RECU-FACTICE-001")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/payments/p1",
      expect.anything(),
    );
  });

  it("n'affiche pas de reçu pour un paiement remboursé, mais le remboursement", async () => {
    const rembourse: Payment = {
      ...paiement,
      status: "refunded",
      refundedAmount: 2500000,
      refundedAt: "2026-10-02T10:00:00.000Z",
    };
    fetchMock.mockResolvedValue(Response.json(rembourse));
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<PaymentDetailDialog payment={rembourse} />);

    await utilisateur.click(screen.getByRole("button", { name: "Détails" }));
    const dialogue = await screen.findByRole("dialog");

    expect(within(dialogue).getByText("Montant remboursé")).toBeInTheDocument();
    expect(
      within(dialogue).queryByRole("heading", { name: "Reçu de paiement" }),
    ).toBeNull();
  });
});
