import React from 'react';

interface FormattedTextProps {
  content: string;
}

export default function FormattedText({ content }: FormattedTextProps) {
  // Format text with markdown-like syntax
  const formatText = (text: string) => {
    // Split by inline code first to avoid formatting inside code
    const segments: Array<{ type: 'code' | 'text'; content: string }> = [];
    const inlineCodeRegex = /`([^`]+)`/g;
    let lastIdx = 0;
    let match;

    while ((match = inlineCodeRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        segments.push({ type: 'text', content: text.slice(lastIdx, match.index) });
      }
      segments.push({ type: 'code', content: match[1] });
      lastIdx = match.index + match[0].length;
    }

    if (lastIdx < text.length) {
      segments.push({ type: 'text', content: text.slice(lastIdx) });
    }

    if (segments.length === 0) {
      segments.push({ type: 'text', content: text });
    }

    return segments.map((segment, idx) => {
      if (segment.type === 'code') {
        return (
          <code
            key={idx}
            className="bg-gray-200 text-[#631330] px-1.5 py-0.5 rounded text-sm font-mono"
          >
            {segment.content}
          </code>
        );
      }

      // Apply formatting to text segments
      let formatted = segment.content;
      const parts: Array<{ 
        text: string; 
        bold?: boolean; 
        italic?: boolean; 
        strike?: boolean;
        underline?: boolean;
      }> = [];
      
      // Parse markdown formatting
      // Order matters: check for combined formats first
      const formatRegex = /(\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|\*([^*]+)\*|~~([^~]+)~~|__([^_]+)__|_([^_]+)_|<u>([^<]+)<\/u>)/g;
      let lastIndex = 0;
      let formatMatch;

      while ((formatMatch = formatRegex.exec(formatted)) !== null) {
        // Add text before match
        if (formatMatch.index > lastIndex) {
          parts.push({ text: formatted.slice(lastIndex, formatMatch.index) });
        }

        // Determine format type
        if (formatMatch[2]) {
          // ***text*** - bold + italic
          parts.push({ text: formatMatch[2], bold: true, italic: true });
        } else if (formatMatch[3]) {
          // **text** - bold
          parts.push({ text: formatMatch[3], bold: true });
        } else if (formatMatch[4]) {
          // *text* - italic
          parts.push({ text: formatMatch[4], italic: true });
        } else if (formatMatch[5]) {
          // ~~text~~ - strikethrough
          parts.push({ text: formatMatch[5], strike: true });
        } else if (formatMatch[6]) {
          // __text__ - bold
          parts.push({ text: formatMatch[6], bold: true });
        } else if (formatMatch[7]) {
          // _text_ - italic
          parts.push({ text: formatMatch[7], italic: true });
        } else if (formatMatch[8]) {
          // <u>text</u> - underline
          parts.push({ text: formatMatch[8], underline: true });
        }

        lastIndex = formatMatch.index + formatMatch[0].length;
      }

      // Add remaining text
      if (lastIndex < formatted.length) {
        parts.push({ text: formatted.slice(lastIndex) });
      }

      if (parts.length === 0) {
        return <span key={idx}>{segment.content}</span>;
      }

      return (
        <span key={idx}>
          {parts.map((part, i) => {
            const className = [
              part.bold ? 'font-bold' : '',
              part.italic ? 'italic' : '',
              part.strike ? 'line-through' : '',
              part.underline ? 'underline' : ''
            ].filter(Boolean).join(' ');

            return (
              <span key={i} className={className || undefined}>
                {part.text}
              </span>
            );
          })}
        </span>
      );
    });
  };

  // Split by newlines to preserve paragraph structure
  const lines = content.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, lineIdx) => (
        <p key={lineIdx} className="whitespace-pre-wrap break-words">
          {line ? formatText(line) : '\u00A0'}
        </p>
      ))}
    </div>
  );
}