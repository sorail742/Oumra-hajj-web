import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { MyReviewsScreen } from "@/features/reviews/components/MyReviewsScreen";

export default async function ReviewsPage() {
  const t = await getTranslations("reviews");

  return (
    <div>
      <PageHeader
        title={t("myReviewsTitle")}
        description={t("myReviewsDescription")}
      />
      <MyReviewsScreen />
    </div>
  );
}
