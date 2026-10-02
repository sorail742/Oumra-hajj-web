import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { RoleProvider } from "@/lib/auth/role-context";
import type { Role } from "@/lib/auth/permissions";
import { BookingExpiryAlerts, MyDocumentsExpiryAlerts } from "./ExpiryAlerts";

const fetchMock = vi.fn();
const RESERVATION = "00000000-0000-4000-8000-0000000000e1";

/** Alertes factices. */
const alertes = [
  {
    id: "d1",
    type: "passport",
    expiresAt: "2026-11-20T00:00:00.000Z",
    status: "expires_before_trip",
  },
];

function afficher(role: Role, ui: React.ReactElement) {
  afficherAvecProviders(<RoleProvider role={role}>{ui}</RoleProvider>);
}

beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("Alertes d'expiration (ticket #57)", () => {
  it("affiche le statut du registre et propose au pèlerin de déposer une pièce", async () => {
    fetchMock.mockResolvedValue(Response.json(alertes));
    afficher("pilgrim", <BookingExpiryAlerts bookingId={RESERVATION} />);

    expect(
      await screen.findByText("Expire avant le retour"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Passeport : expire le/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Déposer une pièce à jour" }),
    ).toHaveAttribute("href", "#depot-pieces");
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/documents/expiry-alerts?bookingId=${RESERVATION}`,
      expect.anything(),
    );
  });

  it("invite l'agence à prévenir le pèlerin, sans lien de dépôt", async () => {
    fetchMock.mockResolvedValue(Response.json(alertes));
    afficher("agency", <BookingExpiryAlerts bookingId={RESERVATION} />);

    expect(await screen.findByText(/Prévenez le pèlerin/)).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("n'affiche rien sans alerte", async () => {
    fetchMock.mockResolvedValue(Response.json([]));
    afficher("pilgrim", <BookingExpiryAlerts bookingId={RESERVATION} />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("regroupe les alertes de tous les dossiers du pèlerin", async () => {
    fetchMock.mockImplementation((url: string) =>
      Promise.resolve(
        url === "/api/documents/mine"
          ? Response.json([
              {
                id: "d1",
                bookingId: RESERVATION,
                type: "passport",
                status: "validated",
              },
            ])
          : Response.json(alertes),
      ),
    );
    afficher("pilgrim", <MyDocumentsExpiryAlerts />);

    expect(
      await screen.findByText("Une pièce demande votre attention"),
    ).toBeInTheDocument();
  });
});
