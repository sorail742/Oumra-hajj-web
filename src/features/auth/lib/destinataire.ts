/**
 * Destinataire du code OTP : téléphone (SMS) ou adresse e-mail (EmailJS,
 * ADR 0025 du backend) — exactement l'un des deux, comme l'exige
 * `POST /auth/otp/request`.
 */
export type Destinataire = { phone: string } | { email: string };

export type Canal = "email" | "sms";

const FORMAT_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Adresse normalisée (minuscules, sans espaces), ou `null` si invalide. */
export function normaliserEmail(saisie: string): string | null {
  const adresse = saisie.trim().toLowerCase();
  return FORMAT_EMAIL.test(adresse) ? adresse : null;
}

export function canalDe(destinataire: Destinataire): Canal {
  return "email" in destinataire ? "email" : "sms";
}
