import type { Payment } from "../api/schemas";

export const MOYENS_PAIEMENT = [
  "mobile_money_orange",
  "mobile_money_mtn",
  "card",
] as const;

/** Clé de traduction (`payments.*`) du libellé de chaque moyen de paiement. */
export const CLE_TRADUCTION_METHODE: Record<Payment["method"], string> = {
  mobile_money_orange: "methodMobileMoneyOrange",
  mobile_money_mtn: "methodMobileMoneyMtn",
  card: "methodCard",
};
