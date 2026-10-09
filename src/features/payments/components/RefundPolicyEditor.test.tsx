import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { RefundPolicyEditor } from "./RefundPolicyEditor";

const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast }));

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
    Promise.resolve(
      Response.json({
        agencyId: "a1",
        tiers:
          init?.method === "PUT"
            ? (JSON.parse(String(init.body)) as { tiers: unknown[] }).tiers
            : [{ minDaysBeforeDeparture: 30, rate: 0.5 }],
      }),
    ),
  );
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("RefundPolicyEditor (idée #58)", () => {
  it("ajoute un palier et enregistre le barème trié", async () => {
    afficherAvecProviders(<RefundPolicyEditor />);
    expect(
      await screen.findByLabelText("Jours avant le départ, palier 1"),
    ).toHaveValue("30");

    await userEvent.click(
      screen.getByRole("button", { name: /Ajouter un palier/ }),
    );
    await userEvent.type(
      screen.getByLabelText("Jours avant le départ, palier 2"),
      "60",
    );
    await userEvent.type(
      screen.getByLabelText("Pourcentage remboursé, palier 2"),
      "90",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Enregistrer le barème" }),
    );

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    const appel = fetchMock.mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === "PUT",
    );
    expect(JSON.parse(String((appel?.[1] as RequestInit).body))).toEqual({
      tiers: [
        { minDaysBeforeDeparture: 60, rate: 0.9 },
        { minDaysBeforeDeparture: 30, rate: 0.5 },
      ],
    });
  });

  it("signale un taux qui remonte à l'approche du départ", async () => {
    afficherAvecProviders(<RefundPolicyEditor />);
    await screen.findByLabelText("Jours avant le départ, palier 1");
    await userEvent.click(
      screen.getByRole("button", { name: /Ajouter un palier/ }),
    );
    await userEvent.type(
      screen.getByLabelText("Jours avant le départ, palier 2"),
      "7",
    );
    await userEvent.type(
      screen.getByLabelText("Pourcentage remboursé, palier 2"),
      "80",
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Le pourcentage ne peut pas augmenter",
    );
    expect(
      screen.getByRole("button", { name: "Enregistrer le barème" }),
    ).toBeDisabled();
  });
});
