import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { MyAgencyScreen } from "./MyAgencyScreen";

vi.mock("@/lib/auth/role-context", () => ({ useRole: () => "agency" }));

const fetchMock = vi.fn();

/** Agence factice refusée, avec un compte bancaire explicitement factice. */
const agence = {
  id: "a1",
  legalName: "Agence Factice Voyages",
  ownerId: "o1",
  contactEmail: "contact@agence-factice.test",
  contactPhone: "+224600000000",
  address: "Adresse factice",
  legalDocuments: [],
  validationStatus: "rejected",
  rejectionReason: "Agrément expiré (factice)",
  validatedAt: "2026-10-01T00:00:00.000Z",
  commissionRate: 0,
  bankDetails: {
    accountName: "Agence Factice",
    accountNumber: "FACTICE-00001234",
    bankName: "Banque Factice",
  },
};

function corpsPatch(): unknown {
  const appel = fetchMock.mock.calls.find(
    ([, init]) => (init as RequestInit | undefined)?.method === "PATCH",
  ) as [string, RequestInit] | undefined;
  return appel ? JSON.parse(String(appel[1].body)) : undefined;
}

beforeEach(() => {
  fetchMock.mockImplementation(() => Promise.resolve(Response.json(agence)));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("MyAgencyScreen (ticket #47)", () => {
  it("affiche le motif de refus et masque le numéro de compte par défaut", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<MyAgencyScreen />);

    expect(
      await screen.findByText("Agrément expiré (factice)"),
    ).toBeInTheDocument();
    expect(screen.getByText("•••• 1234")).toBeInTheDocument();
    expect(screen.queryByText("FACTICE-00001234")).toBeNull();

    await utilisateur.click(
      screen.getByRole("button", { name: "Afficher le numéro de compte" }),
    );
    expect(screen.getByText("FACTICE-00001234")).toBeInTheDocument();
  });

  it("n'envoie que l'adresse quand le numéro de compte n'est pas ressaisi", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<MyAgencyScreen />);

    const adresse = await screen.findByLabelText("Adresse de l'agence");
    await utilisateur.clear(adresse);
    await utilisateur.type(adresse, "Nouvelle adresse factice");
    await utilisateur.click(
      screen.getByRole("button", { name: "Enregistrer" }),
    );

    await waitFor(() =>
      expect(corpsPatch()).toEqual({ address: "Nouvelle adresse factice" }),
    );
  });

  it("exige titulaire et banque avec un nouveau numéro de compte", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<MyAgencyScreen />);

    await utilisateur.clear(await screen.findByLabelText("Banque"));
    await utilisateur.type(
      screen.getByLabelText("Numéro de compte"),
      "FACTICE-99990000",
    );
    await utilisateur.click(
      screen.getByRole("button", { name: "Enregistrer" }),
    );

    expect(
      await screen.findByText(
        "Renseignez le titulaire, la banque et le numéro de compte.",
      ),
    ).toBeInTheDocument();
    expect(corpsPatch()).toBeUndefined();
  });

  it("envoie les trois champs bancaires ensemble", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<MyAgencyScreen />);

    await utilisateur.type(
      await screen.findByLabelText("Numéro de compte"),
      "FACTICE-99990000",
    );
    await utilisateur.click(
      screen.getByRole("button", { name: "Enregistrer" }),
    );

    await waitFor(() =>
      expect(corpsPatch()).toEqual({
        address: "Adresse factice",
        bankDetails: {
          accountName: "Agence Factice",
          accountNumber: "FACTICE-99990000",
          bankName: "Banque Factice",
        },
      }),
    );
  });
});
