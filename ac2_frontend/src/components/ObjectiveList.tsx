'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link';
import { PublishedObjective } from '@/components/PublishedObjectiveList';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 5;

interface ObjectiveProps {
  title: string, 
  pageItems: PublishedObjective[] | null, 
  route: string
}

export default function ObjectiveList({ title, pageItems, route }: ObjectiveProps) {
  const searchParams = useSearchParams();
  
  if (!pageItems || pageItems.length === 0) {
    return (
      <div className="flex flex-col bg-[#0a0a0a] text-white min-h-screen">
        <header className="relative z-20">
          <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-6 sm:px-6 sm:pt-10 lg:px-16">
            <Link href="/" className="text-xl sm:text-2xl font-light uppercase tracking-[0.2em] text-white transition hover:text-white/80 no-underline">
              AC2
            </Link>
            <Link 
              href="/create_objective" 
              className="text-xs uppercase tracking-[0.2em] text-white/70 transition hover:text-white no-underline"
            >
              Create Objective
            </Link>
          </nav>
          <div className="mx-auto mt-4 sm:mt-8 w-full max-w-6xl border-t border-white/10"></div>
        </header>
        <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 pb-12 sm:px-6 sm:pb-20 lg:px-16">
          <div className="text-center">
            <div className="mb-4 sm:mb-6 inline-block">
              <div className="h-px w-12 sm:w-16 bg-white/40"></div>
            </div>
            <h1 className="mb-4 text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-white">
              {title}
            </h1>
            <p className="text-white/60">No objectives have been published yet.</p>
          </div>
        </main>
      </div>
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
    <div className="flex flex-col bg-[#0a0a0a] text-white min-h-screen">
      {/* Header */}
      <header className="relative z-20">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-6 sm:px-6 sm:pt-10 lg:px-16">
          <Link href="/" className="text-xl sm:text-2xl font-light uppercase tracking-[0.2em] text-white transition hover:text-white/80 no-underline">
            AC2
          </Link>
          <Link 
            href="/create_objective" 
            className="text-xs uppercase tracking-[0.2em] text-white/70 transition hover:text-white no-underline"
          >
            Create Objective
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
              {title}
            </h1>
          </div>

          {/* Objectives List */}
          <div className="space-y-4 sm:space-y-6">
            {currentlyDisplayedItems.map((obj: PublishedObjective) => (
              <Link
                key={obj.id}
                href={`/objective/${obj.id}`}
                className="group block border border-white/20 bg-white/5 p-6 sm:p-8 transition-all hover:border-white/40 hover:bg-white/10 no-underline"
              >
                <h2 className="text-xl sm:text-2xl font-light tracking-wide text-white mb-3 group-hover:translate-x-1 transition-transform">
                  {obj.title}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">→</span>
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-white/70 mb-2">
                  {obj.description}
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-white/50">
                  <span>Resolution: {new Date(obj.resolutionDate).toLocaleDateString()}</span>
                  {obj.commitedPeople && obj.commitedPeople.length > 0 && (
                    <span>{obj.commitedPeople.length} committed</span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {(hasPrev || hasNext) && (
            <div className="flex justify-between items-center mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10">
              <Link
                href={`/${route}?page=${Math.max(page - 1, 1)}`}
                className={`inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 border border-white/20 bg-white/5 text-white font-light text-xs uppercase tracking-[0.15em] transition hover:border-white/40 hover:bg-white/10 no-underline ${
                  !hasPrev ? 'opacity-30 pointer-events-none' : ''
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Link>
              <span className="text-xs uppercase tracking-[0.15em] text-white/50">
                Page {page}
              </span>
              <Link
                href={`/${route}?page=${page + 1}`}
                className={`inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 border border-white/20 bg-white/5 text-white font-light text-xs uppercase tracking-[0.15em] transition hover:border-white/40 hover:bg-white/10 no-underline ${
                  !hasNext ? 'opacity-30 pointer-events-none' : ''
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
