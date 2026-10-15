import { ServiceRequestDetailPage } from "@/features/requests/ServiceRequestDetailPage";

export default async function ServiceRequestDetailRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ServiceRequestDetailPage requestId={safeDecode(id)} />;
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
