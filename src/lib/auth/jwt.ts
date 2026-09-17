import { roleSchema, type Role } from "./permissions";

/**
 * Décodage **non vérifié** du payload de l'access token — pour l'UI
 * seulement (`<Can>`, navigation, alignement des messages dans
 * `ConversationView`). Ne vérifie ni la signature ni l'expiration : ce
 * n'est pas son rôle. Le backend reste la seule source de vérité de
 * sécurité (voir `CLAUDE.md`, règle 12) — un champ mal décodé ici ne peut
 * jamais élargir un accès, seulement masquer un bouton ou mal aligner une
 * bulle de message qu'un appel API refuserait ou accepterait de toute
 * façon selon le vrai jeton.
 */

interface PayloadMinimal {
  sub?: unknown;
  role?: unknown;
}

export interface PayloadUtile {
  userId: string | undefined;
  role: Role | undefined;
}

function decoderSegmentBase64Url(segment: string): unknown {
  const normalise = segment.replace(/-/g, "+").replace(/_/g, "/");
  const texte = Buffer.from(normalise, "base64").toString("utf-8");
  return JSON.parse(texte);
}

/** `{ userId: undefined, role: undefined }` si le jeton est absent ou malformé. */
export function decoderPayloadUtile(
  accessToken: string | undefined,
): PayloadUtile {
  const vide: PayloadUtile = { userId: undefined, role: undefined };
  if (!accessToken) {
    return vide;
  }
  const segments = accessToken.split(".");
  if (segments.length !== 3 || !segments[1]) {
    return vide;
  }
  try {
    const payload = decoderSegmentBase64Url(segments[1]) as PayloadMinimal;
    const role = roleSchema.safeParse(payload.role);
    return {
      userId: typeof payload.sub === "string" ? payload.sub : undefined,
      role: role.success ? role.data : undefined,
    };
  } catch {
    return vide;
  }
}
