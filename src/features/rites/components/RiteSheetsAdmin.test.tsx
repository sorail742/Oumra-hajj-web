import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RiteSheetsAdmin } from "./RiteSheetsAdmin";
import { RoleProvider } from "@/lib/auth/role-context";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";

/**
 * Fiches explicitement factices : aucun texte religieux réel n'est utilisé
 * dans les tests.
 */
const fetchMock = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

const FICHE = {
  id: "fiche-test",
  key: "cle-test",
  title: "Fiche factice",
  pilgrimageType: "oumra",
  order: 1,
  content: "Contenu factice de démonstration.",
  language: "fr",
  version: 2,
  isValidated: false,
};

function repondre(liste: unknown[]) {
  fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
    Promise.resolve(
      init?.method === "PATCH" || init?.method === "POST"
        ? Response.json({ ...FICHE, isValidated: true })
        : Response.json(liste),
    ),
  );
}

function afficher() {
  return afficherAvecProviders(
    <RoleProvider role="admin">
      <RiteSheetsAdmin />
    </RoleProvider>,
  );
}

describe("RiteSheetsAdmin", () => {
  it("liste toutes les fiches avec leur statut", async () => {
    repondre([
      FICHE,
      { ...FICHE, id: "fiche-2", title: "Autre fiche", isValidated: true },
    ]);
    afficher();

    expect(await screen.findByText("Fiche factice")).toBeInTheDocument();
    expect(screen.getByText("À valider")).toBeInTheDocument();
    expect(screen.getByText("Validée")).toBeInTheDocument();
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/rites/sheets/admin");
    expect(screen.getAllByRole("button", { name: "Valider" })).toHaveLength(1);
  });

  it("valide une fiche après confirmation explicite", async () => {
    repondre([FICHE]);
    const utilisateur = userEvent.setup();
    afficher();

    await utilisateur.click(
      await screen.findByRole("button", { name: "Valider" }),
    );
    const dialogue = await screen.findByRole("dialog");
    await utilisateur.click(
      within(dialogue).getByRole("button", { name: "Valider" }),
    );

    const validation = fetchMock.mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === "PATCH",
    );
    expect(validation?.[0]).toBe("/api/rites/sheets/fiche-test/validate");
  });

  it("crée une fiche avec les champs saisis", async () => {
    repondre([]);
    const utilisateur = userEvent.setup();
    afficher();

    await utilisateur.click(
      await screen.findByRole("button", { name: "Nouvelle fiche" }),
    );
    const dialogue = await screen.findByRole("dialog");
    await utilisateur.type(within(dialogue).getByLabelText("Clé"), "cle-test");
    await utilisateur.type(
      within(dialogue).getByLabelText("Titre"),
      "Fiche factice",
    );
    await utilisateur.type(
      within(dialogue).getByLabelText("Contenu"),
      "Contenu factice de démonstration.",
    );
    await utilisateur.click(
      within(dialogue).getByRole("button", { name: "Créer la fiche" }),
    );

    const creation = fetchMock.mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === "POST",
    );
    expect(creation?.[0]).toBe("/api/rites/sheets");
    expect(JSON.parse(String((creation?.[1] as RequestInit).body))).toEqual({
      key: "cle-test",
      title: "Fiche factice",
      pilgrimageType: "oumra",
      order: 0,
      language: "fr",
      content: "Contenu factice de démonstration.",
    });
  });
});
