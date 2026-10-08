import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { RoleProvider } from "@/lib/auth/role-context";
import { SpecialNeedsForm } from "./SpecialNeedsForm";

const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast }));

const fetchMock = vi.fn();

/** Déclaration explicitement factice. */
const declaration = {
  mobility: "reduced",
  dietary: "Régime factice",
  updatedAt: "2026-10-01T00:00:00.000Z",
};

function repondre(url: string, init?: RequestInit) {
  if (url === "/api/users/me/special-needs" && init?.method === "PUT") {
    return Response.json({
      ...JSON.parse(String(init.body)),
      updatedAt: declaration.updatedAt,
    });
  }
  if (url === "/api/users/me/special-needs") return Response.json(declaration);
  return Response.json({}, { status: 404 });
}

beforeEach(() => {
  fetchMock.mockImplementation((url: string, init?: RequestInit) =>
    Promise.resolve(repondre(url, init)),
  );
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("SpecialNeedsForm (idée #69)", () => {
  it("dit qui voit ces données et reprend la déclaration existante", async () => {
    afficherAvecProviders(
      <RoleProvider role="pilgrim">
        <SpecialNeedsForm />
      </RoleProvider>,
    );

    expect(screen.getByText(/jamais par l'administration/)).toBeInTheDocument();
    expect(await screen.findByLabelText("Régime alimentaire")).toHaveValue(
      "Régime factice",
    );
    expect(
      screen.getByRole("radio", { name: "Mobilité réduite" }),
    ).toBeChecked();
  });

  it("remplace la déclaration, un champ vidé étant envoyé vide", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(
      <RoleProvider role="pilgrim">
        <SpecialNeedsForm />
      </RoleProvider>,
    );

    await utilisateur.click(
      await screen.findByRole("radio", { name: "Fauteuil roulant" }),
    );
    await utilisateur.clear(screen.getByLabelText("Régime alimentaire"));
    await utilisateur.type(
      screen.getByLabelText("Information médicale"),
      "Traitement factice",
    );
    await utilisateur.click(
      screen.getByRole("button", { name: "Enregistrer mes besoins" }),
    );

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Besoins spéciaux enregistrés.",
      ),
    );
    const appel = fetchMock.mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === "PUT",
    ) as [string, RequestInit];
    expect(JSON.parse(String(appel[1].body))).toEqual({
      mobility: "wheelchair",
      dietary: "",
      medical: "Traitement factice",
      assistance: "",
    });
  });
});
