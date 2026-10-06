import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { LostButton } from "./LostButton";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";

const toastSucces = vi.fn();
vi.mock("sonner", () => ({
  toast: { success: (...a: unknown[]) => toastSucces(...a), error: vi.fn() },
}));

/** Coordonnées explicitement factices. */
const fetchMock = vi.fn();
const getCurrentPosition = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  Object.defineProperty(navigator, "geolocation", {
    value: { getCurrentPosition },
    configurable: true,
  });
});
afterEach(() => {
  fetchMock.mockReset();
  getCurrentPosition.mockReset();
  toastSucces.mockReset();
  vi.unstubAllGlobals();
});

describe("LostButton", () => {
  it("envoie la position une fois et confirme que le guide est prévenu", async () => {
    getCurrentPosition.mockImplementation((succes: PositionCallback) =>
      succes({
        coords: { latitude: 0.5, longitude: -20.25 },
      } as GeolocationPosition),
    );
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    afficherAvecProviders(<LostButton groupId="g1" />);

    fireEvent.click(screen.getByRole("button", { name: /Je suis perdu/ }));

    await waitFor(() => expect(toastSucces).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/groups/g1/lost");
    expect(init.body).toBe(JSON.stringify({ lat: 0.5, lng: -20.25 }));
  });

  it("explique un refus de géolocalisation sans rien envoyer", async () => {
    getCurrentPosition.mockImplementation(
      (_s: PositionCallback, echec: PositionErrorCallback) =>
        echec({ code: 1, PERMISSION_DENIED: 1 } as GeolocationPositionError),
    );
    afficherAvecProviders(<LostButton groupId="g1" />);

    fireEvent.click(screen.getByRole("button", { name: /Je suis perdu/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /refusé l'accès à la position/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
