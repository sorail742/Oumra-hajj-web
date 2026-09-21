import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { LegalDocumentComplianceList } from "@/features/agencies/components/LegalDocumentComplianceList";

export default async function LegalDocumentsPage() {
  const t = await getTranslations("agencyCompliance");

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <LegalDocumentComplianceList />
    </div>
  );
}
