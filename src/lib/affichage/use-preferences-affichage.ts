"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  attributsAffichage,
  COOKIE_CONTRASTE,
  COOKIE_TAILLE_TEXTE,
  DUREE_PREFERENCES_S,
  lirePreferences,
  PREFERENCES_PAR_DEFAUT,
  type PreferencesAffichage,
} from "./preferences";

/**
 * Lecture et réglage des préférences d'affichage. La source de vérité est
 * l'attribut posé sur `<html>` par le layout (depuis les cookies) : le
 * réglage s'applique immédiatement au document, puis le cookie le retient
 * pour les prochains chargements.
 */
const abonnes = new Set<() => void>();

function abonner(rappel: () => void) {
  abonnes.add(rappel);
  return () => {
    abonnes.delete(rappel);
  };
}

let instantane: PreferencesAffichage = PREFERENCES_PAR_DEFAUT;

function lireDocument(): PreferencesAffichage {
  const racine = document.documentElement;
  const lues = lirePreferences(
    racine.dataset.textSize,
    racine.dataset.contrast,
  );
  // Même objet tant que rien ne change : `useSyncExternalStore` l'exige.
  if (
    lues.texte !== instantane.texte ||
    lues.contraste !== instantane.contraste
  ) {
    instantane = lues;
  }
  return instantane;
}

function poserCookie(nom: string, valeur: string) {
  // Préférence d'interface, non sensible : lisible côté client à dessein.
  document.cookie = `${nom}=${valeur}; path=/; max-age=${DUREE_PREFERENCES_S}; samesite=lax`;
}

export function usePreferencesAffichage() {
  const preferences = useSyncExternalStore(
    abonner,
    lireDocument,
    () => PREFERENCES_PAR_DEFAUT,
  );

  const modifier = useCallback((changement: Partial<PreferencesAffichage>) => {
    const suivantes = { ...lireDocument(), ...changement };
    const racine = document.documentElement;
    for (const [nom, valeur] of Object.entries(attributsAffichage(suivantes))) {
      racine.setAttribute(nom, valeur);
    }
    poserCookie(COOKIE_TAILLE_TEXTE, suivantes.texte);
    poserCookie(COOKIE_CONTRASTE, suivantes.contraste);
    for (const rappel of abonnes) rappel();
  }, []);

  return { preferences, modifier };
}
