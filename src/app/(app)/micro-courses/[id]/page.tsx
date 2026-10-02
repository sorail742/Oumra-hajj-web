import { MicroCourseDetailScreen } from "@/features/micro-courses/components/MicroCourseDetailScreen";

/** Public (voir `src/proxy.ts`) — lecture d'un micro-cours (ticket #82). */
export default async function MicroCoursePage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <MicroCourseDetailScreen id={id} />;
}
