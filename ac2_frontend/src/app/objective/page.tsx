'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { API_URL } from '@/config/config';

interface Objective {
  id: string;
  title: string;
  description: string;
  resolutionDate: string;
  committed_people: string[];
  resolution_strategy: string;
  published: boolean;
}

const PAGE_SIZE = 10;

export default function ObjectivesPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at');
  const searchParams = useSearchParams();

  // Pagination state
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? Math.max(1, parseInt(pageParam)) : 1;

  useEffect(() => {
    let cancelled = false;

    async function fetchObjectives() {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}objectives?sort_by=${sortBy}`);
        if (!res.ok) throw new Error('Failed to fetch objectives');
        const data = await res.json();
        if (!cancelled) {
          setObjectives(data);
        }
      } catch (error) {
        console.error('Error fetching objectives:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchObjectives();

    return () => {
      cancelled = true;
    };
  }, [sortBy]);

  // Pagination Logic
  const totalItems = objectives.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const displayedObjectives = objectives.slice(startIdx, startIdx + PAGE_SIZE);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

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
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-white">
                Browse Objectives
              </h1>
              
              {/* Sorting Dropdown */}
              <div className="relative group">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-white/60 mb-2">
                  <Filter className="w-3 h-3" />
                  Sort By
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/5 border border-white/20 text-white text-sm px-4 py-2 pr-8 focus:outline-none focus:bg-white/10 transition-colors cursor-pointer appearance-none min-w-[180px]"
                >
                  <option value="created_at" className="bg-[#0a0a0a]">Newest First</option>
                  <option value="resolution_date" className="bg-[#0a0a0a]">Closing Soon</option>
                  <option value="title" className="bg-[#0a0a0a]">Title (A-Z)</option>
                </select>
                <div className="absolute right-3 bottom-3 pointer-events-none text-white/40">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="text-white/60 py-12 text-center">Loading objectives...</div>
          ) : objectives.length === 0 ? (
            <div className="text-white/60 py-12 text-center border border-white/10 bg-white/5 rounded">
              No public objectives found.
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {displayedObjectives.map((obj) => (
                <Link
                  key={obj.id}
                  href={`/objective/${obj.id}`}
                  className="group block border border-white/20 bg-white/5 p-6 sm:p-8 transition-all hover:border-white/40 hover:bg-white/10 no-underline"
                >
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h2 className="text-xl sm:text-2xl font-light tracking-wide text-white group-hover:translate-x-1 transition-transform">
                      {obj.title}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">→</span>
                    </h2>
                    {obj.resolution_strategy === 'ASAP' && (
                      <span className="px-2 py-1 text-[10px] uppercase tracking-wider border border-yellow-500/30 text-yellow-500/80 rounded">
                        ASAP
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed text-white/70 mb-4 line-clamp-2">
                    {obj.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-white/50 border-t border-white/10 pt-4 mt-auto">
                    <div className="flex items-center gap-1">
                      <span className="uppercase tracking-wider">Resolution:</span>
                      <span className="text-white/70">
                        {new Date(obj.resolutionDate).toLocaleDateString()}
                      </span>
                    </div>
                    {obj.committed_people && obj.committed_people.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-green-400/80">{obj.committed_people.length} Revealed</span>
                      </div>
                    )}
                    {obj.published && (
                      <div className="flex items-center gap-1 ml-auto">
                        <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full">
                          Published
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {(hasPrev || hasNext) && (
            <div className="flex justify-between items-center mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10">
              <Link
                href={`/objective?page=${Math.max(currentPage - 1, 1)}`}
                className={`inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 border border-white/20 bg-white/5 text-white font-light text-xs uppercase tracking-[0.15em] transition hover:border-white/40 hover:bg-white/10 no-underline ${
                  !hasPrev ? 'opacity-30 pointer-events-none' : ''
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Link>
              <span className="text-xs uppercase tracking-[0.15em] text-white/50">
                Page {currentPage}
              </span>
              <Link
                href={`/objective?page=${currentPage + 1}`}
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
