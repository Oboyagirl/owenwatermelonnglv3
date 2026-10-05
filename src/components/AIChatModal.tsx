import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Gamepad2, 
  Lightbulb, 
  Shield, 
  ChevronDown, 
  Maximize2, 
  Minimize2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { ThemeConfig } from '../services/themeStore';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: ThemeConfig;
  onSelectGameTitle?: (title: string) => void;
}

const DEFAULT_SUGGESTIONS = [
  "🎮 What are the best random games to play right now?",
  "🍕 Give me pro tips for Papa's Freezeria & Pizzeria",
  "🎈 What's the best defense strategy for Bloons TD 5?",
  "🕵️ How does the Tab Cloaker keep my games hidden?",
  "🍉 Tell me about the creator and WatermelonBase"
];

export const AIChatModal: React.FC<AIChatModalProps> = ({
  isOpen,
  onClose,
  activeTheme,
  onSelectGameTitle
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('owen_melonbot_chat_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: `👋 **Welcome to the WatermelonBase!** I'm **MelonBot**, your personal unblocked gaming AI companion.\n\nAsk me for game recommendations across our 830+ catalog, secret tips for Bloons or Papa's games, stealth advice for Tab Cloaker, or anything else you're curious about!`,
        timestamp: Date.now()
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save conversation in session
  useEffect(() => {
    try {
      sessionStorage.setItem('owen_melonbot_chat_v1', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.reply || "Sorry, I couldn't generate a response. Please try asking again!";

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Connection Issue**: Couldn't reach WatermelonBase AI right now (${err.message || 'Network error'}). Please try again in a moment!`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const reset: ChatMessage[] = [
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `🧼 Chat cleared! What would you like to talk about next in WatermelonBase?`,
        timestamp: Date.now()
      }
    ];
    setMessages(reset);
    try {
      sessionStorage.removeItem('owen_melonbot_chat_v1');
    } catch {}
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className={`w-full bg-[#0a120e] rounded-t-3xl sm:rounded-3xl border flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
          isExpanded 
            ? 'h-[95vh] sm:max-w-4xl sm:h-[85vh]' 
            : 'h-[85vh] sm:max-w-xl sm:h-[620px]'
        }`}
        style={{
          backgroundColor: activeTheme.bgCard,
          borderColor: activeTheme.borderActive,
          boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 35px ${activeTheme.accentGlow}`
        }}
      >
        {/* Chatbot Header */}
        <div 
          className="px-4 py-3.5 border-b flex items-center justify-between shrink-0 select-none"
          style={{ 
            backgroundColor: activeTheme.bgHeader,
            borderColor: activeTheme.border 
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl border flex items-center justify-center text-lg shadow-sm relative shrink-0"
              style={{
                backgroundColor: activeTheme.accentBadge,
                borderColor: activeTheme.borderActive
              }}
            >
              <span>{activeTheme.emoji || '🍉'}</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#091510] animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white tracking-tight">MelonBot AI</span>
                <span 
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: activeTheme.accentBadge,
                    color: activeTheme.accent
                  }}
                >
                  Gemini 3.8
                </span>
              </div>
              <span className="text-[11px] text-slate-400">WatermelonBase Assistant</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearHistory}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Clear chat history"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden sm:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 custom-scrollbar">
          {messages.map(m => {
            const isUser = m.role === 'user';
            return (
              <div 
                key={m.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} group`}
              >
                {!isUser && (
                  <div 
                    className="w-7 h-7 rounded-lg border flex items-center justify-center text-sm shrink-0 mt-0.5 shadow-sm"
                    style={{
                      backgroundColor: activeTheme.accentBadge,
                      borderColor: activeTheme.border
                    }}
                  >
                    {activeTheme.emoji || '🍉'}
                  </div>
                )}

                <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed border ${
                      isUser 
                        ? 'text-white font-medium rounded-tr-none' 
                        : 'text-slate-200 rounded-tl-none'
                    }`}
                    style={{
                      backgroundColor: isUser ? activeTheme.accent : activeTheme.bgPrimary,
                      borderColor: isUser ? activeTheme.accent : activeTheme.border,
                      color: isUser ? activeTheme.accentText : '#e2e8f0',
                      boxShadow: isUser ? `0 4px 15px ${activeTheme.accentGlow}` : undefined
                    }}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {m.content}
                    </div>
                  </div>

                  {/* Actions / Timestamp */}
                  <div className="flex items-center gap-2 px-1 text-[10px] text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Copy message"
                    >
                      {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-2.5 justify-start items-center">
              <div 
                className="w-7 h-7 rounded-lg border flex items-center justify-center text-sm shrink-0"
                style={{
                  backgroundColor: activeTheme.accentBadge,
                  borderColor: activeTheme.border
                }}
              >
                {activeTheme.emoji || '🍉'}
              </div>
              <div 
                className="rounded-2xl rounded-tl-none px-4 py-3 border flex items-center gap-1.5"
                style={{
                  backgroundColor: activeTheme.bgPrimary,
                  borderColor: activeTheme.border
                }}
              >
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: activeTheme.accent, animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: activeTheme.accent, animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: activeTheme.accent, animationDelay: '300ms' }} />
                <span className="text-[11px] font-mono text-slate-400 ml-1.5">MelonBot is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips (when user hasn't sent many messages) */}
        {messages.length <= 3 && (
          <div className="px-4 py-2 border-t flex flex-wrap gap-1.5 shrink-0 overflow-x-auto" style={{ borderColor: activeTheme.border }}>
            {DEFAULT_SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium border text-slate-300 hover:text-white transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                style={{
                  backgroundColor: activeTheme.bgPrimary,
                  borderColor: activeTheme.border
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <form 
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t flex items-center gap-2 shrink-0"
          style={{ 
            backgroundColor: activeTheme.bgHeader,
            borderColor: activeTheme.border 
          }}
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask MelonBot for game tips, secret codes, or recommendations..."
              disabled={isLoading}
              className="w-full py-2.5 pl-3.5 pr-10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 border focus:outline-none transition-colors"
              style={{
                backgroundColor: activeTheme.bgPrimary,
                borderColor: activeTheme.border
              }}
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 shrink-0"
            style={{
              backgroundColor: activeTheme.accent,
              color: activeTheme.accentText,
              boxShadow: input.trim() ? `0 4px 15px ${activeTheme.accentGlow}` : undefined
            }}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
