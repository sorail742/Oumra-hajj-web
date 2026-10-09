import { getTranslations } from "next-intl/server";
import { Can } from "@/components/shared/Can";
import { PageHeader } from "@/components/shared/PageHeader";
import { QuoteDetailScreen } from "@/features/quotes/components/QuoteDetailScreen";

/** Fiche d'un devis (idée #49). */
export default async function QuotePage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const t = await getTranslations("quotes");

  return (
    <div className="space-y-6">
      <PageHeader title={t("detailTitle")} />
      <Can role="agency">
        <QuoteDetailScreen id={id} />
      </Can>
    </div>
  );
}
