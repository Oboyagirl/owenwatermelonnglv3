# Security Specification: Owen Watermelon V3 Cloud Game Saves

## 1. Data Invariants
1. **User Isolation**: A user can only read, write, create, and delete documents within `/users/$(request.auth.uid)`. Cross-user access is strictly forbidden.
2. **Master Gate Relational Invariant**: Any subcollection document under `/users/{userId}/*` must have matching path parameter `userId == request.auth.uid`.
3. **Payload Identity Integrity**: Any document write must enforce `incoming().userId == request.auth.uid` and path variable matching.
4. **ID Sanitization**: Document IDs must pass `isValidId()` (regex matching `^[a-zA-Z0-9_\-]+$` and length <= 128) to prevent ID poisoning and denial-of-wallet attacks.
5. **Payload Size Boundaries**: String lengths must be strictly checked:
   - `saveData.size() <= 500000` (500KB max per slot to prevent abuse)
   - `slot.size() <= 32`
   - `gameId.size() <= 128`
   - `displayName.size() <= 64`
6. **No Blanket Reads**: Client list queries must be scoped to `/users/$(request.auth.uid)/saves` or explicitly check `resource.data.userId == request.auth.uid`.
7. **No Unauthenticated Access**: Unauthenticated guests cannot read or modify any cloud saves.

## 2. The "Dirty Dozen" Malicious Payloads

