import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { RiteProgressChecklist } from "./RiteProgressChecklist";

vi.mock("@/lib/auth/role-context", () => ({
  useRole: () => "pilgrim" as const,
}));

const fetchMock = vi.fn();
let progression: unknown[] = [];
let fiches: unknown[] = [];

/** Fiche factice. */
const fiche = {
  id: "f1",
  key: "tawaf",
  title: "Tawaf (fiche factice)",
  pilgrimageType: "oumra",
  order: 1,
  content: "Contenu factice.",
  language: "fr",
  version: 1,
  isValidated: true,
};

function corpsSync(): { items: Record<string, unknown>[] } | undefined {
  const appel = fetchMock.mock.calls.find(
    ([url]) => url === "/api/rites/progress/sync",
  ) as [string, RequestInit] | undefined;
  return appel
    ? (JSON.parse(String(appel[1].body)) as {
        items: Record<string, unknown>[];
      })
    : undefined;
}

beforeEach(() => {
  fetchMock.mockImplementation((url: string, init?: RequestInit) => {
    if (url === "/api/rites/progress/sync") {
      const { items } = JSON.parse(String(init?.body)) as {
        items: Record<string, unknown>[];
      };
      return Promise.resolve(
        Response.json([
          {
            id: "p1",
            pilgrimId: "u1",
            riteKey: "tawaf",
            completed: false,
            tawafCount: 0,
            saiCount: 0,
            clientUpdatedAt: "2026-10-02T10:00:00.000Z",
            ...items[0],
          },
        ]),
      );
    }
    if (url.startsWith("/api/rites/sheets"))
      return Promise.resolve(Response.json(fiches));
    return Promise.resolve(Response.json(progression));
  });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("RiteProgressChecklist", () => {
  it("traite une progression sans fiche correspondante comme non validée, jamais validée par défaut", async () => {
    progression = [
      {
        id: "p1",
        pilgrimId: "u1",
        riteKey: "cle-orpheline",
        completed: false,
        tawafCount: 2,
        saiCount: 0,
        clientUpdatedAt: "2026-10-01T00:00:00.000Z",
      },
    ];
    fiches = [];
    afficherAvecProviders(<RiteProgressChecklist />);

    expect(await screen.findByText("cle-orpheline")).toBeInTheDocument();
    expect(
      screen.getByText("Contenu à valider par une personne qualifiée"),
    ).toBeInTheDocument();
  });

  it("n'affiche pas le bandeau quand la fiche correspondante est validée, et permet de commencer le rite", async () => {
    progression = [];
    fiches = [fiche];
    afficherAvecProviders(<RiteProgressChecklist />);

    expect(
      await screen.findByText("Tawaf (fiche factice)"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Contenu à valider par une personne qualifiée"),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "Retirer un tour de Tawaf" }),
    ).toBeDisabled();
  });

  it("ajoute un tour avec un horodatage client et affiche l'état renvoyé", async () => {
    progression = [];
    fiches = [fiche];
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<RiteProgressChecklist />);

    await utilisateur.click(
      await screen.findByRole("button", { name: "Ajouter un tour de Tawaf" }),
    );

    expect(await screen.findByLabelText("Tawaf : 1 tour")).toBeInTheDocument();
    const item = corpsSync()?.items[0];
    expect(item).toMatchObject({ riteKey: "tawaf", tawafCount: 1 });
    expect(typeof item?.clientUpdatedAt).toBe("string");
  });

  it("remet les compteurs à zéro après confirmation", async () => {
    progression = [];
    fiches = [fiche];
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<RiteProgressChecklist />);

    await utilisateur.click(
      await screen.findByRole("button", { name: "Remettre à zéro" }),
    );
    await utilisateur.click(
      within(await screen.findByRole("dialog")).getByRole("button", {
        name: "Remettre à zéro",
      }),
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/rites/progress/tawaf/reset-counter",
        expect.objectContaining({ method: "PATCH" }),
      ),
    );
  });
});
