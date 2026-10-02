import { describe, expect, it } from "vitest";
import { bookingSchema } from "./schemas";

/** Exemple conforme à `BookingShape` — données factices explicites. */
const reservation = {
  id: "00000000-0000-4000-8000-000000000040",
  pilgrimId: "00000000-0000-4000-8000-000000000041",
  packageId: "00000000-0000-4000-8000-000000000042",
  agencyId: "00000000-0000-4000-8000-000000000043",
  status: "confirmed",
  steps: [
    { key: "payment", status: "done", updatedAt: "2026-09-01T10:00:00.000Z" },
    {
      key: "visa",
      status: "in_progress",
      updatedAt: "2026-09-10T10:00:00.000Z",
    },
  ],
};

describe("bookingSchema", () => {
  it("accepte une réservation sans groupe (groupId absent du JSON)", () => {
    expect(bookingSchema.parse(reservation).groupId).toBeUndefined();
  });

  it("lit le groupe quand la réservation y est rattachée", () => {
    const resultat = bookingSchema.parse({
      ...reservation,
      groupId: "00000000-0000-4000-8000-000000000044",
    });
    expect(resultat.groupId).toBe("00000000-0000-4000-8000-000000000044");
  });

  it("rejette une étape sans updatedAt (ancienne hypothèse completedAt)", () => {
    expect(
      bookingSchema.safeParse({
        ...reservation,
        steps: [{ key: "payment", status: "done", completedAt: "2026-09-01" }],
      }).success,
    ).toBe(false);
  });
});
