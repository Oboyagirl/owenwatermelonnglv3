import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import {
  auth,
  db,
  formatFriendlyFirestoreError,
  handleFirestoreError,
  OperationType
} from './firebase';
import { timestampToMs } from './chatService';
import { createFirestoreChessRoom } from './chessRoomService';
import { createFirestoreArcadeRoom } from './arcadeRoomService';
import type { ArcadeGameType } from '../utils/arcadeEngines';
import {
  createEmptySeats,
  createHumanSeat,
  getTeamSize,
  TeamMode,
  TeamSeat
} from '../utils/teamModes';

const PARTIES_COLLECTION = 'parties';
const PARTY_INVITES_COLLECTION = 'partyInvites';
const PARTY_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export type PartyTeam = 'A' | 'B';
export type PartyOpponentMode = 'humans' | 'bots';
export type PartyStatus = 'lobby' | 'in_game';
export type PartyGameKind = 'chess' | 'arcade';
export type PartyInviteStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface PartyMember {
  uid: string;
  playerId: string;
  displayName: string;
  avatarId: string;
  team: PartyTeam;
}

export interface PartyDoc {
  id: string;
  code: string;
  leaderUid: string;
  status: PartyStatus;
  matchMode: TeamMode;
  opponentMode: PartyOpponentMode;
  gameKind: PartyGameKind;
  gameType: string;
  gameTitle: string;
  botId: string;
  members: PartyMember[];
  memberUids: string[];
  activeRoomCode: string | null;
  activeGameKind: PartyGameKind | null;
  activeGameType: string | null;
  activeLaunchId: string | null;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface PartyInvite {
  id: string;
  partyId: string;
  partyCode: string;
  fromUid: string;
  fromName: string;
  fromAvatarId: string;
  toUid: string;
  toName: string;
  participantUids: [string, string];
  matchMode: TeamMode;
  opponentMode: PartyOpponentMode;
  gameKind: PartyGameKind;
  gameType: string;
  gameTitle: string;
  status: PartyInviteStatus;
  createdAt: unknown;
  updatedAt: unknown;
}

export function sanitizePartyCode(raw: unknown): string {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
}

function generatePartyCode(): string {
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += PARTY_ALPHABET[Math.floor(Math.random() * PARTY_ALPHABET.length)];
  }
  return out;
}

function sanitizeDisplayName(raw: unknown): string {
  return String(raw || 'Player').trim().slice(0, 24) || 'Player';
}

function sanitizeAvatarId(raw: unknown): string {
  return String(raw || 'melon_classic').trim().slice(0, 64) || 'melon_classic';
}

function sanitizePlayerId(raw: unknown, fallbackUid: string): string {
  return String(raw || fallbackUid).trim().slice(0, 64) || fallbackUid;
}

function isPermissionDeniedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: string; message?: string };
  return (
    e.code === 'permission-denied' ||
    (typeof e.message === 'string' &&
      e.message.toLowerCase().includes('missing or insufficient permissions'))
  );
}

function balanceTeamAssignment(
  members: PartyMember[],
  matchMode: TeamMode
): PartyTeam {
  const maxPerTeam = matchMode === '2v2' ? 2 : 1;
  const countA = members.filter(m => m.team === 'A').length;
  const countB = members.filter(m => m.team === 'B').length;
  if (countA < countB && countA < maxPerTeam) return 'A';
  if (countB < maxPerTeam) return 'B';
  if (countA < maxPerTeam) return 'A';
  return countA <= countB ? 'A' : 'B';
}

