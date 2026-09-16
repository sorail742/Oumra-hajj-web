import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Can } from "./Can";
import { RoleProvider } from "@/lib/auth/role-context";
import type { Role } from "@/lib/auth/permissions";

/**
 * Priorité de test explicite (`docs/testing.md`) : `<Can>` masque bien une
 * action quand le rôle ne correspond pas, et un rôle inconnu (`undefined`)
 * se traduit par un refus, jamais un accès par défaut.
 */
function afficher(roleActuel: Role | undefined, requis: Role | Role[]) {
  render(
    <RoleProvider role={roleActuel}>
      <Can role={requis} fallback={<span>Repli</span>}>
        <button>Action</button>
      </Can>
    </RoleProvider>,
  );
}

describe("Can", () => {
  it("affiche l'enfant quand le rôle correspond", () => {
    afficher("agency", "agency");
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("affiche l'enfant quand le rôle est dans la liste requise", () => {
    afficher("admin", ["agency", "admin"]);
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("masque l'enfant et affiche le repli quand le rôle ne correspond pas", () => {
    afficher("pilgrim", "agency");
    expect(screen.queryByText("Action")).not.toBeInTheDocument();
    expect(screen.getByText("Repli")).toBeInTheDocument();
  });

  it("refuse par défaut quand aucun rôle n'est connu", () => {
    afficher(undefined, "agency");
    expect(screen.queryByText("Action")).not.toBeInTheDocument();
  });
});
