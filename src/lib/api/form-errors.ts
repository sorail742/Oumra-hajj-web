import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "./types";

/**
 * Point d'entrée unique des erreurs de soumission de formulaire — voir
 * `docs/design-system.md` § Erreurs de soumission (ticket #45).
 *
 * Le backend renvoie le format d'erreur NestJS par défaut, **sans code
 * métier stable** (`docs/contrat-api.md`). Ordre de résolution :
 *
 * | Ce que porte l'erreur                       | Ce qui s'affiche                              |
 * | ------------------------------------------- | --------------------------------------------- |
 * | `message` tableau (`class-validator`)       | entrée rattachée au champ si reconnu, sinon bandeau |
 * | `message` chaîne, statut 4xx                | message du backend, tel quel, en bandeau      |
 * | 5xx, réseau, corps illisible, autre erreur  | message générique fourni par l'écran          |
 *
 * **Aucune logique fondée sur le sens du message.** Le seul indice lu est
 * structurel : le `ValidationPipe` du backend (messages par défaut, aucun
 * `message:` personnalisé dans les DTO) préfixe chaque entrée par le chemin
 * de la propriété (`"bookingId must be a UUID"`,
 * `"bankDetails.accountName should not be empty"`). Une entrée n'est
 * rattachée à un champ que si son premier mot est **exactement** l'un des
 * champs déclarés par l'écran — sinon (`"property x should not exist"`,
 * chemin inconnu) elle va dans le bandeau, jamais perdue.
 */

export interface ErreurFormulaireResolue<Champ extends string> {
  /** Premier message par champ reconnu. */
  champs: Partial<Record<Champ, string>>;
  /** Messages non rattachables à un champ — à afficher en bandeau. */
  bandeau: string[];
}

function champDuMessage<Champ extends string>(
  message: string,
  champs: readonly Champ[],
): Champ | undefined {
  const premierMot = message.trimStart().split(/\s/, 1)[0] ?? "";
  return champs.find((champ) => champ === premierMot);
}

export function resoudreErreurFormulaire<Champ extends string>(
  erreur: unknown,
  champs: readonly Champ[],
  messageGenerique: string,
): ErreurFormulaireResolue<Champ> {
  const generique = { champs: {}, bandeau: [messageGenerique] };

  const est4xx =
    erreur instanceof ApiError &&
    erreur.statusCode >= 400 &&
    erreur.statusCode < 500;
  if (!est4xx) {
    return generique;
  }

  if (erreur.fieldErrors) {
    const resultat: ErreurFormulaireResolue<Champ> = {
      champs: {},
      bandeau: [],
    };
    for (const message of erreur.fieldErrors) {
      const champ = champDuMessage(message, champs);
      if (champ && resultat.champs[champ] === undefined) {
        resultat.champs[champ] = message;
      } else if (!champ) {
        resultat.bandeau.push(message);
      }
    }
    return resultat;
  }

  // `interpreterReponse` fabrique une ApiError sur corps illisible
  // (`error: "UnexpectedResponse"`, message = statusText) : ce n'est pas un
  // message du backend, donc pas à afficher tel quel.
  if (!erreur.message || erreur.estCorpsIllisible) {
    return generique;
  }
  return { champs: {}, bandeau: [erreur.message] };
}

/**
 * Variante branchée sur react-hook-form : pose les erreurs de champ via
 * `setError` (type `"server"`) et renvoie les messages de bandeau, à
 * afficher par l'écran (`FormErrorBanner`, ou équivalent).
 */
export function appliquerErreurFormulaire<Valeurs extends FieldValues>(
  erreur: unknown,
  setError: UseFormSetError<Valeurs>,
  champs: readonly Path<Valeurs>[],
  messageGenerique: string,
): string[] {
  const { champs: parChamp, bandeau } = resoudreErreurFormulaire(
    erreur,
    champs,
    messageGenerique,
  );
  for (const champ of champs) {
    const message = parChamp[champ];
    if (message !== undefined) {
      setError(champ, { type: "server", message });
    }
  }
  return bandeau;
}
