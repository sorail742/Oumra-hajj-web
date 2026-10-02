import { ouvrirSession } from "@/lib/auth/ouvrir-session";

/**
 * Connexion pèlerin / guide, seconde étape (téléphone + code SMS) — voir
 * `ouvrirSession`. La première étape (`POST /auth/otp/request`) ne
 * renvoie aucun jeton : elle passe par le proxy générique.
 */
export function POST(requete: Request) {
  return ouvrirSession(requete, "auth/otp/verify", "/api/session/otp");
}
