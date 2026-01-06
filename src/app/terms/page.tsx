/**
 * Terms of Service Page
 * Displays the active terms of service document
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Calendar, FileText, Download, Clock, Scale } from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface LegalDocument {
  id: string;
  type: string;
  title: string;
  content: string;
  version: string;
  effectiveDate: string;
  summary?: string;
  lastReviewedAt?: string;
}

export default function TermsPage() {
  const router = useRouter();
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTerms();
  }, []);

  useEffect(() => {
    if (!document) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    const headings = contentRef.current?.querySelectorAll('h2[id]');
    headings?.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [document]);

  const fetchTerms = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/legal/TERMS_OF_SERVICE`);
      const data = await response.json();

      if (data.success) {
        setDocument(data.data);
      } else {
        setError('Terms of service not found');
      }
    } catch (err) {
      console.error('Failed to fetch terms:', err);
      setError('Failed to load terms of service');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading terms of service...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <FileText className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Terms Not Available</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'acceptance-terms', title: 'Acceptance of Terms' },
    { id: 'user-accounts', title: 'User Accounts' },
    { id: 'acceptable-use', title: 'Acceptable Use' },
    { id: 'intellectual-property', title: 'Intellectual Property' },
    { id: 'ai-features', title: 'AI-Powered Features' },
    { id: 'teacher-terms', title: 'Teacher-Specific Terms' },
    { id: 'student-terms', title: 'Student-Specific Terms' },
    { id: 'payments', title: 'Payments and Subscriptions' },
    { id: 'privacy-data', title: 'Privacy and Data' },
    { id: 'disclaimers', title: 'Disclaimers and Limitations' },
    { id: 'dispute-resolution', title: 'Dispute Resolution' },
    { id: 'changes-terms', title: 'Changes to Terms' },
  ];

  const scrollToSection = (id: string) => {
    const element = window.document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-b border-white/10 z-50">
        <div className="h-full max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <Scale size={18} className="text-white/40" />
              <span className="text-sm font-semibold">{document.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-white/40">v{document.version}</div>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Download size={16} className="text-white/60" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-16 flex max-w-[1400px] mx-auto">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-64 fixed left-0 top-16 bottom-0 border-r border-white/10 overflow-y-auto">
          <div className="p-6">
            {/* Metadata */}
            <div className="mb-8 pb-6 border-b border-white/10">
              <div className="text-xs text-white/40 mb-3">DOCUMENT INFO</div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-white/40 mb-1">
                    <Calendar size={12} />
                    <span className="text-xs">Effective</span>
                  </div>
                  <div className="text-xs text-white/80">
                    {new Date(document.effectiveDate).toLocaleDateString('en-US', { 
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-white/40 mb-1">
                    <Clock size={12} />
                    <span className="text-xs">Version</span>
                  </div>
                  <div className="text-xs text-white/80">{document.version}</div>
                </div>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="mb-4">
              <div className="text-xs text-white/40 mb-3">TABLE OF CONTENTS</div>
              <nav className="space-y-1">
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      activeSection === section.id
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-white/40 mr-2">{String(index + 1).padStart(2, '0')}</span>
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 lg:ml-64">
          <div className="max-w-3xl mx-auto px-6 py-12">
            {/* Hero */}
            <div className="mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                <span className="text-xs text-white/60">Legal Agreement</span>
              </div>
              <h1 className="text-5xl font-bold mb-4 tracking-tight">{document.title}</h1>
              {document.summary && (
                <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
                  {document.summary}
                </p>
              )}
            </div>

            {/* Content */}
            <div 
              ref={contentRef}
              className="prose prose-invert max-w-none
                prose-headings:font-semibold prose-headings:tracking-tight
                prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:scroll-mt-24
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-white/70 prose-p:leading-relaxed prose-p:text-base
                prose-li:text-white/70 prose-li:leading-relaxed
                prose-strong:text-white prose-strong:font-semibold
                prose-a:text-white prose-a:underline prose-a:decoration-white/30 hover:prose-a:decoration-white
                prose-ul:my-4 prose-ol:my-4
                prose-hr:border-white/10 prose-hr:my-12"
            >
              <MarkdownRenderer content={document.content} />
            </div>

            {/* Footer */}
            <div className="mt-20 pt-12 border-t border-white/10">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h3 className="text-lg font-semibold mb-3">Questions About Our Terms?</h3>
                <p className="text-white/60 mb-6">
                  Our legal team is here to help clarify any questions you may have.
                </p>
                <a 
                  href="mailto:legal@knovera.com"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors"
                >
                  <span>Contact Legal Team</span>
                  <ArrowLeft size={16} className="rotate-180" />
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
