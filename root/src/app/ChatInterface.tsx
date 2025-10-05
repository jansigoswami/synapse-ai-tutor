"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Component to render markdown content with typing effect
const TypingMarkdown = ({ 
  content, 
  isTyping, 
  onTypingComplete 
}: { 
  content: string; 
  isTyping: boolean; 
  onTypingComplete?: () => void;
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isTyping) {
      setDisplayedContent(content);
      return;
    }

    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 8); // Adjust speed here (lower = faster)

      return () => clearTimeout(timeout);
    } else {
      onTypingComplete?.();
    }
  }, [currentIndex, content, isTyping, onTypingComplete]);

  return (
    <div className="prose prose-sm max-w-none prose-invert">
      <ReactMarkdown
        components={{
          code: ({ node, inline, className, children, ...props }: any) => {
            return inline ? (
              <code className="bg-gray-800 text-pink-300 px-1 py-0.5 rounded text-xs" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto my-2">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          p: ({ children }: any) => <p className="mb-2 last:mb-0 text-white">{children}</p>,
          ul: ({ children }: any) => <ul className="list-disc list-inside mb-2 text-white">{children}</ul>,
          ol: ({ children }: any) => <ol className="list-decimal list-inside mb-2 text-white">{children}</ol>,
          li: ({ children }: any) => <li className="mb-1 text-white">{children}</li>,
          h1: ({ children }: any) => <h1 className="text-xl font-bold mb-2 text-white">{children}</h1>,
          h2: ({ children }: any) => <h2 className="text-lg font-bold mb-2 text-white">{children}</h2>,
          h3: ({ children }: any) => <h3 className="text-base font-bold mb-2 text-white">{children}</h3>,
          strong: ({ children }: any) => <strong className="font-bold text-white">{children}</strong>,
          em: ({ children }: any) => <em className="italic text-white">{children}</em>,
          blockquote: ({ children }: any) => (
            <blockquote className="border-l-4 border-gray-400 pl-4 italic my-2 text-white">{children}</blockquote>
          ),
          a: ({ children, href }: any) => (
            <a href={href} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {displayedContent}
      </ReactMarkdown>
    </div>
  );
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatInterfaceProps {
  userName: string;
  selectedLanguage: string;
  selectedDuration: string;
  selectedHours: string;
  initialMessages?: Message[];
}

export default function ChatInterface({ 
  userName, 
  selectedLanguage, 
  selectedDuration, 
  selectedHours,
  initialMessages 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || [
    {
      role: 'assistant',
      content: `Hi ${userName}! I'm Synapse, your AI coding tutor. Let's start learning ${selectedLanguage}!`,
      timestamp: new Date(),
      isTyping: false
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessageIndex, setTypingMessageIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingMessageIndex]);

  const handleTypingComplete = (index: number) => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, isTyping: false } : msg
    ));
    setTypingMessageIndex(null);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
      isTyping: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          user_id: 'demo_user_123',
          context: {
            userName,
            selectedLanguage,
            selectedDuration,
            selectedHours
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        isTyping: true
      };

      setMessages(prev => {
        const newMessages = [...prev, assistantMessage];
        setTypingMessageIndex(newMessages.length - 1);
        return newMessages;
      });
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure the backend server is running on http://localhost:8000',
        timestamp: new Date(),
        isTyping: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[90vh]">
      <div className="chat-container">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`user-img w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-indigo-500' : 'bg-gradient-to-br from-purple-500 to-indigo-600'}`}>
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className={`flex-1 max-w-2xl ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {message.role === 'assistant' ? (
                    <div className="backdrop-blur bg-[#ffc8d226] text-white text-sm px-4 py-3 rounded-xl space-y-2">
                      <TypingMarkdown 
                        content={message.content} 
                        isTyping={message.isTyping ?? false}
                        onTypingComplete={() => handleTypingComplete(index)}
                      />
                      <p className="text-xs text-[#631330]">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="inline-block px-4 py-3 rounded-2xl bg-[#631330] text-sm text-white">
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 px-2">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                  <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="chatbox-input flex w-full items-center justify-center">
          <div className="w-3xl border-1 border-[#ffcad45d] rounded-xl backdrop-blur shadow-lg transition-smooth">
            <div className="mx-auto px-4 py-4">
              <form onSubmit={sendMessage} className="flex gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!isLoading && input.trim()) {
                        // Manually trigger form submit
                        (e.target as HTMLTextAreaElement).form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                      }
                    }
                  }}
                  placeholder="Ask me anything about coding..."
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ffcad45d] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-smooth resize-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}