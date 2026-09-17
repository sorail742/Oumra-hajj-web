import { NextResponse, type NextRequest } from "next/server";
import { NOM_COOKIE_ACCES } from "@/lib/auth/cookie";

/**
 * Protège les routes sans JavaScript client : un utilisateur non
 * authentifié est redirigé **avant le rendu**.
 *
 * Ne vérifie que la **présence** du cookie d'accès, jamais sa validité — le
 * middleware n'a pas le secret de signature, et le backend reste seule
 * source de vérité. Un cookie présent mais expiré passe ici ; le proxy
 * tentera alors le renouvellement automatique (voir ADR-0002 de ce kit)
 * avant, seulement en cas d'échec, de rediriger vers `/login`.
 */

/**
 * Pages du **parcours d'authentification** — à adapter aux deux parcours
 * réels (`docs/socle-frontend.md` §5) : OTP pour pèlerin/guide, email + mot
 * de passe pour agence/admin. Un utilisateur déjà connecté qui atterrit ici
 * est renvoyé vers `/dashboard` : ça n'a de sens que pour ces pages-là, pas
 * pour du contenu public consultable qu'on est ou non connecté.
 */
const PREFIXES_AUTH = [
  "/login",
  "/otp",
  "/register-agency",
  "/forgot-password",
];

/**
 * Contenu **public** côté backend, consultable avec ou sans session — pas
 * seulement « accessible sans compte » comme `PREFIXES_AUTH`. `/packages`
 * (`GET /packages` → `listPublic`), `/agencies` (`GET /reviews/agency/:id`
 * et `.../trust-score` → `@Public()`) et `/rites` (`GET /rites/sheets` →
 * `@Public()`, voir `docs/contrat-api.md`) s'y trouvent parce que le
 * backend les sert sans jeton — un écart découvert en construisant l'écran
 * public de score de confiance agence : sans cette liste, ce middleware
 * imposait une redirection `/login` sur un contenu que le backend rend
 * librement. `/rites` mélange une partie publique (fiches) et une partie
 * authentifiée (ma progression, gérée par `useRole()` dans l'écran, pas
 * ici) — un visiteur anonyme y voit les fiches, pas sa progression.
 *
 * **À revoir dès qu'un écran de gestion authentifié (créer/éditer un
 * forfait, par ex.) atterrit sous l'un de ces préfixes** : la vérification
 * ci-dessous les couvrirait par erreur (`startsWith`, pas une
 * correspondance exacte de route) — scinder les préfixes à ce moment-là,
 * pas avant.
 */
const PREFIXES_PUBLIC_CONTENU = ["/packages", "/agencies", "/rites"];

function correspond(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefixe) => pathname === prefixe || pathname.startsWith(`${prefixe}/`),
  );
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const aSession = request.cookies.has(NOM_COOKIE_ACCES);
  const pageAuth = correspond(pathname, PREFIXES_AUTH);
  const contenuPublic =
    pathname === "/" ||
    pageAuth ||
    correspond(pathname, PREFIXES_PUBLIC_CONTENU);

  if (aSession && pageAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!aSession && !contenuPublic) {
    const destination = new URL("/login", request.url);
    destination.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(destination);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
