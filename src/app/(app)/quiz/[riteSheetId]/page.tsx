import { getTranslations } from "next-intl/server";
import { QuizFiche } from "./QuizFiche";
import { PageHeader } from "@/components/shared/PageHeader";

export default async function QuizFichePage({
  params,
}: Readonly<{ params: Promise<{ riteSheetId: string }> }>) {
  const { riteSheetId } = await params;
  const t = await getTranslations("quiz");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />
      <QuizFiche riteSheetId={riteSheetId} />
    </div>
  );
}
