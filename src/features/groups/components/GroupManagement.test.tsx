import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { RoleProvider } from "@/lib/auth/role-context";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { GroupDetailScreen } from "./GroupDetailScreen";

const routeur = { push: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => routeur }));

const fetchMock = vi.fn();

/** Groupe factice. */
const groupe = {
  id: "g1",
  packageId: "f1",
  agencyId: "a1",
  title: "Groupe factice A",
  memberIds: [],
  itinerary: [],
  locations: [],
};

function corps(chemin: string): unknown {
  const appel = fetchMock.mock.calls.find(([url]) => url === chemin) as
    [string, RequestInit] | undefined;
  return appel ? JSON.parse(String(appel[1].body)) : undefined;
}

beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("CreateGroupDialog (ticket #63)", () => {
  it("crée un groupe rattaché au forfait choisi puis ouvre son détail", async () => {
    fetchMock.mockResolvedValue(Response.json(groupe, { status: 201 }));
    const utilisateur = userEvent.setup();
    afficherAvecProviders(
      <CreateGroupDialog forfaits={[{ id: "f1", title: "Forfait factice" }]} />,
    );

    await utilisateur.click(
      screen.getByRole("button", { name: "Créer un groupe" }),
    );
    const dialogue = await screen.findByRole("dialog");
    await utilisateur.selectOptions(
      within(dialogue).getByLabelText("Forfait"),
      "f1",
    );
    await utilisateur.type(
      within(dialogue).getByLabelText("Nom du groupe"),
      "Groupe factice A",
    );
    await utilisateur.click(
      within(dialogue).getByRole("button", { name: "Créer le groupe" }),
    );

    await waitFor(() =>
      expect(routeur.push).toHaveBeenCalledWith("/groups/g1"),
    );
    expect(corps("/api/groups")).toEqual({
      packageId: "f1",
      title: "Groupe factice A",
    });
  });

  it("est désactivé tant que l'agence n'a aucun forfait", () => {
    afficherAvecProviders(<CreateGroupDialog forfaits={[]} />);
    expect(
      screen.getByRole("button", { name: "Créer un groupe" }),
    ).toBeDisabled();
  });
});

describe("Itinéraire d'un groupe (ticket #65)", () => {
  it("permet à l'agence d'ajouter une étape", async () => {
    fetchMock.mockImplementation((url: string) =>
      Promise.resolve(
        Response.json(
          url.endsWith("/itinerary")
            ? {
                ...groupe,
                itinerary: [
                  {
                    label: "Arrivée à Médine",
                    date: "2026-11-02T00:00:00.000Z",
                  },
                ],
              }
            : groupe,
        ),
      ),
    );
    const utilisateur = userEvent.setup();
    afficherAvecProviders(
      <RoleProvider role="agency">
        <GroupDetailScreen id="g1" />
      </RoleProvider>,
    );

    await utilisateur.type(
      await screen.findByLabelText("Étape"),
      "Arrivée à Médine",
    );
    await utilisateur.type(screen.getByLabelText("Date"), "2026-11-02");
    await utilisateur.click(
      screen.getByRole("button", { name: "Ajouter l'étape" }),
    );

    expect(await screen.findByText("Arrivée à Médine")).toBeInTheDocument();
    expect(corps("/api/groups/g1/itinerary")).toEqual({
      label: "Arrivée à Médine",
      date: "2026-11-02",
    });
  });

  it("n'affiche pas le formulaire au pèlerin", async () => {
    fetchMock.mockResolvedValue(Response.json(groupe));
    afficherAvecProviders(
      <RoleProvider role="pilgrim">
        <GroupDetailScreen id="g1" />
      </RoleProvider>,
    );

    expect(await screen.findByText("Groupe factice A")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Ajouter l'étape" }),
    ).toBeNull();
  });
});
