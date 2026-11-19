import type http from 'http';
import type express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import {
  applyMove,
  chooseBotMove,
  createInitialState,
  getBotById,
  getLegalMoves,
  getTimeControlById,
  hasOnlyInsufficientMaterialForSide
} from '../src/utils/chessEngine.ts';
import type {
  ChessMove,
  ChessState,
  MoveRecord,
  PieceColor,
  PromotionPieceType
} from '../src/utils/chessEngine.ts';
import {
  areAllSeatsFilled,
  clearBotSeats,
  collectParticipantUids,
  createEmptySeats,
  createHumanSeat,
  fillOpenSeatsWithChessBots,
  getActiveChessSeatIndex,
  getTeamSize,
  normalizeTeamMode,
  summarizeTeamDisplayName
} from '../src/utils/teamModes.ts';
import type { TeamMode, TeamSeat } from '../src/utils/teamModes.ts';

interface WsChessSlot {
  id: string;
  name: string;
  elo: number;
  ws: WebSocket | null;
}

interface ChessRoom {
  code: string;
  teamMode: TeamMode;
  state: ChessState;
  history: MoveRecord[];
  whiteSeats: TeamSeat[];
  blackSeats: TeamSeat[];
  sockets: Map<string, WsChessSlot>;
  spectators: Map<string, WebSocket>;
  resignedWinner: PieceColor | null;
  timeoutWinner: PieceColor | 'draw' | null;
  timeControlId: string;
  baseMs: number;
  incMs: number;
  whiteTimeMs: number;
  blackTimeMs: number;
  clockLastTickAt: number | null;
  rematchVotes: Set<string>;
  botTimer: ReturnType<typeof setTimeout> | null;
  createdAt: number;
  lastActivityAt: number;
}

const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRoomCode(existing: Map<string, ChessRoom>): string {
  for (let attempt = 0; attempt < 25; attempt++) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)];
    }
    if (!existing.has(code)) return code;
  }
  return `CW${Date.now().toString(36).slice(-4).toUpperCase()}`;
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

function isRoomGameOver(room: ChessRoom): boolean {
  return (
    Boolean(room.resignedWinner) ||
    Boolean(room.timeoutWinner) ||
    room.state.status === 'checkmate' ||
    room.state.status === 'stalemate' ||
    room.state.status === 'draw_repetition' ||
    room.state.status === 'draw_fifty_move' ||
    room.state.status === 'draw_insufficient_material'
  );
}

function findChessHumanSeat(
  room: ChessRoom,
  playerId: string
): { color: PieceColor; index: number; seat: TeamSeat } | null {
  for (let i = 0; i < room.whiteSeats.length; i++) {
    const s = room.whiteSeats[i];
    if (s.kind === 'human' && (s.playerId === playerId || s.uid === playerId)) {
      return { color: 'w', index: i, seat: s };
    }
  }
  for (let i = 0; i < room.blackSeats.length; i++) {
    const s = room.blackSeats[i];
    if (s.kind === 'human' && (s.playerId === playerId || s.uid === playerId)) {
      return { color: 'b', index: i, seat: s };
    }
  }
  return null;
}

function getAllChessHumanIds(room: ChessRoom): string[] {
  const ids = new Set<string>();
  for (const s of [...room.whiteSeats, ...room.blackSeats]) {
    if (s.kind === 'human' && s.playerId) ids.add(s.playerId);
  }
  return Array.from(ids);
}

function syncRoomClockNow(room: ChessRoom, now: number): boolean {
  if (
    room.baseMs <= 0 ||
    isRoomGameOver(room) ||
    room.history.length === 0 ||
    room.clockLastTickAt === null
  ) {
    return false;
  }

  const elapsed = Math.max(0, now - room.clockLastTickAt);
  room.clockLastTickAt = now;

  if (room.state.turn === 'w') {
    room.whiteTimeMs = Math.max(0, room.whiteTimeMs - elapsed);
    if (room.whiteTimeMs <= 0) {
      room.whiteTimeMs = 0;
      room.clockLastTickAt = null;
      room.timeoutWinner = hasOnlyInsufficientMaterialForSide(room.state.board, 'b')
        ? 'draw'
        : 'b';
      return true;
    }
  } else {
    room.blackTimeMs = Math.max(0, room.blackTimeMs - elapsed);
    if (room.blackTimeMs <= 0) {
      room.blackTimeMs = 0;
      room.clockLastTickAt = null;
      room.timeoutWinner = hasOnlyInsufficientMaterialForSide(room.state.board, 'w')
        ? 'draw'
        : 'w';
      return true;
    }
  }

  return false;
}

