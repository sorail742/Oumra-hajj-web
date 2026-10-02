import { ouvrirSession } from "@/lib/auth/ouvrir-session";

/** Connexion agence / admin (email + mot de passe) — voir `ouvrirSession`. */
export function POST(requete: Request) {
  return ouvrirSession(requete, "auth/agency/login", "/api/session/agency");
}
