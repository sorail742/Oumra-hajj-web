// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextResponse } from "next/server";

const { lireJetons, renouvelerJetons } = vi.hoisted(() => ({
  lireJetons: vi.fn(),
  renouvelerJetons: vi.fn(),
}));

vi.mock("@/lib/auth/session", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/session")>()),
  lireJetons,
  renouvelerJetons,
}));

import { POST } from "./route";

function cookieEfface(reponse: NextResponse, nom: string): boolean {
  const cookie = reponse.cookies.get(nom);
  return cookie?.value === "" && cookie.maxAge === 0;
}

function appels(fetchMock: ReturnType<typeof vi.fn<typeof fetch>>) {
  return fetchMock.mock.calls.map(([url, init]) => ({
    url: String(url),
    authorization: new Headers(init?.headers).get("Authorization"),
    corps: JSON.parse(String(init?.body)) as { refreshToken: string },
  }));
}

describe("POST /api/session/logout", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubEnv("BACKEND_URL", "http://backend.test");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
  });

  afterEach(() => {
    fetchMock.mockReset();
    lireJetons.mockReset();
    renouvelerJetons.mockReset();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("révoque le refresh token avec le Bearer puis efface les deux cookies", async () => {
    lireJetons.mockResolvedValue({ accessToken: "acc", refreshToken: "ref" });

    const reponse = await POST();

    expect(reponse.status).toBe(204);
    expect(appels(fetchMock)).toEqual([
      {
        url: "http://backend.test/api/v1/auth/logout",
        authorization: "Bearer acc",
        corps: { refreshToken: "ref" },
      },
    ]);
    expect(cookieEfface(reponse, "oumra_access")).toBe(true);
    expect(cookieEfface(reponse, "oumra_refresh")).toBe(true);
  });

  it("n'appelle pas le backend sans session mais efface quand même les cookies", async () => {
    lireJetons.mockResolvedValue({});

    const reponse = await POST();

    expect(reponse.status).toBe(204);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(cookieEfface(reponse, "oumra_access")).toBe(true);
    expect(cookieEfface(reponse, "oumra_refresh")).toBe(true);
  });

  it("renouvelle puis révoque le NOUVEAU refresh token quand l'access token a expiré", async () => {
    lireJetons.mockResolvedValue({ accessToken: "vieux", refreshToken: "ref" });
    renouvelerJetons.mockResolvedValue({
      accessToken: "acc2",
      refreshToken: "ref2",
    });
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const reponse = await POST();

    expect(renouvelerJetons).toHaveBeenCalledWith("ref");
    expect(appels(fetchMock)).toEqual([
      expect.objectContaining({
        authorization: "Bearer vieux",
        corps: { refreshToken: "ref" },
      }),
      expect.objectContaining({
        authorization: "Bearer acc2",
        corps: { refreshToken: "ref2" },
      }),
    ]);
    expect(reponse.status).toBe(204);
    expect(cookieEfface(reponse, "oumra_access")).toBe(true);
    expect(cookieEfface(reponse, "oumra_refresh")).toBe(true);
  });

  it("efface les cookies même si le renouvellement échoue", async () => {
    lireJetons.mockResolvedValue({ accessToken: "vieux", refreshToken: "ref" });
    renouvelerJetons.mockResolvedValue(null);
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    const reponse = await POST();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(reponse.status).toBe(204);
    expect(cookieEfface(reponse, "oumra_access")).toBe(true);
    expect(cookieEfface(reponse, "oumra_refresh")).toBe(true);
  });

  it("efface les cookies même si le backend est injoignable", async () => {
    lireJetons.mockResolvedValue({ accessToken: "acc", refreshToken: "ref" });
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    const reponse = await POST();

    expect(reponse.status).toBe(204);
    expect(cookieEfface(reponse, "oumra_access")).toBe(true);
    expect(cookieEfface(reponse, "oumra_refresh")).toBe(true);
  });
});
