/**
 * Destinataire du code OTP : téléphone (SMS) ou adresse e-mail (EmailJS,
 * ADR 0025 du backend) — exactement l'un des deux, comme l'exige
 * `POST /auth/otp/request`.
 */
export type Destinataire = { phone: string } | { email: string };

export type Canal = "email" | "sms";

/**
 * Adresse normalisée (minuscules, sans espaces), ou `null` si invalide :
 * une seule arobase, une partie locale, un domaine avec un point intérieur.
 * Vérification sans expression régulière (pas de retour arrière possible) ;
 * le backend revalide avec `@IsEmail()`.
 */
export function normaliserEmail(saisie: string): string | null {
  const adresse = saisie.trim().toLowerCase();
  const parties = adresse.split("@");
  if (parties.length !== 2 || /\s/.test(adresse)) {
    return null;
  }
  const [locale = "", domaine = ""] = parties;
  const point = domaine.lastIndexOf(".");
  const valide = locale.length > 0 && point > 0 && point < domaine.length - 1;
  return valide ? adresse : null;
}

export function canalDe(destinataire: Destinataire): Canal {
  return "email" in destinataire ? "email" : "sms";
}
