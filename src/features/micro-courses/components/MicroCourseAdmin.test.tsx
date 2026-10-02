import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { DeleteMicroCourseDialog } from "./DeleteMicroCourseDialog";
import { MicroCourseFormDialog } from "./MicroCourseFormDialog";

const routeur = { push: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => routeur }));

const fetchMock = vi.fn();

/** Cours factice renvoyé par le backend. */
const cours = {
  id: "c9",
  title: "Préparer sa valise (factice)",
  description: null,
  videoUrl: "https://exemple.test/valise.mp4",
  durationSeconds: 125,
  order: 3,
  category: "logistics",
};

beforeEach(() => {
  fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
    Promise.resolve(
      init?.method === "DELETE"
        ? new Response(null, { status: 204 })
        : Response.json(cours, { status: 201 }),
    ),
  );
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

async function remplir(utilisateur: ReturnType<typeof userEvent.setup>) {
  const dialogue = await screen.findByRole("dialog");
  await utilisateur.type(within(dialogue).getByLabelText("Titre"), cours.title);
  await utilisateur.selectOptions(
    within(dialogue).getByLabelText("Catégorie"),
    "logistics",
  );
  for (const [libelle, valeur] of [
    ["Minutes", "2"],
    ["Secondes", "5"],
    ["Ordre", "3"],
  ] as const) {
    const champ = within(dialogue).getByLabelText(libelle);
    await utilisateur.clear(champ);
    await utilisateur.type(champ, valeur);
  }
  return dialogue;
}

describe("Gestion des micro-cours (ticket #83)", () => {
  it("crée un cours en convertissant la durée en secondes", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<MicroCourseFormDialog />);
    await utilisateur.click(
      screen.getByRole("button", { name: "Ajouter un cours" }),
    );
    const dialogue = await remplir(utilisateur);
    await utilisateur.type(
      within(dialogue).getByLabelText("URL de la vidéo (https)"),
      cours.videoUrl,
    );
    await utilisateur.click(
      within(dialogue).getByRole("button", { name: "Enregistrer" }),
    );

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/micro-courses");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({
      title: cours.title,
      videoUrl: cours.videoUrl,
      durationSeconds: 125,
      order: 3,
      category: "logistics",
    });
  });

  it("refuse une vidéo qui n'est pas en https", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<MicroCourseFormDialog />);
    await utilisateur.click(
      screen.getByRole("button", { name: "Ajouter un cours" }),
    );
    const dialogue = await remplir(utilisateur);
    await utilisateur.type(
      within(dialogue).getByLabelText("URL de la vidéo (https)"),
      "http://exemple.test/video.mp4",
    );
    await utilisateur.click(
      within(dialogue).getByRole("button", { name: "Enregistrer" }),
    );

    expect(
      await within(dialogue).findByText("Saisissez une adresse https valide."),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("modifie un cours existant par PATCH, champs pré-remplis", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<MicroCourseFormDialog cours={cours} />);
    await utilisateur.click(screen.getByRole("button", { name: "Modifier" }));
    const dialogue = await screen.findByRole("dialog");
    expect(within(dialogue).getByLabelText("Minutes")).toHaveValue("2");
    expect(within(dialogue).getByLabelText("Secondes")).toHaveValue("5");
    await utilisateur.click(
      within(dialogue).getByRole("button", { name: "Enregistrer" }),
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/micro-courses/c9",
        expect.objectContaining({ method: "PATCH" }),
      ),
    );
  });

  it("supprime après confirmation et revient au catalogue", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(
      <DeleteMicroCourseDialog id="c9" title={cours.title} />,
    );
    await utilisateur.click(screen.getByRole("button", { name: "Supprimer" }));
    await utilisateur.click(
      within(await screen.findByRole("dialog")).getByRole("button", {
        name: "Supprimer le cours",
      }),
    );

    await waitFor(() =>
      expect(routeur.push).toHaveBeenCalledWith("/micro-courses"),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/micro-courses/c9",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
