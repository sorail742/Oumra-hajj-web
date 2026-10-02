import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { AgencyValidationScreen } from "./AgencyValidationScreen";

vi.mock("@/lib/auth/role-context", () => ({ useRole: () => "admin" }));

const fetchMock = vi.fn();
const AGENCE = "00000000-0000-4000-8000-0000000000a1";

/** Agence factice en attente, un document légal factice. */
const agence = {
  id: AGENCE,
  legalName: "Agence Factice Voyages",
  ownerId: "00000000-0000-4000-8000-0000000000a2",
  contactEmail: "contact@agence-factice.test",
  contactPhone: "+224600000000",
  legalDocuments: [
    {
      id: "doc-1",
      label: "Agrément (factice)",
      storageRef: "ne-doit-pas-sortir",
      uploadedAt: "2026-09-01T00:00:00.000Z",
    },
  ],
  validationStatus: "pending",
  commissionRate: 0,
};

function repondre(url: string, init?: RequestInit) {
  if (url === `/api/agencies/${AGENCE}` && init?.method !== "PATCH") {
    return Response.json(agence);
  }
  if (url === `/api/agencies/${AGENCE}/reject`) {
    return Response.json({
      ...agence,
      validationStatus: "rejected",
      rejectionReason: "Agrément expiré, à renouveler",
      validatedAt: "2026-10-02T00:00:00.000Z",
    });
  }
  return Response.json({}, { status: 404 });
}

beforeEach(() => {
  fetchMock.mockImplementation((url: string, init?: RequestInit) =>
    Promise.resolve(repondre(url, init)),
  );
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("AgencyValidationScreen (ticket #31)", () => {
  it("présente le dossier : coordonnées, documents et décision", async () => {
    afficherAvecProviders(<AgencyValidationScreen id={AGENCE} />);

    expect(
      await screen.findByRole("heading", { name: "Agence Factice Voyages" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Agrément (factice)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Voir le document" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Approuver l'agence" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("ne-doit-pas-sortir")).toBeNull();
  });

  it("exige un motif d'au moins 3 caractères avant de refuser", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<AgencyValidationScreen id={AGENCE} />);

    await utilisateur.click(
      await screen.findByRole("button", { name: "Refuser" }),
    );
    const dialogue = await screen.findByRole("dialog");
    await utilisateur.type(
      within(dialogue).getByLabelText("Motif du refus"),
      "ab",
    );
    await utilisateur.click(
      within(dialogue).getByRole("button", { name: "Refuser l'agence" }),
    );

    expect(
      await within(dialogue).findByText(/au moins 3 caractères/),
    ).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.some(([url]) => String(url).endsWith("/reject")),
    ).toBe(false);
  });

  it("transmet le motif puis affiche la décision", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<AgencyValidationScreen id={AGENCE} />);

    await utilisateur.click(
      await screen.findByRole("button", { name: "Refuser" }),
    );
    const dialogue = await screen.findByRole("dialog");
    await utilisateur.type(
      within(dialogue).getByLabelText("Motif du refus"),
      "Agrément expiré, à renouveler",
    );
    await utilisateur.click(
      within(dialogue).getByRole("button", { name: "Refuser l'agence" }),
    );

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    const appel = fetchMock.mock.calls.find(([url]) =>
      String(url).endsWith("/reject"),
    ) as [string, RequestInit];
    expect(appel[1].method).toBe("PATCH");
    expect(JSON.parse(String(appel[1].body))).toEqual({
      reason: "Agrément expiré, à renouveler",
    });
    expect(
      await screen.findByText("Motif communiqué à l'agence"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Refuser" })).toBeNull();
  });

  it("ouvre un document légal par la route admin, sans cache", async () => {
    const utilisateur = userEvent.setup();
    const ouvrir = vi.spyOn(window, "open").mockReturnValue(null);
    fetchMock.mockImplementation((url: string, init?: RequestInit) =>
      Promise.resolve(
        url.endsWith("/access-url")
          ? Response.json({
              url: "/api/v1/documents/files/jeton-factice",
              expiresAt: "2026-10-02T00:05:00.000Z",
            })
          : repondre(url, init),
      ),
    );
    afficherAvecProviders(<AgencyValidationScreen id={AGENCE} />);

    await utilisateur.click(
      await screen.findByRole("button", { name: "Voir le document" }),
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/agencies/${AGENCE}/legal-documents/doc-1/access-url`,
        expect.anything(),
      ),
    );
    ouvrir.mockRestore();
  });
});
