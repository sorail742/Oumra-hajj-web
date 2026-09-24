import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  prefixePour,
  reponseBackendInjoignable,
  urlBackend,
} from "@/lib/api/backend";
import type { ErrorResponse } from "@/lib/api/types";
import { decoderPayloadUtile } from "./jwt";
import { poserJetonsSur } from "./session";

/**
 * Relais de connexion : appelle le backend, pose les deux cookies
 * `httpOnly` et **ne renvoie jamais un jeton au navigateur** (voir ADR-0002).
 * La réponse au client se limite à `{ role }` — de quoi rediriger, rien qui
 * permette à un XSS d'exfiltrer une session.
 *
 * Le proxy générique `src/app/api/[...chemin]/route.ts` relaie les réponses
 * telles quelles : sans ce relais, un `POST /auth/otp/verify` livrerait
 * `accessToken`/`refreshToken` au JavaScript de la page.
 */

const DELAI_MS = 30_000;

const jetonsSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

/** Erreur au format NestJS par défaut (`HttpExceptionFilter` du backend). */
function erreurNest(
  statusCode: number,
  chemin: string,
  message: string | string[],
  error: string,
): NextResponse {
  return NextResponse.json(
    {
      statusCode,
      timestamp: new Date().toISOString(),
      path: chemin,
      message,
      error,
    } satisfies ErrorResponse,
    { status: statusCode },
  );
}

/**
 * @param cheminBackend chemin relatif au préfixe de version, ex.
 *   `auth/otp/verify` — jamais un chemin fourni par le navigateur.
 * @param schemaCorps ce que le navigateur a le droit d'envoyer ; tout le
 *   reste est refusé avant d'atteindre le backend.
 */
export async function relayerConnexion(
  requete: NextRequest,
  cheminBackend: string,
  schemaCorps: z.ZodType<Record<string, unknown>>,
): Promise<NextResponse> {
  const chemin = requete.nextUrl.pathname;

  let brut: unknown;
  try {
    brut = await requete.json();
  } catch {
    return erreurNest(400, chemin, "Corps JSON invalide", "Bad Request");
  }

  const corps = schemaCorps.safeParse(brut);
  if (!corps.success) {
    return erreurNest(
      400,
      chemin,
      corps.error.issues.map((i) => `${i.path.join(".")} : ${i.message}`),
      "Bad Request",
    );
  }

  let reponse: Response;
  try {
    reponse = await fetch(
      `${urlBackend()}${prefixePour(cheminBackend)}/${cheminBackend}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corps.data),
        cache: "no-store",
        signal: AbortSignal.timeout(DELAI_MS),
      },
    );
  } catch {
    return reponseBackendInjoignable(chemin);
  }

  // Échec (401 identifiants, 400 validation…) : le corps NestJS est relayé
  // tel quel pour que `ApiError` côté client reste inchangé.
  if (!reponse.ok) {
    const corpsErreur = await reponse.arrayBuffer();
    return new NextResponse(corpsErreur, {
      status: reponse.status,
      headers: {
        "Content-Type":
          reponse.headers.get("Content-Type") ?? "application/json",
      },
    });
  }

  const jetons = jetonsSchema.safeParse(await reponse.json().catch(() => null));
  if (!jetons.success) {
    return erreurNest(
      502,
      chemin,
      "Réponse inattendue du service d'authentification.",
      "UnexpectedResponse",
    );
  }

  const { role } = decoderPayloadUtile(jetons.data.accessToken);
  const relais = NextResponse.json({ role: role ?? null });
  poserJetonsSur(relais, jetons.data);
  return relais;
}
