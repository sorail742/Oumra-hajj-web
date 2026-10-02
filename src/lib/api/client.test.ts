import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "./client";

describe("api client — multipart", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("envoie un FormData tel quel, sans Content-Type JSON forcé", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const formulaire = new FormData();
    formulaire.append("type", "passport");

    await api.post("/api/documents", formulaire);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.body).toBe(formulaire);
    expect(init.headers).not.toHaveProperty("Content-Type");
  });

  it("sérialise toujours un objet en JSON", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await api.post("/api/x", { a: 1 });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.body).toBe('{"a":1}');
    expect(init.headers).toHaveProperty("Content-Type", "application/json");
  });
});
