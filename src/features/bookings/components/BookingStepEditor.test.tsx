import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { BookingStepEditor } from "./BookingStepEditor";

const RESERVATION = "00000000-0000-4000-8000-000000000070";
const fetchMock = vi.fn();

/** Réservation factice renvoyée par `PATCH .../step`. */
const reservation = {
  id: RESERVATION,
  pilgrimId: "00000000-0000-4000-8000-000000000071",
  packageId: "00000000-0000-4000-8000-000000000072",
  agencyId: "00000000-0000-4000-8000-000000000073",
  status: "confirmed",
  steps: [
    {
      key: "visa",
      status: "in_progress",
      updatedAt: "2026-10-02T00:00:00.000Z",
    },
  ],
};

beforeEach(() => {
  fetchMock.mockResolvedValue(Response.json(reservation));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("BookingStepEditor", () => {
  it("affiche le statut courant de chaque étape, « À faire » par défaut", () => {
    afficherAvecProviders(
      <BookingStepEditor
        bookingId={RESERVATION}
        steps={[
          {
            key: "payment",
            status: "done",
            updatedAt: "2026-10-01T00:00:00.000Z",
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("combobox", { name: "Statut de l'étape « Visa »" }),
    ).toHaveValue("pending");
    expect(screen.getAllByRole("combobox")).toHaveLength(5);
    expect(screen.getAllByRole("combobox")[0]).toHaveValue("done");
  });

  it("envoie la clé et le nouveau statut au backend", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(
      <BookingStepEditor bookingId={RESERVATION} steps={[]} />,
    );

    await utilisateur.selectOptions(
      screen.getByRole("combobox", { name: "Statut de l'étape « Visa »" }),
      "in_progress",
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`/api/bookings/${RESERVATION}/step`);
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(String(init.body))).toEqual({
      key: "visa",
      status: "in_progress",
    });
  });
});
