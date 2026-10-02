import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { EditPackageScreen } from "@/features/packages/components/EditPackageScreen";

/** Modification d'un forfait par l'agence (`PATCH /packages/:id`, ticket #33). */
export default async function EditPackagePage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const t = await getTranslations("packages.manage");
  return (
    <div className="space-y-6">
      <PageHeader title={t("editTitle")} />
      <EditPackageScreen id={id} />
    </div>
  );
}
