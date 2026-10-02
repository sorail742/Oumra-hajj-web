/**
 * Résolution, côté navigateur, des URL que le backend renvoie dans ses
 * réponses JSON (URL d'accès signées aux documents, abonnement calendrier).
 *
 * Le backend renvoie soit un **chemin relatif à sa propre origine**
 * (`/api/v1/documents/files/<jeton>` avec le stockage local de
 * développement — voir `storage-provider.interface.ts` côté backend), soit
 * une **URL absolue** (stockage cloud signé, à terme). Un chemin relatif
 * assigné tel quel à `location.href` se résout contre l'origine de Next et
 * atteint `/api/v1/v1/...` via le proxy → 404 (ticket #41).
 *
 * Fichier sans dépendance serveur : importable depuis un composant client,
 * contrairement à `backend.ts`.
 */

/** Préfixe de version du backend — même valeur que `PREFIXE_API_BACKEND`. */
const PREFIXE_VERSION_BACKEND = "/api/v1/";

/**
 * Réécrit une URL renvoyée par le backend en URL utilisable par le
 * navigateur :
 * - chemin relatif `/api/v1/...` → `/api/...`, servi par le proxy
 *   `src/app/api/[...chemin]` qui rajoute lui-même le préfixe de version ;
 * - URL absolue `http(s)://` → inchangée ;
 * - toute autre forme (`javascript:`, `//hote`, chemin inconnu) → `null` :
 *   une URL qu'on ne sait pas interpréter n'est jamais ouverte.
 */
export function urlNavigateurDepuisBackend(url: string): string | null {
  if (url.startsWith(PREFIXE_VERSION_BACKEND)) {
    return `/api/${url.slice(PREFIXE_VERSION_BACKEND.length)}`;
  }
  try {
    const absolue = new URL(url);
    if (absolue.protocol === "https:" || absolue.protocol === "http:") {
      return absolue.toString();
    }
  } catch {
    // Ni relative connue, ni absolue valide.
  }
  return null;
}

/**
 * Ouvre un onglet **vierge** de façon synchrone (dans le gestionnaire de
 * clic — un `window.open` après un `await` est bloqué par les bloqueurs de
 * popup), puis le navigue vers l'URL obtenue ensuite.
 *
 * Pas de `noopener` dans les options de `window.open` : avec lui, la
 * spécification impose de renvoyer `null`, et l'onglet ne pourrait jamais
 * être navigué. `opener` est coupé à la main à la place.
 *
 * L'URL n'est ni retournée ni conservée (CLAUDE.md règle 14).
 */
export async function ouvrirDansNouvelOnglet(
  obtenirUrl: () => Promise<string>,
): Promise<void> {
  const fenetre = window.open("", "_blank");
  if (fenetre) {
    fenetre.opener = null;
  }
  try {
    const url = urlNavigateurDepuisBackend(await obtenirUrl());
    if (!url) {
      throw new Error("URL d'accès renvoyée par le backend non reconnue.");
    }
    if (fenetre) {
      fenetre.location.href = url;
    }
  } catch (erreur) {
    fenetre?.close();
    throw erreur;
  }
}
