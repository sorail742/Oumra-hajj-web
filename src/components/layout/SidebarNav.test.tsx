import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { RoleProvider } from "@/lib/auth/role-context";
import type { Role } from "@/lib/auth/permissions";
import { SidebarNav } from "./SidebarNav";

vi.mock("next/navigation", () => ({ usePathname: () => "/bookings/b-1" }));

function afficher(role: Role | undefined) {
  afficherAvecProviders(
    <RoleProvider role={role}>
      <SidebarNav />
    </RoleProvider>,
  );
}

describe("SidebarNav", () => {
  it("montre à une agence ses entrées propres, pas celles de l'administration", () => {
    afficher("agency");
    expect(
      screen.getByRole("link", { name: "Calendrier" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Conformité" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Agences" })).toBeNull();
  });

  it("montre la gestion des agences à l'administration seulement", () => {
    afficher("admin");
    expect(screen.getByRole("link", { name: "Agences" })).toHaveAttribute(
      "href",
      "/agencies",
    );
    expect(screen.queryByRole("link", { name: "Paiements" })).toBeNull();
  });

  it("marque l'entrée active sur un sous-chemin", () => {
    afficher("pilgrim");
    expect(screen.getByRole("link", { name: "Réservations" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Tableau de bord" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("ne montre rien sans rôle connu", () => {
    afficher(undefined);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});
