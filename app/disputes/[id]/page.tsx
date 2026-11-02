import { DisputeDetailPage } from "@/features/disputes/DisputeDetailPage";

export default async function DisputeDetailRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DisputeDetailPage disputeId={safeDecode(id)} />;
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
