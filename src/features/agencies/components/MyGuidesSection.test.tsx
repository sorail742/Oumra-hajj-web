import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { MyGuidesSection } from "./MyGuidesSection";
import { RoleProvider } from "@/lib/auth/role-context";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";

/** Réponses du backend servies dans l'ordre des appels `fetch`. */
const fetchMock = vi.fn();
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

/** Données explicitement factices. */
const GUIDE = {
  id: "guide-fictif-1",
  fullName: "Guide Fictif",
  phone: "+224000000001",
  isActive: true,
};

function afficher() {
  return afficherAvecProviders(
    <RoleProvider role="agency">
      <MyGuidesSection />
    </RoleProvider>,
  );
}

function remplir(libelle: RegExp, valeur: string) {
  fireEvent.change(screen.getByLabelText(libelle), {
    target: { value: valeur },
  });
}

/** File de réponses, puis une liste vide pour les relectures. */
function repondre(...reponses: Response[]) {
  fetchMock.mockImplementation(() => Promise.resolve(Response.json([])));
  for (const reponse of reponses) {
    fetchMock.mockResolvedValueOnce(reponse);
  }
}

async function ouvrirAjout() {
  fireEvent.click(
    await screen.findByRole("button", { name: "Ajouter un guide" }),
  );
  remplir(/Nom complet/, "Guide Fictif");
}

function envoisPost() {
  return fetchMock.mock.calls.filter(
    ([, init]) => (init as RequestInit | undefined)?.method === "POST",
  );
}

describe("MyGuidesSection", () => {
  beforeEach(() => vi.stubGlobal("fetch", fetchMock));
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("liste les guides de l'agence", async () => {
    repondre(Response.json([GUIDE]));
    afficher();
    expect(await screen.findByText("Guide Fictif")).toBeInTheDocument();
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/agencies/me/guides");
  });

  it("affiche l'état vide", async () => {
    repondre();
    afficher();
    expect(
      await screen.findByText("Aucun guide pour l'instant."),
    ).toBeInTheDocument();
  });

  it("exige un téléphone ou un e-mail", async () => {
    repondre();
    afficher();
    await ouvrirAjout();
    fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));
    expect(
      await screen.findByText("Indiquez un téléphone ou un e-mail."),
    ).toBeInTheDocument();
    expect(envoisPost()).toHaveLength(0);
  });

  it("envoie le guide sans champ vide", async () => {
    repondre(
      Response.json([]),
      Response.json({
        ...GUIDE,
        phone: undefined,
        email: "guide@example.test",
      }),
    );
    afficher();
    await ouvrirAjout();
    remplir(/E-mail/, "Guide@Example.test");
    fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));
    await waitFor(() => expect(envoisPost()).toHaveLength(1));
    const [url, init] = envoisPost()[0] as [string, RequestInit];
    expect(url).toBe("/api/agencies/me/guides");
    expect(init.body).toBe(
      JSON.stringify({ fullName: "Guide Fictif", email: "guide@example.test" }),
    );
  });

  it("explique un conflit (contact déjà utilisé)", async () => {
    repondre(
      Response.json([]),
      Response.json(
        { statusCode: 409, timestamp: "", path: "", message: "Conflit" },
        { status: 409 },
      ),
    );
    afficher();
    await ouvrirAjout();
    remplir(/Téléphone/, "+224000000001");
    fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));
    expect(
      await screen.findByText(
        "Ce téléphone ou cet e-mail est déjà utilisé par un compte.",
      ),
    ).toBeInTheDocument();
  });
});
