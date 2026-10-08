import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { AnnuaireAgences } from "./AnnuaireAgences";

/**
 * Annuaire public des agences validées (idée #71). Public : `/agencies`
 * est un préfixe de contenu public (`src/proxy.ts`).
 */
export default async function AgencyDirectoryPage() {
  const t = await getTranslations("directory");
  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <AnnuaireAgences />
    </div>
  );
}
