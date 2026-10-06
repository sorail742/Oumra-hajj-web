/**
 * En-têtes du navigateur relayés vers le backend — **liste blanche**.
 *
 * Recopier tous les en-têtes reçus (ancienne approche par liste noire)
 * faisait échouer `fetch` (undici) avant tout appel réseau dès qu'un
 * en-tête « hop-by-hop » arrivait (`keep-alive`, `upgrade`…) : le proxy
 * répondait 502 sans que le backend voie la requête. Le backend n'exploite
 * que le corps et `Authorization` (ajouté ci-dessous) ; le cookie, qui
 * porte les jetons, ne part jamais.
 */
export const ENTETES_RELAYES = [
  "accept",
  "accept-language",
  "content-type",
  "user-agent",
] as const;

export function enTetesRelayees(
  source: Headers,
  accessToken?: string,
): Headers {
  const entetes = new Headers();
  for (const cle of ENTETES_RELAYES) {
    const valeur = source.get(cle);
    if (valeur) {
      entetes.set(cle, valeur);
    }
  }
  if (accessToken) {
    entetes.set("Authorization", `Bearer ${accessToken}`);
  }
  return entetes;
}
