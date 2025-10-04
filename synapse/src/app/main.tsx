"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Copy, Check } from 'lucide-react';
import CodeInterface from './CodeInterface';
// Component to render message content with code blocks




export default function SynapseChat() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLandingFading, setIsLandingFading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m Synapse, your AI coding tutor. What would you like to learn today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navHeightRef = useRef<number>(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const measureNav = () => {
      const nav = document.getElementById('app-navbar');
      const h = nav?.offsetHeight ?? 0;
      if (h !== navHeightRef.current) {
        navHeightRef.current = h;
        document.documentElement.style.setProperty('--nav-height', `${h}px`);
      }
    };
    measureNav();
    window.addEventListener('resize', measureNav);
    const obs = new ResizeObserver(measureNav);
    const nav = document.getElementById('app-navbar');
    if (nav) obs.observe(nav);
    return () => {
      window.removeEventListener('resize', measureNav);
      obs.disconnect();
    };
  }, []);

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!hasStarted && !isLandingFading) {
      setIsLandingFading(true);
      setTimeout(() => {
        setHasStarted(true);
        setIsLandingFading(false);
      }, 500);
    }
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
          user_id: 'demo_user_123'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure the backend server is running on http://localhost:8000',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  if (showSplash) {
    const handleFirstWordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isFadingOut) return;
      const token = input.trim();
      if (!token) return;

      const singleWord = token.split(/\s+/)[0];

      const userMessage = {
        role: 'user' as const,
        content: singleWord,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      setIsFadingOut(true);

      try {
        const response = await fetch('http://localhost:8000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
            user_id: 'demo_user_123'
          })
        });
        if (!response.ok) throw new Error('Failed to get response');
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response, timestamp: new Date() }]);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please make sure the backend server is running on http://localhost:8000', timestamp: new Date() }]);
      } finally {
        setTimeout(() => {
          setHasStarted(true);
          setShowSplash(false);
          setIsFadingOut(false);
          setIsLoading(false);
          setInput('');
        }, 600);
      }
    };
    return (
      <div className="greetings">
        <div className={`container ${isFadingOut ? 'animate-fade-out' : 'animate-fade'} text-center`}>
          <div className="wrapper-head">
            <div className="wrapper-in">
              <div className="synapse-head">Synapse<span className='px-4'>.</span>ai</div>
            </div>
            <div className="wrapper-in">
              <div className="col-1">
                <div className="main-head">Glad to see you again!</div>
                <div className="sub-head">What would you like to learn today?</div>
              </div>
              <div className="col-2" style={{ marginTop: '1.25rem' }}>
                <form onSubmit={handleFirstWordSubmit} className="flex items-center gap-2 justify-end">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Python"
                    disabled={isLoading}
                    className="chat-in px-4 py-2 rounded-lg transition-smooth"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="hero-btn px-4 py-2 rounded-lg text-black shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className={`w-full max-w-2xl px-4 ${isLandingFading ? 'animate-fade-out' : 'animate-slide-down'}`}>
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 w-12 h-12 rounded-2xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-100 tracking-tight">What can I help you build?</h2>
          </div>
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about coding..."
              disabled={isLoading}
              className="flex-1 px-4 py-4 rounded-xl bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md transition-smooth"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium shadow-md transition-smooth"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </form>
        </div>
      </div>
    );
  }

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
                      <CodeInterface content={message.content} />
                      <p className="text-xs text-[#631330]">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="inline-block px-4 py-3 rounded-2xl bg-[#631330] text-sm text-white" style={{ fontFamily: 'var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif' }}>
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
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about coding..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ffcad45d] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-smooth"
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
  )};