import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  Crown,
  Flame,
  Gamepad2,
  History,
  Medal,
  Swords,
  Trophy,
  Users
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { ThemeConfig } from '../services/themeStore';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { AVATAR_PRESETS } from '../services/cloudSaveService';
import { ARCADE_GAMES } from '../utils/arcadeEngines';
import {
  DEFAULT_STARTING_ELO,
  LeaderboardProfile,
  MatchRecordDoc,
  ensureMyLeaderboardProfile,
  subscribeLeaderboardProfiles,
  subscribeRecentMatchRecords
} from '../services/leaderboardService';

interface LeaderboardViewProps {
  activeTheme: ThemeConfig;
}

type LeaderboardTab = 'overall' | 'chess' | 'arcade' | 'matches';

function getAvatarIcon(avatarId?: string | null): string {
  return (AVATAR_PRESETS.find((a) => a.id === avatarId) || AVATAR_PRESETS[0]).icon;
}

function getTierBadge(elo: number): { label: string; color: string } {
  if (elo >= 1800) return { label: 'Grandmaster', color: '#f59e0b' };
  if (elo >= 1600) return { label: 'Master', color: '#a855f7' };
  if (elo >= 1450) return { label: 'Diamond', color: '#38bdf8' };
  if (elo >= 1320) return { label: 'Gold', color: '#facc15' };
  if (elo >= 1220) return { label: 'Silver', color: '#cbd5e1' };
  return { label: 'Contender', color: '#94a3b8' };
}

