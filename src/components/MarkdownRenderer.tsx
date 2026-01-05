/**
 * Markdown Renderer Component
 * Renders markdown with code highlighting, tables, and custom styling
 */

'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight, rehypeRaw]}
      components={{
        // Code blocks
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <div className="my-4">
              <div className="bg-white/5 rounded-t-lg px-4 py-2 text-xs text-white/60 border-b border-white/10">
                {match[1]}
              </div>
              <pre className="bg-black/30 rounded-b-lg p-4 overflow-x-auto scrollbar-hide">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            </div>
          ) : (
            <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          );
        },
        // Tables
        table({ children, ...props }) {
          return (
            <div className="my-4 overflow-x-auto scrollbar-hide">
              <table className="min-w-full border-collapse border border-white/20 rounded-lg overflow-hidden" {...props}>
                {children}
              </table>
            </div>
          );
        },
        thead({ children, ...props }) {
          return (
            <thead className="bg-white/10" {...props}>
              {children}
            </thead>
          );
        },
        th({ children, ...props }) {
          return (
            <th className="border border-white/20 px-4 py-2 text-left font-semibold" {...props}>
              {children}
            </th>
          );
        },
        td({ children, ...props }) {
          return (
            <td className="border border-white/20 px-4 py-2" {...props}>
              {children}
            </td>
          );
        },
        // Horizontal rule / divider
        hr({ ...props }) {
          return <hr className="my-6 border-white/20" {...props} />;
        },
        // Headings
        h1({ children, ...props }) {
          return (
            <h1 className="text-2xl font-bold mt-6 mb-3" {...props}>
              {children}
            </h1>
          );
        },
        h2({ children, ...props }) {
          return (
            <h2 className="text-xl font-bold mt-5 mb-2" {...props}>
              {children}
            </h2>
          );
        },
        h3({ children, ...props }) {
          return (
            <h3 className="text-lg font-semibold mt-4 mb-2" {...props}>
              {children}
            </h3>
          );
        },
        // Lists
        ul({ children, ...props }) {
          return (
            <ul className="list-disc list-inside my-3 space-y-1" {...props}>
              {children}
            </ul>
          );
        },
        ol({ children, ...props }) {
          return (
            <ol className="list-decimal list-inside my-3 space-y-1" {...props}>
              {children}
            </ol>
          );
        },
        // Blockquotes
        blockquote({ children, ...props }) {
          return (
            <blockquote className="border-l-4 border-white/30 pl-4 my-3 italic text-white/80" {...props}>
              {children}
            </blockquote>
          );
        },
        // Links
        a({ children, href, ...props }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
              {...props}
            >
              {children}
            </a>
          );
        },
        // Paragraphs
        p({ children, ...props }) {
          return (
            <p className="my-2 leading-relaxed" {...props}>
              {children}
            </p>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
