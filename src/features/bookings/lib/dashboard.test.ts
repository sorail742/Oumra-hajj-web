import { describe, expect, it } from "vitest";
import type { Booking } from "../api/schemas";
import { dossiersATraiter, prochaineEtape } from "./dashboard";

const DATE = "2026-09-01T00:00:00.000Z";
function reservation(
  statut: Booking["status"],
  fait: Booking["steps"][number]["key"][],
): Booking {
  return {
    id: `r-${statut}-${fait.length}`,
    pilgrimId: "p",
    packageId: "f",
    agencyId: "a",
    status: statut,
    steps: fait.map((key) => ({ key, status: "done", updatedAt: DATE })),
  };
}

describe("prochaineEtape", () => {
  it("renvoie la première étape non terminée dans l'ordre du dossier", () => {
    expect(prochaineEtape(reservation("confirmed", ["payment"]))).toBe("visa");
  });

  it("traite une étape absente comme à faire", () => {
    expect(prochaineEtape(reservation("pending_payment", []))).toBe("payment");
  });

  it("ne renvoie rien quand tout est terminé", () => {
    expect(
      prochaineEtape(
        reservation("confirmed", [
          "payment",
          "visa",
          "flight",
          "vaccination",
          "documents",
        ]),
      ),
    ).toBeUndefined();
  });
});

describe("dossiersATraiter", () => {
  it("écarte les réservations annulées, terminées ou sans étape restante", () => {
    const resultat = dossiersATraiter([
      reservation("confirmed", ["payment"]),
      reservation("cancelled", []),
      reservation("completed", []),
      reservation("confirmed", [
        "payment",
        "visa",
        "flight",
        "vaccination",
        "documents",
      ]),
    ]);
    expect(resultat).toHaveLength(1);
  });
});
