import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { CancelBookingDialog } from "./CancelBookingDialog";

const RESERVATION = "00000000-0000-4000-8000-000000000080";
const fetchMock = vi.fn();

const reservationAnnulee = {
  id: RESERVATION,
  pilgrimId: "00000000-0000-4000-8000-000000000081",
  packageId: "00000000-0000-4000-8000-000000000082",
  agencyId: "00000000-0000-4000-8000-000000000083",
  status: "cancelled",
  steps: [],
};

beforeEach(() => {
  fetchMock.mockResolvedValue(Response.json(reservationAnnulee));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("CancelBookingDialog", () => {
  it("n'annule rien tant que le pèlerin n'a pas confirmé", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<CancelBookingDialog bookingId={RESERVATION} />);

    await utilisateur.click(
      screen.getByRole("button", { name: "Annuler la réservation" }),
    );
    await utilisateur.click(
      screen.getByRole("button", { name: "Garder ma réservation" }),
    );

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("annule la réservation après confirmation", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<CancelBookingDialog bookingId={RESERVATION} />);

    await utilisateur.click(
      screen.getByRole("button", { name: "Annuler la réservation" }),
    );
    await utilisateur.click(
      screen.getByRole("button", { name: "Oui, annuler la réservation" }),
    );

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`/api/bookings/${RESERVATION}/cancel`);
    expect(init.method).toBe("PATCH");
  });
});
