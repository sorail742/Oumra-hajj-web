import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import type { CapacitySimulation } from "../api/schemas";
import { CapacityScreen } from "./CapacityScreen";

const routeur = { replace: vi.fn() };
let recherche = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => routeur,
  useSearchParams: () => recherche,
}));

const fetchMock = vi.fn();

/** Voyages explicitement factices (idée #68). */
const periode = {
  from: "2026-11-08T00:00:00.000Z",
  to: "2026-11-11T00:00:00.000Z",
  packageIds: ["a", "b"],
  plannedPilgrims: 80,
  soldPilgrims: 55,
  guidesNeeded: 3,
  guidesNeededForSold: 3,
};
const simulation: CapacitySimulation = {
  pilgrimsPerGuide: 25,
  guides: 2,
  extraGuides: 0,
  staff: 2,
  trips: [
    {
      packageId: "a",
      title: "Oumra fictive",
      startDate: "2026-11-01T00:00:00.000Z",
      endDate: "2026-11-10T00:00:00.000Z",
      capacity: 50,
      seatsTaken: 45,
      guidesNeeded: 2,
      guidesAssigned: 1,
    },
    {
      packageId: "b",
      title: "Hadj fictif",
      startDate: "2026-11-08T00:00:00.000Z",
      endDate: "2026-11-20T00:00:00.000Z",
      capacity: 30,
      seatsTaken: 10,
      guidesNeeded: 1,
      guidesAssigned: 1,
    },
  ],
  periods: [periode],
  peak: periode,
  spareGuidesAtPeak: -1,
  extraPilgrimsAtPeak: 0,
};

beforeEach(() => {
  recherche = new URLSearchParams("ratio=25");
  fetchMock.mockResolvedValue(Response.json(simulation));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("CapacityScreen (idée #68)", () => {
  it("envoie les hypothèses de l'URL et montre le manque de guides", async () => {
    afficherAvecProviders(<CapacityScreen />);

    expect(
      await screen.findByText("Guides manquants au pic"),
    ).toBeInTheDocument();
    const url = String(fetchMock.mock.calls[0]?.[0]);
    expect(url).toContain("pilgrimsPerGuide=25");
    expect(url).toContain("extraGuides=0");
    expect(screen.getByText("1 / 2")).toHaveClass("text-warning");
    expect(
      screen.getByText(
        /Oumra fictive, Hadj fictif — 3 guides nécessaires pour 2 disponibles/,
      ),
    ).toBeInTheDocument();
  });
});
