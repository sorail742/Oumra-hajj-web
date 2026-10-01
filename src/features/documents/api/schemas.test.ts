import { describe, expect, it } from "vitest";
import { documentSchema } from "./schemas";

/** Exemple conforme à `PilgrimDocumentShape` — données factices explicites. */
const documentPelerin = {
  id: "00000000-0000-4000-8000-000000000060",
  bookingId: "00000000-0000-4000-8000-000000000061",
  pilgrimId: "00000000-0000-4000-8000-000000000062",
  type: "passport",
  storageRef: "documents/factice/passeport.pdf",
  status: "rejected",
  rejectionReason: "Scan illisible (factice)",
  expiresAt: "2030-01-01T00:00:00.000Z",
};

describe("documentSchema", () => {
  it("accepte la forme réelle renvoyée par le backend", () => {
    const resultat = documentSchema.parse(documentPelerin);
    expect(resultat.expiresAt).toBe("2030-01-01T00:00:00.000Z");
    expect(resultat.rejectionReason).toBe("Scan illisible (factice)");
  });

  it("ne laisse passer ni storageRef ni pilgrimId dans la donnée parsée (règle 14)", () => {
    const resultat = documentSchema.parse(documentPelerin);
    expect(resultat).not.toHaveProperty("storageRef");
    expect(resultat).not.toHaveProperty("pilgrimId");
  });
});
