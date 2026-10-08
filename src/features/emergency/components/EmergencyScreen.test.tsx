import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { RoleProvider } from "@/lib/auth/role-context";
import type { Role } from "@/lib/auth/permissions";
import { EmergencyScreen } from "./EmergencyScreen";

const fetchMock = vi.fn();

/** Numéros et contacts explicitement factices. */
const numeros = [
  {
    id: "n1",
    label: "Secours factice",
    category: "medical",
    phone: "000 111",
    country: "SA",
    city: "La Mecque",
    order: 0,
  },
  {
    id: "n2",
    label: "Ambassade factice",
    category: "embassy",
    phone: "+224 000 000",
    country: "GN",
    order: 1,
  },
];
const contacts = {
  agencies: [
    { agencyId: "a1", legalName: "Agence factice", phone: "+224600000001" },
  ],
  guides: [
    { groupId: "g1", groupTitle: "Groupe factice", fullName: "Guide factice" },
  ],
};

function repondre(url: string) {
  if (url === "/api/emergency/numbers") return Response.json(numeros);
  if (url === "/api/emergency/contacts/mine") return Response.json(contacts);
  return Response.json({}, { status: 404 });
}

function afficher(role: Role | undefined) {
  afficherAvecProviders(
    <RoleProvider role={role}>
      <EmergencyScreen />
    </RoleProvider>,
  );
}

beforeEach(() => {
  fetchMock.mockImplementation((url: string) => Promise.resolve(repondre(url)));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("EmergencyScreen (idée #21)", () => {
  it("groupe l'annuaire par pays, chaque numéro composable en un geste", async () => {
    afficher(undefined);

    expect(await screen.findByText("Secours factice")).toBeInTheDocument();
    expect(screen.getByText("Arabie saoudite")).toBeInTheDocument();
    expect(screen.getByText("Guinée")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "000 111" })).toHaveAttribute(
      "href",
      "tel:000111",
    );
    // Visiteur sans session : ni contacts personnels, ni gestion.
    expect(screen.queryByText("Vos contacts")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Ajouter un numéro" }),
    ).toBeNull();
  });

  it("montre au pèlerin son guide et son agence", async () => {
    afficher("pilgrim");

    expect(await screen.findByText("Guide factice")).toBeInTheDocument();
    expect(screen.getByText("Téléphone non renseigné")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+224600000001" })).toHaveAttribute(
      "href",
      "tel:+224600000001",
    );
  });

  it("donne à l'administrateur la gestion de l'annuaire", async () => {
    afficher("admin");

    expect(
      await screen.findByRole("button", { name: "Ajouter un numéro" }),
    ).toBeInTheDocument();
    expect(
      await screen.findAllByRole("button", { name: "Supprimer" }),
    ).toHaveLength(2);
    expect(fetchMock).not.toHaveBeenCalledWith(
      "/api/emergency/contacts/mine",
      expect.anything(),
    );
  });
});
