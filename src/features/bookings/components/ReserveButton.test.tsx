import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { RoleProvider } from "@/lib/auth/role-context";
import type { Role } from "@/lib/auth/permissions";
import { ReserveButton } from "./ReserveButton";

const routeur = { push: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => routeur }));

const fetchMock = vi.fn();
const FORFAIT = "00000000-0000-4000-8000-000000000050";

/** Réservation factice conforme au schéma, juste ce qu'il faut. */
const reservation = {
  id: "00000000-0000-4000-8000-000000000060",
  pilgrimId: "00000000-0000-4000-8000-000000000061",
  packageId: FORFAIT,
  agencyId: "00000000-0000-4000-8000-000000000062",
  status: "pending_payment",
  steps: [],
};

function afficher(role: Role | undefined, reservable = true) {
  afficherAvecProviders(
    <RoleProvider role={role}>
      <ReserveButton packageId={FORFAIT} reservable={reservable} />
    </RoleProvider>,
  );
}

beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("ReserveButton", () => {
  it("renvoie un visiteur anonyme vers la connexion SMS, retour sur le forfait", () => {
    afficher(undefined);
    expect(
      screen.getByRole("link", { name: /se connecter pour réserver/i }),
    ).toHaveAttribute(
      "href",
      "/otp?next=" + encodeURIComponent("/packages/" + FORFAIT),
    );
  });

  it("n'offre pas la réservation à une agence", () => {
    afficher("agency");
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText(/compte pèlerin/i)).toBeInTheDocument();
  });

  it("réserve puis ouvre le dossier du pèlerin", async () => {
    fetchMock.mockResolvedValue(Response.json(reservation, { status: 201 }));
    afficher("pilgrim");
    fireEvent.click(
      screen.getByRole("button", { name: /réserver ce forfait/i }),
    );

    await waitFor(() =>
      expect(routeur.push).toHaveBeenCalledWith(
        `/bookings/${reservation.id}?nouvelle=1`,
      ),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/bookings",
      expect.objectContaining({ body: JSON.stringify({ packageId: FORFAIT }) }),
    );
  });

  it("explique un refus 409 (complet ou clôturé) sans lire le texte du backend", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        { statusCode: 409, timestamp: "", path: "", message: "peu importe" },
        { status: 409 },
      ),
    );
    afficher("pilgrim");
    fireEvent.click(
      screen.getByRole("button", { name: /réserver ce forfait/i }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /complet ou clôturé/i,
    );
    expect(routeur.push).not.toHaveBeenCalled();
  });

  it("n'affiche pas de bouton sur un forfait non réservable", () => {
    afficher("pilgrim", false);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
