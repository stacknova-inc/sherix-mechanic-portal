import { EmployeeDetailsPage } from "@/features/dashboard/pages/EmployeeDetailsPage";

export default async function EmployeeDetailsRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EmployeeDetailsPage employeeId={id} />;
}