export async function createParty(params: {
  playerId: string;
  displayName: string;
  avatarId: string;
  matchMode?: TeamMode;
  opponentMode?: PartyOpponentMode;
  gameKind?: PartyGameKind;
  gameType?: string;
  gameTitle?: string;
  botId?: string;
}): Promise<PartyDoc> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('Sign in with Google to host a party.');
  }

  const member: PartyMember = {
    uid,
    playerId: sanitizePlayerId(params.playerId, uid),
    displayName: sanitizeDisplayName(params.displayName),
    avatarId: sanitizeAvatarId(params.avatarId),
    team: 'A'
  };

  const matchMode: TeamMode = params.matchMode === '1v1' ? '1v1' : '2v2';
  const opponentMode: PartyOpponentMode =
    params.opponentMode === 'bots' ? 'bots' : 'humans';
  const gameKind: PartyGameKind = params.gameKind === 'arcade' ? 'arcade' : 'chess';
  const gameType = String(params.gameType || (gameKind === 'chess' ? 'chess' : 'connect4')).slice(0, 32);
  const gameTitle = String(params.gameTitle || (gameKind === 'chess' ? 'Chess' : 'Connect Four')).slice(0, 64);
  const botId = String(params.botId || (gameKind === 'chess' ? 'clara' : 'orbit-bot')).slice(0, 32);

  for (let attempt = 0; attempt < 6; attempt++) {
    const code = generatePartyCode();
    const ref = doc(db, PARTIES_COLLECTION, code);
    const path = `${PARTIES_COLLECTION}/${code}`;

    try {
      const created = await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (snap.exists()) return null;

        const payload = {
          id: code,
          code,
          leaderUid: uid,
          status: 'lobby' as PartyStatus,
          matchMode,
          opponentMode,
          gameKind,
          gameType,
          gameTitle,
          botId,
          members: [member],
          memberUids: [uid],
          activeRoomCode: null,
          activeGameKind: null,
          activeGameType: null,
          activeLaunchId: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        tx.set(ref, payload);
        return payload as PartyDoc;
      });

      if (created) return created;
    } catch (err) {
      if (isPermissionDeniedError(err)) {
        try {
          handleFirestoreError(err, OperationType.CREATE, path);
        } catch (wrapped) {
          throw new Error(formatFriendlyFirestoreError(wrapped));
        }
      }
      throw new Error(formatFriendlyFirestoreError(err));
    }
  }

  throw new Error('Could not start a fresh party code right now. Please try again.');
}

export async function joinPartyByCode(params: {
  code: string;
  playerId: string;
  displayName: string;
  avatarId: string;
}): Promise<PartyDoc> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('Sign in with Google first to join a party.');
  }

  const cleanCode = sanitizePartyCode(params.code);
  if (cleanCode.length < 4) {
    throw new Error('Enter a valid 6-character party code.');
  }

  const ref = doc(db, PARTIES_COLLECTION, cleanCode);
  const path = `${PARTIES_COLLECTION}/${cleanCode}`;

  try {
    return await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) {
        throw new Error(`Party "${cleanCode}" was not found or has closed.`);
      }
      const data = snap.data() as PartyDoc;
      const members = Array.isArray(data.members) ? [...data.members] : [];
      const existingIdx = members.findIndex(m => m.uid === uid);

      const safeName = sanitizeDisplayName(params.displayName);
      const safeAvatar = sanitizeAvatarId(params.avatarId);
      const safePlayerId = sanitizePlayerId(params.playerId, uid);

      if (existingIdx >= 0) {
        members[existingIdx] = {
          ...members[existingIdx],
          playerId: safePlayerId,
          displayName: safeName,
          avatarId: safeAvatar
        };
      } else {
        if (members.length >= 4) {
          throw new Error(`Party "${cleanCode}" is already full (4/4 players).`);
        }
        const team = balanceTeamAssignment(members, data.matchMode || '2v2');
        members.push({
          uid,
          playerId: safePlayerId,
          displayName: safeName,
          avatarId: safeAvatar,
          team
        });
      }

      const memberUids = members.map(m => m.uid);
      tx.update(ref, {
        members,
        memberUids,
        updatedAt: serverTimestamp()
      });

      return {
        ...data,
        members,
        memberUids
      };
    });
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, path);
      } catch (wrapped) {
        throw new Error(formatFriendlyFirestoreError(wrapped));
      }
    }
    throw new Error(formatFriendlyFirestoreError(err));
  }
}

export async function leaveParty(partyCode: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  const cleanCode = sanitizePartyCode(partyCode);
  if (!uid || cleanCode.length < 4) return;

  const ref = doc(db, PARTIES_COLLECTION, cleanCode);
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) return;
      const data = snap.data() as PartyDoc;
      const remaining = (Array.isArray(data.members) ? data.members : []).filter(
        m => m.uid !== uid
      );

      if (remaining.length === 0) {
        tx.delete(ref);
        return;
      }

      const nextLeader =
        data.leaderUid === uid ? remaining[0].uid : data.leaderUid;

      tx.update(ref, {
        leaderUid: nextLeader,
        members: remaining,
        memberUids: remaining.map(m => m.uid),
        updatedAt: serverTimestamp()
      });
    });
  } catch {
    // Non-fatal cleanup when exiting a party
  }
}

