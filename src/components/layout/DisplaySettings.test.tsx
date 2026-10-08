import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { DisplaySettings } from "./DisplaySettings";

const setTheme = vi.fn();
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "system", setTheme }),
}));

const racine = document.documentElement;

afterEach(() => {
  racine.removeAttribute("data-text-size");
  racine.removeAttribute("data-contrast");
  document.cookie = "affichage-texte=; max-age=0; path=/";
  document.cookie = "affichage-contraste=; max-age=0; path=/";
});

describe("DisplaySettings", () => {
  it("agrandit le texte et l'applique au document", async () => {
    afficherAvecProviders(<DisplaySettings />);
    await userEvent.click(
      screen.getByRole("button", { name: /Réglages d'affichage/ }),
    );
    const tresGrand = screen.getByRole("button", { name: "Très grand" });
    await userEvent.click(tresGrand);
    expect(racine.dataset.textSize).toBe("x-large");
    expect(document.cookie).toContain("affichage-texte=x-large");
    expect(tresGrand).toHaveAttribute("aria-pressed", "true");
  });

  it("active le contraste élevé sans toucher à la taille", async () => {
    racine.setAttribute("data-text-size", "large");
    afficherAvecProviders(<DisplaySettings />);
    await userEvent.click(
      screen.getByRole("button", { name: /Réglages d'affichage/ }),
    );
    expect(screen.getByRole("button", { name: "Grand" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await userEvent.click(screen.getByRole("button", { name: "Élevé" }));
    expect(racine.dataset.contrast).toBe("high");
    expect(racine.dataset.textSize).toBe("large");
  });

  it("règle le thème, y compris sur mobile où la bascule est masquée", async () => {
    afficherAvecProviders(<DisplaySettings />);
    await userEvent.click(
      screen.getByRole("button", { name: /Réglages d'affichage/ }),
    );
    expect(screen.getByRole("button", { name: "Système" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await userEvent.click(screen.getByRole("button", { name: "Sombre" }));
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("se ferme avec Échap", async () => {
    afficherAvecProviders(<DisplaySettings />);
    await userEvent.click(
      screen.getByRole("button", { name: /Réglages d'affichage/ }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
