import { EcranSuivi } from "@/features/groups/components/suivi/EcranSuivi";

/** Suivi des positions du groupe sur la carte (ADR-0007). */
export default async function GroupTrackingPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  return <EcranSuivi id={id} />;
}
