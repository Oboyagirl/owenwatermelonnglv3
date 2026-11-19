import {
  Timestamp,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

export const LEADERBOARD_PROFILES_COLLECTION = 'leaderboardProfiles';
export const MATCH_RECORDS_COLLECTION = 'matchRecords';
export const DEFAULT_STARTING_ELO = 1200;
const ELO_K_FACTOR = 32;

export interface LeaderboardProfile {
  userId: string;
  displayName: string;
  avatarId: string;
  isListed: boolean;
  overallElo: number;
  chessElo: number;
  arcadeElo: number;
  bestElo: number;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  chessMatches: number;
  chessWins: number;
  arcadeMatches: number;
  arcadeWins: number;
  winStreak: number;
  bestWinStreak: number;
  lastMatchId: string | null;
  lastGameTitle: string | null;
  createdAt?: Timestamp | unknown;
  updatedAt?: Timestamp | unknown;
}

export interface MatchRecordDoc {
  id: string;
  sourceType: 'chessRoom' | 'arcadeRoom';
  roomCode: string;
  gameKind: 'chess' | 'arcade';
  gameType: string;
  gameTitle: string;
  p1Uid: string;
  p1Name: string;
  p1AvatarId: string;
  p2Uid: string;
  p2Name: string;
  p2AvatarId: string;
  winnerSeat: 'p1' | 'p2' | 'draw';
  p1Delta: number;
  p2Delta: number;
  p1EloAfter: number;
  p2EloAfter: number;
  p1CatDelta: number;
  p2CatDelta: number;
  p1CatEloAfter: number;
  p2CatEloAfter: number;
  isPublic: boolean;
  createdAt?: Timestamp | unknown;
}

export interface SettledEloResult {
  matchId: string;
  myOverallDelta: number;
  myNewOverallElo: number;
  myCategoryDelta: number;
  myNewCategoryElo: number;
}

function isPermissionDeniedError(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code;
  const msg = err instanceof Error ? err.message : String(err || '');
  return code === 'permission-denied' || msg.toLowerCase().includes('missing or insufficient permissions');
}

function clampString(val: unknown, fallback: string, maxLen: number): string {
  const str = typeof val === 'string' ? val.trim() : '';
  if (!str) return fallback;
  return str.slice(0, maxLen);
}

function clampElo(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_STARTING_ELO;
  return Math.max(100, Math.min(4000, Math.round(n)));
}

export function computeEloDeltas(
  p1Elo: number,
  p2Elo: number,
  winnerSeat: 'p1' | 'p2' | 'draw'
): { p1Delta: number; p2Delta: number; p1New: number; p2New: number } {
  const r1 = clampElo(p1Elo);
  const r2 = clampElo(p2Elo);
  const expected1 = 1 / (1 + Math.pow(10, (r2 - r1) / 400));
  const actual1 = winnerSeat === 'p1' ? 1 : winnerSeat === 'draw' ? 0.5 : 0;
  let d1 = Math.round(ELO_K_FACTOR * (actual1 - expected1));
  // Ensure decisive wins always shift at least +/- 1 ELO and clamp to +/- 64
  if (winnerSeat === 'p1' && d1 <= 0) d1 = 1;
  if (winnerSeat === 'p2' && d1 >= 0) d1 = -1;
  d1 = Math.max(-64, Math.min(64, d1));
  const d2 = -d1;
  const p1New = clampElo(r1 + d1);
  const p2New = clampElo(r2 + d2);
  return {
    p1Delta: p1New - r1,
    p2Delta: p2New - r2,
    p1New,
    p2New
  };
}

export function buildMatchId(params: {
  sourceType: 'chessRoom' | 'arcadeRoom';
  roomCode: string;
  moveCount: number;
  winnerSeat: 'p1' | 'p2' | 'draw';
  p1Uid: string;
  p2Uid: string;
  movesSample: string;
}): string {
  // Stable deterministic hash so P1 and P2 converge on the exact same matchId
  const raw = `${params.sourceType}_${params.roomCode}_${params.moveCount}_${params.winnerSeat}_${params.p1Uid.slice(0, 8)}_${params.p2Uid.slice(0, 8)}_${params.movesSample}`;
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const hex = (hash >>> 0).toString(16);
  const cleanCode = params.roomCode.replace(/[^A-Z0-9]/gi, '').slice(0, 8) || 'ROOM';
  return `m_${params.sourceType === 'chessRoom' ? 'ch' : 'ar'}_${cleanCode}_${params.moveCount}_${hex}`;
}

export async function ensureMyLeaderboardProfile(params: {
  uid: string;
  displayName: string;
  avatarId: string;
}): Promise<LeaderboardProfile | null> {
  if (!params.uid || auth.currentUser?.uid !== params.uid) return null;
  const ref = doc(db, LEADERBOARD_PROFILES_COLLECTION, params.uid);
  const path = `${LEADERBOARD_PROFILES_COLLECTION}/${params.uid}`;
  const cleanName = clampString(params.displayName, 'Player', 64);
  const cleanAvatar = clampString(params.avatarId, 'melon_classic', 64);

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const initial: LeaderboardProfile = {
        userId: params.uid,
        displayName: cleanName,
        avatarId: cleanAvatar,
        isListed: true,
        overallElo: DEFAULT_STARTING_ELO,
        chessElo: DEFAULT_STARTING_ELO,
        arcadeElo: DEFAULT_STARTING_ELO,
        bestElo: DEFAULT_STARTING_ELO,
        totalMatches: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        chessMatches: 0,
        chessWins: 0,
        arcadeMatches: 0,
        arcadeWins: 0,
        winStreak: 0,
        bestWinStreak: 0,
        lastMatchId: null,
        lastGameTitle: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(ref, initial);
      return initial;
    }

    const existing = snap.data() as LeaderboardProfile;
    if (existing.displayName !== cleanName || existing.avatarId !== cleanAvatar) {
      await updateDoc(ref, {
        displayName: cleanName,
        avatarId: cleanAvatar,
        updatedAt: serverTimestamp()
      });
      return { ...existing, displayName: cleanName, avatarId: cleanAvatar };
    }
    return existing;
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
    throw err;
  }
}

