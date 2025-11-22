import { Suspense } from "react";
import CommitmentPage from "@/components/SubmittedCommitment";

export default function CommitmentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CommitmentPage />
    </Suspense>
  );
}
