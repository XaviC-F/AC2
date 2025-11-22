'use client'

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation'
import { objectives } from './data';
import ObjectiveList from '@/components/ObjectiveList';

const PAGE_SIZE = 5;

function ObjectivesContent() {
  const searchParams = useSearchParams()

  let page = 1;
  try {
    page = Number(searchParams.get('page') || "");
  } catch (_) {
    // ignore
  }
  if (page === 0) {
    page = 1;
  }
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = objectives.slice(start, end);
  const hasPrev = page > 1;
  const hasNext = end < objectives.length;
  return ObjectiveList('Objectives', pageItems, '/objective', page, hasPrev, hasNext);
}

export default function ListObjectivesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex items-center justify-center">Loading...</div>}>
      <ObjectivesContent />
    </Suspense>
  );
}

