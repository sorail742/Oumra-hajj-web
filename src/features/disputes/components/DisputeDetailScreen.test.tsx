import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { RoleProvider } from "@/lib/auth/role-context";
import type { Role } from "@/lib/auth/permissions";
import { DisputeDetailScreen } from "./DisputeDetailScreen";

const fetchMock = vi.fn();

/** Litige explicitement factice (idée #62). */
const litige = (surcharge: Record<string, unknown> = {}) => ({
  id: "l1",
  bookingId: "r1",
  packageTitle: "Oumra fictive",
  agencyId: "a1",
  agencyName: "Agence Factice",
  pilgrimName: "Pèlerin Factice",
  category: "accommodation",
  subject: "Chambre différente du contrat",
  status: "open",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
  escalationAvailableAt: "2999-01-01T00:00:00.000Z",
  messages: [
    {
      id: "m1",
      authorRole: "pilgrim",
      authorName: "Pèlerin Factice",
      content: "Exposé factice",
      createdAt: "2026-10-01T00:00:00.000Z",
    },
  ],
  ...surcharge,
});

function afficher(role: Role) {
  afficherAvecProviders(
    <RoleProvider role={role} userId="u1">
      <DisputeDetailScreen id="l1" />
    </RoleProvider>,
  );
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("DisputeDetailScreen (idée #62)", () => {
  it("bloque l'escalade tant que l'agence a le temps de répondre", async () => {
    fetchMock.mockResolvedValue(Response.json(litige()));
    afficher("pilgrim");

    expect(
      await screen.findByText("Chambre différente du contrat"),
    ).toBeInTheDocument();
    expect(screen.getByText("Exposé factice")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Demander l'arbitrage" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Clore à l'amiable" }),
    ).toBeEnabled();
  });

  it("permet l'escalade après la réponse de l'agence", async () => {
    fetchMock.mockResolvedValue(
      Response.json(litige({ status: "agency_responded" })),
    );
    afficher("pilgrim");

    expect(
      await screen.findByRole("button", { name: "Demander l'arbitrage" }),
    ).toBeEnabled();
  });

  it("laisse l'administration trancher un litige escaladé", async () => {
    let tranche = false;
    fetchMock.mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === "POST") tranche = true;
      return Promise.resolve(
        Response.json(
          tranche
            ? litige({ status: "closed", decision: "Décision factice motivée" })
            : litige({ status: "escalated" }),
        ),
      );
    });
    afficher("admin");

    await userEvent.type(
      await screen.findByLabelText("Décision motivée"),
      "Décision factice motivée",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Rendre la décision" }),
    );

    await waitFor(() =>
      expect(screen.getByText("Décision de la plateforme")).toBeInTheDocument(),
    );
    const appel = fetchMock.mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === "POST",
    );
    expect(appel?.[0]).toBe("/api/disputes/l1/decision");
  });

  it("garde les échanges en lecture seule une fois clos", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        litige({ status: "resolved", closedAt: "2026-10-05T00:00:00.000Z" }),
      ),
    );
    afficher("agency");

    expect(
      await screen.findByText(
        "Ce litige est clos : les échanges sont conservés en lecture seule.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Envoyer" })).toBeDisabled();
  });
});
