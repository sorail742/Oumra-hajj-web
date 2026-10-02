import { describe, expect, it } from "vitest";
import { ApiError, NetworkError } from "@/lib/api/types";
import { cleErreurConnexion } from "./erreur-connexion";
import { destinationApresConnexion } from "./redirection";
import { normaliserTelephone } from "./telephone";

describe("normaliserTelephone", () => {
  it.each([
    ["620 00 00 00", "+224620000000"],
    ["620-00-00-00", "+224620000000"],
    ["224620000000", "+224620000000"],
    ["+224 620 00 00 00", "+224620000000"],
    ["00224620000000", "+224620000000"],
    ["+33 6 00 00 00 00", "+33600000000"],
  ])("%s → %s", (saisie, attendu) => {
    expect(normaliserTelephone(saisie)).toBe(attendu);
  });

  it.each(["", "12345", "abc", "+12", "62000000000000000"])(
    "refuse « %s » plutôt que de deviner",
    (saisie) => {
      expect(normaliserTelephone(saisie)).toBeNull();
    },
  );
});

describe("destinationApresConnexion", () => {
  it("accepte un chemin interne", () => {
    expect(destinationApresConnexion("/bookings?statut=paid")).toBe(
      "/bookings?statut=paid",
    );
  });

  it.each([
    undefined,
    "",
    "https://exemple.test",
    "//exemple.test",
    "/\\exemple.test",
  ])("renvoie au tableau de bord pour %s", (next) => {
    expect(destinationApresConnexion(next)).toBe("/dashboard");
  });
});

describe("cleErreurConnexion", () => {
  const erreur = (statusCode: number) =>
    new ApiError({ statusCode, timestamp: "", path: "", message: "x" });

  it("distingue identifiants, limitation, réseau et cas générique", () => {
    expect(cleErreurConnexion(erreur(401), "agency.invalid")).toBe(
      "agency.invalid",
    );
    expect(cleErreurConnexion(erreur(429), "agency.invalid")).toBe(
      "otp.tooMany",
    );
    expect(cleErreurConnexion(new NetworkError(), "agency.invalid")).toBe(
      "common.networkError",
    );
    expect(cleErreurConnexion(erreur(500), "agency.invalid")).toBe(
      "common.genericError",
    );
  });
});
