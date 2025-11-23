'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, Lock, ChevronRight, Plus, List, FileSignature, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AC2Homepage() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const useCases = [
    {
      title: "Labor Organizing",
      description: "Amazon workers want to unionize, but only if they know 10,000+ others will join them. Without this certainty, individuals risk retaliation while the effort fails.",
      icon: Users,
      color: "blue",
      slug: "labor-organizing"
    },
    {
      title: "Political Change",
      description: "Citizens in an authoritarian regime oppose the government but won't speak out unless they know the majority shares their views. Fear of being the only dissenter keeps everyone silent.",
      icon: Shield,
      color: "purple",
      slug: "political-change"
    },
    {
      title: "Speaking Truth to Power",
      description: "Harvey Weinstein's victims knew they weren't alone, but each woman feared going public without others. The first to speak out faced the full weight of his power and disbelief.",
      icon: Lock,
      color: "red",
      slug: "speaking-truth-to-power"
    }
  ];

  const steps = [
    {
      number: 1,
      title: "Verify Your Identity",
      description: "Securely prove who you are through our verification system. Your identity is encrypted and stored separately from your commitment."
    },
    {
      number: 2,
      title: "Choose Your Threshold",
      description: "Decide how many other people need to commit with you before you're willing to be revealed. Until this number is reached, you remain completely anonymous."
    },
    {
      number: 3,
      title: "Make Your Commitment",
      description: "Submit your commitment to the objective. Nothing about you is public until your threshold is reached."
    },
    {
      number: 4,
      title: "Revelation in Waves",
      description: "As more people commit, those who set lower thresholds are revealed together first. This ensures that the most vulnerable individuals aren't revealed until a very large number of people are committed with them."
    }
  ];

  return (
    <div className="flex flex-col bg-[#0a0a0a] text-white min-h-screen">
      {/* Hero Section */}
      <div className="relative flex min-h-screen flex-col overflow-hidden">
        {/* Hero Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-purple-950/20 to-slate-950"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80"></div>
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>

        <header className="relative z-20">
          <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-6 sm:px-6 sm:pt-10 lg:px-16">
            <Link href="/" className="text-xl sm:text-2xl font-light uppercase tracking-[0.2em] text-white transition hover:text-white/80 no-underline">
              AC2
            </Link>
            <div className="hidden sm:flex items-center gap-6 lg:gap-8 text-xs uppercase tracking-[0.2em] text-white/70">
              <a href="#problem" className="group relative transition hover:text-white after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-px after:bg-current after:transition-all after:duration-300 hover:after:w-full">
                The Problem
              </a>
              <a href="#how-it-works" className="group relative transition hover:text-white after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-px after:bg-current after:transition-all after:duration-300 hover:after:w-full">
                How It Works
              </a>
              <Link href="/blog" className="group relative transition hover:text-white after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-px after:bg-current after:transition-all after:duration-300 hover:after:w-full no-underline">
                Blog
              </Link>
              <a href="#get-started" className="group relative transition hover:text-white after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-px after:bg-current after:transition-all after:duration-300 hover:after:w-full">
                Get Started
              </a>
            </div>
            {/* Mobile menu button - could be enhanced with a hamburger menu later */}
            <div className="sm:hidden flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/70">
              <a href="#problem" className="transition hover:text-white">Menu</a>
            </div>
          </nav>
          <div className="mx-auto mt-4 sm:mt-8 w-full max-w-6xl border-t border-white/10"></div>
        </header>

        <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-12 sm:px-6 sm:pb-20 lg:px-16">
          <div className="space-y-6 sm:space-y-8 mt-12 sm:mt-20 md:mt-32">
            <h1 className="text-[36px] sm:text-[48px] md:text-[64px] lg:text-[80px] xl:text-[96px] font-light leading-[115%] tracking-[-1px] sm:tracking-[-2px] text-white">
              Dissolving Coordination Problems
            </h1>
            <p className="max-w-4xl text-[16px] sm:text-[18px] md:text-[22px] lg:text-[24px] leading-[155%] text-white/90 font-light">
              Anonymous Credible Commitments that enable collective action. <br className="hidden sm:block" />Commit privately, reveal conditionally, act together.
            </p>
            <div className="flex flex-col gap-4 sm:gap-6 pt-4 sm:pt-6 sm:flex-row sm:items-center">
              <Link 
                href="/create_objective" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-white text-black font-light text-xs sm:text-sm uppercase tracking-[0.15em] transition hover:bg-white/90 no-underline w-full sm:w-auto"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a 
                href="#how-it-works" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 border border-white/20 bg-white/5 backdrop-blur-sm text-white font-light text-xs sm:text-sm uppercase tracking-[0.15em] transition hover:border-white/40 hover:bg-white/10 no-underline w-full sm:w-auto"
              >
                Learn More
              </a>
            </div>
          </div>
        </main>
      </div>

      {/* The Problem Section */}
      <section id="problem" className="relative bg-[#0a0a0a] py-16 sm:py-24 md:py-40">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-16">
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5 lg:pt-12">
              <div className="mb-6 sm:mb-8 inline-block">
                <div className="h-px w-12 sm:w-16 bg-white/40"></div>
              </div>
              <h2 className="mb-6 sm:mb-8 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-white">
                Stronger Together
              </h2>
              <div className="mb-8 sm:mb-10 border-l-2 border-white/30 pl-4 sm:pl-6">
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light leading-tight text-white">
                  Shared problems require coordination to solve. Many issues which effect us together require us to act together.
                </h3>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <p className="text-sm sm:text-base leading-relaxed text-white/75 lg:text-lg">
                  When we want to act together but fear being the only ones to act, we remain silent. This creates a terrible trap, where despite everyone wanting change, no one acts to bring it about.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-white/75 lg:text-lg">
                  Our <span className="font-medium text-white">anonymous credible commitments</span> solve this by allowing people to commit privately and reveal conditionally, only making their support known when enough other people have also committed.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-white/75 lg:text-lg">
                  You set your own commitment threshold; the minimum number of other people revealing their commitment before you will reveal yours. This transforms collective action from a leap of faith into a calculated decision done together.
                </p>
              </div>
              <div className="mt-8 sm:mt-12 grid grid-cols-2 gap-4 sm:gap-8 border-t border-white/10 pt-6 sm:pt-8">
                <div className="group">
                  <div className="mb-2 text-2xl sm:text-3xl font-light text-white transition-colors group-hover:text-white/80">Anonymous</div>
                  <div className="text-xs sm:text-sm uppercase tracking-wider text-white/60">Until Collective</div>
                </div>
                <div className="group">
                  <div className="mb-2 text-2xl sm:text-3xl font-light text-white transition-colors group-hover:text-white/80">Credible</div>
                  <div className="text-xs sm:text-sm uppercase tracking-wider text-white/60">Mathematical Guarantee</div>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block lg:col-span-7">
              <div className="relative h-[500px] lg:h-[650px]">
                <div className="absolute right-0 top-0 h-[85%] w-[90%] overflow-hidden border border-white/20 bg-white/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-slate-900/50"></div>
                  <Image
                    src="/assets/mission-image.jpg"
                    alt="Coordination Challenges"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 w-[45%] border border-white/30 bg-[#0a0a0a]/95 p-8 backdrop-blur-md">
                  <div className="mb-3 text-xs uppercase tracking-[0.1em] text-white/50">Our Solution</div>
                  <div className="text-base leading-relaxed text-white/90">
                    Mathematical guarantees that you'll only be revealed when your threshold is met
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="relative overflow-hidden bg-[#111111] py-16 sm:py-24 md:py-40">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/5 to-transparent"></div>
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-16">
          <div className="mb-12 sm:mb-16">
            <div className="mb-4 sm:mb-6 inline-block">
              <div className="h-px w-12 sm:w-16 bg-white/40"></div>
            </div>
            <h2 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-white">
              Real-World Applications
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-white/70 lg:text-xl max-w-3xl">
              These coordination problems exist everywhere people need to act together but fear going first.
            </p>
          </div>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {useCases.map((useCase, idx) => {
              const Icon = useCase.icon;
              const colorMap = {
                blue: "from-blue-500/20",
                purple: "from-purple-500/20",
                red: "from-red-500/20"
              };
              return (
                <div
                  key={idx}
                  onClick={() => {
                    window.scrollTo(0, 0);
                    router.push(`/blog/${useCase.slug}`);
                  }}
                  onMouseEnter={() => setHoveredCard(idx)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group relative overflow-hidden rounded-xl border border-white/20 bg-white/5 p-6 sm:p-8 md:p-10 transition-all hover:border-white/40 cursor-pointer"
                >
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[useCase.color as keyof typeof colorMap]} pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  {/* Hover darkening */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex-grow mb-6">
                      <div className="h-12 w-12 md:h-16 md:w-16 flex items-center justify-center">
                        <Icon className={`w-8 h-8 md:w-10 md:h-10 text-white/60 group-hover:text-white transition-colors`} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <h3 className="text-[20px] md:text-[24px] font-light tracking-wide text-white group-hover:translate-x-1 transition-transform">
                        {useCase.title}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">→</span>
                      </h3>
                      <p className="text-sm leading-relaxed text-white/70">
                        {useCase.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-[#0a0a0a] py-16 sm:py-24 md:py-40">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-16">
          <div className="mb-12 sm:mb-16 md:mb-24">
            <div className="mb-4 sm:mb-6 inline-block">
              <div className="h-px w-12 sm:w-16 bg-white/40"></div>
            </div>
            <h2 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-white">
              How It Works
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-white/70 lg:text-xl max-w-3xl">
              A mathematical solution to the coordination problem. Commit privately, reveal conditionally.
            </p>
          </div>

          {/* Steps */}
          <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12 sm:mb-16 md:mb-24">
            {steps.map((step, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-xl border border-white/20 bg-white/5 p-6 sm:p-8 transition-all hover:border-white/40">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="mb-4 sm:mb-6 text-4xl sm:text-5xl font-light text-white/20 group-hover:text-white/40 transition-colors">
                    {step.number}
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-light tracking-wide text-white mb-3 sm:mb-4 group-hover:translate-x-1 transition-transform">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-white/70">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mathematical Explanation */}
          <div className="border border-white/20 bg-white/5 p-6 sm:p-8 lg:p-12 backdrop-blur-sm">
            <h3 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-light tracking-wide text-white">
              Cryptographic Guarantees
            </h3>
            <p className="mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed text-white/70 max-w-3xl">
              Our encryption scheme ensures that commitments remain anonymous until thresholds are met, while providing mathematical proof that each commitment is genuine and cannot be revoked.
            </p>
            
            {/* Feature Blocks */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="border border-white/20 bg-white/5 p-4 sm:p-6">
                <h4 className="font-light text-sm sm:text-base text-white mb-2">Irrevocable Commitment</h4>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  Once a commitment is made, is cannot be withdrawn or changed.
                </p>
              </div>
              <div className="border border-white/20 bg-white/5 p-4 sm:p-6">
                <h4 className="font-light text-sm sm:text-base text-white mb-2">Encrypted Publication</h4>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  You data is published in an encrypted way, which cannot be decrypted until your threshold is met.
                </p>
              </div>
              <div className="border border-white/20 bg-white/5 p-4 sm:p-6">
                <h4 className="font-light text-sm sm:text-base text-white mb-2">Reveal With Others</h4>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  The moment your threshold is met, your data is revealed to the world along with everyone else who has met their threshold.
                </p>
              </div>
            </div>

            <div className="pt-4 sm:pt-6 border-t border-white/10">
              <Link 
                href="/blog/mathematical-details"
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 border border-white/20 bg-white/5 text-white font-light text-xs uppercase tracking-[0.15em] transition hover:border-white/40 hover:bg-white/10 no-underline"
              >
                Find More Mathematical Details
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section id="get-started" className="relative overflow-hidden bg-[#111111] py-16 sm:py-24 md:py-40">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-white/5 to-transparent"></div>
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-16">
          <div className="mb-12 sm:mb-16">
            <div className="mb-4 sm:mb-6 inline-block">
              <div className="h-px w-12 sm:w-16 bg-white/40"></div>
            </div>
            <h2 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-white">
              Ready to Coordinate?
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-white/70 lg:text-xl max-w-3xl">
              Choose your path based on what you need to do
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            <Link 
              href="/create_objective"
              className="group relative overflow-hidden rounded-xl border border-white/20 bg-white/5 p-8 md:p-10 transition-all hover:border-white/40 no-underline"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex-grow mb-6">
                  <div className="h-12 w-12 md:h-16 md:w-16 flex items-center justify-center">
                    <Plus className="w-8 h-8 md:w-10 md:h-10 text-white/60 group-hover:text-white transition-colors" />
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="text-[20px] md:text-[24px] font-light tracking-wide text-white group-hover:translate-x-1 transition-transform">
                    Create an Objective
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">→</span>
                  </h3>
                  <p className="text-sm leading-relaxed text-white/70">
                    Start a new coordination effort. Define the goal, set parameters, and invite people to commit.
                  </p>
                </div>
              </div>
            </Link>

            <Link 
              href="/commit"
              className="group relative overflow-hidden rounded-xl border border-white/20 bg-white/5 p-8 md:p-10 transition-all hover:border-white/40 no-underline"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex-grow mb-6">
                  <div className="h-12 w-12 md:h-16 md:w-16 flex items-center justify-center">
                    <FileSignature className="w-8 h-8 md:w-10 md:h-10 text-white/60 group-hover:text-white transition-colors" />
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="text-[20px] md:text-[24px] font-light tracking-wide text-white group-hover:translate-x-1 transition-transform">
                    Make a Commitment
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">→</span>
                  </h3>
                  <p className="text-sm leading-relaxed text-white/70">
                    Join an existing objective. Set your threshold and commit anonymously until the threshold is met.
                  </p>
                </div>
              </div>
            </Link>

            <Link 
              href="/objective"
              className="group relative overflow-hidden rounded-xl border border-white/20 bg-white/5 p-8 md:p-10 transition-all hover:border-white/40 no-underline"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex-grow mb-6">
                  <div className="h-12 w-12 md:h-16 md:w-16 flex items-center justify-center">
                    <List className="w-8 h-8 md:w-10 md:h-10 text-white/60 group-hover:text-white transition-colors" />
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="text-[20px] md:text-[24px] font-light tracking-wide text-white group-hover:translate-x-1 transition-transform">
                    Browse Objectives
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">→</span>
                  </h3>
                  <p className="text-sm leading-relaxed text-white/70">
                    Explore active coordination efforts. Find causes that matter to you and see what's gaining momentum.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20 bg-[#0a0a0a]/80 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 sm:py-14 lg:px-16">
          <div className="grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-6 text-white/70">
              <div className="flex flex-col gap-3 text-xs uppercase tracking-[0.15em]">
                <p className="text-lg uppercase tracking-[0.1em] text-white/60 mb-2">AC2</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Collaborate With Full Privacy
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-xs uppercase tracking-[0.1em] text-white/60">Navigate</p>
              <nav className="flex flex-col gap-3 text-sm uppercase tracking-[0.15em] text-white/70">
                <a href="#problem" className="transition hover:text-white no-underline">The Problem</a>
                <a href="#how-it-works" className="transition hover:text-white no-underline">How It Works</a>
                <a href="#get-started" className="transition hover:text-white no-underline">Get Started</a>
              </nav>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-xs uppercase tracking-[0.1em] text-white/60">Resources</p>
              <nav className="flex flex-col gap-3 text-sm uppercase tracking-[0.15em] text-white/70">
                <Link href="/objective" className="transition hover:text-white no-underline">Objectives</Link>
                <Link href="/recently_published" className="transition hover:text-white no-underline">Recent</Link>
              </nav>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-xs uppercase tracking-[0.1em] text-white/60">Legal</p>
              <nav className="flex flex-col gap-3 text-sm uppercase tracking-[0.15em] text-white/70">
                <Link href="/privacy" className="transition hover:text-white no-underline">Privacy</Link>
                <Link href="/terms" className="transition hover:text-white no-underline">Terms</Link>
              </nav>
            </div>
          </div>
          <div className="mt-8 sm:mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-center sm:text-right text-xs uppercase tracking-[0.15em] text-white/50 sm:flex-row sm:items-center sm:justify-end">
            <span>© 2025 AC2. Empowering collaboration through cryptographic trust.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}