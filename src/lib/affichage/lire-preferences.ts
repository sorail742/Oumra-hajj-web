import { cookies } from "next/headers";
import {
  COOKIE_CONTRASTE,
  COOKIE_TAILLE_TEXTE,
  lirePreferences,
  type PreferencesAffichage,
} from "./preferences";

/** Préférences d'affichage de la requête courante (contexte serveur). */
export async function lirePreferencesAffichage(): Promise<PreferencesAffichage> {
  const magasin = await cookies();
  return lirePreferences(
    magasin.get(COOKIE_TAILLE_TEXTE)?.value,
    magasin.get(COOKIE_CONTRASTE)?.value,
  );
}
