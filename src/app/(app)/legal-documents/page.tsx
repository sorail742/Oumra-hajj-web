import { getTranslations } from "next-intl/server";
import { Can } from "@/components/shared/Can";
import { PageHeader } from "@/components/shared/PageHeader";
import { LegalDocumentComplianceList } from "@/features/agencies/components/LegalDocumentComplianceList";
import { LegalDocumentsLibrary } from "@/features/agencies/components/LegalDocumentsLibrary";
import { LegalDocumentUploader } from "@/features/agencies/components/LegalDocumentUploader";

/**
 * Conformité documentaire de l'agence : alertes d'échéance (#49), dépôt
 * et liste complète des documents légaux (#48).
 */
export default async function LegalDocumentsPage() {
  const t = await getTranslations("agencyCompliance");

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("description")} />
      <section aria-labelledby="alertes-echeance" className="space-y-3">
        <h2 id="alertes-echeance" className="text-lg font-semibold">
          {t("alertsTitle")}
        </h2>
        <LegalDocumentComplianceList />
      </section>
      <Can role="agency">
        <LegalDocumentUploader />
        <LegalDocumentsLibrary />
      </Can>
    </div>
  );
}
