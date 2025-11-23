'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Lock, Target, CheckCircle, XCircle, Upload, X, ArrowRight } from 'lucide-react';
import { API_URL } from '@/config/config';
import { Objective } from '../app/objective/data';

const MAX_NAME_LENGTH = 1000;

interface ObjectiveWithDetails extends Objective {
  category?: string;
  threshold?: number;
  deadline?: string;
}

type ObjectiveApiResponse = ObjectiveWithDetails & {
  resolution_date?: string;
  require_identity_verification?: boolean;
};

function normalizeObjective(data: ObjectiveApiResponse): ObjectiveWithDetails {
  const resolutionDate =
    data.resolutionDate || data.resolution_date || data.deadline || '';

  return {
    ...data,
    resolutionDate,
  };
}

export default function CommitmentPage() {
  const searchParams = useSearchParams();

  const [selectedChoice, setSelectedChoice] = useState<'commit' | 'decline' | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [queryParamObjectiveId, setQueryParamObjectiveId] = useState('');
  const [commitNumber, setCommitNumber] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const [objective, setObjective] = useState<ObjectiveWithDetails | null>(null);
  const [isLoadingObjective, setIsLoadingObjective] = useState(true);
  const [objectiveError, setObjectiveError] = useState("");
  const [isClosed, setIsClosed] = useState(false);

  const objectiveId = searchParams.get('objective_id');
  if (objectiveId && objectiveId != queryParamObjectiveId) {
    setQueryParamObjectiveId(objectiveId);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadObjective() {
      if (!queryParamObjectiveId) {
        setIsLoadingObjective(false);
        setObjectiveError("");
        return;
      }
      try {
        setIsLoadingObjective(true);
        setObjectiveError("");

        const res = await fetch(`${API_URL}objective/${queryParamObjectiveId}`, {method: "GET"});
        if (!res.ok) throw new Error(`Failed to load objective (${res.status})`);

        const data = await res.json();
        if (cancelled) return;

        const normalized = normalizeObjective(data);
        setObjective(normalized);
        setIsClosed(normalized.closed ?? false);

      } catch (e) {
        if (!cancelled) setObjectiveError((e instanceof Error ? e.message : String(e)) || "Failed to load objective");
      } finally {
        if (!cancelled) setIsLoadingObjective(false);
      }
    }

    loadObjective();
    return () => { cancelled = true; };
  }, [queryParamObjectiveId]);

  const handleCommitment = async (choice: 'commit' | 'decline') => {
    setSelectedChoice(choice);
    if (choice === 'decline') setCommitNumber('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setUploadedFiles([...uploadedFiles, ...fileArray]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const trimmedName = name.trim();
  const isNameTooLong = trimmedName.length > MAX_NAME_LENGTH;
  const isNameValid = trimmedName.length > 0 && !isNameTooLong;
  const maxCommitNumber = objective?.eligible_count || objective?.invited_count || 1; // Group size
  const commitNumberTrimmed = commitNumber.trim();
  const isCommitNumberRequired = selectedChoice !== 'decline';
  const isCommitNumberValid =
    !isCommitNumberRequired || 
    (/^\d+$/.test(commitNumberTrimmed) && 
     Number(commitNumberTrimmed) >= 1 && 
     Number(commitNumberTrimmed) <= maxCommitNumber);

  const handleSubmit = async () => {
    // Allow submission if strategy is DEADLINE even if published
    const isDeadlineActive = 
      objective?.resolution_strategy === "DEADLINE" && 
      objective?.resolutionDate && 
    new Date(objective.resolutionDate) > new Date();

  if (
    (isClosed && !isDeadlineActive) ||
    !selectedChoice ||
    !isNameValid ||
    isSubmitting
  ) return;

    if (selectedChoice === 'decline') {
      // For decline, we set Number to -1 to indicate decline
      // This allows the backend to count the user as having responded without contributing to the threshold
      // We continue execution to send this to the backend
    } else {
        if (!commitNumberTrimmed || !isCommitNumberValid) return;
    }

    try {
      setIsSubmitting(true);

      const data = {
        name: trimmedName,
        Number: selectedChoice === 'decline' ? -1 : parseInt(commitNumberTrimmed),
      };

      if (queryParamObjectiveId) {
        const res = await fetch(`${API_URL}commit/${queryParamObjectiveId}`, {
          method: "PATCH",
          headers: {
          "Content-Type": "application/json",
        },
          body: JSON.stringify(data),
        });

        const json = await res.json();
        
        // Check for specific error messages from backend
        if (json.message && json.message.includes("already resolved")) {
          alert("This objective has already been resolved using ASAP strategy. No new commitments are accepted.");
          window.location.href = `/objective/${queryParamObjectiveId}`;
          return;
        }
        
        if (json.message && json.message.includes("resolution date has been passed")) {
          alert("The deadline for this objective has passed. No new commitments are accepted.");
          return;
        }

        if (!res.ok && json.message) {
          throw new Error(json.message);
        } else if (!res.ok) {
          throw new Error("Commit failed");
        }

        setIsSubmitted(true);
      }
    } catch (e) {
      alert((e instanceof Error ? e.message : String(e)) || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoadingObjective) {
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
          <div className="text-white/60">Checking objective status...</div>
        </main>
      </div>
    );
  }

  // Error state
  if (objectiveError) {
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
          <div className="text-center">
            <div className="mb-4 text-red-500/80">{objectiveError}</div>
            <Link 
              href="/objective" 
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 bg-white/5 text-white font-light text-xs uppercase tracking-[0.15em] transition hover:border-white/40 hover:bg-white/10 no-underline"
            >
              Return to Objectives
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Published state
  const isDeadlineActive = 
    objective?.resolution_strategy === "DEADLINE" && 
    objective?.resolutionDate && 
    new Date(objective.resolutionDate) > new Date();

  if (isClosed && !isSubmitted && !isDeadlineActive) {
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
          <div className="border border-white/20 bg-white/5 p-8 sm:p-12 text-center backdrop-blur-sm max-w-xl w-full">
            <div className="w-16 h-16 border border-white/20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-white/60" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-light tracking-wide text-white mb-4">
              Commitments Closed
            </h1>
            <p className="text-white/70 leading-relaxed mb-6">
              This objective has already been published, so we can&apos;t accept new commitments.
            </p>
            <Link 
              href="/objective" 
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 bg-white/5 text-white font-light text-xs uppercase tracking-[0.15em] transition hover:border-white/40 hover:bg-white/10 no-underline"
            >
              Browse Objectives
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Submitted state
  if (isSubmitted) {
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
          <div className="border border-white/20 bg-white/5 p-8 sm:p-12 text-center backdrop-blur-sm max-w-2xl w-full">
            <div className="mb-8">
              <div className="w-20 h-20 border border-white/20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-white/80" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-light tracking-wide text-white mb-4">
                {selectedChoice === 'commit' ? 'Commitment Recorded' : 'Decline Response Recorded'}
              </h1>
              <p className="text-white/70 text-lg leading-relaxed">
                Your anonymous {selectedChoice === 'commit' ? 'commitment' : 'decline response'} has been securely recorded
              </p>
            </div>

            <div className="border border-white/20 bg-white/5 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-2 text-white/80 mb-3">
                <Lock className="w-5 h-5" />
                <span className="font-light text-sm uppercase tracking-[0.15em]">Your Identity is Protected</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                Your commitment is cryptographically secured and cannot be traced back to you.
                Only the aggregate results will be visible.
              </p>
            </div>

            <div className="space-y-4">
              <Link
                href={`/objective/${queryParamObjectiveId}`}
                className="group inline-flex items-center justify-center gap-2 w-full px-6 py-3 sm:px-8 sm:py-4 bg-white/10 border border-white/20 text-white font-light text-xs sm:text-sm uppercase tracking-[0.15em] transition hover:bg-white/20 no-underline"
              >
                Return to Objective
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/objective"
                className="group inline-flex items-center justify-center gap-2 w-full px-6 py-3 sm:px-8 sm:py-4 bg-white text-black font-light text-xs sm:text-sm uppercase tracking-[0.15em] transition hover:bg-white/90 no-underline"
              >
                View Other Objectives
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main form
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
            <div className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-4 py-2 mb-6">
              <Lock className="w-4 h-4 text-white/60" />
              <span className="text-xs uppercase tracking-[0.15em] text-white/60">Anonymous & Secure</span>
            </div>
            <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-white">
              Make Your Commitment
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-white/70 lg:text-xl max-w-3xl">
              Your response will remain completely anonymous
            </p>
          </div>

          {/* Objective Details Card */}
          {queryParamObjectiveId && !isLoadingObjective ? (<div className="border border-white/20 bg-white/5 p-6 sm:p-8 lg:p-12 backdrop-blur-sm mb-6 sm:mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 border border-white/20 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-white/60" />
              </div>
              <div className="flex-1">
                {objective?.category && (
                  <div className="text-xs uppercase tracking-[0.15em] text-white/50 mb-2">{objective.category}</div>
                )}
                <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-white mb-3">{objective?.title}</h2>
                <p className="text-white/70 leading-relaxed">{objective?.description}</p>
              </div>
            </div>

            {/* Minimum Commitments Warning */}
            {objective?.minimum_number && objective.minimum_number > 1 && (
              <div className="mb-6 border border-orange-500/30 bg-orange-500/10 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-orange-400/80" />
                  <div className="text-sm font-light uppercase tracking-[0.15em] text-orange-400/90">
                    Minimum Commitment Requirement
                  </div>
                </div>
                <div className="text-sm text-orange-400/70 leading-relaxed">
                  This objective requires at least <strong className="text-orange-300">{objective.minimum_number} commitments</strong> for any names to be cryptographically revealed.
                </div>
              </div>
            )}

            <div className="border-l-2 border-white/30 pl-4 sm:pl-6">
              <div className="text-xs uppercase tracking-[0.15em] text-white/60 mb-1">Resolution Date</div>
              <div className="text-lg font-light text-white">
                {objective?.resolutionDate ? new Date(objective.resolutionDate).toLocaleDateString() : ''}
              </div>
            </div>
          </div>) : null}

          {/* Commitment Form Card */}
          <div className="border border-white/20 bg-white/5 p-6 sm:p-8 lg:p-12 backdrop-blur-sm relative">
            {queryParamObjectiveId && (
              <Link 
                href={`/objective/${queryParamObjectiveId}`}
                className="absolute top-6 right-6 sm:top-8 sm:right-8 text-xs uppercase tracking-[0.15em] text-white/40 hover:text-white transition-colors no-underline flex items-center gap-2"
              >
                Return to Objective
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            <h3 className="text-xl sm:text-2xl font-light tracking-wide text-white mb-6 sm:mb-8">Your Commitment</h3>

            <div className="space-y-6 sm:space-y-8">
              {/* Objective ID Field */}
              {queryParamObjectiveId ? null : (
                <div className="group">
                <label className="block mb-3 text-xs uppercase tracking-[0.15em] text-white/60 mb-2">
                  Objective ID <span className="text-white/40 normal-case font-light">*</span>
                </label>
                <input
                  type="text"
                  id="objective_id"
                  value={name}
                  onChange={(e) => setQueryParamObjectiveId(e.target.value)}
                  placeholder="Enter the ID of the objective you want to commit to"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-white/30 focus:border-white/40 focus:outline-none focus:bg-white/10 transition-all font-light"
                  required
                />
              </div>)}

              {/* Name Field */}
              <div className="group">
                <label htmlFor="name" className="block mb-3 text-xs uppercase tracking-[0.15em] text-white/60 mb-2">
                  Your Name <span className="text-white/40 normal-case font-light">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className={`w-full px-4 py-3 bg-white/5 border text-white placeholder-white/30 focus:outline-none focus:bg-white/10 transition-all font-light ${
                    isNameTooLong ? 'border-red-500/50 focus:border-red-500' : 'border-white/20 focus:border-white/40'
                  }`}
                  required
                />
                {isNameTooLong && (
                  <p className="text-sm text-red-500/80 mt-2">
                    Name must be under {MAX_NAME_LENGTH} characters.
                  </p>
                )}
              </div>

              {/* Threshold Percentage Field */}
              <div className="group">
                <label htmlFor="commitNumber" className="block mb-3 text-xs uppercase tracking-[0.15em] text-white/60 mb-2">
                  Your commitment threshold <span className="text-white/40 normal-case font-light">*</span>
                </label>
                
                <p className="text-xs text-white/60 mb-3">Your <strong>commitment threshold</strong> means:&quot;I am happy for my name to be revealed as long as at least <strong>this many</strong> names are revealed, <i>including mine</i>.&quot;</p>
                <ul className="list-disc pl-4 text-xs text-white/60 mb-3 space-y-1">
                  <li>For example, if your threshold is 3, and 4 other names are revealed, your name will be revealed.</li>
                  <li>If your threshold is 3, and only 2 other names are revealed, your name will also be revealed as there are 3 people total including you.</li>
                  <li>If your threshold is 3, and 3 other names are revealed, your name will be revealed.</li>
                </ul>
                <input
                  type="text"
                  inputMode="numeric"
                  id="commitNumber"
                  value={commitNumber}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^[0-9]*$/.test(v)) setCommitNumber(v);
                  }}
                  placeholder={
                    selectedChoice === 'decline'
                      ? 'Not required for declining'
                      : objective?.minimum_number && objective.minimum_number > 1 
                        ? `Enter ${objective.minimum_number} or higher` 
                        : "Enter a number of people"
                  }
                  disabled={selectedChoice === 'decline'}
                  className={`w-full px-4 py-3 bg-white/5 border text-white placeholder-white/30 focus:outline-none focus:bg-white/10 transition-all font-light ${
                    selectedChoice === 'decline'
                      ? 'border-white/10 cursor-not-allowed opacity-60'
                      : commitNumber.length === 0 || isCommitNumberValid
                        ? 'border-white/20 focus:border-white/40'
                        : 'border-red-500/50 focus:border-red-500'
                  }`}
                  required
                />
                {commitNumber.length > 0 && !isCommitNumberValid && (
                  <p className="text-sm text-red-500/80 mt-2">
                    Please enter a number between 1 and {objective?.eligible_count || objective?.invited_count || 'the group size'}.
                  </p>
                )}
                {objective?.minimum_number && objective.minimum_number > 1 && selectedChoice === 'commit' && (
                  <p className="text-xs text-orange-400/70 mt-2">
                    Note: Due to the objective&apos;s requirement of at least {objective.minimum_number} commitments,
                    the smallest number of names that will be revealed is {objective.minimum_number}.
                  </p>
                )}
              </div>

              {/* Commitment Choice */}
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <button
                  type="button"
                  onClick={() => handleCommitment('commit')}
                  className={`group p-6 border transition-all text-left ${
                    selectedChoice === 'commit'
                      ? 'border-white/40 bg-white/10'
                      : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border ${
                      selectedChoice === 'commit' 
                        ? 'bg-white/20 border-white/40' 
                        : 'bg-white/5 border-white/20'
                    }`}>
                      <CheckCircle className={`w-6 h-6 ${selectedChoice === 'commit' ? 'text-white' : 'text-white/40'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-light text-lg text-white mb-1">Yes, I Commit</div>
                      <div className="text-sm text-white/60">I will participate if my commitment threshold is met</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleCommitment('decline')}
                  className={`group p-6 border transition-all text-left ${
                    selectedChoice === 'decline'
                      ? 'border-white/40 bg-white/10'
                      : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border ${
                      selectedChoice === 'decline' 
                        ? 'bg-white/20 border-white/40' 
                        : 'bg-white/5 border-white/20'
                    }`}>
                      <XCircle className={`w-6 h-6 ${selectedChoice === 'decline' ? 'text-white' : 'text-white/40'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-light text-lg text-white mb-1">No, I Decline</div>
                      <div className="text-sm text-white/60">I will not participate in this objective</div>
                    </div>
                  </div>
                </button>
              </div>

              {/* File Upload */}
              <div className="group">
                <label className="block mb-3 text-xs uppercase tracking-[0.15em] text-white/60 mb-2">
                  Supporting Documents
                  <span className="ml-2 text-white/40 normal-case font-light">(Optional)</span>
                </label>
                <div className="relative border border-dashed border-white/20 bg-white/5 p-6 sm:p-8 transition-all hover:border-white/40 hover:bg-white/10">
                  <input 
                    type="file" 
                    id="file-upload" 
                    multiple 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                    <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-white/40 mb-3 group-hover:text-white/60 transition-colors" />
                    <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                      {uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s) selected` : 'Click to upload'}
                    </span>
                    <span className="text-xs text-white/50 mt-1">PDF, DOC, Images up to 10MB</span>
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between border border-white/20 bg-white/5 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 border border-white/20 bg-white/5 rounded flex items-center justify-center">
                            <Upload className="w-4 h-4 text-white/60" />
                          </div>
                          <div>
                            <div className="text-sm font-light text-white/90">{file.name}</div>
                            <div className="text-xs text-white/50">{(file.size / 1024).toFixed(1)} KB</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFile(index)} 
                          className="text-white/40 hover:text-white transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Privacy Notice */}
              <div className="border border-white/20 bg-white/5 rounded-xl p-4 sm:p-6">
                <div className="flex gap-3">
                  <Lock className="w-5 h-5 text-white/60 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-white/70 leading-relaxed">
                    <strong className="text-white font-light">Privacy Guarantee:</strong> Your commitment is encrypted and anonymized until your commitment threshold is reached.
                    No one, including the organizer, can see individual responses before then. Only aggregate statistics are visible.
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 sm:pt-6 border-t border-white/10">
                <p className="text-center text-xs text-white/50 mb-6">THIS ACTION IS IRREVERSIBLE: YOU CANNOT CHANGE YOUR COMMITMENT AFTER SUBMITTING</p>
                
                <button
                  onClick={handleSubmit}
                  disabled={
                    !selectedChoice ||
                    !isNameValid ||
                    isSubmitting ||
                    (selectedChoice === 'commit' && (!commitNumberTrimmed || !isCommitNumberValid))
                  }
                  className="group inline-flex items-center justify-center gap-2 w-full px-6 py-3 sm:px-8 sm:py-4 bg-white text-black font-light text-xs sm:text-sm uppercase tracking-[0.15em] transition hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting Securely...' : (selectedChoice === 'decline' ? 'Submit Decline Response' : 'Submit My Commitment')}
                  {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
