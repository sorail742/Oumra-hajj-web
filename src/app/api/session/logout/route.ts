import { NextResponse } from "next/server";
import { prefixePour, urlBackend } from "@/lib/api/backend";
import {
  expirerJetonsSur,
  lireJetons,
  renouvelerJetons,
} from "@/lib/auth/session";

/**
 * `POST /api/session/logout` — révoque le refresh token côté backend puis
 * efface les deux cookies. **Les cookies sont effacés quoi qu'il arrive** :
 * un backend injoignable ne doit jamais laisser l'utilisateur connecté.
 *
 * `POST /auth/logout` exige un access token valide : s'il a expiré, on
 * renouvelle d'abord (rotation : le nouveau refresh token remplace
 * l'ancien, c'est lui qu'il faut révoquer), sinon la révocation échouerait
 * en silence et le refresh token resterait utilisable jusqu'à son expiration.
 */
const DELAI_MS = 10_000;

function appelerLogout(
  accessToken: string,
  refreshToken: string,
): Promise<Response> {
  const chemin = "auth/logout";
  return fetch(`${urlBackend()}${prefixePour(chemin)}/${chemin}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
    signal: AbortSignal.timeout(DELAI_MS),
  });
}

async function revoquerSession(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  const reponse = await appelerLogout(accessToken, refreshToken);
  if (reponse.status !== 401) {
    return;
  }
  const nouveaux = await renouvelerJetons(refreshToken);
  if (nouveaux) {
    await appelerLogout(nouveaux.accessToken, nouveaux.refreshToken);
  }
}

export async function POST() {
  const { accessToken, refreshToken } = await lireJetons();

  if (accessToken && refreshToken) {
    try {
      await revoquerSession(accessToken, refreshToken);
    } catch {
      // Révocation au mieux : les cookies sont effacés ci-dessous.
    }
  }

  const reponse = new NextResponse(null, { status: 204 });
  expirerJetonsSur(reponse);
  return reponse;
}
