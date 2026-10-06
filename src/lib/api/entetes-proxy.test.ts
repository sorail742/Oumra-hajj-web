import { describe, expect, it } from "vitest";
import { enTetesRelayees } from "./entetes-proxy";

describe("enTetesRelayees", () => {
  it("ne relaie que la liste blanche, plus le Bearer", () => {
    const source = new Headers({
      "content-type": "application/json",
      accept: "application/json",
      cookie: "access=jeton-factice",
      "keep-alive": "timeout=5",
      upgrade: "h2c",
      host: "exemple.invalid",
    });

    const relayees = enTetesRelayees(source, "jeton-factice");

    expect([...relayees.keys()].sort()).toEqual([
      "accept",
      "authorization",
      "content-type",
    ]);
    expect(relayees.get("authorization")).toBe("Bearer jeton-factice");
  });

  it("produit des en-têtes que fetch accepte malgré les hop-by-hop reçus", async () => {
    const relayees = enTetesRelayees(
      new Headers({ "keep-alive": "timeout=5", upgrade: "h2c" }),
    );
    // Une URL injoignable suffit : l'échec attendu est réseau, pas un rejet
    // des en-têtes par undici (« invalid keep-alive header »).
    const erreur = await fetch("http://127.0.0.1:9/", {
      headers: relayees,
    }).catch((e: unknown) => e);
    expect(String((erreur as Error).cause)).not.toMatch(/header/i);
  });
});
