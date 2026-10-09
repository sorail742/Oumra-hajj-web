import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { LoyaltyProgramEditor } from "./LoyaltyProgramEditor";

const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast }));

const fetchMock = vi.fn();

/** Programme explicitement factice (idée #47). */
const programme = {
  agencyId: "agence-1",
  agencyName: "Agence Factice",
  tiers: [{ minTrips: 1, label: "Bienvenue", benefit: "Kit offert" }],
};

beforeEach(() => {
  fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
    Promise.resolve(
      Response.json(
        init?.method === "PUT"
          ? { ...programme, ...(JSON.parse(String(init.body)) as object) }
          : programme,
      ),
    ),
  );
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("LoyaltyProgramEditor (idée #47)", () => {
  it("ajoute un palier et envoie les paliers triés", async () => {
    const user = userEvent.setup();
    afficherAvecProviders(<LoyaltyProgramEditor />);

    expect(await screen.findByDisplayValue("Bienvenue")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Ajouter un palier" }));
    const noms = screen.getAllByLabelText("Nom du palier");
    const avantages = screen.getAllByLabelText("Avantage");
    await user.type(noms[1] as HTMLElement, "Fidèle");
    await user.type(avantages[1] as HTMLElement, "Transfert offert");
    await user.click(
      screen.getByRole("button", { name: "Enregistrer les paliers" }),
    );

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Paliers enregistrés."),
    );
    const appel = fetchMock.mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === "PUT",
    );
    expect(JSON.parse(String((appel?.[1] as RequestInit).body))).toEqual({
      tiers: [
        { minTrips: 1, label: "Bienvenue", benefit: "Kit offert" },
        { minTrips: 2, label: "Fidèle", benefit: "Transfert offert" },
      ],
    });
  });

  it("refuse deux paliers au même seuil sans appeler l'API", async () => {
    const user = userEvent.setup();
    afficherAvecProviders(<LoyaltyProgramEditor />);
    await screen.findByDisplayValue("Bienvenue");

    await user.click(screen.getByRole("button", { name: "Ajouter un palier" }));
    const seuils = screen.getAllByLabelText("À partir de (voyages)");
    await user.clear(seuils[1] as HTMLElement);
    await user.type(seuils[1] as HTMLElement, "1");
    await user.type(
      screen.getAllByLabelText("Nom du palier")[1] as HTMLElement,
      "Doublon",
    );
    await user.type(
      screen.getAllByLabelText("Avantage")[1] as HTMLElement,
      "Rien",
    );
    await user.click(
      screen.getByRole("button", { name: "Enregistrer les paliers" }),
    );

    expect(
      await screen.findByText(
        "Un autre palier demande déjà ce nombre de voyages.",
      ),
    ).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.some(
        ([, init]) => (init as RequestInit | undefined)?.method === "PUT",
      ),
    ).toBe(false);
  });
});
