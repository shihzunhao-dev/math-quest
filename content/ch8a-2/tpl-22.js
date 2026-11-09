// Templates: 2-2 radical operations
import { randInt, pick } from '../../js/rng.js';
import { surd, sqrtOf, int, texSum, sumValue, isSquareFree } from '../../js/mathfmt.js';
import { O, OS, OT } from '../../js/qhelp.js';

const SQF = [2, 3, 5, 6, 7];
const coef = (k) => (k === 1 ? '' : String(k));
const SUM = (a, b, rad, mis = null) => O(texSum(a, b, rad), sumValue(a, b, rad), mis);

export default [
  // ---------- R8 根式乘除 ----------
  {
    id: 'R8-A', node: 'R8',
    gen(r) {
      const a = randInt(r, 2, 5);
      const c = randInt(r, 2, 5);
      const b = pick(r, [2, 3, 5, 6, 7, 10]);
      const d = pick(r, [2, 3, 5, 6, 7, 10].filter((x) => x !== b));
      return {
        stem: `${a}√{${b}} × ${c}√{${d}} = ？`,
        options: [
          OS(surd(a * c, 1, b * d)),
          OS(surd(a + c, 1, b * d), 'M-R5c'),
          OS(surd(a * c, 1, b + d), 'M-R8a'),
          OS(surd(1, 1, a * b * c * d), 'M-R8c'),
        ],
      };
    },
  },
  {
    id: 'R8-B', node: 'R8',
    gen(r) {
      const n = pick(r, SQF);
      const k = randInt(r, 2, 6);
      const m = n * k * k;
      const stem = r() < 0.5 ? `√{${m}} ÷ √{${n}} = ？` : `\\frac{√{${m}}}{√{${n}}} = ？`;
      return {
        stem,
        options: [OS(int(k)), OS(int(k * k), 'M-R8b'), OS(sqrtOf(m - n), 'M-R8a'), OS(surd(k, 1, n), 'M-R8d')],
      };
    },
  },
  // ---------- R4 最簡根式 ----------
  {
    id: 'R4-A', node: 'R4',
    gen(r) {
      const s = pick(r, [4, 6, 8, 9, 10, 12]);
      const t = pick(r, SQF);
      const divs = [];
      for (let d = 2; d < s; d++) if (s % d === 0) divs.push(d);
      const d = pick(r, divs);
      const e = s / d;
      const ans = surd(s, 1, s * s * t);
      const answer = surd(s, 1, t);
      return {
        stem: `把 √{${s * s * t}} 化成最簡根式：`,
        options: [
          OS(answer),
          O(`${d}√{${e * e * t}}`, ans.value / s, 'M-R4a', { equiv: true }),
          O(`${s * s}√{${t}}`, s * s * Math.sqrt(t), 'M-R4b'),
          O(String(s * t), s * t, 'M-R4c'),
        ],
      };
    },
  },
  {
    id: 'R4-B', node: 'R4',
    gen(r) {
      const t = pick(r, [2, 3, 5, 6, 7, 10, 11, 13, 14, 15]);
      const k = randInt(r, 2, 4);
      const t2 = pick(r, SQF);
      const a = randInt(r, 1, 3);
      const b = pick(r, [2, 3, 5, 7].filter((x) => x !== a));
      const t3 = pick(r, SQF);
      return {
        stem: '下列哪一個是最簡根式？',
        options: [
          OT(`√{${t}}`),
          OT(`√{${k * k * t2}}`, 'M-R4d'),
          OT(`√{\\frac{${a}}{${b}}}`, 'M-R4e'),
          OT(`\\frac{1}{√{${t3}}}`, 'M-R4f'),
        ],
      };
    },
  },
  // ---------- R5 同類方根 ----------
  {
    id: 'R5-A', node: 'R5',
    gen(r) {
      const t = pick(r, SQF);
      const p = randInt(r, 1, 5);
      const q = randInt(r, 1, 5);
      if (p === q) return null;
      if (r() < 0.6) {
        return {
          stem: `√{${p * p * t}} + √{${q * q * t}} = ？`,
          options: [
            OS(surd(p + q, 1, t)),
            OS(sqrtOf((p * p + q * q) * t), 'M-R5b'),
            OS(surd(p + q, 1, 2 * t), 'M-R5e'),
            OS(surd(p * q, 1, t), 'M-R5g'),
          ],
        };
      }
      const [hi, lo] = p > q ? [p, q] : [q, p];
      return {
        stem: `√{${hi * hi * t}} − √{${lo * lo * t}} = ？`,
        options: [
          OS(surd(hi - lo, 1, t)),
          OS(sqrtOf((hi * hi - lo * lo) * t), 'M-R5b'),
          OS(surd(hi + lo, 1, t), 'M-R5h'),
          OS(surd(hi * lo, 1, t), 'M-R5g'),
        ],
      };
    },
  },
  {
    id: 'R5-B', node: 'R5',
    gen(r) {
      const t = pick(r, [2, 3, 5]);
      const k = randInt(r, 2, 4);
      const others = [2, 3, 5, 7].filter((m) => isSquareFree(m * t) && m !== t);
      const m1 = pick(r, others);
      const m2 = pick(r, others.filter((m) => m !== m1));
      if (!m2) return null;
      const u = pick(r, [2, 3, 5, 7].filter((x) => x !== t));
      return {
        stem: `下列哪一個和 √{${t}} 是同類方根？`,
        options: [
          OT(`√{${k * k * t}}`),
          OT(`√{${m1 * t}}`, 'M-R5f'),
          OT(`√{${m2 * t}}`, 'M-R5f'),
          OT(`${t}√{${u}}`, 'M-R5i'),
        ],
      };
    },
  },
  // ---------- R6 有理化 ----------
  {
    id: 'R6-A', node: 'R6',
    gen(r) {
      const t = pick(r, SQF);
      const m = randInt(r, 2, 5);
      const k = t * m;
      return {
        stem: `把 \\frac{${k}}{√{${t}}} 的分母有理化：`,
        options: [OS(surd(m, 1, t)), OS(surd(k, 1, t), 'M-R6a'), OS(int(m), 'M-R6c'), OS(sqrtOf(m), 'M-R6d')],
      };
    },
  },
  {
    id: 'R6-B', node: 'R6',
    gen(r) {
      const [t, s] = pick(r, [[2, 1], [5, 2], [10, 3], [17, 4], [26, 5]]);
      const k = randInt(r, 1, 3);
      const minus = r() < 0.6;
      const den = minus ? `√{${t}}−${s}` : `√{${t}}+${s}`;
      const sg = minus ? 1 : -1; // answer = k√t + sg*k*s
      const ansV = k * (Math.sqrt(t) + sg * s);
      const pmStr = (x) => (x < 0 ? `−${-x}` : `+${x}`);
      const ans = `${coef(k)}√{${t}}${pmStr(sg * k * s)}`;
      const neg = `−${coef(k)}√{${t}}${pmStr(-sg * k * s)}`;
      const flip = `${coef(k)}√{${t}}${pmStr(-sg * k * s)}`;
      return {
        stem: `把 \\frac{${k}}{${den}} 的分母有理化：`,
        options: [
          O(ans, ansV),
          O(neg, -ansV, 'M-R6b'),
          O(`\\frac{${ans}}{${t - s}}`, ansV / (t - s), 'M-R6e'),
          O(flip, k * (Math.sqrt(t) - sg * s), 'M-R6a'),
        ],
      };
    },
  },
  // ---------- R9 根式四則綜合 ----------
  {
    id: 'R9-A', node: 'R9',
    gen(r) {
      const a = pick(r, [3, 5, 6, 7]);
      const b = pick(r, [2, 3, 5].filter((x) => x < a));
      if (r() < 0.6) {
        return {
          stem: `(√{${a}}+√{${b}})^{2} = ？`,
          options: [SUM(a + b, 2, a * b), SUM(a + b, 0, 1, 'M-P1a'), SUM(a + b, 1, a * b, 'M-P1b'), SUM(a - b, 0, 1, 'M-R9a')],
        };
      }
      return {
        stem: `(√{${a}}−√{${b}})^{2} = ？`,
        options: [SUM(a + b, -2, a * b), SUM(a - b, 0, 1, 'M-R9a'), SUM(a + b, 0, 1, 'M-P1a'), SUM(a + b, 2, a * b, 'M-P1e')],
      };
    },
  },
  {
    id: 'R9-B', node: 'R9',
    gen(r) {
      if (r() < 0.5) {
        const a = pick(r, [3, 5, 6, 7, 10, 11]);
        const b = pick(r, [2, 3, 5, 7].filter((x) => x !== a));
        return {
          stem: `(√{${a}}+√{${b}})(√{${a}}−√{${b}}) = ？`,
          options: [OS(int(a - b)), OS(int(a + b), 'M-R9a'), OS(int(b - a), 'M-R9c'), OS(sqrtOf(a * b), 'M-R9b')],
        };
      }
      const p = randInt(r, 2, 4);
      const a = pick(r, SQF);
      const q = randInt(r, 1, 6);
      const v = p * p * a - q * q;
      if (v === 0) return null;
      return {
        stem: `(${p}√{${a}}+${q})(${p}√{${a}}−${q}) = ？`,
        options: [OS(int(v)), OS(int(p * p * a + q * q), 'M-R9a'), OS(int(-v), 'M-R9c'), OS(int(p * a - q * q), 'M-R9d')],
      };
    },
  },
];
