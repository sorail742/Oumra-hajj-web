import type { PilgrimDocument } from "../api/schemas";

/** Clé de traduction (`documents.*`) du libellé de chaque type de document. */
export const CLE_TRADUCTION_TYPE: Record<PilgrimDocument["type"], string> = {
  passport: "typePassport",
  visa: "typeVisa",
  flight_ticket: "typeFlightTicket",
  vaccination_certificate: "typeVaccinationCertificate",
};
