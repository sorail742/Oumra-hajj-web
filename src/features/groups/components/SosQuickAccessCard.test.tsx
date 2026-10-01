import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { SosQuickAccessCard } from "./SosQuickAccessCard";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";

vi.mock("@/lib/auth/role-context", () => ({ useRole: () => "pilgrim" }));
const get = vi.fn();
const post = vi.fn();
vi.mock("@/lib/api/client", () => ({
  api: {
    get: (...args: unknown[]) => get(...args),
    post: (...args: unknown[]) => post(...args),
  },
}));

function groupe(id: string, title: string) {
  return {
    id,
    packageId: "f",
    agencyId: "a",
    title,
    memberIds: [],
    itinerary: [],
    locations: [],
  };
}

function afficher() {
  afficherAvecProviders(<SosQuickAccessCard />);
}

describe("SosQuickAccessCard", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it("lit les groupes du pèlerin et rend directement le bouton SOS s'il n'y en a qu'un", async () => {
    get.mockResolvedValue([groupe("g1", "Groupe factice")]);
    afficher();

    expect(await screen.findByText(/Groupe factice/)).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith("/api/groups/joined");
    expect(screen.getByRole("button")).toBeInTheDocument();
    // Le rendu seul n'envoie jamais d'alerte : seule une pression maintenue
    // la déclenche (voir SosButton.test.tsx).
    expect(post).not.toHaveBeenCalled();
  });

  it("renvoie vers chaque fiche quand le pèlerin a plusieurs groupes", async () => {
    get.mockResolvedValue([groupe("g1", "Groupe A"), groupe("g2", "Groupe B")]);
    afficher();

    expect(
      await screen.findByRole("link", { name: "Groupe A" }),
    ).toHaveAttribute("href", "/groups/g1");
    expect(screen.getByRole("link", { name: "Groupe B" })).toHaveAttribute(
      "href",
      "/groups/g2",
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("explique l'absence de SOS tant qu'aucun groupe n'est rattaché", async () => {
    get.mockResolvedValue([]);
    afficher();

    expect(
      await screen.findByText(/dès que vous serez rattaché à un groupe/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
