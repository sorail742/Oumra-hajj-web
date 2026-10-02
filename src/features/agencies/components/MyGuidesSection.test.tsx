import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { MyGuidesSection } from "./MyGuidesSection";
import { ApiError } from "@/lib/api/types";
import { RoleProvider } from "@/lib/auth/role-context";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";

const get = vi.fn();
const post = vi.fn();
vi.mock("@/lib/api/client", () => ({
  api: {
    get: (...args: unknown[]) => get(...args),
    post: (...args: unknown[]) => post(...args),
  },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

/** Données explicitement factices. */
const GUIDE = {
  id: "guide-fictif-1",
  fullName: "Guide Fictif",
  phone: "+224000000001",
  isActive: true,
};

function afficher() {
  return afficherAvecProviders(
    <RoleProvider role="agency">
      <MyGuidesSection />
    </RoleProvider>,
  );
}

function remplir(libelle: RegExp, valeur: string) {
  fireEvent.change(screen.getByLabelText(libelle), {
    target: { value: valeur },
  });
}

describe("MyGuidesSection", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it("liste les guides de l'agence", async () => {
    get.mockResolvedValue([GUIDE]);
    afficher();
    expect(await screen.findByText("Guide Fictif")).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith("/api/agencies/me/guides");
  });

  it("affiche l'état vide", async () => {
    get.mockResolvedValue([]);
    afficher();
    expect(
      await screen.findByText("Aucun guide pour l'instant."),
    ).toBeInTheDocument();
  });

  it("exige un téléphone ou un e-mail", async () => {
    get.mockResolvedValue([]);
    afficher();
    fireEvent.click(
      await screen.findByRole("button", { name: "Ajouter un guide" }),
    );
    remplir(/Nom complet/, "Guide Fictif");
    fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));
    expect(
      await screen.findByText("Indiquez un téléphone ou un e-mail."),
    ).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it("envoie le guide sans champ vide", async () => {
    get.mockResolvedValue([]);
    post.mockResolvedValue({
      ...GUIDE,
      phone: undefined,
      email: "guide@example.test",
    });
    afficher();
    fireEvent.click(
      await screen.findByRole("button", { name: "Ajouter un guide" }),
    );
    remplir(/Nom complet/, "Guide Fictif");
    remplir(/E-mail/, "Guide@Example.test");
    fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));
    await waitFor(() =>
      expect(post).toHaveBeenCalledWith("/api/agencies/me/guides", {
        fullName: "Guide Fictif",
        email: "guide@example.test",
      }),
    );
  });

  it("explique un conflit (contact déjà utilisé)", async () => {
    get.mockResolvedValue([]);
    post.mockRejectedValue(
      new ApiError({
        statusCode: 409,
        message: "conflit",
        path: "/agencies/me/guides",
        timestamp: "",
      }),
    );
    afficher();
    fireEvent.click(
      await screen.findByRole("button", { name: "Ajouter un guide" }),
    );
    remplir(/Nom complet/, "Guide Fictif");
    remplir(/Téléphone/, "+224000000001");
    fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));
    expect(
      await screen.findByText(
        "Ce téléphone ou cet e-mail est déjà utilisé par un compte.",
      ),
    ).toBeInTheDocument();
  });
});
