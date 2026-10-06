import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { LocationSharingCard } from "./LocationSharingCard";
import { MemberLocations } from "./MemberLocations";
import { RoleProvider } from "@/lib/auth/role-context";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

/** Coordonnées explicitement factices (milieu de l'océan). */
const POSITION = { coords: { latitude: 0.5, longitude: -20.25 } };
const fetchMock = vi.fn();
let rappelPosition: ((p: typeof POSITION) => void) | undefined;
const geolocalisation = {
  watchPosition: vi.fn((succes: (p: typeof POSITION) => void) => {
    rappelPosition = succes;
    return 7;
  }),
  clearWatch: vi.fn(),
};

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  Object.defineProperty(navigator, "geolocation", {
    value: geolocalisation,
    configurable: true,
  });
  fetchMock.mockImplementation(() =>
    Promise.resolve(new Response(null, { status: 204 })),
  );
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  rappelPosition = undefined;
});

function appelsVers(methode: string) {
  return fetchMock.mock.calls.filter(
    ([, init]) => (init as RequestInit | undefined)?.method === methode,
  );
}

describe("LocationSharingCard", () => {
  it("ne lit ni n'envoie aucune position avant le consentement", () => {
    afficherAvecProviders(<LocationSharingCard groupId="g1" />);
    expect(geolocalisation.watchPosition).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("envoie au plus une position par minute, puis efface tout à l'arrêt", async () => {
    afficherAvecProviders(<LocationSharingCard groupId="g1" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Partager ma position" }),
    );

    act(() => {
      rappelPosition?.(POSITION);
      rappelPosition?.(POSITION);
    });
    await waitFor(() => expect(appelsVers("PATCH")).toHaveLength(1));
    const [url, init] = appelsVers("PATCH")[0] as [string, RequestInit];
    expect(url).toBe("/api/groups/g1/location");
    expect(init.body).toBe(JSON.stringify({ lat: 0.5, lng: -20.25 }));

    fireEvent.click(screen.getByRole("button", { name: "Arrêter le partage" }));
    expect(geolocalisation.clearWatch).toHaveBeenCalledWith(7);
    await waitFor(() => expect(appelsVers("DELETE")).toHaveLength(1));
  });
});

describe("MemberLocations", () => {
  it("nomme sans identifiant : vous, le guide, puis les membres numérotés", () => {
    afficherAvecProviders(
      <RoleProvider role="pilgrim" userId="moi">
        <MemberLocations
          group={{
            id: "g1",
            packageId: "p1",
            agencyId: "a1",
            title: "Groupe fictif",
            guideId: "guide-1",
            memberIds: ["moi", "autre"],
            itinerary: [],
            locations: [
              {
                userId: "autre",
                lat: 1,
                lng: 2,
                updatedAt: "2026-10-06T10:00:00Z",
              },
              {
                userId: "guide-1",
                lat: 1,
                lng: 2,
                updatedAt: "2026-10-06T11:00:00Z",
              },
              {
                userId: "moi",
                lat: 1,
                lng: 2,
                updatedAt: "2026-10-06T12:00:00Z",
              },
            ],
          }}
        />
      </RoleProvider>,
    );
    const lignes = screen.getAllByRole("listitem").map((l) => l.textContent);
    expect(lignes[0]).toContain("Vous");
    expect(lignes[1]).toContain("Guide");
    expect(lignes[2]).toContain("Membre 1");
    expect(
      screen.getAllByRole("link", { name: /Voir sur la carte/ })[0],
    ).toHaveAttribute("rel", "noopener noreferrer");
  });
});
