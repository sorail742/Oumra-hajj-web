import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ouvrirSession } from "./ouvrir-session";

/** Jeton factice (payload `{"sub":"u-1","role":"agency"}`), non signé. */
function jetonFactice(role: string): string {
  const payload = Buffer.from(JSON.stringify({ sub: "u-1", role })).toString(
    "base64url",
  );
  return `entete.${payload}.signature`;
}

function requeteJson(corps: unknown): Request {
  return new Request("http://front.test/api/session/agency", {
    method: "POST",
    body: JSON.stringify(corps),
  });
}

describe("ouvrirSession", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv("BACKEND_URL", "http://backend.test");
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("pose les deux cookies httpOnly et ne renvoie que le rôle", async () => {
    const accessToken = jetonFactice("agency");
    fetchMock.mockResolvedValue(
      Response.json({ accessToken, refreshToken: "refresh-factice" }),
    );

    const reponse = await ouvrirSession(
      requeteJson({ email: "agence@exemple.test", password: "factice-123" }),
      "auth/agency/login",
      "/api/session/agency",
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://backend.test/api/v1/auth/agency/login",
      expect.objectContaining({ method: "POST" }),
    );
    expect(reponse.status).toBe(200);
    const corps = (await reponse.json()) as Record<string, unknown>;
    expect(corps).toEqual({ role: "agency" });
    expect(JSON.stringify(corps)).not.toContain("refresh-factice");

    const cookies = reponse.headers.getSetCookie().join("\n");
    expect(cookies).toContain("oumra_access=");
    expect(cookies).toContain("oumra_refresh=refresh-factice");
    expect(cookies.toLowerCase()).toContain("httponly");
  });

  it("relaie l'erreur du backend sans poser de cookie", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        { statusCode: 401, message: "Identifiants invalides" },
        { status: 401 },
      ),
    );

    const reponse = await ouvrirSession(
      requeteJson({ email: "agence@exemple.test", password: "mauvais-123" }),
      "auth/agency/login",
      "/api/session/agency",
    );

    expect(reponse.status).toBe(401);
    expect(reponse.headers.getSetCookie()).toHaveLength(0);
  });

  it("refuse un corps non JSON sans appeler le backend", async () => {
    const reponse = await ouvrirSession(
      new Request("http://front.test/api/session/otp", {
        method: "POST",
        body: "pas du json",
      }),
      "auth/otp/verify",
      "/api/session/otp",
    );

    expect(reponse.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("répond 502 si le backend est injoignable", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    const reponse = await ouvrirSession(
      requeteJson({ phone: "+224000000000", code: "000000" }),
      "auth/otp/verify",
      "/api/session/otp",
    );

    expect(reponse.status).toBe(502);
  });
});
