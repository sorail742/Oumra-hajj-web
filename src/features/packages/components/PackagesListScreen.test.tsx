import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { PackagesListScreen } from "./PackagesListScreen";

let recherche = new URLSearchParams();
const routeur = { replace: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => routeur,
  useSearchParams: () => recherche,
}));

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockResolvedValue(Response.json([]));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  recherche = new URLSearchParams();
});

describe("PackagesListScreen — filtre par agence (ticket #51)", () => {
  it("transmet l'agence au backend et permet de retirer le filtre", async () => {
    recherche = new URLSearchParams("agencyId=a-factice&type=oumra");
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<PackagesListScreen />);

    expect(screen.getByText("Forfaits d'une seule agence")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voir l'agence" })).toHaveAttribute(
      "href",
      "/agencies/a-factice",
    );
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain("agencyId=a-factice");

    await utilisateur.click(
      screen.getByRole("button", { name: "Retirer le filtre d'agence" }),
    );
    expect(routeur.replace).toHaveBeenCalledWith("?type=oumra", {
      scroll: false,
    });
  });

  it("n'affiche pas de filtre d'agence sans `agencyId`", () => {
    afficherAvecProviders(<PackagesListScreen />);
    expect(screen.queryByText("Forfaits d'une seule agence")).toBeNull();
  });
});
