import type http from 'http';
import type express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import {
  applyArcadeAction,
  createInitialArcadeState,
  getArcadeBotById,
  isValidArcadeGameType,
  pickBotArcadeAction
} from '../src/utils/arcadeEngines.ts';
import type {
  ArcadeGameType,
  ArcadePlayer,
  ArcadeState
} from '../src/utils/arcadeEngines.ts';
import {
  areAllSeatsFilled,
  clearBotSeats,
  collectParticipantUids,
  createEmptySeats,
  createHumanSeat,
  fillOpenSeatsWithArcadeBots,
  getActiveArcadeSeatIndex,
  getTeamSize,
  normalizeTeamMode,
  summarizeTeamDisplayName
} from '../src/utils/teamModes.ts';
import type { TeamMode, TeamSeat } from '../src/utils/teamModes.ts';

interface WsHumanSlot {
  id: string;
  name: string;
  ws: WebSocket | null;
}

interface ArcadeRoom {
  code: string;
  gameType: ArcadeGameType;
  teamMode: TeamMode;
  state: ArcadeState;
  moves: string[];
  team1Seats: TeamSeat[];
  team2Seats: TeamSeat[];
  teamTurnCounts: { p1: number; p2: number };
  sockets: Map<string, WsHumanSlot>;
  spectators: Map<string, WebSocket>;
  resignedWinner: ArcadePlayer | null;
  rematchVotes: Set<string>;
  botTimer: ReturnType<typeof setTimeout> | null;
  createdAt: number;
  lastActivityAt: number;
}

const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRoomCode(existing: Map<string, ArcadeRoom>): string {
  for (let attempt = 0; attempt < 25; attempt++) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)];
    }
    if (!existing.has(code)) return code;
  }
  return `AR${Date.now().toString(36).slice(-4).toUpperCase()}`;
}

function sanitizeName(raw: unknown): string {
  const s = String(raw || '').trim().slice(0, 24);
  return s || 'Player';
}

function sanitizeRoomCode(raw: unknown): string {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
}

function isRoomGameOver(room: ArcadeRoom): boolean {
  return Boolean(room.resignedWinner) || room.state.winner !== null;
}

function findHumanSeat(
  room: ArcadeRoom,
  playerId: string
): { team: ArcadePlayer; index: number; seat: TeamSeat } | null {
  for (let i = 0; i < room.team1Seats.length; i++) {
    const s = room.team1Seats[i];
    if (s.kind === 'human' && (s.playerId === playerId || s.uid === playerId)) {
      return { team: 'p1', index: i, seat: s };
    }
  }
  for (let i = 0; i < room.team2Seats.length; i++) {
    const s = room.team2Seats[i];
    if (s.kind === 'human' && (s.playerId === playerId || s.uid === playerId)) {
      return { team: 'p2', index: i, seat: s };
    }
  }
  return null;
}

function getAllHumanIdsInRoom(room: ArcadeRoom): string[] {
  const ids = new Set<string>();
  for (const s of [...room.team1Seats, ...room.team2Seats]) {
    if (s.kind === 'human' && s.playerId) ids.add(s.playerId);
  }
  return Array.from(ids);
}

