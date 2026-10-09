import { getTranslations } from "next-intl/server";
import { Can } from "@/components/shared/Can";
import { PageHeader } from "@/components/shared/PageHeader";
import { QuotesListScreen } from "@/features/quotes/components/QuotesListScreen";
import { NouveauDevis } from "./NouveauDevis";

/** Devis groupes et entreprises (idée #49). */
export default async function QuotesPage() {
  const t = await getTranslations("quotes");

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          <Can role="agency">
            <NouveauDevis />
          </Can>
        }
      />
      <Can role="agency">
        <QuotesListScreen />
      </Can>
    </div>
  );
}
