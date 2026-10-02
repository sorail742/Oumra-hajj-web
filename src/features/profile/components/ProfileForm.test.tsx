import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { RoleProvider } from "@/lib/auth/role-context";
import type { Utilisateur } from "@/lib/auth/use-current-user";
import { ProfileForm } from "./ProfileForm";

const fetchMock = vi.fn();

/** Utilisateur factice explicite. */
const pelerin: Utilisateur = {
  id: "00000000-0000-4000-8000-000000000070",
  fullName: "Pèlerin Factice",
  phone: "+224000000000",
  role: "pilgrim",
  preferredLanguage: "fr",
  isActive: true,
};

function afficher(utilisateur: Utilisateur) {
  afficherAvecProviders(
    <RoleProvider role={utilisateur.role}>
      <ProfileForm utilisateur={utilisateur} />
    </RoleProvider>,
  );
}

function saisir(libelle: RegExp, valeur: string) {
  fireEvent.change(screen.getByLabelText(libelle), {
    target: { value: valeur },
  });
}

beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("ProfileForm", () => {
  it("invite un pèlerin sans contact d'urgence à le renseigner (lien avec le SOS)", () => {
    afficher(pelerin);
    expect(
      screen.getByText(/seul votre guide serait prévenu/i),
    ).toBeInTheDocument();
  });

  it("n'affiche pas cette invitation à une agence", () => {
    afficher({ ...pelerin, role: "agency", email: "agence@exemple.test" });
    expect(screen.queryByText(/seul votre guide serait prévenu/i)).toBeNull();
  });

  it("refuse un contact d'urgence sans téléphone, sans appeler l'API", async () => {
    afficher(pelerin);
    saisir(/nom du contact/i, "Contact Factice");
    fireEvent.click(screen.getByRole("button", { name: /enregistrer/i }));

    expect(
      await screen.findByText(/nom et le téléphone du contact/i),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("envoie uniquement les champs renseignés", async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        ...pelerin,
        emergencyContact: {
          fullName: "Contact Factice",
          phone: "+224000000001",
        },
      }),
    );
    afficher(pelerin);
    saisir(/nom du contact/i, "Contact Factice");
    saisir(/téléphone du contact/i, "+224000000001");
    fireEvent.click(screen.getByRole("button", { name: /enregistrer/i }));

    expect(await screen.findByText("Profil enregistré.")).toBeInTheDocument();
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/users/me",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({
            fullName: "Pèlerin Factice",
            emergencyContact: {
              fullName: "Contact Factice",
              phone: "+224000000001",
            },
          }),
        }),
      ),
    );
  });
});
