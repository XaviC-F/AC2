import { Suspense } from "react";
import CommitmentPageContent from "@/components/CommitmentPage";

export default function CommitmentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CommitmentPageContent />
    </Suspense>
  );
}
