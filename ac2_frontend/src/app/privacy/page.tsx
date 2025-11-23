'use client';

import { useLayoutEffect } from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
          </div>

          {/* Legal Content */}
          <article className="border border-white/20 bg-white/5 p-6 sm:p-8 lg:p-12 backdrop-blur-sm">
            <div className="legal-content text-white/80">
              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4 first:mt-0">1. Introduction</h2>
                <p className="mb-4">
                  AC2 ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
                </p>
                <p className="mb-4">
                  By using our website or services, you consent to the data practices described in this policy. If you do not agree with the practices described in this policy, please do not use our services.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">2. Information We Collect</h2>
                <h3 className="text-xl font-light text-white mt-6 mb-3">2.1 Information You Provide</h3>
                <p className="mb-4">
                  We collect information that you voluntarily provide to us, including:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                  <li>Contact information (name, email address, phone number)</li>
                  <li>Company information and job title</li>
                  <li>Messages and communications you send to us</li>
                  <li>Information provided when you request a demo or consultation</li>
                </ul>
                <h3 className="text-xl font-light text-white mt-6 mb-3">2.2 Automatically Collected Information</h3>
                <p className="mb-4">
                  When you visit our website, we may automatically collect certain information, including:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                  <li>IP address and browser type</li>
                  <li>Device information and operating system</li>
                  <li>Pages visited and time spent on pages</li>
                  <li>Referring website addresses</li>
                  <li>Usage patterns and preferences</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">3. How We Use Your Information</h2>
                <p className="mb-4">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                  <li>To provide, maintain, and improve our services</li>
                  <li>To respond to your inquiries and provide customer support</li>
                  <li>To send you updates, newsletters, and marketing communications (with your consent)</li>
                  <li>To analyze website usage and improve user experience</li>
                  <li>To detect, prevent, and address technical issues and security threats</li>
                  <li>To comply with legal obligations and protect our rights</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">4. Information Sharing and Disclosure</h2>
                <p className="mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                  <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our website and conducting our business, subject to confidentiality agreements.</li>
                  <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal requests.</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
                  <li><strong>With Your Consent:</strong> We may share information with your explicit consent.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">5. Data Security</h2>
                <p className="mb-4">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">6. Your Rights</h2>
                <p className="mb-4">
                  Depending on your location, you may have certain rights regarding your personal information, including:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
                  <li>The right to access your personal information</li>
                  <li>The right to correct inaccurate information</li>
                  <li>The right to request deletion of your information</li>
                  <li>The right to object to processing of your information</li>
                  <li>The right to data portability</li>
                  <li>The right to withdraw consent</li>
                </ul>
                <p className="mb-4">
                  To exercise these rights, please contact us at <a href="mailto:hello@ac2.com" className="text-white underline hover:text-white/80">hello@ac2.com</a>.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">7. Cookies and Tracking Technologies</h2>
                <p className="mb-4">
                  We use cookies and similar tracking technologies to collect and store information about your preferences and activity on our website. You can control cookie preferences through your browser settings, though this may affect website functionality.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">8. Third-Party Links</h2>
                <p className="mb-4">
                  Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">9. Children's Privacy</h2>
                <p className="mb-4">
                  Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">10. International Data Transfers</h2>
                <p className="mb-4">
                  Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. By using our services, you consent to such transfers.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">11. Changes to This Privacy Policy</h2>
                <p className="mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white mt-8 mb-4">12. Contact Us</h2>
                <p className="mb-4">
                  If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
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