function formatTimeAgo(ts: unknown): string {
  const ms = (ts as Timestamp | undefined)?.toMillis?.();
  if (!ms) return 'Just now';
  const diff = Math.max(0, Date.now() - ms);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ activeTheme }) => {
  const { user, profile, isSignedIn } = useAuth();
  const { navigateSpace } = useNotifications();
  const myUid = user?.uid && auth.currentUser?.uid === user.uid ? user.uid : '';

  const [activeTab, setActiveTab] = useState<LeaderboardTab>('overall');
  const [gameFilter, setGameFilter] = useState<string>('all');
  const [profiles, setProfiles] = useState<LeaderboardProfile[]>([]);
  const [recentMatches, setRecentMatches] = useState<MatchRecordDoc[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Ensure signed-in user is registered on the leaderboard and display name stays fresh
  useEffect(() => {
    if (!isSignedIn || !myUid) return;
    void ensureMyLeaderboardProfile({
      uid: myUid,
      displayName: profile?.displayName || user?.displayName || 'Player',
      avatarId: profile?.avatarId || 'melon_classic'
    }).catch(() => {});
  }, [isSignedIn, myUid, profile?.displayName, profile?.avatarId, user?.displayName]);

  useEffect(() => {
    if (!isSignedIn || !myUid) {
      setProfiles([]);
      setRecentMatches([]);
      return;
    }

    const unsubProfiles = subscribeLeaderboardProfiles(
      150,
      (list) => {
        setProfiles(list);
        setLoadError(null);
      },
      (err) => setLoadError(err.message || 'Could not load leaderboard.')
    );

    const unsubMatches = subscribeRecentMatchRecords(
      80,
      (list) => setRecentMatches(list),
      () => {}
    );

    return () => {
      unsubProfiles();
      unsubMatches();
    };
  }, [isSignedIn, myUid]);

  const sortedProfiles = useMemo(() => {
    const copy = [...profiles];
    copy.sort((a, b) => {
      const ratingA =
        activeTab === 'chess'
          ? a.chessElo
          : activeTab === 'arcade'
          ? a.arcadeElo
          : a.overallElo;
      const ratingB =
        activeTab === 'chess'
          ? b.chessElo
          : activeTab === 'arcade'
          ? b.arcadeElo
          : b.overallElo;
      if (ratingB !== ratingA) return ratingB - ratingA;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.totalMatches - a.totalMatches;
    });
    return copy;
  }, [profiles, activeTab]);

  const myStanding = useMemo(() => {
    if (!myUid) return null;
    const idx = sortedProfiles.findIndex((p) => p.userId === myUid);
    if (idx >= 0) {
      return { rank: idx + 1, entry: sortedProfiles[idx] };
    }
    return null;
  }, [sortedProfiles, myUid]);

  const filteredMatches = useMemo(() => {
    if (gameFilter === 'all') return recentMatches;
    return recentMatches.filter((m) => m.gameType === gameFilter);
  }, [recentMatches, gameFilter]);

  const topThree = sortedProfiles.slice(0, 3);

  return (
    <div
      className="flex-1 min-h-full p-4 md:p-6 lg:p-8 text-slate-100"
      style={{ backgroundColor: activeTheme.bgPrimary }}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-5">
        {/* Header Bar */}
        <div
          className="rounded-3xl border p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
        >
          <div className="flex items-start gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg"
              style={{
                backgroundColor: activeTheme.accentBadge,
                borderColor: activeTheme.borderActive
              }}
            >
              <Trophy className="w-6 h-6" style={{ color: activeTheme.accent }} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                PvP ELO Leaderboards
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Live competitive rankings across Online Chess &amp; all {ARCADE_GAMES.length} Multiplayer Minigames. Beat opponents to climb your ELO from 1200.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigateSpace('chess')}
              className="px-3.5 py-2 rounded-xl border text-xs font-extrabold text-white hover:bg-white/10 flex items-center gap-1.5 cursor-pointer"
              style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
            >
              <Crown className="w-3.5 h-3.5 text-sky-400" />
              <span>Play Chess</span>
            </button>
            <button
              type="button"
              onClick={() => navigateSpace('rooms')}
              className="px-3.5 py-2 rounded-xl text-black text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-lg hover:brightness-110"
              style={{ backgroundColor: activeTheme.accent }}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Play {ARCADE_GAMES.length} Minigames</span>
            </button>
          </div>
        </div>

        {/* Your Standing Card */}
        {isSignedIn && (
          <div
            className="rounded-2xl border p-4 shadow-xl flex flex-wrap items-center justify-between gap-4"
            style={{
              backgroundColor: activeTheme.bgCard,
              borderColor: activeTheme.borderActive
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shrink-0"
                style={{
                  backgroundColor: activeTheme.accentBadge,
                  borderColor: activeTheme.borderActive
                }}
              >
                {getAvatarIcon(profile?.avatarId)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">
                    {myStanding?.entry.displayName || profile?.displayName || user?.displayName || 'You'}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border"
                    style={{
                      backgroundColor: activeTheme.accentBadge,
                      borderColor: activeTheme.borderActive,
                      color: getTierBadge(myStanding?.entry.overallElo ?? DEFAULT_STARTING_ELO).color
                    }}
                  >
                    {getTierBadge(myStanding?.entry.overallElo ?? DEFAULT_STARTING_ELO).label}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                  {myStanding
                    ? `Rank #${myStanding.rank} of ${sortedProfiles.length} ranked players`
                    : 'Ranked at 1200 ELO — play any online PvP match to record wins'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 w-full lg:w-auto">
              <div className="px-3 py-2 rounded-xl border bg-black/25 text-center" style={{ borderColor: activeTheme.border }}>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Overall ELO</div>
                <div className="text-base font-black font-mono text-white tabular-nums">
                  {myStanding?.entry.overallElo ?? DEFAULT_STARTING_ELO}
                </div>
              </div>
              <div className="px-3 py-2 rounded-xl border bg-black/25 text-center" style={{ borderColor: activeTheme.border }}>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Chess ELO</div>
                <div className="text-base font-black font-mono text-sky-300 tabular-nums">
                  {myStanding?.entry.chessElo ?? DEFAULT_STARTING_ELO}
                </div>
              </div>
              <div className="px-3 py-2 rounded-xl border bg-black/25 text-center" style={{ borderColor: activeTheme.border }}>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Arcade ELO</div>
                <div className="text-base font-black font-mono text-pink-300 tabular-nums">
                  {myStanding?.entry.arcadeElo ?? DEFAULT_STARTING_ELO}
                </div>
              </div>
              <div className="px-3 py-2 rounded-xl border bg-black/25 text-center" style={{ borderColor: activeTheme.border }}>
                <div className="text-[10px] text-slate-400 font-bold uppercase">W / L / D</div>
                <div className="text-sm font-black font-mono text-emerald-300 tabular-nums mt-0.5">
                  {myStanding?.entry.wins ?? 0}-{myStanding?.entry.losses ?? 0}-{myStanding?.entry.draws ?? 0}
                </div>
              </div>
              <div className="px-3 py-2 rounded-xl border bg-black/25 text-center" style={{ borderColor: activeTheme.border }}>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Streak</div>
                <div className="text-base font-black font-mono text-amber-300 tabular-nums flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{myStanding?.entry.winStreak ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mode Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl border"
            style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
          >
            {(
              [
                { id: 'overall', label: 'Overall ELO', icon: Trophy },
                { id: 'chess', label: 'Chess ELO', icon: Crown },
                { id: 'arcade', label: 'Minigames ELO', icon: Gamepad2 },
                { id: 'matches', label: 'Recent Matches', icon: History }
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                    active ? 'text-black shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: active ? activeTheme.accent : undefined
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab === 'matches' && (
            <select
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border text-xs font-bold text-white focus:outline-none"
              style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
            >
              <option value="all">All Games ({recentMatches.length})</option>
              <option value="chess">♟️ Chess</option>
              {ARCADE_GAMES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.emoji} {g.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {loadError && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-xs text-rose-200">
            {loadError}
          </div>
        )}

        {activeTab !== 'matches' ? (
          <>
            {/* Top 3 Podium Cards */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {topThree.map((entry, idx) => {
                  const rating =
                    activeTab === 'chess'
                      ? entry.chessElo
                      : activeTab === 'arcade'
                      ? entry.arcadeElo
                      : entry.overallElo;
                  const winRate =
                    entry.totalMatches > 0
                      ? Math.round((entry.wins / entry.totalMatches) * 100)
                      : 0;
                  const rankColors = ['#facc15', '#e2e8f0', '#fb923c'];
                  const rankLabels = ['#1 Champion', '#2 Runner-Up', '#3 Podium'];
                  const isMe = entry.userId === myUid;
                  return (
                    <div
                      key={entry.userId}
                      className="rounded-2xl border p-4 shadow-xl flex flex-col gap-3 relative overflow-hidden"
                      style={{
                        backgroundColor: activeTheme.bgCard,
                        borderColor: isMe ? activeTheme.borderActive : activeTheme.border
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-black uppercase tracking-wider flex items-center gap-1"
                          style={{ color: rankColors[idx] }}
                        >
                          <Medal className="w-4 h-4" />
                          <span>{rankLabels[idx]}</span>
                        </span>
                        <span className="font-mono text-lg font-black text-white tabular-nums">
                          {rating} ELO
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-2xl border flex items-center justify-center text-2xl shrink-0"
                          style={{
                            backgroundColor: activeTheme.accentBadge,
                            borderColor: activeTheme.borderActive
                          }}
                        >
                          {getAvatarIcon(entry.avatarId)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-black text-white truncate flex items-center gap-1.5">
                            <span className="truncate">{entry.displayName}</span>
                            {isMe && (
                              <span className="text-[10px] font-mono text-emerald-400 shrink-0">(You)</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {entry.wins}W-{entry.losses}L-{entry.draws}D · {winRate}% win rate
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full Rankings Table */}
            <div
              className="rounded-2xl border overflow-hidden shadow-xl"
              style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
            >
              <div
                className="px-4 py-3 border-b flex items-center justify-between text-xs font-bold text-slate-300"
                style={{ backgroundColor: activeTheme.bgHeader, borderColor: activeTheme.border }}
              >
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" style={{ color: activeTheme.accent }} />
                  <span>
                    {activeTab === 'chess'
                      ? 'Chess Ratings'
                      : activeTab === 'arcade'
                      ? 'Minigames Ratings'
                      : 'Global Combined ELO'}
                  </span>
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {sortedProfiles.length} Players
                </span>
              </div>

              {sortedProfiles.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center gap-2 text-slate-400">
                  <Award className="w-8 h-8 opacity-60" />
                  <p className="text-sm font-bold text-white">No ranked matches recorded yet</p>
                  <p className="text-xs max-w-md">
                    Play an online Chess match or challenge a friend in any of the {ARCADE_GAMES.length} Minigames to climb the ELO standings.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b text-[10px] uppercase tracking-wider text-slate-400" style={{ borderColor: activeTheme.border }}>
                        <th className="py-2.5 px-4">Rank</th>
                        <th className="py-2.5 px-3">Player</th>
                        <th className="py-2.5 px-3 text-right">
                          {activeTab === 'chess' ? 'Chess ELO' : activeTab === 'arcade' ? 'Arcade ELO' : 'Overall ELO'}
                        </th>
                        <th className="py-2.5 px-3 text-right hidden sm:table-cell">Peak</th>
                        <th className="py-2.5 px-3 text-right">W-L-D</th>
                        <th className="py-2.5 px-3 text-right hidden md:table-cell">Win %</th>
                        <th className="py-2.5 px-4 text-right hidden sm:table-cell">Streak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedProfiles.map((entry, idx) => {
                        const rating =
                          activeTab === 'chess'
                            ? entry.chessElo
                            : activeTab === 'arcade'
                            ? entry.arcadeElo
                            : entry.overallElo;
                        const tier = getTierBadge(rating);
                        const isMe = entry.userId === myUid;
                        const matches =
                          activeTab === 'chess'
                            ? entry.chessMatches
                            : activeTab === 'arcade'
                            ? entry.arcadeMatches
                            : entry.totalMatches;
                        const wins =
                          activeTab === 'chess'
                            ? entry.chessWins
                            : activeTab === 'arcade'
                            ? entry.arcadeWins
                            : entry.wins;
                        const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;

                        return (
                          <tr
                            key={entry.userId}
                            className={`border-b transition-colors ${
                              isMe ? 'bg-emerald-500/10' : 'hover:bg-white/5'
                            }`}
                            style={{ borderColor: activeTheme.border }}
                          >
                            <td className="py-2.5 px-4 font-mono font-black text-slate-300 tabular-nums">
                              #{idx + 1}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-base shrink-0">{getAvatarIcon(entry.avatarId)}</span>
                                <div className="min-w-0">
                                  <div className="font-bold text-white truncate flex items-center gap-1.5">
                                    <span>{entry.displayName}</span>
                                    {isMe && (
                                      <span className="text-[10px] font-mono text-emerald-400">(You)</span>
                                    )}
                                  </div>
                                  <div className="text-[10px] font-semibold" style={{ color: tier.color }}>
                                    {tier.label}
                                    {entry.lastGameTitle ? ` · Last: ${entry.lastGameTitle}` : ''}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-white tabular-nums">
                              {rating}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-400 hidden sm:table-cell tabular-nums">
                              {entry.bestElo}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-200 tabular-nums">
                              {entry.wins}-{entry.losses}-{entry.draws}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-300 hidden md:table-cell tabular-nums">
                              {winRate}%
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-amber-300 hidden sm:table-cell tabular-nums">
                              {entry.winStreak > 0 ? `${entry.winStreak}🔥` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Recent PvP Match History */
          <div
            className="rounded-2xl border overflow-hidden shadow-xl"
            style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
          >
            <div
              className="px-4 py-3 border-b flex items-center justify-between text-xs font-bold text-slate-300"
              style={{ backgroundColor: activeTheme.bgHeader, borderColor: activeTheme.border }}
            >
              <span className="flex items-center gap-1.5">
                <History className="w-4 h-4" style={{ color: activeTheme.accent }} />
                <span>Completed Online Matches</span>
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {filteredMatches.length} Recorded
              </span>
            </div>

            {filteredMatches.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center gap-2 text-slate-400">
                <Swords className="w-8 h-8 opacity-60" />
                <p className="text-sm font-bold text-white">No completed PvP matches here yet</p>
                <p className="text-xs">Finish an online Chess or Minigames match to see match results and ELO shifts.</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: activeTheme.border }}>
                {filteredMatches.map((m) => {
                  const p1Won = m.winnerSeat === 'p1';
                  const p2Won = m.winnerSeat === 'p2';
                  const p1Sign = m.p1Delta >= 0 ? `+${m.p1Delta}` : `${m.p1Delta}`;
                  const p2Sign = m.p2Delta >= 0 ? `+${m.p2Delta}` : `${m.p2Delta}`;
                  return (
                    <div
                      key={m.id}
                      className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="px-2 py-0.5 rounded-md border text-[10px] font-bold text-slate-300 bg-black/30 shrink-0" style={{ borderColor: activeTheme.border }}>
                          {m.gameTitle}
                        </span>
                        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                          <span className={`font-bold flex items-center gap-1 ${p1Won ? 'text-emerald-300' : 'text-slate-200'}`}>
                            <span>{getAvatarIcon(m.p1AvatarId)}</span>
                            <span>{m.p1Name}</span>
                            <span className={`font-mono text-[10px] ${m.p1Delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              ({p1Sign})
                            </span>
                          </span>
                          <span className="text-slate-500 font-bold text-[10px]">vs</span>
                          <span className={`font-bold flex items-center gap-1 ${p2Won ? 'text-emerald-300' : 'text-slate-200'}`}>
                            <span>{getAvatarIcon(m.p2AvatarId)}</span>
                            <span>{m.p2Name}</span>
                            <span className={`font-mono text-[10px] ${m.p2Delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              ({p2Sign})
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 shrink-0">
                        <span className="text-slate-200 font-bold">
                          {m.winnerSeat === 'draw'
                            ? 'Draw'
                            : p1Won
                            ? `${m.p1Name} won`
                            : `${m.p2Name} won`}
                        </span>
                        <span>{formatTimeAgo(m.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
