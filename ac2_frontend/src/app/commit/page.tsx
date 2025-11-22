import { Suspense } from "react";
import CommitmentPage from "@/components/CommitmentPage";

export default function CommitPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CommitmentPage />
    </Suspense>
  );
}
