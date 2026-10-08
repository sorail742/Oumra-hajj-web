import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { BookingGroupAssign } from "./BookingGroupAssign";

const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast }));

const fetchMock = vi.fn();

/** Réservation factice renvoyée après rattachement. */
const reservation = {
  id: "b1",
  pilgrimId: "p1",
  packageId: "f1",
  agencyId: "a1",
  status: "confirmed",
  groupId: "g1",
  steps: [],
};
const groupes = [
  { id: "g1", label: "Groupe factice A" },
  { id: "g2", label: "Groupe factice B" },
];

beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("BookingGroupAssign (ticket #54)", () => {
  it("rattache la réservation au groupe choisi", async () => {
    fetchMock.mockResolvedValue(Response.json(reservation));
    const utilisateur = userEvent.setup();
    afficherAvecProviders(
      <BookingGroupAssign
        bookingId="b1"
        groupId={undefined}
        groupes={groupes}
      />,
    );

    const valider = screen.getByRole("button", { name: "Rattacher au groupe" });
    expect(valider).toBeDisabled();
    await utilisateur.selectOptions(screen.getByLabelText("Groupe"), "g1");
    await utilisateur.click(valider);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/bookings/b1/group");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(String(init.body))).toEqual({ groupId: "g1" });
    await vi.waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Le pèlerin a rejoint le groupe.",
      ),
    );
  });

  it("montre le groupe actuel sans proposer de le changer", () => {
    afficherAvecProviders(
      <BookingGroupAssign bookingId="b1" groupId="g2" groupes={groupes} />,
    );
    expect(
      screen.getByText("Réservation rattachée au groupe « Groupe factice B »."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Voir le groupe" }),
    ).toHaveAttribute("href", "/groups/g2");
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("invite à créer un groupe quand le forfait n'en a aucun", () => {
    afficherAvecProviders(
      <BookingGroupAssign bookingId="b1" groupId={undefined} groupes={[]} />,
    );
    expect(
      screen.getByRole("link", { name: "Créer un groupe" }),
    ).toHaveAttribute("href", "/groups");
  });
});
