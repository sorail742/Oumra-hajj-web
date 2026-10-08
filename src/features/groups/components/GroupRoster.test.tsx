import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { GroupRoster } from "./GroupRoster";

const fetchMock = vi.fn();

/** Liste explicitement factice. */
const liste = {
  groupId: "g1",
  groupTitle: "Groupe factice",
  generatedAt: "2026-10-08T12:00:00.000Z",
  members: [
    {
      userId: "p1",
      fullName: "Alpha Factice",
      phone: "+224600000001",
      bookingStatus: "confirmed",
      emergencyContact: {
        fullName: "Proche Factice",
        phone: "+224600000002",
        relationship: "frère",
      },
      specialNeeds: { mobility: "wheelchair", medical: "Traitement factice" },
    },
    { userId: "p2", fullName: "Binta Factice" },
  ],
};

beforeEach(() => {
  fetchMock.mockResolvedValue(Response.json(liste));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("GroupRoster (idée #41)", () => {
  it("liste chaque membre avec son contact d'urgence et ses besoins", async () => {
    afficherAvecProviders(<GroupRoster groupId="g1" />);

    expect(
      (await screen.findAllByText("Alpha Factice")).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Proche Factice (frère)").length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Fauteuil roulant").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Traitement factice").length).toBeGreaterThan(0);
    // Sans contact ni besoin : signalé, jamais inventé.
    expect(
      screen.getAllByText("Aucun contact d'urgence").length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Aucun besoin déclaré").length).toBeGreaterThan(
      0,
    );
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/groups/g1/roster");
  });

  it("propose le téléchargement CSV relayé par le proxy", async () => {
    afficherAvecProviders(<GroupRoster groupId="g1" />);
    expect(
      screen.getByRole("link", { name: "Télécharger (CSV)" }),
    ).toHaveAttribute("href", "/api/groups/g1/roster/csv");
  });
});
