import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { NextDossierStepCard } from "./NextDossierStepCard";
import messages from "@/messages/fr.json";

vi.mock("@/lib/auth/role-context", () => ({ useRole: () => "pilgrim" }));
const get = vi.fn();
vi.mock("@/lib/api/client", () => ({
  api: { get: (...args: unknown[]) => get(...args) },
}));

const DATE = "2026-09-01T00:00:00.000Z";
function reservation(id: string, status: string, faites: string[]) {
  return {
    id,
    pilgrimId: "p",
    packageId: "f",
    agencyId: "a",
    status,
    steps: faites.map((key) => ({ key, status: "done", updatedAt: DATE })),
  };
}

function afficher() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="fr" messages={messages}>
        <NextDossierStepCard />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

describe("NextDossierStepCard", () => {
  beforeEach(() => get.mockReset());

  it("affiche la prochaine étape du dossier actif et lie vers lui", async () => {
    get.mockResolvedValue([
      reservation("annulee", "cancelled", []),
      reservation("r1", "confirmed", ["payment"]),
    ]);
    afficher();

    expect(await screen.findByText("Visa")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ouvrir le dossier" }),
    ).toHaveAttribute("href", "/bookings/r1");
  });

  it("propose les forfaits quand aucun dossier n'est en cours", async () => {
    get.mockResolvedValue([reservation("r1", "completed", [])]);
    afficher();

    expect(
      await screen.findByText("Aucun dossier en cours."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Voir les forfaits" }),
    ).toHaveAttribute("href", "/packages");
  });
});
