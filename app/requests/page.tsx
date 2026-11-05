import { Suspense } from "react";
import { RequestsManagementPage } from "@/features/requests/RequestsManagementPage";

export default function RequestsPage() {
  // Filters live in the URL, which requires a Suspense boundary for useSearchParams.
  return (
    <Suspense>
      <RequestsManagementPage />
    </Suspense>
  );
}
