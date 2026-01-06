/**
 * Help Center Page
 * Displays help documentation and FAQs
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Calendar, FileText, HelpCircle, Download, Clock, Search, Rocket, GraduationCap, BookOpen, MessageCircle, Settings, Mail, Lightbulb, Shield } from 'lucide-react';
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

export default function HelpPage() {
  const router = useRouter();
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHelp();
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

  const fetchHelp = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/legal/HELP_CENTER`);
      const data = await response.json();

      if (data.success) {
        setDocument(data.data);
      } else {
        setError('Help documentation not found');
      }
    } catch (err) {
      console.error('Failed to fetch help:', err);
      setError('Failed to load help center');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading help center...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <HelpCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Help Not Available</h1>
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
    { id: 'getting-started', title: 'Getting Started', Icon: Rocket },
    { id: 'for-teachers', title: 'For Teachers', Icon: GraduationCap },
    { id: 'for-students', title: 'For Students', Icon: BookOpen },
    { id: 'using-ai-chat', title: 'Using AI Chat', Icon: MessageCircle },
    { id: 'common-questions', title: 'Common Questions', Icon: Settings },
    { id: 'contact-support', title: 'Contact Support', Icon: Mail },
    { id: 'pro-tips', title: 'Pro Tips & Tricks', Icon: Lightbulb },
    { id: 'safety-security', title: 'Safety & Security', Icon: Shield },
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
              <HelpCircle size={18} className="text-white/40" />
              <span className="text-sm font-semibold">{document.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs focus:outline-none focus:border-white/20 transition-colors w-48"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-16 flex max-w-[1400px] mx-auto">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-64 fixed left-0 top-16 bottom-0 border-r border-white/10 overflow-y-auto">
          <div className="p-6">
            {/* Quick Links */}
            <div className="mb-8 pb-6 border-b border-white/10">
              <div className="text-xs text-white/40 mb-3">QUICK LINKS</div>
              <div className="space-y-2">
                <a href="mailto:support@knovera.com" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                  Email Support
                </a>
                <a href="/privacy-policy" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                  Privacy Policy
                </a>
                <a href="/terms" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                  Terms of Service
                </a>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="mb-4">
              <div className="text-xs text-white/40 mb-3">BROWSE TOPICS</div>
              <nav className="space-y-1">
                {sections.map((section) => {
                  const IconComponent = section.Icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                        activeSection === section.id
                          ? 'bg-white/10 text-white font-medium'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <IconComponent size={14} />
                      {section.title}
                    </button>
                  );
                })}
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
                <span className="text-xs text-white/60">Support Documentation</span>
              </div>
              <h1 className="text-5xl font-bold mb-4 tracking-tight">{document.title}</h1>
              {document.summary && (
                <div className="max-w-2xl bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-purple-500/10 border border-white/20 rounded-xl p-6">
                  <p className="text-lg text-white/90 leading-relaxed">
                    {document.summary}
                  </p>
                </div>
              )}

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-white/10">
                <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-purple-500/10 border border-white/20 rounded-lg px-6 py-4">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-xs text-white/40 mt-1">Support Available</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-purple-500/10 border border-white/20 rounded-lg px-6 py-4">
                  <div className="text-2xl font-bold">&lt;24h</div>
                  <div className="text-xs text-white/40 mt-1">Response Time</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-purple-500/10 border border-white/20 rounded-lg px-6 py-4">
                  <div className="text-2xl font-bold">v{document.version}</div>
                  <div className="text-xs text-white/40 mt-1">Documentation</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div 
              ref={contentRef}
              className="prose prose-invert max-w-none
                prose-headings:font-semibold prose-headings:tracking-tight
                prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:scroll-mt-24
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-3
                prose-p:text-white/70 prose-p:leading-relaxed prose-p:text-base
                prose-li:text-white/70 prose-li:leading-relaxed
                prose-strong:text-white prose-strong:font-semibold
                prose-a:text-white prose-a:underline prose-a:decoration-white/30 hover:prose-a:decoration-white
                prose-ul:my-4 prose-ol:my-4
                prose-hr:border-white/10 prose-hr:my-12
                prose-code:text-white/90 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
            >
              <MarkdownRenderer content={document.content} />
            </div>

            {/* Footer CTAs */}
            <div className="mt-20 pt-12 border-t border-white/10 grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-purple-500/10 border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Mail size={20} className="text-white" />
                  <h3 className="text-lg font-semibold">Still Need Help?</h3>
                </div>
                <p className="text-white/60 text-sm mb-4">
                  Our support team is standing by to assist you.
                </p>
                <a 
                  href="mailto:support@knovera.com"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium text-sm hover:bg-white/90 transition-colors"
                >
                  <span>Contact Support</span>
                  <ArrowLeft size={14} className="rotate-180" />
                </a>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-purple-500/10 border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={20} className="text-white" />
                  <h3 className="text-lg font-semibold">Feature Requests</h3>
                </div>
                <p className="text-white/60 text-sm mb-4">
                  Have an idea? We'd love to hear your feedback.
                </p>
                <a 
                  href="mailto:feedback@knovera.com"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 text-white rounded-lg font-medium text-sm hover:bg-white/5 transition-colors"
                >
                  <span>Share Feedback</span>
                  <ArrowLeft size={14} className="rotate-180" />
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
