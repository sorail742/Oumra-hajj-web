import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { AssignGuideSelect } from "./AssignGuideSelect";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";

const patch = vi.fn();
vi.mock("@/lib/api/client", () => ({
  api: { patch: (...args: unknown[]) => patch(...args) },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

/** Données explicitement factices. */
const GUIDES = [
  { id: "guide-fictif-1", label: "Guide Fictif Un" },
  { id: "guide-fictif-2", label: "Guide Fictif Deux" },
];

describe("AssignGuideSelect", () => {
  beforeEach(() => patch.mockReset());

  it("renvoie vers « Mon agence » sans guide", () => {
    afficherAvecProviders(<AssignGuideSelect groupId="g1" guides={[]} />);
    expect(screen.getByText(/Ajoutez d'abord un guide/)).toBeInTheDocument();
  });

  it("n'active l'envoi que pour un guide différent de l'actuel", () => {
    afficherAvecProviders(
      <AssignGuideSelect
        groupId="g1"
        guideId="guide-fictif-1"
        guides={GUIDES}
      />,
    );
    const bouton = screen.getByRole("button", { name: "Assigner" });
    expect(bouton).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Guide du groupe"), {
      target: { value: "guide-fictif-2" },
    });
    expect(bouton).toBeEnabled();
  });

  it("envoie le guide choisi", async () => {
    patch.mockResolvedValue({
      id: "g1",
      packageId: "p1",
      agencyId: "a1",
      title: "Groupe fictif",
      memberIds: [],
      itinerary: [],
      locations: [],
      guideId: "guide-fictif-2",
    });
    afficherAvecProviders(<AssignGuideSelect groupId="g1" guides={GUIDES} />);
    fireEvent.change(screen.getByLabelText("Guide du groupe"), {
      target: { value: "guide-fictif-2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Assigner" }));
    await waitFor(() =>
      expect(patch).toHaveBeenCalledWith("/api/groups/g1/guide", {
        guideUserId: "guide-fictif-2",
      }),
    );
  });
});
