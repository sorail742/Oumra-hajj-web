import { getTranslations } from "next-intl/server";
import { Can } from "@/components/shared/Can";
import { PageHeader } from "@/components/shared/PageHeader";
import { AstreintePelerin, CreerCreneau, CreneauxAgence } from "./Astreinte";

/** Astreinte 24/7 (idée #63) : planning pour l'agence, qui appeler pour le pèlerin. */
export default async function OnCallPage() {
  const t = await getTranslations("onCall");

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          <Can role="agency">
            <CreerCreneau />
          </Can>
        }
      />
      <Can role="agency">
        <CreneauxAgence />
      </Can>
      <Can role="pilgrim">
        <AstreintePelerin />
      </Can>
    </div>
  );
}
