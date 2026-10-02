import { type NextRequest } from "next/server";
import { PREFIXE_API_BACKEND, urlBackend } from "@/lib/api/backend";

/**
 * Relais **public** du flux ICS d'une agence (ticket #42).
 *
 * Les clients calendrier (Google, Outlook, Apple) s'abonnent à une URL
 * absolue et n'envoient ni cookie ni en-tête `Authorization` : le jeton
 * opaque dans l'URL fait office d'autorisation (`CalendarController` côté
 * backend). Ce relais existe pour leur donner une URL sur l'origine de
 * l'application sans exposer `BACKEND_URL` au navigateur (ADR-0002).
 *
 * Volontairement distinct du proxy authentifié `api/[...chemin]`
 * (`docs/contrat-api.md`) : aucun cookie lu, aucun jeton de session
 * transmis, aucun renouvellement tenté. Segment statique `ics/` : prioritaire
 * sur le catch-all, et hors du `matcher` de `src/proxy.ts` (préfixe `api`),
 * donc jamais redirigé vers `/login`.
 */

/** `randomBytes(24).toString('hex')` côté backend (`AgenciesService`). */
const FORMAT_JETON = /^[0-9a-f]{48}$/;

export async function GET(
  _requete: NextRequest,
  contexte: { params: Promise<{ token: string }> },
): Promise<Response> {
  const { token } = await contexte.params;
  if (!FORMAT_JETON.test(token)) {
    return new Response(null, { status: 404 });
  }

  let reponse: Response;
  try {
    reponse = await fetch(
      `${urlBackend()}${PREFIXE_API_BACKEND}/calendar/agency/${token}/calendar.ics`,
      { cache: "no-store" },
    );
  } catch {
    return new Response(null, { status: 502 });
  }

  if (!reponse.ok) {
    // Jeton inconnu ou révoqué (regénéré) : 404, sans relayer le corps
    // d'erreur JSON du backend à un client calendrier.
    return new Response(null, { status: reponse.status === 404 ? 404 : 502 });
  }

  return new Response(await reponse.text(), {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      // Une URL d'abonnement est un secret : ne pas la laisser en cache
      // partagé, ni indexer.
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
