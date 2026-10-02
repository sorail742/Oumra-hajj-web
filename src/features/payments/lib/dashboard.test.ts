import { describe, expect, it } from "vitest";
import type { Payment } from "../api/schemas";
import { paiementsEnAttente, paiementsRecents } from "./dashboard";

function paiement(
  id: string,
  status: Payment["status"],
  confirmedAt?: string,
): Payment {
  return {
    id,
    bookingId: "r",
    amount: 1000,
    currency: "GNF",
    installmentNumber: 1,
    method: "card",
    status,
    providerReference: `ref-${id}`,
    ...(confirmedAt ? { confirmedAt } : {}),
  };
}

describe("tableau de bord paiements", () => {
  it("compte les paiements en attente", () => {
    expect(
      paiementsEnAttente([
        paiement("1", "pending"),
        paiement("2", "succeeded", "2026-09-01"),
      ]),
    ).toHaveLength(1);
  });

  it("ordonne les paiements réussis du plus récent au plus ancien, et limite le nombre", () => {
    const recents = paiementsRecents(
      [
        paiement("a", "succeeded", "2026-09-01T00:00:00Z"),
        paiement("b", "succeeded", "2026-09-03T00:00:00Z"),
        paiement("c", "failed"),
        paiement("d", "succeeded", "2026-09-02T00:00:00Z"),
      ],
      2,
    );
    expect(recents.map((p) => p.id)).toEqual(["b", "d"]);
  });
});
