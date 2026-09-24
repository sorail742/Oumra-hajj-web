import type { NextRequest } from "next/server";
import { z } from "zod";
import { relayerConnexion } from "@/lib/auth/session-relay";

/**
 * `POST /api/session/otp-verify` — connexion pèlerin / guide. Plus
 * spécifique que le proxy `[...chemin]`, donc prioritaire : c'est ici, et
 * pas dans le proxy, que la réponse du backend devient des cookies.
 *
 * Le code n'est jamais journalisé. `fullName` est facultatif : le backend
 * crée le compte pèlerin à la première vérification (« Pèlerin » par
 * défaut) et l'ignore pour un compte existant.
 */
const corpsSchema = z.object({
  phone: z.string().min(1),
  code: z.string().min(1),
  fullName: z.string().min(2).optional(),
});

export function POST(requete: NextRequest) {
  return relayerConnexion(requete, "auth/otp/verify", corpsSchema);
}
