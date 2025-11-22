import { Suspense } from "react";
import SubmittedCommitment from "@/components/SubmittedCommitment";

export default function CommitmentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubmittedCommitment />
    </Suspense>
  );
}
