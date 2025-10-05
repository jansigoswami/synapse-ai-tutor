"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Copy, Check } from 'lucide-react';
import ChatInterface from './ChatInterface';

// Mock CodeInterface component
const CodeInterface = ({ content }) => {
  return <div className="whitespace-pre-wrap break-words">{content}</div>;
};

export default function SynapseChat() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLandingFading, setIsLandingFading] = useState(false);
  const [userName, setUserName] = useState('');
  const [hasName, setHasName] = useState(false);
  const [isNameFading, setIsNameFading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [hasLanguage, setHasLanguage] = useState(false);
  const [isLanguageFading, setIsLanguageFading] = useState(false);
  const [customLanguage, setCustomLanguage] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [hasDuration, setHasDuration] = useState(false);
  const [isDurationFading, setIsDurationFading] = useState(false);
  const [customDuration, setCustomDuration] = useState('');
  const [selectedHours, setSelectedHours] = useState('');
  const [hasHours, setHasHours] = useState(false);
  const [isHoursFading, setIsHoursFading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m Synapse, your AI coding tutor. What would you like to learn today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navHeightRef = useRef(0);

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

  const sendMessage = async (e) => {
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

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isNameFading) return;
    setIsNameFading(true);
    setTimeout(() => {
      setUserName(input.trim());
      setInput('');
      setHasName(true);
      setIsNameFading(false);
    }, 500);
  };

  const handleLanguageSelect = (langId, langName) => {
    if (isLanguageFading) return;
    setSelectedLanguage(langName);
    setIsLanguageFading(true);
    setTimeout(() => {
      setHasLanguage(true);
      setIsLanguageFading(false);
    }, 500);
  };

  const handleCustomLanguageSubmit = (e) => {
    e.preventDefault();
    if (!customLanguage.trim() || isLanguageFading) return;
    setSelectedLanguage(customLanguage.trim());
    setIsLanguageFading(true);
    setTimeout(() => {
      setHasLanguage(true);
      setCustomLanguage('');
      setIsLanguageFading(false);
    }, 500);
  };

  const handleDurationSelect = (duration) => {
    if (isDurationFading) return;
    setSelectedDuration(duration);
    setIsDurationFading(true);
    setTimeout(() => {
      setHasDuration(true);
      setIsDurationFading(false);
    }, 500);
  };

  const handleCustomDurationSubmit = (e) => {
    e.preventDefault();
    if (!customDuration.trim() || isDurationFading) return;
    setSelectedDuration(customDuration.trim());
    setIsDurationFading(true);
    setTimeout(() => {
      setHasDuration(true);
      setCustomDuration('');
      setIsDurationFading(false);
    }, 500);
  };

  const handleHoursSelect = (hours) => {
    if (isHoursFading) return;
    setSelectedHours(hours);
    setIsHoursFading(true);
    setTimeout(() => {
      setHasHours(true);
      setIsHoursFading(false);
    }, 500);
  };

  if (showSplash) {
    const languages = [
      { id: "python", name: "Python" },
      { id: "javascript", name: "JavaScript" },
      { id: "java", name: "Java" },
      { id: "cpp", name: "C++" },
      { id: "go", name: "Go" },
      { id: "rust", name: "Rust" },
    ];

    const durations = [
      { id: "1month", name: "1 Month", description: "Intensive daily lessons", icon: "🚀" },
      { id: "2months", name: "2 Months", description: "Steady progress", icon: "📚" },
      { id: "3months", name: "3 Months", description: "Deep dive mastery", icon: "🎯" },
    ];

    const hoursPerDay = [
      { id: "1hour", name: "1 Hour", description: "Light daily practice", icon: "⏰" },
      { id: "2hours", name: "2 Hours", description: "Balanced commitment", icon: "⏱️" },
      { id: "3hours", name: "3 Hours", description: "Focused learning", icon: "🕐" },
      { id: "4plus", name: "4+ Hours", description: "Intensive immersion", icon: "⚡" },
    ];

    // First screen: Ask for name
    if (!hasName) {
      return (
        <div className="greetings">
          <div className={`container ${isNameFading ? 'animate-fade-out' : 'animate-fade'} text-center`}>
            <div className="wrapper-head">
              <div className="flex items-center justify-center w-full px-0 py-0 pr-4">
                <div className="synapse-head">Synapse</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="col-1 items-center">
                  <div className="main-head">Hey Buddy!</div>
                  <div className="sub-head">What should we call you?</div>
                </div>
                <div className="col-2" style={{ marginTop: '1.25rem' }}>
                  <form onSubmit={handleNameSubmit} className="flex items-center justify-center">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Enter your name"
                      disabled={isNameFading}
                      className="chat-in px-6 py-3 rounded-lg transition-smooth text-center"
                      autoFocus
                    />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Second screen: Select language
    if (!hasLanguage) {
      return (
        <div className="greetings">
          <div className={`container ${isLanguageFading ? 'animate-fade-out' : 'animate-fade'} text-center`}>
            <div className="wrapper-head">
              <div className="flex items-center justify-center w-full px-0 py-0 pr-4">
                <div className="synapse-head">Synapse</div>
              </div>
              <div className="flex flex-col items-center justify-center gap-[0.5rem]">
                <div className="col-1 flex flex-col items-center gap-[0.2rem]">
                  <div className="main-head">Glad to see you, {userName}!</div>
                  <div className="sub-head">Which language would you like to learn?</div>
                </div>
                <div className="col-2 flex flex-col gap-[2rem]" style={{ marginTop: '2rem', margin: '2rem auto 0' }}>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {languages.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => handleLanguageSelect(lang.id, lang.name)}
                        disabled={isLanguageFading}
                        className="px-6 py-2 rounded-xl border-2 border-[#ffcad45d] bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-[#ffcad4] hover:bg-white/10 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <p className="font-medium text-white text-sm">{lang.name}</p>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col items-center gap-2">
                    {/* <p className="text-gray-300 text-sm">Or enter a different language</p> */}
                    <form onSubmit={handleCustomLanguageSubmit} className="flex items-center justify-center gap-2 w-full max-w-md">
                      <input
                        type="text"
                        value={customLanguage}
                        onChange={(e) => setCustomLanguage(e.target.value)}
                        placeholder="Have something else in mind?"
                        disabled={isLanguageFading}
                        className="flex-1 chat-in px-4 py-2 rounded-lg transition-smooth text-center"
                      />
                      <button
                        type="submit"
                        disabled={!customLanguage.trim() || isLanguageFading}
                        className="hero-btn px-4 py-2 rounded-lg text-black shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300"
                      >
                        →
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Third screen: Select duration
    // Third screen: Select duration
    if (!hasDuration) {
      return (
        <div className="greetings">
          <div className={`container ${isDurationFading ? 'animate-fade-out' : 'animate-fade'} text-center`}>
            <div className="wrapper-head">
              <div className="flex items-center justify-center w-full px-0 py-0 pr-4">
                <div className="synapse-head">Synapse</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="col-1 items-center">
                  <div className="main-head">Perfect choice, {userName}!</div>
                  <div className="sub-head">How long do you want to learn {selectedLanguage}?</div>
                </div>
                <div className="col-2" style={{ marginTop: '2rem', maxWidth: '700px', margin: '2rem auto 0' }}>
                  <div className="flex gap-4 w-full items-center justify-center">
                    {durations.map((duration) => (
                      <button
                        key={duration.id}
                        onClick={() => handleDurationSelect(duration.name)}
                        disabled={isDurationFading}
                        className="p-6 rounded-xl border-2 border-[#ffcad45d] bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-102 hover:border-[#ffcad4] hover:bg-white/10 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center gap-4 w-[250px]">
                          <div className="text-left flex-1">
                            <p className="font-semibold text-white text-lg">{duration.name}</p>
                            <p className="text-gray-300 text-sm">{duration.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col items-center gap-2">
                    <form onSubmit={handleCustomDurationSubmit} className="flex items-center justify-center gap-2 w-full max-w-md">
                      <input
                        type="text"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                        placeholder="Or set your own timeframe..."
                        disabled={isDurationFading}
                        className="flex-1 chat-in px-4 py-2 rounded-lg transition-smooth text-center"
                      />
                      <button
                        type="submit"
                        disabled={!customDuration.trim() || isDurationFading}
                        className="hero-btn px-4 py-2 rounded-lg text-black shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300"
                      >
                        →
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Fourth screen: Select hours per day
    if (!hasHours) {
      return (
        <div className="greetings">
          <div className={`container ${isHoursFading ? 'animate-fade-out' : 'animate-fade'} text-center`}>
            <div className="wrapper-head">
              <div className="flex items-center justify-center w-full px-0 py-0 pr-4">
                <div className="synapse-head">Synapse</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="col-1 items-center">
                  <div className="main-head">Almost there, {userName}!</div>
                  <div className="sub-head">How many hours per day can you dedicate?</div>
                </div>
                <div className="col-2" style={{ marginTop: '2rem', maxWidth: '700px', margin: '2rem auto 0' }}>
                  <div className="grid grid-cols-4 gap-4">
                    {hoursPerDay.map((hour) => (
                      <button
                        key={hour.id}
                        onClick={() => handleHoursSelect(hour.name)}
                        disabled={isHoursFading}
                        className="p-6 rounded-xl border-2 border-[#ffcad45d] bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-[#ffcad4] hover:bg-white/10 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {/* <div className="text-4xl mb-2">{hour.icon}</div> */}
                        <p className="font-semibold text-white text-lg">{hour.name}</p>
                        <p className="text-gray-300 text-sm mt-1">{hour.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Fifth screen: Final confirmation and start
    const handleStart = async () => {
      if (isFadingOut) return;

      const userMessage = {
        role: 'user',
        content: `I want to learn ${selectedLanguage} in ${selectedDuration}, and I can dedicate ${selectedHours} per day`,
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
        }, 600);
      }
    };

    return (
      <div className="greetings">
        <div className={`container ${isFadingOut ? 'animate-fade-out' : 'animate-fade'} text-center`}>
          <div className="wrapper-head">
            <div className="flex items-center justify-center w-full px-0 py-0 pr-4">
              <div className="synapse-head">Synapse</div>
            </div>
            <div className="flex flex-col items-center justify-center gap-[1.5rem]">
              <div className="col-1 flex flex-col gap-[0.2rem] items-center">
                <div className="main-head">Great! Let's get started, {userName}!</div>
                <div className="sub-head">You'll learn {selectedLanguage} over {selectedDuration}, dedicating {selectedHours} daily</div>
              </div>
              <div className="col-2" style={{ marginTop: '2rem' }}>
                <button
                  onClick={handleStart}
                  disabled={isLoading}
                  className="hero-btn px-8 py-3 rounded-lg text-black shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:transition-cubic-bezier(0.39, 0.575, 0.565, 1); duration-300 border-1 border-white cursor-pointer"
                >
                  {isLoading ? 'Starting...' : 'Start Learning'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // if (!hasStarted) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <div className={`w-full max-w-2xl px-4 ${isLandingFading ? 'animate-fade-out' : 'animate-slide-down'}`}>
  //         <div className="text-center mb-6">
  //           <div className="mx-auto mb-4 w-12 h-12 rounded-2xl flex items-center justify-center">
  //             <Bot className="w-6 h-6 text-white" />
  //           </div>
  //           <h2 className="text-2xl font-semibold text-gray-100 tracking-tight">What can I help you build?</h2>
  //         </div>
  //         <form onSubmit={sendMessage} className="flex gap-3">
  //           <input
  //             ref={inputRef}
  //             type="text"
  //             value={input}
  //             onChange={(e) => setInput(e.target.value)}
  //             placeholder="Ask anything about coding..."
  //             disabled={isLoading}
  //             className="flex-1 px-4 py-4 rounded-xl bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md transition-smooth"
  //           />
  //           <button
  //             type="submit"
  //             disabled={!input.trim() || isLoading}
  //             className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium shadow-md transition-smooth"
  //           >
  //             <Send className="w-5 h-5" />
  //             Send
  //           </button>
  //         </form>
  //       </div>
  //     </div>
  //   );
  // }

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
    <ChatInterface
      userName={userName}
      selectedLanguage={selectedLanguage}
      selectedDuration={selectedDuration}
      selectedHours={selectedHours}
      initialMessages={messages}
    />
  );

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
  );
}