const settledMatchCache = new Map<string, SettledEloResult>();

export async function settleOnlinePvpMatchElo(params: {
  matchId: string;
  sourceType: 'chessRoom' | 'arcadeRoom';
  roomCode: string;
  gameKind: 'chess' | 'arcade';
  gameType: string;
  gameTitle: string;
  p1Uid: string;
  p1Name: string;
  p1AvatarId: string;
  p2Uid: string;
  p2Name: string;
  p2AvatarId: string;
  winnerSeat: 'p1' | 'p2' | 'draw';
}): Promise<SettledEloResult | null> {
  const myUid = auth.currentUser?.uid;
  if (!myUid) return null;
  if (myUid !== params.p1Uid && myUid !== params.p2Uid) return null;
  if (!params.p1Uid || !params.p2Uid || params.p1Uid === params.p2Uid) return null;

  const cacheKey = `${myUid}:${params.matchId}`;
  const cached = settledMatchCache.get(cacheKey);
  if (cached) return cached;

  const matchRef = doc(db, MATCH_RECORDS_COLLECTION, params.matchId);
  const myProfileRef = doc(db, LEADERBOARD_PROFILES_COLLECTION, myUid);
  const p1ProfileRef = doc(db, LEADERBOARD_PROFILES_COLLECTION, params.p1Uid);
  const p2ProfileRef = doc(db, LEADERBOARD_PROFILES_COLLECTION, params.p2Uid);

  // Pre-fetch opponent profile ratings (best-effort) so canonical match calculation uses live ratings
  let preP1Elo = DEFAULT_STARTING_ELO;
  let preP1CatElo = DEFAULT_STARTING_ELO;
  let preP2Elo = DEFAULT_STARTING_ELO;
  let preP2CatElo = DEFAULT_STARTING_ELO;

  try {
    const [p1Snap, p2Snap] = await Promise.all([getDoc(p1ProfileRef), getDoc(p2ProfileRef)]);
    if (p1Snap.exists()) {
      const d = p1Snap.data() as LeaderboardProfile;
      preP1Elo = clampElo(d.overallElo);
      preP1CatElo = clampElo(params.gameKind === 'chess' ? d.chessElo : d.arcadeElo);
    }
    if (p2Snap.exists()) {
      const d = p2Snap.data() as LeaderboardProfile;
      preP2Elo = clampElo(d.overallElo);
      preP2CatElo = clampElo(params.gameKind === 'chess' ? d.chessElo : d.arcadeElo);
    }
  } catch {}

  try {
    const result = await runTransaction(db, async (tx) => {
      const matchSnap = await tx.get(matchRef);
      const mySnap = await tx.get(myProfileRef);

      let canonicalMatch: MatchRecordDoc;
      let shouldCreateMatch = false;

      if (matchSnap.exists()) {
        canonicalMatch = matchSnap.data() as MatchRecordDoc;
      } else {
        const myCurrentOverall = mySnap.exists()
          ? clampElo((mySnap.data() as LeaderboardProfile).overallElo)
          : DEFAULT_STARTING_ELO;
        const myCurrentCat = mySnap.exists()
          ? clampElo(
              params.gameKind === 'chess'
                ? (mySnap.data() as LeaderboardProfile).chessElo
                : (mySnap.data() as LeaderboardProfile).arcadeElo
            )
          : DEFAULT_STARTING_ELO;

        const r1Overall = myUid === params.p1Uid ? myCurrentOverall : preP1Elo;
        const r2Overall = myUid === params.p2Uid ? myCurrentOverall : preP2Elo;
        const r1Cat = myUid === params.p1Uid ? myCurrentCat : preP1CatElo;
        const r2Cat = myUid === params.p2Uid ? myCurrentCat : preP2CatElo;

        const overallCalc = computeEloDeltas(r1Overall, r2Overall, params.winnerSeat);
        const catCalc = computeEloDeltas(r1Cat, r2Cat, params.winnerSeat);

        canonicalMatch = {
          id: params.matchId,
          sourceType: params.sourceType,
          roomCode: params.roomCode,
          gameKind: params.gameKind,
          gameType: clampString(params.gameType, 'chess', 32),
          gameTitle: clampString(params.gameTitle, 'Match', 64),
          p1Uid: params.p1Uid,
          p1Name: clampString(params.p1Name, 'Player 1', 64),
          p1AvatarId: clampString(params.p1AvatarId, 'melon_classic', 64),
          p2Uid: params.p2Uid,
          p2Name: clampString(params.p2Name, 'Player 2', 64),
          p2AvatarId: clampString(params.p2AvatarId, 'melon_classic', 64),
          winnerSeat: params.winnerSeat,
          p1Delta: overallCalc.p1Delta,
          p2Delta: overallCalc.p2Delta,
          p1EloAfter: overallCalc.p1New,
          p2EloAfter: overallCalc.p2New,
          p1CatDelta: catCalc.p1Delta,
          p2CatDelta: catCalc.p2Delta,
          p1CatEloAfter: catCalc.p1New,
          p2CatEloAfter: catCalc.p2New,
          isPublic: true,
          createdAt: serverTimestamp()
        };
        shouldCreateMatch = true;
      }

      const amP1 = myUid === canonicalMatch.p1Uid;
      const myDelta = amP1 ? canonicalMatch.p1Delta : canonicalMatch.p2Delta;
      const myCatDelta = amP1 ? canonicalMatch.p1CatDelta : canonicalMatch.p2CatDelta;
      const didWin =
        (amP1 && canonicalMatch.winnerSeat === 'p1') ||
        (!amP1 && canonicalMatch.winnerSeat === 'p2');
      const isDraw = canonicalMatch.winnerSeat === 'draw';
      const didLose = !didWin && !isDraw;

      const myName = clampString(amP1 ? params.p1Name : params.p2Name, 'Player', 64);
      const myAvatar = clampString(amP1 ? params.p1AvatarId : params.p2AvatarId, 'melon_classic', 64);

      if (shouldCreateMatch) {
        tx.set(matchRef, canonicalMatch);
      }

      if (!mySnap.exists()) {
        // Must create initial profile doc at 1200, then update — OR compute initial before calling settle
        const nextOverall = clampElo(DEFAULT_STARTING_ELO + myDelta);
        const nextChess =
          params.gameKind === 'chess' ? clampElo(DEFAULT_STARTING_ELO + myCatDelta) : DEFAULT_STARTING_ELO;
        const nextArcade =
          params.gameKind === 'arcade' ? clampElo(DEFAULT_STARTING_ELO + myCatDelta) : DEFAULT_STARTING_ELO;
        const newStreak = didWin ? 1 : 0;
        const profilePayload: LeaderboardProfile = {
          userId: myUid,
          displayName: myName,
          avatarId: myAvatar,
          isListed: true,
          overallElo: nextOverall,
          chessElo: nextChess,
          arcadeElo: nextArcade,
          bestElo: Math.max(DEFAULT_STARTING_ELO, nextOverall),
          totalMatches: 1,
          wins: didWin ? 1 : 0,
          losses: didLose ? 1 : 0,
          draws: isDraw ? 1 : 0,
          chessMatches: params.gameKind === 'chess' ? 1 : 0,
          chessWins: params.gameKind === 'chess' && didWin ? 1 : 0,
          arcadeMatches: params.gameKind === 'arcade' ? 1 : 0,
          arcadeWins: params.gameKind === 'arcade' && didWin ? 1 : 0,
          winStreak: newStreak,
          bestWinStreak: newStreak,
          lastMatchId: params.matchId,
          lastGameTitle: clampString(params.gameTitle, 'Match', 64),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        tx.set(myProfileRef, profilePayload);
        return {
          matchId: params.matchId,
          myOverallDelta: nextOverall - DEFAULT_STARTING_ELO,
          myNewOverallElo: nextOverall,
          myCategoryDelta:
            params.gameKind === 'chess'
              ? nextChess - DEFAULT_STARTING_ELO
              : nextArcade - DEFAULT_STARTING_ELO,
          myNewCategoryElo: params.gameKind === 'chess' ? nextChess : nextArcade
        };
      }

      const existing = mySnap.data() as LeaderboardProfile;
      if (existing.lastMatchId === params.matchId) {
        const currentCat =
          params.gameKind === 'chess' ? clampElo(existing.chessElo) : clampElo(existing.arcadeElo);
        return {
          matchId: params.matchId,
          myOverallDelta: myDelta,
          myNewOverallElo: clampElo(existing.overallElo),
          myCategoryDelta: myCatDelta,
          myNewCategoryElo: currentCat
        };
      }

      const nextOverall = clampElo(existing.overallElo + myDelta);
      const nextChess =
        params.gameKind === 'chess' ? clampElo(existing.chessElo + myCatDelta) : clampElo(existing.chessElo);
      const nextArcade =
        params.gameKind === 'arcade' ? clampElo(existing.arcadeElo + myCatDelta) : clampElo(existing.arcadeElo);
      const nextStreak = didWin ? existing.winStreak + 1 : 0;

      tx.update(myProfileRef, {
        displayName: myName,
        avatarId: myAvatar,
        overallElo: nextOverall,
        chessElo: nextChess,
        arcadeElo: nextArcade,
        bestElo: Math.max(existing.bestElo, nextOverall),
        totalMatches: existing.totalMatches + 1,
        wins: existing.wins + (didWin ? 1 : 0),
        losses: existing.losses + (didLose ? 1 : 0),
        draws: existing.draws + (isDraw ? 1 : 0),
        chessMatches: existing.chessMatches + (params.gameKind === 'chess' ? 1 : 0),
        chessWins: existing.chessWins + (params.gameKind === 'chess' && didWin ? 1 : 0),
        arcadeMatches: existing.arcadeMatches + (params.gameKind === 'arcade' ? 1 : 0),
        arcadeWins: existing.arcadeWins + (params.gameKind === 'arcade' && didWin ? 1 : 0),
        winStreak: nextStreak,
        bestWinStreak: Math.max(existing.bestWinStreak, nextStreak),
        lastMatchId: params.matchId,
        lastGameTitle: clampString(params.gameTitle, 'Match', 64),
        updatedAt: serverTimestamp()
      });

      return {
        matchId: params.matchId,
        myOverallDelta: nextOverall - clampElo(existing.overallElo),
        myNewOverallElo: nextOverall,
        myCategoryDelta:
          params.gameKind === 'chess'
            ? nextChess - clampElo(existing.chessElo)
            : nextArcade - clampElo(existing.arcadeElo),
        myNewCategoryElo: params.gameKind === 'chess' ? nextChess : nextArcade
      };
    });

    settledMatchCache.set(cacheKey, result);
    return result;
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.WRITE, `${MATCH_RECORDS_COLLECTION}/${params.matchId}`);
    }
    throw err;
  }
}

