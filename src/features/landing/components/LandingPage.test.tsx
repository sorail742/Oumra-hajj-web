import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { LandingPage } from "./LandingPage";

describe("LandingPage", () => {
  it("oriente vers les deux parcours d'authentification et l'inscription agence", () => {
    afficherAvecProviders(<LandingPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /votre pèlerinage/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /je suis pèlerin ou guide/i }),
    ).toHaveAttribute("href", "/otp");
    expect(
      screen.getByRole("link", { name: /je suis une agence/i }),
    ).toHaveAttribute("href", "/login");
    for (const lien of screen.getAllByRole("link", {
      name: /inscrire mon agence/i,
    })) {
      expect(lien).toHaveAttribute("href", "/register-agency");
    }
  });

  it("présente les trois profils, les quatre étapes et les garanties", () => {
    afficherAvecProviders(<LandingPage />);

    const profils = screen.getByRole("region", {
      name: "Un espace pour chacun",
    });
    expect(within(profils).getAllByRole("heading", { level: 3 })).toHaveLength(
      3,
    );

    const etapes = screen.getByRole("region", { name: "Comment ça marche" });
    expect(within(etapes).getAllByRole("listitem")).toHaveLength(4);

    const confiance = screen.getByRole("region", {
      name: "La confiance avant tout",
    });
    expect(
      within(confiance).getByText(/personne qualifiée/i),
    ).toBeInTheDocument();
  });

  it("donne un nom distinct à chaque zone de navigation", () => {
    afficherAvecProviders(<LandingPage />);

    const noms = screen
      .getAllByRole("navigation")
      .map((nav) => nav.getAttribute("aria-label"));
    expect(new Set(noms).size).toBe(noms.length);
  });
});
