'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { blogPosts } from './data';

export default function BlogPage() {
  return (
    <div className="flex flex-col bg-[#0a0a0a] text-white min-h-screen">
      {/* Header */}
      <header className="relative z-20">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-6 sm:px-6 sm:pt-10 lg:px-16">
          <Link href="/" className="text-xl sm:text-2xl font-light uppercase tracking-[0.2em] text-white transition hover:text-white/80 no-underline">
            AC2
          </Link>
          <Link 
            href="/" 
            className="text-xs uppercase tracking-[0.2em] text-white/70 transition hover:text-white no-underline"
          >
            Home
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
              Blog
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-white/70 lg:text-xl max-w-3xl">
              Exploring real-world applications of anonymous credible commitments and coordination problems.
            </p>
          </div>

          {/* Blog Posts List */}
          <div className="space-y-6 sm:space-y-8">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block border border-white/20 bg-white/5 p-6 sm:p-8 transition-all hover:border-white/40 hover:bg-white/10 no-underline"
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
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
