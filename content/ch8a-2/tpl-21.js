// Templates: P1 (1-1 multiplication formulas) and 2-1 (square roots, approximation)
import { randInt, pick } from '../../js/rng.js';
import { surd, fmtInt, isSquare, isqrt, gcd } from '../../js/mathfmt.js';
import { O, OS, OT } from '../../js/qhelp.js';

const SQF = [2, 3, 5, 6, 7];
const X = 1.37; // evaluation point used to compare polynomials

function poly(a, b, c) {
  let s = a === 1 ? 'x^{2}' : `${a}x^{2}`;
  if (b) s += `${b < 0 ? '−' : '+'}${Math.abs(b) === 1 ? '' : Math.abs(b)}x`;
  if (c) s += `${c < 0 ? '−' : '+'}${Math.abs(c)}`;
  return s;
}
const P = (a, b, c, mis = null) => O(poly(a, b, c), a * X * X + b * X + c, mis);
const pm = (tex, value, mis = null) => O(`±${tex}`, `pm${value.toFixed(9)}`, mis);

export default [
  {
    id: 'P1-A', node: 'P1',
    gen(r) {
      const k = randInt(r, 2, 9);
      return {
        stem: `展開：(x+${k})^{2} = ？`,
        options: [P(1, 2 * k, k * k), P(1, 0, k * k, 'M-P1a'), P(1, k, k * k, 'M-P1b'), P(1, 2 * k, 2 * k, 'M-P1c')],
      };
    },
  },
  {
    id: 'P1-B', node: 'P1',
    gen(r) {
      const k = randInt(r, 2, 9);
      return {
        stem: `展開：(x−${k})^{2} = ？`,
        options: [P(1, -2 * k, k * k), P(1, 0, -k * k, 'M-P1d'), P(1, -2 * k, -k * k, 'M-P1e'), P(1, 2 * k, k * k, 'M-P1e')],
      };
    },
  },
  {
    id: 'P1-C', node: 'P1',
    gen(r) {
      const k = randInt(r, 2, 9);
      return {
        stem: `展開：(x+${k})(x−${k}) = ？`,
        options: [P(1, 0, -k * k), P(1, 0, k * k, 'M-P1e'), P(1, -2 * k, k * k, 'M-P1d'), P(1, 0, -2 * k, 'M-P1c')],
      };
    },
  },
  // ---------- R1 平方根的意義 ----------
  {
    id: 'R1-A', node: 'R1',
    gen(r) {
      const k = randInt(r, 3, 9);
      const ps = [2, 3, 4, 5].filter((p) => (k * (k + 1)) % p === 0 && (k * (k - 1)) % p === 0);
      const p = pick(r, ps);
      const a0 = randInt(r, -6, 9);
      const q = k * k - p * a0;
      if (q === 0) return null;
      const expr = `${p}a${q > 0 ? '+' : '−'}${Math.abs(q)}`;
      const w1 = (-k - q) / p;
      const w2 = (k - q) / p;
      const stem = r() < 0.5 ? `−${k} 是 ${expr} 的一個平方根，a = ？` : `${expr} 的平方根中，有一個是 −${k}。a = ？`;
      return {
        stem,
        options: [O(fmtInt(a0), a0), O(fmtInt(w1), w1, 'M-R1a'), O(fmtInt(w2), w2, 'M-R1a'), OT('無解', 'M-R1b')],
      };
    },
  },
  {
    id: 'R1-B', node: 'R1',
    gen(r) {
      if (r() < 0.5) {
        const k = randInt(r, 2, 15);
        const n = k * k;
        const half = n % 2 === 0 ? String(n / 2) : `\\frac{${n}}{2}`;
        return {
          stem: `${n} 的平方根是？`,
          options: [pm(String(k), k), O(String(k), k, 'M-R1b'), pm(half, n / 2, 'M-R1i'), pm(String(n), n, 'M-T2b')],
        };
      }
      const n = pick(r, [2, 3, 5, 6, 7, 10, 11, 13, 14, 15]);
      const half = n % 2 === 0 ? String(n / 2) : `\\frac{${n}}{2}`;
      return {
        stem: `${n} 的平方根是？`,
        options: [pm(`√{${n}}`, Math.sqrt(n)), O(`√{${n}}`, Math.sqrt(n), 'M-R1b'), pm(half, n / 2, 'M-R1i'), pm(String(n), n, 'M-T2b')],
      };
    },
  },
  {
    id: 'R1-C', node: 'R1',
    gen(r) {
      const s = randInt(r, 2, 7);
      const t = pick(r, [1, ...SQF]);
      const n = s * s * t;
      const side = surd(s, 1, t);
      const q = n % 4 === 0 ? String(n / 4) : `\\frac{${n}}{4}`;
      return {
        stem: `一個正方形的面積是 ${n} 平方公分，它的邊長是幾公分？`,
        options: [
          OS(side),
          O(n % 2 === 0 ? String(n / 2) : `\\frac{${n}}{2}`, n / 2, 'M-R1e'),
          O(q, n / 4, 'M-R1e'),
          O(`±${side.rad === 1 ? side.num : `${side.num === 1 ? '' : side.num}√{${side.rad}}`}`, `pm${side.value}`, 'M-R1f'),
        ],
      };
    },
  },
  // ---------- R7 根號的性質與比大小 ----------
  {
    id: 'R7-A', node: 'R7',
    gen(r) {
      const k = randInt(r, 2, 12);
      return {
        stem: `√{(−${k})^{2}} = ？`,
        options: [O(String(k), k), O(`−${k}`, -k, 'M-R1c'), OT('沒有意義', 'M-R1c'), O(String(k * k), k * k, 'M-T2b')],
      };
    },
  },
  {
    id: 'R7-B', node: 'R7',
    gen(r) {
      const p = randInt(r, 2, 5);
      const q = pick(r, SQF);
      const mode = pick(r, ['A', 'B', 'E']);
      const base = p * p * q;
      const d = randInt(r, 1, 6);
      const rr = mode === 'A' ? base - d : mode === 'B' ? base + d : base;
      if (rr <= 1) return null;
      const A = `${p}√{${q}}`;
      const B = `√{${rr}}`;
      const sA = `${A} 比較大`;
      const sB = `${B} 比較大`;
      const opts =
        mode === 'A'
          ? [OT(sA), OT(sB, 'M-R7a'), OT('一樣大', 'M-R7d'), OT('無法比較', 'M-R7e')]
          : mode === 'B'
            ? [OT(sB), OT(sA, 'M-R7c'), OT('一樣大', 'M-R7d'), OT('無法比較', 'M-R7e')]
            : [OT('一樣大'), OT(sB, 'M-R7a'), OT(sA, 'M-R7c'), OT('無法比較', 'M-R7e')];
      return { stem: `比較 ${A} 和 ${B} 的大小：`, options: opts };
    },
  },
  {
    id: 'R7-C', node: 'R7',
    gen(r) {
      const n = pick(r, [2, 3, 5, 6, 7, 10, 11, 13, 15]);
      return {
        stem: `(√{${n}})^{2} = ？`,
        options: [O(String(n), n), O(String(n * n), n * n, 'M-R7b'), O(`√{${n}}`, Math.sqrt(n), 'M-R7b'), O(`±${n}`, `pm${n}`, 'M-R1f')],
      };
    },
  },
  // ---------- R2 完全平方數、標準分解 ----------
  {
    id: 'R2-A', node: 'R2',
    gen(r) {
      const primes = [2, 3, 5, 7];
      const p1 = pick(r, [2, 3, 5]);
      const p2 = pick(r, primes.filter((p) => p > p1));
      // at least one exponent is 4, otherwise the answer p1*p2 equals the M-R2c distractor
      const [e1, e2] = pick(r, [[4, 2], [2, 4], [4, 4]]);
      const n = p1 ** e1 * p2 ** e2;
      if (n > 60000) return null;
      const ans = p1 ** (e1 / 2) * p2 ** (e2 / 2);
      const partial = p1 ** (e1 / 2) * p2 ** e2;
      return {
        stem: `√{${p1}^{${e1}}×${p2}^{${e2}}} = ？`,
        options: [O(String(ans), ans), O(String(n), n, 'M-R2a'), O(String(partial), partial, 'M-R2a'), O(String(p1 * p2), p1 * p2, 'M-R2c')],
      };
    },
  },
  {
    id: 'R2-B', node: 'R2',
    gen(r) {
      if (r() < 0.6) {
        const b = randInt(r, 2, 12);
        const a = randInt(r, 1, b - 1);
        if (gcd(a, b) !== 1) return null;
        const F = (n, d) => `\\frac{${n}}{${d}}`;
        return {
          stem: `${F(a * a, b * b)} 的平方根是？`,
          options: [
            pm(F(a, b), a / b),
            O(F(a, b), a / b, 'M-R1b'),
            pm(F(a, b * b), a / (b * b), 'M-R2b'),
            pm(F(a * a, b), (a * a) / b, 'M-R2b'),
          ],
        };
      }
      const k = randInt(r, 2, 9);
      const sq = (k * k) / 100;
      return {
        stem: `${sq} 的平方根是？`,
        options: [pm(String(k / 10), k / 10), O(String(k / 10), k / 10, 'M-R1b'), pm(String(k / 100), k / 100, 'M-R2d'), pm(String(sq / 2), sq / 2, 'M-R1i')],
      };
    },
  },
  // ---------- R3 近似值 ----------
  {
    id: 'R3-A', node: 'R3',
    gen(r) {
      const n = randInt(r, 10, 120);
      if (isSquare(n)) return null;
      const f = isqrt(n);
      const h = Math.floor(n / 2);
      const pair = (a, b, mis = null) => OT(`${a} 和 ${b}`, mis);
      return {
        stem: `√{${n}} 介於哪兩個連續整數之間？`,
        options: [pair(f, f + 1), pair(n - 1, n + 1, 'M-R3a'), pair(h, h + 1, 'M-R3c'), pair(f - 1, f, 'M-R3d')],
      };
    },
  },
  {
    id: 'R3-B', node: 'R3',
    gen(r) {
      const n = randInt(r, 2, 99);
      if (isSquare(n)) return null;
      const t10 = isqrt(100 * n);
      const d1 = (x) => (x / 10).toFixed(1);
      const pair = (a, b, mis = null) => OT(`${a} 和 ${b}`, mis);
      return {
        stem: `用十分逼近法：√{${n}} 介於哪兩個「小數點後一位」的數之間？`,
        options: [
          pair(d1(t10), d1(t10 + 1)),
          pair(d1(t10 + 1), d1(t10 + 2), 'M-R3b'),
          pair(d1(t10 - 1), d1(t10), 'M-R3b'),
          pair(((t10 * t10) / 100).toFixed(2), (((t10 + 1) * (t10 + 1)) / 100).toFixed(2), 'M-R3e'),
        ],
      };
    },
  },
];