export function subscribeLeaderboardProfiles(
  maxCount: number,
  onUpdate: (profiles: LeaderboardProfile[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = LEADERBOARD_PROFILES_COLLECTION;
  const q = query(
    collection(db, LEADERBOARD_PROFILES_COLLECTION),
    where('isListed', '==', true),
    limit(maxCount)
  );
  return onSnapshot(
    q,
    (snap) => {
      const list: LeaderboardProfile[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data() as LeaderboardProfile;
        if (d && d.userId) list.push(d);
      });
      onUpdate(list);
    },
    (err) => {
      if (isPermissionDeniedError(err)) {
        try {
          handleFirestoreError(err, OperationType.LIST, path);
        } catch (wrapped) {
          onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
          return;
        }
      }
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  );
}

export function subscribeRecentMatchRecords(
  maxCount: number,
  onUpdate: (records: MatchRecordDoc[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = MATCH_RECORDS_COLLECTION;
  const q = query(
    collection(db, MATCH_RECORDS_COLLECTION),
    where('isPublic', '==', true),
    limit(maxCount)
  );
  return onSnapshot(
    q,
    (snap) => {
      const list: MatchRecordDoc[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data() as MatchRecordDoc;
        if (d && d.id) list.push(d);
      });
      list.sort((a, b) => {
        const msA = (a.createdAt as Timestamp | undefined)?.toMillis?.() ?? 0;
        const msB = (b.createdAt as Timestamp | undefined)?.toMillis?.() ?? 0;
        return msB - msA;
      });
      onUpdate(list);
    },
    (err) => {
      if (isPermissionDeniedError(err)) {
        try {
          handleFirestoreError(err, OperationType.LIST, path);
        } catch (wrapped) {
          onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
          return;
        }
      }
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  );
}
