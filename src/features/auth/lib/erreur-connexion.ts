import { ApiError, NetworkError } from "@/lib/api/types";

/**
 * Clé de traduction (`auth.*`) pour une erreur de connexion. Le backend
 * n'a pas de code d'erreur métier stable (`docs/contrat-api.md`) : seul le
 * statut HTTP est lu, jamais le texte du message.
 */
export function cleErreurConnexion(
  erreur: unknown,
  cleIdentifiants: string,
): string {
  if (erreur instanceof NetworkError) {
    return "common.networkError";
  }
  if (erreur instanceof ApiError) {
    if (erreur.statusCode === 401 || erreur.statusCode === 403) {
      return cleIdentifiants;
    }
    if (erreur.statusCode === 429) {
      return "otp.tooMany";
    }
    if (erreur.statusCode === 503) {
      return "otp.unavailable";
    }
  }
  return "common.genericError";
}
