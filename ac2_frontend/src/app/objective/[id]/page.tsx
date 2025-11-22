'use client'

import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { Objective } from '../data';
import { useEffect, useState } from 'react';
import { API_URL } from '@/config/config';
import { Lock, Hash, Grid3x3, CheckCircle, XCircle } from 'lucide-react';

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

        // Map API response to frontend interface
        const mappedData: Objective = {
          ...data,
          id: objectiveId,
          resolutionDate: data.resolution_date || data.resolutionDate,
          committers: data.committed_people || data.committers,
        };

        setObjective(mappedData);
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
          <div className="border border-white/20 bg-white/5 p-6 sm:p-8 lg:p-12 backdrop-blur-sm space-y-6 sm:space-y-8">
            {/* Strategy and Minimum Requirements */}
            <div className="flex flex-wrap gap-3">
              {/* Resolution Strategy Badge */}
              {obj.resolution_strategy && (
                <div className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 bg-white/5 rounded">
                  <div className="text-xs uppercase tracking-[0.15em] text-white/60">Strategy:</div>
                  <div className={`text-sm font-light ${
                    obj.resolution_strategy.toUpperCase() === 'ASAP' 
                      ? 'text-yellow-400/90' 
                      : 'text-blue-400/90'
                  }`}>
                    {obj.resolution_strategy.toUpperCase()}
                  </div>
                  <div className="text-xs text-white/50 ml-2">
                    {obj.resolution_strategy.toUpperCase() === 'ASAP' 
                      ? '(Closes when threshold met)' 
                      : '(Accepts commits until deadline)'}
                  </div>
                </div>
              )}
              
              {/* Minimum Commitments Badge */}
              {obj.minimum_number && obj.minimum_number > 1 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 border border-orange-500/30 bg-orange-500/10 rounded">
                  <Lock className="w-3 h-3 text-orange-400/80" />
                  <div className="text-xs uppercase tracking-[0.15em] text-orange-400/80">
                    Minimum: {obj.minimum_number} {obj.minimum_number === 1 ? 'Commitment' : 'Commitments'}
                  </div>
                  <div className="text-xs text-orange-400/60 ml-2">
                    (Required for any decryption)
                  </div>
                </div>
              )}
            </div>

            <div className="border-l-2 border-white/30 pl-4 sm:pl-6">
              <div className="mb-2 text-xs uppercase tracking-[0.15em] text-white/60">
                {obj.published ? 'Resolution Date' : 'Status'}
              </div>
              {obj.published ? (
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
              ) : (
                <div className="text-lg sm:text-xl font-light text-white">
                  {formatTimeLeft(obj.resolutionDate)}
                </div>
              )}
            </div>
            
            {obj.committers && obj.committers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-4 h-4 text-white/60" />
                  <div className="text-xs uppercase tracking-[0.15em] text-white/60">
                    Cryptographically Revealed Committers
                  </div>
                </div>
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

            {obj.commitments && obj.commitments.length > 0 && (
              <div>
                {/* Summary Statistics */}
                <div className="mb-6 border border-white/20 bg-white/5 p-4 rounded">
                  <div className="flex items-center gap-2 mb-3">
                    <Hash className="w-4 h-4 text-white/60" />
                    <div className="text-sm font-light uppercase tracking-[0.15em] text-white/60">
                      Commitment Statistics
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-white/50 mb-1">Committed</div>
                      <div className="text-2xl font-light text-white">{obj.commitments.length}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/50 mb-1">Total Invited</div>
                      <div className="text-2xl font-light text-white">{obj.invited_count || '?'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/50 mb-1">Remaining</div>
                      <div className="text-2xl font-light text-white">
                        {obj.invited_count ? obj.invited_count - obj.commitments.length : '?'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-white/50 mb-1">Decrypted</div>
                      <div className="text-2xl font-light text-green-400">
                        {obj.commitments.filter(c => c.decrypted).length}
                      </div>
                    </div>
                  </div>
                  {/* Threshold Distribution */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-xs text-white/50 mb-2">Threshold Distribution</div>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const thresholdCounts: Record<number, number> = {};
                        obj.commitments.forEach(c => {
                          // Find first non-zero point to determine threshold
                          let threshold = 0;
                          for (let i = 0; i < c.points.length; i++) {
                            if (c.points[i][0] !== '0' || c.points[i][1] !== '0') {
                              threshold = i + 1;
                              break;
                            }
                          }
                          if (threshold > 0) {
                            thresholdCounts[threshold] = (thresholdCounts[threshold] || 0) + 1;
                          }
                        });
                        return Object.entries(thresholdCounts)
                          .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                          .map(([threshold, count]) => (
                            <div key={threshold} className="px-3 py-1 bg-white/10 border border-white/20 rounded text-xs">
                              <span className="text-white/70">T={threshold}:</span>{' '}
                              <span className="text-white font-light">{count}</span>
                            </div>
                          ));
                      })()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Hash className="w-4 h-4 text-white/60" />
                  <div className="text-xs uppercase tracking-[0.15em] text-white/60">
                    Individual Commitments ({obj.commitments.length})
                  </div>
                </div>

                {/* Polynomial Coefficients (shown once at top if any commitment is decrypted) */}
                {(() => {
                  const decryptedCommitment = obj.commitments.find(c => c.decrypted && c.coefficients);
                  if (decryptedCommitment && decryptedCommitment.coefficients) {
                    return (
                      <div className="mb-6 border border-green-500/30 bg-green-500/5 p-4 rounded">
                        <div className="flex items-center gap-2 mb-3">
                          <Hash className="w-4 h-4 text-green-500/60" />
                          <div className="text-sm font-light uppercase tracking-[0.15em] text-green-500/70">
                            Recovered Polynomial Coefficients
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                          {decryptedCommitment.coefficients.map((coeff, cidx) => (
                            <div key={cidx} className="font-mono text-[9px] leading-tight text-green-500/70 bg-black/30 p-2 rounded border border-green-500/20 break-all">
                              <span className="text-green-500/50">a[{cidx}]:</span> {coeff}
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-green-500/60">
                          These coefficients were recovered via Lagrange interpolation and used to decrypt the commitments below.
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {obj.commitments.map((commitment, idx) => {
                    // Calculate implied threshold from points
                    let impliedThreshold = 0;
                    for (let i = 0; i < commitment.points.length; i++) {
                      if (commitment.points[i][0] !== '0' || commitment.points[i][1] !== '0') {
                        impliedThreshold = i + 1;
                        break;
                      }
                    }

                    return (
                      <div key={idx} className={`border p-3 sm:p-4 ${
                        commitment.decrypted 
                          ? 'border-green-500/30 bg-green-500/5' 
                          : 'border-white/20 bg-white/5'
                      }`}>
                        {/* Decryption Status Header */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                          <div className="flex items-center gap-2">
                            {commitment.decrypted ? (
                              <>
                                <CheckCircle className="w-3 h-3 text-green-500/80 flex-shrink-0" />
                                <div className="text-xs font-light text-green-500/90">
                                  {commitment.decrypted_name}
                                </div>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-white/40 flex-shrink-0" />
                                <div className="text-xs font-light text-white/50">
                                  Encrypted
                                </div>
                              </>
                            )}
                          </div>
                          <div className="px-2 py-0.5 bg-white/10 border border-white/20 rounded text-xs text-white/70">
                            T={impliedThreshold}
                          </div>
                        </div>

                      <div className="space-y-3">
                        {/* Ciphertext */}
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Lock className="w-2 h-2 text-white/40" />
                            <div className="text-xs uppercase tracking-[0.15em] text-white/50">
                              Hash
                            </div>
                          </div>
                          <div className="font-mono text-[10px] leading-tight text-white/70 break-all bg-black/30 p-2 rounded border border-white/10">
                            {commitment.ciphertext}
                          </div>
                        </div>

                        {/* Points */}
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Grid3x3 className="w-2 h-2 text-white/40" />
                            <div className="text-xs uppercase tracking-[0.15em] text-white/50">
                              Shares ({commitment.points.length})
                            </div>
                          </div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {commitment.points.map((point, pidx) => (
                              <div key={pidx} className="font-mono text-[9px] leading-tight text-white/60 bg-black/30 p-1 rounded border border-white/10 break-all">
                                <span className="text-white/40">{pidx + 1}:</span> ({point[0]}, {point[1]})
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Timestamp */}
                        <div className="text-xs text-white/40 pt-2 border-t border-white/10">
                          {new Date(commitment.committed_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