export function attachChessRoomServer(httpServer: http.Server, app: express.Express) {
  const rooms = new Map<string, ChessRoom>();
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

  app.get('/api/chess/room/:code', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const code = sanitizeRoomCode(req.params.code);
    const room = rooms.get(code);
    if (!room) {
      return res.json({ exists: false, code });
    }
    return res.json({
      exists: true,
      code: room.code,
      teamMode: room.teamMode,
      timeControlId: room.timeControlId,
      hasWhite: room.whiteSeats.some(s => s.kind !== 'open'),
      hasBlack: room.blackSeats.some(s => s.kind !== 'open'),
      moveCount: room.history.length
    });
  });

  const buildSyncPayload = (room: ChessRoom, recipientPlayerId?: string) => {
    const teamSize = getTeamSize(room.teamMode);
    const match = recipientPlayerId ? findChessHumanSeat(room, recipientPlayerId) : null;
    const myColor: PieceColor | 'spectator' = match ? match.color : 'spectator';
    const mySeatIndex = match ? match.index : null;
    const activeSeatIndex = getActiveChessSeatIndex(room.history.length, room.state.turn, teamSize);
    const activeSeat =
      (room.state.turn === 'w' ? room.whiteSeats : room.blackSeats)[activeSeatIndex] || null;

    const now = Date.now();
    let whiteTimeMs = room.whiteTimeMs;
    let blackTimeMs = room.blackTimeMs;
    const isRunning =
      room.baseMs > 0 &&
      !isRoomGameOver(room) &&
      room.history.length >= 1 &&
      room.clockLastTickAt !== null;

    if (isRunning && room.clockLastTickAt !== null) {
      const elapsed = Math.max(0, now - room.clockLastTickAt);
      if (room.state.turn === 'w') {
        whiteTimeMs = Math.max(0, whiteTimeMs - elapsed);
      } else {
        blackTimeMs = Math.max(0, blackTimeMs - elapsed);
      }
    }

    const wFilled = room.whiteSeats.some(s => s.kind !== 'open');
    const bFilled = room.blackSeats.some(s => s.kind !== 'open');
    const wConnected = room.whiteSeats.some(
      s => s.kind === 'bot' || (s.kind === 'human' && s.playerId && room.sockets.get(s.playerId)?.ws?.readyState === WebSocket.OPEN)
    );
    const bConnected = room.blackSeats.some(
      s => s.kind === 'bot' || (s.kind === 'human' && s.playerId && room.sockets.get(s.playerId)?.ws?.readyState === WebSocket.OPEN)
    );

    return {
      type: 'room:sync',
      code: room.code,
      teamMode: room.teamMode,
      myColor,
      mySeatIndex,
      state: room.state,
      history: room.history,
      resignedWinner: room.resignedWinner,
      timeoutWinner: room.timeoutWinner,
      rematchVotes: Array.from(room.rematchVotes),
      participantUids: collectParticipantUids(room.whiteSeats, room.blackSeats),
      whiteSeats: room.whiteSeats,
      blackSeats: room.blackSeats,
      activeSeatIndex,
      activeSeat,
      botRunnerUid: null,
      clock: {
        timeControlId: room.timeControlId,
        baseMs: room.baseMs,
        incMs: room.incMs,
        whiteTimeMs,
        blackTimeMs,
        activeColor: isRunning ? room.state.turn : null,
        serverNow: now,
        timeoutWinner: room.timeoutWinner
      },
      players: {
        w: wFilled
          ? {
              name: summarizeTeamDisplayName(room.whiteSeats, 'White'),
              elo: 1200,
              connected: wConnected
            }
          : null,
        b: bFilled
          ? {
              name: summarizeTeamDisplayName(room.blackSeats, 'Black'),
              elo: 1200,
              connected: bConnected
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

  const broadcastRoom = (room: ChessRoom) => {
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

  const scheduleBotTurnIfNeeded = (room: ChessRoom) => {
    if (room.botTimer) {
      clearTimeout(room.botTimer);
      room.botTimer = null;
    }
    if (isRoomGameOver(room) || !areAllSeatsFilled(room.whiteSeats, room.blackSeats)) {
      return;
    }
    const teamSize = getTeamSize(room.teamMode);
    const activeIdx = getActiveChessSeatIndex(room.history.length, room.state.turn, teamSize);
    const activeSeat = (room.state.turn === 'w' ? room.whiteSeats : room.blackSeats)[activeIdx];
    if (!activeSeat || activeSeat.kind !== 'bot') return;

    room.botTimer = setTimeout(() => {
      room.botTimer = null;
      const now = Date.now();
      if (syncRoomClockNow(room, now)) {
        broadcastRoom(room);
        return;
      }
      if (isRoomGameOver(room) || !areAllSeatsFilled(room.whiteSeats, room.blackSeats)) return;
      const idxNow = getActiveChessSeatIndex(room.history.length, room.state.turn, teamSize);
      const seatNow = (room.state.turn === 'w' ? room.whiteSeats : room.blackSeats)[idxNow];
      if (!seatNow || seatNow.kind !== 'bot') return;

      const bot = getBotById(seatNow.botId || 'pixel');
      const remainingMs =
        room.baseMs > 0
          ? room.state.turn === 'w'
            ? room.whiteTimeMs
            : room.blackTimeMs
          : undefined;
      const decision = chooseBotMove(room.state, bot, room.history, remainingMs);
      if (!decision.move) return;

      const moverColor = room.state.turn;
      const wasClockRunning = room.history.length >= 1 && room.clockLastTickAt !== null;
      const { nextState, record } = applyMove(room.state, decision.move);
      room.state = nextState;
      room.history = [...room.history, record];
      room.rematchVotes.clear();
      room.lastActivityAt = now;

      if (room.baseMs > 0) {
        if (wasClockRunning && room.incMs > 0) {
          if (moverColor === 'w') room.whiteTimeMs += room.incMs;
          else room.blackTimeMs += room.incMs;
        }
        room.clockLastTickAt = isRoomGameOver(room) ? null : now;
      }

      broadcastRoom(room);
    }, 360);
  };

  setInterval(() => {
    const now = Date.now();
    for (const room of rooms.values()) {
      if (room.baseMs > 0 && room.clockLastTickAt !== null && !isRoomGameOver(room)) {
        const elapsed = now - room.clockLastTickAt;
        const activeMs = room.state.turn === 'w' ? room.whiteTimeMs : room.blackTimeMs;
        if (elapsed >= activeMs) {
          if (syncRoomClockNow(room, now)) {
            broadcastRoom(room);
          }
        }
      }
    }
  }, 250).unref();

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
    if (pathname === '/ws/chess') {
      wss.handleUpgrade(req, socket, head, ws => {
        wss.emit('connection', ws, req);
      });
    } else if (pathname !== '/ws/arcade') {
      socket.destroy();
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
        const code = generateRoomCode(rooms);
        const playerName = sanitizeName(msg.playerName);
        const teamMode: TeamMode = normalizeTeamMode(msg.teamMode);
        const pref: PieceColor =
          msg.preferredColor === 'b'
            ? 'b'
            : msg.preferredColor === 'random'
            ? Math.random() < 0.5
              ? 'w'
              : 'b'
            : 'w';
        const tc = getTimeControlById(
          typeof msg.timeControlId === 'string' ? msg.timeControlId : 'none'
        );

        let whiteSeats = createEmptySeats(teamMode);
        let blackSeats = createEmptySeats(teamMode);
        const creatorSeat = createHumanSeat({ uid: null, playerId, name: playerName });
        if (pref === 'w') whiteSeats[0] = creatorSeat;
        else blackSeats[0] = creatorSeat;

        if (msg.fillBots) {
          const filled = fillOpenSeatsWithChessBots(
            whiteSeats,
            blackSeats,
            typeof msg.primaryBotId === 'string' ? msg.primaryBotId : 'pixel'
          );
          whiteSeats = filled.whiteSeats;
          blackSeats = filled.blackSeats;
        }

        const sockets = new Map<string, WsChessSlot>();
        sockets.set(playerId, { id: playerId, name: playerName, elo: 1200, ws });

        const room: ChessRoom = {
          code,
          teamMode,
          state: createInitialState(),
          history: [],
          whiteSeats,
          blackSeats,
          sockets,
          spectators: new Map(),
          resignedWinner: null,
          timeoutWinner: null,
          timeControlId: tc.id,
          baseMs: tc.baseMs,
          incMs: tc.incMs,
          whiteTimeMs: tc.baseMs,
          blackTimeMs: tc.baseMs,
          clockLastTickAt: null,
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

        const existing = findChessHumanSeat(room, playerId);
        if (existing) {
          existing.seat.name = playerName;
          room.sockets.set(playerId, { id: playerId, name: playerName, elo: 1200, ws });
        } else {
          const wOpen = room.whiteSeats.findIndex(s => s.kind === 'open');
          const bOpen = room.blackSeats.findIndex(s => s.kind === 'open');
          const wFilled = room.whiteSeats.filter(s => s.kind !== 'open').length;
          const bFilled = room.blackSeats.filter(s => s.kind !== 'open').length;

          let chosenColor: PieceColor | null = null;
          let chosenIdx = -1;

          if (msg.preferredTeam === 'w' && wOpen >= 0) {
            chosenColor = 'w';
            chosenIdx = wOpen;
          } else if (msg.preferredTeam === 'b' && bOpen >= 0) {
            chosenColor = 'b';
            chosenIdx = bOpen;
          } else if (wOpen >= 0 && bOpen >= 0) {
            if (bFilled <= wFilled) {
              chosenColor = 'b';
              chosenIdx = bOpen;
            } else {
              chosenColor = 'w';
              chosenIdx = wOpen;
            }
          } else if (wOpen >= 0) {
            chosenColor = 'w';
            chosenIdx = wOpen;
          } else if (bOpen >= 0) {
            chosenColor = 'b';
            chosenIdx = bOpen;
          } else if (room.history.length === 0) {
            const bBot = room.blackSeats.findIndex(s => s.kind === 'bot');
            const wBot = room.whiteSeats.findIndex(s => s.kind === 'bot');
            if (bBot >= 0) {
              chosenColor = 'b';
              chosenIdx = bBot;
            } else if (wBot >= 0) {
              chosenColor = 'w';
              chosenIdx = wBot;
            }
          }

          if (chosenColor && chosenIdx >= 0) {
            const seat = createHumanSeat({ uid: null, playerId, name: playerName });
            if (chosenColor === 'w') room.whiteSeats[chosenIdx] = seat;
            else room.blackSeats[chosenIdx] = seat;
            room.sockets.set(playerId, { id: playerId, name: playerName, elo: 1200, ws });
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
          const match = findChessHumanSeat(room, playerId);
          if (match && room.history.length === 0) {
            const open = { kind: 'open' as const, uid: null, playerId: null, name: null, botId: null };
            if (match.color === 'w') room.whiteSeats[match.index] = open;
            else room.blackSeats[match.index] = open;
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
        if (isRoomGameOver(room) || room.history.length > 0) return;
        const targetColor: PieceColor = msg.targetColor === 'b' ? 'b' : 'w';
        const current = findChessHumanSeat(room, playerId);
        const targetList = targetColor === 'w' ? room.whiteSeats : room.blackSeats;
        const openIdx = targetList.findIndex(s => s.kind === 'open' || s.kind === 'bot');
        if (openIdx < 0) return;
        if (current && current.color === targetColor) return;

        const playerName = sanitizeName(msg.playerName || current?.seat.name);
        if (current) {
          const open = { kind: 'open' as const, uid: null, playerId: null, name: null, botId: null };
          if (current.color === 'w') room.whiteSeats[current.index] = open;
          else room.blackSeats[current.index] = open;
        }
        targetList[openIdx] = createHumanSeat({ uid: null, playerId, name: playerName });
        room.sockets.set(playerId, { id: playerId, name: playerName, elo: 1200, ws });
        room.spectators.delete(playerId);
        room.lastActivityAt = Date.now();
        broadcastRoom(room);
        return;
      }

      if (msg.type === 'room:fill_bots') {
        if (isRoomGameOver(room)) return;
        const match = findChessHumanSeat(room, playerId);
        if (!match) return;
        const filled = fillOpenSeatsWithChessBots(
          room.whiteSeats,
          room.blackSeats,
          typeof msg.primaryBotId === 'string' ? msg.primaryBotId : 'pixel'
        );
        room.whiteSeats = filled.whiteSeats;
        room.blackSeats = filled.blackSeats;
        room.lastActivityAt = Date.now();
        broadcastRoom(room);
        return;
      }

      if (msg.type === 'room:clear_bots') {
        if (isRoomGameOver(room) || room.history.length > 0) return;
        const match = findChessHumanSeat(room, playerId);
        if (!match) return;
        room.whiteSeats = clearBotSeats(room.whiteSeats);
        room.blackSeats = clearBotSeats(room.blackSeats);
        room.lastActivityAt = Date.now();
        broadcastRoom(room);
        return;
      }

      if (msg.type === 'room:move') {
        const now = Date.now();
        room.lastActivityAt = now;

        if (syncRoomClockNow(room, now)) {
          broadcastRoom(room);
          return;
        }

        if (typeof msg.moveIndex === 'number' && msg.moveIndex !== room.history.length) {
          sendJson(ws, buildSyncPayload(room, playerId));
          return;
        }
        if (isRoomGameOver(room)) {
          sendJson(ws, buildSyncPayload(room, playerId));
          return;
        }

        const teamSize = getTeamSize(room.teamMode);
        const activeIdx = getActiveChessSeatIndex(room.history.length, room.state.turn, teamSize);
        const activeSeat = (room.state.turn === 'w' ? room.whiteSeats : room.blackSeats)[activeIdx];
        if (!activeSeat || activeSeat.kind !== 'human' || activeSeat.playerId !== playerId) {
          sendJson(ws, { type: 'room:error', message: 'Not your turn.' });
          sendJson(ws, buildSyncPayload(room, playerId));
          return;
        }

        const reqMove = msg.move as Partial<ChessMove> | undefined;
        if (!reqMove?.from || !reqMove?.to) {
          sendJson(ws, buildSyncPayload(room, playerId));
          return;
        }

        const legal = getLegalMoves(room.state).find(
          m =>
            m.from.r === reqMove.from!.r &&
            m.from.c === reqMove.from!.c &&
            m.to.r === reqMove.to!.r &&
            m.to.c === reqMove.to!.c &&
            (m.promotion ? m.promotion === (reqMove.promotion as PromotionPieceType) : true)
        );
        if (!legal) {
          sendJson(ws, { type: 'room:error', message: 'Illegal move rejected by server.' });
          sendJson(ws, buildSyncPayload(room, playerId));
          return;
        }

        const moverColor = room.state.turn;
        const wasClockRunning = room.history.length >= 1 && room.clockLastTickAt !== null;

        const { nextState, record } = applyMove(room.state, legal);
        room.state = nextState;
        room.history = [...room.history, record];
        room.rematchVotes.clear();

        if (room.baseMs > 0) {
          if (wasClockRunning && room.incMs > 0) {
            if (moverColor === 'w') room.whiteTimeMs += room.incMs;
            else room.blackTimeMs += room.incMs;
          }
          room.clockLastTickAt = isRoomGameOver(room) ? null : now;
        }

        broadcastRoom(room);
        return;
      }

      if (msg.type === 'room:resign') {
        if (isRoomGameOver(room)) return;
        const match = findChessHumanSeat(room, playerId);
        if (!match) return;
        room.lastActivityAt = Date.now();
        room.resignedWinner = match.color === 'w' ? 'b' : 'w';
        room.clockLastTickAt = null;
        broadcastRoom(room);
        return;
      }

      if (msg.type === 'room:rematch') {
        const match = findChessHumanSeat(room, playerId);
        if (!match) return;
        room.lastActivityAt = Date.now();
        const voteToken =
          room.teamMode === '1v1' ? match.color : `${match.color}:${match.index}`;
        room.rematchVotes.add(voteToken);

        const humanIds = getAllChessHumanIds(room);
        const requiredVotes = Math.max(1, humanIds.length);
        if (room.rematchVotes.size >= requiredVotes) {
          const oldW = room.whiteSeats;
          room.whiteSeats = room.blackSeats;
          room.blackSeats = oldW;
          room.state = createInitialState();
          room.history = [];
          room.resignedWinner = null;
          room.timeoutWinner = null;
          room.whiteTimeMs = room.baseMs;
          room.blackTimeMs = room.baseMs;
          room.clockLastTickAt = null;
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
