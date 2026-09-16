import { roleSchema, type Role } from "./permissions";

/**
 * Décodage **non vérifié** du rôle porté par l'access token — pour l'UI
 * seulement (`<Can>`, navigation). Ne vérifie ni la signature ni
 * l'expiration : ce n'est pas son rôle. Le backend reste la seule source de
 * vérité de sécurité (voir `CLAUDE.md`, règle 12) — un rôle mal décodé ici
 * ne peut jamais élargir un accès, seulement masquer ou montrer un bouton
 * qu'un appel API refuserait de toute façon si le jeton était invalide.
 */

interface PayloadMinimal {
  role?: unknown;
}

function decoderSegmentBase64Url(segment: string): unknown {
  const normalise = segment.replace(/-/g, "+").replace(/_/g, "/");
  const texte = Buffer.from(normalise, "base64").toString("utf-8");
  return JSON.parse(texte);
}

/** Extrait `role` du payload d'un JWT — `undefined` si le jeton est absent, malformé, ou porte un rôle inconnu. */
export function decoderRole(accessToken: string | undefined): Role | undefined {
  if (!accessToken) {
    return undefined;
  }
  const segments = accessToken.split(".");
  if (segments.length !== 3 || !segments[1]) {
    return undefined;
  }
  try {
    const payload = decoderSegmentBase64Url(segments[1]) as PayloadMinimal;
    const resultat = roleSchema.safeParse(payload.role);
    return resultat.success ? resultat.data : undefined;
  } catch {
    return undefined;
  }
}