export async function kickPartyMember(partyCode: string, targetUid: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  const cleanCode = sanitizePartyCode(partyCode);
  if (!uid || !targetUid || targetUid === uid || cleanCode.length < 4) return;

  const ref = doc(db, PARTIES_COLLECTION, cleanCode);
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) return;
      const data = snap.data() as PartyDoc;
      if (data.leaderUid !== uid) return;

      const remaining = (Array.isArray(data.members) ? data.members : []).filter(
        m => m.uid !== targetUid
      );
      if (remaining.length === (data.members?.length || 0)) return;

      tx.update(ref, {
        members: remaining,
        memberUids: remaining.map(m => m.uid),
        updatedAt: serverTimestamp()
      });
    });
  } catch {
    // Ignore benign kick contention
  }
}

export async function switchPartyMemberTeam(
  partyCode: string,
  targetTeam: PartyTeam
): Promise<void> {
  const uid = auth.currentUser?.uid;
  const cleanCode = sanitizePartyCode(partyCode);
  if (!uid || cleanCode.length < 4) return;

  const ref = doc(db, PARTIES_COLLECTION, cleanCode);
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) return;
      const data = snap.data() as PartyDoc;
      const members = Array.isArray(data.members) ? [...data.members] : [];
      const idx = members.findIndex(m => m.uid === uid);
      if (idx < 0) return;

      const maxPerTeam = data.matchMode === '2v2' ? 2 : 1;
      const targetCount = members.filter((m, i) => i !== idx && m.team === targetTeam).length;
      if (targetCount >= maxPerTeam) {
        // Swap with the last member on the target team so switching always works smoothly
        const swapIdx = members.findIndex((m, i) => i !== idx && m.team === targetTeam);
        if (swapIdx >= 0) {
          const oldTeam = members[idx].team;
          members[swapIdx] = { ...members[swapIdx], team: oldTeam };
        }
      }

      members[idx] = { ...members[idx], team: targetTeam };
      tx.update(ref, {
        members,
        memberUids: members.map(m => m.uid),
        updatedAt: serverTimestamp()
      });
    });
  } catch {
    // Ignore contention
  }
}

export async function updatePartySettings(
  partyCode: string,
  patch: Partial<Pick<PartyDoc, 'matchMode' | 'opponentMode' | 'gameKind' | 'gameType' | 'gameTitle' | 'botId'>>
): Promise<void> {
  const uid = auth.currentUser?.uid;
  const cleanCode = sanitizePartyCode(partyCode);
  if (!uid || cleanCode.length < 4) return;

  const ref = doc(db, PARTIES_COLLECTION, cleanCode);
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) return;
      const data = snap.data() as PartyDoc;
      if (data.leaderUid !== uid) return;

      const nextMatchMode = patch.matchMode || data.matchMode;
      const nextOpponentMode = patch.opponentMode || data.opponentMode;
      const nextGameKind = patch.gameKind || data.gameKind;
      const nextGameType = (patch.gameType || data.gameType).slice(0, 32);
      const nextGameTitle = (patch.gameTitle || data.gameTitle).slice(0, 64);
      const nextBotId = (patch.botId || data.botId).slice(0, 32);

      // Rebalance teams cleanly when switching from 2v2 down to 1v1
      let nextMembers = Array.isArray(data.members) ? [...data.members] : [];
      if (nextMatchMode === '1v1') {
        let aUsed = 0;
        let bUsed = 0;
        nextMembers = nextMembers.map(m => {
          if (m.team === 'A') {
            if (aUsed < 1) {
              aUsed += 1;
              return m;
            }
            if (bUsed < 1) {
              bUsed += 1;
              return { ...m, team: 'B' as PartyTeam };
            }
            return m;
          } else {
            if (bUsed < 1) {
              bUsed += 1;
              return m;
            }
            if (aUsed < 1) {
              aUsed += 1;
              return { ...m, team: 'A' as PartyTeam };
            }
            return m;
          }
        });
      }

      tx.update(ref, {
        matchMode: nextMatchMode,
        opponentMode: nextOpponentMode,
        gameKind: nextGameKind,
        gameType: nextGameType,
        gameTitle: nextGameTitle,
        botId: nextBotId,
        members: nextMembers,
        memberUids: nextMembers.map(m => m.uid),
        updatedAt: serverTimestamp()
      });
    });
  } catch {
    // Ignore contention on rapid clicks
  }
}

