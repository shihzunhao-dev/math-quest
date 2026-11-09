// Prints test vectors for the redeem-code algorithm so the game-side
// implementation (Luau / JavaScript in Minecraft) can be checked against it.
// Usage: node tools/codes-vectors.mjs
import { codeFor, isValidCode, fnv1a } from '../js/codes.js';

const cases = [['P1', 2], ['R1', 2], ['R1', 3], ['T2', 2], ['T11', 3]];
for (const [n, s] of cases) {
  const code = codeFor(n, s);
  console.log(`${code}  fnv=${fnv1a(`mq-ch8a2-v1|${n}|${s}`)}  valid=${isValidCode(code)}`);
}
// negative checks
const bad = ['T2-2-AAAAA', 'T2-4-K7Q4M', 'X1-2-ABCDE', ''];
for (const b of bad) console.log(`${JSON.stringify(b)} valid=${isValidCode(b)}`);
// a code with one character changed must be rejected
const good = codeFor('T5', 2);
const tampered = good.slice(0, -1) + (good.endsWith('2') ? '3' : '2');
console.log(`tampered ${tampered} valid=${isValidCode(tampered)}`);
// lowercase input should still be accepted
console.log(`lowercase ${good.toLowerCase()} valid=${isValidCode(good.toLowerCase())}`);
