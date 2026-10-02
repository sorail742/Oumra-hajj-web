import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { MicroCoursesScreen } from "@/features/micro-courses/components/MicroCoursesScreen";

/** Public (voir `src/proxy.ts`) — micro-cours de préparation (ticket #82). */
export default async function MicroCoursesPage() {
  const t = await getTranslations("microCourses");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      {/* Catégorie lue dans l'URL (`useSearchParams`) : frontière Suspense requise. */}
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <MicroCoursesScreen />
      </Suspense>
    </div>
  );
}
