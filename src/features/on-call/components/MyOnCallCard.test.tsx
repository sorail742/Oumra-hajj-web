import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import type { MyOnCall } from "../api/schemas";
import { MyOnCallCard } from "./MyOnCallCard";

const routeur = { replace: vi.fn() };
let recherche = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => routeur,
  useSearchParams: () => recherche,
}));

const fetchMock = vi.fn();

/** Astreinte explicitement factice (idée #63). */
const vue: MyOnCall = {
  bookingId: "resa-1",
  agencyName: "Agence Factice",
  agencyPhone: "+224600000000",
  current: [
    {
      staffName: "Mariama Factice",
      staffRole: "coordinator",
      phone: "+224620000001",
      startsAt: "2026-11-01T08:00:00.000Z",
      endsAt: "2026-11-01T20:00:00.000Z",
    },
  ],
  next: {
    staffName: "Ousmane Factice",
    staffRole: "guide",
    phone: "+224620000002",
    startsAt: "2026-11-01T20:00:00.000Z",
    endsAt: "2026-11-02T08:00:00.000Z",
  },
};

beforeEach(() => {
  recherche = new URLSearchParams();
  fetchMock.mockResolvedValue(Response.json(vue));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("MyOnCallCard (idée #63)", () => {
  it("propose d'appeler la personne d'astreinte, la suivante et l'agence", async () => {
    afficherAvecProviders(
      <MyOnCallCard
        reservations={[{ id: "resa-1", libelle: "Oumra fictive" }]}
      />,
    );

    expect(await screen.findByText("Mariama Factice")).toBeInTheDocument();
    expect(screen.getByText("Joignable maintenant")).toBeInTheDocument();
    expect(screen.getByText("Prochain créneau")).toBeInTheDocument();
    const appels = screen
      .getAllByRole("link")
      .map((l) => l.getAttribute("href"));
    expect(appels).toEqual([
      "tel:+224620000001",
      "tel:+224620000002",
      "tel:+224600000000",
    ]);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      "/api/on-call/booking/resa-1",
    );
    // Une seule réservation : pas de sélecteur.
    expect(screen.queryByLabelText("Réservation")).not.toBeInTheDocument();
  });

  it("signale l'absence d'astreinte et suit la réservation de l'URL", async () => {
    recherche = new URLSearchParams("booking=resa-2");
    fetchMock.mockResolvedValue(
      Response.json({
        ...vue,
        bookingId: "resa-2",
        current: [],
        next: undefined,
      }),
    );
    afficherAvecProviders(
      <MyOnCallCard
        reservations={[
          { id: "resa-1", libelle: "Oumra fictive" },
          { id: "resa-2", libelle: "Hadj fictif" },
        ]}
      />,
    );

    expect(
      await screen.findByText("Personne n'est d'astreinte en ce moment."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Réservation")).toHaveValue("resa-2");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      "/api/on-call/booking/resa-2",
    );
  });

  it("explique quoi faire sans réservation", () => {
    afficherAvecProviders(<MyOnCallCard reservations={[]} />);
    expect(screen.getByText("Aucune réservation en cours")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
