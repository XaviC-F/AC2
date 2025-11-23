'use client';

import { useLayoutEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getBlogPostBySlug } from '../data';
// @ts-ignore - react-katex doesn't have types
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// Component to render blog content with LaTeX support
function BlogContent({ content }: { content: string }) {

  // Simple approach: render HTML and then process LaTeX
  // We'll use a hybrid approach - render HTML and replace LaTeX
  const processedContent = content
    .replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
      return `__BLOCK_MATH__${formula}__END_BLOCK__`;
    })
    .replace(/\$([^$]+)\$/g, (match, formula) => {
      return `__INLINE_MATH__${formula}__END_INLINE__`;
    });

  const parts = processedContent.split(/(__BLOCK_MATH__|__INLINE_MATH__|__END_BLOCK__|__END_INLINE__)/);
  const elements: React.ReactElement[] = [];
  let i = 0;
  let currentBlock: string | null = null;
  let currentInline: string | null = null;
  let currentHTML = '';

  parts.forEach((part) => {
    if (part === '__BLOCK_MATH__') {
      if (currentHTML) {
        elements.push(<span key={i++} dangerouslySetInnerHTML={{ __html: currentHTML }} />);
        currentHTML = '';
      }
      currentBlock = '';
    } else if (part === '__END_BLOCK__' && currentBlock !== null) {
      elements.push(<BlockMath key={i++} math={currentBlock} />);
      currentBlock = null;
    } else if (part === '__INLINE_MATH__') {
      if (currentHTML) {
        elements.push(<span key={i++} dangerouslySetInnerHTML={{ __html: currentHTML }} />);
        currentHTML = '';
      }
      currentInline = '';
    } else if (part === '__END_INLINE__' && currentInline !== null) {
      elements.push(<InlineMath key={i++} math={currentInline} />);
      currentInline = null;
    } else if (currentBlock !== null) {
      currentBlock += part;
    } else if (currentInline !== null) {
      currentInline += part;
    } else {
      currentHTML += part;
    }
  });

  if (currentHTML) {
    elements.push(<span key={i} dangerouslySetInnerHTML={{ __html: currentHTML }} />);
  }

  return <div className="blog-content text-white/80 leading-relaxed">{elements}</div>;
}

export default function BlogPostPage() {
  const params = useParams();
  const post = getBlogPostBySlug(params.slug as string);

  // Scroll to top when the page loads or slug changes
  useLayoutEffect(() => {
    // Disable Next.js scroll restoration for this route
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Scroll to top immediately and aggressively
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Also scroll after multiple delays to catch any late scroll restoration
    const timeouts = [
      setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }), 0),
      setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }), 10),
      setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }), 50),
    ];
    
    return () => timeouts.forEach(clearTimeout);
  }, [params.slug]);

  if (!post) {
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
            href="/blog" 
            className="text-xs uppercase tracking-[0.2em] text-white/70 transition hover:text-white no-underline"
          >
            Blog
          </Link>
        </nav>
        <div className="mx-auto mt-4 sm:mt-8 w-full max-w-6xl border-t border-white/10"></div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pb-12 sm:px-6 sm:pb-20 lg:px-16">
        <div className="mt-12 sm:mt-20 md:mt-32">
          {/* Back Link */}
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 mb-8 text-white/70 hover:text-white transition-colors no-underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm uppercase tracking-[0.15em]">Back to Blog</span>
          </Link>

          {/* Article Header */}
          <div className="mb-8 sm:mb-12">
            <div className="mb-4 sm:mb-6 inline-block">
              <div className="h-px w-12 sm:w-16 bg-white/40"></div>
            </div>
            <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-white">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-white/60 mb-6">
              <time dateTime={post.date}>{post.date}</time>
            </div>
            <p className="text-base sm:text-lg leading-relaxed text-white/70 lg:text-xl max-w-3xl">
              {post.excerpt}
            </p>
          </div>

          {/* Article Content */}
          <article className="border border-white/20 bg-white/5 p-6 sm:p-8 lg:p-12 backdrop-blur-sm">
            <BlogContent content={post.content} />
          </article>
        </div>
      </main>
    </div>
  );
}
