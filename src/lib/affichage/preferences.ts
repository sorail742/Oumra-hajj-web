/**
 * Préférences d'affichage (issue backend #32) : taille du texte et
 * contraste élevé. Public souvent âgé — l'accessibilité n'est pas une
 * option. Réglage propre à ce navigateur, posé en cookies non sensibles
 * pour que le serveur rende la page directement à la bonne taille, sans
 * saut visuel au chargement.
 */
export const TAILLES_TEXTE = ["normal", "large", "x-large"] as const;
export type TailleTexte = (typeof TAILLES_TEXTE)[number];

export const CONTRASTES = ["normal", "high"] as const;
export type Contraste = (typeof CONTRASTES)[number];

export interface PreferencesAffichage {
  texte: TailleTexte;
  contraste: Contraste;
}

export const COOKIE_TAILLE_TEXTE = "affichage-texte";
export const COOKIE_CONTRASTE = "affichage-contraste";

/** Un an : un réglage d'accessibilité ne doit pas se perdre en route. */
export const DUREE_PREFERENCES_S = 60 * 60 * 24 * 365;

export const PREFERENCES_PAR_DEFAUT: PreferencesAffichage = {
  texte: "normal",
  contraste: "normal",
};

function parmi<T extends string>(
  valeurs: readonly T[],
  valeur: string | undefined,
  defaut: T,
): T {
  return valeurs.find((v) => v === valeur) ?? defaut;
}

/** Valeurs de cookie → préférences ; toute valeur inconnue retombe sur le défaut. */
export function lirePreferences(
  texte: string | undefined,
  contraste: string | undefined,
): PreferencesAffichage {
  return {
    texte: parmi(TAILLES_TEXTE, texte, PREFERENCES_PAR_DEFAUT.texte),
    contraste: parmi(CONTRASTES, contraste, PREFERENCES_PAR_DEFAUT.contraste),
  };
}

/** Attributs posés sur `<html>`, lus par `globals.css` § Accessibilité. */
export function attributsAffichage(preferences: PreferencesAffichage) {
  return {
    "data-text-size": preferences.texte,
    "data-contrast": preferences.contraste,
  } as const;
}
