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
