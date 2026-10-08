import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { RoleProvider } from "@/lib/auth/role-context";
import { LegalDocumentUploader } from "./LegalDocumentUploader";
import { LegalDocumentsLibrary } from "./LegalDocumentsLibrary";

const fetchMock = vi.fn();

/** Agence et documents explicitement factices. */
const agence = {
  id: "a1",
  legalName: "[DÉMO] Agence factice",
  ownerId: "u1",
  contactEmail: "agence@exemple.test",
  contactPhone: "+224600000000",
  validationStatus: "approved",
  commissionRate: 5,
  legalDocuments: [
    {
      id: "doc-statuts",
      label: "Statuts (factice)",
      uploadedAt: "2026-09-01T10:00:00.000Z",
    },
    {
      id: "doc-agrement",
      label: "Agrément (factice)",
      uploadedAt: "2026-09-10T10:00:00.000Z",
      expiresAt: "2026-10-01T00:00:00.000Z",
    },
  ],
};
const alertes = [
  {
    id: "doc-agrement",
    label: "Agrément (factice)",
    expiresAt: "2026-10-01T00:00:00.000Z",
    status: "expired",
  },
];

function repondre(url: string, init?: RequestInit) {
  if (url === "/api/agencies/me") return Response.json(agence);
  if (url === "/api/agencies/me/legal-documents/alerts")
    return Response.json(alertes);
  if (url === "/api/agencies/me/legal-documents" && init?.method === "POST")
    return Response.json(agence, { status: 201 });
  return Response.json({}, { status: 404 });
}

function afficher(enfant: React.ReactNode) {
  return afficherAvecProviders(
    <RoleProvider role="agency">{enfant}</RoleProvider>,
  );
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

describe("LegalDocumentsLibrary (ticket #48)", () => {
  it("liste tous les documents, sans présumer expiré un document sans échéance", async () => {
    afficher(<LegalDocumentsLibrary />);

    expect(await screen.findByText("Statuts (factice)")).toBeInTheDocument();
    expect(screen.getByText(/sans échéance/)).toBeInTheDocument();
    expect(screen.getByText("Agrément (factice)")).toBeInTheDocument();
    // Seul l'agrément, en alerte côté backend, porte un statut.
    await waitFor(() => expect(screen.getAllByText("Expiré")).toHaveLength(1));
  });
});

describe("LegalDocumentUploader (ticket #48)", () => {
  it("exige un intitulé avant d'envoyer", async () => {
    const utilisateur = userEvent.setup();
    afficher(<LegalDocumentUploader />);

    await utilisateur.upload(
      screen.getByTestId("file-dropzone-input"),
      new File(["x"], "agrement-factice.pdf", { type: "application/pdf" }),
    );
    await utilisateur.click(
      await screen.findByRole("button", { name: "Envoyer" }),
    );

    expect(
      await screen.findByText(/Indiquez l'intitulé du document/),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("dépose le fichier en multipart avec l'intitulé et l'échéance", async () => {
    const utilisateur = userEvent.setup();
    afficher(<LegalDocumentUploader />);

    await utilisateur.type(
      screen.getByLabelText("Intitulé du document"),
      "Agrément (factice)",
    );
    await utilisateur.type(
      screen.getByLabelText(/Date d'échéance/),
      "2027-06-30",
    );
    await utilisateur.upload(
      screen.getByTestId("file-dropzone-input"),
      new File(["x"], "agrement-factice.pdf", { type: "application/pdf" }),
    );
    await utilisateur.click(
      await screen.findByRole("button", { name: "Envoyer" }),
    );

    expect(await screen.findByText("Document déposé.")).toBeInTheDocument();
    const appel = fetchMock.mock.calls.find(
      ([url]) => url === "/api/agencies/me/legal-documents",
    ) as [string, RequestInit];
    const corps = appel[1].body as FormData;
    expect(corps.get("label")).toBe("Agrément (factice)");
    expect(corps.get("expiresAt")).toBe("2027-06-30");
    expect(corps.get("file")).toBeInstanceOf(File);
  });
});
