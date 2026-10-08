import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { RoleProvider } from "@/lib/auth/role-context";
import { EcranSuivi } from "./EcranSuivi";

let recherche = new URLSearchParams();
const routeur = {
  replace: vi.fn((url: string) => {
    recherche = new URLSearchParams(url.split("?")[1] ?? "");
  }),
};
vi.mock("next/navigation", () => ({
  useRouter: () => routeur,
  usePathname: () => "/groups/g1/tracking",
  useSearchParams: () => recherche,
}));

// La carte (WebGL) n'existe pas sous jsdom : on vérifie ce qu'elle reçoit.
const carte = vi.fn();
vi.mock("next/dynamic", () => ({
  default: () => (props: unknown) => {
    carte(props);
    return <div data-testid="carte" />;
  },
}));

const fetchMock = vi.fn();
const ilYA = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

/** Groupe factice : positions fictives autour d'un même point. */
const groupe = {
  id: "g1",
  packageId: "f1",
  agencyId: "a1",
  title: "Groupe factice A",
  guideId: "guide",
  memberIds: ["m1", "m2"],
  itinerary: [],
  locations: [
    { userId: "guide", lat: 21.4225, lng: 39.8262, updatedAt: ilYA(1) },
    { userId: "m1", lat: 21.4325, lng: 39.8262, updatedAt: ilYA(2) },
    { userId: "m2", lat: 21.4, lng: 39.8, updatedAt: ilYA(90) },
  ],
};

function afficher() {
  return afficherAvecProviders(
    <RoleProvider role="agency" userId="agence">
      <EcranSuivi id="g1" />
    </RoleProvider>,
  );
}

beforeEach(() => {
  recherche = new URLSearchParams();
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockResolvedValue(Response.json(groupe));
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("EcranSuivi (ADR-0007)", () => {
  it("liste les positions avec leur fraîcheur et les place sur la carte", async () => {
    afficher();
    const liste = await screen.findByRole("list");
    expect(within(liste).getByText("Guide")).toBeInTheDocument();
    expect(within(liste).getByText("Membre 1")).toBeInTheDocument();
    expect(within(liste).getAllByText("En direct")).toHaveLength(2);
    expect(within(liste).getByText("Ancienne")).toBeInTheDocument();
    const props = carte.mock.lastCall?.[0] as { reperes: unknown[] };
    expect(props.reperes).toHaveLength(3);
  });

  it("met la sélection dans l'URL", async () => {
    const utilisateur = userEvent.setup();
    afficher();
    await utilisateur.click(
      await screen.findByRole("button", { name: /Membre 1/ }),
    );
    expect(routeur.replace).toHaveBeenCalledWith(
      "/groups/g1/tracking?membre=m1",
      { scroll: false },
    );
  });

  it("détaille la personne sélectionnée, distance au guide comprise", async () => {
    recherche = new URLSearchParams("membre=m1");
    afficher();
    expect(await screen.findByText("Distance du guide")).toBeInTheDocument();
    // 0,01° de latitude ≈ 1,1 km.
    expect(screen.getByText(/1,1\s?km/)).toBeInTheDocument();
    const props = carte.mock.lastCall?.[0] as { selection?: string };
    expect(props.selection).toBe("m1");
  });

  it("filtre les positions anciennes via l'URL", async () => {
    recherche = new URLSearchParams("filtre=stale");
    afficher();
    const liste = await screen.findByRole("list");
    expect(within(liste).getAllByRole("button")).toHaveLength(1);
    expect(within(liste).getByText("Membre 2")).toBeInTheDocument();
  });
});
