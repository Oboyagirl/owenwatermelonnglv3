import React, { useEffect, useState } from 'react';
import {
  BOGGLE_BOARDS,
  Batch2ArcadeState,
  Batch2Player,
  MATH_BLITZ_PUZZLES,
  NMM_ADJ,
  NMM_COORDS,
  STORY_EMOJI_PALETTE,
  ShogiPieceKind,
  TRIVIA_BANK,
  UnoColor,
  evalMathBlitzOp,
  formatUnoCard,
  pokerDiceRank,
  scoreFarkleDice
} from '../utils/arcadeBatch2Types';
import { PIXEL_DRAW_COLORS } from '../utils/arcadeExtendedTypes';
import {
  canPlaceQuoridorWall,
  getBatch2LegalActions,
  getQuoridorPawnMoves
} from '../utils/arcadeBatch2Engines';
import { Eye, EyeOff, RefreshCw, Shield, Trash2, Zap } from 'lucide-react';

interface Batch2ArcadeBoardProps {
  state: Batch2ArcadeState;
  canAct: boolean;
  viewerRole: Batch2Player | 'local' | 'spectator';
  p1Name: string;
  p2Name: string;
  onAction: (action: string) => void;
}

const SHOGI_GLYPHS: Record<ShogiPieceKind, { icon: string; name: string }> = {
  L: { icon: '🦁', name: 'Lion' },
  G: { icon: '🦒', name: 'Giraffe' },
  E: { icon: '🐘', name: 'Elephant' },
  C: { icon: '🐥', name: 'Chick' },
  H: { icon: '🐔', name: 'Hen' }
};

const UNO_COLOR_STYLES: Record<UnoColor | 'W', string> = {
  R: 'from-rose-500 to-red-700 border-rose-300/70',
  B: 'from-sky-500 to-blue-700 border-sky-300/70',
  G: 'from-emerald-500 to-green-700 border-emerald-300/70',
  Y: 'from-amber-400 to-yellow-600 border-amber-200/80 text-slate-950',
  W: 'from-fuchsia-600 via-indigo-600 to-amber-500 border-white/80'
};

const SIMON_PADS = [
  { id: 0, label: 'Red', active: 'bg-rose-400 ring-4 ring-white scale-105', idle: 'bg-rose-600/80 hover:bg-rose-500' },
  { id: 1, label: 'Blue', active: 'bg-sky-400 ring-4 ring-white scale-105', idle: 'bg-sky-600/80 hover:bg-sky-500' },
  { id: 2, label: 'Green', active: 'bg-emerald-400 ring-4 ring-white scale-105', idle: 'bg-emerald-600/80 hover:bg-emerald-500' },
  { id: 3, label: 'Yellow', active: 'bg-amber-300 ring-4 ring-white scale-105', idle: 'bg-amber-500/85 hover:bg-amber-400' }
];

