import type { DossierStep } from "../api/schemas";

/** Ordre de traitement d'un dossier (cinq étapes fixes côté backend). */
export const ORDRE_ETAPES: readonly DossierStep["key"][] = [
  "payment",
  "visa",
  "flight",
  "vaccination",
  "documents",
];

/** Clé de traduction (`bookings.*`) du libellé de chaque étape. */
export const CLE_TRADUCTION_ETAPE: Record<DossierStep["key"], string> = {
  payment: "stepPayment",
  visa: "stepVisa",
  flight: "stepFlight",
  vaccination: "stepVaccination",
  documents: "stepDocuments",
};
