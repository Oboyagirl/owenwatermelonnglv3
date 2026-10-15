import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, RotateCcw, Gamepad2, Lightbulb, User } from 'lucide-react';
import { ThemeColors } from '../services/themeStore';

interface AIChatViewProps {
  activeTheme: ThemeColors;
  onSelectGameTitle?: (title: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChatView: React.FC<AIChatViewProps> = ({ activeTheme, onSelectGameTitle }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 **Hey! I'm MelonBot**, your AI companion for Owen Watermelon V3.\n\nAsk me for game tips, secret strategies, recommendations from our 830+ unblocked catalog, or info on how the web proxy and tab cloaker work!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, messages: newMessages })
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply || "🎮 Ready to play! Ask me for any game recommendation." }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: "🎮 **MelonBot Quick Answer**: Try out **Watermelon Merge**, **Retro Bowl**, or **Soccer Random**! Check the Games tab for all 830+ titles." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "🎮 Best unblocked games right now?",
    "🍕 Pro strategies for Papa's Freezeria",
    "🎈 Best defense towers for Bloons TD 5?",
    "🕵️ How does the Tab Cloaker work?"
  ];

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 flex flex-col h-full">
      {/* Header */}
      <div 
        className="p-4 rounded-2xl border flex items-center justify-between mb-4"
        style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>MelonBot AI</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono">Gemini 3.8</span>
            </h2>
            <p className="text-[11px] text-slate-400">Your unblocked gaming strategist & assistant</p>
          </div>
        </div>
        <button 
          onClick={() => setMessages([messages[0]])}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer text-xs flex items-center gap-1.5"
          title="Reset chat"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 rounded-2xl border flex flex-col gap-4 mb-4"
        style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
      >
        {messages.map((m, idx) => {
          const isBot = m.role === 'assistant';
          return (
            <div key={idx} className={`flex gap-3 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isBot ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div 
                className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-xl ${
                  isBot 
                    ? 'bg-slate-900/60 text-slate-200 border border-white/5' 
                    : 'bg-emerald-500 text-slate-950 font-medium'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex gap-3 items-center text-xs text-slate-400 font-mono">
            <Bot className="w-4 h-4 text-purple-400 animate-spin" /> MelonBot is thinking...
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => { setInput(s); }}
            className="px-3 py-1.5 rounded-xl text-xs bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 whitespace-nowrap cursor-pointer transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="relative flex items-center">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask MelonBot for game tips, secret controls, or recommendations..."
          className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 shadow-lg"
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isLoading}
          className="absolute right-2 p-2 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-40 text-white cursor-pointer transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
