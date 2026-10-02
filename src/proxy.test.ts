import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { NOM_COOKIE_ACCES } from "@/lib/auth/cookie";
import { proxy } from "./proxy";

function requete(chemin: string, connecte = false): NextRequest {
  const req = new NextRequest(new URL(chemin, "http://localhost"));
  if (connecte) {
    req.cookies.set(NOM_COOKIE_ACCES, "jeton-factice");
  }
  return req;
}

function redirection(chemin: string, connecte = false): string | null {
  return proxy(requete(chemin, connecte)).headers.get("location");
}

describe("proxy — écrans de gestion sous /agencies (ticket #31)", () => {
  it("laisse le profil public d'une agence ouvert sans session", () => {
    expect(redirection("/agencies/agence-1")).toBeNull();
  });

  it("exige une session pour la liste et le dossier de validation", () => {
    expect(redirection("/agencies")).toContain("/login?next=%2Fagencies");
    expect(redirection("/agencies/agence-1/validation")).toContain(
      "/login?next=%2Fagencies%2Fagence-1%2Fvalidation",
    );
  });

  it("laisse passer un utilisateur connecté", () => {
    expect(redirection("/agencies/agence-1/validation", true)).toBeNull();
  });
});
