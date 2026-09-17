import { describe, expect, it } from "vitest";
import { tauxRemboursement } from "./refund-policy";

/**
 * Miroir de `PaymentsService.REFUND_POLICY` — un test qui casse ici doit
 * faire réfléchir avant de "corriger" le test : c'est peut-être le backend
 * qui a changé, pas cette fonction qui a un bug.
 */
describe("tauxRemboursement", () => {
  it("100 % avant confirmation — rien n'est encore engagé côté agence", () => {
    expect(tauxRemboursement("pending_payment")).toBe(1);
  });

  it("50 % une fois confirmée — visa/hôtel déjà engagés par l'agence", () => {
    expect(tauxRemboursement("confirmed")).toBe(0.5);
  });

  it("0 % si annulée", () => {
    expect(tauxRemboursement("cancelled")).toBe(0);
  });

  it("0 % si le voyage est déjà effectué", () => {
    expect(tauxRemboursement("completed")).toBe(0);
  });
});
