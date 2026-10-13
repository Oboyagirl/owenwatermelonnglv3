import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  FileText, 
  Calculator, 
  Clock, 
  Code, 
  Save, 
  Check, 
  Play, 
  RotateCcw
} from 'lucide-react';
import { ThemeConfig } from '../services/themeStore';

interface AppsViewProps {
  activeTheme?: ThemeConfig;
}

export const AppsView: React.FC<AppsViewProps> = ({ activeTheme }) => {
  const [activeApp, setActiveApp] = useState<'notes' | 'calculator' | 'timer' | 'code'>('notes');

  const accent = activeTheme?.accent || '#10b981';
  const cardBg = activeTheme?.bgCard || '#080f1d';
  const border = activeTheme?.border || 'rgba(255, 255, 255, 0.1)';

  // Notes state
  const [noteContent, setNoteContent] = useState(() => {
    try {
      return localStorage.getItem('owen_notes') || localStorage.getItem('petezah_notes') || '# Quick School Notes & Cheat Sheet\n\n- Period 1: Math HW pg 42 #1-10\n- Period 3: History project due Friday\n- Bio: Read chapter 5\n\n(Auto-saved locally in browser storage)';
    } catch {
      return '';
    }
  });
  const [savedNotes, setSavedNotes] = useState(false);

  const handleSaveNotes = () => {
    try {
      localStorage.setItem('owen_notes', noteContent);
      setSavedNotes(true);
      setTimeout(() => setSavedNotes(false), 2000);
    } catch {}
  };

  // Calculator state
  const [calcInput, setCalcInput] = useState('0');

  const handleCalcBtn = (val: string) => {
    if (val === 'C') {
      setCalcInput('0');
    } else if (val === '=') {
      try {
        const sanitized = calcInput.replace(/[^0-9+\-*/.()]/g, '');
        // eslint-disable-next-line no-eval
        const res = Function(`'use strict'; return (${sanitized})`)();
        setCalcInput(String(res));
      } catch {
        setCalcInput('Error');
      }
    } else {
      setCalcInput(prev => prev === '0' || prev === 'Error' ? val : prev + val);
    }
  };

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(s => s - 1), 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Code Sandbox state
  const [codeSnippet, setCodeSnippet] = useState('console.log("Hello from OwenWatermelonV3 OS!");\n\nfor (let i = 1; i <= 5; i++) {\n  console.log("Melon counter:", i * 10);\n}');
  const [codeOutput, setCodeOutput] = useState('');

  const runCode = () => {
    const logs: string[] = [];
    const origLog = console.log;
    try {
      console.log = (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      // eslint-disable-next-line no-eval
      Function(codeSnippet)();
      setCodeOutput(logs.join('\n') || 'Program completed with no logs.');
    } catch (e: any) {
      setCodeOutput('Error: ' + e.message);
    } finally {
      console.log = origLog;
    }
  };

  return (
    <div 
      className="flex-1 flex flex-col min-h-screen text-slate-100 p-4 md:p-6 lg:p-8"
      style={{ backgroundColor: activeTheme?.bgPrimary || '#020810' }}
    >
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span 
              className="px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              style={{
                backgroundColor: activeTheme?.accentBadge || 'rgba(16, 185, 129, 0.15)',
                borderColor: activeTheme?.borderActive || accent,
                color: accent
              }}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              OwenWatermelon Utility Apps
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Integrated Workspace Tools
          </h1>
          <p className="text-sm text-slate-400">
            Convenient utilities built directly into the OwenWatermelon browser shell for schoolwork, study timers, and quick scratch notes.
          </p>
        </div>

        {/* App Switcher Tabs */}
        <div 
          className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none border-b"
          style={{ borderColor: border }}
        >
          <button
            onClick={() => setActiveApp('notes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              activeApp === 'notes' ? 'text-black shadow-lg font-extrabold' : 'text-slate-300 hover:bg-white/10'
            }`}
            style={{
              backgroundColor: activeApp === 'notes' ? accent : cardBg,
              borderColor: activeApp === 'notes' ? accent : border
            }}
          >
            <FileText className="w-4 h-4" />
            <span>Scratch Notes</span>
          </button>
          <button
            onClick={() => setActiveApp('calculator')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              activeApp === 'calculator' ? 'text-black shadow-lg font-extrabold' : 'text-slate-300 hover:bg-white/10'
            }`}
            style={{
              backgroundColor: activeApp === 'calculator' ? accent : cardBg,
              borderColor: activeApp === 'calculator' ? accent : border
            }}
          >
            <Calculator className="w-4 h-4" />
            <span>Calculator</span>
          </button>
          <button
            onClick={() => setActiveApp('timer')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              activeApp === 'timer' ? 'text-black shadow-lg font-extrabold' : 'text-slate-300 hover:bg-white/10'
            }`}
            style={{
              backgroundColor: activeApp === 'timer' ? accent : cardBg,
              borderColor: activeApp === 'timer' ? accent : border
            }}
          >
            <Clock className="w-4 h-4" />
            <span>Study Timer</span>
          </button>
          <button
            onClick={() => setActiveApp('code')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              activeApp === 'code' ? 'text-black shadow-lg font-extrabold' : 'text-slate-300 hover:bg-white/10'
            }`}
            style={{
              backgroundColor: activeApp === 'code' ? accent : cardBg,
              borderColor: activeApp === 'code' ? accent : border
            }}
          >
            <Code className="w-4 h-4" />
            <span>Code Playground</span>
          </button>
        </div>

        {/* Active Tool View */}
        <div 
          className="p-6 rounded-3xl border shadow-2xl"
          style={{ backgroundColor: cardBg, borderColor: border }}
        >
          {activeApp === 'notes' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4" style={{ color: accent }} />
                  Local Scratchpad (Never leaves your device)
                </span>
                <button
                  onClick={handleSaveNotes}
                  className="px-3.5 py-1.5 rounded-xl text-black font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  style={{ backgroundColor: accent }}
                >
                  {savedNotes ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{savedNotes ? 'Saved!' : 'Save Notes'}</span>
                </button>
              </div>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Type anything here..."
                rows={16}
                className="w-full p-4 rounded-2xl bg-black/50 border text-sm font-mono text-slate-200 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
                style={{ borderColor: border }}
              />
            </div>
          )}

          {activeApp === 'calculator' && (
            <div className="flex flex-col items-center justify-center max-w-xs mx-auto gap-4">
              <div className="w-full bg-black/60 p-4 rounded-2xl border text-right" style={{ borderColor: border }}>
                <span className="text-2xl font-mono font-bold tracking-wider" style={{ color: accent }}>{calcInput}</span>
              </div>
              <div className="grid grid-cols-4 gap-2.5 w-full">
                {['C', '(', ')', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '%', '='].map(btn => (
                  <button
                    key={btn}
                    onClick={() => handleCalcBtn(btn)}
                    className={`py-3.5 rounded-xl text-base font-bold transition-all cursor-pointer border ${
                      btn === '=' 
                        ? 'text-black font-extrabold shadow-lg' 
                        : btn === 'C'
                        ? 'bg-rose-500/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30'
                        : ['/', '*', '-', '+'].includes(btn)
                        ? 'text-white hover:bg-white/10'
                        : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10'
                    }`}
                    style={{
                      backgroundColor: btn === '=' ? accent : ['/', '*', '-', '+'].includes(btn) ? activeTheme?.accentBadge : undefined,
                      borderColor: btn === '=' ? accent : undefined
                    }}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeApp === 'timer' && (
            <div className="flex flex-col items-center justify-center max-w-sm mx-auto gap-6 py-6 text-center">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Pomodoro / Study Timer</span>
              <div 
                className="text-7xl font-mono font-black text-white p-6 rounded-3xl bg-black/50 border w-full tracking-wider"
                style={{ borderColor: border, color: accent }}
              >
                {formatTimer(timerSeconds)}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-6 py-3 rounded-2xl text-black font-extrabold text-sm flex items-center gap-2 cursor-pointer shadow-xl transition-all hover:scale-105"
                  style={{ backgroundColor: accent }}
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>{isTimerRunning ? 'Pause' : 'Start Timer'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(25 * 60);
                  }}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border text-slate-300 hover:text-white cursor-pointer"
                  style={{ borderColor: border }}
                  title="Reset (25 min)"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                {[15, 25, 45, 60].map(mins => (
                  <button
                    key={mins}
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(mins * 60);
                    }}
                    className="px-3 py-1 rounded-lg border text-xs text-slate-400 hover:text-white transition-all cursor-pointer"
                    style={{ borderColor: border }}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeApp === 'code' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Code className="w-4 h-4" style={{ color: accent }} />
                  JavaScript Sandbox & Runner
                </span>
                <button
                  onClick={runCode}
                  className="px-4 py-1.5 rounded-xl text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg"
                  style={{ backgroundColor: accent }}
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Execute Code</span>
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  rows={14}
                  className="w-full p-4 rounded-2xl bg-black/60 border text-xs font-mono text-emerald-400 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
                  style={{ borderColor: border }}
                />
                <div 
                  className="p-4 rounded-2xl bg-black/80 border flex flex-col gap-2 overflow-y-auto max-h-80"
                  style={{ borderColor: border }}
                >
                  <span className="text-[11px] font-mono uppercase text-slate-500">Console Output</span>
                  <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap">{codeOutput || 'Click "Execute Code" to run snippet.'}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
