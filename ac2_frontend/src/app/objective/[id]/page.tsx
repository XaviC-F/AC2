'use client'

import { notFound, useParams } from 'next/navigation';
import { Objective } from '../data';
import { useEffect, useState } from 'react';
import { API_URL } from '@/config/config';

function formatTimeLeft(resolutionDate: string): string {
  const now = new Date();
  const target = new Date(resolutionDate);
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return 'Resolved';
  const diffSec = Math.floor(diffMs / 1000);
  const days = Math.floor(diffSec / 86400);
  const hours = Math.floor((diffSec % 86400) / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m remaining`;
}

export default function ObjectivePage() {
  const [obj, setObjective] = useState<Objective | null>(null);

  const [loading, setLoading] = useState(true);


  const { id } = useParams();
  let objectiveId = "";
  try {
    objectiveId = id as string;
  } catch (_) {
    objectiveId = "";
  }
  console.log(objectiveId);

  useEffect(() => {
  let cancelled = false;
  async function loadObjective() {
    try {
      const res = await fetch(`${API_URL}objective/${objectiveId}`);
      if (cancelled) return;
      if (res.status === 404) {
        setObjective(null);
        return;
      }
      if (!res.ok) throw new Error(`Failed to load objective (${res.status})`);
      setObjective(await res.json());
    } finally {
      if (!cancelled) setLoading(false);
    }
  }
  loadObjective();
  return () => { cancelled = true; };
}, [objectiveId]);

if (loading) return <div>Loading…</div>;
if (obj === null) return notFound();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-xl w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {obj.title}
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{obj.description}</p>
        {obj.published ? (
          <>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Resolution Date:{' '}
              <time dateTime={obj.resolutionDate}>
                {new Date(obj.resolutionDate).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </p>
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Committers
              </h2>
              <ul className="flex flex-wrap gap-2">
                {obj.committers?.map((person) => (
                  <li
                    key={person}
                    className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full px-3 py-1 text-sm"
                  >
                    {person}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full px-3 py-1 text-sm font-semibold">
            {formatTimeLeft(obj.resolutionDate)}
          </div>
        )}
      </div>
    </div>
  );
}
