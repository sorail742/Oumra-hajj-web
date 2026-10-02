import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { LandingPage } from "./LandingPage";

describe("LandingPage", () => {
  it("oriente vers les deux parcours d'authentification et l'inscription agence", () => {
    afficherAvecProviders(<LandingPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /le voyage d'une vie/i }),
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

  it("présente les profils, les cinq étapes du parcours et les garanties", () => {
    afficherAvecProviders(<LandingPage />);

    const profils = screen.getByRole("region", {
      name: /un espace pour chacun/i,
    });
    expect(within(profils).getAllByRole("heading", { level: 3 })).toHaveLength(
      3,
    );

    const parcours = screen.getByRole("region", { name: /du premier clic/i });
    expect(within(parcours).getAllByRole("listitem")).toHaveLength(5);

    const confiance = screen.getByRole("region", {
      name: /la confiance n'est pas une option/i,
    });
    expect(within(confiance).getAllByRole("listitem")).toHaveLength(4);
  });

  it("signale le contenu religieux comme à valider (CLAUDE.md règle 13)", () => {
    afficherAvecProviders(<LandingPage />);

    const fonctionnalites = screen.getByRole("region", {
      name: /tout le dossier, au même endroit/i,
    });
    expect(
      within(fonctionnalites).getByText(/personne qualifiée/i),
    ).toBeInTheDocument();
  });

  it("légende l'aperçu de l'espace pèlerin comme données fictives", () => {
    afficherAvecProviders(<LandingPage />);

    expect(screen.getByText(/données fictives/i)).toBeInTheDocument();
  });

  it("propose cinq questions fréquentes dépliables", () => {
    afficherAvecProviders(<LandingPage />);

    const faq = screen.getByRole("region", {
      name: /vous vous posez la question/i,
    });
    expect(within(faq).getAllByRole("group")).toHaveLength(5);
  });

  it("donne un nom distinct à chaque zone de navigation et un lien d'évitement", () => {
    afficherAvecProviders(<LandingPage />);

    const noms = screen
      .getAllByRole("navigation")
      .map((nav) => nav.getAttribute("aria-label"));
    expect(new Set(noms).size).toBe(noms.length);
    expect(
      screen.getByRole("link", { name: /aller au contenu/i }),
    ).toHaveAttribute("href", "#contenu");
  });
});
