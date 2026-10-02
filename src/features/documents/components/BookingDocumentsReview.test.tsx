import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingDocumentsReview } from "./BookingDocumentsReview";
import { ApiError } from "@/lib/api/types";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";

vi.mock("@/lib/auth/role-context", () => ({ useRole: () => "agency" }));

const get = vi.fn();
const patch = vi.fn();
vi.mock("@/lib/api/client", () => ({
  api: {
    get: (...args: unknown[]) => get(...args),
    patch: (...args: unknown[]) => patch(...args),
  },
}));

const BOOKING = "00000000-0000-4000-8000-000000000020";

/** Données factices explicites, forme `PilgrimDocumentShape`. */
function documentFactice(
  id: string,
  status: "pending" | "validated" | "rejected",
  extra = {},
) {
  return {
    id,
    bookingId: BOOKING,
    pilgrimId: "00000000-0000-4000-8000-000000000021",
    type: "passport",
    storageRef: "documents/factice.pdf",
    status,
    ...extra,
  };
}

function afficher() {
  return afficherAvecProviders(<BookingDocumentsReview bookingId={BOOKING} />);
}

/** Ouvre la modale de refus du premier document, saisit le motif et valide. */
async function refuserAvecMotif(
  utilisateur: ReturnType<typeof userEvent.setup>,
  motif: string,
) {
  await utilisateur.click(
    (await screen.findAllByRole("button", { name: "Refuser" }))[0]!,
  );
  const dialogue = await screen.findByRole("dialog");
  await utilisateur.type(
    within(dialogue).getByLabelText("Motif du refus"),
    motif,
  );
  await utilisateur.click(
    within(dialogue).getByRole("button", { name: "Refuser le document" }),
  );
  return dialogue;
}

describe("BookingDocumentsReview", () => {
  beforeEach(() => {
    get.mockReset();
    patch.mockReset();
  });

  it("liste les documents du dossier demandé, avec leur statut", async () => {
    get.mockResolvedValue([documentFactice("doc-1", "pending")]);
    afficher();

    expect((await screen.findAllByText("Passeport")).length).toBeGreaterThan(0);
    expect(get).toHaveBeenCalledWith("/api/documents", {
      params: { bookingId: BOOKING },
    });
  });

  it("valide un document en un clic puis recharge la liste", async () => {
    const utilisateur = userEvent.setup();
    get
      .mockResolvedValueOnce([documentFactice("doc-1", "pending")])
      .mockResolvedValue([documentFactice("doc-1", "validated")]);
    patch.mockResolvedValue(documentFactice("doc-1", "validated"));
    afficher();

    await utilisateur.click(
      (await screen.findAllByRole("button", { name: "Valider" }))[0]!,
    );

    expect(patch).toHaveBeenCalledWith("/api/documents/doc-1/validate");
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
  });

  it("n'envoie pas de refus sans motif suffisant", async () => {
    const utilisateur = userEvent.setup();
    get.mockResolvedValue([documentFactice("doc-1", "pending")]);
    afficher();

    const dialogue = await refuserAvecMotif(utilisateur, "  a ");

    expect(
      await within(dialogue).findByText(
        "Le motif doit contenir au moins 3 caractères.",
      ),
    ).toBeInTheDocument();
    expect(patch).not.toHaveBeenCalled();
  });

  it("refuse avec le motif saisi et ferme la modale", async () => {
    const utilisateur = userEvent.setup();
    get.mockResolvedValue([documentFactice("doc-1", "pending")]);
    patch.mockResolvedValue(
      documentFactice("doc-1", "rejected", {
        rejectionReason: "Scan illisible",
      }),
    );
    afficher();

    await refuserAvecMotif(utilisateur, "Scan illisible");

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(patch).toHaveBeenCalledWith("/api/documents/doc-1/reject", {
      reason: "Scan illisible",
    });
  });

  it("rattache l'erreur de validation du backend au champ motif", async () => {
    const utilisateur = userEvent.setup();
    get.mockResolvedValue([documentFactice("doc-1", "pending")]);
    patch.mockRejectedValue(
      new ApiError({
        statusCode: 400,
        message: ["reason must be longer than or equal to 3 characters"],
        path: "/api/v1/documents/doc-1/reject",
        timestamp: "2026-10-01T00:00:00.000Z",
      }),
    );
    afficher();

    const dialogue = await refuserAvecMotif(utilisateur, "Motif");

    expect(
      await within(dialogue).findByText(
        "reason must be longer than or equal to 3 characters",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("masque l'action qui ramènerait un document à son statut actuel", async () => {
    get.mockResolvedValue([documentFactice("doc-1", "validated")]);
    afficher();

    await screen.findAllByText("Passeport");
    expect(screen.queryByRole("button", { name: "Valider" })).toBeNull();
    expect(
      screen.getAllByRole("button", { name: "Refuser" }).length,
    ).toBeGreaterThan(0);
  });
});
