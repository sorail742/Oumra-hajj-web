import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { DocumentUploader } from "./DocumentUploader";

const RESERVATION = "00000000-0000-4000-8000-000000000060";
const fetchMock = vi.fn();

/** Pièces factices déjà déposées pour ce dossier. */
const documents = [
  { id: "d1", bookingId: RESERVATION, type: "passport", status: "validated" },
  {
    id: "d2",
    bookingId: RESERVATION,
    type: "visa",
    status: "rejected",
    rejectionReason: "scan illisible (factice)",
  },
  { id: "d3", bookingId: "autre", type: "flight_ticket", status: "pending" },
];

function repondre(url: string, init?: RequestInit) {
  if (url === "/api/documents/mine") return Response.json(documents);
  if (url === "/api/documents" && init?.method === "POST") {
    return Response.json(
      { id: "d4", bookingId: RESERVATION, type: "visa", status: "pending" },
      { status: 201 },
    );
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

describe("DocumentUploader", () => {
  it("rappelle l'état des pièces de ce dossier uniquement", async () => {
    afficherAvecProviders(<DocumentUploader bookingId={RESERVATION} />);

    expect(
      await screen.findByText("Refusé : scan illisible (factice)"),
    ).toBeInTheDocument();
    // Billet d'avion déposé pour une autre réservation : toujours « à déposer » ici.
    expect(screen.getAllByText("À déposer")).toHaveLength(2);
  });

  it("ne propose la date d'expiration que pour le passeport et le visa", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<DocumentUploader bookingId={RESERVATION} />);

    expect(screen.getByLabelText(/date d'expiration/i)).toBeInTheDocument();
    await utilisateur.selectOptions(
      screen.getByLabelText(/type de document/i),
      "flight_ticket",
    );
    expect(screen.queryByLabelText(/date d'expiration/i)).toBeNull();
  });

  it("dépose le fichier en multipart avec la réservation, le type et l'expiration", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<DocumentUploader bookingId={RESERVATION} />);

    await utilisateur.selectOptions(
      screen.getByLabelText(/type de document/i),
      "visa",
    );
    await utilisateur.type(
      screen.getByLabelText(/date d'expiration/i),
      "2027-06-30",
    );
    await utilisateur.upload(
      screen.getByTestId("file-dropzone-input"),
      new File(["x"], "visa-factice.pdf", { type: "application/pdf" }),
    );
    await utilisateur.click(
      await screen.findByRole("button", { name: "Envoyer" }),
    );

    expect(
      await screen.findByText(/en attente de vérification/i),
    ).toBeInTheDocument();
    const appel = fetchMock.mock.calls.find(
      ([url, init]) =>
        url === "/api/documents" && (init as RequestInit).method === "POST",
    );
    const corps = (appel?.[1] as RequestInit).body as FormData;
    expect(corps.get("bookingId")).toBe(RESERVATION);
    expect(corps.get("type")).toBe("visa");
    expect(corps.get("expiresAt")).toBe("2027-06-30");
    expect((corps.get("file") as File).name).toBe("visa-factice.pdf");
    await waitFor(() =>
      expect(screen.queryByText("visa-factice.pdf")).toBeNull(),
    );
  });
});
