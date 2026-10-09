import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { AgencyPlanningScreen } from "./GuidePlanningScreen";

const routeur = { replace: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => routeur,
  useSearchParams: () => new URLSearchParams("from=2026-12-01"),
}));

const fetchMock = vi.fn();

/** Planning explicitement factice (idée #42). */
const plannings = [
  {
    guideId: "g1",
    guideName: "Guide Factice",
    entries: [
      {
        kind: "group",
        id: "gr1",
        label: "Groupe décembre",
        packageTitle: "Oumra fictive",
        startDate: "2026-12-01T00:00:00.000Z",
        endDate: "2026-12-15T00:00:00.000Z",
      },
      {
        kind: "unavailability",
        id: "u1",
        label: "Congé",
        startDate: "2026-12-14T00:00:00.000Z",
        endDate: "2026-12-20T00:00:00.000Z",
      },
    ],
    conflicts: [
      {
        firstId: "gr1",
        secondId: "u1",
        startDate: "2026-12-14T00:00:00.000Z",
        endDate: "2026-12-15T00:00:00.000Z",
      },
    ],
  },
];

beforeEach(() => {
  fetchMock.mockResolvedValue(Response.json(plannings));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("AgencyPlanningScreen (idée #42)", () => {
  it("liste les missions de chaque guide et signale le chevauchement", async () => {
    afficherAvecProviders(<AgencyPlanningScreen />);

    expect(await screen.findByText("Guide Factice")).toBeInTheDocument();
    expect(screen.getByText("Groupe décembre")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Chevauchement « Groupe décembre » / « Congé » du 14/12/2026 au 15/12/2026.",
    );
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/api/guide-planning?from=2026-12-01",
    );
    expect(
      screen.getByRole("button", {
        name: "Supprimer l'indisponibilité « Congé »",
      }),
    ).toBeInTheDocument();
  });
});
