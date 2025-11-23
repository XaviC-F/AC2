'use client';

import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col bg-[#0a0a0a] text-white min-h-screen">
      {/* Header */}
      <header className="relative z-20">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-6 sm:px-6 sm:pt-10 lg:px-16">
          <Link href="/" className="text-xl sm:text-2xl font-light uppercase tracking-[0.2em] text-white transition hover:text-white/80 no-underline">
            AC2
          </Link>
          <div className="hidden sm:flex items-center gap-6 lg:gap-8 text-xs uppercase tracking-[0.2em] text-white/70">
            <a href="/#problem" className="group relative transition hover:text-white after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-px after:bg-current after:transition-all after:duration-300 hover:after:w-full">
              The Problem
            </a>
            <a href="/#how-it-works" className="group relative transition hover:text-white after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-px after:bg-current after:transition-all after:duration-300 hover:after:w-full">
              How It Works
            </a>
            <Link href="/blog" className="group relative transition hover:text-white after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-px after:bg-current after:transition-all after:duration-300 hover:after:w-full no-underline">
              Blog
            </Link>
            <a href="/#get-started" className="group relative transition hover:text-white after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-px after:bg-current after:transition-all after:duration-300 hover:after:w-full">
              Get Started
            </a>
          </div>
          <div className="sm:hidden flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/70">
            <Link href="/" className="transition hover:text-white no-underline">Home</Link>
          </div>
        </nav>
        <div className="mx-auto mt-4 sm:mt-8 w-full max-w-6xl border-t border-white/10"></div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pb-12 sm:px-6 sm:pb-20 lg:px-16">
        <div className="mt-12 sm:mt-20 md:mt-32 flex flex-col items-center justify-center text-center">
          {/* Section Header */}
          <div className="mb-8 sm:mb-12">
            <div className="mb-4 sm:mb-6 inline-block">
              <div className="h-px w-12 sm:w-16 bg-white/40"></div>
            </div>
            <h1 className="mb-4 sm:mb-6 text-6xl sm:text-7xl md:text-8xl font-light tracking-wide text-white">
              404
            </h1>
            <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl font-light tracking-wide text-white/90">
              Page Not Found
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-white/70 lg:text-xl max-w-2xl mx-auto">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-8">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-white text-black font-light text-xs sm:text-sm uppercase tracking-[0.15em] transition hover:bg-white/90 no-underline"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 border border-white/20 bg-white/5 backdrop-blur-sm text-white font-light text-xs sm:text-sm uppercase tracking-[0.15em] transition hover:border-white/40 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>

          {/* Links */}
          <div className="mt-12 sm:mt-16 pt-8 border-t border-white/10 w-full max-w-md">
            <p className="text-xs uppercase tracking-[0.15em] text-white/60 mb-4">You might be looking for:</p>
            <nav className="flex flex-col gap-3 text-sm text-white/70">
              <Link href="/blog" className="transition hover:text-white no-underline">
                Blog
              </Link>
              <Link href="/objective" className="transition hover:text-white no-underline">
                Browse Objectives
              </Link>
              <Link href="/create_objective" className="transition hover:text-white no-underline">
                Create Objective
              </Link>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
}

