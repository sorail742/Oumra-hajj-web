import { describe, expect, it } from "vitest";
import { agencySchema } from "./schemas";

/**
 * Test de contrat : exemples conformes à `AgencyShape`
 * (`Oumra-hadj-project/src/types/agency.types.ts`) tels que sérialisés par
 * `toAgencyShape` — champs optionnels absents, jamais `null`. Données
 * factices explicites (CLAUDE.md backend).
 */
const agenceComplete = {
  id: "00000000-0000-4000-8000-000000000001",
  legalName: "Agence Factice SARL",
  ownerId: "00000000-0000-4000-8000-000000000002",
  contactEmail: "contact@agence-factice.test",
  contactPhone: "+224000000000",
  address: "Adresse factice",
  legalDocuments: [
    {
      id: "00000000-0000-4000-8000-000000000003",
      label: "Agrément (factice)",
      storageRef: "agencies/factice/agrement.pdf",
      uploadedAt: "2026-09-01T10:00:00.000Z",
      expiresAt: "2027-09-01T00:00:00.000Z",
    },
  ],
  validationStatus: "approved",
  validatedById: "00000000-0000-4000-8000-000000000004",
  validatedAt: "2026-09-02T10:00:00.000Z",
  commissionRate: 0.05,
  bankDetails: {
    accountName: "Titulaire factice",
    accountNumber: "0000000000",
    bankName: "Banque factice",
  },
};

describe("agencySchema", () => {
  it("accepte une réponse complète du backend", () => {
    const agence = agencySchema.parse(agenceComplete);
    expect(agence.validationStatus).toBe("approved");
    expect(agence.legalDocuments).toHaveLength(1);
  });

  it("accepte une agence en attente sans champs optionnels", () => {
    const agence = agencySchema.parse({
      id: agenceComplete.id,
      legalName: agenceComplete.legalName,
      ownerId: agenceComplete.ownerId,
      contactEmail: agenceComplete.contactEmail,
      contactPhone: agenceComplete.contactPhone,
      legalDocuments: [],
      validationStatus: "pending",
      commissionRate: 0.05,
    });
    expect(agence.bankDetails).toBeUndefined();
  });

  it("rejette l'ancien champ `status` à la place de `validationStatus`", () => {
    const { validationStatus: _ignore, ...sansStatut } = agenceComplete;
    expect(
      agencySchema.safeParse({ ...sansStatut, status: "approved" }).success,
    ).toBe(false);
  });
});
