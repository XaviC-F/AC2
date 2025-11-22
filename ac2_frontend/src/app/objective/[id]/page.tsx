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
  const [copySuccess, setCopySuccess] = useState(false);
  const { id } = useParams();
  let objectiveId = "";
  try {
    objectiveId = id as string;
  } catch (_) {
    objectiveId = "";
  }
  console.log(objectiveId);

  const commitLink = `http://localhost:3000/commit?objective_id=${objectiveId}`;
  const shareMessage = `Check out "${obj?.title ?? "this AC2 objective"}" on AC2`;
  const fullShareText = `${shareMessage}: ${commitLink}`;
  const shareText = encodeURIComponent(fullShareText);
  const shareQuote = encodeURIComponent(shareMessage);
  const shareUrl = encodeURIComponent(commitLink);

  async function handleCopyCommitLink() {
    try {
      await navigator.clipboard.writeText(commitLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1600);
    } catch (e) {
      alert((e instanceof Error ? e.message : String(e)) || "Failed to copy link");
    }
  }

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

            <div className="mt-8 sm:mt-10 border border-white/15 bg-black/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-[0.15em] text-white/60">Commit Link</div>
                <div className="text-sm sm:text-base font-light text-white break-all">{commitLink}</div>
              </div>
              <button
                type="button"
                onClick={handleCopyCommitLink}
                className="self-start sm:self-auto rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                {copySuccess ? 'Copied!' : 'Copy link'}
              </button>
            </div>

            <div className="mt-6 sm:mt-8 space-y-3">
              <div className="text-xs uppercase tracking-[0.15em] text-white/60">Share</div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://x.com/intent/post?text=${shareText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <span aria-hidden className="text-[#1DA1F2]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.2 4h2.8l-6.1 6.9L21 20h-5.6l-4.4-5.7L6 20H3.2l6.5-7.4L3 4h5.7l4 5.3L17.2 4Z" />
                    </svg>
                  </span>
                  Share on X
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareQuote}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <span aria-hidden className="text-[#1877F2]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 8h2.5V4H14c-3 0-5 2-5 5v2H6v4h3v5h4v-5h3l1-4h-4V9.5c0-.9.3-1.5 1-1.5Z" />
                    </svg>
                  </span>
                  Share on Facebook
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <span aria-hidden className="text-[#0A66C2]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2ZM8.34 18.34H5.66V9.4h2.68v8.94ZM7 8.2a1.55 1.55 0 1 1 0-3.1 1.55 1.55 0 0 1 0 3.1Zm11.34 10.14h-2.68v-4.6c0-1.1-.4-1.84-1.38-1.84-.76 0-1.2.51-1.4 1-.07.18-.09.43-.09.68v4.76h-2.67s.04-7.73 0-8.94h2.67v1.27c.36-.56 1-1.36 2.46-1.36 1.8 0 3.19 1.18 3.19 3.71v5.32Z" />
                    </svg>
                  </span>
                  Share on LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
