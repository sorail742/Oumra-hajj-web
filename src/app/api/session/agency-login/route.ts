import type { NextRequest } from "next/server";
import { z } from "zod";
import { relayerConnexion } from "@/lib/auth/session-relay";

/**
 * `POST /api/session/agency-login` — connexion agence / admin par email et
 * mot de passe. Le mot de passe n'est jamais journalisé ni renvoyé.
 */
const corpsSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

export function POST(requete: NextRequest) {
  return relayerConnexion(requete, "auth/agency/login", corpsSchema);
}
