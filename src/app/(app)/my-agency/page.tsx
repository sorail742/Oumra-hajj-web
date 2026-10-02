import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { MyAgencyScreen } from "@/features/agencies/components/MyAgencyScreen";

/** Profil de l'agence connectée (ticket #47). */
export default async function MyAgencyPage() {
  const t = await getTranslations("myAgency");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <MyAgencyScreen />
    </div>
  );
}
