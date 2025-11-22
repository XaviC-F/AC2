import { Suspense } from 'react';

export default function ListObjectivesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>Coming soon...</div>
    </Suspense>
  );
}

