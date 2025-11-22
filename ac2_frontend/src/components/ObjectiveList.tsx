'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link';
import { PublishedObjective } from '@/components/PublishedObjectiveList';

const PAGE_SIZE = 5;

interface ObjectiveProps {
  title: string, pageItems: PublishedObjective[] | null, route: string
}

export default function ObjectiveList({ title, pageItems, route }: ObjectiveProps) {
  const searchParams = useSearchParams();
  if (!pageItems) {
    return (
      <div>No objectives have been published yet!</div>
    );
  }


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
    const currentlyDisplayedItems = pageItems.slice(start, end);
    const hasPrev = page > 1;
    const hasNext = end < pageItems.length;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {title}
        </h1>
        <ul className="space-y-4">
          {currentlyDisplayedItems.map((obj: PublishedObjective) => (
            <li key={obj.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <Link
                href={`/objective/${obj.id}`}
                className="text-xl font-semibold text-blue-600 dark:text-blue-300 hover:underline"
              >
                {obj.title}
              </Link>
              <p className="text-gray-700 dark:text-gray-300 mt-1">
                {obj.description}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-1">
                {obj.resolutionDate}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-1">
                {obj.commitedPeople}
              </p>
            </li>
          ))}
        </ul>
        <div className="flex justify-between mt-6">
          <Link
            href={`/${route}?page=${Math.max(page - 1, 1)}`}
            className={`px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded ${!hasPrev ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Previous
          </Link>
          <Link
            href={`/${route}?page=${page + 1}`}
            className={`px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded ${!hasNext ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}