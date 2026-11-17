import type http from 'http';
import type express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import {
  applyArcadeAction,
  createInitialArcadeState,
  isValidArcadeGameType
} from '../src/utils/arcadeEngines.ts';
import type {
  ArcadeGameType,
  ArcadePlayer,
  ArcadeState
} from '../src/utils/arcadeEngines.ts';

interface ArcadeSeat {
  id: string;
  name: string;
  ws: WebSocket | null;
}

interface ArcadeRoom {
  code: string;
  gameType: ArcadeGameType;
  state: ArcadeState;
  moves: string[];
  p1: ArcadeSeat | null;
  p2: ArcadeSeat | null;
  spectators: Map<string, WebSocket>;
  resignedWinner: ArcadePlayer | null;
  rematchVotes: Set<ArcadePlayer>;
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

export function attachArcadeRoomServer(httpServer: http.Server, app: express.Express) {
  const rooms = new Map<string, ArcadeRoom>();
  const wsMeta = new WeakMap<WebSocket, { roomCode?: string; playerId?: string }>();

  const wss = new WebSocketServer({ noServer: true });

  // Clean up idle rooms after 45 minutes of inactivity
  setInterval(() => {
    const cutoff = Date.now() - 45 * 60 * 1000;
    for (const [code, room] of rooms.entries()) {
      const hasOpenSocket =
        room.p1?.ws?.readyState === WebSocket.OPEN ||
        room.p2?.ws?.readyState === WebSocket.OPEN ||
        Array.from(room.spectators.values()).some(s => s.readyState === WebSocket.OPEN);
      if (!hasOpenSocket && room.lastActivityAt < cutoff) {
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
      hasP1: Boolean(room.p1),
      hasP2: Boolean(room.p2),
      moveCount: room.moves.length
    });
  });

  const buildSyncPayload = (room: ArcadeRoom, recipientPlayerId?: string) => {
    let mySeat: ArcadePlayer | 'spectator' = 'spectator';
    if (recipientPlayerId) {
      if (room.p1?.id === recipientPlayerId) mySeat = 'p1';
      else if (room.p2?.id === recipientPlayerId) mySeat = 'p2';
    }

    return {
      type: 'room:sync',
      code: room.code,
      gameType: room.gameType,
      mySeat,
      state: room.state,
      moves: room.moves,
      resignedWinner: room.resignedWinner,
      rematchVotes: Array.from(room.rematchVotes),
      players: {
        p1: room.p1
          ? {
              name: room.p1.name,
              connected: room.p1.ws?.readyState === WebSocket.OPEN
            }
          : null,
        p2: room.p2
          ? {
              name: room.p2.name,
              connected: room.p2.ws?.readyState === WebSocket.OPEN
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
    if (room.p1?.ws) {
      sendJson(room.p1.ws, buildSyncPayload(room, room.p1.id));
    }
    if (room.p2?.ws) {
      sendJson(room.p2.ws, buildSyncPayload(room, room.p2.id));
    }
    for (const [specId, ws] of room.spectators.entries()) {
      sendJson(ws, buildSyncPayload(room, specId));
    }
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
    if (room.p1?.ws === ws) {
      room.p1.ws = null;
      changed = true;
    }
    if (room.p2?.ws === ws) {
      room.p2.ws = null;
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
        const seat: ArcadeSeat = { id: playerId, name: playerName, ws };
        const room: ArcadeRoom = {
          code,
          gameType,
          state: createInitialArcadeState(gameType),
          moves: [],
          p1: pref === 'p1' ? seat : null,
          p2: pref === 'p2' ? seat : null,
          spectators: new Map(),
          resignedWinner: null,
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

        if (room.p1?.id === playerId) {
          room.p1.ws = ws;
          room.p1.name = playerName;
        } else if (room.p2?.id === playerId) {
          room.p2.ws = ws;
          room.p2.name = playerName;
        } else if (!room.p1) {
          room.p1 = { id: playerId, name: playerName, ws };
        } else if (!room.p2) {
          room.p2 = { id: playerId, name: playerName, ws };
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
          if (room.p1?.id === playerId && room.moves.length === 0) room.p1 = null;
          else if (room.p1?.id === playerId) room.p1.ws = null;
          if (room.p2?.id === playerId && room.moves.length === 0) room.p2 = null;
          else if (room.p2?.id === playerId) room.p2.ws = null;
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
        room.lastActivityAt = Date.now();

        if (typeof msg.moveIndex === 'number' && msg.moveIndex !== room.moves.length) {
          sendJson(ws, buildSyncPayload(room, playerId));
          return;
        }
        if (isRoomGameOver(room)) {
          sendJson(ws, buildSyncPayload(room, playerId));
          return;
        }

        const activeSeat = room.state.turn === 'p1' ? room.p1 : room.p2;
        if (!activeSeat || activeSeat.id !== playerId) {
          sendJson(ws, { type: 'room:error', message: 'Not your turn.' });
          sendJson(ws, buildSyncPayload(room, playerId));
          return;
        }

        const action = String(msg.action || '').trim().slice(0, 800);
        const res = applyArcadeAction(room.state, action);
        if (!res.valid) {
          sendJson(ws, { type: 'room:error', message: 'Illegal move rejected by server.' });
          sendJson(ws, buildSyncPayload(room, playerId));
          return;
        }

        room.state = res.nextState;
        room.moves = [...room.moves, action];
        room.rematchVotes.clear();
        broadcastRoom(room);
        return;
      }

      if (msg.type === 'room:resign') {
        if (isRoomGameOver(room)) return;
        const mySeat: ArcadePlayer | null =
          room.p1?.id === playerId ? 'p1' : room.p2?.id === playerId ? 'p2' : null;
        if (!mySeat) return;
        room.lastActivityAt = Date.now();
        room.resignedWinner = mySeat === 'p1' ? 'p2' : 'p1';
        broadcastRoom(room);
        return;
      }

      if (msg.type === 'room:rematch') {
        const mySeat: ArcadePlayer | null =
          room.p1?.id === playerId ? 'p1' : room.p2?.id === playerId ? 'p2' : null;
        if (!mySeat) return;
        room.lastActivityAt = Date.now();
        room.rematchVotes.add(mySeat);

        const bothPresent = Boolean(room.p1 && room.p2);
        if ((bothPresent && room.rematchVotes.size >= 2) || (!bothPresent && room.rematchVotes.size >= 1)) {
          const oldP1 = room.p1;
          const oldP2 = room.p2;
          room.p1 = oldP2;
          room.p2 = oldP1;
          room.state = createInitialArcadeState(room.gameType);
          room.moves = [];
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
