import { DisputeDetailScreen } from "@/features/disputes/components/DisputeDetailScreen";

export default async function DisputeDetailPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <DisputeDetailScreen id={id} />;
}
