import { getTranslations } from "next-intl/server";
import { Can } from "@/components/shared/Can";
import { PageHeader } from "@/components/shared/PageHeader";
import { MyReviewsScreen } from "@/features/reviews/components/MyReviewsScreen";
import { SatisfactionReportScreen } from "@/features/reviews/components/SatisfactionReportScreen";

/** Pèlerin : ses avis ; agence : rapport de satisfaction (ticket #78). */
export default async function ReviewsPage() {
  const t = await getTranslations("reviews");

  return (
    <div className="space-y-6">
      <Can role="pilgrim">
        <PageHeader
          title={t("myReviewsTitle")}
          description={t("myReviewsDescription")}
        />
        <MyReviewsScreen />
      </Can>
      <Can role="agency">
        <PageHeader
          title={t("report.title")}
          description={t("report.description")}
        />
        <SatisfactionReportScreen />
      </Can>
    </div>
  );
}
