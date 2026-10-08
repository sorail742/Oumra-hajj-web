import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SavingsPlanCard } from "./SavingsPlanCard";
import { RoleProvider } from "@/lib/auth/role-context";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";

/** Réservation et montants explicitement factices. */
const fetchMock = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

const PLAN = {
  id: "plan-test",
  bookingId: "resa-test",
  targetAmount: 1000,
  autoDeduct: true,
  deductAmount: 300,
  frequency: "monthly",
  nextDeductDate: "2026-11-07T00:00:00.000Z",
};

function afficher() {
  return afficherAvecProviders(
    <RoleProvider role="pilgrim">
      <SavingsPlanCard bookingId="resa-test" />
    </RoleProvider>,
  );
}

describe("SavingsPlanCard", () => {
  it("sans plan, active les cotisations et envoie montant et fréquence", async () => {
    fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
      Promise.resolve(
        init?.method === "POST"
          ? Response.json(PLAN)
          : new Response("", { status: 200 }),
      ),
    );
    const utilisateur = userEvent.setup();
    afficher();

    await utilisateur.click(
      await screen.findByLabelText("Activer les cotisations automatiques"),
    );
    await utilisateur.type(
      screen.getByLabelText("Montant de chaque cotisation (GNF)"),
      "300",
    );
    await utilisateur.selectOptions(
      screen.getByLabelText("Fréquence"),
      "monthly",
    );
    await utilisateur.click(
      screen.getByRole("button", { name: "Enregistrer le plan" }),
    );

    const envoi = fetchMock.mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === "POST",
    );
    expect(envoi?.[0]).toBe("/api/payments/bookings/resa-test/savings-plan");
    expect(JSON.parse(String((envoi?.[1] as RequestInit).body))).toEqual({
      autoDeduct: true,
      deductAmount: 300,
      frequency: "monthly",
    });
    expect(await screen.findByText("4 cotisations")).toBeInTheDocument();
  });

  it("exige montant et fréquence quand les cotisations sont activées", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 200 }));
    const utilisateur = userEvent.setup();
    afficher();

    await utilisateur.click(
      await screen.findByLabelText("Activer les cotisations automatiques"),
    );
    await utilisateur.click(
      screen.getByRole("button", { name: "Enregistrer le plan" }),
    );

    expect(
      await screen.findByText(
        "Saisissez un montant en chiffres, d'au moins 1 GNF.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Choisissez une fréquence.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("affiche l'objectif et la prochaine cotisation d'un plan existant", async () => {
    fetchMock.mockResolvedValue(Response.json(PLAN));
    afficher();

    expect(await screen.findByText("07/11/2026")).toBeInTheDocument();
    expect(screen.getByText(/^1\s000\sGNF$/)).toBeInTheDocument();
    expect(
      screen.getByLabelText("Activer les cotisations automatiques"),
    ).toBeChecked();
  });
});
