import { getTranslations } from "next-intl/server";
import { QuizHub } from "./QuizHub";
import { PageHeader } from "@/components/shared/PageHeader";

/** Quiz des rites — pèlerin, guide, administrateur (tickets #80, #81). */
export default async function QuizPage() {
  const t = await getTranslations("quiz");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <QuizHub />
    </div>
  );
}
