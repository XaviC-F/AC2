'use client';

import { useLayoutEffect, useState, useEffect, useRef } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getBlogPostBySlug } from '../data';

// Component for rendering static HTML blog posts
// The HTML content is already in post.content, just render it directly
// LaTeX will be processed after the HTML is rendered
function StaticHtmlContent({ content }: { content: string }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Process LaTeX after HTML is rendered
  useEffect(() => {
    if (!isMounted || !contentRef.current) return;

    const timer = setTimeout(() => {
      import('katex').then((katexModule) => {
        const { renderToString } = katexModule;
        
        if (!renderToString) {
          console.error('KaTeX renderToString not found');
          return;
        }
        
        // Find and replace all LaTeX formulas in the rendered HTML
        const container = contentRef.current!;
        
        // Process block math ($$...$$)
        const blockMathRegex = /\$\$([^$]+)\$\$/g;
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
        const blockNodes: Array<{ node: Text; matches: RegExpExecArray[] }> = [];
        
        let node;
        while (node = walker.nextNode()) {
          const text = node.textContent || '';
          const matches: RegExpExecArray[] = [];
          let match;
          blockMathRegex.lastIndex = 0; // Reset regex
          while ((match = blockMathRegex.exec(text)) !== null) {
            matches.push(match);
          }
          if (matches.length > 0) {
            blockNodes.push({ node: node as Text, matches });
          }
        }
        
        // Replace block math from end to start
        blockNodes.forEach(({ node, matches }) => {
          matches.reverse().forEach(match => {
            try {
              const rendered = renderToString(match[1], {
                throwOnError: false,
                displayMode: true
              });
              const div = document.createElement('div');
              div.className = 'katex-block';
              div.innerHTML = rendered;
              
              const parent = node.parentNode;
              if (parent) {
                const text = node.textContent || '';
                const beforeText = text.substring(0, match.index);
                const afterText = text.substring(match.index + match[0].length);
                
                if (beforeText) {
                  parent.insertBefore(document.createTextNode(beforeText), node);
                }
                parent.insertBefore(div, node);
                if (afterText) {
                  const afterNode = document.createTextNode(afterText);
                  parent.insertBefore(afterNode, node);
                }
                parent.removeChild(node);
              }
            } catch (e) {
              console.error('Error rendering block LaTeX:', e);
            }
          });
        });
        
        // Process inline math ($...$) - need to re-walk since DOM changed
        const inlineMathRegex = /\$([^$\n]+)\$/g;
        const inlineWalker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
        const inlineNodes: Array<{ node: Text; matches: RegExpExecArray[] }> = [];
        
        let inlineNode;
        while (inlineNode = inlineWalker.nextNode()) {
          const text = inlineNode.textContent || '';
          const matches: RegExpExecArray[] = [];
          let match;
          inlineMathRegex.lastIndex = 0;
          while ((match = inlineMathRegex.exec(text)) !== null) {
            matches.push(match);
          }
          if (matches.length > 0) {
            inlineNodes.push({ node: inlineNode as Text, matches });
          }
        }
        
        // Replace inline math from end to start
        inlineNodes.forEach(({ node, matches }) => {
          matches.reverse().forEach(match => {
            try {
              const rendered = renderToString(match[1], {
                throwOnError: false,
                displayMode: false
              });
              const span = document.createElement('span');
              span.className = 'katex-inline';
              span.innerHTML = rendered;
              
              const parent = node.parentNode;
              if (parent) {
                const text = node.textContent || '';
                const beforeText = text.substring(0, match.index);
                const afterText = text.substring(match.index + match[0].length);
                
                if (beforeText) {
                  parent.insertBefore(document.createTextNode(beforeText), node);
                }
                parent.insertBefore(span, node);
                if (afterText) {
                  const afterNode = document.createTextNode(afterText);
                  parent.insertBefore(afterNode, node);
                }
                parent.removeChild(node);
              }
            } catch (e) {
              console.error('Error rendering inline LaTeX:', e);
            }
          });
        });
      }).catch((err) => {
        console.error('Failed to load KaTeX:', err);
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [isMounted, content]);

  // Render the HTML content directly - dangerouslySetInnerHTML will render it as HTML
  return (
    <div 
      ref={contentRef}
      className="blog-content text-white/80 leading-relaxed" 
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
// @ts-ignore - react-katex doesn't have types
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// Component to render blog content with LaTeX support
function BlogContent({ content }: { content: string }) {
  const [isMounted, setIsMounted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Replace LaTeX placeholders with actual rendered LaTeX after mount
  useEffect(() => {
    if (!isMounted || !contentRef.current) return;

    // Use a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // Import KaTeX directly
      import('katex').then((katexModule) => {
        // KaTeX exports renderToString as a named export
        const { renderToString } = katexModule;
        
        if (!renderToString) {
          console.error('KaTeX renderToString not found', katexModule);
          return;
        }
        
        // Find all inline math placeholders
        const inlinePlaceholders = Array.from(contentRef.current!.querySelectorAll('.latex-inline-placeholder'));
        console.log('Found inline placeholders:', inlinePlaceholders.length);
        inlinePlaceholders.forEach((placeholder: Element) => {
          const formula = placeholder.getAttribute('data-formula');
          if (formula) {
            try {
              const rendered = renderToString(formula, { 
                throwOnError: false, 
                displayMode: false 
              });
              const newSpan = document.createElement('span');
              newSpan.className = 'katex-inline';
              newSpan.innerHTML = rendered;
              if (placeholder.parentNode) {
                placeholder.parentNode.replaceChild(newSpan, placeholder);
              }
            } catch (e) {
              console.error('Error rendering inline LaTeX:', e, formula);
            }
          }
        });

        // Find all block math placeholders
        const blockPlaceholders = Array.from(contentRef.current!.querySelectorAll('.latex-block-placeholder'));
        console.log('Found block placeholders:', blockPlaceholders.length);
        blockPlaceholders.forEach((placeholder: Element) => {
          const formula = placeholder.getAttribute('data-formula');
          if (formula) {
            try {
              const rendered = renderToString(formula, { 
                throwOnError: false, 
                displayMode: true 
              });
              const newDiv = document.createElement('div');
              newDiv.className = 'katex-block';
              newDiv.innerHTML = rendered;
              if (placeholder.parentNode) {
                placeholder.parentNode.replaceChild(newDiv, placeholder);
              }
            } catch (e) {
              console.error('Error rendering block LaTeX:', e, formula);
            }
          }
        });
      }).catch((err) => {
        console.error('Failed to load KaTeX:', err);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [isMounted, content]);

  // Replace LaTeX formulas with placeholders that preserve HTML structure
  const processedContent = content
    .replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
      const escaped = formula.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      return `<span class="latex-block-placeholder" data-formula="${escaped}">$$${formula}$$</span>`;
    })
    .replace(/\$([^$]+)\$/g, (match, formula) => {
      const escaped = formula.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      return `<span class="latex-inline-placeholder" data-formula="${escaped}">$${formula}$</span>`;
    });

  return (
    <div 
      ref={contentRef}
      className="blog-content text-white/80 leading-relaxed" 
      dangerouslySetInnerHTML={{ __html: processedContent }}
      suppressHydrationWarning
    />
  );
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
            <Link href="/blog" className="transition hover:text-white no-underline">Blog</Link>
          </div>
        </nav>
        <div className="mx-auto mt-4 sm:mt-8 w-full max-w-6xl border-t border-white/10"></div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pb-12 sm:px-6 sm:pb-20 lg:px-16">
        <div className="mt-12 sm:mt-20 md:mt-32">
          {/* Back Links */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 bg-white/5 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all no-underline text-xs uppercase tracking-[0.15em]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Blog</span>
            </Link>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 bg-white/5 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all no-underline text-xs uppercase tracking-[0.15em]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>

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
            {(post as any).isStaticHtml ? (
              <StaticHtmlContent content={post.content} />
            ) : (
              <BlogContent content={post.content} />
            )}
          </article>
        </div>
      </main>
    </div>
  );
}
