import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { PackageForm } from "./PackageForm";

const routeur = { push: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => routeur }));
const fetchMock = vi.fn();

beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

async function remplir(utilisateur: ReturnType<typeof userEvent.setup>) {
  await utilisateur.type(
    screen.getByLabelText("Titre"),
    "Forfait factice (démo)",
  );
  await utilisateur.type(screen.getByLabelText("Date de départ"), "2026-12-01");
  await utilisateur.type(screen.getByLabelText("Date de retour"), "2026-12-15");
  await utilisateur.type(
    screen.getByLabelText(/prix par pèlerin/i),
    "30000000",
  );
  await utilisateur.type(screen.getByLabelText(/nombre de places/i), "40");
  await utilisateur.type(screen.getByLabelText("Ville"), "Médine");
  await utilisateur.type(screen.getByLabelText("Hôtel"), "Hôtel factice");
  await utilisateur.type(
    screen.getByLabelText("Arrivée à l'hôtel"),
    "2026-12-01",
  );
  await utilisateur.type(
    screen.getByLabelText("Départ de l'hôtel"),
    "2026-12-06",
  );
  await utilisateur.type(
    screen.getByLabelText("Prestations incluses"),
    "Vol (fictif)",
  );
}

describe("PackageForm", () => {
  it("crée le forfait avec le corps attendu puis revient à la liste", async () => {
    const utilisateur = userEvent.setup();
    fetchMock.mockResolvedValue(
      Response.json({
        id: "p1",
        agencyId: "a1",
        type: "oumra",
        title: "Forfait factice (démo)",
        startDate: "2026-12-01T00:00:00.000Z",
        endDate: "2026-12-15T00:00:00.000Z",
        price: 30000000,
        currency: "GNF",
        capacity: 40,
        seatsTaken: 0,
        status: "open",
        stages: [],
        inclusions: [],
      }),
    );
    afficherAvecProviders(<PackageForm />);
    await remplir(utilisateur);
    await utilisateur.click(
      screen.getByRole("button", { name: /enregistrer le forfait/i }),
    );

    await waitFor(() =>
      expect(routeur.push).toHaveBeenCalledWith("/my-packages?enregistre=1"),
    );
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/packages");
    expect(JSON.parse(init.body as string)).toMatchObject({
      price: 30000000,
      capacity: 40,
      currency: "GNF",
      stages: [
        { city: "Médine", startDate: "2026-12-01", endDate: "2026-12-06" },
      ],
      inclusions: ["Vol (fictif)"],
    });
  });

  it("explique un refus 409 : agence pas encore validée", async () => {
    const utilisateur = userEvent.setup();
    fetchMock.mockResolvedValue(
      Response.json(
        { statusCode: 409, timestamp: "", path: "", message: "x" },
        { status: 409 },
      ),
    );
    afficherAvecProviders(<PackageForm />);
    await remplir(utilisateur);
    await utilisateur.click(
      screen.getByRole("button", { name: /enregistrer le forfait/i }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /doit être validée/i,
    );
    expect(routeur.push).not.toHaveBeenCalled();
  });

  it("ajoute et retire des étapes", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<PackageForm />);

    expect(
      screen.queryByRole("button", { name: /retirer l'étape/i }),
    ).toBeNull();
    await utilisateur.click(
      screen.getByRole("button", { name: /ajouter une étape/i }),
    );
    expect(screen.getAllByLabelText("Ville")).toHaveLength(2);
    await utilisateur.click(
      screen.getByRole("button", { name: "Retirer l'étape 2" }),
    );
    expect(screen.getAllByLabelText("Ville")).toHaveLength(1);
  });

  it("bloque un prix non entier sans appeler l'API", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<PackageForm />);
    await remplir(utilisateur);
    await utilisateur.clear(screen.getByLabelText(/prix par pèlerin/i));
    await utilisateur.type(screen.getByLabelText(/prix par pèlerin/i), "12,5");
    await utilisateur.click(
      screen.getByRole("button", { name: /enregistrer le forfait/i }),
    );

    expect(
      await screen.findByText(/montant entier en GNF/i),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
