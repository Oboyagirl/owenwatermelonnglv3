import type http from 'http';
import type express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import {
  applyMove,
  createInitialState,
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

interface RoomSeat {
  id: string;
  name: string;
  elo: number;
  ws: WebSocket | null;
}

interface ChessRoom {
  code: string;
  state: ChessState;
  history: MoveRecord[];
  white: RoomSeat | null;
  black: RoomSeat | null;
  spectators: Map<string, WebSocket>;
  resignedWinner: PieceColor | null;
  timeoutWinner: PieceColor | 'draw' | null;
  timeControlId: string;
  baseMs: number;
  incMs: number;
  whiteTimeMs: number;
  blackTimeMs: number;
  clockLastTickAt: number | null;
  rematchVotes: Set<PieceColor>;
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

  // Clean up idle rooms after 45 minutes of inactivity
  setInterval(() => {
    const cutoff = Date.now() - 45 * 60 * 1000;
    for (const [code, room] of rooms.entries()) {
      const hasOpenSocket =
        room.white?.ws?.readyState === WebSocket.OPEN ||
        room.black?.ws?.readyState === WebSocket.OPEN ||
        Array.from(room.spectators.values()).some(s => s.readyState === WebSocket.OPEN);
      if (!hasOpenSocket && room.lastActivityAt < cutoff) {
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
      timeControlId: room.timeControlId,
      hasWhite: Boolean(room.white),
      hasBlack: Boolean(room.black),
      moveCount: room.history.length
    });
  });

  const buildSyncPayload = (room: ChessRoom, recipientPlayerId?: string) => {
    let myColor: PieceColor | 'spectator' = 'spectator';
    if (recipientPlayerId) {
      if (room.white?.id === recipientPlayerId) myColor = 'w';
      else if (room.black?.id === recipientPlayerId) myColor = 'b';
    }
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

    return {
      type: 'room:sync',
      code: room.code,
      myColor,
      state: room.state,
      history: room.history,
      resignedWinner: room.resignedWinner,
      timeoutWinner: room.timeoutWinner,
      rematchVotes: Array.from(room.rematchVotes),
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
        w: room.white
          ? {
              name: room.white.name,
              elo: room.white.elo,
              connected: room.white.ws?.readyState === WebSocket.OPEN
            }
          : null,
        b: room.black
          ? {
              name: room.black.name,
              elo: room.black.elo,
              connected: room.black.ws?.readyState === WebSocket.OPEN
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
    if (room.white?.ws) {
      sendJson(room.white.ws, buildSyncPayload(room, room.white.id));
    }
    if (room.black?.ws) {
      sendJson(room.black.ws, buildSyncPayload(room, room.black.id));
    }
    for (const [specId, ws] of room.spectators.entries()) {
      sendJson(ws, buildSyncPayload(room, specId));
    }
  };

  // Authoritative 250ms timeout watcher for active timed rooms
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
    if (room.white?.ws === ws) {
      room.white.ws = null;
      changed = true;
    }
    if (room.black?.ws === ws) {
      room.black.ws = null;
      changed = true;
    }
    if (meta.playerId && room.spectators.get(meta.playerId) === ws) {
      room.spectators.delete(meta.playerId);
      changed = true;
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
        const pref =
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
        const seat: RoomSeat = { id: playerId, name: playerName, elo: 1200, ws };
        const room: ChessRoom = {
          code,
          state: createInitialState(),
          history: [],
          white: pref === 'w' ? seat : null,
          black: pref === 'b' ? seat : null,
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

        if (room.white?.id === playerId) {
          room.white.ws = ws;
          room.white.name = playerName;
        } else if (room.black?.id === playerId) {
          room.black.ws = ws;
          room.black.name = playerName;
        } else if (!room.white) {
          room.white = { id: playerId, name: playerName, elo: 1200, ws };
        } else if (!room.black) {
          room.black = { id: playerId, name: playerName, elo: 1200, ws };
        } else {
          room.spectators.set(playerId, ws);
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
          if (room.white?.id === playerId && room.history.length === 0) room.white = null;
          else if (room.white?.id === playerId) room.white.ws = null;
          if (room.black?.id === playerId && room.history.length === 0) room.black = null;
          else if (room.black?.id === playerId) room.black.ws = null;
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

      if (msg.type === 'room:move') {
        const now = Date.now();
        room.lastActivityAt = now;

        // Deduct active player's elapsed clock first; if flagged, reject move & broadcast timeout
        if (syncRoomClockNow(room, now)) {
          broadcastRoom(room);
          return;
        }

        // Idempotent guard if client resends move from stale moveIndex
        if (typeof msg.moveIndex === 'number' && msg.moveIndex !== room.history.length) {
          sendJson(ws, buildSyncPayload(room, playerId));
          return;
        }
        if (isRoomGameOver(room)) {
          sendJson(ws, buildSyncPayload(room, playerId));
          return;
        }
        const activeSeat = room.state.turn === 'w' ? room.white : room.black;
        if (!activeSeat || activeSeat.id !== playerId) {
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
          // Award increment for completed moves once the clock is active (after move 1 or when running)
          if (wasClockRunning && room.incMs > 0) {
            if (moverColor === 'w') room.whiteTimeMs += room.incMs;
            else room.blackTimeMs += room.incMs;
          }
          if (isRoomGameOver(room)) {
            room.clockLastTickAt = null;
          } else {
            room.clockLastTickAt = now;
          }
        }

        broadcastRoom(room);
        return;
      }

      if (msg.type === 'room:resign') {
        if (isRoomGameOver(room)) return;
        const resignColor: PieceColor | null =
          room.white?.id === playerId ? 'w' : room.black?.id === playerId ? 'b' : null;
        if (!resignColor) return;
        room.lastActivityAt = Date.now();
        room.resignedWinner = resignColor === 'w' ? 'b' : 'w';
        room.clockLastTickAt = null;
        broadcastRoom(room);
        return;
      }

      if (msg.type === 'room:rematch') {
        const myColor: PieceColor | null =
          room.white?.id === playerId ? 'w' : room.black?.id === playerId ? 'b' : null;
        if (!myColor) return;
        room.lastActivityAt = Date.now();
        room.rematchVotes.add(myColor);

        const bothPresent = Boolean(room.white && room.black);
        if ((bothPresent && room.rematchVotes.size >= 2) || (!bothPresent && room.rematchVotes.size >= 1)) {
          // Swap sides cleanly for rematch
          const oldW = room.white;
          const oldB = room.black;
          room.white = oldB;
          room.black = oldW;
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
