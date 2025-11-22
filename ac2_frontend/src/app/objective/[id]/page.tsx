'use client'

import { notFound, useParams } from 'next/navigation';
import { getObjectiveById } from '../data';
import { useEffect } from 'react';
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
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [commitNumber, setCommitNumber] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [objective, setObjective] = useState(null);
  const [isLoadingObjective, setIsLoadingObjective] = useState(true);
  const [objectiveError, setObjectiveError] = useState("");
  const [isPublished, setIsPublished] = useState(false);


  const { id } = useParams();
  let objectiveId = "";
  try {
    objectiveId = id as string;
  } catch (_) {
    objectiveId = "";
  }

  const obj = getObjectiveById(objectiveId);

  useEffect(() => {
    let cancelled = false;

    async function loadObjective() {
      try {
        setIsLoadingObjective(true);
        setObjectiveError("");

        const res = await fetch(`${API_URL}objective/${objectiveId}`,
          {method: "GET"});
        if (!res.ok) throw new Error(`Failed to load objective (${res.status})`);

        const data = await res.json();
        if (cancelled) return;

        setObjective(data);
        setIsPublished(data.published);
      } catch (e) {
        if (!cancelled) setObjectiveError(e.message || "Failed to load objective");
      } finally {
        if (!cancelled) setIsLoadingObjective(false);
      }
    }

    loadObjective();
    return () => { cancelled = true; };
  }, [objectiveId]);

  if (!obj) {
    return notFound();
  }
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
