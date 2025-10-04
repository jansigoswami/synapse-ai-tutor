import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface MessageContentProps {
  content: string;
}

export default function MessageContent({ content }: MessageContentProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Parse content to extract code blocks
  const parseContent = (text: string) => {
    const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }

      // Add code block
      parts.push({
        type: 'code',
        content: match[2].trim(),
        language: match[1] || 'javascript'
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text' as const, content: text }];
  };

  const copyToClipboard = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const parts = parseContent(content);

  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <div key={index} className="rounded-lg overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-2 bg-[#631330]">
                <span className="text-xs text-white-400 font-mono">{part.language}</span>
                <button
                  onClick={() => copyToClipboard(part.content, index)}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy code
                    </>
                  )}
                </button>
              </div>
              <SyntaxHighlighter
                language={part.language}
                style={oneLight}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  background: '#FFFFFF',
                  fontSize: '0.875rem',
                }}
                showLineNumbers={false}
              >
                {part.content}
              </SyntaxHighlighter>
            </div>
          );
        } else {
          return (
            <p key={index} className="whitespace-pre-wrap break-words">
              {part.content}
            </p>
          );
        }
      })}
    </div>
  );
}