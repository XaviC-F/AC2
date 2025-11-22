'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Upload } from 'lucide-react';
import { API_URL } from '@/config/config';

export default function CreateObjectivePage() {
  const TITLE_MAX_LENGTH = 500;
  const DESCRIPTION_MAX_LENGTH = 1500;
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [resolutionDate, setResolutionDate] = useState('');
  const [strategy, setStrategy] = useState('');
  const [optInPercent, setOptInPercent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTitleTooLong = title.length > TITLE_MAX_LENGTH;
  const isDescriptionTooLong = description.length > DESCRIPTION_MAX_LENGTH;
  const isResolutionDateInvalid = resolutionDate
    ? new Date(resolutionDate) <= new Date()
    : false;
  const hasLengthError = isTitleTooLong || isDescriptionTooLong;
  const hasErrors = hasLengthError || isResolutionDateInvalid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hasErrors) {
      alert(
        'Please fix the fields marked in red (shorten text or choose a future resolution date) before submitting.'
      );
      return;
    }
    setIsSubmitting(true);
    
    try {
      let users: string[] = [];
      if (file) {
        const text = await file.text();
        users = text
          .trim()
          .split(/\r?\n/)
          .flatMap((line) => line.split(','))
          .map((u) => u.trim())
          .filter(Boolean);
      }
      const data = {
        title: title,
        description: description,
        invited_names: users,
        resolution_date: new Date(resolutionDate).toISOString(),
        resolution_strategy: strategy || 'asap',
        minimum_percentage: optInPercent ? Number(optInPercent) : null,
      };
      
      const response = await fetch(`${API_URL}objective`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create objective');
      }

      const result = await response.json();
      router.push(`/objective/${result.objective_id}`);
    } catch (err) {
      alert(`Request failed: ${err instanceof Error ? err.message : String(err)}`);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col bg-[#0a0a0a] text-white min-h-screen">
      {/* Header */}
      <header className="relative z-20">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-6 sm:px-6 sm:pt-10 lg:px-16">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-light uppercase tracking-[0.2em] text-white">
              Create Objective
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-white/60 max-w-2xl">
              Define a new coordination effort. Set the goal, invite participants, and establish the parameters for collective action.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-xs uppercase tracking-[0.2em] text-white/70 transition hover:text-white no-underline hidden sm:block"
            >
              Home
            </Link>
            <Link 
              href="/objective" 
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 border border-white/20 bg-white/5 text-white font-light text-xs uppercase tracking-[0.15em] transition hover:border-white/40 hover:bg-white/10 no-underline"
            >
              Browse Objectives
            </Link>
          </div>
        </nav>
        <div className="mx-auto mt-4 sm:mt-8 w-full max-w-6xl border-t border-white/10"></div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pb-12 sm:px-6 sm:pb-20 lg:px-16">
        <div className="mt-12 sm:mt-20 md:mt-32">

          {/* Form Card */}
          <div className="border border-white/20 bg-white/5 p-6 sm:p-8 lg:p-12 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Title */}
              <div className="group">
                <label className="block mb-3 text-xs uppercase tracking-[0.15em] text-white/60 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-white/30 focus:border-white/40 focus:outline-none focus:bg-white/10 transition-all font-light"
                  placeholder="Enter objective title"
                />
                <div className="mt-2 text-xs text-white/60">
                  <span className={isTitleTooLong ? 'text-red-400' : ''}>
                    {title.length}/{TITLE_MAX_LENGTH} characters
                  </span>
                  {isTitleTooLong && (
                    <span className="ml-2 text-red-400">Title exceeds the limit.</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="group">
                <label className="block mb-3 text-xs uppercase tracking-[0.15em] text-white/60 mb-2">
                  Description
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-white/30 focus:border-white/40 focus:outline-none focus:bg-white/10 transition-all font-light resize-none"
                  placeholder="Describe the objective and what collective action is needed"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                  <span className={isDescriptionTooLong ? 'text-red-400' : ''}>
                    {description.length}/{DESCRIPTION_MAX_LENGTH} characters
                  </span>
                  {isDescriptionTooLong && (
                    <span className="text-red-400">Description exceeds the limit.</span>
                  )}
                </div>
              </div>

              {/* File Upload */}
              <div className="group">
                <label className="block mb-3 text-xs uppercase tracking-[0.15em] text-white/60 mb-2">
                  Invited Users (CSV)
                  <span className="ml-2 text-white/40 normal-case font-light">(Optional)</span>
                </label>
                <div className="relative border border-dashed border-white/20 bg-white/5 p-6 sm:p-8 transition-all hover:border-white/40 hover:bg-white/10 group">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                    <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-white/40 mb-3 group-hover:text-white/60 transition-colors" />
                    <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                      {file ? file.name : 'Click to upload CSV file'}
                    </span>
                    <span className="text-xs text-white/50 mt-1">One name per line or comma-separated</span>
                  </label>
                </div>
              </div>

              {/* Resolution Date */}
              <div className="group">
                <label className="block mb-3 text-xs uppercase tracking-[0.15em] text-white/60 mb-2">
                  Resolution Date
                </label>
                <input
                  type="date"
                  required
                  value={resolutionDate}
                  onChange={(e) => setResolutionDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white focus:border-white/40 focus:outline-none focus:bg-white/10 transition-all font-light [color-scheme:dark]"
                />
                {isResolutionDateInvalid && (
                  <p className="mt-2 text-xs text-red-400">Please choose a future date.</p>
                )}
              </div>

              {/* Strategy and Opt-In Percentage Grid */}
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
                {/* Resolution Strategy */}
                <div className="group">
                  <label className="block mb-3 text-xs uppercase tracking-[0.15em] text-white/60 mb-2">
                    Resolution Strategy
                    <span className="ml-2 text-white/40 normal-case font-light">(Optional)</span>
                  </label>
                  <select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white focus:border-white/40 focus:outline-none focus:bg-white/10 transition-all font-light [color-scheme:dark]"
                  >
                    <option value="">Select strategy</option>
                    <option value="asap">As soon as possible</option>
                    <option value="optimistic">Optimistic</option>
                    <option value="pessimistic">Pessimistic</option>
                    <option value="random">Random</option>
                  </select>
                </div>

                {/* Minimum Opt-In Percentage */}
                <div className="group">
                  <label className="block mb-3 text-xs uppercase tracking-[0.15em] text-white/60 mb-2">
                    Minimum Opt-In %
                    <span className="ml-2 text-white/40 normal-case font-light">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={optInPercent}
                    onChange={(e) => setOptInPercent(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-white/30 focus:border-white/40 focus:outline-none focus:bg-white/10 transition-all font-light"
                    placeholder="0-100"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 sm:pt-6 border-t border-white/10">
                <button
                  type="submit"
                  disabled={isSubmitting || hasErrors}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-white text-black font-light text-xs sm:text-sm uppercase tracking-[0.15em] transition hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {isSubmitting ? 'Creating...' : 'Create Objective'}
                  {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
