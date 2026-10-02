import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import {
  appliquerErreurFormulaire,
  resoudreErreurFormulaire,
} from "./form-errors";
import { interpreterReponse } from "./response-interpreter";
import { ApiError, NetworkError } from "./types";

const GENERIQUE = "Message générique de l'écran";

function erreurApi(statusCode: number, message: string | string[]): ApiError {
  return new ApiError({
    statusCode,
    message,
    path: "/x",
    timestamp: "2026-10-01T00:00:00.000Z",
  });
}

describe("resoudreErreurFormulaire", () => {
  const champs = ["label", "expiresAt", "bankDetails.accountName"] as const;

  it("rattache chaque entrée class-validator au champ dont elle porte le chemin", () => {
    const resultat = resoudreErreurFormulaire(
      erreurApi(400, [
        "label must be longer than or equal to 2 characters",
        "expiresAt must be a valid ISO 8601 date string",
        "bankDetails.accountName should not be empty",
      ]),
      champs,
      GENERIQUE,
    );
    expect(resultat.champs).toEqual({
      label: "label must be longer than or equal to 2 characters",
      expiresAt: "expiresAt must be a valid ISO 8601 date string",
      "bankDetails.accountName": "bankDetails.accountName should not be empty",
    });
    expect(resultat.bandeau).toEqual([]);
  });

  it("ne garde que le premier message par champ", () => {
    const resultat = resoudreErreurFormulaire(
      erreurApi(400, [
        "label must be a string",
        "label must be longer than or equal to 2 characters",
      ]),
      champs,
      GENERIQUE,
    );
    expect(resultat.champs.label).toBe("label must be a string");
  });

  it("envoie en bandeau les entrées sans champ reconnu, sans en perdre aucune", () => {
    const resultat = resoudreErreurFormulaire(
      erreurApi(400, [
        "property foo should not exist",
        "labelle must be a string",
        "label must be a string",
      ]),
      champs,
      GENERIQUE,
    );
    expect(resultat.champs).toEqual({ label: "label must be a string" });
    expect(resultat.bandeau).toEqual([
      "property foo should not exist",
      "labelle must be a string",
    ]);
  });

  it("affiche tel quel le message chaîne d'un 4xx", () => {
    const resultat = resoudreErreurFormulaire(
      erreurApi(409, "Un compte existe déjà avec cet email"),
      champs,
      GENERIQUE,
    );
    expect(resultat).toEqual({
      champs: {},
      bandeau: ["Un compte existe déjà avec cet email"],
    });
  });

  it.each([
    ["un 5xx", erreurApi(500, "Erreur interne du serveur")],
    ["une erreur réseau", new NetworkError()],
    ["une erreur quelconque", new Error("boom")],
  ])("se replie sur le message générique pour %s", (_cas, erreur) => {
    expect(resoudreErreurFormulaire(erreur, champs, GENERIQUE)).toEqual({
      champs: {},
      bandeau: [GENERIQUE],
    });
  });

  it("n'affiche pas le statusText d'un corps illisible comme s'il venait du backend", () => {
    let erreur: unknown;
    try {
      interpreterReponse(
        413,
        "<html>trop gros</html>",
        "/api/documents",
        "Payload Too Large",
      );
    } catch (e) {
      erreur = e;
    }
    expect(resoudreErreurFormulaire(erreur, champs, GENERIQUE).bandeau).toEqual(
      [GENERIQUE],
    );
  });
});

describe("appliquerErreurFormulaire", () => {
  it("pose les erreurs de champ dans react-hook-form et renvoie le bandeau", () => {
    const { result } = renderHook(() =>
      useForm<{ label: string; expiresAt: string }>(),
    );

    let bandeau: string[] = [];
    act(() => {
      bandeau = appliquerErreurFormulaire(
        erreurApi(400, [
          "label must be a string",
          "property foo should not exist",
        ]),
        result.current.setError,
        ["label", "expiresAt"],
        GENERIQUE,
      );
    });

    expect(result.current.getFieldState("label").error).toMatchObject({
      type: "server",
      message: "label must be a string",
    });
    expect(result.current.getFieldState("expiresAt").error).toBeUndefined();
    expect(bandeau).toEqual(["property foo should not exist"]);
  });
});