1. **Payload 1 (Identity Spoofing - Impersonating Another User's Profile)**:
   ```json
   {
     "path": "/users/victim_user_123",
     "auth": { "uid": "attacker_456" },
     "data": { "userId": "victim_user_123", "displayName": "Attacker" }
   }
   ```
   *Expected: PERMISSION_DENIED*

2. **Payload 2 (Save Stealing - Reading Sibling or Other Player's Save File)**:
   ```json
   {
     "path": "/users/victim_user_123/saves/slope_slot1",
     "auth": { "uid": "attacker_456" },
     "operation": "get"
   }
   ```
   *Expected: PERMISSION_DENIED*

3. **Payload 3 (Cross-Account Save Injection - Overwriting Another User's Cloud Save)**:
   ```json
   {
     "path": "/users/victim_user_123/saves/slope_slot1",
     "auth": { "uid": "attacker_456" },
     "data": { "id": "slope_slot1", "userId": "victim_user_123", "gameId": "slope", "slot": "slot1", "saveData": "{\"score\":0}" }
   }
   ```
   *Expected: PERMISSION_DENIED*

4. **Payload 4 (Unauthenticated Read Attempt)**:
   ```json
   {
     "path": "/users/user_abc/saves/slope_slot1",
     "auth": null,
     "operation": "get"
   }
   ```
   *Expected: PERMISSION_DENIED*

5. **Payload 5 (Unauthenticated Write Attempt)**:
   ```json
   {
     "path": "/users/user_abc",
     "auth": null,
     "data": { "userId": "user_abc", "displayName": "Hacker" }
   }
   ```
   *Expected: PERMISSION_DENIED*

6. **Payload 6 (Shadow Field / Ghost Property Attack)**:
   ```json
   {
     "path": "/users/user_abc",
     "auth": { "uid": "user_abc" },
     "data": { "userId": "user_abc", "displayName": "Bob", "isAdmin": true, "superUserOverride": true }
   }
   ```
   *Expected: PERMISSION_DENIED*

7. **Payload 7 (Denial-of-Wallet Oversized Payload Attack)**:
   ```json
   {
     "path": "/users/user_abc/saves/giant_save",
     "auth": { "uid": "user_abc" },
     "data": { "id": "giant_save", "userId": "user_abc", "gameId": "slope", "slot": "slot1", "saveData": "A".repeat(800000) }
   }
   ```
   *Expected: PERMISSION_DENIED*

8. **Payload 8 (Document ID Poisoning / Path Traversal Injection)**:
   ```json
   {
     "path": "/users/user_abc/saves/../../system_admin_key",
     "auth": { "uid": "user_abc" },
     "data": { "id": "../../system_admin_key", "userId": "user_abc", "gameId": "slope", "slot": "slot1", "saveData": "{}" }
   }
   ```
   *Expected: PERMISSION_DENIED*

9. **Payload 9 (User ID Tampering within Document Body)**:
   ```json
   {
     "path": "/users/user_abc/saves/slope_slot1",
     "auth": { "uid": "user_abc" },
     "data": { "id": "slope_slot1", "userId": "different_user", "gameId": "slope", "slot": "slot1", "saveData": "{}" }
   }
   ```
   *Expected: PERMISSION_DENIED*

10. **Payload 10 (Type Poisoning - Number Instead of String in saveData)**:
    ```json
    {
      "path": "/users/user_abc/saves/slope_slot1",
      "auth": { "uid": "user_abc" },
      "data": { "id": "slope_slot1", "userId": "user_abc", "gameId": "slope", "slot": "slot1", "saveData": 12345678 }
    }
    ```
    *Expected: PERMISSION_DENIED*

11. **Payload 11 (Oversized Array Bomb in User Profile)**:
    ```json
    {
      "path": "/users/user_abc",
      "auth": { "uid": "user_abc" },
      "data": { "userId": "user_abc", "displayName": "Bob", "favoriteGameIds": Array(500).fill("game") }
    }
    ```
    *Expected: PERMISSION_DENIED*

12. **Payload 12 (Global Catch-All Probe on Unmapped Collection)**:
    ```json
    {
      "path": "/admin_secrets/master_key",
      "auth": { "uid": "user_abc" },
      "operation": "get"
    }
    ```
    *Expected: PERMISSION_DENIED*

---

## 3. Chess Rooms (`/chessRooms/{roomCode}`) Security Invariants & Adversarial Tests

### Invariants
1. **No Room Enumeration (`allow list: if false`)**: Unlisted queries against `/chessRooms` are forbidden; a player must know the exact 4–8 character uppercase alphanumeric `roomCode` to `get` or subscribe.
2. **Creator & Seat Identity Integrity**: On creation, `creatorAuthUid == request.auth.uid`, exactly one seat holds `request.auth.uid`, `moves` is empty, `status == 'waiting'`, and `createdAt == request.time && updatedAt == request.time`.
3. **Action-Based Update Isolation**: Every update uses `affectedKeys().hasOnly(...)` across distinct actions (`Join`, `Leave`, `Move`, `End`, `RematchVote`, `RematchReset`), preventing arbitrary field tampering.
4. **Turn Enforcement**: Only the seated player matching `existing().turn` (`whiteAuthUid` or `blackAuthUid`) can append exactly 1 move (`moves.size() == existing().moves.size() + 1`).
5. **Terminal State Locking**: Once `status == 'finished'`, moves, resignations, timeouts, and joins are locked out; only seated participants may vote for or trigger a rematch reset.
6. **Immortal & Temporal Integrity**: `code`, `creatorAuthUid`, `createdAt`, `timeControlId`, `baseMs`, and `incMs` cannot change after creation; `updatedAt == request.time` is enforced on every write.

### Chess Room "Dirty Dozen" Malicious Payloads
1. **Unauthenticated Room Create/Read**: `{ "path": "/chessRooms/ABC234", "auth": null, "operation": "get" }` -> `PERMISSION_DENIED`
2. **Collection Enumeration (`list`)**: `{ "path": "/chessRooms", "auth": { "uid": "u1" }, "operation": "list" }` -> `PERMISSION_DENIED`
3. **Invalid Room Code ID Poisoning**: `{ "path": "/chessRooms/../../evil", "auth": { "uid": "u1" }, "operation": "create" }` -> `PERMISSION_DENIED`
4. **Spoofed Creator UID on Create**: `{ "path": "/chessRooms/ABC234", "auth": { "uid": "attacker" }, "data": { "creatorAuthUid": "victim" } }` -> `PERMISSION_DENIED`
5. **Shadow Ghost Field on Create**: `{ "path": "/chessRooms/ABC234", "auth": { "uid": "u1" }, "data": { "...valid", "isAdmin": true } }` -> `PERMISSION_DENIED`
6. **Pre-Seeded Moves on Create**: `{ "path": "/chessRooms/ABC234", "auth": { "uid": "u1" }, "data": { "...valid", "moves": ["6,4->4,4"] } }` -> `PERMISSION_DENIED`
7. **Client-Spoofed Timestamp**: `{ "path": "/chessRooms/ABC234", "auth": { "uid": "u1" }, "data": { "...valid", "createdAt": "2020-01-01T00:00:00Z" } }` -> `PERMISSION_DENIED`
8. **Seat Hijacking (Replacing Already-Seated Opponent)**: `{ "path": "/chessRooms/ABC234", "auth": { "uid": "intruder" }, "update": { "blackAuthUid": "intruder" } }` when `existing.blackAuthUid == "u2"` -> `PERMISSION_DENIED`
9. **Out-of-Turn Move / Moving Opponent's Pieces**: `{ "path": "/chessRooms/ABC234", "auth": { "uid": "blackUid" }, "update": { "moves": ["6,4->4,4"] } }` when `existing.turn == "w"` -> `PERMISSION_DENIED`
10. **Double-Move / History Rewrite**: `{ "path": "/chessRooms/ABC234", "auth": { "uid": "whiteUid" }, "update": { "moves": ["6,4->4,4", "1,4->3,4"] } }` when `existing.moves.size() == 0` -> `PERMISSION_DENIED`
11. **Post-Finish State Mutation (Terminal Lock Bypass)**: `{ "path": "/chessRooms/ABC234", "auth": { "uid": "whiteUid" }, "update": { "resignedWinner": "w" } }` when `existing.status == "finished"` -> `PERMISSION_DENIED`
12. **Time Control Tampering After Create**: `{ "path": "/chessRooms/ABC234", "auth": { "uid": "whiteUid" }, "update": { "baseMs": 1000 } }` -> `PERMISSION_DENIED`

---

## 4. Arcade Rooms (`/arcadeRooms/{roomCode}`) Security Invariants

1. **No Room Enumeration (`allow list: if false`)**: Unlisted collection queries are forbidden; rooms require knowing the exact 4–8 uppercase alphanumeric `roomCode`.
2. **Valid Game Type Whitelist**: `gameType` must be one of `connect4`, `checkers`, `reversi`, `dots-and-boxes`, `gomoku`, `ultimate-ttt`, `mancala`, `tictactoe` and cannot change after room creation.
3. **Seat & Creator Integrity**: On create, `creatorAuthUid == request.auth.uid`, exactly one seat holds `request.auth.uid`, `moves` is empty, `turn == 'p1'`, `winner == null`, and `createdAt == request.time && updatedAt == request.time`.
4. **Action-Isolated Updates**: Updates isolate `affectedKeys` across `Join/Reconnect`, `Vacate`, `Move` (+1 move only by active turn UID, allowing multi-turn chains such as Checkers double jumps, Mancala store landings, Dots & Boxes completions, and Reversi auto-passes), `Resign`, `RematchVote`, and `RematchReset`.
5. **Terminal Lock**: Once `status == 'finished'`, gameplay moves, joins, and resignations are locked out; only seated participants may vote for or reset a rematch.

---

## 5. Direct Friend Game Invites (`/gameInvites/{inviteId}`) Security Invariants

1. **Strict Participant Isolation (`get` & `list`)**: Only users whose `request.auth.uid` appears inside `participantUids` (`[fromUid, toUid]`) may read or list game invites.
2. **Sender & Verified Recipient Integrity**: On create, `fromUid == request.auth.uid`, `fromUid != toUid`, `status == 'pending'`, `createdAt == request.time && updatedAt == request.time`, and target `chatProfiles/{toUid}` must exist.
3. **Immutable Challenge Metadata & Role-Gated Transitions**: Updates may only touch `status` and `updatedAt` while `existing().status == 'pending'`; only `toUid` can accept/decline and only `fromUid` can cancel.

### Game Invites Malicious Payloads
1. **Impersonating Another Sender**: `{ "fromUid": "victim", "toUid": "friend", "auth": { "uid": "attacker" } }` -> `PERMISSION_DENIED`
2. **Spoofed List Query Without Participant Filter**: `{ "path": "/gameInvites", "auth": { "uid": "u1" }, "operation": "list" }` -> `PERMISSION_DENIED`
3. **Self-Accepting Own Sent Invite**: `fromUid` attempting `update({ status: 'accepted' })` -> `PERMISSION_DENIED`
4. **Tampering Room Code After Sending Invite**: `toUid` attempting `update({ roomCode: 'EVIL99', status: 'accepted' })` -> `PERMISSION_DENIED`
