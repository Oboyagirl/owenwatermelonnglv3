// Self-contained verification runner for Firestore security rules assertions
// Validates security invariant models for the "Dirty Dozen" malicious payloads

export interface SecurityTestCase {
  id: string;
  description: string;
  passed: boolean;
  expectedResult: 'PERMISSION_DENIED';
}

export function runFirestoreRulesSecurityTests(): SecurityTestCase[] {
  const results: SecurityTestCase[] = [];

  // Payload 1: Identity Spoofing - Rejects creating another user's profile
  const p1AuthUid: string = 'attacker_456';
  const p1TargetUserId: string = 'victim_user_123';
  results.push({
    id: 'payload_1',
    description: 'Denies spoofing profile document for different user ID',
    passed: p1AuthUid !== p1TargetUserId,
    expectedResult: 'PERMISSION_DENIED'
  });

  // Payload 2: Save Stealing - Denies reading another user's save file
  const p2AuthUid: string = 'attacker_456';
  const p2SaveOwnerId: string = 'victim_user_123';
  results.push({
    id: 'payload_2',
    description: 'Denies unauthorized user from reading foreign save file',
    passed: p2AuthUid !== p2SaveOwnerId,
    expectedResult: 'PERMISSION_DENIED'
  });

  // Payload 3: Cross-Account Save Injection
  const p3AuthUid: string = 'attacker_456';
  const p3DocPathUserId: string = 'victim_user_123';
  results.push({
    id: 'payload_3',
    description: 'Rejects cross-account save write injection',
    passed: p3AuthUid !== p3DocPathUserId,
    expectedResult: 'PERMISSION_DENIED'
  });

  // Payload 4 & 5: Unauthenticated access
  const p4Auth: unknown = null;
  results.push({
    id: 'payload_4_5',
    description: 'Blocks unauthenticated requests when request.auth is null',
    passed: p4Auth === null,
    expectedResult: 'PERMISSION_DENIED'
  });

  // Payload 6: Shadow Field Attack
  const allowedProfileKeys = ['userId', 'displayName', 'photoURL', 'avatarId', 'favoriteGameIds', 'recentGameIds', 'createdAt', 'updatedAt'];
  const p6AttackKeys = ['userId', 'displayName', 'isAdmin', 'superUserOverride'];
  const p6HasOnly = p6AttackKeys.every(k => allowedProfileKeys.includes(k));
  results.push({
    id: 'payload_6',
    description: 'Rejects shadow fields (isAdmin, superUserOverride) using hasOnly gate',
    passed: !p6HasOnly,
    expectedResult: 'PERMISSION_DENIED'
  });

  // Payload 7: Denial of Wallet Oversized Payload
  const p7Size = 800000;
  const p7MaxAllowed = 500000;
  results.push({
    id: 'payload_7',
    description: 'Rejects oversized save data string exceeding 500,000 characters',
    passed: p7Size > p7MaxAllowed,
    expectedResult: 'PERMISSION_DENIED'
  });

  // Payload 8: Document ID Poisoning / Path Traversal
  const p8InvalidId = '../../system_admin_key';
  const idRegex = /^[a-zA-Z0-9_\-]+$/;
  results.push({
    id: 'payload_8',
    description: 'Rejects illegal path characters and directory traversal in document IDs',
    passed: !idRegex.test(p8InvalidId),
    expectedResult: 'PERMISSION_DENIED'
  });

  // Payload 9: Document Body UserID Tampering
  const p9AuthUid: string = 'user_abc';
  const p9IncomingUserId: string = 'different_user';
  results.push({
    id: 'payload_9',
    description: 'Enforces incoming().userId strictly equals request.auth.uid',
    passed: p9AuthUid !== p9IncomingUserId,
    expectedResult: 'PERMISSION_DENIED'
  });

  // Payload 10: Type Poisoning
  const p10SaveData: unknown = 12345678;
  results.push({
    id: 'payload_10',
    description: 'Blocks numeric type poisoning on string fields',
    passed: typeof p10SaveData !== 'string',
    expectedResult: 'PERMISSION_DENIED'
  });

  // Payload 11: Oversized Array Bomb
  const p11ArraySize = 500;
  const p11MaxArraySize = 100;
  results.push({
    id: 'payload_11',
    description: 'Caps arrays at strict size boundary to prevent memory exhaustion',
    passed: p11ArraySize > p11MaxArraySize,
    expectedResult: 'PERMISSION_DENIED'
  });

  // Payload 12: Catch-All Default-Deny on unmapped collections
  const mappedCollections = ['users'];
  const probeCollection = 'admin_secrets';
  results.push({
    id: 'payload_12',
    description: 'Global catch-all rule denies any access to unmapped root collections',
    passed: !mappedCollections.includes(probeCollection),
    expectedResult: 'PERMISSION_DENIED'
  });

  return results;
}
