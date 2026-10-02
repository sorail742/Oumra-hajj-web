import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { PackageForm } from "@/features/packages/components/PackageForm";

/** Création d'un forfait par l'agence (`POST /packages`, ticket #33). */
export default async function NewPackagePage() {
  const t = await getTranslations("packages.manage");
  return (
    <div className="space-y-6">
      <PageHeader title={t("createTitle")} />
      <PackageForm />
    </div>
  );
}
