/**
 * Page d'arrivée après connexion. `next` vient de l'URL (posé par
 * `src/proxy.ts`) : seul un chemin **interne** est accepté — jamais
 * `//hote` ni `https://…`, qui feraient de la page de connexion une
 * redirection ouverte vers un site tiers.
 */
export const ARRIVEE_PAR_DEFAUT = "/dashboard";

export function destinationApresConnexion(next: string | undefined): string {
  if (!next?.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return ARRIVEE_PAR_DEFAUT;
  }
  return next;
}
