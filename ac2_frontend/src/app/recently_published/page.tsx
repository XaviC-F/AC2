import PublishedObjectiveList from "@/components/PublishedObjectiveList";
import { Suspense } from "react";

export default function RecentlyPublishedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PublishedObjectiveList />
    </Suspense>
  );
}
