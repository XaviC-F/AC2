'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { blogPosts } from './data';

export default function BlogPage() {
  const router = useRouter();
  
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
            <Link href="/blog" className="group relative transition hover:text-white after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-px after:bg-current no-underline">
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
        <div className="mt-12 sm:mt-20 md:mt-32">
          {/* Back to Home Link */}
          <div className="mb-8">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 bg-white/5 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all no-underline text-xs uppercase tracking-[0.15em]"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to Home</span>
            </Link>
          </div>
          
          {/* Section Header */}
          <div className="mb-8 sm:mb-12">
            <div className="mb-4 sm:mb-6 inline-block">
              <div className="h-px w-12 sm:w-16 bg-white/40"></div>
            </div>
            <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-white">
              Blog
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-white/70 lg:text-xl max-w-3xl">
              Exploring real-world applications of anonymous credible commitments and coordination problems.
            </p>
          </div>

          {/* Blog Posts List */}
          <div className="space-y-6 sm:space-y-8">
            {[...blogPosts].sort((a, b) => {
              // Sort by date descending (newest first)
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              return dateB.getTime() - dateA.getTime();
            }).map((post) => (
              <div
                key={post.slug}
                onClick={() => {
                  window.scrollTo(0, 0);
                  router.push(`/blog/${post.slug}`);
                }}
                className="group block border border-white/20 bg-white/5 p-6 sm:p-8 transition-all hover:border-white/40 hover:bg-white/10 cursor-pointer"
              >
                <div className="mb-3 text-xs uppercase tracking-[0.15em] text-white/50">
                  {post.date}
                </div>
                <h2 className="text-xl sm:text-2xl font-light tracking-wide text-white mb-3 group-hover:translate-x-1 transition-transform">
                  {post.title}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">→</span>
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-white/70">
                  {post.excerpt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
