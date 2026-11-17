import React, { useEffect, useState } from 'react';
import {
  ArcadePlayer,
  cardValue21,
  EMOJI_PALETTE,
  ExtendedArcadeState,
  formatCardLabel,
  MASTERMIND_COLORS,
  PIXEL_DRAW_COLORS,
  RpsChoice,
  scoreYachtCategory
} from '../utils/arcadeEngines';
import { Check, Eraser, Eye, EyeOff, RefreshCw, RotateCw, Send, Shuffle, Sparkles, Trash2 } from 'lucide-react';

interface ExtendedArcadeBoardProps {
  state: ExtendedArcadeState;
  canAct: boolean;
  viewerRole: ArcadePlayer | 'local' | 'spectator';
  p1Name: string;
  p2Name: string;
  onAction: (action: string) => void;
}

export const ExtendedArcadeBoard: React.FC<ExtendedArcadeBoardProps> = ({
  state,
  canAct,
  viewerRole,
  p1Name,
  p2Name,
  onAction
}) => {
  const [selectedColor, setSelectedColor] = useState(2); // Pixel Pictionary color
  const [pixelCustomWord, setPixelCustomWord] = useState('');
  const [charadeCustom, setCharadeCustom] = useState('');
  const [guessText, setGuessText] = useState('');
  const [hoverNim, setHoverNim] = useState<{ heap: number; idx: number } | null>(null);
  const [hoverChomp, setHoverChomp] = useState<[number, number] | null>(null);
  const [orderSym, setOrderSym] = useState<'X' | 'O'>('X');
  const [cramDir, setCramDir] = useState<'h' | 'v'>('h');
  const [sosChar, setSosChar] = useState<'S' | 'O'>('S');
  const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(null);
  const [selectedChaserIdx, setSelectedChaserIdx] = useState<number>(0);
  const [wordSecretInput, setWordSecretInput] = useState('');
  const [wordGuessInput, setWordGuessInput] = useState('');
  const [codeDraft, setCodeDraft] = useState<number[]>([0, 1, 2, 3]);
  const [activeCodeSlot, setActiveCodeSlot] = useState(0);
  const [hiloInput, setHiloInput] = useState('50');
  const [chainInput, setChainInput] = useState('');
  const [localPeekSecret, setLocalPeekSecret] = useState(false);

  useEffect(() => {
    setSelectedPiece(null);
    setGuessText('');
    setWordGuessInput('');
    setLocalPeekSecret(false);
  }, [state.gameType]);

  const ownerName = (p: ArcadePlayer) => (p === 'p1' ? p1Name : p2Name);

  switch (state.gameType) {
    // 1. PIXEL PICTIONARY (10x10)
    case 'pixel-guess': {
      const isDrawerViewer =
        viewerRole === state.drawer || (viewerRole === 'local' && state.phase !== 'guess');
      const mask = (state.word || '')
        .split('')
        .map(ch => (ch === ' ' ? '   ' : '_'))
        .join(' ');
      const showSecret =
        (viewerRole === state.drawer && state.word) ||
        (viewerRole === 'local' && localPeekSecret && state.word);

      return (
        <div className="w-full max-w-xl flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-xs">
            <span className="font-bold text-slate-200">
              Round {state.round}/{state.maxRounds} · Artist: <span className="text-pink-300">{ownerName(state.drawer)}</span>
            </span>
            <span className="font-mono font-bold tabular-nums text-slate-300">
              {p1Name}: {state.scores.p1} · {p2Name}: {state.scores.p2}
            </span>
          </div>

          {state.lastRoundResult && (
            <div className="text-center text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-400/25 rounded-xl px-3 py-1.5">
              Round {state.lastRoundResult.round}: Word was “{state.lastRoundResult.word}”{' '}
              {state.lastRoundResult.guessed ? `(+${state.lastRoundResult.points} pts!)` : '(Missed)'}
            </div>
          )}

          {state.phase === 'pick' && (
            <div className="p-4 rounded-2xl border border-white/15 bg-black/25 flex flex-col gap-3">
              {canAct && isDrawerViewer ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white">Pick a word to paint in 10×10 pixels:</span>
                    <button
                      type="button"
                      onClick={() => onAction('pr')}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Shuffle className="w-3 h-3" /> Reroll
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {state.wordChoices.map(w => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => onAction(`pw:${w}`)}
                        className="px-3 py-2.5 rounded-xl border border-pink-400/40 bg-pink-500/15 hover:bg-pink-500/30 text-white font-extrabold text-xs capitalize cursor-pointer"
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      const clean = pixelCustomWord.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 20);
                      if (clean.length >= 2) {
                        onAction(`pw:${clean}`);
                        setPixelCustomWord('');
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={pixelCustomWord}
                      onChange={e => setPixelCustomWord(e.target.value)}
                      placeholder="Or custom word..."
                      maxLength={20}
                      className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none"
                    />
                    <button type="submit" className="px-3.5 py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-xs cursor-pointer">
                      Pick
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-6 text-xs text-slate-300 font-semibold">
                  {ownerName(state.drawer)} is choosing a pixel word...
                </div>
              )}
            </div>
          )}

          {state.phase !== 'pick' && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs">
                <div>
                  {showSecret ? (
                    <span className="font-extrabold text-emerald-300">Secret Word: {state.word?.toUpperCase()}</span>
                  ) : (
                    <span className="font-mono tracking-widest text-slate-200">Clue: {mask}</span>
                  )}
                </div>
                {viewerRole === 'local' && state.word && (
                  <button
                    type="button"
                    onClick={() => setLocalPeekSecret(v => !v)}
                    className="px-2 py-1 rounded-lg bg-white/10 text-[11px] font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    {localPeekSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{localPeekSecret ? 'Hide' : 'Peek'}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-10 gap-1 p-2.5 rounded-2xl bg-slate-950 border border-white/15 shadow-inner">
                {state.grid.map((cIdx, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={!(state.phase === 'draw' && canAct && isDrawerViewer)}
                    onClick={() => onAction(`px:${idx}:${selectedColor}`)}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded border border-white/10 transition-transform hover:scale-105 cursor-pointer disabled:cursor-default"
                    style={{ backgroundColor: PIXEL_DRAW_COLORS[cIdx] || PIXEL_DRAW_COLORS[0] }}
                  />
                ))}
              </div>

              {state.phase === 'draw' && canAct && isDrawerViewer && (
                <div className="w-full flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-black/30 border border-white/10">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {PIXEL_DRAW_COLORS.map((hex, i) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setSelectedColor(i)}
                        className={`w-6 h-6 rounded-lg border-2 cursor-pointer flex items-center justify-center ${
                          selectedColor === i ? 'border-white scale-110' : 'border-white/20'
                        }`}
                        style={{ backgroundColor: hex }}
                        title={i === 0 ? 'Eraser' : `Color ${i}`}
                      >
                        {i === 0 && <Eraser className="w-3 h-3 text-slate-300" />}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onAction('pc')}
                      className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => onAction('pd')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Art
                    </button>
                  </div>
                </div>
              )}

              {state.phase === 'guess' && (
                <div className="w-full flex flex-col gap-2">
                  {state.guesses.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {state.guesses.map((g, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-400/30 text-rose-200">
                          {g.text} {g.hint ? `(${g.hint})` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                  {canAct && (viewerRole === state.guesser || viewerRole === 'local') ? (
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        const clean = guessText.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 24);
                        if (clean) {
                          onAction(`pg:${clean}`);
                          setGuessText('');
                        }
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={guessText}
                        onChange={e => setGuessText(e.target.value)}
                        placeholder={`Guess the pixel art (${3 - state.guesses.length} tries left)...`}
                        className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none"
                      />
                      <button type="submit" className="px-4 py-2 rounded-xl bg-sky-400 text-black font-extrabold text-xs cursor-pointer">
                        Guess
                      </button>
                    </form>
                  ) : (
                    <div className="text-center text-xs text-slate-400">
                      Waiting for {ownerName(state.guesser)} to guess...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // 2. EMOJI CHARADES
    case 'emoji-charades': {
      const isSender = viewerRole === state.sender || (viewerRole === 'local' && state.phase !== 'guess');
      const showSecret =
        (viewerRole === state.sender && state.secret) ||
        (viewerRole === 'local' && localPeekSecret && state.secret);

      return (
        <div className="w-full max-w-xl flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-xs">
            <span className="font-bold text-slate-200">
              Round {state.round}/{state.maxRounds} · Clue Maker: <span className="text-amber-300">{ownerName(state.sender)}</span>
            </span>
            <span className="font-mono font-bold tabular-nums text-slate-300">
              {p1Name}: {state.scores.p1} · {p2Name}: {state.scores.p2}
            </span>
          </div>

          {state.lastRoundResult && (
            <div className="text-center text-xs font-semibold text-amber-200 bg-amber-500/10 border border-amber-400/25 rounded-xl px-3 py-1.5">
              Round {state.lastRoundResult.round}: Answer was “{state.lastRoundResult.secret}”{' '}
              {state.lastRoundResult.guessed ? `(+${state.lastRoundResult.points} pts!)` : '(Missed)'}
            </div>
          )}

          {state.phase === 'pick' && (
            <div className="p-4 rounded-2xl border border-white/15 bg-black/25 flex flex-col gap-3">
              {canAct && isSender ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white">Choose a secret phrase to act with emojis:</span>
                    <button
                      type="button"
                      onClick={() => onAction('er')}
                      className="px-2.5 py-1 rounded-lg bg-white/10 text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Shuffle className="w-3 h-3" /> Reroll
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {state.promptChoices.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => onAction(`ew:${p}`)}
                        className="px-3 py-2.5 rounded-xl border border-amber-400/40 bg-amber-500/15 hover:bg-amber-500/30 text-white font-extrabold text-xs capitalize cursor-pointer"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      const clean = charadeCustom.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 28);
                      if (clean.length >= 2) {
                        onAction(`ew:${clean}`);
                        setCharadeCustom('');
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={charadeCustom}
                      onChange={e => setCharadeCustom(e.target.value)}
                      placeholder="Or custom phrase (e.g. ice cream)..."
                      maxLength={28}
                      className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none"
                    />
                    <button type="submit" className="px-3.5 py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-xs cursor-pointer">
                      Use
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-6 text-xs text-slate-300">
                  {ownerName(state.sender)} is picking an Emoji Charades prompt...
                </div>
              )}
            </div>
          )}

          {state.phase !== 'pick' && (
            <div className="p-4 rounded-2xl border border-white/15 bg-black/25 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                {showSecret ? (
                  <span className="font-extrabold text-emerald-300">Secret: {state.secret?.toUpperCase()}</span>
                ) : (
                  <span className="font-mono text-slate-300">
                    Hint: {state.secret?.split(' ').map(w => `${w.length} letters`).join(' + ')}
                  </span>
                )}
                {viewerRole === 'local' && state.secret && (
                  <button
                    type="button"
                    onClick={() => setLocalPeekSecret(v => !v)}
                    className="px-2 py-1 rounded-lg bg-white/10 text-[11px] font-bold text-slate-200 cursor-pointer"
                  >
                    {localPeekSecret ? 'Hide' : 'Peek'}
                  </button>
                )}
              </div>

              <div className="min-h-[68px] rounded-xl bg-slate-950 border border-white/15 flex items-center justify-center gap-3 px-4 py-3 text-3xl">
                {state.emojis.length > 0 ? (
                  state.emojis.map((em, i) => <span key={i}>{em}</span>)
                ) : (
                  <span className="text-xs text-slate-500 font-sans">Pick 1–6 emojis below...</span>
                )}
              </div>

              {state.phase === 'clue' && canAct && isSender && (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-8 sm:grid-cols-12 gap-1 max-h-36 overflow-y-auto p-1.5 rounded-xl bg-black/40 border border-white/10">
                    {EMOJI_PALETTE.map(em => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => onAction(`ea:${em}`)}
                        disabled={state.emojis.length >= 6}
                        className="p-1.5 rounded-lg hover:bg-white/15 text-lg cursor-pointer disabled:opacity-40"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onAction('ed')}
                      disabled={state.emojis.length === 0}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-bold text-slate-200 cursor-pointer disabled:opacity-40"
                    >
                      Undo Emoji
                    </button>
                    <button
                      type="button"
                      onClick={() => onAction('es')}
                      disabled={state.emojis.length === 0}
                      className="px-4 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-extrabold cursor-pointer disabled:opacity-40"
                    >
                      Send Clues
                    </button>
                  </div>
                </div>
              )}

              {state.phase === 'guess' && (
                <div className="flex flex-col gap-2">
                  {state.guesses.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {state.guesses.map((g, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-lg bg-rose-500/15 text-rose-200 border border-rose-400/25">
                          {g.text} {g.hint ? `(${g.hint})` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                  {canAct && (viewerRole === state.guesser || viewerRole === 'local') ? (
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        const clean = guessText.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 32);
                        if (clean) {
                          onAction(`eg:${clean}`);
                          setGuessText('');
                        }
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={guessText}
                        onChange={e => setGuessText(e.target.value)}
                        placeholder={`Type what the emojis mean (${3 - state.guesses.length} tries)...`}
                        className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none"
                      />
                      <button type="submit" className="px-4 py-2 rounded-xl bg-amber-400 text-black font-extrabold text-xs cursor-pointer">
                        Guess
                      </button>
                    </form>
                  ) : (
                    <div className="text-center text-xs text-slate-400">
                      Waiting for {ownerName(state.guesser)} to guess...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // 3 & 4. NIM & MISERE NIM
    case 'nim':
    case 'misere-nim': {
      const isMisere = state.gameType === 'misere-nim';
      return (
        <div className="w-full max-w-md flex flex-col items-center gap-3">
          <div className="text-xs text-slate-300 font-semibold text-center">
            {isMisere
              ? 'Poison Rule: Click a stone to remove it & all stones to its right. Whoever takes the LAST stone loses!'
              : 'Click a stone to remove it & all stones to its right. Whoever takes the LAST stone wins!'}
          </div>
          <div className="w-full flex flex-col gap-2.5 p-4 rounded-2xl bg-slate-950 border border-white/15">
            {state.heaps.map((count, heapIdx) => (
              <div key={heapIdx} className="flex items-center justify-center gap-2 min-h-[44px]">
                <span className="text-[11px] font-mono text-slate-500 w-10">Row {heapIdx + 1}</span>
                <div className="flex items-center justify-center gap-2 flex-1">
                  {count === 0 ? (
                    <span className="text-[11px] text-slate-600 font-mono">Empty</span>
                  ) : (
                    Array.from({ length: count }).map((_, sIdx) => {
                      const takeCount = count - sIdx;
                      const isLit = hoverNim && hoverNim.heap === heapIdx && sIdx >= hoverNim.idx;
                      return (
                        <button
                          key={sIdx}
                          type="button"
                          disabled={!canAct}
                          onMouseEnter={() => setHoverNim({ heap: heapIdx, idx: sIdx })}
                          onMouseLeave={() => setHoverNim(null)}
                          onClick={() => onAction(`n:${heapIdx}:${takeCount}`)}
                          className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer disabled:cursor-not-allowed flex items-center justify-center text-xs font-extrabold ${
                            isLit
                              ? isMisere
                                ? 'bg-purple-400 border-white text-black scale-110'
                                : 'bg-amber-400 border-white text-black scale-110'
                              : isMisere
                              ? 'bg-purple-500/30 border-purple-400/60 text-purple-100'
                              : 'bg-amber-500/30 border-amber-400/60 text-amber-100'
                          }`}
                          title={`Take ${takeCount} from Row ${heapIdx + 1}`}
                        >
                          {isLit ? `-${takeCount}` : '🪨'}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 5. CHOMP CHOCOLATE
    case 'chomp': {
      return (
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs text-slate-300 text-center">
            Bite any square to eat everything below &amp; right of it. Avoid eating the top-left 🌶️ poison square!
          </p>
          <div className="grid grid-cols-6 gap-1.5 p-3.5 rounded-2xl bg-amber-950/50 border border-amber-700/40 shadow-xl">
            {state.eaten.map((row, r) =>
              row.map((isEaten, c) => {
                const isPoison = r === 0 && c === 0;
                const willEat =
                  hoverChomp && !isEaten && r >= hoverChomp[0] && c >= hoverChomp[1];
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    disabled={!canAct || isEaten}
                    onMouseEnter={() => !isEaten && setHoverChomp([r, c])}
                    onMouseLeave={() => setHoverChomp(null)}
                    onClick={() => onAction(`ch:${r},${c}`)}
                    className={`w-11 h-11 rounded-xl border text-base font-bold transition-all ${
                      isEaten
                        ? 'opacity-10 bg-black/40 border-white/5 cursor-default'
                        : isPoison
                        ? 'bg-rose-600/80 border-rose-300 text-white cursor-pointer hover:scale-105'
                        : willEat
                        ? 'bg-amber-400/40 border-amber-300 scale-95 cursor-pointer'
                        : 'bg-amber-800/85 border-amber-600/60 hover:bg-amber-700 cursor-pointer shadow-inner'
                    }`}
                  >
                    {!isEaten && (isPoison ? '🌶️' : '🍫')}
                  </button>
                );
              })
            )}
          </div>
        </div>
      );
    }

    // 6. HEX BRIDGE (7x7 staggered hex grid)
    case 'hex': {
      const winSet = new Set((state.winPath || []).map(([r, c]) => `${r},${c}`));
      return (
        <div className="flex flex-col items-center gap-3 overflow-x-auto max-w-full">
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-rose-400">● {p1Name}: Connect Left ↔ Right</span>
            <span className="text-sky-400">● {p2Name}: Connect Top ↕ Bottom</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border-t-4 border-b-4 border-sky-500/70 border-l-4 border-r-4 shadow-2xl relative">
            <div className="flex flex-col gap-1">
              {state.board.map((row, r) => (
                <div
                  key={r}
                  className="flex items-center gap-1"
                  style={{ marginLeft: `${r * 16}px` }}
                >
                  {row.map((cell, c) => {
                    const isWin = winSet.has(`${r},${c}`);
                    const isLast = state.lastCell?.[0] === r && state.lastCell?.[1] === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        disabled={!canAct || cell !== null}
                        onClick={() => onAction(`hx:${r},${c}`)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-transform cursor-pointer disabled:cursor-default ${
                          cell === 'p1'
                            ? 'bg-rose-500 border-rose-200 text-white'
                            : cell === 'p2'
                            ? 'bg-sky-400 border-sky-100 text-slate-950'
                            : 'bg-slate-800/90 border-slate-600 hover:border-white hover:scale-105'
                        } ${isWin ? 'ring-2 ring-amber-300 scale-110' : isLast ? 'ring-2 ring-white/70' : ''}`}
                      >
                        {cell === 'p1' ? '1' : cell === 'p2' ? '2' : ''}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 7 & 9. 4x4 GRID LINK & REVERSE TIC-TAC-TOE
    case 'grid-link-4':
    case 'misere-ttt': {
      const cols = state.gameType === 'grid-link-4' ? 4 : 3;
      const hl =
        state.gameType === 'grid-link-4' ? state.winLine || [] : state.loseLine || [];
      const hlSet = new Set(hl);
      return (
        <div className="flex flex-col items-center gap-3">
          {state.gameType === 'misere-ttt' && (
            <span className="text-xs font-bold text-rose-300">
              Reverse Rule: Making 3-in-a-row of your own mark LOSES!
            </span>
          )}
          <div
            className="grid gap-2 p-3 rounded-2xl bg-slate-950 border border-white/15"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {state.board.map((cell, i) => {
              const prefix = state.gameType === 'grid-link-4' ? 'gl' : 'mt';
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!canAct || cell !== null}
                  onClick={() => onAction(`${prefix}:${i}`)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 text-2xl font-black transition-all cursor-pointer disabled:cursor-default ${
                    hlSet.has(i)
                      ? 'border-amber-300 bg-amber-400/20'
                      : state.lastCell === i
                      ? 'border-white/50 bg-white/10'
                      : 'border-white/15 bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  {cell === 'p1' ? (
                    <span className="text-cyan-300">X</span>
                  ) : cell === 'p2' ? (
                    <span className="text-rose-400">O</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // 8. ORDER & CHAOS
    case 'order-chaos': {
      const winSet = new Set((state.winLine || []).map(([r, c]) => `${r},${c}`));
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-300 font-semibold">Pick symbol to place:</span>
            {(['X', 'O'] as const).map(sym => (
              <button
                key={sym}
                type="button"
                onClick={() => setOrderSym(sym)}
                className={`px-3.5 py-1.5 rounded-xl font-black border cursor-pointer ${
                  orderSym === sym
                    ? 'bg-violet-400 text-black border-white'
                    : 'bg-white/5 text-slate-300 border-white/15'
                }`}
              >
                Place {sym}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-6 gap-1.5 p-3 rounded-2xl bg-slate-950 border border-white/15">
            {state.board.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  disabled={!canAct || cell !== null}
                  onClick={() => onAction(`oc:${r},${c},${orderSym}`)}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border font-black text-lg cursor-pointer disabled:cursor-default ${
                    winSet.has(`${r},${c}`)
                      ? 'border-amber-300 bg-amber-400/20'
                      : 'border-white/15 bg-slate-900 hover:bg-slate-800'
                  } ${cell === 'X' ? 'text-sky-300' : 'text-amber-300'}`}
                >
                  {cell}
                </button>
              ))
            )}
          </div>
        </div>
      );
    }

    // 10. GRAVITY 5 (9x7)
    case 'gravity-5': {
      const winSet = new Set((state.winLine || []).map(([r, c]) => `${r},${c}`));
      return (
        <div className="flex flex-col items-center gap-2 overflow-x-auto max-w-full">
          <div className="p-3 rounded-2xl bg-indigo-950/70 border border-indigo-400/30 shadow-xl">
            <div className="grid grid-cols-9 gap-1.5 mb-1.5">
              {Array.from({ length: 9 }).map((_, col) => {
                const open = state.board[0][col] === null;
                return (
                  <button
                    key={col}
                    type="button"
                    disabled={!canAct || !open}
                    onClick={() => onAction(`g5:${col}`)}
                    className="h-7 rounded-lg bg-white/10 hover:bg-purple-400/40 text-xs font-extrabold text-white cursor-pointer disabled:opacity-30"
                  >
                    ▼
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-9 gap-1.5">
              {state.board.map((row, r) =>
                row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    disabled={!canAct || state.board[0][c] !== null}
                    onClick={() => onAction(`g5:${c}`)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 cursor-pointer ${
                      cell === 'p1'
                        ? 'bg-purple-400 border-purple-200'
                        : cell === 'p2'
                        ? 'bg-amber-400 border-amber-100'
                        : 'bg-slate-950 border-indigo-800/70'
                    } ${winSet.has(`${r},${c}`) ? 'ring-2 ring-white scale-105' : ''}`}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    // 11, 12, 13, 14, 15. TERRITORY & DOMINO GRIDS
    case 'snort':
    case 'col-clash':
    case 'domineering':
    case 'cram':
    case 'obstruction': {
      const size = state.board.length;
      const isForbidden = (r: number, c: number): boolean => {
        if (state.board[r][c] !== null) return true;
        if (state.gameType === 'snort') {
          const opp: ArcadePlayer = state.turn === 'p1' ? 'p2' : 'p1';
          return [
            [r - 1, c],
            [r + 1, c],
            [r, c - 1],
            [r, c + 1]
          ].some(([nr, nc]) => nr >= 0 && nr < 5 && nc >= 0 && nc < 5 && state.board[nr][nc] === opp);
        }
        if (state.gameType === 'col-clash') {
          return [
            [r - 1, c],
            [r + 1, c],
            [r, c - 1],
            [r, c + 1]
          ].some(([nr, nc]) => nr >= 0 && nr < 5 && nc >= 0 && nc < 5 && state.board[nr][nc] === state.turn);
        }
        if (state.gameType === 'domineering') {
          const r2 = state.turn === 'p1' ? r + 1 : r;
          const c2 = state.turn === 'p2' ? c + 1 : c;
          return r2 >= 6 || c2 >= 6 || state.board[r2][c2] !== null;
        }
        if (state.gameType === 'cram') {
          const r2 = cramDir === 'v' ? r + 1 : r;
          const c2 = cramDir === 'h' ? c + 1 : c;
          return r2 >= 6 || c2 >= 6 || state.board[r2][c2] !== null;
        }
        return false;
      };

      return (
        <div className="flex flex-col items-center gap-3">
          {state.gameType === 'cram' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCramDir(d => (d === 'h' ? 'v' : 'h'))}
                className="px-3.5 py-1.5 rounded-xl bg-orange-500/20 border border-orange-400/50 text-orange-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Orientation: {cramDir === 'h' ? 'Horizontal (1×2)' : 'Vertical (2×1)'}</span>
              </button>
            </div>
          )}
          {state.gameType === 'domineering' && (
            <div className="text-xs font-bold text-slate-300">
              {p1Name} places Vertical 2×1 · {p2Name} places Horizontal 1×2
            </div>
          )}
          <div
            className="grid gap-1.5 p-3 rounded-2xl bg-slate-950 border border-white/15"
            style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
          >
            {state.board.map((row, r) =>
              row.map((cell, c) => {
                const blocked = isForbidden(r, c);
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    disabled={!canAct || blocked}
                    onClick={() => {
                      if (state.gameType === 'snort') onAction(`sn:${r},${c}`);
                      else if (state.gameType === 'col-clash') onAction(`cc:${r},${c}`);
                      else if (state.gameType === 'domineering') onAction(`dm:${r},${c}`);
                      else if (state.gameType === 'cram') onAction(`cr:${r},${c},${cramDir}`);
                      else onAction(`ob:${r},${c}`);
                    }}
                    className={`w-12 h-12 rounded-xl border font-bold text-sm transition-all ${
                      cell === 'p1'
                        ? 'bg-rose-500 border-rose-200 text-white'
                        : cell === 'p2'
                        ? 'bg-sky-400 border-sky-100 text-black'
                        : cell === 'blocked'
                        ? 'bg-slate-800/60 border-slate-700 text-slate-500'
                        : blocked
                        ? 'bg-slate-900/40 border-white/5 opacity-45 cursor-not-allowed'
                        : 'bg-slate-900 border-white/15 hover:border-emerald-400 hover:bg-emerald-500/15 cursor-pointer'
                    }`}
                  >
                    {cell === 'p1' ? 'P1' : cell === 'p2' ? 'P2' : cell === 'blocked' ? '✕' : ''}
                  </button>
                );
              })
            )}
          </div>
        </div>
      );
    }

    // 16 & 17. ATAXX & BREAKTHROUGH
    case 'ataxx':
    case 'breakthrough': {
      const isAtaxx = state.gameType === 'ataxx';
      const isTargetValid = (r: number, c: number): boolean => {
        if (!selectedPiece) return false;
        const [fr, fc] = selectedPiece;
        if (isAtaxx) {
          const d = Math.max(Math.abs(r - fr), Math.abs(c - fc));
          return d >= 1 && d <= 2 && state.board[r][c] === null;
        }
        const dir = state.turn === 'p1' ? -1 : 1;
        if (r !== fr + dir || Math.abs(c - fc) > 1) return false;
        if (c === fc) return state.board[r][c] === null;
        return state.board[r][c] !== state.turn;
      };

      return (
        <div className="flex flex-col items-center gap-3">
          {isAtaxx && (
            <div className="text-xs font-mono font-bold tabular-nums text-slate-300">
              {p1Name}: {state.counts.p1} slimes · {p2Name}: {state.counts.p2} slimes
            </div>
          )}
          <div className="grid grid-cols-6 gap-1.5 p-3 rounded-2xl bg-slate-950 border border-white/15">
            {state.board.map((row, r) =>
              row.map((cell, c) => {
                const isSel = selectedPiece?.[0] === r && selectedPiece?.[1] === c;
                const validTarget = isTargetValid(r, c);
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    disabled={!canAct}
                    onClick={() => {
                      if (validTarget && selectedPiece) {
                        const prefix = isAtaxx ? 'ax' : 'bt';
                        onAction(`${prefix}:${selectedPiece[0]},${selectedPiece[1]}-${r},${c}`);
                        setSelectedPiece(null);
                      } else if (cell === state.turn) {
                        setSelectedPiece([r, c]);
                      } else {
                        setSelectedPiece(null);
                      }
                    }}
                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-lg transition-all cursor-pointer ${
                      isSel
                        ? 'border-white ring-2 ring-emerald-400 bg-white/15'
                        : validTarget
                        ? 'border-emerald-400 bg-emerald-500/25 hover:scale-105'
                        : (r + c) % 2 === 1
                        ? 'border-white/10 bg-slate-900'
                        : 'border-white/10 bg-slate-900/60'
                    }`}
                  >
                    {cell === 'p1'
                      ? isAtaxx
                        ? '🟢'
                        : '♟️'
                      : cell === 'p2'
                      ? isAtaxx
                        ? '🟣'
                        : '🐦‍🔥'
                      : validTarget
                      ? '•'
                      : ''}
                  </button>
                );
              })
            )}
          </div>
          <span className="text-[11px] text-slate-400">
            {selectedPiece ? 'Click a highlighted green target square to move' : 'Click one of your pieces to move'}
          </span>
        </div>
      );
    }

    // 18. KING'S ESCAPE
    case 'kings-escape': {
      const canKingMove = (r: number, c: number) =>
        state.turn === 'p1' &&
        Math.abs(r - state.king[0]) <= 1 &&
        Math.abs(c - state.king[1]) <= 1 &&
        !(r === state.king[0] && c === state.king[1]) &&
        !state.chasers.some(([cr, cc]) => cr === r && cc === c);

      const canChaserMove = (r: number, c: number) => {
        if (state.turn !== 'p2') return false;
        const [cr, cc] = state.chasers[selectedChaserIdx] || [0, 0];
        const dr = r - cr;
        const dc = Math.abs(c - cc);
        const validDelta = (dr === -1 && dc === 1) || (dr === 0 && dc === 1);
        if (!validDelta) return false;
        if (r === state.king[0] && c === state.king[1]) return false;
        return !state.chasers.some(([xr, xc]) => xr === r && xc === c);
      };

      return (
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs font-semibold text-slate-300 text-center">
            {state.turn === 'p1'
              ? `${p1Name} (King): Reach bottom row to escape!`
              : `${p2Name} (Blockers): Select a Blocker & click a green target to trap the King!`}
          </div>
          <div className="grid grid-cols-6 gap-1.5 p-3 rounded-2xl bg-slate-950 border border-white/15">
            {Array.from({ length: 6 }).map((_, r) =>
              Array.from({ length: 6 }).map((__, c) => {
                const isKing = state.king[0] === r && state.king[1] === c;
                const chaserIdx = state.chasers.findIndex(([cr, cc]) => cr === r && cc === c);
                const validTarget =
                  canAct && (state.turn === 'p1' ? canKingMove(r, c) : canChaserMove(r, c));
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    disabled={!canAct}
                    onClick={() => {
                      if (state.turn === 'p2' && chaserIdx >= 0) {
                        setSelectedChaserIdx(chaserIdx);
                      } else if (validTarget) {
                        if (state.turn === 'p1') onAction(`ke:k,${r},${c}`);
                        else onAction(`ke:${selectedChaserIdx},${r},${c}`);
                      }
                    }}
                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl cursor-pointer ${
                      r === 5 ? 'border-amber-500/40' : 'border-white/10'
                    } ${
                      validTarget
                        ? 'bg-emerald-500/25 border-emerald-400'
                        : chaserIdx === selectedChaserIdx && state.turn === 'p2'
                        ? 'bg-sky-500/25 border-sky-400'
                        : 'bg-slate-900'
                    }`}
                  >
                    {isKing ? '👑' : chaserIdx >= 0 ? '🛡️' : validTarget ? '•' : ''}
                  </button>
                );
              })
            )}
          </div>
        </div>
      );
    }

    // 19. WORDLE DUEL
    case 'wordle-duel': {
      const isSetter = viewerRole === state.setter || (viewerRole === 'local' && state.phase === 'set');
      return (
        <div className="w-full max-w-md flex flex-col items-center gap-3">
          <div className="w-full flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-black/30 border border-white/10">
            <span className="font-bold">Round {state.round}/2 · Guesser: {ownerName(state.guesser)}</span>
            <span className="font-mono tabular-nums text-slate-300">
              P1: {state.roundScores.p1 ?? '-'} · P2: {state.roundScores.p2 ?? '-'}
            </span>
          </div>

          {state.phase === 'set' ? (
            <div className="w-full p-4 rounded-2xl border border-white/15 bg-black/30 flex flex-col gap-3">
              {canAct && isSetter ? (
                <>
                  <span className="text-xs font-bold text-white">
                    Set a 5-letter secret word for {ownerName(state.guesser)}:
                  </span>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      const clean = wordSecretInput.trim().toLowerCase().replace(/[^a-z]/g, '');
                      if (clean.length === 5) {
                        onAction(`wds:${clean}`);
                        setWordSecretInput('');
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={wordSecretInput}
                      onChange={e => setWordSecretInput(e.target.value)}
                      maxLength={5}
                      placeholder="5 letters (e.g. CRANE)"
                      className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs uppercase font-mono text-white focus:outline-none"
                    />
                    <button type="submit" className="px-3.5 py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-xs cursor-pointer">
                      Set Word
                    </button>
                  </form>
                  <button
                    type="button"
                    onClick={() => onAction(`wds:auto:${Math.floor(Math.random() * 9000) + 1}`)}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5" /> Auto-Pick Random 5-Letter Word
                  </button>
                </>
              ) : (
                <div className="text-center py-6 text-xs text-slate-300">
                  {ownerName(state.setter)} is choosing a secret 5-letter word...
                </div>
              )}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-3">
              <div className="flex flex-col gap-1.5">
                {Array.from({ length: 6 }).map((_, r) => {
                  const row = state.guesses[r];
                  return (
                    <div key={r} className="flex gap-1.5">
                      {Array.from({ length: 5 }).map((__, c) => {
                        const ch = row ? row.word[c]?.toUpperCase() : '';
                        const mark = row?.marks[c];
                        return (
                          <div
                            key={c}
                            className={`w-11 h-11 rounded-lg border-2 flex items-center justify-center font-black text-lg ${
                              mark === 'correct'
                                ? 'bg-emerald-500 border-emerald-300 text-black'
                                : mark === 'present'
                                ? 'bg-amber-400 border-amber-200 text-black'
                                : mark === 'absent'
                                ? 'bg-slate-800 border-slate-700 text-slate-400'
                                : 'bg-slate-950 border-white/15 text-white'
                            }`}
                          >
                            {ch}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {canAct && (viewerRole === state.guesser || viewerRole === 'local') && (
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    const clean = wordGuessInput.trim().toLowerCase().replace(/[^a-z]/g, '');
                    if (clean.length === 5) {
                      onAction(`wdg:${clean}`);
                      setWordGuessInput('');
                    }
                  }}
                  className="w-full flex gap-2"
                >
                  <input
                    type="text"
                    value={wordGuessInput}
                    onChange={e => setWordGuessInput(e.target.value)}
                    maxLength={5}
                    placeholder="Enter 5-letter guess..."
                    className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs uppercase font-mono text-white focus:outline-none"
                  />
                  <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-xs cursor-pointer">
                    Submit
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      );
    }

    // 20. HANGMAN DUEL
    case 'hangman-duel': {
      const isSetter = viewerRole === state.setter || (viewerRole === 'local' && state.phase === 'set');
      const masked = (state.secret || '')
        .split('')
        .map(ch => (state.guessedLetters.includes(ch) ? ch.toUpperCase() : '_'))
        .join(' ');
      return (
        <div className="w-full max-w-lg flex flex-col items-center gap-3">
          <div className="w-full flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-black/30 border border-white/10">
            <span>Round {state.round}/{state.maxRounds} · Guesser: {ownerName(state.guesser)}</span>
            <span className="font-mono tabular-nums">{p1Name}: {state.scores.p1} · {p2Name}: {state.scores.p2}</span>
          </div>
          {state.lastSummary && (
            <div className="text-xs text-sky-300 font-semibold">{state.lastSummary}</div>
          )}
          {state.phase === 'set' ? (
            <div className="w-full p-4 rounded-2xl border border-white/15 bg-black/30 flex flex-col gap-3">
              {canAct && isSetter ? (
                <>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      const clean = wordSecretInput.trim().toLowerCase().replace(/[^a-z]/g, '').slice(0, 14);
                      if (clean.length >= 3) {
                        onAction(`hms:${clean}`);
                        setWordSecretInput('');
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={wordSecretInput}
                      onChange={e => setWordSecretInput(e.target.value)}
                      placeholder="Secret word (3–14 letters)..."
                      className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs uppercase text-white focus:outline-none"
                    />
                    <button type="submit" className="px-3.5 py-2 rounded-xl bg-sky-400 text-black font-extrabold text-xs cursor-pointer">
                      Set
                    </button>
                  </form>
                  <button
                    type="button"
                    onClick={() => onAction(`hms:auto:${Math.floor(Math.random() * 9000) + 1}`)}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 cursor-pointer"
                  >
                    Auto-Pick Random Word
                  </button>
                </>
              ) : (
                <div className="text-center py-6 text-xs text-slate-300">
                  {ownerName(state.setter)} is picking a secret word...
                </div>
              )}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-3">
              <div className="flex items-center gap-6 p-3 rounded-2xl bg-slate-950 border border-white/15 w-full justify-center">
                <svg width="90" height="100" viewBox="0 0 90 100" className="stroke-slate-300 fill-none" strokeWidth="3">
                  <line x1="10" y1="95" x2="70" y2="95" />
                  <line x1="25" y1="95" x2="25" y2="10" />
                  <line x1="25" y1="10" x2="60" y2="10" />
                  <line x1="60" y1="10" x2="60" y2="22" />
                  {state.misses >= 1 && <circle cx="60" cy="32" r="10" className="stroke-rose-400" />}
                  {state.misses >= 2 && <line x1="60" y1="42" x2="60" y2="68" className="stroke-rose-400" />}
                  {state.misses >= 3 && <line x1="60" y1="48" x2="45" y2="60" className="stroke-rose-400" />}
                  {state.misses >= 4 && <line x1="60" y1="48" x2="75" y2="60" className="stroke-rose-400" />}
                  {state.misses >= 5 && <line x1="60" y1="68" x2="48" y2="85" className="stroke-rose-400" />}
                  {state.misses >= 6 && <line x1="60" y1="68" x2="72" y2="85" className="stroke-rose-400" />}
                </svg>
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-mono font-black tracking-[0.25em] text-white">{masked}</span>
                  <span className="text-xs text-rose-300 font-bold">Misses: {state.misses} / 6</span>
                </div>
              </div>
              <div className="grid grid-cols-9 gap-1 w-full">
                {'abcdefghijklmnopqrstuvwxyz'.split('').map(ch => {
                  const used = state.guessedLetters.includes(ch);
                  const hit = used && state.secret?.includes(ch);
                  return (
                    <button
                      key={ch}
                      type="button"
                      disabled={!canAct || used || (viewerRole !== state.guesser && viewerRole !== 'local')}
                      onClick={() => onAction(`hml:${ch}`)}
                      className={`h-9 rounded-lg font-extrabold text-xs uppercase border cursor-pointer disabled:cursor-default ${
                        hit
                          ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
                          : used
                          ? 'bg-rose-500/20 border-rose-500/30 text-rose-300 opacity-50'
                          : 'bg-slate-900 border-white/15 text-white hover:bg-white/15'
                      }`}
                    >
                      {ch}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    // 21. MASTERMIND CODEBREAKER
    case 'mastermind': {
      const isSetter = viewerRole === state.setter || (viewerRole === 'local' && state.phase === 'set');
      return (
        <div className="w-full max-w-md flex flex-col items-center gap-3">
          <div className="w-full flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-black/30 border border-white/10">
            <span>Round {state.round}/2 · Breaker: {ownerName(state.breaker)}</span>
            <span className="font-mono tabular-nums">P1: {state.scores.p1 ?? '-'} · P2: {state.scores.p2 ?? '-'}</span>
          </div>

          {(state.phase === 'set' ? canAct && isSetter : canAct && (viewerRole === state.breaker || viewerRole === 'local')) && (
            <div className="w-full p-3 rounded-2xl bg-black/30 border border-white/15 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>{state.phase === 'set' ? 'Set Secret 4-Peg Code:' : 'Build Your Guess:'}</span>
                <div className="flex gap-1.5">
                  {codeDraft.map((col, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveCodeSlot(idx)}
                      className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                        activeCodeSlot === idx ? 'border-white scale-110' : 'border-white/30'
                      }`}
                      style={{ backgroundColor: MASTERMIND_COLORS[col]?.hex }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  {MASTERMIND_COLORS.map(mc => (
                    <button
                      key={mc.id}
                      type="button"
                      onClick={() => {
                        setCodeDraft(prev => {
                          const next = [...prev];
                          next[activeCodeSlot] = mc.id;
                          return next;
                        });
                        setActiveCodeSlot(s => (s + 1) % 4);
                      }}
                      className="w-7 h-7 rounded-full border border-white/30 cursor-pointer hover:scale-110"
                      style={{ backgroundColor: mc.hex }}
                      title={mc.name}
                    />
                  ))}
                </div>
                <div className="flex gap-1.5">
                  {state.phase === 'set' && (
                    <button
                      type="button"
                      onClick={() => onAction(`mms:auto:${Math.floor(Math.random() * 9000) + 1}`)}
                      className="px-2.5 py-1.5 rounded-lg bg-white/10 text-[11px] font-bold text-white cursor-pointer"
                    >
                      Random
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onAction(`${state.phase === 'set' ? 'mms' : 'mmg'}:${codeDraft.join('')}`)}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-400 text-black text-xs font-extrabold cursor-pointer"
                  >
                    {state.phase === 'set' ? 'Lock Code' : 'Check'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {state.phase === 'guess' && (
            <div className="w-full flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-950 border border-white/15">
              {state.rows.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  Submit your first 4-peg guess above (8 attempts). ⚫ = right color &amp; spot · ⚪ = right color only.
                </div>
              ) : (
                state.rows.map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[11px] font-mono text-slate-400">#{idx + 1}</span>
                    <div className="flex gap-2">
                      {row.code.map((c, j) => (
                        <span key={j} className="w-6 h-6 rounded-full border border-white/30" style={{ backgroundColor: MASTERMIND_COLORS[c]?.hex }} />
                      ))}
                    </div>
                    <span className="text-xs font-mono text-slate-200">
                      ⚫{row.exact} ⚪{row.close}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      );
    }

    // 22. HI-LO TARGET 1-100
    case 'hilo-target': {
      return (
        <div className="w-full max-w-md flex flex-col gap-3">
          <div className="p-4 rounded-2xl bg-slate-950 border border-white/15 flex flex-col items-center gap-2">
            <span className="text-xs text-slate-400">Active Search Range</span>
            <span className="text-3xl font-black font-mono tabular-nums text-orange-300">
              {state.lowBound} — {state.highBound}
            </span>
          </div>
          {canAct && (
            <form
              onSubmit={e => {
                e.preventDefault();
                const n = Number(hiloInput);
                if (Number.isInteger(n) && n >= 1 && n <= 100) {
                  const act = state.moveCount === 0 ? `hl:${n}:${Math.floor(Math.random() * 9000) + 1}` : `hl:${n}`;
                  onAction(act);
                }
              }}
              className="flex gap-2"
            >
              <input
                type="number"
                min={1}
                max={100}
                value={hiloInput}
                onChange={e => setHiloInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-sm font-mono text-white"
              />
              <button type="submit" className="px-4 py-2 rounded-xl bg-orange-400 text-black font-extrabold text-xs cursor-pointer">
                Guess Number
              </button>
            </form>
          )}
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
            {[...state.history].reverse().map((h, i) => (
              <div key={i} className="flex justify-between text-xs px-3 py-1.5 rounded-lg bg-white/5">
                <span className="font-bold">{ownerName(h.by)}: {h.guess}</span>
                <span className={h.hint === 'exact' ? 'text-emerald-400 font-extrabold' : h.hint === 'higher' ? 'text-sky-300' : 'text-amber-300'}>
                  {h.hint === 'exact' ? 'EXACT HIT!' : h.hint === 'higher' ? 'Go Higher ↑' : 'Go Lower ↓'}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 23. WORD CHAIN RALLY
    case 'word-chain': {
      return (
        <div className="w-full max-w-md flex flex-col gap-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-xs font-mono tabular-nums">
            <span>Turns: {state.moveCount}/{state.maxTurns}</span>
            <span>{p1Name}: {state.scores.p1} · {p2Name}: {state.scores.p2}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-white/15 text-center">
            <span className="text-xs text-slate-400">Next word must start with:</span>
            <div className="text-4xl font-black text-teal-300 uppercase mt-1">{state.requiredLetter}</div>
          </div>
          {canAct && (
            <form
              onSubmit={e => {
                e.preventDefault();
                const clean = chainInput.trim().toLowerCase().replace(/[^a-z]/g, '');
                if (clean.length >= 3 && clean[0] === state.requiredLetter) {
                  onAction(`wc:${clean}`);
                  setChainInput('');
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={chainInput}
                onChange={e => setChainInput(e.target.value)}
                placeholder={`Word starting with "${state.requiredLetter.toUpperCase()}"...`}
                className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
              />
              <button type="submit" className="px-4 py-2 rounded-xl bg-teal-400 text-black font-extrabold text-xs cursor-pointer">
                Play
              </button>
            </form>
          )}
          <div className="flex flex-wrap gap-1.5">
            {state.words.map((w, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 font-mono">
                {w.word} {w.pts > 0 ? `+${w.pts}` : ''}
              </span>
            ))}
          </div>
        </div>
      );
    }

    // 24. BLACKJACK 21 DUEL
    case 'blackjack-21': {
      const renderHand = (cards: number[]) => (
        <div className="flex flex-wrap gap-1.5 justify-center">
          {cards.map((c, idx) => {
            const info = formatCardLabel(c);
            return (
              <div
                key={idx}
                className={`w-12 h-16 rounded-lg bg-white border border-slate-300 flex flex-col items-center justify-center font-black shadow ${
                  info.red ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                <span className="text-sm">{info.rank}</span>
                <span className="text-base leading-none">{info.suit}</span>
              </div>
            );
          })}
        </div>
      );
      return (
        <div className="w-full max-w-lg flex flex-col gap-3 p-4 rounded-2xl border border-emerald-500/30 bg-[#0F5132]/70">
          <div className="flex justify-between text-xs font-bold text-emerald-100">
            <span>Hand {state.round}/{state.maxRounds}</span>
            <span className="font-mono tabular-nums">{p1Name}: {state.scores.p1} · {p2Name}: {state.scores.p2}</span>
          </div>
          {state.lastSummary && <div className="text-center text-xs font-bold text-amber-200">{state.lastSummary}</div>}
          {state.hands.p1.length === 0 ? (
            <div className="py-8 flex flex-col items-center gap-3">
              <button
                type="button"
                disabled={!canAct}
                onClick={() => onAction(`bj:deal:${Math.floor(Math.random() * 90000) + 1}`)}
                className="px-6 py-2.5 rounded-xl bg-amber-400 text-black font-extrabold text-sm cursor-pointer disabled:opacity-50"
              >
                Deal Hand 1
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="p-2.5 rounded-xl bg-black/25 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-white">{p2Name} (Total: {cardValue21(state.hands.p2)})</span>
                {renderHand(state.hands.p2)}
              </div>
              <div className="p-2.5 rounded-xl bg-black/25 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-white">{p1Name} (Total: {cardValue21(state.hands.p1)})</span>
                {renderHand(state.hands.p1)}
              </div>
              {canAct && (
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => onAction('bj:hit')}
                    className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs cursor-pointer"
                  >
                    Hit
                  </button>
                  <button
                    type="button"
                    onClick={() => onAction('bj:stand')}
                    className="px-5 py-2 rounded-xl bg-white hover:bg-slate-200 text-black font-extrabold text-xs cursor-pointer"
                  >
                    Stand
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // 25. MINI YACHT 5-DICE
    case 'yacht-dice': {
      const cats = (['pair', 'trips', 'full', 'straight', 'yacht'] as const);
      const rollAction = () => {
        const digits = Array.from({ length: 5 }, (_, i) =>
          state.held[i] && state.dice[i] > 0 ? state.dice[i] : Math.floor(Math.random() * 6) + 1
        ).join('');
        onAction(`yd:roll:${digits}`);
      };
      return (
        <div className="w-full max-w-lg flex flex-col gap-3">
          <div className="flex justify-between text-xs px-3 py-2 rounded-xl bg-black/30 border border-white/10 font-mono tabular-nums">
            <span>Round {state.round}/5 · Rolls Left: {state.rollsLeft}</span>
            <span>{p1Name}: {state.scores.p1} · {p2Name}: {state.scores.p2}</span>
          </div>
          {state.lastSummary && <div className="text-center text-xs text-amber-300 font-semibold">{state.lastSummary}</div>}
          <div className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-slate-950 border border-white/15">
            {state.dice.map((val, idx) => (
              <button
                key={idx}
                type="button"
                disabled={!canAct || state.rollsLeft === 3 || state.rollsLeft === 0}
                onClick={() => onAction(`yd:toggle:${idx}`)}
                className={`w-12 h-12 rounded-xl border-2 flex flex-col items-center justify-center font-black text-lg cursor-pointer disabled:cursor-default ${
                  state.held[idx]
                    ? 'bg-amber-400 text-black border-white'
                    : 'bg-white/10 text-white border-white/20'
                }`}
              >
                <span>{val > 0 ? val : '?'}</span>
                {state.held[idx] && <span className="text-[8px] uppercase">Held</span>}
              </button>
            ))}
          </div>
          {canAct && state.rollsLeft > 0 && (
            <button
              type="button"
              onClick={rollAction}
              className="px-5 py-2.5 rounded-xl bg-amber-400 text-black font-extrabold text-xs cursor-pointer self-center"
            >
              {state.rollsLeft === 3 ? 'Roll All 5 Dice' : `Reroll Unlocked (${state.rollsLeft} left)`}
            </button>
          )}
          <div className="grid grid-cols-5 gap-1.5">
            {cats.map(cat => {
              const used = state.usedCats[state.turn][cat];
              const preview = state.rollsLeft < 3 ? scoreYachtCategory(state.dice, cat) : 0;
              return (
                <button
                  key={cat}
                  type="button"
                  disabled={!canAct || state.rollsLeft === 3 || used !== undefined}
                  onClick={() => onAction(`yd:score:${cat}`)}
                  className="p-2 rounded-xl border border-white/15 bg-black/30 hover:bg-white/10 disabled:opacity-45 text-center cursor-pointer"
                >
                  <div className="text-[10px] font-bold uppercase text-slate-400">{cat}</div>
                  <div className="text-sm font-black font-mono text-white">
                    {used !== undefined ? `${used}✓` : `+${preview}`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // 26. TUG OF WAR BID
    case 'tug-of-war': {
      return (
        <div className="w-full max-w-md flex flex-col gap-3">
          <div className="flex justify-between text-xs px-3 py-2 rounded-xl bg-black/30 border border-white/10 font-mono tabular-nums">
            <span>Pull {state.round}/9</span>
            <span>Energy — {p1Name}: {state.energy.p1} · {p2Name}: {state.energy.p2}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-white/15 flex flex-col gap-2">
            <div className="grid grid-cols-7 gap-1">
              {[-3, -2, -1, 0, 1, 2, 3].map(pos => (
                <div
                  key={pos}
                  className={`h-10 rounded-lg border flex items-center justify-center font-black text-xs ${
                    state.ropePos === pos
                      ? 'bg-orange-400 text-black border-white'
                      : pos === -3
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : pos === 3
                      ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                      : 'bg-white/5 border-white/10 text-slate-500'
                  }`}
                >
                  {state.ropePos === pos ? '🪢' : pos}
                </div>
              ))}
            </div>
            {state.lastRound && (
              <div className="text-center text-xs text-slate-300">
                Last Pull: {p1Name} bid {state.lastRound.p1Bid} vs {p2Name} bid {state.lastRound.p2Bid}
              </div>
            )}
          </div>
          {canAct && (
            <div className="flex flex-wrap justify-center gap-2">
              {[1, 2, 3, 4, 5, 6].map(b => (
                <button
                  key={b}
                  type="button"
                  disabled={b > state.energy[state.turn]}
                  onClick={() => onAction(`tw:${b}`)}
                  className="px-4 py-2.5 rounded-xl bg-orange-400 hover:bg-orange-300 text-black font-extrabold text-xs cursor-pointer disabled:opacity-35"
                >
                  Bid {b}
                </button>
              ))}
              {state.energy[state.turn] === 0 && (
                <button
                  type="button"
                  onClick={() => onAction('tw:0')}
                  className="px-4 py-2.5 rounded-xl bg-white/15 text-white font-bold text-xs cursor-pointer"
                >
                  0 Energy Pass
                </button>
              )}
            </div>
          )}
        </div>
      );
    }

    // 27. RPS-5 ARENA
    case 'rps-arena': {
      const choices: { id: RpsChoice; emoji: string; label: string }[] = [
        { id: 'rock', emoji: '🪨', label: 'Rock' },
        { id: 'paper', emoji: '📄', label: 'Paper' },
        { id: 'scissors', emoji: '✂️', label: 'Scissors' },
        { id: 'lizard', emoji: '🦎', label: 'Lizard' },
        { id: 'spock', emoji: '🖖', label: 'Spock' }
      ];
      return (
        <div className="w-full max-w-md flex flex-col gap-3">
          <div className="flex justify-between text-xs px-3 py-2 rounded-xl bg-black/30 border border-white/10 font-mono tabular-nums">
            <span>Round {state.round}/{state.maxRounds}</span>
            <span>{p1Name}: {state.scores.p1} · {p2Name}: {state.scores.p2}</span>
          </div>
          {state.lastRound && (
            <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-400/25 text-center text-xs font-bold text-pink-200">
              {state.lastRound.note}
            </div>
          )}
          <div className="text-center text-xs text-slate-300">
            {state.turn === 'p1'
              ? `${p1Name}: Lock in your secret pick`
              : `${p2Name}: ${p1Name} locked in! Choose your counter`}
          </div>
          {canAct && (
            <div className="grid grid-cols-5 gap-1.5">
              {choices.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onAction(`rp:${c.id}`)}
                  className="p-3 rounded-xl bg-slate-900 border border-white/15 hover:border-pink-400 hover:bg-pink-500/15 flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span className="text-2xl">{c.emoji}</span>
                  <span className="text-[10px] font-bold text-white">{c.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // 28. PENALTY SHOOTOUT
    case 'penalty-kick': {
      const zones = [
        { id: 0, label: 'Top Left' },
        { id: 1, label: 'Top Center' },
        { id: 2, label: 'Top Right' },
        { id: 3, label: 'Bottom Left' },
        { id: 4, label: 'Bottom Right' }
      ];
      const isShooting = state.pendingShot === null;
      return (
        <div className="w-full max-w-md flex flex-col gap-3">
          <div className="flex justify-between text-xs px-3 py-2 rounded-xl bg-black/30 border border-white/10 font-mono tabular-nums">
            <span>Kick {state.kickNumber}/10</span>
            <span>{p1Name}: {state.scores.p1} · {p2Name}: {state.scores.p2}</span>
          </div>
          <div className="text-center text-xs font-bold text-emerald-300">
            {isShooting
              ? `Shooter (${ownerName(state.shooter)}): Aim your kick!`
              : `Keeper (${ownerName(state.keeper)}): Pick a zone to dive!`}
          </div>
          <div className="p-4 rounded-2xl bg-emerald-950/60 border-4 border-white/80 grid grid-cols-3 gap-2">
            {zones.map(z => (
              <button
                key={z.id}
                type="button"
                disabled={!canAct}
                onClick={() => onAction(`pk:${z.id}`)}
                className={`h-16 rounded-xl border border-white/25 bg-black/30 hover:bg-emerald-400/30 text-xs font-extrabold text-white cursor-pointer disabled:opacity-45 ${
                  z.id === 3 ? 'col-span-1' : z.id === 4 ? 'col-start-3' : ''
                }`}
              >
                {isShooting ? `⚽ ${z.label}` : `🧤 ${z.label}`}
              </button>
            ))}
          </div>
          {state.history.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {state.history.map((h, i) => (
                <span
                  key={i}
                  className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                    h.goal ? 'bg-emerald-500/25 text-emerald-200' : 'bg-rose-500/25 text-rose-200'
                  }`}
                >
                  #{i + 1} {h.goal ? 'GOAL' : 'SAVE'}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }

    // 29. MINEFIELD HUNTER
    case 'mines-duel': {
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs font-mono font-bold tabular-nums text-slate-300">
            First to {state.targetFlags} Mines · {p1Name}: {state.scores.p1} 💣 · {p2Name}: {state.scores.p2} 💣
          </div>
          <div className="grid grid-cols-6 gap-1.5 p-3 rounded-2xl bg-slate-950 border border-white/15">
            {Array.from({ length: 36 }).map((_, idx) => {
              const rev = state.revealedBy[idx];
              const isMine = state.mines[idx];
              const adj = state.adjCounts[idx];
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!canAct || rev !== null}
                  onClick={() =>
                    onAction(
                      state.moveCount === 0
                        ? `mn:${idx}:${Math.floor(Math.random() * 90000) + 1}`
                        : `mn:${idx}`
                    )
                  }
                  className={`w-11 h-11 rounded-xl border font-black text-sm cursor-pointer disabled:cursor-default ${
                    rev === null
                      ? 'bg-slate-800 border-slate-600 hover:bg-slate-700'
                      : isMine
                      ? rev === 'p1'
                        ? 'bg-rose-500/40 border-rose-300 text-white'
                        : 'bg-amber-400/40 border-amber-200 text-white'
                      : 'bg-slate-950 border-white/10 text-sky-300'
                  }`}
                >
                  {rev === null ? '' : isMine ? '💣' : adj > 0 ? adj : ''}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // 30. SOS 5x5
    case 'sos-grid': {
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-between w-full max-w-xs text-xs font-mono font-bold tabular-nums">
            <span>{p1Name}: {state.scores.p1}</span>
            <div className="flex gap-1.5">
              {(['S', 'O'] as const).map(ch => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setSosChar(ch)}
                  className={`px-3 py-1 rounded-lg font-black border cursor-pointer ${
                    sosChar === ch ? 'bg-sky-400 text-black border-white' : 'bg-white/5 text-slate-300 border-white/15'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
            <span>{p2Name}: {state.scores.p2}</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 p-3 rounded-2xl bg-slate-950 border border-white/15">
            {state.board.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  disabled={!canAct || cell !== null}
                  onClick={() => onAction(`so:${r},${c},${sosChar}`)}
                  className={`w-12 h-12 rounded-xl border font-black text-xl cursor-pointer disabled:cursor-default ${
                    state.lastCell?.[0] === r && state.lastCell?.[1] === c
                      ? 'border-sky-300 bg-sky-500/20 text-white'
                      : 'border-white/15 bg-slate-900 text-slate-100 hover:bg-slate-800'
                  }`}
                >
                  {cell}
                </button>
              ))
            )}
          </div>
        </div>
      );
    }
  }
};
