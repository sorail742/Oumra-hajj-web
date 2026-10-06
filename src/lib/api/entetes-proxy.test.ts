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

    expect([...relayees.keys()].sort((a, b) => a.localeCompare(b))).toEqual([
      "accept",
      "authorization",
      "content-type",
    ]);
    expect(relayees.get("authorization")).toBe("Bearer jeton-factice");
  });

  it("écarte les en-têtes hop-by-hop que fetch (undici) refuse", () => {
    const relayees = enTetesRelayees(
      new Headers({
        "keep-alive": "timeout=5",
        upgrade: "h2c",
        connection: "keep-alive",
        "transfer-encoding": "chunked",
      }),
    );

    expect([...relayees.keys()]).toEqual([]);
  });
});
