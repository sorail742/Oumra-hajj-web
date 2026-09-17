import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DocumentsListScreen } from "@/features/documents/components/DocumentsListScreen";

export default async function DocumentsPage() {
  const t = await getTranslations("documents");

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <DocumentsListScreen />
    </div>
  );
}
