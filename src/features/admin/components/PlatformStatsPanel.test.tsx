import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { PlatformStatsPanel } from "./PlatformStatsPanel";

vi.mock("@/lib/auth/role-context", () => ({ useRole: () => "admin" }));

const fetchMock = vi.fn();

/** Statistiques factices. */
const stats = {
  totalPilgrims: 1250,
  totalGuides: 12,
  agenciesByStatus: { pending: 3, approved: 6, rejected: 1 },
  bookingsByStatus: {
    pending_payment: 5,
    confirmed: 10,
    cancelled: 0,
    completed: 5,
  },
  totalRevenue: 45000000,
};

beforeEach(() => {
  fetchMock.mockResolvedValue(Response.json(stats));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("PlatformStatsPanel (ticket #69)", () => {
  it("met en avant les agences à valider avec un lien filtré", async () => {
    afficherAvecProviders(<PlatformStatsPanel />);

    const tuile = (
      await screen.findByRole("heading", { name: "Agences à valider" })
    ).closest("section") as HTMLElement;
    expect(within(tuile).getByText("3")).toBeInTheDocument();
    expect(
      within(tuile).getByRole("link", { name: "Examiner les dossiers" }),
    ).toHaveAttribute("href", "/agencies?status=pending");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/stats",
      expect.anything(),
    );
  });

  it("répartit les réservations par statut avec nombre et part", async () => {
    afficherAvecProviders(<PlatformStatsPanel />);

    const bloc = (
      await screen.findByRole("heading", { name: "Réservations par statut" })
    ).closest("section") as HTMLElement;
    expect(within(bloc).getByText("Total : 20")).toBeInTheDocument();
    const confirmee = within(bloc).getByText("Confirmée").closest("li");
    expect(confirmee).toHaveTextContent(/10\s*\(50\s?%\)/);
    expect(within(bloc).getAllByRole("listitem")).toHaveLength(4);
  });
});