export const Batch2ArcadeBoard: React.FC<Batch2ArcadeBoardProps> = ({
  state,
  canAct,
  viewerRole,
  p1Name,
  p2Name,
  onAction
}) => {
  const [symColor, setSymColor] = useState(2);
  const [customWord, setCustomWord] = useState('');
  const [guessInput, setGuessInput] = useState('');
  const [rgbMix, setRgbMix] = useState<[number, number, number]>([128, 128, 128]);
  const [storySlot, setStorySlot] = useState<0 | 1 | 2>(0);
  const [quoridorTool, setQuoridorTool] = useState<'move' | 'wh' | 'wv'>('move');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [selectedSq, setSelectedSq] = useState<[number, number] | null>(null);
  const [takTool, setTakTool] = useState<'flat' | 'wall' | 'move'>('flat');
  const [shogiDropKind, setShogiDropKind] = useState<ShogiPieceKind | null>(null);
  const [gobbletReserveSize, setGobbletReserveSize] = useState<1 | 2 | 3 | null>(null);
  const [splatterBomb, setSplatterBomb] = useState(false);
  const [mathOp1, setMathOp1] = useState<'+' | '-' | '*'>('*');
  const [mathOp2, setMathOp2] = useState<'+' | '-' | '*'>('-');
  const [mathGrp, setMathGrp] = useState<'L' | 'R'>('L');
  const [simonTapBuf, setSimonTapBuf] = useState<number[]>([]);
  const [simonFlashPad, setSimonFlashPad] = useState<number | null>(null);
  const [bogglePath, setBogglePath] = useState<number[]>([]);
  const [sudokuCell, setSudokuCell] = useState<[number, number] | null>(null);
  const [wildCardIdx, setWildCardIdx] = useState<number | null>(null);
  const [liarBidQty, setLiarBidQty] = useState(1);
  const [liarBidFace, setLiarBidFace] = useState(3);
  const [farkleMask, setFarkleMask] = useState<boolean[]>([]);
  const [localPeek, setLocalPeek] = useState(false);

  useEffect(() => {
    setGuessInput('');
    setSelectedIdx(null);
    setSelectedSq(null);
    setShogiDropKind(null);
    setGobbletReserveSize(null);
    setSplatterBomb(false);
    setSimonTapBuf([]);
    setBogglePath([]);
    setSudokuCell(null);
    setWildCardIdx(null);
    setFarkleMask([]);
    setLocalPeek(false);
  }, [state.gameType, state.moveCount, state.turn]);

  const ownerName = (p: Batch2Player) => (p === 'p1' ? p1Name : p2Name);

  const replaySimonSequence = (seq: number[]) => {
    seq.forEach((pad, idx) => {
      window.setTimeout(() => setSimonFlashPad(pad), idx * 450);
      window.setTimeout(() => setSimonFlashPad(null), idx * 450 + 300);
    });
  };

  switch (state.gameType) {
    // 1. MIRROR ART GUESS
    case 'symmetry-art': {
      const canSeeSecret =
        viewerRole === 'local'
          ? state.phase !== 'guess' || localPeek
          : viewerRole === state.drawer || Boolean(state.winner);
      const isDrawerTurn = canAct && state.turn === state.drawer;
      const isGuesserTurn = canAct && state.turn === state.guesser;

      return (
        <div className="w-full max-w-md flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-pink-300">Round {state.round}/{state.maxRounds}</span>
            <span className="font-mono text-slate-200">{p1Name}: {state.scores.p1} · {p2Name}: {state.scores.p2}</span>
          </div>
          {state.lastSummary && (
            <div className="text-[11px] text-center text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-lg">
              {state.lastSummary}
            </div>
          )}

          {state.phase === 'pick' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/15 flex flex-col gap-3">
              <div className="text-xs font-bold text-white text-center">
                {ownerName(state.drawer)}: Pick a Mirror Art prompt
              </div>
              {isDrawerTurn ? (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {state.wordChoices.map(w => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => onAction(`w:${w}`)}
                        className="py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/35 border border-pink-400/40 text-xs font-extrabold text-white capitalize cursor-pointer"
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      const clean = customWord.trim().toLowerCase().replace(/[^a-z ]/g, '');
                      if (clean.length >= 2) {
                        onAction(`w:${clean}`);
                        setCustomWord('');
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      value={customWord}
                      onChange={e => setCustomWord(e.target.value)}
                      placeholder="Or custom word..."
                      maxLength={20}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                    />
                    <button type="submit" className="px-3 py-1.5 rounded-xl bg-pink-400 text-black text-xs font-extrabold cursor-pointer">
                      Use
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center text-xs text-slate-400 py-4">Waiting for {ownerName(state.drawer)} to pick a prompt...</div>
              )}
            </div>
          )}

          {state.phase !== 'pick' && (
            <>
              <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-black/30 border border-white/10">
                <span>
                  {canSeeSecret && state.word ? (
                    <span className="font-extrabold text-amber-300 uppercase tracking-wider">{state.word}</span>
                  ) : (
                    <span className="font-mono text-slate-300 tracking-widest">
                      {state.word ? state.word.replace(/[a-z]/gi, ' _ ') : ''}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-mono text-pink-300">
                  {state.mirrorMode === '4' ? '4-Way Kaleidoscope' : 'Left-Right Mirror'}
                </span>
              </div>

              <div className="grid grid-cols-8 gap-1 p-2.5 rounded-2xl bg-slate-950 border border-white/15 w-full max-w-[300px] mx-auto aspect-square">
                {state.grid.map((row, r) =>
                  row.map((val, c) => (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      disabled={state.phase !== 'draw' || !isDrawerTurn}
                      onClick={() => onAction(`p:${r},${c},${symColor}`)}
                      className="rounded-md border border-white/10 transition-transform hover:scale-105 cursor-pointer disabled:cursor-default"
                      style={{ backgroundColor: PIXEL_DRAW_COLORS[val] || PIXEL_DRAW_COLORS[0] }}
                    />
                  ))
                )}
              </div>

              {state.phase === 'draw' && isDrawerTurn && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    {PIXEL_DRAW_COLORS.map((hex, idx) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setSymColor(idx)}
                        className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                          symColor === idx ? 'border-white scale-115' : 'border-white/25'
                        }`}
                        style={{ backgroundColor: hex }}
                        title={idx === 0 ? 'Eraser' : `Color ${idx}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => onAction(state.mirrorMode === '4' ? 'sym:h' : 'sym:4')}
                      className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white cursor-pointer"
                    >
                      Mode: {state.mirrorMode === '4' ? '4-Way' : '2-Way'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onAction('clear')}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => onAction('done')}
                      className="px-4 py-1.5 rounded-lg bg-pink-400 text-black text-xs font-extrabold cursor-pointer"
                    >
                      Send Art →
                    </button>
                  </div>
                </div>
              )}

              {state.phase === 'guess' && (
                <div className="flex flex-col gap-2">
                  {state.guesses.map((g, i) => (
                    <div key={i} className="flex justify-between text-xs px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                      <span className="font-bold text-rose-300">✗ {g.text}</span>
                      <span className="text-[10px] text-slate-400">{g.hint}</span>
                    </div>
                  ))}
                  {isGuesserTurn ? (
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        if (guessInput.trim()) {
                          onAction(`g:${guessInput.trim()}`);
                          setGuessInput('');
                        }
                      }}
                      className="flex gap-2"
                    >
                      <input
                        value={guessInput}
                        onChange={e => setGuessInput(e.target.value)}
                        placeholder={`Guess the word (${3 - state.guesses.length} left)...`}
                        className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                      />
                      <button type="submit" className="px-3 py-2 rounded-xl bg-pink-400 text-black text-xs font-extrabold cursor-pointer">
                        Guess
                      </button>
                      <button
                        type="button"
                        onClick={() => onAction('giveup')}
                        className="px-2.5 py-2 rounded-xl bg-white/10 text-[11px] font-bold text-slate-300 cursor-pointer"
                      >
                        Skip
                      </button>
                    </form>
                  ) : (
                    <div className="text-center text-xs text-slate-400">Waiting for {ownerName(state.guesser)} to guess...</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    // 2. COLOR MIXER DUEL
    case 'color-match': {
      const targetCss = `rgb(${state.targetRgb[0]}, ${state.targetRgb[1]}, ${state.targetRgb[2]})`;
      const mixCss = `rgb(${rgbMix[0]}, ${rgbMix[1]}, ${rgbMix[2]})`;
      return (
        <div className="w-full max-w-md flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-rose-300">Round {state.round}/{state.maxRounds}</span>
            <span className="font-mono text-white">{p1Name}: {state.scores.p1} pts · {p2Name}: {state.scores.p2} pts</span>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950 border border-white/15">
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400">Target Color</span>
              <div className="w-full h-24 rounded-xl border-2 border-white/30 shadow-inner" style={{ backgroundColor: targetCss }} />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400">Your Mix</span>
              <div className="w-full h-24 rounded-xl border-2 border-white/30 shadow-inner" style={{ backgroundColor: mixCss }} />
              <span className="text-[10px] font-mono text-slate-300">({rgbMix[0]}, {rgbMix[1]}, {rgbMix[2]})</span>
            </div>
          </div>

          {!state.winner && (
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
              {(['Red', 'Green', 'Blue'] as const).map((label, idx) => (
                <label key={label} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-bold text-slate-300">{label}</span>
                  <input
                    type="range"
                    min={0}
                    max={255}
                    disabled={!canAct}
                    value={rgbMix[idx]}
                    onChange={e => {
                      const next = [...rgbMix] as [number, number, number];
                      next[idx] = Number(e.target.value);
                      setRgbMix(next);
                    }}
                    className="flex-1 accent-rose-400 cursor-pointer"
                  />
                  <span className="w-8 font-mono text-right text-slate-200">{rgbMix[idx]}</span>
                </label>
              ))}
              {canAct && (
                <button
                  type="button"
                  onClick={() => {
                    const base = `mix:${rgbMix[0]},${rgbMix[1]},${rgbMix[2]}`;
                    onAction(state.moveCount === 0 ? `${base}:${Math.floor(Math.random() * 9000) + 1}` : base);
                  }}
                  className="w-full py-2 rounded-xl bg-rose-400 hover:bg-rose-300 text-black text-xs font-extrabold cursor-pointer mt-1"
                >
                  Lock {ownerName(state.turn)}’s Mix
                </button>
              )}
            </div>
          )}

          {state.history.length > 0 && (
            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
              {[...state.history].reverse().map(h => (
                <div key={h.round} className="flex items-center justify-between text-[11px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="font-mono text-slate-400">R{h.round}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded border border-white/30" style={{ backgroundColor: `rgb(${h.target.join(',')})` }} title="Target" />
                    <span className="w-4 h-4 rounded border border-white/30" style={{ backgroundColor: `rgb(${h.p1.join(',')})` }} title="P1" />
                    <span className="w-4 h-4 rounded border border-white/30" style={{ backgroundColor: `rgb(${h.p2.join(',')})` }} title="P2" />
                  </div>
                  <span className="font-mono text-emerald-300">{p1Name}: {h.acc1}% · {p2Name}: {h.acc2}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // 3. EMOJI STORY
    case 'emoji-story': {
      const canSeeAns =
        viewerRole === 'local'
          ? state.phase !== 'guess' || localPeek
          : viewerRole === state.director || Boolean(state.winner);
      const isDirTurn = canAct && state.turn === state.director;
      const isGuessTurn = canAct && state.turn === state.guesser;

      return (
        <div className="w-full max-w-md flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-purple-300">Round {state.round}/{state.maxRounds}</span>
            <span className="font-mono text-white">{p1Name}: {state.scores.p1} · {p2Name}: {state.scores.p2}</span>
          </div>
          {state.lastSummary && (
            <div className="text-[11px] text-center text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-lg">
              {state.lastSummary}
            </div>
          )}

          {state.phase === 'pick' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/15 flex flex-col gap-2.5">
              <div className="text-xs font-bold text-center text-white">
                {ownerName(state.director)}: Pick a Comic Story Title
              </div>
              {isDirTurn ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {state.choices.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onAction(`p:${c}`)}
                      className="py-2 px-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/35 border border-purple-400/40 text-xs font-extrabold text-white capitalize cursor-pointer"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-xs text-slate-400 py-3">Waiting for {ownerName(state.director)}...</div>
              )}
            </div>
          )}

          {state.phase !== 'pick' && (
            <>
              <div className="text-center text-xs font-bold text-amber-300">
                {canSeeAns ? `Title: "${state.answer?.toUpperCase()}"` : 'Crack the 3-Panel Emoji Comic!'}
              </div>
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-950 border border-white/15">
                {(['Setup', 'Twist', 'Finale'] as const).map((label, idx) => (
                  <button
                    key={label}
                    type="button"
                    disabled={state.phase !== 'build' || !isDirTurn}
                    onClick={() => setStorySlot(idx as 0 | 1 | 2)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      state.phase === 'build' && storySlot === idx
                        ? 'border-purple-400 bg-purple-500/15 ring-2 ring-purple-400/50'
                        : 'border-white/15 bg-black/40'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase text-slate-400">{idx + 1}. {label}</span>
                    <span className="text-4xl min-h-[44px] flex items-center justify-center">
                      {state.panels[idx] || '⬜'}
                    </span>
                  </button>
                ))}
              </div>

              {state.phase === 'build' && isDirTurn && (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-8 gap-1 p-2 rounded-xl bg-black/40 border border-white/10 max-h-32 overflow-y-auto">
                    {STORY_EMOJI_PALETTE.map(em => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => {
                          onAction(`s:${storySlot},${em}`);
                          setStorySlot(((storySlot + 1) % 3) as 0 | 1 | 2);
                        }}
                        className="p-1 text-lg hover:bg-white/15 rounded cursor-pointer"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={!state.panels.every(Boolean)}
                    onClick={() => onAction('go')}
                    className="w-full py-2 rounded-xl bg-purple-400 text-black font-extrabold text-xs disabled:opacity-40 cursor-pointer"
                  >
                    Publish Comic to {ownerName(state.guesser)}
                  </button>
                </div>
              )}

              {state.phase === 'guess' && (
                <div className="flex flex-col gap-2">
                  {state.guesses.map((g, i) => (
                    <div key={i} className="flex justify-between text-xs px-3 py-1 rounded-lg bg-white/5">
                      <span className="text-rose-300 font-bold">✗ {g.text}</span>
                      <span className="text-[10px] text-slate-400">{g.hint}</span>
                    </div>
                  ))}
                  {isGuessTurn ? (
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        if (guessInput.trim()) {
                          onAction(`g:${guessInput.trim()}`);
                          setGuessInput('');
                        }
                      }}
                      className="flex gap-2"
                    >
                      <input
                        value={guessInput}
                        onChange={e => setGuessInput(e.target.value)}
                        placeholder={`Guess title (${3 - state.guesses.length} left)...`}
                        className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                      />
                      <button type="submit" className="px-3 py-2 rounded-xl bg-purple-400 text-black text-xs font-extrabold cursor-pointer">
                        Guess
                      </button>
                      <button type="button" onClick={() => onAction('giveup')} className="px-2.5 py-2 rounded-xl bg-white/10 text-[11px] text-slate-300 cursor-pointer">
                        Skip
                      </button>
                    </form>
                  ) : (
                    <div className="text-center text-xs text-slate-400">Waiting for {ownerName(state.guesser)}...</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    // 4. QUORIDOR WALLS
    case 'quoridor': {
      const legalPawnMoves = canAct ? getQuoridorPawnMoves(state, state.turn) : [];
      const legalMoveSet = new Set(legalPawnMoves.map(([r, c]) => `${r},${c}`));
      const wallCandidates: { r: number; c: number }[] = [];
      if (canAct && quoridorTool !== 'move' && state.wallsLeft[state.turn] > 0) {
        const orient = quoridorTool === 'wh' ? 'h' : 'v';
        for (let r = 0; r < 6; r++) {
          for (let c = 0; c < 6; c++) {
            if (canPlaceQuoridorWall(state, orient, r, c)) wallCandidates.push({ r, c });
          }
        }
      }

      return (
        <div className="w-full max-w-[380px] flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-rose-300">{p1Name} (↑ Row 1): {state.wallsLeft.p1} walls</span>
            <span className="font-bold text-amber-300">{p2Name} (↓ Row 7): {state.wallsLeft.p2} walls</span>
          </div>

          {canAct && (
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { id: 'move', label: 'Move Pawn' },
                { id: 'wh', label: `H-Wall (${state.wallsLeft[state.turn]})` },
                { id: 'wv', label: `V-Wall (${state.wallsLeft[state.turn]})` }
              ] as const).map(t => (
                <button
                  key={t.id}
                  type="button"
                  disabled={t.id !== 'move' && state.wallsLeft[state.turn] <= 0}
                  onClick={() => setQuoridorTool(t.id)}
                  className={`py-1.5 rounded-xl border text-[11px] font-extrabold cursor-pointer disabled:opacity-40 ${
                    quoridorTool === t.id
                      ? 'bg-amber-400 text-black border-amber-300'
                      : 'bg-white/5 text-slate-300 border-white/10'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          <div className="relative p-2.5 rounded-2xl bg-[#3f2718] border-2 border-amber-700/50 shadow-2xl aspect-square">
            <div className="grid grid-cols-7 grid-rows-7 gap-1.5 w-full h-full">
              {Array.from({ length: 7 }, (_, r) =>
                Array.from({ length: 7 }, (__, c) => {
                  const isP1 = state.pawns.p1[0] === r && state.pawns.p1[1] === c;
                  const isP2 = state.pawns.p2[0] === r && state.pawns.p2[1] === c;
                  const isGoalTop = r === 0;
                  const isGoalBot = r === 6;
                  const canMoveHere = quoridorTool === 'move' && legalMoveSet.has(`${r},${c}`);
                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      disabled={!canMoveHere}
                      onClick={() => onAction(`m:${r},${c}`)}
                      className={`rounded-md flex items-center justify-center relative transition-all ${
                        isGoalTop
                          ? 'bg-rose-950/70 border border-rose-400/25'
                          : isGoalBot
                          ? 'bg-amber-950/70 border border-amber-400/25'
                          : 'bg-[#7c4d2b] border border-amber-200/10'
                      } ${canMoveHere ? 'ring-2 ring-emerald-400 hover:bg-emerald-500/35 cursor-pointer' : 'cursor-default'}`}
                    >
                      {canMoveHere && !isP1 && !isP2 && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      {isP1 && <span className="w-[72%] h-[72%] rounded-full bg-rose-500 border-2 border-white shadow-lg" />}
                      {isP2 && <span className="w-[72%] h-[72%] rounded-full bg-amber-300 border-2 border-slate-900 shadow-lg" />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Rendered placed walls */}
            <div className="pointer-events-none absolute inset-2.5">
              {state.hWalls.map((row, r) =>
                row.map((active, c) =>
                  active ? (
                    <div
                      key={`hw-${r}-${c}`}
                      className="absolute h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                      style={{
                        left: `${(c / 7) * 100}%`,
                        width: `${(2 / 7) * 100}%`,
                        top: `calc(${((r + 1) / 7) * 100}% - 3px)`
                      }}
                    />
                  ) : null
                )
              )}
              {state.vWalls.map((row, r) =>
                row.map((active, c) =>
                  active ? (
                    <div
                      key={`vw-${r}-${c}`}
                      className="absolute w-1.5 rounded-full bg-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                      style={{
                        top: `${(r / 7) * 100}%`,
                        height: `${(2 / 7) * 100}%`,
                        left: `calc(${((c + 1) / 7) * 100}% - 3px)`
                      }}
                    />
                  ) : null
                )
              )}
            </div>

            {/* Interactive wall placement intersections */}
            {quoridorTool !== 'move' && canAct && (
              <div className="absolute inset-2.5">
                {wallCandidates.map(({ r, c }) => (
                  <button
                    key={`wc-${r}-${c}`}
                    type="button"
                    onClick={() => onAction(`${quoridorTool}:${r},${c}`)}
                    title={`Place ${quoridorTool === 'wh' ? 'Horizontal' : 'Vertical'} wall`}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-white/80 cursor-pointer hover:scale-125 transition-transform ${
                      quoridorTool === 'wh' ? 'bg-amber-400/90' : 'bg-sky-400/90'
                    }`}
                    style={{
                      left: `${((c + 1) / 7) * 100}%`,
                      top: `${((r + 1) / 7) * 100}%`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // 5. PENTE CAPTURE
    case 'pente': {
      const winSet = new Set(state.winLine?.map(([r, c]) => `${r},${c}`) || []);
      return (
        <div className="w-full max-w-[380px] flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-sky-300">{p1Name}: {state.captures.p1}/5 Pairs</span>
            <span className="font-bold text-amber-300">{p2Name}: {state.captures.p2}/5 Pairs</span>
          </div>
          <div className="grid grid-cols-9 gap-1 p-2.5 rounded-2xl bg-[#6f4b2b] border-2 border-amber-800/70 shadow-2xl aspect-square">
            {state.board.map((row, r) =>
              row.map((cell, c) => {
                const isWin = winSet.has(`${r},${c}`);
                const isLast = state.lastCell?.[0] === r && state.lastCell?.[1] === c;
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    disabled={!canAct || cell !== null}
                    onClick={() => onAction(`p:${r},${c}`)}
                    className={`rounded-md flex items-center justify-center border border-amber-950/35 ${
                      canAct && cell === null ? 'hover:bg-amber-300/20 cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    {cell ? (
                      <span
                        className={`w-[82%] h-[82%] rounded-full shadow-md border ${
                          cell === 'p1'
                            ? 'bg-gradient-to-br from-sky-400 to-blue-700 border-sky-200'
                            : 'bg-gradient-to-br from-amber-300 to-orange-600 border-amber-100'
                        } ${isWin ? 'ring-2 ring-white animate-pulse' : isLast ? 'ring-2 ring-white/75' : ''}`}
                      />
                    ) : r === 4 && c === 4 ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-950/60" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      );
    }

    // 6. NINE MEN'S MORRIS
    case 'nine-mens-morris': {
      const legal = canAct ? getBatch2LegalActions(state) : [];
      const legalSet = new Set(legal);
      const validTargetsForSelected = new Set<number>();
      if (state.phase === 'move' && selectedIdx !== null) {
        for (const act of legal) {
          if (act.startsWith(`mv:${selectedIdx}>`)) {
            validTargetsForSelected.add(Number(act.split('>')[1]));
          }
        }
      }

      return (
        <div className="w-full max-w-[360px] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-white">{p1Name}: {state.toPlace.p1} left</span>
            <span className="text-[11px] font-mono text-amber-300 uppercase">{state.phase}</span>
            <span className="font-bold text-slate-300">{p2Name}: {state.toPlace.p2} left</span>
          </div>
          {state.lastNote && (
            <div className="text-center text-[11px] font-bold text-amber-200 bg-amber-500/15 border border-amber-400/30 rounded-lg px-2 py-1">
              {state.lastNote}
            </div>
          )}

          <div className="relative aspect-square w-full rounded-2xl bg-[#292018] border-2 border-amber-700/60 p-4 shadow-2xl">
            <svg viewBox="0 0 60 60" className="w-full h-full">
              {/* Concentric squares & cross spokes */}
              <rect x="4" y="4" width="52" height="52" fill="none" stroke="#b48a5a" strokeWidth="1.1" />
              <rect x="13" y="13" width="34" height="34" fill="none" stroke="#b48a5a" strokeWidth="1.1" />
              <rect x="22" y="22" width="16" height="16" fill="none" stroke="#b48a5a" strokeWidth="1.1" />
              <line x1="30" y1="4" x2="30" y2="22" stroke="#b48a5a" strokeWidth="1.1" />
              <line x1="30" y1="38" x2="30" y2="56" stroke="#b48a5a" strokeWidth="1.1" />
              <line x1="4" y1="30" x2="22" y2="30" stroke="#b48a5a" strokeWidth="1.1" />
              <line x1="38" y1="30" x2="56" y2="30" stroke="#b48a5a" strokeWidth="1.1" />
            </svg>

            {NMM_COORDS.map(([gx, gy], idx) => {
              const owner = state.board[idx];
              const leftPct = 6.6 + (gx / 6) * 86.8;
              const topPct = 6.6 + (gy / 6) * 86.8;
              const canPlaceHere = state.phase === 'place' && legalSet.has(`pl:${idx}`);
              const canRemoveHere = state.phase === 'remove' && legalSet.has(`rm:${idx}`);
              const canSelectMoveFrom =
                state.phase === 'move' &&
                canAct &&
                owner === state.turn &&
                legal.some(a => a.startsWith(`mv:${idx}>`));
              const canMoveTo = validTargetsForSelected.has(idx);
              const isSelected = selectedIdx === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (!canAct) return;
                    if (canPlaceHere) onAction(`pl:${idx}`);
                    else if (canRemoveHere) onAction(`rm:${idx}`);
                    else if (canMoveTo && selectedIdx !== null) onAction(`mv:${selectedIdx}>${idx}`);
                    else if (canSelectMoveFrom) setSelectedIdx(isSelected ? null : idx);
                  }}
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                    canPlaceHere || canRemoveHere || canSelectMoveFrom || canMoveTo
                      ? 'cursor-pointer hover:scale-115'
                      : 'cursor-default'
                  }`}
                >
                  {owner ? (
                    <span
                      className={`w-6 h-6 rounded-full border-2 shadow-lg ${
                        owner === 'p1'
                          ? 'bg-gradient-to-br from-slate-100 to-slate-300 border-white'
                          : 'bg-gradient-to-br from-slate-700 to-slate-950 border-amber-400'
                      } ${isSelected ? 'ring-3 ring-emerald-400 scale-110' : ''} ${
                        canRemoveHere ? 'ring-3 ring-rose-400 animate-pulse' : ''
                      }`}
                    />
                  ) : (
                    <span
                      className={`w-3.5 h-3.5 rounded-full ${
                        canMoveTo
                          ? 'bg-emerald-400 ring-2 ring-white scale-125 animate-pulse'
                          : canPlaceHere
                          ? 'bg-amber-300/70 hover:bg-amber-300'
                          : 'bg-amber-800/80'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
          {NMM_ADJ.length > 0 && state.phase === 'move' && canAct && (
            <div className="text-[11px] text-center text-slate-400">
              {selectedIdx === null ? 'Select one of your pieces to slide' : 'Tap a glowing green destination'}
            </div>
          )}
        </div>
      );
    }

    // 7. SANTORINI LITE (TOWER BUILDERS)
    case 'santorini-lite': {
      const legal = canAct ? getBatch2LegalActions(state) : [];
      const selIdx = selectedSq
        ? state.builders[state.turn].findIndex(([r, c]) => r === selectedSq[0] && c === selectedSq[1])
        : -1;
      const moveTargets = new Set<string>();
      const buildTargets = new Set<string>();
      if (state.phase === 'move' && selIdx !== -1) {
        for (const a of legal) {
          if (a.startsWith(`m:${selIdx},`)) moveTargets.add(a.slice(4));
        }
      } else if (state.phase === 'build') {
        for (const a of legal) buildTargets.add(a.slice(2));
      }

      return (
        <div className="w-full max-w-[360px] flex flex-col gap-2">
          <div className="text-center text-xs font-bold px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sky-200">
            {state.phase === 'move'
              ? `${ownerName(state.turn)}: Move 1 Builder (up max +1 floor)`
              : `${ownerName(state.turn)}: Build +1 Floor adjacent to your moved Builder`}
          </div>
          <div className="grid grid-cols-5 gap-1.5 p-2.5 rounded-2xl bg-slate-900 border border-sky-400/30 aspect-square shadow-2xl">
            {state.levels.map((row, r) =>
              row.map((lv, c) => {
                const p1Idx = state.builders.p1.findIndex(([br, bc]) => br === r && bc === c);
                const p2Idx = state.builders.p2.findIndex(([br, bc]) => br === r && bc === c);
                const hasOwn = state.turn === 'p1' ? p1Idx !== -1 : p2Idx !== -1;
                const key = `${r},${c}`;
                const canMoveHere = state.phase === 'move' && moveTargets.has(key);
                const canBuildHere = state.phase === 'build' && buildTargets.has(key);
                const isSelected = selectedSq?.[0] === r && selectedSq?.[1] === c;
                const levelColors = [
                  'bg-emerald-950/60 border-emerald-500/20',
                  'bg-slate-700 border-slate-400/40',
                  'bg-slate-400 border-white/60 text-slate-950',
                  'bg-amber-300 border-white text-slate-950',
                  'bg-sky-600 border-sky-200'
                ];

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      if (!canAct) return;
                      if (canMoveHere && selIdx !== -1) onAction(`m:${selIdx},${r},${c}`);
                      else if (canBuildHere) onAction(`b:${r},${c}`);
                      else if (state.phase === 'move' && hasOwn) setSelectedSq(isSelected ? null : [r, c]);
                    }}
                    className={`rounded-xl border-2 flex flex-col items-center justify-center relative transition-all ${
                      levelColors[lv]
                    } ${canMoveHere ? 'ring-2 ring-emerald-400 cursor-pointer' : ''} ${
                      canBuildHere ? 'ring-2 ring-amber-400 cursor-pointer' : ''
                    } ${hasOwn && state.phase === 'move' && canAct ? 'cursor-pointer' : ''}`}
                  >
                    <span className="text-[10px] font-mono font-bold opacity-75">
                      {lv === 4 ? '🏛️' : `L${lv}`}
                    </span>
                    {p1Idx !== -1 && (
                      <span className={`w-6 h-6 rounded-full bg-sky-500 border-2 border-white shadow-md flex items-center justify-center text-[10px] font-black text-white ${isSelected ? 'ring-2 ring-emerald-300 scale-110' : ''}`}>
                        B1
                      </span>
                    )}
                    {p2Idx !== -1 && (
                      <span className={`w-6 h-6 rounded-full bg-rose-500 border-2 border-white shadow-md flex items-center justify-center text-[10px] font-black text-white ${isSelected ? 'ring-2 ring-emerald-300 scale-110' : ''}`}>
                        B2
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      );
    }

    // 8. FOX & HOUNDS
    case 'fox-and-hounds': {
      const legal = canAct ? getBatch2LegalActions(state) : [];
      const activeFrom =
        state.turn === 'p1' ? state.fox : selectedSq;
      const targets = new Set<string>();
      if (activeFrom) {
        const prefix = `m:${activeFrom[0]},${activeFrom[1]}>`;
        for (const a of legal) if (a.startsWith(prefix)) targets.add(a.split('>')[1]);
      }

      return (
        <div className="w-full max-w-[360px] flex flex-col gap-2">
          <div className="text-center text-xs font-bold text-orange-200 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
            {state.turn === 'p1' ? `${p1Name} (🦊 Fox): Reach Top Row!` : `${p2Name} (🐕 Hounds): Corner the Fox!`}
          </div>
          <div className="grid grid-cols-8 grid-rows-8 aspect-square rounded-xl overflow-hidden border-2 border-amber-900/70 shadow-2xl">
            {Array.from({ length: 8 }, (_, r) =>
              Array.from({ length: 8 }, (__, c) => {
                const isDark = (r + c) % 2 === 1;
                const isFox = state.fox[0] === r && state.fox[1] === c;
                const isHound = state.hounds.some(([hr, hc]) => hr === r && hc === c);
                const isTarget = targets.has(`${r},${c}`);
                const canSelectHound = state.turn === 'p2' && isHound && canAct;
                const isSelected = selectedSq?.[0] === r && selectedSq?.[1] === c;
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => {
                      if (!canAct) return;
                      if (isTarget && activeFrom) onAction(`m:${activeFrom[0]},${activeFrom[1]}>${r},${c}`);
                      else if (canSelectHound) setSelectedSq(isSelected ? null : [r, c]);
                    }}
                    className={`flex items-center justify-center text-lg sm:text-xl ${
                      isDark ? 'bg-[#6b4226]' : 'bg-[#ebd7b7]'
                    } ${isTarget ? 'ring-inset ring-3 ring-emerald-400 cursor-pointer' : ''} ${
                      canSelectHound ? 'cursor-pointer' : ''
                    } ${isSelected ? 'ring-inset ring-3 ring-sky-400' : ''}`}
                  >
                    {isFox ? '🦊' : isHound ? '🐕' : isTarget ? <span className="w-3 h-3 rounded-full bg-emerald-400" /> : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      );
    }

    // 9. ISOLA
    case 'isola': {
      const legal = new Set(canAct ? getBatch2LegalActions(state) : []);
      return (
        <div className="w-full max-w-[360px] flex flex-col gap-2">
          <div className="text-center text-xs font-bold text-teal-200 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
            {state.phase === 'move'
              ? `${ownerName(state.turn)}: Step 1 square`
              : `${ownerName(state.turn)}: Sink any open tile!`}
          </div>
          <div className="grid grid-cols-6 gap-1.5 p-2.5 rounded-2xl bg-sky-950 border border-teal-400/30 aspect-square shadow-2xl">
            {state.destroyed.map((row, r) =>
              row.map((sunk, c) => {
                const isP1 = state.pawns.p1[0] === r && state.pawns.p1[1] === c;
                const isP2 = state.pawns.p2[0] === r && state.pawns.p2[1] === c;
                const canMoveHere = state.phase === 'move' && legal.has(`m:${r},${c}`);
                const canSinkHere = state.phase === 'destroy' && legal.has(`d:${r},${c}`);
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    disabled={!canMoveHere && !canSinkHere}
                    onClick={() => onAction(canMoveHere ? `m:${r},${c}` : `d:${r},${c}`)}
                    className={`rounded-xl border flex items-center justify-center text-lg transition-all ${
                      sunk
                        ? 'bg-sky-950/90 border-sky-900/40 opacity-35'
                        : 'bg-teal-800/60 border-teal-400/35'
                    } ${canMoveHere ? 'ring-2 ring-emerald-400 hover:bg-emerald-500/30 cursor-pointer' : ''} ${
                      canSinkHere ? 'hover:bg-rose-500/40 hover:border-rose-400 cursor-pointer' : ''
                    }`}
                  >
                    {isP1 ? (
                      <span className="w-7 h-7 rounded-full bg-rose-500 border-2 border-white shadow-md" />
                    ) : isP2 ? (
                      <span className="w-7 h-7 rounded-full bg-amber-300 border-2 border-slate-900 shadow-md" />
                    ) : sunk ? (
                      <span className="text-xs">🌊</span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      );
    }

    // 10. TAK DUEL
    case 'tak-duel': {
      const legal = new Set(canAct ? getBatch2LegalActions(state) : []);
      const moveTargets = new Set<string>();
      if (takTool === 'move' && selectedSq) {
        for (const a of legal) {
          if (a.startsWith(`s:${selectedSq[0]},${selectedSq[1]}>`)) moveTargets.add(a.split('>')[1]);
        }
      }
      return (
        <div className="w-full max-w-[360px] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-amber-300 font-bold">{p1Name}: {state.wallsLeft.p1} walls</span>
            <span className="text-purple-300 font-bold">{p2Name}: {state.wallsLeft.p2} walls</span>
          </div>
          {canAct && (
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { id: 'flat', label: 'Place Flat' },
                { id: 'wall', label: `Place Wall (${state.wallsLeft[state.turn]})` },
                { id: 'move', label: 'Slide Stack' }
              ] as const).map(t => (
                <button
                  key={t.id}
                  type="button"
                  disabled={t.id === 'wall' && state.wallsLeft[state.turn] <= 0}
                  onClick={() => {
                    setTakTool(t.id);
                    setSelectedSq(null);
                  }}
                  className={`py-1.5 rounded-xl border text-[11px] font-extrabold cursor-pointer disabled:opacity-40 ${
                    takTool === t.id ? 'bg-purple-400 text-black border-purple-300' : 'bg-white/5 text-slate-300 border-white/10'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
          <div className="grid grid-cols-5 gap-1.5 p-2.5 rounded-2xl bg-slate-950 border border-purple-500/30 aspect-square shadow-2xl">
            {state.board.map((row, r) =>
              row.map((stack, c) => {
                const top = stack.length > 0 ? stack[stack.length - 1] : null;
                const canPlace =
                  canAct &&
                  stack.length === 0 &&
                  (takTool === 'flat' ? legal.has(`f:${r},${c}`) : takTool === 'wall' ? legal.has(`w:${r},${c}`) : false);
                const canSel = takTool === 'move' && canAct && top?.owner === state.turn;
                const canDest = moveTargets.has(`${r},${c}`);
                const isSel = selectedSq?.[0] === r && selectedSq?.[1] === c;
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => {
                      if (!canAct) return;
                      if (canPlace) onAction(`${takTool === 'wall' ? 'w' : 'f'}:${r},${c}`);
                      else if (canDest && selectedSq) onAction(`s:${selectedSq[0]},${selectedSq[1]}>${r},${c}`);
                      else if (canSel) setSelectedSq(isSel ? null : [r, c]);
                    }}
                    className={`rounded-xl border flex flex-col items-center justify-center relative ${
                      canPlace || canDest
                        ? 'border-emerald-400/70 bg-emerald-500/15 cursor-pointer'
                        : canSel
                        ? 'border-purple-400 cursor-pointer'
                        : 'border-white/10 bg-white/5 cursor-default'
                    } ${isSel ? 'ring-2 ring-white' : ''}`}
                  >
                    {top && (
                      <div
                        className={`flex items-center justify-center font-mono text-[10px] font-black shadow ${
                          top.kind === 'wall' ? 'w-3 h-8 rounded-sm' : 'w-8 h-8 rounded-lg'
                        } ${
                          top.owner === 'p1'
                            ? 'bg-amber-400 text-slate-950 border border-amber-200'
                            : 'bg-slate-700 text-white border border-purple-400'
                        }`}
                      >
                        {stack.length > 1 ? `×${stack.length}` : top.kind === 'wall' ? '▮' : ''}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      );
    }

    // 11. MINI GO (7x7)
    case 'go-mini': {
      const legal = new Set(canAct ? getBatch2LegalActions(state) : []);
      return (
        <div className="w-full max-w-[370px] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-white">⚫ {p1Name} Captures: {state.captures.p1}</span>
            <span className="font-bold text-slate-200">⚪ {p2Name} Captures: {state.captures.p2} (+3.5)</span>
          </div>
          {state.finalScore && (
            <div className="text-center text-xs font-extrabold text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 rounded-xl px-3 py-1.5">
              Final Territory: Black {state.finalScore.p1} — White {state.finalScore.p2}
            </div>
          )}
          <div className="grid grid-cols-7 gap-1 p-2.5 rounded-2xl bg-[#cfa468] border-2 border-amber-900/70 aspect-square shadow-2xl">
            {state.board.map((row, r) =>
              row.map((stone, c) => {
                const ok = legal.has(`g:${r},${c}`);
                const isLast = Array.isArray(state.lastMove) && state.lastMove[0] === r && state.lastMove[1] === c;
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    disabled={!ok}
                    onClick={() => onAction(`g:${r},${c}`)}
                    className={`rounded-md border border-amber-950/25 flex items-center justify-center ${
                      ok ? 'hover:bg-black/15 cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    {stone ? (
                      <span
                        className={`w-[84%] h-[84%] rounded-full shadow-md ${
                          stone === 'p1'
                            ? 'bg-gradient-to-br from-slate-700 to-black border border-slate-600'
                            : 'bg-gradient-to-br from-white to-slate-200 border border-slate-400'
                        } ${isLast ? 'ring-2 ring-emerald-400' : ''}`}
                      />
                    ) : (r === 2 || r === 4 || r === 3) && (c === 2 || c === 4 || c === 3) && (r + c) % 2 === 0 ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-950/50" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
          {canAct && (
            <button
              type="button"
              onClick={() => onAction('pass')}
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-extrabold text-white cursor-pointer"
            >
              Pass Turn {state.consecutivePasses > 0 ? '(Opponent Passed — Ends Game)' : ''}
            </button>
          )}
        </div>
      );
    }

    // 12. AMAZONS HUNT (6x6)
    case 'amazons-mini': {
      const legal = canAct ? getBatch2LegalActions(state) : [];
      const moveTargets = new Set<string>();
      const arrowTargets = new Set<string>();
      if (state.phase === 'move' && selectedSq) {
        for (const a of legal) if (a.startsWith(`m:${selectedSq[0]},${selectedSq[1]}>`)) moveTargets.add(a.split('>')[1]);
      } else if (state.phase === 'shoot') {
        for (const a of legal) arrowTargets.add(a.slice(2));
      }
      return (
        <div className="w-full max-w-[360px] flex flex-col gap-2">
          <div className="text-center text-xs font-bold text-emerald-200 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
            {state.phase === 'move'
              ? `${ownerName(state.turn)}: Slide 1 Queen`
              : `${ownerName(state.turn)}: Shoot a blocking Arrow 🔥`}
          </div>
          <div className="grid grid-cols-6 gap-1 p-2.5 rounded-2xl bg-slate-950 border border-emerald-500/30 aspect-square shadow-2xl">
            {state.board.map((row, r) =>
              row.map((cell, c) => {
                const key = `${r},${c}`;
                const canSel = state.phase === 'move' && canAct && cell === state.turn;
                const canMv = moveTargets.has(key);
                const canArw = arrowTargets.has(key);
                const isSel = selectedSq?.[0] === r && selectedSq?.[1] === c;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      if (!canAct) return;
                      if (canMv && selectedSq) onAction(`m:${selectedSq[0]},${selectedSq[1]}>${r},${c}`);
                      else if (canArw) onAction(`a:${r},${c}`);
                      else if (canSel) setSelectedSq(isSel ? null : [r, c]);
                    }}
                    className={`rounded-xl border flex items-center justify-center text-xl ${
                      (r + c) % 2 === 0 ? 'bg-emerald-950/60 border-white/10' : 'bg-slate-900 border-white/10'
                    } ${canMv ? 'ring-2 ring-emerald-400 cursor-pointer' : ''} ${
                      canArw ? 'ring-2 ring-orange-400 cursor-pointer' : ''
                    } ${canSel ? 'cursor-pointer' : ''} ${isSel ? 'ring-2 ring-white' : ''}`}
                  >
                    {cell === 'p1' ? '👑' : cell === 'p2' ? '👸' : cell === 'arrow' ? '🔥' : canMv ? '·' : ''}
                  </button>
                );
              })
            )}
          </div>
        </div>
      );
    }

    // 13. TRON TURN (LIGHT-CYCLE)
    case 'tron-turn': {
      const legal = new Set(canAct ? getBatch2LegalActions(state) : []);
      return (
        <div className="w-full max-w-[360px] flex flex-col gap-2">
          <div className="grid grid-cols-8 gap-1 p-2.5 rounded-2xl bg-slate-950 border border-cyan-500/40 aspect-square shadow-[0_0_24px_rgba(6,182,212,0.18)]">
            {state.grid.map((row, r) =>
              row.map((cell, c) => {
                const ok = legal.has(`t:${r},${c}`);
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    disabled={!ok}
                    onClick={() => onAction(`t:${r},${c}`)}
                    className={`rounded-md border flex items-center justify-center text-sm ${
                      cell === 'p1'
                        ? 'bg-cyan-400 border-white text-black shadow-[0_0_12px_#22d3ee]'
                        : cell === 'p2'
                        ? 'bg-orange-400 border-white text-black shadow-[0_0_12px_#fb923c]'
                        : cell === 't1'
                        ? 'bg-cyan-500/50 border-cyan-400/50'
                        : cell === 't2'
                        ? 'bg-orange-500/50 border-orange-400/50'
                        : ok
                        ? 'bg-emerald-500/25 border-emerald-400 cursor-pointer animate-pulse'
                        : 'bg-slate-900/70 border-white/5'
                    }`}
                  >
                    {cell === 'p1' || cell === 'p2' ? '🏍️' : ''}
                  </button>
                );
              })
            )}
          </div>
        </div>
      );
    }

    // 14. ANIMAL SHOGI (3x4)
    case 'shogi-pocket': {
      const legal = canAct ? getBatch2LegalActions(state) : [];
      const moveTargets = new Set<string>();
      if (selectedSq) {
        for (const a of legal) if (a.startsWith(`m:${selectedSq[0]},${selectedSq[1]}>`)) moveTargets.add(a.split('>')[1]);
      }
      const dropTargets = new Set<string>();
      if (shogiDropKind) {
        for (const a of legal) if (a.startsWith(`d:${shogiDropKind},`)) dropTargets.add(a.slice(4));
      }

      return (
        <div className="w-full max-w-[320px] flex flex-col gap-2">
          {/* P2 Reserve */}
          <div className="flex items-center gap-1.5 min-h-[34px] px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            <span className="text-slate-400 text-[10px] font-bold">{p2Name} Hand:</span>
            {state.hands.p2.map((k, idx) => (
              <button
                key={`${k}-${idx}`}
                type="button"
                disabled={!canAct || state.turn !== 'p2'}
                onClick={() => {
                  setSelectedSq(null);
                  setShogiDropKind(shogiDropKind === k ? null : k);
                }}
                className={`px-1.5 py-0.5 rounded border text-sm cursor-pointer disabled:cursor-default ${
                  state.turn === 'p2' && shogiDropKind === k ? 'bg-amber-400/30 border-amber-300' : 'bg-black/30 border-white/10'
                }`}
              >
                {SHOGI_GLYPHS[k].icon}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-2.5 rounded-2xl bg-[#7b4d27] border-2 border-amber-700/70 shadow-2xl">
            {state.board.map((row, r) =>
              row.map((piece, c) => {
                const key = `${r},${c}`;
                const canSel = canAct && piece?.owner === state.turn;
                const canMv = moveTargets.has(key);
                const canDrop = dropTargets.has(key);
                const isSel = selectedSq?.[0] === r && selectedSq?.[1] === c;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      if (!canAct) return;
                      if (canDrop && shogiDropKind) onAction(`d:${shogiDropKind},${r},${c}`);
                      else if (canMv && selectedSq) onAction(`m:${selectedSq[0]},${selectedSq[1]}>${r},${c}`);
                      else if (canSel) {
                        setShogiDropKind(null);
                        setSelectedSq(isSel ? null : [r, c]);
                      }
                    }}
                    className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative ${
                      r === 0 ? 'bg-rose-950/35 border-amber-300/30' : r === 3 ? 'bg-emerald-950/35 border-amber-300/30' : 'bg-[#a97648]/40 border-amber-950/40'
                    } ${canMv || canDrop ? 'ring-2 ring-emerald-400 cursor-pointer' : ''} ${
                      isSel ? 'ring-2 ring-white' : ''
                    } ${canSel ? 'cursor-pointer' : ''}`}
                  >
                    {piece ? (
                      <div
                        className={`w-[82%] h-[82%] rounded-lg flex flex-col items-center justify-center border shadow-md ${
                          piece.owner === 'p1'
                            ? 'bg-amber-100 text-slate-900 border-amber-400'
                            : 'bg-slate-800 text-white border-rose-400 rotate-180'
                        }`}
                      >
                        <span className="text-2xl leading-none">{SHOGI_GLYPHS[piece.kind].icon}</span>
                        <span className="text-[9px] font-extrabold">{SHOGI_GLYPHS[piece.kind].name}</span>
                      </div>
                    ) : canMv || canDrop ? (
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>

          {/* P1 Reserve */}
          <div className="flex items-center gap-1.5 min-h-[34px] px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            <span className="text-slate-400 text-[10px] font-bold">{p1Name} Hand:</span>
            {state.hands.p1.map((k, idx) => (
              <button
                key={`${k}-${idx}`}
                type="button"
                disabled={!canAct || state.turn !== 'p1'}
                onClick={() => {
                  setSelectedSq(null);
                  setShogiDropKind(shogiDropKind === k ? null : k);
                }}
                className={`px-1.5 py-0.5 rounded border text-sm cursor-pointer disabled:cursor-default ${
                  state.turn === 'p1' && shogiDropKind === k ? 'bg-amber-400/30 border-amber-300' : 'bg-black/30 border-white/10'
                }`}
              >
                {SHOGI_GLYPHS[k].icon}
              </button>
            ))}
          </div>
          {state.lastMove && <div className="text-center text-[11px] text-slate-300">{state.lastMove}</div>}
        </div>
      );
    }

    // 15. GOBBLET MINI (3x3)
    case 'gobblet-mini': {
      const legal = new Set(canAct ? getBatch2LegalActions(state) : []);
      const winSet = new Set(state.winLine?.map(([r, c]) => `${r},${c}`) || []);
      const res = state.reserves[state.turn];
      const sizeLabels = ['Small', 'Medium', 'Large'];

      return (
        <div className="w-full max-w-[340px] flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950 border border-pink-400/30 aspect-square shadow-2xl">
            {state.board.map((row, r) =>
              row.map((stack, c) => {
                const top = stack.length > 0 ? stack[stack.length - 1] : null;
                const canDropReserve = gobbletReserveSize !== null && legal.has(`p:${gobbletReserveSize},${r},${c}`);
                const canMoveFromBoard = selectedSq !== null && legal.has(`m:${selectedSq[0]},${selectedSq[1]}>${r},${c}`);
                const canPickPiece = canAct && top?.owner === state.turn;
                const isSel = selectedSq?.[0] === r && selectedSq?.[1] === c;
                const isWin = winSet.has(`${r},${c}`);
                const sizeClasses = top ? (top.size === 3 ? 'w-[84%] h-[84%] text-base' : top.size === 2 ? 'w-[62%] h-[62%] text-xs' : 'w-[42%] h-[42%] text-[10px]') : '';

                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => {
                      if (!canAct) return;
                      if (canDropReserve && gobbletReserveSize) onAction(`p:${gobbletReserveSize},${r},${c}`);
                      else if (canMoveFromBoard && selectedSq) onAction(`m:${selectedSq[0]},${selectedSq[1]}>${r},${c}`);
                      else if (canPickPiece) {
                        setGobbletReserveSize(null);
                        setSelectedSq(isSel ? null : [r, c]);
                      }
                    }}
                    className={`rounded-2xl border-2 flex items-center justify-center bg-white/5 ${
                      canDropReserve || canMoveFromBoard
                        ? 'border-emerald-400 bg-emerald-500/15 cursor-pointer'
                        : canPickPiece
                        ? 'border-white/25 cursor-pointer'
                        : 'border-white/10 cursor-default'
                    } ${isWin ? 'ring-2 ring-white animate-pulse' : ''}`}
                  >
                    {top && (
                      <span
                        className={`rounded-full font-black flex items-center justify-center shadow-lg border-2 ${sizeClasses} ${
                          top.owner === 'p1'
                            ? 'bg-gradient-to-br from-pink-400 to-rose-600 border-pink-200 text-white'
                            : 'bg-gradient-to-br from-cyan-300 to-sky-600 border-cyan-100 text-slate-950'
                        } ${isSel ? 'ring-2 ring-white scale-105' : ''}`}
                      >
                        {top.size === 3 ? 'L' : top.size === 2 ? 'M' : 'S'}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {canAct && (
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 3] as const).map((sz, i) => (
                <button
                  key={sz}
                  type="button"
                  disabled={res[i] <= 0}
                  onClick={() => {
                    setSelectedSq(null);
                    setGobbletReserveSize(gobbletReserveSize === sz ? null : sz);
                  }}
                  className={`py-2 rounded-xl border text-xs font-extrabold cursor-pointer disabled:opacity-35 ${
                    gobbletReserveSize === sz
                      ? 'bg-pink-400 text-black border-pink-300'
                      : 'bg-white/5 text-white border-white/15'
                  }`}
                >
                  {sizeLabels[i]} ({res[i]})
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // 16. SPLATTER TURF
    case 'splatter-turf': {
      return (
        <div className="w-full max-w-[370px] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-pink-300">{p1Name}: {state.scores.p1}</span>
            <span className="font-mono text-slate-300">Turns Left: {state.maxTurns - state.moveCount}</span>
            <span className="font-bold text-cyan-300">{p2Name}: {state.scores.p2}</span>
          </div>
          {canAct && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSplatterBomb(false)}
                className={`py-1.5 rounded-xl border text-xs font-extrabold cursor-pointer ${
                  !splatterBomb ? 'bg-cyan-400 text-black border-cyan-300' : 'bg-white/5 text-slate-300 border-white/10'
                }`}
              >
                💦 Cross Splash (+5)
              </button>
              <button
                type="button"
                disabled={state.bombsLeft[state.turn] <= 0}
                onClick={() => setSplatterBomb(true)}
                className={`py-1.5 rounded-xl border text-xs font-extrabold cursor-pointer disabled:opacity-40 ${
                  splatterBomb ? 'bg-pink-400 text-black border-pink-300' : 'bg-white/5 text-slate-300 border-white/10'
                }`}
              >
                💥 3×3 Bomb ({state.bombsLeft[state.turn]})
              </button>
            </div>
          )}
          <div className="grid grid-cols-7 gap-1 p-2.5 rounded-2xl bg-slate-950 border border-cyan-500/30 aspect-square shadow-2xl">
            {state.board.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  disabled={!canAct}
                  onClick={() => onAction(`${splatterBomb && state.bombsLeft[state.turn] > 0 ? 'b' : 'p'}:${r},${c}`)}
                  className={`rounded-lg border transition-colors ${
                    cell === 'p1'
                      ? 'bg-pink-500 border-pink-300'
                      : cell === 'p2'
                      ? 'bg-cyan-400 border-cyan-200'
                      : 'bg-white/5 border-white/10'
                  } ${canAct ? 'hover:ring-2 hover:ring-white cursor-pointer' : 'cursor-default'}`}
                />
              ))
            )}
          </div>
        </div>
      );
    }

    // 17. KNIGHT DUEL
    case 'knight-duel': {
      const legal = new Set(canAct ? getBatch2LegalActions(state) : []);
      return (
        <div className="w-full max-w-[360px] flex flex-col gap-2">
          <div className="grid grid-cols-6 gap-1 p-2.5 rounded-2xl bg-slate-950 border border-indigo-400/30 aspect-square shadow-2xl">
            {state.burned.map((row, r) =>
              row.map((isBurned, c) => {
                const isP1 = state.knights.p1[0] === r && state.knights.p1[1] === c;
                const isP2 = state.knights.p2[0] === r && state.knights.p2[1] === c;
                const ok = legal.has(`k:${r},${c}`);
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    disabled={!ok}
                    onClick={() => onAction(`k:${r},${c}`)}
                    className={`rounded-xl border flex items-center justify-center text-2xl ${
                      isP1
                        ? 'bg-indigo-500 border-white text-white shadow-lg'
                        : isP2
                        ? 'bg-amber-400 border-white text-slate-950 shadow-lg'
                        : isBurned
                        ? 'bg-rose-950/60 border-rose-900/40 opacity-55'
                        : ok
                        ? 'bg-emerald-500/25 border-emerald-400 ring-2 ring-emerald-400 cursor-pointer animate-pulse'
                        : (r + c) % 2 === 0
                        ? 'bg-slate-800 border-white/10'
                        : 'bg-slate-900 border-white/10'
                    }`}
                  >
                    {isP1 || isP2 ? '♞' : isBurned ? '🔥' : ok ? '·' : ''}
                  </button>
                );
              })
            )}
          </div>
        </div>
      );
    }

    // 18. ANAGRAM SCRAMBLE
    case 'anagram-scramble': {
      return (
        <div className="w-full max-w-md flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-purple-300">Round {state.round}/{state.maxRounds}</span>
            <span className="font-mono text-white">{p1Name}: {state.scores.p1} · {p2Name}: {state.scores.p2}</span>
          </div>
          {state.lastSummary && (
            <div className="text-[11px] text-center text-emerald-300 bg-emerald-500/10 border border-emerald-400/25 px-3 py-1.5 rounded-lg">
              {state.lastSummary}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-slate-950 border border-white/15 flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {state.scrambled.split('').map((ch, idx) => (
                <span key={idx} className="w-10 h-11 rounded-xl bg-purple-500/25 border border-purple-400/50 flex items-center justify-center text-xl font-black text-white font-mono">
                  {ch}
                </span>
              ))}
            </div>
            {state.revealedCount > 0 && (
              <div className="text-xs font-mono text-amber-300">
                Clue: {state.word.slice(0, state.revealedCount)}{'_'.repeat(state.word.length - state.revealedCount)}
              </div>
            )}
          </div>

          {canAct && (
            <form
              onSubmit={e => {
                e.preventDefault();
                if (guessInput.trim()) {
                  const g = `g:${guessInput.trim().toUpperCase()}`;
                  onAction(state.moveCount === 0 ? `${g}:${Math.floor(Math.random() * 9000) + 1}` : g);
                  setGuessInput('');
                }
              }}
              className="flex gap-2"
            >
              <input
                value={guessInput}
                onChange={e => setGuessInput(e.target.value.toUpperCase())}
                placeholder="Type unscrambled 6-letter word..."
                maxLength={10}
                className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs font-mono uppercase text-white"
              />
              <button type="submit" className="px-3.5 py-2 rounded-xl bg-purple-400 text-black text-xs font-extrabold cursor-pointer">
                Solve
              </button>
              {state.revealedCount < 3 && (
                <button
                  type="button"
                  onClick={() => onAction('clue')}
                  className="px-2.5 py-2 rounded-xl bg-white/10 text-[11px] font-bold text-amber-200 cursor-pointer"
                >
                  Clue
                </button>
              )}
            </form>
          )}

          {state.attempts.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {state.attempts.map((a, i) => (
                <span key={i} className="px-2 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-[11px] font-mono text-rose-200">
                  {ownerName(a.by)}: {a.guess} ✗
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }

    // 19. TRIVIA SHOWDOWN
    case 'trivia-showdown': {
      const q = TRIVIA_BANK[state.questionIndices[state.round - 1]];
      const lastRound = state.history[state.history.length - 1];
      return (
        <div className="w-full max-w-md flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-sky-300">Question {state.round}/{state.maxRounds} · {q.tag}</span>
            <span className="font-mono text-white">{p1Name}: {state.scores.p1} · {p2Name}: {state.scores.p2}</span>
          </div>

          {!state.winner ? (
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/15 flex flex-col gap-3">
              <div className="text-sm font-extrabold text-white leading-snug">{q.q}</div>
              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={!canAct}
                    onClick={() =>
                      onAction(state.moveCount === 0 ? `a:${idx}:${Math.floor(Math.random() * 9000) + 1}` : `a:${idx}`)
                    }
                    className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-sky-500/25 border border-white/15 hover:border-sky-400 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="font-mono text-sky-300 mr-2">{['A', 'B', 'C', 'D'][idx]}.</span>
                    {opt}
                  </button>
                ))}
              </div>
              {state.pendingP1Choice !== null && (
                <div className="text-[11px] text-amber-300 text-center">
                  {p1Name} locked an answer! Waiting for {p2Name}...
                </div>
              )}
            </div>
          ) : null}

          {lastRound && (
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 flex flex-col gap-1">
              <span className="font-bold text-emerald-300">
                Prev Answer: {TRIVIA_BANK[lastRound.qIdx].options[lastRound.correctAns]}
              </span>
              <span>
                {p1Name}: {lastRound.p1Choice === lastRound.correctAns ? '✅' : '❌'} · {p2Name}: {lastRound.p2Choice === lastRound.correctAns ? '✅' : '❌'}
              </span>
            </div>
          )}
        </div>
      );
    }

    // 20. MATH BLITZ
    case 'math-blitz': {
      const puz = MATH_BLITZ_PUZZLES[state.puzzleIdx];
      const previewVal = evalMathBlitzOp(puz.nums, mathOp1, mathOp2, mathGrp);
      const sOp1 = mathOp1 === '*' ? '×' : mathOp1;
      const sOp2 = mathOp2 === '*' ? '×' : mathOp2;
      return (
        <div className="w-full max-w-md flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-emerald-300">Round {state.round}/{state.maxRounds}</span>
            <span className="font-mono text-white">{p1Name}: {state.scores.p1} · {p2Name}: {state.scores.p2}</span>
          </div>
          {state.lastSummary && (
            <div className="text-[11px] text-center text-emerald-300 bg-emerald-500/10 border border-emerald-400/25 px-3 py-1.5 rounded-lg">
              {state.lastSummary}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-slate-950 border border-white/15 flex flex-col items-center gap-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Make This Target</div>
            <div className="text-4xl font-black font-mono text-emerald-300">{puz.target}</div>
            <div className="text-base font-mono font-bold text-white bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              {mathGrp === 'L'
                ? `(${puz.nums[0]} ${sOp1} ${puz.nums[1]}) ${sOp2} ${puz.nums[2]}`
                : `${puz.nums[0]} ${sOp1} (${puz.nums[1]} ${sOp2} ${puz.nums[2]})`}{' '}
              = <span className={previewVal === puz.target ? 'text-emerald-400' : 'text-amber-300'}>{previewVal}</span>
            </div>
          </div>

          {canAct && (
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-bold text-center">Op 1</span>
                  <div className="grid grid-cols-3 gap-1">
                    {(['+', '-', '*'] as const).map(op => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setMathOp1(op)}
                        className={`py-1.5 rounded-lg font-mono font-extrabold text-xs cursor-pointer ${
                          mathOp1 === op ? 'bg-emerald-400 text-black' : 'bg-black/40 text-white'
                        }`}
                      >
                        {op === '*' ? '×' : op}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-bold text-center">Op 2</span>
                  <div className="grid grid-cols-3 gap-1">
                    {(['+', '-', '*'] as const).map(op => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setMathOp2(op)}
                        className={`py-1.5 rounded-lg font-mono font-extrabold text-xs cursor-pointer ${
                          mathOp2 === op ? 'bg-emerald-400 text-black' : 'bg-black/40 text-white'
                        }`}
                      >
                        {op === '*' ? '×' : op}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-bold text-center">Group</span>
                  <div className="grid grid-cols-2 gap-1">
                    {(['L', 'R'] as const).map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setMathGrp(g)}
                        className={`py-1.5 rounded-lg font-mono font-extrabold text-[10px] cursor-pointer ${
                          mathGrp === g ? 'bg-sky-400 text-black' : 'bg-black/40 text-white'
                        }`}
                      >
                        {g === 'L' ? '(AB)C' : 'A(BC)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const base = `eq:${mathOp1},${mathOp2},${mathGrp}`;
                  onAction(state.moveCount === 0 ? `${base}:${Math.floor(Math.random() * 9000) + 1}` : base);
                }}
                className="w-full py-2 rounded-xl bg-emerald-400 text-black font-extrabold text-xs cursor-pointer"
              >
                Submit Equation (= {previewVal})
              </button>
            </div>
          )}
        </div>
      );
    }

    // 21. SIMON DUEL
    case 'simon-duel': {
      const needed = state.sequence.length + 1;
      return (
        <div className="w-full max-w-[340px] flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-rose-300">Pattern Length: {state.sequence.length}/{state.maxLength}</span>
            <span className="font-mono text-slate-300">Taps: {simonTapBuf.length}/{needed}</span>
          </div>
          {state.lastNote && <div className="text-center text-[11px] text-slate-300">{state.lastNote}</div>}

          <div className="grid grid-cols-2 gap-3 p-4 rounded-3xl bg-slate-950 border border-white/15 aspect-square shadow-2xl">
            {SIMON_PADS.map(pad => {
              const isFlashing = simonFlashPad === pad.id;
              return (
                <button
                  key={pad.id}
                  type="button"
                  disabled={!canAct}
                  onClick={() => {
                    const nextBuf = [...simonTapBuf, pad.id];
                    setSimonFlashPad(pad.id);
                    window.setTimeout(() => setSimonFlashPad(null), 180);
                    const prefixIdx = nextBuf.length - 1;
                    // Submit immediately on wrong prefix or when completing length + 1
                    if (prefixIdx < state.sequence.length && nextBuf[prefixIdx] !== state.sequence[prefixIdx]) {
                      onAction(`s:${nextBuf.join(',')}`);
                      setSimonTapBuf([]);
                      return;
                    }
                    if (nextBuf.length >= needed) {
                      onAction(`s:${nextBuf.join(',')}`);
                      setSimonTapBuf([]);
                      return;
                    }
                    setSimonTapBuf(nextBuf);
                  }}
                  className={`rounded-2xl font-extrabold text-white text-sm transition-all cursor-pointer disabled:opacity-65 ${
                    isFlashing ? pad.active : pad.idle
                  }`}
                >
                  {pad.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => replaySimonSequence(state.sequence)}
            className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-extrabold text-white cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Replay {state.sequence.length}-Step Pattern
          </button>
        </div>
      );
    }

    // 22. BOGGLE 4x4 HUNT
    case 'boggle-duel': {
      const grid = BOGGLE_BOARDS[state.boardIdx].grid;
      const tracedWord = bogglePath.map(i => grid[i]).join('');
      const lastIdx = bogglePath[bogglePath.length - 1];
      const isAdj = (idx: number) => {
        if (lastIdx === undefined) return true;
        const r1 = Math.floor(lastIdx / 4), c1 = lastIdx % 4;
        const r2 = Math.floor(idx / 4), c2 = idx % 4;
        return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1 && !bogglePath.includes(idx);
      };
      return (
        <div className="w-full max-w-[350px] flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-orange-300">{p1Name}: {state.scores.p1} · {p2Name}: {state.scores.p2}</span>
            <span className="font-mono text-slate-300">{state.turnsLeft} turns left</span>
          </div>
          {state.lastError && <div className="text-[11px] text-center text-rose-300">{state.lastError}</div>}

          <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-slate-950 border border-orange-400/30 aspect-square shadow-2xl">
            {grid.map((letter, idx) => {
              const selectedPos = bogglePath.indexOf(idx);
              const clickable = canAct && isAdj(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!canAct || (!clickable && selectedPos !== bogglePath.length - 1)}
                  onClick={() => {
                    if (selectedPos === bogglePath.length - 1) setBogglePath(bogglePath.slice(0, -1));
                    else if (clickable) setBogglePath([...bogglePath, idx]);
                  }}
                  className={`rounded-xl border-2 text-2xl font-black transition-all ${
                    selectedPos !== -1
                      ? 'bg-orange-400 text-black border-white scale-105'
                      : clickable
                      ? 'bg-white/10 text-white border-white/20 hover:bg-orange-500/25 cursor-pointer'
                      : 'bg-black/40 text-slate-500 border-white/10'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          {canAct && (
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 font-mono text-sm font-black text-orange-300 min-h-[38px]">
                {tracedWord || 'Tap adjacent letters...'}
              </div>
              <button
                type="button"
                disabled={tracedWord.length < 3}
                onClick={() => onAction(`w:${tracedWord}`)}
                className="px-3 py-2 rounded-xl bg-orange-400 text-black text-xs font-extrabold disabled:opacity-40 cursor-pointer"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => setBogglePath([])}
                className="px-2.5 py-2 rounded-xl bg-white/10 text-xs text-slate-300 cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => onAction('pass')}
                className="px-2.5 py-2 rounded-xl bg-white/10 text-xs text-slate-300 cursor-pointer"
              >
                Pass
              </button>
            </div>
          )}

          {state.claimed.length > 0 && (
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {state.claimed.map((w, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-slate-200">
                  {w.word} (+{w.pts})
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }

    // 23. SUDOKU DUEL 4x4
    case 'sudoku-duel': {
      return (
        <div className="w-full max-w-[340px] flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-teal-300">{p1Name}: {state.scores.p1} pts</span>
            <span className="font-bold text-amber-300">{p2Name}: {state.scores.p2} pts</span>
          </div>
          {state.lastNote && <div className="text-[11px] text-center text-slate-300">{state.lastNote}</div>}

          <div className="grid grid-cols-4 gap-1.5 p-2.5 rounded-2xl bg-slate-950 border border-teal-400/35 aspect-square shadow-2xl">
            {state.grid.map((row, r) =>
              row.map((val, c) => {
                const isSelected = sudokuCell?.[0] === r && sudokuCell?.[1] === c;
                const isFixed = state.fixed[r][c];
                const boxTint = (Math.floor(r / 2) + Math.floor(c / 2)) % 2 === 0 ? 'bg-white/10' : 'bg-white/5';
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    disabled={!canAct || val !== null}
                    onClick={() => setSudokuCell(isSelected ? null : [r, c])}
                    className={`rounded-xl border text-2xl font-black font-mono flex items-center justify-center ${boxTint} ${
                      isSelected ? 'border-teal-300 ring-2 ring-teal-400' : 'border-white/15'
                    } ${isFixed ? 'text-slate-300' : val !== null ? 'text-teal-300' : 'text-white cursor-pointer'}`}
                  >
                    {val ?? ''}
                  </button>
                );
              })
            )}
          </div>

          {canAct && (
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(d => (
                <button
                  key={d}
                  type="button"
                  disabled={!sudokuCell}
                  onClick={() => {
                    if (sudokuCell) onAction(`c:${sudokuCell[0]},${sudokuCell[1]},${d}`);
                  }}
                  className="py-2 rounded-xl bg-teal-400 text-black font-black text-base disabled:opacity-35 cursor-pointer"
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // 24. UNO COLOR DUEL
    case 'uno-duel': {
      const needsDeal = state.hands.p1.length === 0 && state.hands.p2.length === 0;
      const mySeat: Batch2Player = viewerRole === 'p2' ? 'p2' : viewerRole === 'local' ? state.turn : 'p1';
      const canSeeHand = viewerRole === 'local' ? localPeek || true : viewerRole === mySeat || Boolean(state.winner);
      const shownHand = state.hands[mySeat];
      const oppSeat: Batch2Player = mySeat === 'p1' ? 'p2' : 'p1';

      return (
        <div className="w-full max-w-md flex flex-col gap-3">
          {needsDeal ? (
            <div className="p-6 rounded-2xl bg-slate-950 border border-white/15 flex flex-col items-center gap-3">
              <div className="text-xs text-slate-300">Ready to deal 7 cards each!</div>
              {canAct && (
                <button
                  type="button"
                  onClick={() => onAction(`deal:${Math.floor(Math.random() * 90000) + 1}`)}
                  className="px-5 py-2.5 rounded-xl bg-rose-500 text-white font-extrabold text-xs cursor-pointer shadow-lg"
                >
                  🃏 Deal Cards
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <span>{ownerName(oppSeat)}: <strong>{state.hands[oppSeat].length} cards</strong></span>
                <span className="font-mono text-amber-300">Active Color: {state.activeColor}</span>
                <span>{ownerName(mySeat)}: <strong>{shownHand.length} cards</strong></span>
              </div>

              <div className="flex items-center justify-center gap-4 p-4 rounded-2xl bg-slate-950 border border-white/15">
                <div className={`w-20 h-28 rounded-2xl bg-gradient-to-br border-2 flex flex-col items-center justify-center shadow-2xl ${UNO_COLOR_STYLES[state.topCard.color === 'W' ? state.activeColor : state.topCard.color]}`}>
                  <span className="text-xl font-black">{state.topCard.value}</span>
                  <span className="text-[10px] font-bold uppercase opacity-80">{formatUnoCard(state.topCard)}</span>
                </div>
                {canAct && (
                  <button
                    type="button"
                    onClick={() => onAction('draw')}
                    className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-extrabold text-white cursor-pointer"
                  >
                    + Draw Card
                  </button>
                )}
              </div>

              {state.lastNote && <div className="text-center text-[11px] text-slate-300">{state.lastNote}</div>}

              {wildCardIdx !== null && canAct && (
                <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-black/50 border border-white/20">
                  <span className="text-xs font-bold text-white">Pick Wild Color:</span>
                  {(['R', 'B', 'G', 'Y'] as UnoColor[]).map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => {
                        onAction(`p:${wildCardIdx}:${col}`);
                        setWildCardIdx(null);
                      }}
                      className={`px-3 py-1 rounded-lg bg-gradient-to-br text-xs font-extrabold border cursor-pointer ${UNO_COLOR_STYLES[col]}`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-1.5">
                {canSeeHand &&
                  shownHand.map((card, idx) => {
                    const playable =
                      canAct &&
                      state.turn === mySeat &&
                      (card.value === 'WILD' || card.color === state.activeColor || card.value === state.topCard.value);
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={!playable}
                        onClick={() => {
                          if (card.value === 'WILD') setWildCardIdx(idx);
                          else onAction(`p:${idx}`);
                        }}
                        className={`w-14 h-20 rounded-xl bg-gradient-to-br border-2 flex flex-col items-center justify-center font-black shadow-lg transition-transform ${
                          UNO_COLOR_STYLES[card.color]
                        } ${playable ? 'hover:-translate-y-1 cursor-pointer ring-2 ring-white/80' : 'opacity-50 cursor-default'}`}
                      >
                        <span className="text-sm">{card.value}</span>
                      </button>
                    );
                  })}
              </div>
            </>
          )}
        </div>
      );
    }

    // 25. GO FISH
    case 'go-fish': {
      const needsDeal = state.hands.p1.length === 0 && state.hands.p2.length === 0 && state.books.p1.length === 0 && state.books.p2.length === 0;
      const mySeat: Batch2Player = viewerRole === 'p2' ? 'p2' : viewerRole === 'local' ? state.turn : 'p1';
      const handRanks = Array.from(new Set(state.hands[mySeat]));
      return (
        <div className="w-full max-w-md flex flex-col gap-3">
          {needsDeal ? (
            <div className="p-6 rounded-2xl bg-slate-950 border border-white/15 flex flex-col items-center gap-3">
              <div className="text-xs text-slate-300">32-card pond (Ranks 2–9)</div>
              {canAct && (
                <button
                  type="button"
                  onClick={() => onAction(`deal:${Math.floor(Math.random() * 90000) + 1}`)}
                  className="px-5 py-2.5 rounded-xl bg-sky-400 text-black font-extrabold text-xs cursor-pointer"
                >
                  🐟 Deal Go Fish
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                <span className="font-bold text-sky-300">{p1Name}: {state.books.p1.length} pairs</span>
                <span className="font-mono text-slate-300">Pond: {state.pond.length}</span>
                <span className="font-bold text-amber-300">{p2Name}: {state.books.p2.length} pairs</span>
              </div>
              {state.lastNote && <div className="text-center text-xs text-emerald-300">{state.lastNote}</div>}

              <div className="p-4 rounded-2xl bg-slate-950 border border-white/15 flex flex-col gap-2">
                <div className="text-xs font-bold text-slate-300">
                  {ownerName(mySeat)}’s Hand — Tap a rank to Ask Opponent:
                </div>
                <div className="flex flex-wrap gap-2">
                  {handRanks.length > 0 ? (
                    handRanks.map(r => (
                      <button
                        key={r}
                        type="button"
                        disabled={!canAct || state.turn !== mySeat}
                        onClick={() => onAction(`ask:${r}`)}
                        className="px-4 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/50 text-sm font-black text-white cursor-pointer disabled:opacity-50"
                      >
                        Ask for {r}
                      </button>
                    ))
                  ) : canAct && state.turn === mySeat ? (
                    <button
                      type="button"
                      onClick={() => onAction('draw')}
                      className="px-4 py-2 rounded-xl bg-sky-400 text-black text-xs font-extrabold cursor-pointer"
                    >
                      Draw from Pond
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">Waiting...</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      );
    }

    // 26. POKER DICE
    case 'poker-dice': {
      const rankInfo = state.dice[0] > 0 ? pokerDiceRank(state.dice) : null;
      return (
        <div className="w-full max-w-md flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-amber-300">Round {state.round}/{state.maxRounds}</span>
            <span className="font-mono text-white">{p1Name}: {state.scores.p1} · {p2Name}: {state.scores.p2}</span>
          </div>
          {state.lastNote && <div className="text-center text-xs text-emerald-300">{state.lastNote}</div>}

          <div className="p-4 rounded-2xl bg-slate-950 border border-white/15 flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {state.dice.map((d, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={!canAct || state.rollsLeft === 3 || state.rollsLeft === 0}
                  onClick={() => onAction(`toggle:${idx}`)}
                  className={`w-12 h-14 rounded-xl border-2 flex flex-col items-center justify-center font-black text-lg cursor-pointer transition-all ${
                    state.held[idx]
                      ? 'bg-amber-400 text-black border-white -translate-y-1'
                      : 'bg-white/10 text-white border-white/25'
                  }`}
                >
                  <span>{d || '?'}</span>
                  {state.held[idx] && <span className="text-[8px] font-bold">HOLD</span>}
                </button>
              ))}
            </div>
            {rankInfo && (
              <div className="text-xs font-extrabold text-amber-300">
                {rankInfo.name} ({rankInfo.pts} pts)
              </div>
            )}
            {canAct && (
              <div className="flex gap-2">
                {state.rollsLeft > 0 && (
                  <button
                    type="button"
                    onClick={() => onAction(`roll:${Math.floor(Math.random() * 90000) + 1}`)}
                    className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-extrabold cursor-pointer"
                  >
                    Roll Dice ({state.rollsLeft} left)
                  </button>
                )}
                {state.rollsLeft < 3 && (
                  <button
                    type="button"
                    onClick={() => onAction('bank')}
                    className="px-4 py-2 rounded-xl bg-emerald-400 text-black text-xs font-extrabold cursor-pointer"
                  >
                    Bank {rankInfo?.pts || 0} pts
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // 27. LIAR'S DICE
    case 'liars-dice': {
      const needsInit = state.pools.p1.length === 0;
      const mySeat: Batch2Player = viewerRole === 'p2' ? 'p2' : viewerRole === 'local' ? state.turn : 'p1';
      const showMyDice = viewerRole === 'local' ? localPeek : true;
      const totalDice = state.diceCounts.p1 + state.diceCounts.p2;
      const bidValid =
        !state.currentBid ||
        liarBidQty > state.currentBid.qty ||
        (liarBidQty === state.currentBid.qty && liarBidFace > state.currentBid.face);

      return (
        <div className="w-full max-w-md flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-orange-300">{p1Name}: {state.diceCounts.p1} dice</span>
            <span className="font-bold text-sky-300">{p2Name}: {state.diceCounts.p2} dice</span>
          </div>

          {needsInit ? (
            <div className="p-6 rounded-2xl bg-slate-950 border border-white/15 flex flex-col items-center gap-3">
              {canAct && (
                <button
                  type="button"
                  onClick={() => onAction(`roll:${Math.floor(Math.random() * 90000) + 1}`)}
                  className="px-5 py-2.5 rounded-xl bg-orange-400 text-black font-extrabold text-xs cursor-pointer"
                >
                  🎲 Shake Hidden Dice
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="p-3 rounded-2xl bg-slate-950 border border-white/15 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300">{ownerName(mySeat)}’s Cup:</span>
                  {viewerRole === 'local' && (
                    <button
                      type="button"
                      onClick={() => setLocalPeek(v => !v)}
                      className="text-[11px] px-2 py-0.5 rounded bg-white/10 text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      {localPeek ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {localPeek ? 'Hide' : 'Peek'}
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {state.pools[mySeat].map((d, i) => (
                    <span key={i} className="w-9 h-9 rounded-lg bg-white/10 border border-white/25 flex items-center justify-center font-black text-white">
                      {showMyDice ? d : '?'}
                    </span>
                  ))}
                </div>
                {state.currentBid ? (
                  <div className="text-sm font-extrabold text-amber-300 mt-1">
                    Current Bid: {state.currentBid.qty} × [{state.currentBid.face}] (by {ownerName(state.currentBid.by)})
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">Open table — place the first bid!</div>
                )}
              </div>

              {canAct && (
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
                  <div className="flex items-center justify-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5">
                      <span>Qty:</span>
                      <input
                        type="number"
                        min={1}
                        max={totalDice}
                        value={liarBidQty}
                        onChange={e => setLiarBidQty(Math.max(1, Math.min(totalDice, Number(e.target.value))))}
                        className="w-14 px-2 py-1 rounded bg-black/50 border border-white/20 text-white font-mono"
                      />
                    </label>
                    <label className="flex items-center gap-1.5">
                      <span>Face:</span>
                      <select
                        value={liarBidFace}
                        onChange={e => setLiarBidFace(Number(e.target.value))}
                        className="px-2 py-1 rounded bg-black/50 border border-white/20 text-white font-mono"
                      >
                        {[1, 2, 3, 4, 5, 6].map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!bidValid}
                      onClick={() => onAction(`bid:${liarBidQty},${liarBidFace}`)}
                      className="flex-1 py-2 rounded-xl bg-orange-400 text-black text-xs font-extrabold disabled:opacity-40 cursor-pointer"
                    >
                      Bid {liarBidQty}×{liarBidFace}
                    </button>
                    {state.currentBid && (
                      <button
                        type="button"
                        onClick={() => onAction('liar')}
                        className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-extrabold cursor-pointer"
                      >
                        Call LIAR!
                      </button>
                    )}
                  </div>
                </div>
              )}

              {state.lastReveal && (
                <div className="text-[11px] text-center text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                  Last Call: Bid {state.lastReveal.bidQty}×[{state.lastReveal.bidFace}], Actual {state.lastReveal.actualCount} — {ownerName(state.lastReveal.loser)} lost a die!
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    // 28. FARKLE 1500
    case 'farkle-duel': {
      const selectedDice = state.activeDice.filter((_, i) => farkleMask[i]);
      const selEval = scoreFarkleDice(selectedDice);
      return (
        <div className="w-full max-w-md flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-emerald-300">{p1Name}: {state.scores.p1}/{state.target}</span>
            <span className="font-mono text-amber-300">Bank: +{state.turnBank}</span>
            <span className="font-bold text-sky-300">{p2Name}: {state.scores.p2}/{state.target}</span>
          </div>
          {state.lastEvent && <div className="text-center text-xs text-slate-200">{state.lastEvent}</div>}

          <div className="p-4 rounded-2xl bg-slate-950 border border-white/15 flex flex-col items-center gap-3">
            {state.activeDice.length > 0 ? (
              <>
                <div className="flex gap-2 flex-wrap justify-center">
                  {state.activeDice.map((d, i) => {
                    const picked = Boolean(farkleMask[i]);
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={!canAct}
                        onClick={() => {
                          const next = state.activeDice.map((_, idx) => Boolean(farkleMask[idx]));
                          next[i] = !next[i];
                          setFarkleMask(next);
                        }}
                        className={`w-11 h-11 rounded-xl border-2 font-black text-lg cursor-pointer ${
                          picked ? 'bg-emerald-400 text-black border-white scale-105' : 'bg-white/10 text-white border-white/25'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
                {canAct && (
                  <button
                    type="button"
                    disabled={!selEval.allUsed || selEval.pts <= 0}
                    onClick={() => {
                      const bits = state.activeDice.map((_, idx) => (farkleMask[idx] ? '1' : '0')).join('');
                      onAction(`keep:${bits}`);
                    }}
                    className="px-5 py-2 rounded-xl bg-emerald-400 text-black text-xs font-extrabold disabled:opacity-40 cursor-pointer"
                  >
                    Keep Selected ({selEval.label})
                  </button>
                )}
              </>
            ) : (
              canAct && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onAction(`roll:${Math.floor(Math.random() * 90000) + 1}`)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-400 text-black text-xs font-extrabold cursor-pointer"
                  >
                    🎲 Roll {state.waitingToRollCount} Dice
                  </button>
                  {state.turnBank > 0 && (
                    <button
                      type="button"
                      onClick={() => onAction('bank')}
                      className="px-5 py-2.5 rounded-xl bg-amber-400 text-black text-xs font-extrabold cursor-pointer"
                    >
                      Bank +{state.turnBank}
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      );
    }

    // 29. COINS FROM ENDS
    case 'coin-row': {
      return (
        <div className="w-full max-w-md flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-amber-300">{p1Name}: ${state.scores.p1}</span>
            <span className="font-bold text-sky-300">{p2Name}: ${state.scores.p2}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 p-4 rounded-2xl bg-slate-950 border border-white/15">
            {state.coins.map((val, idx) => {
              const isEnd = idx === 0 || idx === state.coins.length - 1;
              return (
                <span
                  key={idx}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-xs shadow-lg ${
                    isEnd
                      ? 'bg-gradient-to-br from-amber-300 to-yellow-600 text-slate-950 border-white ring-2 ring-amber-400/50'
                      : 'bg-slate-800 text-amber-200 border-amber-500/40'
                  }`}
                >
                  ${val}
                </span>
              );
            })}
          </div>
          {canAct && state.coins.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onAction('left')}
                className="py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs cursor-pointer"
              >
                ← Take Left (${state.coins[0]})
              </button>
              <button
                type="button"
                onClick={() => onAction('right')}
                className="py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs cursor-pointer"
              >
                Take Right (${state.coins[state.coins.length - 1]}) →
              </button>
            </div>
          )}
        </div>
      );
    }

    // 30. HIGH NOON DUEL
    case 'high-noon-duel': {
      const canShoot = state.ammo[state.turn] > 0;
      const last = state.history[state.history.length - 1];
      return (
        <div className="w-full max-w-md flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-950 border border-rose-500/30 flex flex-col items-center gap-1">
              <span className="text-xs font-extrabold text-white">🤠 {p1Name}</span>
              <span className="text-sm">{'❤️'.repeat(Math.max(0, state.hp.p1)) || '💀'}</span>
              <span className="text-xs font-mono text-amber-300">Ammo: {state.ammo.p1}/3</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-amber-500/30 flex flex-col items-center gap-1">
              <span className="text-xs font-extrabold text-white">🏴‍☠️ {p2Name}</span>
              <span className="text-sm">{'❤️'.repeat(Math.max(0, state.hp.p2)) || '💀'}</span>
              <span className="text-xs font-mono text-amber-300">Ammo: {state.ammo.p2}/3</span>
            </div>
          </div>

          {canAct && (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onAction('a:reload')}
                className="py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs flex flex-col items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload (+1)</span>
              </button>
              <button
                type="button"
                disabled={!canShoot}
                onClick={() => onAction('a:shoot')}
                className="py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs flex flex-col items-center gap-1 cursor-pointer disabled:opacity-35"
              >
                <Zap className="w-4 h-4" />
                <span>Shoot (−1)</span>
              </button>
              <button
                type="button"
                onClick={() => onAction('a:shield')}
                className="py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs flex flex-col items-center gap-1 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Shield</span>
              </button>
            </div>
          )}

          {state.pendingP1 && (
            <div className="text-center text-xs text-amber-300">
              {p1Name} locked an action! Waiting for {p2Name}...
            </div>
          )}

          {last && (
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-center text-slate-200">
              R{last.round}: {last.note}
            </div>
          )}
        </div>
      );
    }
  }
};
