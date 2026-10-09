import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { CoverageCard } from "./CoverageCard";

const fetchMock = vi.fn();

/** Couverture explicitement factice (idée #63). */
beforeEach(() => {
  fetchMock.mockResolvedValue(
    Response.json({
      packageId: "forfait-1",
      packageTitle: "Oumra fictive",
      from: "2026-11-01T00:00:00.000Z",
      to: "2026-11-03T00:00:00.000Z",
      coveredHours: 36,
      totalHours: 48,
      gaps: [
        { from: "2026-11-02T12:00:00.000Z", to: "2026-11-03T00:00:00.000Z" },
      ],
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("CoverageCard (idée #63)", () => {
  it("affiche la part couverte en pourcentage et les trous", async () => {
    afficherAvecProviders(<CoverageCard packageId="forfait-1" />);

    expect(
      await screen.findByText(/36 h couvertes sur 48 h \(75/),
    ).toBeInTheDocument();
    expect(
      screen.getByText("1 période sans personne d'astreinte"),
    ).toBeInTheDocument();
  });
});
