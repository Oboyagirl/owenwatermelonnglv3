import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Gamepad2, 
  Shield, 
  Copy, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { ChatMessage } from './AIChatModal';
import { ThemeConfig } from '../services/themeStore';

interface AIChatViewProps {
  onSelectGameTitle?: (title: string) => void;
  activeTheme?: ThemeConfig;
}

const DEFAULT_SUGGESTIONS = [
  "🎮 What are the best games to play on school iPads right now?",
  "🎵 What songs and albums are available in the Music studio?",
  "🌐 How does the Web Proxy work?",
  "💾 How do universal cross-device cloud saves work?",
  "🕵️ How does the Tab Cloaker disguise my tab?"
];

export const AIChatView: React.FC<AIChatViewProps> = ({ onSelectGameTitle, activeTheme }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('owen_ai_chat') || sessionStorage.getItem('petezah_ai_chat');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: `👋 **Welcome to OwenWatermelonV3 AI!** I'm your integrated gaming and unblocker companion.\n\nAsk me for game tips, secret controls, proxy navigation, music albums, school filter unblocking advice, or anything else you need help with!`,
        timestamp: Date.now()
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem('owen_ai_chat', JSON.stringify(messages));
    } catch {}
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'u_' + Date.now(),
      role: 'user',
      content: query,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-10).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          messages: [...historyPayload, { role: 'user', content: query }]
        })
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: 'a_' + Date.now(),
        role: 'assistant',
        content: data.reply || "Sorry, I couldn't reach the AI server right now.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const fallbackMsg: ChatMessage = {
        id: 'a_' + Date.now(),
        role: 'assistant',
        content: `🤖 **OwenWatermelon Assistant**: I'm running in offline mode!\n\nHere are some quick pointers:\n- **Games**: Check out Watermelon Merge, Pokemon Emerald, and Soccer 2026.\n- **Music**: Stream tracks and explore official albums from Tyler, The Creator, Alex G, Kanye, Drake, Kendrick, and more.\n- **Proxy**: Works directly with Google unblocked gateway and streaming proxy.`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Chat cleared! How can I assist you?",
        timestamp: Date.now()
      }
    ]);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#020810] text-slate-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col gap-4 bg-[#080f1d] p-4 md:p-6 rounded-3xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>OwenWatermelonV3 AI Assistant</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Online
                </span>
              </h2>
              <span className="text-xs text-slate-400">Powered by Gemini · Server-Side API</span>
            </div>
          </div>
          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 text-xs transition-all cursor-pointer flex items-center gap-1.5"
            title="Clear conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[450px] max-h-[60vh]">
          {messages.map(m => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-[85%] text-xs md:text-sm leading-relaxed border relative group ${
                    isUser
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-50 shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-400">
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                      onClick={() => handleCopyMessage(m.content, m.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                      title="Copy text"
                    >
                      {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-white/5">
          {DEFAULT_SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => handleSendMessage(s)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition-all cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about games, music, unblocking..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-2xl bg-black/60 border border-white/10 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 fill-black" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
