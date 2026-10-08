import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import type { RoomBlock } from "../api/schemas";
import { RoomBlockCard } from "./RoomBlockCard";

const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast }));

const fetchMock = vi.fn();

/** Bloc explicitement factice (idée #40). */
const bloc: RoomBlock = {
  id: "bloc-1",
  packageId: "forfait-1",
  packageTitle: "Oumra fictive",
  hotelName: "Hôtel Factice",
  city: "La Mecque",
  roomType: "double",
  roomCount: 2,
  bedsPerRoom: 2,
  totalBeds: 4,
  assignedBeds: 2,
  rooms: [
    {
      number: 1,
      occupants: [
        { bookingId: "r1", pilgrimName: "Alpha Factice" },
        { bookingId: "r2", pilgrimName: "Binta Factice" },
      ],
    },
    { number: 2, occupants: [] },
  ],
  unassigned: [{ bookingId: "r3", pilgrimName: "Cheick Factice" }],
};

beforeEach(() => {
  fetchMock.mockResolvedValue(Response.json(bloc));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("RoomBlockCard (idée #40)", () => {
  it("montre l'occupation, les chambres et la rooming list", () => {
    afficherAvecProviders(<RoomBlockCard bloc={bloc} />);

    expect(screen.getByText("2 / 4 places attribuées")).toBeInTheDocument();
    expect(screen.getByText("Alpha Factice")).toBeInTheDocument();
    expect(screen.getAllByText("Place libre")).toHaveLength(2);
    expect(screen.getByRole("link", { name: /Rooming list/ })).toHaveAttribute(
      "href",
      "/api/rooms/blocks/bloc-1/rooming-list/csv",
    );
    // Bloc occupé : suppression impossible.
    expect(screen.getByRole("button", { name: /Supprimer/ })).toBeDisabled();
  });

  it("ne propose que les chambres qui ont de la place", async () => {
    afficherAvecProviders(<RoomBlockCard bloc={bloc} />);
    const chambres = screen.getByLabelText("Chambre");
    expect(
      Array.from((chambres as HTMLSelectElement).options).map((o) => o.text),
    ).toEqual(["Première chambre libre", "Chambre 2 (2 places)"]);
  });

  it("place une réservation dans la chambre choisie", async () => {
    afficherAvecProviders(<RoomBlockCard bloc={bloc} />);

    await userEvent.selectOptions(
      screen.getByLabelText("Pèlerin à placer"),
      "r3",
    );
    await userEvent.selectOptions(screen.getByLabelText("Chambre"), "2");
    await userEvent.click(screen.getByRole("button", { name: "Placer" }));

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/rooms/blocks/bloc-1/assignments");
    expect(init.method).toBe("PUT");
    expect(JSON.parse(String(init.body))).toEqual({
      bookingId: "r3",
      roomNumber: 2,
    });
  });

  it("libère une place", async () => {
    afficherAvecProviders(<RoomBlockCard bloc={bloc} />);
    await userEvent.click(
      screen.getByRole("button", {
        name: "Retirer Alpha Factice de la chambre",
      }),
    );
    await waitFor(() =>
      expect(fetchMock.mock.calls[0]?.[0]).toBe(
        "/api/rooms/blocks/bloc-1/assignments/r1",
      ),
    );
  });
});
