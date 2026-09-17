import { AgencyReviewsScreen } from "@/features/reviews/components/AgencyReviewsScreen";

/**
 * Public (voir `src/proxy.ts`) — score de confiance et avis d'une agence,
 * consultable avec ou sans session. Pas de `PageHeader` générique ici :
 * `AgencyReviewsScreen` porte déjà ses propres titres, et le nom de
 * l'agence n'est pas encore disponible (domaine `agencies` non construit).
 */
export default async function AgencyPublicPage({
  params,
}: {
  params: Promise<{ agencyId: string }>;
}) {
  const { agencyId } = await params;

  return <AgencyReviewsScreen agencyId={agencyId} />;
}
