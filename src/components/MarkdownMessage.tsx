'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MarkdownMessageProps = {
  content: string;
  role: 'user' | 'assistant';
  onQuickReply?: (text: string) => void;
};

export default function MarkdownMessage({ content, role, onQuickReply }: MarkdownMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Extract follow-up questions from the end of AI messages
  const extractFollowUps = (text: string): { mainContent: string; followUps: string[] } => {
    if (role !== 'assistant') return { mainContent: text, followUps: [] };

    // Look for common follow-up patterns at the end
    const patterns = [
      /(?:Would you like|Want to|Should I|Do you want|Interested in)[^?]*\?/gi,
      /(?:What|How|Why|When|Where|Which)[^?]*\?$/gim,
    ];

    const followUps: string[] = [];
    let mainContent = text;

    // Extract last 2 questions as follow-ups
    const questions = text.match(/[^.!?]*\?/g) || [];
    if (questions.length >= 2) {
      const lastTwo = questions.slice(-2);
      followUps.push(...lastTwo.map(q => q.trim()));
      
      // Remove follow-ups from main content
      lastTwo.forEach(q => {
        mainContent = mainContent.replace(q, '');
      });
    }

    return { mainContent: mainContent.trim(), followUps };
  };

  const { mainContent, followUps } = extractFollowUps(content);

  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl px-6 py-4 bg-accent-yellow text-text-primary">
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%]">
        <div className="rounded-2xl px-6 py-4 bg-white text-text-primary relative group shadow-sm">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 rounded-lg bg-white/80 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            title="Copy message"
          >
            {copied ? (
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          {/* Markdown Content */}
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Headings
                h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                
                // Paragraphs
                p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                
                // Lists
                ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />,
                li: ({ node, ...props }) => <li className="ml-4" {...props} />,
                
                // Strong/Bold
                strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                
                // Code blocks
                code: ({ node, inline, className, children, ...props }: any) => {
                  if (inline) {
                    return (
                      <code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className="block bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
                
                // Links
                a: ({ node, ...props }) => (
                  <a className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer" {...props} />
                ),
                
                // Blockquotes
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700" {...props} />
                ),
              }}
            >
              {mainContent}
            </ReactMarkdown>
          </div>
        </div>

        {/* Follow-up Questions - Clickable buttons */}
        {followUps.length > 0 && onQuickReply && (
          <div className="mt-3 flex flex-wrap gap-2">
            {followUps.map((question, idx) => (
              <button
                key={idx}
                onClick={() => onQuickReply(question)}
                className="px-4 py-2 bg-white border-2 border-accent-yellow rounded-full text-sm font-medium hover:bg-accent-yellow/10 transition-colors text-left"
              >
                {question}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}