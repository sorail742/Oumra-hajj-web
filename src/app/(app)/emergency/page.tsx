import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmergencyScreen } from "@/features/emergency/components/EmergencyScreen";

/**
 * Numéros d'urgence (idée #21) — consultable sans session : l'annuaire
 * est public (`/emergency` dans `PREFIXES_PUBLIC_CONTENU`), les contacts
 * personnels n'apparaissent qu'au pèlerin et au guide connectés.
 */
export default async function EmergencyPage() {
  const t = await getTranslations("emergency");
  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <EmergencyScreen />
    </div>
  );
}
