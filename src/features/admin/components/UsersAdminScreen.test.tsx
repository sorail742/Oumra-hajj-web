import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { UsersAdminScreen } from "./UsersAdminScreen";

vi.mock("@/lib/auth/role-context", () => ({ useRole: () => "admin" }));
const routeur = { replace: vi.fn() };
let recherche = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => routeur,
  useSearchParams: () => recherche,
}));

const fetchMock = vi.fn();

/** Comptes factices — le passeport ne doit jamais s'afficher. */
const pelerins = [
  {
    id: "u1",
    fullName: "Aminata Factice",
    phone: "+224600000001",
    role: "pilgrim",
    isActive: true,
    passportNumber: "PASSEPORT-FACTICE",
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "u2",
    fullName: "Mamadou Factice",
    email: "mamadou@exemple.test",
    role: "pilgrim",
    isActive: false,
    createdAt: "2026-09-02T00:00:00.000Z",
  },
];

beforeEach(() => {
  recherche = new URLSearchParams();
  fetchMock.mockImplementation((url: string, init?: RequestInit) => {
    if (url === "/api/users/me") {
      return Promise.resolve(
        Response.json({
          id: "admin-1",
          fullName: "Admin Factice",
          role: "admin",
          preferredLanguage: "fr",
          isActive: true,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }),
      );
    }
    if (init?.method === "PATCH") {
      return Promise.resolve(
        Response.json({ ...pelerins[0], isActive: false }),
      );
    }
    return Promise.resolve(Response.json(pelerins));
  });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("UsersAdminScreen (ticket #74)", () => {
  it("liste les pèlerins par défaut, avec statut, sans donnée sensible", async () => {
    afficherAvecProviders(<UsersAdminScreen />);

    expect(
      (await screen.findAllByText("Aminata Factice")).length,
    ).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/users?role=pilgrim",
      expect.anything(),
    );
    expect(screen.getAllByText("Suspendu").length).toBeGreaterThan(0);
    expect(screen.queryByText("PASSEPORT-FACTICE")).toBeNull();
  });

  it("filtre par recherche lue dans l'URL", async () => {
    recherche = new URLSearchParams("q=mamadou");
    afficherAvecProviders(<UsersAdminScreen />);

    expect(
      (await screen.findAllByText("Mamadou Factice")).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText("Aminata Factice")).toBeNull();
  });

  it("suspend un compte après confirmation", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<UsersAdminScreen />);

    const ligne = (await screen.findAllByText("Aminata Factice"))
      .map((el) => el.closest("tr"))
      .find((tr) => tr !== null) as HTMLElement;
    await utilisateur.click(
      within(ligne).getByRole("button", { name: "Suspendre" }),
    );
    await utilisateur.click(
      within(await screen.findByRole("dialog")).getByRole("button", {
        name: "Suspendre le compte",
      }),
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/users/u1/suspend",
        expect.objectContaining({ method: "PATCH" }),
      ),
    );
  });

  it("change de rôle par l'URL", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<UsersAdminScreen />);

    await utilisateur.click(screen.getByRole("button", { name: "Guides" }));
    expect(routeur.replace).toHaveBeenCalledWith("?role=guide", {
      scroll: false,
    });
  });
});
