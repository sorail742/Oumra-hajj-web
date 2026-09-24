// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { relayerConnexion } from "./session-relay";

const corpsSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

function jwtFactice(payload: Record<string, unknown>): string {
  const segment = (objet: unknown) =>
    Buffer.from(JSON.stringify(objet)).toString("base64url");
  return `${segment({ alg: "HS256" })}.${segment(payload)}.signature`;
}

const ACCES = jwtFactice({ sub: "user-1", role: "agency" });
const REFRESH = "refresh-secret-value";

function requete(corps: string): NextRequest {
  return new NextRequest("http://localhost/api/session/agency-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: corps,
  });
}

function reponseJson(corps: unknown, status = 200): Response {
  return new Response(JSON.stringify(corps), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("relayerConnexion", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubEnv("BACKEND_URL", "http://backend.test/");
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("pose deux cookies httpOnly et ne renvoie que le rôle", async () => {
    fetchMock.mockResolvedValue(
      reponseJson({ accessToken: ACCES, refreshToken: REFRESH }),
    );

    const reponse = await relayerConnexion(
      requete(JSON.stringify({ email: "a@b.gn", password: "secret" })),
      "auth/agency/login",
      corpsSchema,
    );

    expect(reponse.status).toBe(200);
    const texte = await reponse.text();
    expect(JSON.parse(texte)).toEqual({ role: "agency" });
    expect(texte).not.toContain(REFRESH);
    expect(texte).not.toContain(ACCES);

    const acces = reponse.cookies.get("oumra_access");
    const refresh = reponse.cookies.get("oumra_refresh");
    expect(acces).toMatchObject({
      value: ACCES,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });
    expect(refresh).toMatchObject({
      value: REFRESH,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  });

  it("appelle le backend sous /api/v1 avec le seul corps validé", async () => {
    fetchMock.mockResolvedValue(
      reponseJson({ accessToken: ACCES, refreshToken: REFRESH }),
    );

    await relayerConnexion(
      requete(
        JSON.stringify({ email: "a@b.gn", password: "secret", role: "admin" }),
      ),
      "auth/agency/login",
      corpsSchema,
    );

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("http://backend.test/api/v1/auth/agency/login");
    expect(init?.method).toBe("POST");
    // Un champ non prévu par le schéma (ici `role`) n'atteint jamais le backend.
    expect(JSON.parse(String(init?.body))).toEqual({
      email: "a@b.gn",
      password: "secret",
    });
  });

  it("relaie un 401 du backend sans poser de cookie", async () => {
    const erreur = {
      statusCode: 401,
      timestamp: "2026-01-01T00:00:00.000Z",
      path: "/api/v1/auth/agency/login",
      message: "Identifiants invalides",
    };
    fetchMock.mockResolvedValue(reponseJson(erreur, 401));

    const reponse = await relayerConnexion(
      requete(JSON.stringify({ email: "a@b.gn", password: "mauvais" })),
      "auth/agency/login",
      corpsSchema,
    );

    expect(reponse.status).toBe(401);
    expect(await reponse.json()).toEqual(erreur);
    expect(reponse.cookies.getAll()).toHaveLength(0);
  });

  it("répond 400 sans appeler le backend si le JSON est illisible", async () => {
    const reponse = await relayerConnexion(
      requete("{pas du json"),
      "auth/agency/login",
      corpsSchema,
    );

    expect(reponse.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(reponse.cookies.getAll()).toHaveLength(0);
  });

  it("répond 400 au format NestJS sans appeler le backend si le corps ne respecte pas le schéma", async () => {
    const reponse = await relayerConnexion(
      requete(JSON.stringify({ email: "a@b.gn" })),
      "auth/agency/login",
      corpsSchema,
    );

    expect(reponse.status).toBe(400);
    const corps = (await reponse.json()) as {
      statusCode: number;
      message: string[];
    };
    expect(corps.statusCode).toBe(400);
    expect(corps.message).toEqual([expect.stringContaining("password")]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("répond 502 si le backend est injoignable", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    const reponse = await relayerConnexion(
      requete(JSON.stringify({ email: "a@b.gn", password: "secret" })),
      "auth/agency/login",
      corpsSchema,
    );

    expect(reponse.status).toBe(502);
    expect(reponse.cookies.getAll()).toHaveLength(0);
  });

  it("répond 502 sans cookie si le backend renvoie autre chose que deux jetons", async () => {
    fetchMock.mockResolvedValue(reponseJson({ accessToken: ACCES }));

    const reponse = await relayerConnexion(
      requete(JSON.stringify({ email: "a@b.gn", password: "secret" })),
      "auth/agency/login",
      corpsSchema,
    );

    expect(reponse.status).toBe(502);
    expect(reponse.cookies.getAll()).toHaveLength(0);
  });

  it("renvoie un rôle nul quand le jeton porte un rôle inconnu", async () => {
    fetchMock.mockResolvedValue(
      reponseJson({
        accessToken: jwtFactice({ sub: "u", role: "superuser" }),
        refreshToken: REFRESH,
      }),
    );

    const reponse = await relayerConnexion(
      requete(JSON.stringify({ email: "a@b.gn", password: "secret" })),
      "auth/agency/login",
      corpsSchema,
    );

    expect(reponse.status).toBe(200);
    expect(await reponse.json()).toEqual({ role: null });
  });
});