export async function inviteMultipleToParty(params: {
  party: PartyDoc;
  fromName: string;
  fromAvatarId: string;
  targets: Array<{ uid: string; name: string }>;
}): Promise<number> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('Sign in with Google to send party invites.');
  }
  const existingUids = new Set(params.party.memberUids);
  const validTargets = params.targets.filter(
    t => t.uid && t.uid !== uid && !existingUids.has(t.uid)
  );
  if (validTargets.length === 0) return 0;

  const batch = writeBatch(db);
  for (const target of validTargets.slice(0, 8)) {
    const inviteId = `pinv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const ref = doc(db, PARTY_INVITES_COLLECTION, inviteId);
    batch.set(ref, {
      id: inviteId,
      partyId: params.party.id,
      partyCode: params.party.code,
      fromUid: uid,
      fromName: String(params.fromName || 'Player').trim().slice(0, 64) || 'Player',
      fromAvatarId: sanitizeAvatarId(params.fromAvatarId),
      toUid: target.uid,
      toName: String(target.name || 'Friend').trim().slice(0, 64) || 'Friend',
      participantUids: [uid, target.uid] as [string, string],
      matchMode: params.party.matchMode,
      opponentMode: params.party.opponentMode,
      gameKind: params.party.gameKind,
      gameType: params.party.gameType,
      gameTitle: params.party.gameTitle,
      status: 'pending' as PartyInviteStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  try {
    await batch.commit();
    return validTargets.slice(0, 8).length;
  } catch (err) {
    // Fall back to individual writes so one non-existent profile never fails the batch
    let sent = 0;
    for (const target of validTargets.slice(0, 8)) {
      const inviteId = `pinv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const ref = doc(db, PARTY_INVITES_COLLECTION, inviteId);
      try {
        await setDoc(ref, {
          id: inviteId,
          partyId: params.party.id,
          partyCode: params.party.code,
          fromUid: uid,
          fromName: String(params.fromName || 'Player').trim().slice(0, 64) || 'Player',
          fromAvatarId: sanitizeAvatarId(params.fromAvatarId),
          toUid: target.uid,
          toName: String(target.name || 'Friend').trim().slice(0, 64) || 'Friend',
          participantUids: [uid, target.uid] as [string, string],
          matchMode: params.party.matchMode,
          opponentMode: params.party.opponentMode,
          gameKind: params.party.gameKind,
          gameType: params.party.gameType,
          gameTitle: params.party.gameTitle,
          status: 'pending' as PartyInviteStatus,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        sent += 1;
      } catch {
        // Skip invalid target without surfacing an error
      }
    }
    if (sent === 0 && isPermissionDeniedError(err)) {
      throw new Error('Could not deliver invites — please verify the players are online.');
    }
    return sent;
  }
}

export async function respondToPartyInvite(params: {
  invite: PartyInvite;
  status: 'accepted' | 'declined';
  playerId: string;
  displayName: string;
  avatarId: string;
}): Promise<PartyDoc | null> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('Sign in with Google first.');
  }

  const invRef = doc(db, PARTY_INVITES_COLLECTION, params.invite.id);
  let joinedParty: PartyDoc | null = null;

  if (params.status === 'accepted') {
    joinedParty = await joinPartyByCode({
      code: params.invite.partyCode,
      playerId: params.playerId,
      displayName: params.displayName,
      avatarId: params.avatarId
    });
  }

  try {
    await updateDoc(invRef, {
      status: params.status,
      updatedAt: serverTimestamp()
    });
  } catch {
    // Invite update may already be marked; non-fatal
  }

  return joinedParty;
}

function buildPresetSeatsFromParty(party: PartyDoc): {
  seatsA: TeamSeat[];
  seatsB: TeamSeat[];
} {
  const teamSize = getTeamSize(party.matchMode);
  const seatsA = createEmptySeats(party.matchMode);
  const seatsB = createEmptySeats(party.matchMode);

  const putInTeam = (list: TeamSeat[], member: PartyMember): boolean => {
    const idx = list.findIndex(s => s.kind === 'open');
    if (idx < 0) return false;
    list[idx] = createHumanSeat({
      uid: member.uid,
      playerId: member.playerId,
      name: member.displayName
    });
    return true;
  };

  // First pass: assign each member to their chosen team
  const overflow: PartyMember[] = [];
  for (const m of party.members) {
    const preferred = m.team === 'B' ? seatsB : seatsA;
    if (!putInTeam(preferred, m)) {
      overflow.push(m);
    }
  }

  // Second pass: overflow into any open slot on the opposing team
  for (const m of overflow) {
    if (!putInTeam(seatsA, m)) {
      putInTeam(seatsB, m);
    }
  }

  // Trim guarantee for teamSize
  return {
    seatsA: seatsA.slice(0, teamSize),
    seatsB: seatsB.slice(0, teamSize)
  };
}

