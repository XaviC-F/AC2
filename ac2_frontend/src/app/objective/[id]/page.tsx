'use client'

import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
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
  const [isLoading, setIsLoading] = useState(true);
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
        setIsLoading(true);
        const res = await fetch(`${API_URL}objective/${objectiveId}`,
          {method: "GET"});
        if (!res.ok) throw new Error(`Failed to load objective (${res.status})`);

        const data = await res.json();
        if (cancelled) return;

        setObjective(data);
      } catch (e) {
        alert((e instanceof Error ? e.message : String(e)) || "Failed to load objective");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadObjective();
    return () => { cancelled = true; };
  }, [objectiveId]);

  if (isLoading) {
    return (
      <div className="flex flex-col bg-[#0a0a0a] text-white min-h-screen">
        <header className="relative z-20">
          <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-6 sm:px-6 sm:pt-10 lg:px-16">
            <Link href="/" className="text-xl sm:text-2xl font-light uppercase tracking-[0.2em] text-white transition hover:text-white/80 no-underline">
              AC2
            </Link>
            <Link 
              href="/objective" 
              className="text-xs uppercase tracking-[0.2em] text-white/70 transition hover:text-white no-underline"
            >
              Browse Objectives
            </Link>
          </nav>
          <div className="mx-auto mt-4 sm:mt-8 w-full max-w-6xl border-t border-white/10"></div>
        </header>
        <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 pb-12 sm:px-6 sm:pb-20 lg:px-16">
          <div className="text-white/60">Loading objective...</div>
        </main>
      </div>
    );
  }

  if (!obj) {
    return notFound();
  }

  return (
    <div className="flex flex-col bg-[#0a0a0a] text-white min-h-screen">
      {/* Header */}
      <header className="relative z-20">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-6 sm:px-6 sm:pt-10 lg:px-16">
          <Link href="/" className="text-xl sm:text-2xl font-light uppercase tracking-[0.2em] text-white transition hover:text-white/80 no-underline">
            AC2
          </Link>
          <Link 
            href="/objective" 
            className="text-xs uppercase tracking-[0.2em] text-white/70 transition hover:text-white no-underline"
          >
            Browse Objectives
          </Link>
        </nav>
        <div className="mx-auto mt-4 sm:mt-8 w-full max-w-6xl border-t border-white/10"></div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pb-12 sm:px-6 sm:pb-20 lg:px-16">
        <div className="mt-12 sm:mt-20 md:mt-32">
          {/* Section Header */}
          <div className="mb-8 sm:mb-12">
            <div className="mb-4 sm:mb-6 inline-block">
              <div className="h-px w-12 sm:w-16 bg-white/40"></div>
            </div>
            <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-white">
              {obj.title}
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-white/70 lg:text-xl max-w-3xl">
              {obj.description}
            </p>
          </div>

          {/* Objective Details Card */}
          <div className="border border-white/20 bg-white/5 p-6 sm:p-8 lg:p-12 backdrop-blur-sm">
            {obj.published ? (
              <div className="space-y-6 sm:space-y-8">
                <div className="border-l-2 border-white/30 pl-4 sm:pl-6">
                  <div className="mb-2 text-xs uppercase tracking-[0.15em] text-white/60">Resolution Date</div>
                  <time 
                    dateTime={obj.resolutionDate}
                    className="text-lg sm:text-xl font-light text-white"
                  >
                    {new Date(obj.resolutionDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
                
                {obj.committers && obj.committers.length > 0 && (
                  <div>
                    <div className="mb-4 text-xs uppercase tracking-[0.15em] text-white/60">Committers</div>
                    <ul className="flex flex-wrap gap-2 sm:gap-3">
                      {obj.committers.map((person) => (
                        <li
                          key={person}
                          className="border border-white/20 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-light text-white/90 transition hover:bg-white/10"
                        >
                          {person}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-l-2 border-white/30 pl-4 sm:pl-6">
                <div className="mb-2 text-xs uppercase tracking-[0.15em] text-white/60">Status</div>
                <div className="text-lg sm:text-xl font-light text-white">
                  {formatTimeLeft(obj.resolutionDate)}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
