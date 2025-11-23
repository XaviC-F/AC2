import ObjectiveOverview from "@/components/ObjectiveOverview";
import { Suspense } from "react";

export default function ObjectivesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ObjectiveOverview />
    </Suspense>
  );
}
