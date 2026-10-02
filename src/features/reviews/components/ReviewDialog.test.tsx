import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { ReviewDialog } from "./ReviewDialog";

const fetchMock = vi.fn();
const RESERVATION = "00000000-0000-4000-8000-0000000000f1";

beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

async function ouvrir() {
  const utilisateur = userEvent.setup();
  afficherAvecProviders(<ReviewDialog bookingId={RESERVATION} />);
  await utilisateur.click(
    screen.getByRole("button", { name: "Laisser un avis" }),
  );
  return { utilisateur, dialogue: await screen.findByRole("dialog") };
}

describe("ReviewDialog (ticket #59)", () => {
  it("exige une note avant d'envoyer", async () => {
    const { utilisateur, dialogue } = await ouvrir();

    await utilisateur.click(
      within(dialogue).getByRole("button", { name: "Publier mon avis" }),
    );

    expect(
      within(dialogue).getByText("Choisissez une note de 1 à 5 étoiles."),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("se note au clavier et envoie note et commentaire", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        {
          id: "r1",
          pilgrimId: "p1",
          agencyId: "a1",
          bookingId: RESERVATION,
          rating: 4,
          comment: "Accompagnement soigné (factice)",
          createdAt: "2026-10-02T10:00:00.000Z",
        },
        { status: 201 },
      ),
    );
    const { utilisateur, dialogue } = await ouvrir();

    await utilisateur.click(within(dialogue).getByLabelText("3 étoiles sur 5"));
    await utilisateur.keyboard("{ArrowRight}");
    expect(within(dialogue).getByLabelText("4 étoiles sur 5")).toBeChecked();
    await utilisateur.type(
      within(dialogue).getByLabelText("Commentaire (facultatif)"),
      "Accompagnement soigné (factice)",
    );
    await utilisateur.click(
      within(dialogue).getByRole("button", { name: "Publier mon avis" }),
    );

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/reviews");
    expect(JSON.parse(String(init.body))).toEqual({
      bookingId: RESERVATION,
      rating: 4,
      comment: "Accompagnement soigné (factice)",
    });
  });

  it("explique un avis déjà déposé (409) sans lire le message du backend", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        { statusCode: 409, timestamp: "", path: "", message: "texte libre" },
        { status: 409 },
      ),
    );
    const { utilisateur, dialogue } = await ouvrir();

    await utilisateur.click(within(dialogue).getByLabelText("5 étoiles sur 5"));
    await utilisateur.click(
      within(dialogue).getByRole("button", { name: "Publier mon avis" }),
    );

    expect(
      await within(dialogue).findByText(/déjà laissé un avis/),
    ).toBeInTheDocument();
    expect(within(dialogue).queryByText("texte libre")).toBeNull();
  });
});
