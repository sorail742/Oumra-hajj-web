import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError, NetworkError } from "./types";

/**
 * Point d'entrée unique pour afficher une erreur de soumission — voir
 * `docs/design-system.md` § Erreurs de soumission.
 *
 * Le backend n'a **aucun code métier stable** : cette fonction ne décide
 * jamais d'après le libellé d'un message (« existe déjà », « invalide »…),
 * qui casserait à la première reformulation. Elle s'appuie sur :
 *
 * 1. le statut HTTP, avec les messages propres à l'écran (`parStatut`) ;
 * 2. la structure de `message` : un tableau est une erreur de validation
 *    `class-validator`, dont chaque entrée commence par le **nom de la
 *    propriété** (`"email must be an email"`) — c'est cette convention de
 *    structure, pas le sens du texte, qui rattache l'entrée à un champ.
 *
 * Ordre de résolution :
 *
 * | Erreur                                     | Résultat                                   |
 * | ------------------------------------------ | ------------------------------------------ |
 * | statut présent dans `parStatut`            | ce message, en bandeau                     |
 * | tableau, champ reconnu                     | message rattaché au champ                  |
 * | tableau, champ non reconnu                 | message dans le bandeau                    |
 * | chaîne, 4xx                                | message du backend, en bandeau             |
 * | réseau (serveur n'a pas répondu)           | `messageReseau`, sinon `messageGenerique`  |
 * | 5xx, corps illisible, autre                | `messageGenerique`                         |
 */

export interface OptionsErreurFormulaire<Champ extends string> {
  /** Message de l'écran pour un 5xx, un corps illisible ou une erreur inattendue. */
  messageGenerique: string;
  /** Message de l'écran quand le serveur n'a pas répondu ; repli : `messageGenerique`. */
  messageReseau?: string;
  /** Noms des champs du formulaire — ceux qu'une entrée de validation peut désigner. */
  champsConnus?: readonly Champ[];
  /**
   * Messages propres à l'écran, par statut HTTP. Prioritaires sur tout le
   * reste : l'écran sait ce que signifie un `401` sur sa route (ex.
   * « Email ou mot de passe incorrect »), le backend ne le dit pas.
   */
  parStatut?: Readonly<Partial<Record<number, string>>>;
}

export interface ErreurFormulaire<Champ extends string> {
  /** Un message par champ reconnu (le premier reçu). */
  champs: Partial<Record<Champ, string>>;
  /** Messages à lister dans un bandeau au-dessus du formulaire. */
  globaux: string[];
}

/**
 * Nom de propriété que désigne une entrée `class-validator`, ou `undefined`.
 * Une propriété imbriquée (`"address.city must be…"`) est ramenée à sa
 * racine si le champ complet n'est pas connu.
 */
function champDesigne<Champ extends string>(
  entree: string,
  champsConnus: readonly Champ[],
): Champ | undefined {
  const [premierMot = ""] = entree.split(/\s+/, 1);
  const candidats = [premierMot, premierMot.split(/[.[]/, 1)[0] ?? ""];
  return champsConnus.find((champ) => candidats.includes(champ));
}

function erreurDeValidation<Champ extends string>(
  entrees: readonly string[],
  champsConnus: readonly Champ[],
): ErreurFormulaire<Champ> {
  const resultat: ErreurFormulaire<Champ> = { champs: {}, globaux: [] };
  for (const entree of entrees) {
    const champ = champDesigne(entree, champsConnus);
    if (champ === undefined) {
      resultat.globaux.push(entree);
    } else {
      resultat.champs[champ] ??= entree;
    }
  }
  return resultat;
}

export function interpreterErreurFormulaire<Champ extends string = string>(
  erreur: unknown,
  options: OptionsErreurFormulaire<Champ>,
): ErreurFormulaire<Champ> {
  const {
    messageGenerique,
    messageReseau,
    champsConnus = [],
    parStatut,
  } = options;
  const generique: ErreurFormulaire<Champ> = {
    champs: {},
    globaux: [messageGenerique],
  };

  if (erreur instanceof NetworkError) {
    return { champs: {}, globaux: [messageReseau ?? messageGenerique] };
  }
  if (!(erreur instanceof ApiError)) {
    return generique;
  }

  const messageEcran = parStatut?.[erreur.statusCode];
  if (messageEcran !== undefined) {
    return { champs: {}, globaux: [messageEcran] };
  }

  const estClient = erreur.statusCode >= 400 && erreur.statusCode < 500;
  if (!estClient) {
    return generique;
  }
  if (erreur.fieldErrors !== undefined) {
    return erreurDeValidation(erreur.fieldErrors, champsConnus);
  }
  return erreur.message.trim() === ""
    ? generique
    : { champs: {}, globaux: [erreur.message] };
}

/**
 * Variante react-hook-form : rattache chaque message de champ via
 * `setError` et **renvoie les messages du bandeau**, que l'écran affiche
 * (`useState<string[]>`) — `setError` n'a pas de notion d'erreur globale.
 *
 * ```ts
 * onError: (erreur) =>
 *   setGlobaux(appliquerErreurFormulaire(erreur, form.setError, { … })),
 * ```
 */
export function appliquerErreurFormulaire<Valeurs extends FieldValues>(
  erreur: unknown,
  setError: UseFormSetError<Valeurs>,
  options: OptionsErreurFormulaire<Path<Valeurs>>,
): string[] {
  const { champs, globaux } = interpreterErreurFormulaire(erreur, options);
  for (const champ of options.champsConnus ?? []) {
    const message = champs[champ];
    if (message !== undefined) {
      setError(champ, { type: "server", message });
    }
  }
  return globaux;
}
