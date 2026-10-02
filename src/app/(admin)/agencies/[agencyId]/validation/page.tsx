import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { AgencyValidationScreen } from "@/features/agencies/components/AgencyValidationScreen";

/** Dossier de validation d'une agence — administrateur (ticket #31). */
export default async function AgencyValidationPage({
  params,
}: Readonly<{ params: Promise<{ agencyId: string }> }>) {
  const { agencyId } = await params;
  const t = await getTranslations("agencies.detail");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />
      <AgencyValidationScreen id={agencyId} />
    </div>
  );
}
