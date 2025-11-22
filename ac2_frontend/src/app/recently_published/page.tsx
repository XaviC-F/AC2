'use client'

import { useSearchParams } from 'next/navigation'
import { objectives } from '../objective/data';
import ObjectiveList from '@/components/ObjectiveList';

const PAGE_SIZE = 5;

export default function RecentlyPublishedPage() {
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
  // TODO: Query the backend for the most recently published objectives
  const pageItems = objectives.slice(start, end);
  const hasPrev = page > 1;
  const hasNext = end < objectives.length;
  return ObjectiveList('Recently published objectives', pageItems, '/objective', page, hasPrev, hasNext);
}
