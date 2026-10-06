import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { InboxScreen } from "./InboxScreen";
import { RoleProvider } from "@/lib/auth/role-context";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";

const routeur = { replace: vi.fn() };
let recherche = "";
vi.mock("next/navigation", () => ({
  useRouter: () => routeur,
  useSearchParams: () => new URLSearchParams(recherche),
}));

/** Données explicitement factices. */
function fil(id: string, nom: string, nonLus: number, expediteur: string) {
  return {
    id,
    bookingId: `reservation-${id}`,
    channel: "agency",
    counterpartName: nom,
    packageTitle: "Forfait fictif",
    lastMessage: {
      content: `Message de ${nom}`,
      senderId: expediteur,
      createdAt: "2026-10-01T10:00:00Z",
    },
    unreadCount: nonLus,
  };
}

const fetchMock = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  routeur.replace.mockReset();
  recherche = "";
});

function afficher() {
  return afficherAvecProviders(
    <RoleProvider role="agency" userId="moi">
      <InboxScreen />
    </RoleProvider>,
  );
}

describe("InboxScreen", () => {
  it("liste les fils, signale les non-lus et préfixe mes propres messages", async () => {
    fetchMock.mockResolvedValue(
      Response.json([
        fil("f1", "Pèlerin Un", 2, "pelerin-1"),
        fil("f2", "Pèlerin Deux", 0, "moi"),
      ]),
    );
    afficher();

    expect(await screen.findByText("Pèlerin Un")).toBeInTheDocument();
    expect(screen.getByLabelText("2 messages non lus")).toBeInTheDocument();
    expect(
      screen.getByText("Vous : Message de Pèlerin Deux"),
    ).toBeInTheDocument();
  });

  it("ouvre un fil en le plaçant dans l'URL", async () => {
    fetchMock.mockResolvedValue(
      Response.json([fil("f1", "Pèlerin Un", 0, "pelerin-1")]),
    );
    afficher();

    fireEvent.click(await screen.findByRole("button", { name: /Pèlerin Un/ }));
    expect(routeur.replace).toHaveBeenCalledWith("?c=f1", { scroll: false });
  });

  it("propose de démarrer depuis une réservation quand la boîte est vide", async () => {
    fetchMock.mockResolvedValue(Response.json([]));
    afficher();

    expect(
      await screen.findByText("Aucune conversation pour le moment."),
    ).toBeInTheDocument();
  });
});
