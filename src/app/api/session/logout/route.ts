import { NextResponse } from "next/server";
import { prefixePour, urlBackend } from "@/lib/api/backend";
import { expirerJetonsSur, lireJetons } from "@/lib/auth/session";

/**
 * Déconnexion : révoque le refresh token côté backend
 * (`POST /auth/logout`, Bearer + refreshToken), puis efface les deux
 * cookies **quoi qu'il arrive** — un backend injoignable ne doit pas
 * laisser l'utilisateur connecté sur ce navigateur.
 */
export async function POST() {
  const { accessToken, refreshToken } = await lireJetons();

  if (accessToken && refreshToken) {
    await fetch(`${urlBackend()}${prefixePour("auth/logout")}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    }).catch(() => undefined);
  }

  const sortie = new NextResponse(null, { status: 204 });
  expirerJetonsSur(sortie);
  return sortie;
}
