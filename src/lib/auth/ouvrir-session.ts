import { NextResponse } from "next/server";
import { z } from "zod";
import {
  prefixePour,
  reponseBackendInjoignable,
  urlBackend,
} from "@/lib/api/backend";
import { decoderPayloadUtile } from "./jwt";
import { poserJetonsSur } from "./session";

/**
 * Ouverture de session côté serveur — voir ADR-0002 de ce kit.
 *
 * Le navigateur n'appelle jamais `POST /auth/agency/login` ni
 * `POST /auth/otp/verify` à travers le proxy générique : la réponse
 * contiendrait les jetons, lisibles par du JavaScript client. Ces Route
 * Handlers dédiés appellent le backend, posent les deux cookies `httpOnly`
 * et ne renvoient au navigateur que le rôle (pour choisir la page
 * d'arrivée) — jamais un jeton.
 */

const jetonsSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export async function ouvrirSession(
  requete: Request,
  cheminBackend: "auth/agency/login" | "auth/otp/verify",
  cheminFront: string,
): Promise<NextResponse> {
  const corps: unknown = await requete.json().catch(() => null);
  if (corps === null || typeof corps !== "object" || Array.isArray(corps)) {
    return NextResponse.json(
      {
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: cheminFront,
        message: "Corps de requête JSON attendu.",
      },
      { status: 400 },
    );
  }

  let reponse: Response;
  try {
    reponse = await fetch(
      `${urlBackend()}${prefixePour(cheminBackend)}/${cheminBackend}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corps),
        cache: "no-store",
      },
    );
  } catch {
    return reponseBackendInjoignable(cheminFront);
  }

  const charge: unknown = await reponse.json().catch(() => null);

  // Échec métier (identifiants invalides, code expiré, validation) : relayé
  // tel quel, au format d'erreur NestJS que `interpreterReponse` connaît.
  if (!reponse.ok) {
    return NextResponse.json(charge, { status: reponse.status });
  }

  const jetons = jetonsSchema.safeParse(charge);
  if (!jetons.success) {
    return reponseBackendInjoignable(cheminFront);
  }

  const { role } = decoderPayloadUtile(jetons.data.accessToken);
  const relais = NextResponse.json({ role: role ?? null });
  poserJetonsSur(relais, jetons.data);
  return relais;
}
