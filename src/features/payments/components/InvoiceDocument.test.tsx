import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { InvoiceDocument } from "./InvoiceDocument";

const fetchMock = vi.fn();

/** Facture explicitement factice (idée #37). */
const facture = {
  number: "FAC-2026-00001",
  issuedAt: "2026-10-08T00:00:00.000Z",
  bookingId: "r1",
  seller: { name: "Agence Factice", taxId: "NIF-FACTICE" },
  buyer: { name: "Pèlerin Factice" },
  packageTitle: "Oumra fictive",
  packageType: "oumra",
  startDate: "2026-12-01T00:00:00.000Z",
  endDate: "2026-12-15T00:00:00.000Z",
  totalAmount: 3000,
  currency: "GNF",
  payments: [
    {
      date: "2026-10-01T00:00:00.000Z",
      amount: 1000,
      method: "card",
      status: "succeeded",
      receiptRef: "RCPT-FACTICE",
    },
  ],
  paid: 1000,
  refunded: 0,
  balanceDue: 2000,
};

beforeEach(() => {
  fetchMock.mockResolvedValue(Response.json(facture));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("InvoiceDocument (idée #37)", () => {
  it("affiche numéro, parties, mentions légales, versements et reste dû", async () => {
    afficherAvecProviders(<InvoiceDocument bookingId="r1" />);

    expect(await screen.findByText("FAC-2026-00001")).toBeInTheDocument();
    expect(screen.getByText("NIF-FACTICE")).toBeInTheDocument();
    // RCCM absent : signalé, jamais inventé.
    expect(screen.getByText("non renseigné")).toBeInTheDocument();
    expect(screen.getByText("RCPT-FACTICE")).toBeInTheDocument();
    expect(screen.getByText("Reste dû")).toBeInTheDocument();
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/bookings/r1/invoice");
  });
});
