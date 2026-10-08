import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { AgencyDirectoryScreen } from "@/features/directory/components/AgencyDirectoryScreen";
import { TrustScoreBadge } from "@/features/reviews/components/TrustScoreBadge";

/**
 * Annuaire public des agences validées (idée #71). Compose l'annuaire et
 * le badge de confiance du domaine avis (règle 2 : rôle d'une page).
 * Public : `/agencies` est un préfixe de contenu public (`src/proxy.ts`).
 */
export default async function AgencyDirectoryPage() {
  const t = await getTranslations("directory");
  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <AgencyDirectoryScreen
        badge={(agence) => <TrustScoreBadge badge={agence.trustScore.badge} />}
      />
    </div>
  );
}
