import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { RoleProvider } from "@/lib/auth/role-context";
import { FamilyShareCard } from "./FamilyShareCard";
import { FamilyViewScreen } from "./FamilyViewScreen";

const fetchMock = vi.fn();
const RESERVATION = "00000000-0000-4000-8000-0000000000b1";

/** Vue famille factice. */
const vue = {
  pilgrimFullName: "Aminata Factice",
  packageTitle: "Oumra Ramadan (factice)",
  status: "confirmed",
  steps: [
    { key: "visa", status: "done", updatedAt: "2026-10-01T00:00:00.000Z" },
  ],
  latestItineraryStep: {
    label: "Arrivée à Médine",
    date: "2026-11-02T00:00:00.000Z",
  },
};

beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("Vue famille — page du proche (ticket #75)", () => {
  it("affiche l'avancement sans jamais fabriquer de position", async () => {
    fetchMock.mockResolvedValue(Response.json(vue));
    afficherAvecProviders(
      <FamilyViewScreen
        token="jeton-factice"
        etapes={(steps) => <p>{steps.length} étape(s)</p>}
      />,
    );

    expect(
      await screen.findByRole("heading", { name: "Aminata Factice" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Arrivée à Médine/)).toBeInTheDocument();
    expect(
      screen.getByText("Aucune position partagée pour le moment."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Voir sur la carte" }),
    ).toBeNull();
    expect(screen.getByText("1 étape(s)")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/family-view/jeton-factice",
      expect.anything(),
    );
  });

  it("propose la carte quand une position a été partagée", async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        ...vue,
        location: {
          lat: 21.42,
          lng: 39.82,
          updatedAt: "2026-11-03T08:00:00.000Z",
        },
      }),
    );
    afficherAvecProviders(
      <FamilyViewScreen token="jeton-factice" etapes={() => null} />,
    );

    expect(
      await screen.findByRole("link", { name: "Voir sur la carte" }),
    ).toHaveAttribute("href", expect.stringContaining("mlat=21.42&mlon=39.82"));
  });

  it("explique un lien invalidé (404)", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        { statusCode: 404, timestamp: "", path: "", message: "x" },
        { status: 404 },
      ),
    );
    afficherAvecProviders(
      <FamilyViewScreen token="ancien" etapes={() => null} />,
    );

    expect(
      await screen.findByText("Ce lien de suivi n'est plus valide."),
    ).toBeInTheDocument();
  });
});

describe("FamilyShareCard (ticket #75)", () => {
  it("affiche le lien absolu de la page et le régénère après confirmation", async () => {
    fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
      Promise.resolve(
        Response.json(
          init?.method === "POST"
            ? {
                token: "nouveau-jeton",
                viewUrl: "/api/v1/family-view/nouveau-jeton",
              }
            : {
                token: "jeton-factice",
                viewUrl: "/api/v1/family-view/jeton-factice",
              },
        ),
      ),
    );
    const utilisateur = userEvent.setup();
    afficherAvecProviders(
      <RoleProvider role="pilgrim">
        <FamilyShareCard bookingId={RESERVATION} />
      </RoleProvider>,
    );

    expect(
      await screen.findByText(`${location.origin}/family/jeton-factice`),
    ).toBeInTheDocument();
    await utilisateur.click(
      screen.getByRole("button", {
        name: "Désactiver et créer un nouveau lien",
      }),
    );
    await utilisateur.click(
      within(await screen.findByRole("dialog")).getByRole("button", {
        name: "Créer un nouveau lien",
      }),
    );

    expect(
      await screen.findByText(`${location.origin}/family/nouveau-jeton`),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/bookings/${RESERVATION}/family-view-link/regenerate`,
        expect.objectContaining({ method: "POST" }),
      ),
    );
  });
});
