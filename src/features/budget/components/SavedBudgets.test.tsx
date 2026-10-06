import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SavedBudgets } from "./SavedBudgets";
import { RoleProvider } from "@/lib/auth/role-context";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";

/** Simulations explicitement factices. */
const fetchMock = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

const BUDGET = {
  id: "budget-test",
  packageId: "forfait-test",
  packagePrice: 1000,
  pocketMoney: 200,
  gifts: 0,
  sacrifice: 0,
  insurance: 50,
  otherExpenses: 0,
  currency: "GNF",
  createdAt: "2026-10-01T10:00:00.000Z",
};

function afficher() {
  return afficherAvecProviders(
    <RoleProvider role="pilgrim">
      <SavedBudgets titres={new Map([["forfait-test", "Forfait factice"]])} />
    </RoleProvider>,
  );
}

describe("SavedBudgets", () => {
  it("liste les simulations avec leur total", async () => {
    fetchMock.mockResolvedValue(Response.json([BUDGET]));
    afficher();

    expect(await screen.findByText("Forfait factice")).toBeInTheDocument();
    expect(screen.getByText(/^1\s250\sGNF$/)).toBeInTheDocument();
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/budget/mine");
  });

  it("supprime une simulation après confirmation", async () => {
    fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
      Promise.resolve(
        init?.method === "DELETE"
          ? new Response(null, { status: 204 })
          : Response.json([BUDGET]),
      ),
    );
    const utilisateur = userEvent.setup();
    afficher();

    await utilisateur.click(
      await screen.findByRole("button", { name: "Supprimer" }),
    );
    const dialogue = await screen.findByRole("dialog");
    await utilisateur.click(
      within(dialogue).getByRole("button", { name: "Supprimer" }),
    );

    const suppression = fetchMock.mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === "DELETE",
    );
    expect(suppression?.[0]).toBe("/api/budget/budget-test");
  });
});
