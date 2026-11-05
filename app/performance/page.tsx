import { Suspense } from "react";
import { MechanicPerformancePage } from "@/features/performance/MechanicPerformancePage";

export default function PerformancePage() {
  // Period and mechanic filters live in the URL, which requires a Suspense boundary.
  return (
    <Suspense>
      <MechanicPerformancePage />
    </Suspense>
  );
}
