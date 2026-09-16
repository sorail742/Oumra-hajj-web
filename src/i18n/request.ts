import { getRequestConfig } from "next-intl/server";

/**
 * Une seule locale (`fr`) à ce jour — voir `docs/socle-frontend.md` §2.
 * Pas de segment `[locale]`, pas de détection de langue : à revoir si une
 * deuxième langue devient nécessaire.
 */
const LOCALE = "fr" as const;

export default getRequestConfig(async () => {
  return {
    locale: LOCALE,
    messages: (await import(`../messages/${LOCALE}.json`)).default,
  };
});
