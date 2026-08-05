import { lazy, Suspense } from "react";
import { ReportSkeleton } from "@/components/reports/ReportSkeleton";
const ReportsScreen = lazy(() => import("@/components/reports/ReportsScreen"));
export default function ReportsTab() {
  return (
    <Suspense fallback={<ReportSkeleton />}>
      <ReportsScreen />
    </Suspense>
  );
}
