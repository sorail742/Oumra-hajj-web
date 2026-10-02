/**
 * Normalisation d'un numéro saisi vers le format E.164 attendu par le
 * backend (`@IsPhoneNumber()`, sans région imposée — voir
 * `src/lib/format/index.ts`).
 *
 * Optimisée pour la Guinée : neuf chiffres seuls (« 620 00 00 00 ») sont
 * préfixés par `+224`. Un numéro international (`+…` ou `00…`) est conservé.
 * Renvoie `null` plutôt que de deviner : un numéro faux enverrait un code
 * SMS à quelqu'un d'autre.
 */
export function normaliserTelephone(saisie: string): string | null {
  const compact = saisie.trim().replaceAll(/[\s.()-]/g, "");
  const international = compact.startsWith("00")
    ? `+${compact.slice(2)}`
    : compact;

  if (/^\+\d{8,15}$/.test(international)) {
    return international;
  }
  if (/^224\d{9}$/.test(international)) {
    return `+${international}`;
  }
  if (/^\d{9}$/.test(international)) {
    return `+224${international}`;
  }
  return null;
}
