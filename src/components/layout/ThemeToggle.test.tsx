import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { ThemeToggle } from "./ThemeToggle";

const setTheme = vi.fn();
let themeResolu = "light";
vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: themeResolu, setTheme }),
}));

describe("ThemeToggle", () => {
  it("propose le mode sombre depuis le thème clair", async () => {
    themeResolu = "light";
    afficherAvecProviders(<ThemeToggle />);
    await userEvent.click(
      screen.getByRole("button", { name: "Passer en mode sombre" }),
    );
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("propose le mode clair depuis le thème sombre", async () => {
    themeResolu = "dark";
    afficherAvecProviders(<ThemeToggle />);
    await userEvent.click(
      screen.getByRole("button", { name: "Passer en mode clair" }),
    );
    expect(setTheme).toHaveBeenCalledWith("light");
  });
});
