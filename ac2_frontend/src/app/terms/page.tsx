'use client';

import { useLayoutEffect } from 'react';
import Link from 'next/link';

export default function TermsPage() {
  // Scroll to top when the page loads
  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

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
        <div className="mt-12 sm:mt-20 md:mt-32">
          {/* Section Header */}
          <div className="mb-8 sm:mb-12">
            <div className="mb-4 sm:mb-6 inline-block">
              <div className="h-px w-12 sm:w-16 bg-white/40"></div>
            </div>
            <div className="text-xs uppercase tracking-[0.15em] text-white/50 mb-4">
              Last updated: November 2025
            </div>
            <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-white">
              Terms of Service
            </h1>
          </div>

          {/* Legal Content */}
          <article className="border border-white/20 bg-white/5 p-6 sm:p-8 lg:p-12 backdrop-blur-sm">
            <div className="legal-content text-white/80">
              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4 first:mt-0">1. Acceptance of Terms</h2>
                <p className="mb-4">
                  By accessing or using the AC2 website and services (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
                </p>
                <p className="mb-4">
                  These Terms constitute a legally binding agreement between you and AC2 ("we," "us," or "our"). We reserve the right to modify these Terms at any time, and such modifications shall be effective immediately upon posting.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">2. Description of Service</h2>
                <p className="mb-4">
                  AC2 provides anonymous credible commitment services that enable collective action and coordination. Our services include but are not limited to:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                  <li>Anonymous commitment submission and management</li>
                  <li>Threshold-based revelation of commitments</li>
                  <li>Objective creation and tracking</li>
                  <li>Cryptographic security and privacy protection</li>
                </ul>
                <p className="mb-4">
                  We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time without prior notice.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">3. Use of Service</h2>
                <h3 className="text-xl font-light text-white mt-6 mb-3">3.1 Eligibility</h3>
                <p className="mb-4">
                  You must be at least 18 years old and have the legal capacity to enter into these Terms. By using the Service, you represent and warrant that you meet these requirements.
                </p>

                <h3 className="text-xl font-light text-white mt-6 mb-3">3.2 Acceptable Use</h3>
                <p className="mb-4">
                  You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon the rights of others</li>
                  <li>Transmit any malicious code, viruses, or harmful content</li>
                  <li>Attempt to gain unauthorized access to the Service or related systems</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Use the Service to develop competing products or services</li>
                  <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">4. Account Registration</h2>
                <p className="mb-4">
                  Some features of the Service may require you to create an account. You agree to:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your account information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">5. Intellectual Property</h2>
                <h3 className="text-xl font-light text-white mt-6 mb-3">5.1 Our Intellectual Property</h3>
                <p className="mb-4">
                  The Service, including all content, features, functionality, software, and materials, is owned by AC2 and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
                </p>

                <h3 className="text-xl font-light text-white mt-6 mb-3">5.2 Your Content</h3>
                <p className="mb-4">
                  You retain ownership of any content, data, or materials you provide to the Service. By providing such content, you grant us a non-exclusive, worldwide, royalty-free license to use, process, and store your content solely for the purpose of providing and improving the Service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">6. Payment Terms</h2>
                <p className="mb-4">
                  If you purchase a paid subscription or service:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                  <li>You agree to pay all fees as specified in your subscription plan</li>
                  <li>Fees are billed in advance on a recurring basis</li>
                  <li>All fees are non-refundable except as required by law</li>
                  <li>We reserve the right to change our pricing with reasonable notice</li>
                  <li>Failure to pay may result in suspension or termination of your account</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">7. Service Level and Availability</h2>
                <p className="mb-4">
                  We strive to provide reliable and secure services but do not guarantee uninterrupted or error-free operation. The Service is provided "as is" and "as available." We are not liable for any downtime, interruptions, or data loss that may occur.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">8. Disclaimers</h2>
                <p className="mb-4">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                </p>
                <p className="mb-4">
                  We do not warrant that the Service will be uninterrupted, secure, or error-free, or that defects will be corrected. We do not guarantee the accuracy, completeness, or usefulness of any information provided through the Service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">9. Limitation of Liability</h2>
                <p className="mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, AC2 SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE.
                </p>
                <p className="mb-4">
                  Our total liability for any claims arising from or related to the Service shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">10. Indemnification</h2>
                <p className="mb-4">
                  You agree to indemnify, defend, and hold harmless AC2 and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or in any way connected with:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                  <li>Your use of the Service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any rights of another party</li>
                  <li>Any content or data you submit through the Service</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">11. Termination</h2>
                <p className="mb-4">
                  We may terminate or suspend your access to the Service immediately, without prior notice, for any reason, including if you breach these Terms. Upon termination:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                  <li>Your right to use the Service will immediately cease</li>
                  <li>We may delete your account and associated data</li>
                  <li>All provisions of these Terms that by their nature should survive termination shall survive</li>
                </ul>
                <p className="mb-4">
                  You may terminate your account at any time by contacting us at <a href="mailto:hello@ac2.com" className="text-white underline hover:text-white/80">hello@ac2.com</a>.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">12. Governing Law and Dispute Resolution</h2>
                <p className="mb-4">
                  These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions. Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts of England and Wales.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">13. Severability</h2>
                <p className="mb-4">
                  If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">14. Entire Agreement</h2>
                <p className="mb-4">
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and AC2 regarding the Service and supersede all prior agreements and understandings.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">15. Contact Information</h2>
                <p className="mb-4">
                  If you have questions about these Terms, please contact us at:
                </p>
                <p className="mb-4">
                  <strong>AC2</strong><br />
                  Email: <a href="mailto:hello@ac2.com" className="text-white underline hover:text-white/80">hello@ac2.com</a>
                </p>
              </div>
            </div>
          </article>
        </div>
      </main>

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
                <a href="/#problem" className="transition hover:text-white no-underline">The Problem</a>
                <a href="/#how-it-works" className="transition hover:text-white no-underline">How It Works</a>
                <a href="/#get-started" className="transition hover:text-white no-underline">Get Started</a>
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

