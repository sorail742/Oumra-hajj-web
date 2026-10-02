import { ApiError } from "@/lib/api/types";

/**
 * Message d'échec de `POST /payments/initiate`, choisi **par statut HTTP
 * uniquement** — jamais d'après le texte du backend (ticket #39). Le 400
 * (validation `class-validator`) est d'abord rattaché aux champs par
 * `appliquerErreurFormulaire` ; cette clé ne sert qu'au bandeau.
 */
export type CleErreurInitiation =
  "errorInvalid" | "errorForbidden" | "errorNotFound" | "errorGeneric";

export function cleErreurInitiation(erreur: unknown): CleErreurInitiation {
  if (!(erreur instanceof ApiError)) return "errorGeneric";
  switch (erreur.statusCode) {
    case 400:
      return "errorInvalid";
    case 403:
      return "errorForbidden";
    case 404:
      return "errorNotFound";
    default:
      return "errorGeneric";
  }
}