export async function launchPartyRoom(params: {
  party: PartyDoc;
  playerId: string;
  displayName: string;
  timeControlId?: string;
}): Promise<{
  roomCode: string;
  gameKind: PartyGameKind;
  gameType: string;
  launchId: string;
}> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('Sign in with Google first to start the match.');
  }
  if (params.party.leaderUid !== uid) {
    throw new Error('Only the party leader can start the match.');
  }

  const { seatsA, seatsB } = buildPresetSeatsFromParty(params.party);
  const fillBots = params.party.opponentMode === 'bots';
  const launchId = `lnch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  let roomCode = '';
  if (params.party.gameKind === 'chess') {
    const created = await createFirestoreChessRoom({
      playerId: params.playerId,
      playerName: params.displayName,
      preferredColor: 'w',
      timeControlId: params.timeControlId || 'none',
      teamMode: params.party.matchMode,
      fillBots,
      primaryBotId: params.party.botId || 'clara',
      presetWhiteSeats: seatsA,
      presetBlackSeats: seatsB
    });
    roomCode = created.code;
  } else {
    const created = await createFirestoreArcadeRoom({
      gameType: params.party.gameType as ArcadeGameType,
      playerId: params.playerId,
      playerName: params.displayName,
      preferredSeat: 'p1',
      teamMode: params.party.matchMode,
      fillBots,
      primaryBotId: params.party.botId || 'orbit-bot',
      presetTeam1Seats: seatsA,
      presetTeam2Seats: seatsB
    });
    roomCode = created.code;
  }

  const partyRef = doc(db, PARTIES_COLLECTION, params.party.code);
  await updateDoc(partyRef, {
    status: 'in_game' as PartyStatus,
    activeRoomCode: roomCode,
    activeGameKind: params.party.gameKind,
    activeGameType: params.party.gameType,
    activeLaunchId: launchId,
    updatedAt: serverTimestamp()
  });

  return {
    roomCode,
    gameKind: params.party.gameKind,
    gameType: params.party.gameType,
    launchId
  };
}

export async function returnPartyToLobby(partyCode: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  const cleanCode = sanitizePartyCode(partyCode);
  if (!uid || cleanCode.length < 4) return;
  const ref = doc(db, PARTIES_COLLECTION, cleanCode);
  try {
    await updateDoc(ref, {
      status: 'lobby' as PartyStatus,
      activeRoomCode: null,
      activeGameKind: null,
      activeGameType: null,
      activeLaunchId: null,
      updatedAt: serverTimestamp()
    });
  } catch {
    // Non-fatal
  }
}

export async function disbandParty(partyCode: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  const cleanCode = sanitizePartyCode(partyCode);
  if (!uid || cleanCode.length < 4) return;
  try {
    await deleteDoc(doc(db, PARTIES_COLLECTION, cleanCode));
  } catch {
    // Non-fatal
  }
}

export function subscribeMyParty(
  myUid: string,
  onUpdate: (party: PartyDoc | null) => void
): Unsubscribe {
  if (!auth.currentUser || auth.currentUser.uid !== myUid) {
    onUpdate(null);
    return () => {};
  }

  const q = query(
    collection(db, PARTIES_COLLECTION),
    where('memberUids', 'array-contains', myUid),
    limit(5)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(null);
        return;
      }
      const list = snapshot.docs.map(d => d.data() as PartyDoc);
      list.sort(
        (a, b) =>
          (timestampToMs(b.updatedAt) || timestampToMs(b.createdAt)) -
          (timestampToMs(a.updatedAt) || timestampToMs(a.createdAt))
      );
      onUpdate(list[0] || null);
    },
    () => {
      // Quietly recover on transient snapshot issues without showing errors
    }
  );
}

export function subscribeMyPartyInvites(
  myUid: string,
  onUpdate: (invites: PartyInvite[]) => void
): Unsubscribe {
  if (!auth.currentUser || auth.currentUser.uid !== myUid) {
    onUpdate([]);
    return () => {};
  }

  const q = query(
    collection(db, PARTY_INVITES_COLLECTION),
    where('participantUids', 'array-contains', myUid),
    limit(30)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const cutoffMs = Date.now() - 12 * 60 * 60 * 1000;
      const list = snapshot.docs
        .map(d => d.data() as PartyInvite)
        .filter(inv => {
          const ts = timestampToMs(inv.updatedAt) || timestampToMs(inv.createdAt);
          return !ts || ts >= cutoffMs;
        });
      list.sort(
        (a, b) =>
          (timestampToMs(b.updatedAt) || timestampToMs(b.createdAt)) -
          (timestampToMs(a.updatedAt) || timestampToMs(a.createdAt))
      );
      onUpdate(list);
    },
    () => {
      // Quietly handle snapshot errors without surfacing noise
    }
  );
}
