import { getTranslations } from "next-intl/server";
import { Can } from "@/components/shared/Can";
import { PageHeader } from "@/components/shared/PageHeader";
import { SeasonsScreen } from "@/features/seasons/components/SeasonsScreen";

/** Comparatif inter-saisons (idée #65). */
export default async function SeasonsPage() {
  const t = await getTranslations("seasons");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <Can role="agency">
        <SeasonsScreen />
      </Can>
    </div>
  );
}
