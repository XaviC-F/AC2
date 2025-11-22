'use client'

import { useState } from 'react';
import { Shield, Users, Eye, EyeOff, Lock, Unlock, ChevronRight, Plus, List, FileSignature, ArrowRight } from 'lucide-react';

export default function AC2Homepage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const useCases = [
    {
      title: "Labor Organizing",
      description: "Amazon workers want to unionize, but only if they know 10,000+ others will join them. Without this certainty, individuals risk retaliation while the effort fails.",
      icon: Users,
      color: "blue"
    },
    {
      title: "Political Change",
      description: "Citizens in an authoritarian regime oppose the government but won't speak out unless they know the majority shares their views. Fear of being the only dissenter keeps everyone silent.",
      icon: Shield,
      color: "purple"
    },
    {
      title: "Speaking Truth to Power",
      description: "Harvey Weinstein's victims knew they weren't alone, but each woman feared going public without others. The first to speak out faced the full weight of his power and disbelief.",
      icon: Lock,
      color: "red"
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
      title: "Choose Your Threshold (k)",
      description: "Decide how many people need to commit before you're willing to be revealed. This is your personal safety number - maybe you need 100 people, maybe 10,000."
    },
    {
      number: 3,
      title: "Make Your Commitment",
      description: "Submit your commitment to the objective. You remain completely anonymous until your threshold k is reached."
    },
    {
      number: 4,
      title: "Revelation in Waves",
      description: "As more people commit, those with lower k values are revealed first. If 500 people commit, everyone who set k ≤ 500 is revealed together. Higher thresholds wait for more commitments."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
              AC2
            </h1>
            <p className="text-2xl text-blue-200 mb-4 font-light">
              Anonymous Credible Commitments
            </p>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Break free from coordination traps. Commit to collective action only when you know others will too. 
              Solve the problem that keeps people silent when they want to act together.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg backdrop-blur-sm transition-all">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* The Problem Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              The Coordination Problem
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Critical collective actions fail not because people don't want to act, but because they don't know if others will act with them.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, idx) => {
              const Icon = useCase.icon;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredCard(idx)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border-2 transition-all duration-300 ${
                    hoveredCard === idx
                      ? 'border-blue-500 transform scale-105'
                      : 'border-slate-700'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-xl bg-${useCase.color}-500/20 flex items-center justify-center mb-6`}>
                    <Icon className={`w-8 h-8 text-${useCase.color}-400`} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {useCase.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {useCase.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How Anonymous Credible Commitments Work
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              A mathematical solution to the coordination problem. Commit privately, reveal conditionally.
            </p>
          </div>

          {/* Visual Process */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border-2 border-slate-700">
              <div className="space-y-8">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-slate-300 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mathematical Explanation */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border-2 border-blue-500/30 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              The Mathematics of Revelation
            </h3>
            <div className="grid md:grid-cols-2 gap-8 text-slate-200">
              <div>
                <h4 className="font-semibold text-lg text-blue-300 mb-3">Individual Thresholds</h4>
                <p className="mb-4">
                  Each person <span className="font-mono bg-slate-800/50 px-2 py-1 rounded">i</span> sets their own threshold <span className="font-mono bg-slate-800/50 px-2 py-1 rounded">k_i</span> — the minimum number of total commitments needed before they're willing to be revealed.
                </p>
                <p className="text-sm text-slate-400">
                  Example: Alice sets k=100, Bob sets k=1000, Carol sets k=500
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg text-blue-300 mb-3">Cascading Revelation</h4>
                <p className="mb-4">
                  When the total number of commitments reaches <span className="font-mono bg-slate-800/50 px-2 py-1 rounded">n</span>, all users with <span className="font-mono bg-slate-800/50 px-2 py-1 rounded">k_i ≤ n</span> are revealed simultaneously in a wave.
                </p>
                <p className="text-sm text-slate-400">
                  At 100 commitments: Alice revealed. At 500: Carol revealed. At 1000: Bob revealed.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-blue-500/30">
              <div className="bg-slate-800/50 rounded-xl p-6">
                <p className="text-center text-slate-300 leading-relaxed">
                  <strong className="text-white">Key insight:</strong> You never reveal yourself unless you know at least <span className="font-mono bg-slate-700 px-2 py-1 rounded">k-1</span> other people have also committed. This transforms collective action from a leap of faith into a calculated decision.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Coordinate?
            </h2>
            <p className="text-xl text-slate-300">
              Choose your path based on what you need to do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border-2 border-slate-700 hover:border-blue-500 transition-all group">
              <div className="w-16 h-16 rounded-xl bg-green-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Create an Objective
              </h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Start a new coordination effort. Define the goal, set parameters, and invite people to commit.
              </p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                Create Form
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border-2 border-slate-700 hover:border-blue-500 transition-all group">
              <div className="w-16 h-16 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileSignature className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Make a Commitment
              </h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Join an existing objective. Set your threshold and commit anonymously until the threshold is met.
              </p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                Commit Now
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border-2 border-slate-700 hover:border-blue-500 transition-all group">
              <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <List className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Browse Objectives
              </h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Explore active coordination efforts. Find causes that matter to you and see what's gaining momentum.
              </p>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                View All
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold text-white mb-2">AC2</div>
              <p className="text-slate-400">
                Breaking coordination traps through credible commitments
              </p>
            </div>
            <div className="flex gap-6 text-slate-400">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">How It Works</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="text-center mt-8 text-slate-500 text-sm">
            © 2025 AC2. Empowering collective action through mathematical trust.
          </div>
        </div>
      </div>
    </div>
  );
}