export function attachArcadeRoomServer(httpServer: http.Server, app: express.Express) {
  const rooms = new Map<string, ArcadeRoom>();
  const wsMeta = new WeakMap<WebSocket, { roomCode?: string; playerId?: string }>();

  const wss = new WebSocketServer({ noServer: true });

  setInterval(() => {
    const cutoff = Date.now() - 45 * 60 * 1000;
    for (const [code, room] of rooms.entries()) {
      const hasOpenHuman = Array.from(room.sockets.values()).some(
        s => s.ws?.readyState === WebSocket.OPEN
      );
      const hasOpenSpec = Array.from(room.spectators.values()).some(
        s => s.readyState === WebSocket.OPEN
      );
      if (!hasOpenHuman && !hasOpenSpec && room.lastActivityAt < cutoff) {
        if (room.botTimer) clearTimeout(room.botTimer);
        rooms.delete(code);
      }
    }
  }, 5 * 60 * 1000).unref();

  app.get('/api/arcade/room/:code', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const code = sanitizeRoomCode(req.params.code);
    const room = rooms.get(code);
    if (!room) {
      return res.json({ exists: false, code });
    }
    return res.json({
      exists: true,
      code: room.code,
      gameType: room.gameType,
      teamMode: room.teamMode,
      hasP1: room.team1Seats.some(s => s.kind !== 'open'),
      hasP2: room.team2Seats.some(s => s.kind !== 'open'),
      moveCount: room.moves.length
    });
  });

  const buildSyncPayload = (room: ArcadeRoom, recipientPlayerId?: string) => {
    const teamSize = getTeamSize(room.teamMode);
    const match = recipientPlayerId ? findHumanSeat(room, recipientPlayerId) : null;
    const mySeat: ArcadePlayer | 'spectator' = match ? match.team : 'spectator';
    const mySeatIndex = match ? match.index : null;
    const activeSeatIndex = getActiveArcadeSeatIndex(
      room.teamTurnCounts,
      room.state.turn,
      teamSize
    );
    const activeSeatList = room.state.turn === 'p1' ? room.team1Seats : room.team2Seats;
    const activeSeat = activeSeatList[activeSeatIndex] || null;
    const p1Filled = room.team1Seats.some(s => s.kind !== 'open');
    const p2Filled = room.team2Seats.some(s => s.kind !== 'open');
    const p1HasConnected = room.team1Seats.some(
      s => s.kind === 'bot' || (s.kind === 'human' && s.playerId && room.sockets.get(s.playerId)?.ws?.readyState === WebSocket.OPEN)
    );
    const p2HasConnected = room.team2Seats.some(
      s => s.kind === 'bot' || (s.kind === 'human' && s.playerId && room.sockets.get(s.playerId)?.ws?.readyState === WebSocket.OPEN)
    );

    return {
      type: 'room:sync',
      code: room.code,
      gameType: room.gameType,
      teamMode: room.teamMode,
      mySeat,
      mySeatIndex,
      state: room.state,
      moves: room.moves,
      resignedWinner: room.resignedWinner,
      rematchVotes: Array.from(room.rematchVotes),
      participantUids: collectParticipantUids(room.team1Seats, room.team2Seats),
      team1Seats: room.team1Seats,
      team2Seats: room.team2Seats,
      teamTurnCounts: room.teamTurnCounts,
      activeSeatIndex,
      activeSeat,
      botRunnerUid: null,
      players: {
        p1: p1Filled
          ? {
              name: summarizeTeamDisplayName(room.team1Seats, 'Team 1'),
              connected: p1HasConnected
            }
          : null,
        p2: p2Filled
          ? {
              name: summarizeTeamDisplayName(room.team2Seats, 'Team 2'),
              connected: p2HasConnected
            }
          : null
      }
    };
  };

  const sendJson = (ws: WebSocket | null | undefined, payload: unknown) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(payload));
      } catch {}
    }
  };

  const broadcastRoom = (room: ArcadeRoom) => {
    for (const [pId, slot] of room.sockets.entries()) {
      if (slot.ws) {
        sendJson(slot.ws, buildSyncPayload(room, pId));
      }
    }
    for (const [specId, ws] of room.spectators.entries()) {
      sendJson(ws, buildSyncPayload(room, specId));
    }
    scheduleBotTurnIfNeeded(room);
  };

  const scheduleBotTurnIfNeeded = (room: ArcadeRoom) => {
    if (room.botTimer) {
      clearTimeout(room.botTimer);
      room.botTimer = null;
    }
    if (isRoomGameOver(room) || !areAllSeatsFilled(room.team1Seats, room.team2Seats)) {
      return;
    }
    const teamSize = getTeamSize(room.teamMode);
    const activeIdx = getActiveArcadeSeatIndex(room.teamTurnCounts, room.state.turn, teamSize);
    const activeSeat = (room.state.turn === 'p1' ? room.team1Seats : room.team2Seats)[activeIdx];
    if (!activeSeat || activeSeat.kind !== 'bot') return;

    room.botTimer = setTimeout(() => {
      room.botTimer = null;
      if (isRoomGameOver(room) || !areAllSeatsFilled(room.team1Seats, room.team2Seats)) return;
      const idxNow = getActiveArcadeSeatIndex(room.teamTurnCounts, room.state.turn, teamSize);
      const seatNow = (room.state.turn === 'p1' ? room.team1Seats : room.team2Seats)[idxNow];
      if (!seatNow || seatNow.kind !== 'bot') return;

      const bot = getArcadeBotById(seatNow.botId);
      const action = pickBotArcadeAction(room.state, bot);
      if (!action) return;
      const prevTurn = room.state.turn;
      const res = applyArcadeAction(room.state, action);
      if (!res.valid) return;

      room.state = res.nextState;
      room.moves = [...room.moves, action];
      if (res.nextState.turn !== prevTurn) {
        room.teamTurnCounts[prevTurn] += 1;
      }
      room.lastActivityAt = Date.now();
      broadcastRoom(room);
    }, 340);
  };

  const detachFromCurrentRoom = (ws: WebSocket) => {
    const meta = wsMeta.get(ws);
    if (!meta?.roomCode) return;
    const room = rooms.get(meta.roomCode);
    if (!room) {
      wsMeta.delete(ws);
      return;
    }
    let changed = false;
    if (meta.playerId) {
      const slot = room.sockets.get(meta.playerId);
      if (slot && slot.ws === ws) {
        slot.ws = null;
        changed = true;
      }
      if (room.spectators.get(meta.playerId) === ws) {
        room.spectators.delete(meta.playerId);
        changed = true;
      }
    }
    wsMeta.delete(ws);
    if (changed) {
      broadcastRoom(room);
    }
  };

  httpServer.on('upgrade', (req, socket, head) => {
    const pathname = (req.url || '').split('?')[0];
    if (pathname === '/ws/arcade') {
      wss.handleUpgrade(req, socket, head, ws => {
        wss.emit('connection', ws, req);
      });
    }
  });

  wss.on('connection', ws => {
    wsMeta.set(ws, {});

    ws.on('message', raw => {
      let msg: any;
      try {
        msg = JSON.parse(String(raw));
      } catch {
        return;
      }
      if (!msg || typeof msg.type !== 'string') return;

      if (msg.type === 'ping') {
        sendJson(ws, { type: 'pong', ts: Date.now() });
        return;
      }

      const playerId = String(msg.playerId || '').trim().slice(0, 64);
      if (!playerId) {
        sendJson(ws, { type: 'room:error', message: 'Missing player identity.' });
        return;
      }

      if (msg.type === 'room:create') {
        detachFromCurrentRoom(ws);
        const gameType: ArcadeGameType = isValidArcadeGameType(msg.gameType)
          ? msg.gameType
          : 'connect4';
        const teamMode: TeamMode = normalizeTeamMode(msg.teamMode);
        const code = generateRoomCode(rooms);
        const playerName = sanitizeName(msg.playerName);
        const pref: ArcadePlayer =
          msg.preferredSeat === 'p2'
            ? 'p2'
            : msg.preferredSeat === 'random'
            ? Math.random() < 0.5
              ? 'p1'
              : 'p2'
            : 'p1';

        let team1Seats = createEmptySeats(teamMode);
        let team2Seats = createEmptySeats(teamMode);
        const creatorSeat = createHumanSeat({ uid: null, playerId, name: playerName });
        if (pref === 'p1') team1Seats[0] = creatorSeat;
        else team2Seats[0] = creatorSeat;

        if (msg.fillBots) {
          const filled = fillOpenSeatsWithArcadeBots(
            team1Seats,
            team2Seats,
            typeof msg.primaryBotId === 'string' ? msg.primaryBotId : 'orbit-bot'
          );
          team1Seats = filled.team1Seats;
          team2Seats = filled.team2Seats;
        }

        const sockets = new Map<string, WsHumanSlot>();
        sockets.set(playerId, { id: playerId, name: playerName, ws });

        const room: ArcadeRoom = {
          code,
          gameType,
          teamMode,
          state: createInitialArcadeState(gameType),
          moves: [],
          team1Seats,
          team2Seats,
          teamTurnCounts: { p1: 0, p2: 0 },
          sockets,
          spectators: new Map(),
          resignedWinner: null,
          rematchVotes: new Set(),
          botTimer: null,
          createdAt: Date.now(),
          lastActivityAt: Date.now()
        };
        rooms.set(code, room);
        wsMeta.set(ws, { roomCode: code, playerId });
        broadcastRoom(room);
        return;
      }

      if (msg.type === 'room:join') {
        const code = sanitizeRoomCode(msg.code);
        const room = rooms.get(code);
        if (!room) {
          sendJson(ws, {
            type: 'room:error',
            message: `Room "${code || '?'}" not found. Check the code or create a new room.`
          });
          return;
        }
        detachFromCurrentRoom(ws);
        const playerName = sanitizeName(msg.playerName);
        room.lastActivityAt = Date.now();

        const existing = findHumanSeat(room, playerId);
        if (existing) {
          existing.seat.name = playerName;
          room.sockets.set(playerId, { id: playerId, name: playerName, ws });
        } else {
          const t1Open = room.team1Seats.findIndex(s => s.kind === 'open');
          const t2Open = room.team2Seats.findIndex(s => s.kind === 'open');
          const t1Filled = room.team1Seats.filter(s => s.kind !== 'open').length;
          const t2Filled = room.team2Seats.filter(s => s.kind !== 'open').length;

          let chosenTeam: ArcadePlayer | null = null;
          let chosenIdx = -1;

          if (msg.preferredTeam === 'p1' && t1Open >= 0) {
            chosenTeam = 'p1';
            chosenIdx = t1Open;
          } else if (msg.preferredTeam === 'p2' && t2Open >= 0) {
            chosenTeam = 'p2';
            chosenIdx = t2Open;
          } else if (t1Open >= 0 && t2Open >= 0) {
            if (t2Filled <= t1Filled) {
              chosenTeam = 'p2';
              chosenIdx = t2Open;
            } else {
              chosenTeam = 'p1';
              chosenIdx = t1Open;
            }
          } else if (t1Open >= 0) {
            chosenTeam = 'p1';
            chosenIdx = t1Open;
          } else if (t2Open >= 0) {
            chosenTeam = 'p2';
            chosenIdx = t2Open;
          } else if (room.moves.length === 0) {
            const t2Bot = room.team2Seats.findIndex(s => s.kind === 'bot');
            const t1Bot = room.team1Seats.findIndex(s => s.kind === 'bot');
            if (t2Bot >= 0) {
              chosenTeam = 'p2';
              chosenIdx = t2Bot;
            } else if (t1Bot >= 0) {
              chosenTeam = 'p1';
              chosenIdx = t1Bot;
            }
          }

          if (chosenTeam && chosenIdx >= 0) {
            const seat = createHumanSeat({ uid: null, playerId, name: playerName });
            if (chosenTeam === 'p1') room.team1Seats[chosenIdx] = seat;
            else room.team2Seats[chosenIdx] = seat;
            room.sockets.set(playerId, { id: playerId, name: playerName, ws });
          } else {
            room.spectators.set(playerId, ws);
          }
        }

        wsMeta.set(ws, { roomCode: code, playerId });
        broadcastRoom(room);
        return;
      }

      if (msg.type === 'room:leave') {
        const meta = wsMeta.get(ws);
        const code = sanitizeRoomCode(msg.code || meta?.roomCode);
        const room = rooms.get(code);
        if (room) {
          const match = findHumanSeat(room, playerId);
          if (match && room.moves.length === 0) {
            const open = { kind: 'open' as const, uid: null, playerId: null, name: null, botId: null };
            if (match.team === 'p1') room.team1Seats[match.index] = open;
            else room.team2Seats[match.index] = open;
            room.sockets.delete(playerId);
          } else {
            const slot = room.sockets.get(playerId);
            if (slot) slot.ws = null;
          }
          room.spectators.delete(playerId);
          broadcastRoom(room);
        }
        wsMeta.set(ws, {});
        return;
      }

      const code = sanitizeRoomCode(msg.code || wsMeta.get(ws)?.roomCode);
      const room = rooms.get(code);
      if (!room) {
        sendJson(ws, { type: 'room:error', message: 'Room session expired or missing.' });
        return;
      }

      if (msg.type === 'room:switch_team') {
        if (isRoomGameOver(room) || room.moves.length > 0) return;
        const targetTeam: ArcadePlayer = msg.targetTeam === 'p2' ? 'p2' : 'p1';
        const current = findHumanSeat(room, playerId);
        const targetList = targetTeam === 'p1' ? room.team1Seats : room.team2Seats;
        const openIdx = targetList.findIndex(s => s.kind === 'open' || s.kind === 'bot');
        if (openIdx < 0) return;
        if (current && current.team === targetTeam) return;

        const playerName = sanitizeName(msg.playerName || current?.seat.name);
        if (current) {
          const open = { kind: 'open' as const, uid: null, playerId: null, name: null, botId: null };
          if (current.team === 'p1') room.team1Seats[current.index] = open;
          else room.team2Seats[current.index] = open;
        }
        targetList[openIdx] = createHumanSeat({ uid: null, playerId, name: playerName });
        room.sockets.set(playerId, { id: playerId, name: playerName, ws });
        room.spectators.delete(playerId);
        room.lastActivityAt = Date.now();
        broadcastRoom(room);
        return;
      }

      if (msg.type === 'room:fill_bots') {
        if (isRoomGameOver(room)) return;
        const match = findHumanSeat(room, playerId);
        if (!match) return;
        const filled = fillOpenSeatsWithArcadeBots(
          room.team1Seats,
          room.team2Seats,
          typeof msg.primaryBotId === 'string' ? msg.primaryBotId : 'orbit-bot'
        );
        room.team1Seats = filled.team1Seats;
        room.team2Seats = filled.team2Seats;
        room.lastActivityAt = Date.now();
        broadcastRoom(room);
        return;
      }

      if (msg.type === 'room:clear_bots') {
        if (isRoomGameOver(room) || room.moves.length > 0) return;
        const match = findHumanSeat(room, playerId);
        if (!match) return;
        room.team1Seats = clearBotSeats(room.team1Seats);
        room.team2Seats = clearBotSeats(room.team2Seats);
        room.lastActivityAt = Date.now();
        broadcastRoom(room);
        return;
      }

      if (msg.type === 'room:move') {
        room.lastActivityAt = Date.now();

        if (typeof msg.moveIndex === 'number' && msg.moveIndex !== room.moves.length) {
          sendJson(ws, buildSyncPayload(room, playerId));
          return;
        }
        if (isRoomGameOver(room)) {
          sendJson(ws, buildSyncPayload(room, playerId));
          return;
        }

        const teamSize = getTeamSize(room.teamMode);
        const activeIdx = getActiveArcadeSeatIndex(room.teamTurnCounts, room.state.turn, teamSize);
        const activeSeat = (room.state.turn === 'p1' ? room.team1Seats : room.team2Seats)[activeIdx];
        if (!activeSeat || activeSeat.kind !== 'human' || activeSeat.playerId !== playerId) {
          sendJson(ws, { type: 'room:error', message: 'Not your turn.' });
          sendJson(ws, buildSyncPayload(room, playerId));
          return;
        }

        const action = String(msg.action || '').trim().slice(0, 800);
        const prevTurn = room.state.turn;
        const res = applyArcadeAction(room.state, action);
        if (!res.valid) {
          sendJson(ws, { type: 'room:error', message: 'Illegal move rejected by server.' });
          sendJson(ws, buildSyncPayload(room, playerId));
          return;
        }

        room.state = res.nextState;
        room.moves = [...room.moves, action];
        if (res.nextState.turn !== prevTurn) {
          room.teamTurnCounts[prevTurn] += 1;
        }
        room.rematchVotes.clear();
        broadcastRoom(room);
        return;
      }

      if (msg.type === 'room:resign') {
        if (isRoomGameOver(room)) return;
        const match = findHumanSeat(room, playerId);
        if (!match) return;
        room.lastActivityAt = Date.now();
        room.resignedWinner = match.team === 'p1' ? 'p2' : 'p1';
        broadcastRoom(room);
        return;
      }

      if (msg.type === 'room:rematch') {
        const match = findHumanSeat(room, playerId);
        if (!match) return;
        room.lastActivityAt = Date.now();
        const voteToken =
          room.teamMode === '1v1' ? match.team : `${match.team}:${match.index}`;
        room.rematchVotes.add(voteToken);

        const humanIds = getAllHumanIdsInRoom(room);
        const requiredVotes = Math.max(1, humanIds.length);
        if (room.rematchVotes.size >= requiredVotes) {
          const oldTeam1 = room.team1Seats;
          room.team1Seats = room.team2Seats;
          room.team2Seats = oldTeam1;
          room.state = createInitialArcadeState(room.gameType);
          room.moves = [];
          room.teamTurnCounts = { p1: 0, p2: 0 };
          room.resignedWinner = null;
          room.rematchVotes.clear();
        }
        broadcastRoom(room);
      }
    });

    ws.on('close', () => {
      detachFromCurrentRoom(ws);
    });
  });
}
