import React, { useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  Bot,
  Check,
  Copy,
  Crown,
  Gamepad2,
  LogOut,
  Play,
  RotateCcw,
  Search,
  Send,
  Shield,
  Sparkles,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import { ThemeConfig } from '../services/themeStore';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useParty } from '../context/PartyContext';
import { AVATAR_PRESETS } from '../services/cloudSaveService';
import { isProfileOnlineNow } from '../services/chatService';
import { ARCADE_BOTS, ARCADE_GAMES, getArcadeGameMeta } from '../utils/arcadeEngines';
import { CHESS_BOTS } from '../utils/chessEngine';
import { sanitizePartyCode } from '../services/partyService';

interface PartyModalProps {
  activeTheme: ThemeConfig;
}

function getAvatarIcon(avatarId?: string | null): string {
  return (AVATAR_PRESETS.find(a => a.id === avatarId) || AVATAR_PRESETS[0]).icon;
}

export const PartyModal: React.FC<PartyModalProps> = ({ activeTheme }) => {
  const { user, loginGoogle } = useAuth();
  const { contacts, directoryProfiles, openGameRoom } = useNotifications();
  const {
    myParty,
    incomingPartyInvites,
    isPartyModalOpen,
    setPartyModalOpen,
    partyStatusNote,
    clearPartyStatusNote,
    isBusy,
    hostNewParty,
    joinPartyWithCode,
    leaveCurrentParty,
    kickMember,
    switchMyTeam,
    updateSettings,
    inviteFriendsToParty,
    acceptPartyInvite,
    declinePartyInvite,
    launchPartyMatch,
    backToPartyLobby
  } = useParty();

  const [joinCode, setJoinCode] = useState('');
  const [friendSearch, setFriendSearch] = useState('');
  const [gameSearch, setGameSearch] = useState('');
  const [selectedInviteUids, setSelectedInviteUids] = useState<Set<string>>(new Set());
  const [sentInviteUids, setSentInviteUids] = useState<Set<string>>(new Set());
  const [copiedCode, setCopiedCode] = useState(false);

  const [draftMode, setDraftMode] = useState<'1v1' | '2v2'>('2v2');
  const [draftOpponents, setDraftOpponents] = useState<'humans' | 'bots'>('bots');
  const [draftGameKind, setDraftGameKind] = useState<'chess' | 'arcade'>('chess');
  const [draftArcadeType, setDraftArcadeType] = useState<string>('connect4');

  const myUid = user?.uid || '';

  const invitablePeople = useMemo(() => {
    const map = new Map<
      string,
      { uid: string; name: string; avatarId: string; online: boolean; isFriend: boolean }
    >();
    const dirByUid = new Map(directoryProfiles.map(p => [p.userId, p]));
    const memberSet = new Set(myParty?.memberUids || []);

    for (const c of contacts) {
      if (!c.contactUid || c.contactUid === myUid || memberSet.has(c.contactUid)) continue;
      const live = dirByUid.get(c.contactUid);
      map.set(c.contactUid, {
        uid: c.contactUid,
        name: live?.displayName || c.nickname || c.displayName,
        avatarId: live?.avatarId || c.avatarId || 'melon_classic',
        online: live ? isProfileOnlineNow(live) : false,
        isFriend: true
      });
    }

    for (const p of directoryProfiles) {
      if (!p.userId || p.userId === myUid || memberSet.has(p.userId) || map.has(p.userId)) continue;
      map.set(p.userId, {
        uid: p.userId,
        name: p.displayName,
        avatarId: p.avatarId || 'melon_classic',
        online: isProfileOnlineNow(p),
        isFriend: false
      });
    }

    const q = friendSearch.trim().toLowerCase();
    return Array.from(map.values())
      .filter(p => !q || p.name.toLowerCase().includes(q))
      .sort(
        (a, b) =>
          Number(b.online) - Number(a.online) ||
          Number(b.isFriend) - Number(a.isFriend) ||
          a.name.localeCompare(b.name)
      );
  }, [contacts, directoryProfiles, myUid, myParty?.memberUids, friendSearch]);

  const filteredArcadeGames = useMemo(() => {
    const q = gameSearch.trim().toLowerCase();
    if (!q) return ARCADE_GAMES;
    return ARCADE_GAMES.filter(
      g =>
        g.name.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
    );
  }, [gameSearch]);

  if (!isPartyModalOpen) return null;

  const isLeader = Boolean(myParty && myUid && myParty.leaderUid === myUid);
  const myMember = myParty?.members.find(m => m.uid === myUid) || null;
  const maxTeamSlots = myParty?.matchMode === '2v2' ? 2 : 1;
  const teamAMembers = myParty ? myParty.members.filter(m => m.team === 'A') : [];
  const teamBMembers = myParty ? myParty.members.filter(m => m.team === 'B') : [];

  const handleCopyCode = () => {
    if (!myParty?.code) return;
    try {
      navigator.clipboard?.writeText(myParty.code);
    } catch {}
    setCopiedCode(true);
    window.setTimeout(() => setCopiedCode(false), 1600);
  };

  const toggleSelectInvite = (uid: string) => {
    setSelectedInviteUids(prev => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const handleSendSelectedInvites = async () => {
    if (!myParty || selectedInviteUids.size === 0) return;
    const targets = invitablePeople
      .filter(p => selectedInviteUids.has(p.uid))
      .map(p => ({ uid: p.uid, name: p.name }));
    const count = await inviteFriendsToParty(targets);
    if (count > 0) {
      setSentInviteUids(prev => {
        const next = new Set(prev);
        for (const t of targets) next.add(t.uid);
        return next;
      });
      setSelectedInviteUids(new Set());
    }
  };

  const handleHostFromDraft = async () => {
    const gTitle =
      draftGameKind === 'chess'
        ? 'Chess'
        : getArcadeGameMeta(draftArcadeType as typeof ARCADE_GAMES[number]['id']).name;
    await hostNewParty({
      matchMode: draftMode,
      opponentMode: draftOpponents,
      gameKind: draftGameKind,
      gameType: draftGameKind === 'chess' ? 'chess' : draftArcadeType,
      gameTitle: gTitle,
      botId: draftGameKind === 'chess' ? 'clara' : 'orbit-bot'
    });
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={() => setPartyModalOpen(false)}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl flex flex-col"
        style={{
          backgroundColor: activeTheme.bgCard,
          borderColor: activeTheme.borderActive,
          boxShadow: '0 24px 60px rgba(0,0,0,0.65)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-4 py-3.5 border-b flex items-center justify-between gap-3 sticky top-0 z-10 backdrop-blur-xl"
          style={{
            backgroundColor: activeTheme.bgHeader,
            borderColor: activeTheme.border
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
              style={{
                backgroundColor: activeTheme.accentBadge,
                borderColor: activeTheme.borderActive
              }}
            >
              <Users className="w-4.5 h-4.5" style={{ color: activeTheme.accent }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-tight">
                  Party Lobby
                </h2>
                {myParty && (
                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider"
                    style={{
                      backgroundColor: activeTheme.accentBadge,
                      color: activeTheme.accent
                    }}
                  >
                    {myParty.members.length}/4 Players · {myParty.matchMode.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Invite multiple friends, pick teams, and launch 1v1 or 2v2 matches against humans or bots.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPartyModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer shrink-0"
            title="Close Party Lobby"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {partyStatusNote && (
            <div
              className="px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2"
              style={{
                backgroundColor: `${activeTheme.accent}18`,
                borderColor: `${activeTheme.accent}55`,
                color: '#f8fafc'
              }}
            >
              <span>{partyStatusNote}</span>
              <button
                type="button"
                onClick={clearPartyStatusNote}
                className="p-0.5 rounded text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Incoming Party Invites */}
          {incomingPartyInvites.length > 0 && (
            <div className="rounded-xl border border-purple-400/45 bg-purple-500/15 p-3 flex flex-col gap-2">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-purple-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Party Invites ({incomingPartyInvites.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {incomingPartyInvites.map(inv => (
                  <div
                    key={inv.id}
                    className="rounded-xl border border-white/15 bg-black/35 px-3 py-2 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg shrink-0">{getAvatarIcon(inv.fromAvatarId)}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {inv.fromName}
                        </div>
                        <div className="text-[10px] text-purple-200/90 truncate">
                          {inv.matchMode.toUpperCase()} · {inv.gameTitle}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void acceptPartyInvite(inv)}
                        className="px-2.5 py-1 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-extrabold text-[11px] cursor-pointer"
                      >
                        Join
                      </button>
                      <button
                        type="button"
                        onClick={() => void declinePartyInvite(inv)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!user ? (
            <div
              className="rounded-2xl border p-6 text-center flex flex-col items-center gap-3"
              style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
            >
              <Users className="w-9 h-9" style={{ color: activeTheme.accent }} />
              <div className="text-sm font-extrabold text-white">
                Sign in with Google to create or join a Party
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                Party Mode syncs teams cleanly across devices so up to 4 friends can battle in 1v1 or 2v2 matches.
              </p>
              <button
                type="button"
                onClick={() => void loginGoogle()}
                className="px-4 py-2 rounded-xl bg-white text-slate-900 font-extrabold text-xs cursor-pointer hover:brightness-95"
              >
                Sign in with Google
              </button>
            </div>
          ) : !myParty ? (
            /* Create or Join Party View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div
                className="rounded-2xl border p-4 flex flex-col gap-3"
                style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
              >
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Host a New Party</span>
                </div>

                {/* Format & Opponents */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex rounded-xl border p-0.5 bg-black/25" style={{ borderColor: activeTheme.border }}>
                    {(['2v2', '1v1'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDraftMode(m)}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-extrabold cursor-pointer ${
                          draftMode === m ? 'text-black' : 'text-slate-300 hover:text-white'
                        }`}
                        style={draftMode === m ? { backgroundColor: activeTheme.accent } : undefined}
                      >
                        {m.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <div className="flex rounded-xl border p-0.5 bg-black/25" style={{ borderColor: activeTheme.border }}>
                    {(['bots', 'humans'] as const).map(op => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => setDraftOpponents(op)}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-extrabold cursor-pointer ${
                          draftOpponents === op ? 'text-black' : 'text-slate-300 hover:text-white'
                        }`}
                        style={draftOpponents === op ? { backgroundColor: activeTheme.accent } : undefined}
                      >
                        {op === 'bots' ? 'vs Bots' : 'vs Humans'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Game kind */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDraftGameKind('chess')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-extrabold cursor-pointer ${
                      draftGameKind === 'chess' ? 'text-black' : 'text-slate-300 hover:bg-white/5'
                    }`}
                    style={{
                      backgroundColor: draftGameKind === 'chess' ? activeTheme.accent : 'rgba(0,0,0,0.2)',
                      borderColor: draftGameKind === 'chess' ? activeTheme.accent : activeTheme.border
                    }}
                  >
                    ♛ Chess
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraftGameKind('arcade')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-extrabold cursor-pointer ${
                      draftGameKind === 'arcade' ? 'text-black' : 'text-slate-300 hover:bg-white/5'
                    }`}
                    style={{
                      backgroundColor: draftGameKind === 'arcade' ? activeTheme.accent : 'rgba(0,0,0,0.2)',
                      borderColor: draftGameKind === 'arcade' ? activeTheme.accent : activeTheme.border
                    }}
                  >
                    🎮 72 Minigames
                  </button>
                </div>

                {draftGameKind === 'arcade' && (
                  <select
                    value={draftArcadeType}
                    onChange={e => setDraftArcadeType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-bold text-white bg-black/30 focus:outline-none"
                    style={{ borderColor: activeTheme.border }}
                  >
                    {ARCADE_GAMES.map(g => (
                      <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                        {g.emoji} {g.name}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void handleHostFromDraft()}
                  className="mt-auto w-full py-2.5 px-4 rounded-xl text-black font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 disabled:opacity-50"
                  style={{ backgroundColor: activeTheme.accent }}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isBusy ? 'Creating Party...' : 'Create Party Lobby'}</span>
                </button>
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  void joinPartyWithCode(joinCode);
                }}
                className="rounded-2xl border p-4 flex flex-col gap-3"
                style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
              >
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4" style={{ color: activeTheme.accent }} />
                  <span>Join Friend&apos;s Party</span>
                </div>
                <p className="text-xs text-slate-400">
                  Enter a 6-character party code shared by your friend, or accept a Party Invite toast when they invite you.
                </p>
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(sanitizePartyCode(e.target.value))}
                  placeholder="PARTY CODE"
                  maxLength={8}
                  className="w-full px-3 py-2.5 rounded-xl border bg-black/30 text-sm font-mono font-bold tracking-widest uppercase text-white text-center focus:outline-none"
                  style={{ borderColor: activeTheme.border }}
                />
                <button
                  type="submit"
                  disabled={isBusy || joinCode.length < 4}
                  className="mt-auto w-full py-2.5 px-4 rounded-xl border font-extrabold text-xs text-white hover:bg-white/10 cursor-pointer disabled:opacity-45"
                  style={{ borderColor: activeTheme.borderActive }}
                >
                  {isBusy ? 'Joining...' : 'Join Party by Code'}
                </button>
              </form>
            </div>
          ) : (
            /* Active Party Lobby */
            <div className="flex flex-col gap-4">
              {/* Party Code & Leave Bar */}
              <div
                className="rounded-xl border px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5"
                style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Party Code
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/15 font-mono text-sm font-black tracking-widest text-white">
                    {myParty.code}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-2.5 py-1 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-[11px] font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {myParty.status === 'in_game' && myParty.activeRoomCode && (
                    <button
                      type="button"
                      onClick={() => {
                        const space = myParty.activeGameKind === 'chess' ? 'chess' : 'rooms';
                        const pref =
                          space === 'chess'
                            ? myMember?.team === 'B'
                              ? 'b'
                              : 'w'
                            : myMember?.team === 'B'
                            ? 'p2'
                            : 'p1';
                        setPartyModalOpen(false);
                        openGameRoom(space, myParty.activeRoomCode!, pref);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Jump to Room {myParty.activeRoomCode}</span>
                    </button>
                  )}

                  {isLeader && myParty.status === 'in_game' && (
                    <button
                      type="button"
                      onClick={() => void backToPartyLobby()}
                      className="px-2.5 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Lobby</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void leaveCurrentParty()}
                    className="px-2.5 py-1.5 rounded-xl border border-rose-500/35 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Leave</span>
                  </button>
                </div>
              </div>

              {/* Team A vs Team B Roster */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['A', 'B'] as const).map(teamKey => {
                  const members = teamKey === 'A' ? teamAMembers : teamBMembers;
                  const teamLabel =
                    teamKey === 'A'
                      ? myParty.gameKind === 'chess'
                        ? 'Team A · White'
                        : 'Team A · Side 1'
                      : myParty.gameKind === 'chess'
                      ? 'Team B · Black'
                      : 'Team B · Side 2';
                  const openSlots = Math.max(0, maxTeamSlots - members.length);
                  const isMyTeam = myMember?.team === teamKey;

                  return (
                    <div
                      key={teamKey}
                      className="rounded-2xl border p-3 flex flex-col gap-2"
                      style={{
                        backgroundColor: activeTheme.bgSecondary,
                        borderColor: isMyTeam ? activeTheme.borderActive : activeTheme.border
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Shield
                            className="w-3.5 h-3.5"
                            style={{ color: teamKey === 'A' ? activeTheme.accent : '#38bdf8' }}
                          />
                          <span className="text-xs font-extrabold text-white">{teamLabel}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            ({members.length}/{maxTeamSlots})
                          </span>
                        </div>
                        {!isMyTeam && (
                          <button
                            type="button"
                            onClick={() => void switchMyTeam(teamKey)}
                            className="px-2 py-1 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
                          >
                            <ArrowLeftRight className="w-2.5 h-2.5" />
                            <span>Switch Here</span>
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        {members.map(m => (
                          <div
                            key={m.uid}
                            className="px-2.5 py-2 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-base shrink-0">{getAvatarIcon(m.avatarId)}</span>
                              <span className="text-xs font-bold text-white truncate">
                                {m.displayName}
                                {m.uid === myUid ? ' (You)' : ''}
                              </span>
                              {m.uid === myParty.leaderUid && (
                                <span title="Party Leader" className="inline-flex shrink-0">
                                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                                </span>
                              )}
                            </div>
                            {isLeader && m.uid !== myUid && (
                              <button
                                type="button"
                                onClick={() => void kickMember(m.uid)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/15 cursor-pointer"
                                title="Remove from party"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}

                        {Array.from({ length: openSlots }).map((_, idx) => (
                          <div
                            key={`slot-${idx}`}
                            className="px-2.5 py-2 rounded-xl border border-dashed border-white/15 bg-black/15 flex items-center gap-2 text-xs text-slate-400"
                          >
                            {myParty.opponentMode === 'bots' ? (
                              <>
                                <Bot className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                                <span className="text-amber-200/90 font-semibold">AI Bot Slot (Auto-Filled)</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3.5 h-3.5 shrink-0 opacity-70" />
                                <span>Open Player Slot</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Party Match Settings */}
              <div
                className="rounded-2xl border p-3.5 flex flex-col gap-3"
                style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    Match Configuration
                  </span>
                  {!isLeader && (
                    <span className="text-[11px] text-slate-400">Controlled by Party Leader</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* 1v1 vs 2v2 */}
                  <div className="flex rounded-xl border p-0.5 bg-black/25" style={{ borderColor: activeTheme.border }}>
                    {(['1v1', '2v2'] as const).map(modeOpt => (
                      <button
                        key={modeOpt}
                        type="button"
                        disabled={!isLeader}
                        onClick={() => void updateSettings({ matchMode: modeOpt })}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-colors ${
                          myParty.matchMode === modeOpt
                            ? 'text-black'
                            : 'text-slate-300 hover:text-white'
                        } ${isLeader ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
                        style={
                          myParty.matchMode === modeOpt
                            ? { backgroundColor: activeTheme.accent }
                            : undefined
                        }
                      >
                        {modeOpt.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* vs Humans vs vs Bots */}
                  <div className="flex rounded-xl border p-0.5 bg-black/25" style={{ borderColor: activeTheme.border }}>
                    {(['humans', 'bots'] as const).map(opOpt => (
                      <button
                        key={opOpt}
                        type="button"
                        disabled={!isLeader}
                        onClick={() => void updateSettings({ opponentMode: opOpt })}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-colors ${
                          myParty.opponentMode === opOpt
                            ? 'text-black'
                            : 'text-slate-300 hover:text-white'
                        } ${isLeader ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
                        style={
                          myParty.opponentMode === opOpt
                            ? { backgroundColor: activeTheme.accent }
                            : undefined
                        }
                      >
                        {opOpt === 'bots' ? 'vs Bots' : 'vs Humans'}
                      </button>
                    ))}
                  </div>

                  {/* Chess vs Arcade */}
                  <div className="flex rounded-xl border p-0.5 bg-black/25" style={{ borderColor: activeTheme.border }}>
                    {(['chess', 'arcade'] as const).map(kindOpt => (
                      <button
                        key={kindOpt}
                        type="button"
                        disabled={!isLeader}
                        onClick={() =>
                          void updateSettings({
                            gameKind: kindOpt,
                            gameType: kindOpt === 'chess' ? 'chess' : 'connect4',
                            gameTitle: kindOpt === 'chess' ? 'Chess' : 'Connect Four',
                            botId: kindOpt === 'chess' ? 'clara' : 'orbit-bot'
                          })
                        }
                        className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-colors ${
                          myParty.gameKind === kindOpt
                            ? 'text-black'
                            : 'text-slate-300 hover:text-white'
                        } ${isLeader ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
                        style={
                          myParty.gameKind === kindOpt
                            ? { backgroundColor: activeTheme.accent }
                            : undefined
                        }
                      >
                        {kindOpt === 'chess' ? 'Chess' : 'Minigames'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specific Game & Bot Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {myParty.gameKind === 'arcade' ? (
                    <div className="flex flex-col gap-1.5">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={gameSearch}
                          onChange={e => setGameSearch(e.target.value)}
                          placeholder="Filter 72 minigames..."
                          disabled={!isLeader}
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl border bg-black/25 text-xs text-white placeholder-slate-500 focus:outline-none disabled:opacity-60"
                          style={{ borderColor: activeTheme.border }}
                        />
                      </div>
                      <select
                        value={myParty.gameType}
                        disabled={!isLeader}
                        onChange={e => {
                          const g = ARCADE_GAMES.find(item => item.id === e.target.value);
                          if (g) {
                            void updateSettings({
                              gameKind: 'arcade',
                              gameType: g.id,
                              gameTitle: g.name
                            });
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl border bg-black/30 text-xs font-bold text-white focus:outline-none disabled:opacity-70"
                        style={{ borderColor: activeTheme.border }}
                      >
                        {filteredArcadeGames.map(g => (
                          <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                            {g.emoji} {g.name} ({g.category})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="px-3 py-2 rounded-xl border bg-black/25 flex items-center gap-2" style={{ borderColor: activeTheme.border }}>
                      <span className="text-lg">♛</span>
                      <div>
                        <div className="text-xs font-extrabold text-white">Classical / Rapid Chess</div>
                        <div className="text-[10px] text-slate-400">Standard 8x8 with teammate rotation in 2v2</div>
                      </div>
                    </div>
                  )}

                  {myParty.opponentMode === 'bots' ? (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        Primary AI Bot Teammate / Opponent
                      </span>
                      <select
                        value={myParty.botId}
                        disabled={!isLeader}
                        onChange={e => void updateSettings({ botId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border bg-black/30 text-xs font-bold text-white focus:outline-none disabled:opacity-70"
                        style={{ borderColor: activeTheme.border }}
                      >
                        {myParty.gameKind === 'chess'
                          ? CHESS_BOTS.map(b => (
                              <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                                {b.avatar} {b.name} ({b.rating} · {b.difficulty})
                              </option>
                            ))
                          : ARCADE_BOTS.map(b => (
                              <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                                {b.avatar} {b.name} ({b.rating} · {b.difficulty})
                              </option>
                            ))}
                      </select>
                    </div>
                  ) : (
                    <div className="px-3 py-2 rounded-xl border bg-black/25 flex items-center gap-2" style={{ borderColor: activeTheme.border }}>
                      <Users className="w-4 h-4 text-sky-400 shrink-0" />
                      <div className="text-[11px] text-slate-300">
                        Players-only lobby — open slots can still be filled or joined by room code anytime.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Invite Multiple Friends Simultaneously */}
              <div
                className="rounded-2xl border p-3.5 flex flex-col gap-2.5"
                style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Send className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                      Invite Multiple Friends & Players
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {invitablePeople.some(p => p.online) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedInviteUids(
                            new Set(invitablePeople.filter(p => p.online).slice(0, 6).map(p => p.uid))
                          );
                        }}
                        className="px-2.5 py-1 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-200 cursor-pointer"
                      >
                        Select Online
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={selectedInviteUids.size === 0 || isBusy}
                      onClick={() => void handleSendSelectedInvites()}
                      className="px-3 py-1.5 rounded-xl text-black text-xs font-extrabold flex items-center gap-1.5 cursor-pointer hover:brightness-110 disabled:opacity-45"
                      style={{ backgroundColor: activeTheme.accent }}
                    >
                      <Send className="w-3 h-3" />
                      <span>
                        Send Invites {selectedInviteUids.size > 0 ? `(${selectedInviteUids.size})` : ''}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={friendSearch}
                    onChange={e => setFriendSearch(e.target.value)}
                    placeholder="Search friends & online players..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border bg-black/25 text-xs text-white placeholder-slate-500 focus:outline-none"
                    style={{ borderColor: activeTheme.border }}
                  />
                </div>

                {invitablePeople.length === 0 ? (
                  <div className="text-xs text-slate-400 py-2 text-center">
                    No additional players online right now — share party code <span className="font-mono text-white font-bold">{myParty.code}</span>!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                    {invitablePeople.slice(0, 16).map(p => {
                      const checked = selectedInviteUids.has(p.uid);
                      const alreadySent = sentInviteUids.has(p.uid);
                      return (
                        <button
                          key={p.uid}
                          type="button"
                          onClick={() => toggleSelectInvite(p.uid)}
                          className={`px-2.5 py-2 rounded-xl border text-left flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            checked ? 'bg-sky-500/20 border-sky-400/60' : 'bg-black/25 border-white/10 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                                checked
                                  ? 'bg-sky-400 border-sky-300 text-black'
                                  : 'border-white/25 bg-black/30'
                              }`}
                            >
                              {checked && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                            <span className="text-sm shrink-0">{getAvatarIcon(p.avatarId)}</span>
                            <span className="text-xs font-bold text-white truncate">{p.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {alreadySent && (
                              <span className="text-[10px] font-bold text-emerald-300">Sent</span>
                            )}
                            <span
                              className={`w-2 h-2 rounded-full ${
                                p.online ? 'bg-emerald-400' : 'bg-slate-600'
                              }`}
                              title={p.online ? 'Online' : 'Offline'}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Launch Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="text-xs text-slate-300">
                  Game: <span className="font-extrabold text-white">{myParty.gameTitle}</span> ·{' '}
                  <span className="font-bold text-white">{myParty.matchMode.toUpperCase()}</span>{' '}
                  ({myParty.opponentMode === 'bots' ? 'Bots fill open seats' : 'Human players'})
                </div>

                {isLeader ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void launchPartyMatch()}
                    className="px-5 py-2.5 rounded-xl text-black font-black text-xs flex items-center gap-2 cursor-pointer hover:brightness-110 shadow-lg disabled:opacity-50"
                    style={{ backgroundColor: activeTheme.accent }}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>
                      {isBusy ? 'Starting Match...' : 'Start Party Match'}
                    </span>
                  </button>
                ) : (
                  <div className="px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 text-xs font-bold text-slate-300">
                    Waiting for {myParty.members.find(m => m.uid === myParty.leaderUid)?.displayName || 'Leader'} to start...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
