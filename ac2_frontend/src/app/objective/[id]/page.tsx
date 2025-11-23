'use client'

import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { Objective } from '../data';
import { useEffect, useState } from 'react';
import { API_URL } from '@/config/config';
import { Lock, Hash, Grid3x3, CheckCircle, XCircle, ArrowRight, QrCode } from 'lucide-react';

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

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const objectiveUrl = `${origin}/objective/${objectiveId}`;
  const commitUrl = `${origin}/commit?objective_id=${objectiveId}`;
  const shareMessage = `Check out "${obj?.title ?? "this AC2 objective"}" on AC2`;
  const fullShareText = `${shareMessage}: ${objectiveUrl}`;
  const shareText = encodeURIComponent(fullShareText);
  const shareQuote = encodeURIComponent(shareMessage);
  const shareUrl = encodeURIComponent(objectiveUrl);
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(commitUrl)}`;

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(objectiveUrl);
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
          <div className="border border-white/20 bg-white/5 p-6 sm:p-8 lg:p-12 backdrop-blur-sm">
            
            {/* Meta Info Row: Strategy, Status, Minimum */}
            <div className="flex flex-wrap items-start gap-6 sm:gap-8 mb-8 pb-8 border-b border-white/10">
              
              {/* Strategy */}
              {obj.resolution_strategy && (
                <div>
                  <div className="text-xs uppercase tracking-[0.15em] text-white/60 mb-2">Strategy</div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/20 bg-white/5 rounded">
                    <span className={`text-sm font-medium ${
                      obj.resolution_strategy.toUpperCase() === 'ASAP' 
                        ? 'text-yellow-400/90' 
                        : 'text-blue-400/90'
                    }`}>
                      {obj.resolution_strategy.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-white/40 mt-1.5 max-w-[200px]">
                    {obj.resolution_strategy.toUpperCase() === 'ASAP' 
                      ? 'Closes when any threshold is met' 
                      : 'Accepts commits until deadline'}
                  </div>
                </div>
              )}

              {/* Status / Deadline */}
              <div>
                <div className="text-xs uppercase tracking-[0.15em] text-white/60 mb-2">
                  {(obj.closed ?? false) ? 'Deadline' : 'Status'}
                </div>
                {(obj.closed ?? false) ? (
                  <div className="text-lg font-light text-white">
                    {new Date(obj.resolutionDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/20 bg-white/5 rounded text-white/90">
                    {formatTimeLeft(obj.resolutionDate)}
                  </div>
                )}
              </div>

              {/* Minimum Commitments */}
              {obj.minimum_number && obj.minimum_number > 1 && (
                <div>
                  <div className="text-xs uppercase tracking-[0.15em] text-white/60 mb-2">Minimum</div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-orange-500/30 bg-orange-500/10 rounded">
                    <Lock className="w-3 h-3 text-orange-400/80" />
                    <span className="text-sm text-orange-400/90">{obj.minimum_number} Commitments</span>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action: Commit Button */}
            {(!obj.closed || (obj.resolution_strategy === "DEADLINE" && !formatTimeLeft(obj.resolutionDate).includes("Resolved"))) && (
              <div className="mb-8 pb-8 border-b border-white/10">
                <Link
                  href={`/commit?objective_id=${objectiveId}`}
                  className="group block w-full bg-white text-black text-center py-4 sm:py-5 text-lg sm:text-xl font-medium uppercase tracking-[0.15em] transition hover:bg-white/90 no-underline flex items-center justify-center gap-3"
                >
                  Make a Commitment
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
            
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

            <div className="mt-8 sm:mt-10 space-y-3">
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

            <div className="mt-6 sm:mt-8 border border-white/15 bg-black/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-[0.15em] text-white/60">Share Link</div>
                <div className="text-sm sm:text-base font-light text-white break-all">{objectiveUrl}</div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  {copySuccess ? 'Copied!' : 'Copy link'}
                </button>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 border border-white/15 bg-black/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <QrCode className="w-6 h-6 text-white/70 mt-1" />
                <div>
                  <div className="text-xs uppercase tracking-[0.15em] text-white/60">Commit via QR</div>
                  <div className="text-sm text-white/70">Scan to open the commitment form for this objective.</div>
                  <div className="text-xs text-white/50 mt-1 break-all">{commitUrl}</div>
                </div>
              </div>
              <div className="flex items-center justify-center bg-white p-3">
                <img
                  src={qrImageSrc}
                  alt="QR code to commitment form"
                  className="w-40 h-40 object-contain"
                  loading="lazy"
                />
              </div>
            </div>

            {obj.commitments && obj.commitments.length > 0 && (
              <div className="mt-8 sm:mt-10">
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
                      <div className="text-xs text-white/50 mb-1">Total Eligible</div>
                      <div className="text-2xl font-light text-white">{obj.eligible_count || obj.invited_count || '?'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/50 mb-1">Remaining</div>
                      <div className="text-2xl font-light text-white">
                        {(obj.eligible_count || obj.invited_count) ? (obj.eligible_count || obj.invited_count || 0) - obj.commitments.length : '?'}
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
                          : commitment.is_decline
                            ? 'border-red-500/30 bg-red-500/5'
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
                            ) : commitment.is_decline ? (
                              <>
                                <XCircle className="w-3 h-3 text-red-500/80 flex-shrink-0" />
                                <div className="text-xs font-light text-red-500/90">
                                  Decline Response
                                </div>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3 text-white/40 flex-shrink-0" />
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
