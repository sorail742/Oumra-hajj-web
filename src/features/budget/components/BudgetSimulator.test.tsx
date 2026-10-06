import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BudgetSimulator } from "./BudgetSimulator";
import { RoleProvider } from "@/lib/auth/role-context";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";

/** Forfait et montants explicitement factices. */
const fetchMock = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

const FORFAITS = [{ id: "forfait-test", titre: "Forfait factice", prix: 1000 }];

function afficher() {
  return afficherAvecProviders(
    <RoleProvider role="pilgrim">
      <BudgetSimulator forfaits={FORFAITS} />
    </RoleProvider>,
  );
}

describe("BudgetSimulator", () => {
  it("recalcule le total à la saisie et enregistre la simulation", async () => {
    fetchMock.mockResolvedValue(Response.json({ id: "b1" }));
    const utilisateur = userEvent.setup();
    afficher();

    await utilisateur.selectOptions(
      screen.getByLabelText("Forfait"),
      "forfait-test",
    );
    await utilisateur.type(screen.getByLabelText("Argent de poche"), "200");
    await utilisateur.type(screen.getByLabelText("Assurance"), "50");

    expect(screen.getByText(/^1\s250\sGNF$/)).toBeInTheDocument();

    await utilisateur.click(
      screen.getByRole("button", { name: "Enregistrer la simulation" }),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/budget");
    expect(JSON.parse(String(init.body))).toEqual({
      packageId: "forfait-test",
      pocketMoney: 200,
      gifts: 0,
      sacrifice: 0,
      insurance: 50,
      otherExpenses: 0,
    });
  });

  it("refuse un montant qui n'est pas en chiffres", async () => {
    const utilisateur = userEvent.setup();
    afficher();

    await utilisateur.type(screen.getByLabelText("Cadeaux"), "12,5");
    await utilisateur.click(
      screen.getByRole("button", { name: "Enregistrer la simulation" }),
    );

    expect(
      await screen.findByText(
        "Saisissez un montant en chiffres, sans espace ni virgule.",
      ),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
