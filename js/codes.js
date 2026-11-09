// Redeem codes for the companion games.
// A code is earned per node and star level: ★★ (mastered) and ★★★ (remembered).
// Format: <NODE>-<STAR>-<CHECK>, e.g. "T2-2-K7Q4M".
// CHECK = first 5 base32 symbols of FNV-1a(32-bit) over `${SECRET}|${node}|${star}`.
// The same algorithm must be implemented in the game (see tools/codes-vectors.mjs for test vectors).
// This is a family-use speed bump, not security: the secret is visible in this public file.
export const SECRET = 'mq-ch8a2-v1';
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // no 0/O/1/I

export function fnv1a(str) {
  let h = 0x811c9dc5;
  const bytes = new TextEncoder().encode(str);
  for (const b of bytes) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function checkFor(node, star) {
  let h = fnv1a(`${SECRET}|${node}|${star}`);
  let s = '';
  for (let i = 0; i < 5; i++) {
    s += ALPHABET[h % 32];
    h = Math.floor(h / 32);
  }
  return s;
}

export const codeFor = (node, star) => `${node}-${star}-${checkFor(node, star)}`;

export function isValidCode(code) {
  const m = String(code).trim().toUpperCase().match(/^([PRT]\d{1,2})-([23])-([2-9A-HJ-NP-Z]{5})$/);
  return !!m && checkFor(m[1], Number(m[2])) === m[3];
}

// What the code is worth in the game (shown on the website so the student knows)
export const REWARD_TEXT = { 2: '精熟獎勵', 3: '記憶獎勵（加倍）' };
