import { describe, expect, it, vi } from "vitest";
import {
  appliquerErreurFormulaire,
  interpreterErreurFormulaire,
} from "./form-errors";
import { ApiError, NetworkError, type ErrorResponse } from "./types";

function erreurApi(statusCode: number, message: string | string[]): ApiError {
  const corps: ErrorResponse = {
    statusCode,
    timestamp: "2026-01-01T00:00:00.000Z",
    path: "/api/v1/test",
    message,
  };
  return new ApiError(corps);
}

const CHAMPS = ["email", "password", "fullName"] as const;
const OPTIONS = {
  messageGenerique: "Une erreur est survenue.",
  champsConnus: CHAMPS,
};

describe("interpreterErreurFormulaire", () => {
  describe("erreur de validation (message tableau)", () => {
    it("rattache chaque entrée au champ que son premier mot désigne", () => {
      const resultat = interpreterErreurFormulaire(
        erreurApi(400, [
          "email must be an email",
          "password must be longer than or equal to 8 characters",
        ]),
        OPTIONS,
      );

      expect(resultat.champs).toEqual({
        email: "email must be an email",
        password: "password must be longer than or equal to 8 characters",
      });
      expect(resultat.globaux).toEqual([]);
    });

    it("garde la première entrée quand un champ en reçoit plusieurs", () => {
      const resultat = interpreterErreurFormulaire(
        erreurApi(400, [
          "password must be longer than or equal to 8 characters",
          "password must contain a digit",
        ]),
        OPTIONS,
      );

      expect(resultat.champs).toEqual({
        password: "password must be longer than or equal to 8 characters",
      });
      expect(resultat.globaux).toEqual([]);
    });

    it("liste dans le bandeau une entrée qui ne désigne aucun champ connu", () => {
      const resultat = interpreterErreurFormulaire(
        erreurApi(400, [
          "email must be an email",
          "unknownField is not allowed",
        ]),
        OPTIONS,
      );

      expect(resultat.champs).toEqual({ email: "email must be an email" });
      expect(resultat.globaux).toEqual(["unknownField is not allowed"]);
    });

    it("liste tout dans le bandeau quand aucun champ n'est déclaré", () => {
      const resultat = interpreterErreurFormulaire(
        erreurApi(400, ["email must be an email"]),
        { messageGenerique: "Une erreur est survenue." },
      );

      expect(resultat.champs).toEqual({});
      expect(resultat.globaux).toEqual(["email must be an email"]);
    });

    it("ramène une propriété imbriquée à son champ racine", () => {
      const resultat = interpreterErreurFormulaire(
        erreurApi(400, ["fullName.first must be a string"]),
        OPTIONS,
      );

      expect(resultat.champs).toEqual({
        fullName: "fullName.first must be a string",
      });
    });

    it("ne confond pas un champ avec un mot voisin", () => {
      const resultat = interpreterErreurFormulaire(
        erreurApi(400, ["emailAddress must be an email"]),
        OPTIONS,
      );

      expect(resultat.champs).toEqual({});
      expect(resultat.globaux).toEqual(["emailAddress must be an email"]);
    });
  });

  describe("message chaîne", () => {
    it("reprend tel quel le message du backend sur un 4xx", () => {
      const resultat = interpreterErreurFormulaire(
        erreurApi(409, "Un compte existe déjà avec cet email"),
        OPTIONS,
      );

      expect(resultat).toEqual({
        champs: {},
        globaux: ["Un compte existe déjà avec cet email"],
      });
    });

    it("préfère le message générique quand le message 4xx est vide", () => {
      const resultat = interpreterErreurFormulaire(
        erreurApi(400, "  "),
        OPTIONS,
      );

      expect(resultat.globaux).toEqual(["Une erreur est survenue."]);
    });
  });

  describe("messages propres à l'écran", () => {
    it("donne la priorité au message du statut sur celui du backend", () => {
      const resultat = interpreterErreurFormulaire(
        erreurApi(401, "Identifiants invalides"),
        {
          ...OPTIONS,
          parStatut: { 401: "Email ou mot de passe incorrect." },
        },
      );

      expect(resultat).toEqual({
        champs: {},
        globaux: ["Email ou mot de passe incorrect."],
      });
    });

    it("donne aussi la priorité au message du statut sur une validation", () => {
      const resultat = interpreterErreurFormulaire(
        erreurApi(400, ["email must be an email"]),
        { ...OPTIONS, parStatut: { 400: "Vérifiez le formulaire." } },
      );

      expect(resultat).toEqual({
        champs: {},
        globaux: ["Vérifiez le formulaire."],
      });
    });

    it("ignore parStatut pour un autre statut", () => {
      const resultat = interpreterErreurFormulaire(
        erreurApi(409, "Compte existant"),
        { ...OPTIONS, parStatut: { 401: "Non autorisé." } },
      );

      expect(resultat.globaux).toEqual(["Compte existant"]);
    });
  });

  describe("erreurs sans détail exploitable", () => {
    it.each([500, 502, 503])(
      "affiche le message générique sur un %i, même avec un message chaîne",
      (statut) => {
        const resultat = interpreterErreurFormulaire(
          erreurApi(statut, "Internal server error"),
          OPTIONS,
        );

        expect(resultat).toEqual({
          champs: {},
          globaux: ["Une erreur est survenue."],
        });
      },
    );

    it("n'expose pas le détail d'un 5xx même quand message est un tableau", () => {
      const resultat = interpreterErreurFormulaire(
        erreurApi(500, ["email must be an email"]),
        OPTIONS,
      );

      expect(resultat).toEqual({
        champs: {},
        globaux: ["Une erreur est survenue."],
      });
    });

    it("affiche le message réseau quand le serveur n'a pas répondu", () => {
      const resultat = interpreterErreurFormulaire(new NetworkError(), {
        ...OPTIONS,
        messageReseau: "Vérifiez votre connexion.",
      });

      expect(resultat.globaux).toEqual(["Vérifiez votre connexion."]);
    });

    it("se rabat sur le message générique sans messageReseau", () => {
      const resultat = interpreterErreurFormulaire(new NetworkError(), OPTIONS);

      expect(resultat.globaux).toEqual(["Une erreur est survenue."]);
    });

    it.each([
      ["une Error", new Error("boom")],
      ["une chaîne", "boom"],
      ["null", null],
      ["undefined", undefined],
    ])("affiche le message générique pour %s", (_nom, erreur) => {
      const resultat = interpreterErreurFormulaire(erreur, OPTIONS);

      expect(resultat).toEqual({
        champs: {},
        globaux: ["Une erreur est survenue."],
      });
    });
  });
});

describe("appliquerErreurFormulaire", () => {
  interface Valeurs {
    email: string;
    password: string;
  }

  it("appelle setError par champ reconnu et renvoie les messages du bandeau", () => {
    const setError = vi.fn();

    const globaux = appliquerErreurFormulaire<Valeurs>(
      erreurApi(400, ["email must be an email", "quelque chose d'autre"]),
      setError,
      {
        messageGenerique: "Une erreur est survenue.",
        champsConnus: ["email", "password"],
      },
    );

    expect(setError).toHaveBeenCalledTimes(1);
    expect(setError).toHaveBeenCalledWith("email", {
      type: "server",
      message: "email must be an email",
    });
    expect(globaux).toEqual(["quelque chose d'autre"]);
  });

  it("n'appelle pas setError pour une erreur sans champ", () => {
    const setError = vi.fn();

    const globaux = appliquerErreurFormulaire<Valeurs>(
      erreurApi(500, "Internal server error"),
      setError,
      { messageGenerique: "Une erreur est survenue." },
    );

    expect(setError).not.toHaveBeenCalled();
    expect(globaux).toEqual(["Une erreur est survenue."]);
  });
});
