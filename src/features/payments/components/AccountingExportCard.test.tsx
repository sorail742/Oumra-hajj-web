import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { AccountingExportCard } from "./AccountingExportCard";

const routeur = { replace: vi.fn() };
let recherche = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => routeur,
  useSearchParams: () => recherche,
}));

const fetchMock = vi.fn();

/** Journal explicitement factice (idée #57). */
const journal = {
  from: "2026-10-01",
  to: "2026-10-31",
  currency: "GNF",
  totalCollected: 3000,
  totalRefunded: 500,
  net: 2500,
  entries: [
    {
      date: "2026-10-03T10:00:00.000Z",
      journal: "ENC",
      pieceRef: "RCPT-FACTICE-1",
      label: "Versement 1 — Pèlerin Factice — Oumra fictive",
      debit: 3000,
      credit: 0,
      currency: "GNF",
      method: "mobile_money_orange",
      providerReference: "REF-FACTICE-1",
      bookingId: "resa-1",
      installmentNumber: 1,
      pilgrimName: "Pèlerin Factice",
      packageTitle: "Oumra fictive",
    },
    {
      date: "2026-10-05T10:00:00.000Z",
      journal: "REM",
      pieceRef: "REMB-FACTICE-1",
      label: "Remboursement versement 1 — Pèlerin Factice — Oumra fictive",
      debit: 0,
      credit: 500,
      currency: "GNF",
      method: "mobile_money_orange",
      providerReference: "REF-FACTICE-1",
      bookingId: "resa-1",
      installmentNumber: 1,
      pilgrimName: "Pèlerin Factice",
      packageTitle: "Oumra fictive",
    },
  ],
};

beforeEach(() => {
  recherche = new URLSearchParams("from=2026-10-01&to=2026-10-31");
  fetchMock.mockResolvedValue(Response.json(journal));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("AccountingExportCard (idée #57)", () => {
  it("affiche totaux et écritures de la période de l'URL, et le lien CSV", async () => {
    afficherAvecProviders(<AccountingExportCard />);

    expect(
      (await screen.findAllByText("REMB-FACTICE-1")).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Net")).toBeInTheDocument();
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/api/payments/agency/accounting?from=2026-10-01&to=2026-10-31",
    );
    expect(
      screen.getByRole("link", { name: /Télécharger le CSV/ }),
    ).toHaveAttribute(
      "href",
      "/api/payments/agency/accounting/csv?from=2026-10-01&to=2026-10-31",
    );
  });

  it("signale une période inversée sans interroger le backend", () => {
    recherche = new URLSearchParams("from=2026-10-31&to=2026-10-01");
    afficherAvecProviders(<AccountingExportCard />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "La date de début doit précéder la date de fin.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByRole("link", { name: /Télécharger/ })).toBeNull();
  });
});
