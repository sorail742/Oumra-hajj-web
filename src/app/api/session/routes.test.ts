// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as agencyLogin } from "./agency-login/route";
import { POST as otpVerify } from "./otp-verify/route";

function requete(chemin: string, corps: unknown): NextRequest {
  return new NextRequest(`http://localhost/api/session/${chemin}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corps),
  });
}

function jetons(): Response {
  return new Response(
    JSON.stringify({ accessToken: "acc", refreshToken: "ref" }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

describe("routes de connexion", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubEnv("BACKEND_URL", "http://backend.test");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockImplementation(() => Promise.resolve(jetons()));
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  describe("otp-verify", () => {
    it("relaie phone, code et fullName vers auth/otp/verify", async () => {
      const reponse = await otpVerify(
        requete("otp-verify", {
          phone: "+224620000000",
          code: "123456",
          fullName: "Mamadou Diallo",
        }),
      );

      expect(reponse.status).toBe(200);
      const [url, init] = fetchMock.mock.calls[0] ?? [];
      expect(url).toBe("http://backend.test/api/v1/auth/otp/verify");
      expect(JSON.parse(String(init?.body))).toEqual({
        phone: "+224620000000",
        code: "123456",
        fullName: "Mamadou Diallo",
      });
      expect(reponse.cookies.get("oumra_access")?.httpOnly).toBe(true);
    });

    it("accepte l'absence de fullName (compte existant)", async () => {
      const reponse = await otpVerify(
        requete("otp-verify", { phone: "+224620000000", code: "123456" }),
      );

      expect(reponse.status).toBe(200);
      const [, init] = fetchMock.mock.calls[0] ?? [];
      expect(JSON.parse(String(init?.body))).toEqual({
        phone: "+224620000000",
        code: "123456",
      });
    });

    it("refuse un code manquant sans appeler le backend", async () => {
      const reponse = await otpVerify(
        requete("otp-verify", { phone: "+224620000000" }),
      );

      expect(reponse.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("agency-login", () => {
    it("relaie email et password vers auth/agency/login", async () => {
      const reponse = await agencyLogin(
        requete("agency-login", { email: "a@b.gn", password: "secret" }),
      );

      expect(reponse.status).toBe(200);
      const [url] = fetchMock.mock.calls[0] ?? [];
      expect(url).toBe("http://backend.test/api/v1/auth/agency/login");
      expect(reponse.cookies.get("oumra_refresh")?.httpOnly).toBe(true);
    });

    it("refuse un mot de passe manquant sans appeler le backend", async () => {
      const reponse = await agencyLogin(
        requete("agency-login", { email: "a@b.gn" }),
      );

      expect(reponse.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
