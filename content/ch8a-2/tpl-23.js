// Templates: 2-3 Pythagorean theorem
import { randInt, pick } from '../../js/rng.js';
import { surd, sqrtOf, int, frac, plainSurd, fmtInt, isSquare } from '../../js/mathfmt.js';
// note: T2-B keeps b an integer leg; when c is irrational its label is shown as √n
import { O, OS, OT } from '../../js/qhelp.js';
import * as F from '../../js/figures.js';

const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10]];

// legs (a, b) with hypotenuse c; c may be irrational
function legs(r, { tripleChance = 0.6, maxLeg = 12 } = {}) {
  if (r() < tripleChance) {
    const [a, b, c] = pick(r, TRIPLES);
    const k = c <= 13 ? randInt(r, 1, 2) : 1;
    return r() < 0.5 ? [a * k, b * k] : [b * k, a * k];
  }
  const a = randInt(r, 1, maxLeg);
  const b = randInt(r, 1, maxLeg);
  return a === b ? null : [a, b];
}

export default [
  {
    id: 'T1-A', node: 'T1',
    gen(r) {
      const a = randInt(r, 1, 7);
      const b = randInt(r, 2, 8);
      if (a === b) return null;
      const n = a + b;
      return {
        stem: `大正方形的邊長是 ${a}+${b}，四個角各是一個兩股為 ${a}、${b} 的直角三角形（如圖）。中間正方形的面積是多少？`,
        figure: F.proofSquare({ a, b }),
        options: [
          OS(int(a * a + b * b)),
          OS(int((a - b) ** 2), 'M-T1a'),
          OS(frac(2 * n * n - a * b, 2), 'M-T1c'),
          OS(sqrtOf(a * a + b * b), 'M-T1b'),
        ],
      };
    },
  },
  {
    id: 'T2-A', node: 'T2',
    gen(r) {
      const L = legs(r);
      if (!L) return null;
      const [a, b] = L;
      return {
        stem: '如圖，直角三角形中 x = ？',
        figure: F.rightTri({ a, b, labA: a, labB: b, labC: 'x', flip: r() < 0.5 }),
        options: [
          OS(sqrtOf(a * a + b * b)),
          OS(int(a + b), 'M-R5a'),
          OS(int(a * a + b * b), 'M-T2b'),
          OS(sqrtOf(Math.abs(b * b - a * a)), 'M-T2a'),
        ],
      };
    },
  },
  {
    id: 'T2-B', node: 'T2',
    gen(r) {
      const L = legs(r);
      if (!L) return null;
      const [a, b] = L;
      const c2 = a * a + b * b;
      if (!isSquare(c2) && r() < 0.5) return null; // keep the hypotenuse mostly an integer
      const c = sqrtOf(c2);
      const cText = plainSurd(c);
      const diff = isSquare(c2)
        ? OS(int(Math.sqrt(c2) - a), 'M-T2c')
        : O(`√{${c2}}−${a}`, Math.sqrt(c2) - a, 'M-T2c');
      return {
        stem: '如圖，直角三角形中 x = ？',
        figure: F.rightTri({ a, b, labA: a, labB: 'x', labC: cText, flip: r() < 0.5 }),
        options: [OS(int(b)), OS(sqrtOf(c2 + a * a), 'M-T2a'), diff, OS(int(b * b), 'M-T2b')],
      };
    },
  },
  {
    id: 'T2-I', node: 'T2', kind: 'input',
    gen(r) {
      const c = randInt(r, 4, 12);
      const a = randInt(r, 1, c - 1);
      const v = c * c - a * a;
      if (isSquare(v)) return null; // force a radical answer so simplifying matters
      const ans = sqrtOf(v);
      return {
        kind: 'input',
        stem: '如圖，求 x（用最簡根式回答）：',
        figure: F.rightTri({ a, b: Math.sqrt(v), labA: a, labB: 'x', labC: c, flip: r() < 0.5 }),
        answer: { key: ans.value, tex: plainSurd(ans), rad: ans.rad },
        traps: [
          { key: Math.sqrt(c * c + a * a), mis: 'M-T2a' },
          { key: c - a, mis: 'M-T2c' },
          { key: v, mis: 'M-T2b' },
        ],
      };
    },
  },
  {
    id: 'T2-C', node: 'T2',
    gen(r) {
      if (r() < 0.5) {
        const s = randInt(r, 2, 12);
        return {
          stem: `正方形的邊長是 ${s}，對角線長是多少？`,
          figure: F.rectDiag({ w: 1, h: 1, labW: s, labH: s, labD: '?' }),
          options: [OS(surd(s, 1, 2)), OS(int(2 * s), 'M-T2d'), OS(int(2 * s * s), 'M-T2b'), OS(int(s * s), 'M-T1b')],
        };
      }
      const L = legs(r, { tripleChance: 0.7 });
      if (!L) return null;
      const [w, h] = L;
      return {
        stem: `長方形的長是 ${w}、寬是 ${h}，對角線長是多少？`,
        figure: F.rectDiag({ w, h, labW: w, labH: h, labD: '?' }),
        options: [OS(sqrtOf(w * w + h * h)), OS(int(w + h), 'M-R5a'), OS(int(w * w + h * h), 'M-T2b'), OS(int(w * h), 'M-T1b')],
      };
    },
  },
  {
    id: 'T3-A', node: 'T3',
    gen(r) {
      const [a0, b0, c0] = pick(r, TRIPLES);
      const k = c0 <= 13 ? randInt(r, 1, 3) : 1;
      const [a, b, c] = [a0 * k, b0 * k, c0 * k];
      const t = (x, y, z, mis = null) => OT(`${x}、${y}、${z}`, mis);
      return {
        stem: '下列哪一組數，可以是一個直角三角形的三邊長？',
        options: [t(a, b, c), t(a + 1, b + 1, c + 1, 'M-T3a'), t(a, b, a + b, 'M-T3b'), t(a, b, c + 1, 'M-T3c')],
      };
    },
  },
  {
    id: 'T3-B', node: 'T3',
    gen(r) {
      const [a0, b0, c0] = pick(r, TRIPLES.slice(0, 3));
      const k = randInt(r, 2, 4);
      const [a, b, c] = [a0 * k, b0 * k, c0 * k];
      return {
        stem: `直角三角形的兩股長是 ${a} 和 ${b}，斜邊長是多少？（想一想常見的三邊長）`,
        options: [OS(int(c)), OS(int(a + b), 'M-R5a'), OS(int(c * c), 'M-T2b'), OS(sqrtOf(b * b - a * a), 'M-T2a')],
      };
    },
  },
  {
    id: 'T4-A', node: 'T4',
    gen(r) {
      const [a, b, c] = pick(r, TRIPLES.slice(0, 2));
      const d = randInt(r, 2, 12);
      return {
        stem: `如圖，∠B 和 ∠ACD 都是直角，AB = ${a}、BC = ${b}、CD = ${d}。AD = ？`,
        figure: F.twoTri({ a, b, d, labAB: a, labBC: b, labCD: d, labAD: '?' }),
        options: [
          OS(sqrtOf(c * c + d * d)),
          OS(int(a + b + d), 'M-R5a'),
          OS(sqrtOf(b * b + d * d), 'M-T4a'),
          OS(int(c + d), 'M-R5a'),
        ],
      };
    },
  },
  {
    id: 'T4-B', node: 'T4',
    gen(r) {
      const d = randInt(r, 1, 4);
      const ks = [];
      for (let k = d + 1; k <= 15; k++) if ((k * k - d * d) % (2 * d) === 0) ks.push(k);
      if (!ks.length) return null;
      const k = pick(r, ks);
      const x = (k * k - d * d) / (2 * d);
      return {
        stem: `直角三角形的一股長 ${k}，另一股比斜邊短 ${d}。斜邊長是多少？`,
        figure: F.rightTri({ a: k, b: x, labA: k, labB: 'x', labC: `x+${d}`, flip: r() < 0.5 }),
        options: [OS(int(x + d)), OT('無解', 'M-P1a'), OS(sqrtOf(k * k + d * d), 'M-T4c'), OS(int(x), 'M-T4b')],
      };
    },
  },
  {
    id: 'T5-A', node: 'T5',
    gen(r) {
      if (r() < 0.6) {
        const [a0, b0, c0] = pick(r, TRIPLES.slice(0, 3));
        const k = c0 <= 13 ? randInt(r, 1, 3) : 1;
        const [a, b, c] = [a0 * k, b0 * k, c0 * k];
        return {
          stem: `直角三角形的兩股長是 ${a}、${b}，斜邊長是 ${c}。斜邊上的高 h = ？`,
          figure: F.rightTri({ a, b, labA: a, labB: b, labC: c, altitude: 'h', flip: r() < 0.5 }),
          options: [OS(frac(a * b, c)), OS(frac(a * b, 2 * c), 'M-T5a'), OS(frac(2 * a * b, c), 'M-T5a'), OS(frac(a + b, 2), 'M-T5c')],
        };
      }
      // irrational hypotenuse: h = ab/√(a²+b²) = ab√(a²+b²)/(a²+b²)
      const a = randInt(r, 1, 6);
      const b = randInt(r, 2, 7);
      const s = a * a + b * b;
      if (a === b || isSquare(s)) return null;
      return {
        stem: `直角三角形的兩股長是 ${a}、${b}。斜邊上的高 h = ？`,
        figure: F.rightTri({ a, b, labA: a, labB: b, labC: plainSurd(sqrtOf(s)), altitude: 'h', flip: r() < 0.5 }),
        options: [OS(surd(a * b, s, s)), OS(surd(a * b, 2 * s, s), 'M-T5a'), OS(surd(2 * a * b, s, s), 'M-T5a'), OS(frac(a + b, 2), 'M-T5c')],
      };
    },
  },
  {
    id: 'T6-A', node: 'T6',
    gen(r) {
      const m = randInt(r, 1, 8);
      return {
        stem: `正三角形的邊長是 ${2 * m}，它的高是多少？`,
        figure: F.equilateral({ labSide: 2 * m, labH: 'h' }),
        options: [OS(surd(m, 1, 3)), OS(sqrtOf(4 * m * m - m), 'M-T6a'), OS(int(m), 'M-T6c'), OS(surd(m, 1, 5), 'M-T2a')],
      };
    },
  },
  {
    id: 'T6-B', node: 'T6',
    gen(r) {
      const s = randInt(r, 2, 12);
      return {
        stem: `正三角形的邊長是 ${s}，它的面積是多少？`,
        figure: F.equilateral({ labSide: s }),
        options: [
          OS(surd(s * s, 4, 3)),
          OS(surd(s * s, 2, 3), 'M-T6b'),
          OS(surd(s * s, 1, 3), 'M-T6d'),
          OS(surd(s, 4, 3), 'M-T6e'),
        ],
      };
    },
  },
  {
    id: 'T6-C', node: 'T6',
    gen(r) {
      const h = randInt(r, 2, 12);
      return {
        stem: `正三角形的高是 ${h}，它的邊長是多少？`,
        figure: F.equilateral({ labSide: '?', labH: h }),
        options: [OS(surd(2 * h, 3, 3)), OS(int(2 * h), 'M-T6c'), OS(surd(h, 2, 3), 'M-T6f'), OS(surd(2 * h, 1, 3), 'M-R6a')],
      };
    },
  },
  {
    id: 'T7-A', node: 'T7',
    gen(r) {
      const c = randInt(r, 4, 15);
      if (r() < 0.5) {
        return {
          stem: `如圖，直角三角形的斜邊長是 ${c}，在兩股上各畫一個正方形。兩個正方形的面積總和是多少？`,
          figure: F.shapesOnLegs({ labC: c, type: 'square' }),
          options: [OS(int(c * c)), OS(int(2 * c * c), 'M-T7b'), OS(frac(c * c, 2), 'M-T7c'), OT('條件不足，算不出來', 'M-T7a')],
        };
      }
      return {
        stem: `如圖，直角三角形的斜邊長是 ${c}，在兩股上各畫一個正三角形。兩個正三角形的面積總和是多少？`,
        figure: F.shapesOnLegs({ labC: c, type: 'tri' }),
        options: [OS(surd(c * c, 4, 3)), OS(int(c * c), 'M-T7d'), OS(surd(c * c, 2, 3), 'M-T7b'), OT('條件不足，算不出來', 'M-T7a')],
      };
    },
  },
  {
    id: 'T8-A', node: 'T8',
    gen(r) {
      const p = randInt(r, 1, 4);
      const q = randInt(r, 1, 3);
      if (isSquare(p * p + q * q)) return null;
      return {
        stem: `如圖，在數線上以原點為一個頂點，畫兩股長 ${p}、${q} 的直角三角形，再以原點為圓心、斜邊長為半徑畫弧，交數線於 P。P 代表的數是？`,
        figure: F.numberLine({ p, q }),
        options: [OS(sqrtOf(p * p + q * q)), OS(int(p + q), 'M-T8a'), OS(int(p * p + q * q), 'M-T2b'), OS(int(Math.max(p, q)), 'M-T8b')],
      };
    },
  },
  {
    id: 'T9-A', node: 'T9',
    gen(r) {
      const [a0, b0, c0] = pick(r, TRIPLES.slice(0, 3));
      const k = c0 <= 13 ? randInt(r, 1, 3) : 1;
      const [f, h] = r() < 0.5 ? [a0 * k, b0 * k] : [b0 * k, a0 * k];
      const L = c0 * k;
      return {
        stem: `一把 ${L} 公尺長的梯子斜靠在牆上，梯腳離牆 ${f} 公尺。梯子頂端離地面多高？`,
        figure: F.ladder({ labL: `${L} m`, labF: `${f} m`, labH: '?' }),
        options: [OS(int(h)), OS(sqrtOf(L * L + f * f), 'M-T9a'), OS(int(L - f), 'M-T2c'), OS(int(L * L - f * f), 'M-T2b')],
      };
    },
  },
  {
    id: 'T9-B', node: 'T9',
    gen(r) {
      const L = legs(r, { tripleChance: 0.8, maxLeg: 9 });
      if (!L) return null;
      const [a, b] = L.map((x) => x * 100);
      return {
        stem: `小明從家往東走 ${a} 公尺，再往北走 ${b} 公尺到學校。家到學校的直線距離是幾公尺？`,
        figure: F.walk({ a, b, labA: `${a} m`, labB: `${b} m` }),
        options: [
          OS(sqrtOf(a * a + b * b)),
          OS(int(a + b), 'M-R5a'),
          OS(int(a * a + b * b), 'M-T2b'),
          OS(sqrtOf(Math.abs(a * a - b * b)), 'M-T9a'),
        ],
      };
    },
  },
  {
    id: 'T10-A', node: 'T10',
    gen(r) {
      const neg = randInt(r, -7, -1);
      const posv = randInt(r, 1, 7);
      const [u1, u2] = r() < 0.5 ? [neg, posv] : [posv, neg];
      const w = randInt(r, -5, 5);
      const horizontal = r() < 0.5;
      const A = horizontal ? [u1, w] : [w, u1];
      const B = horizontal ? [u2, w] : [w, u2];
      const d = Math.abs(u2 - u1);
      const pt = (n, p) => `${n}(${fmtInt(p[0])}, ${fmtInt(p[1])})`;
      return {
        stem: `坐標平面上 ${pt('A', A)}、${pt('B', B)}，A、B 兩點的距離是多少？`,
        figure: F.grid({ points: [{ x: A[0], y: A[1], label: pt('A', A) }, { x: B[0], y: B[1], label: pt('B', B) }] }),
        options: [OS(int(d)), OS(int(Math.abs(u1 + u2)), 'M-T10a'), OS(int(-d), 'M-T10b'), OS(int(0), 'M-T10c')],
      };
    },
  },
  {
    id: 'T11-A', node: 'T11',
    gen(r) {
      const [x1, y1, x2, y2] = [0, 0, 0, 0].map(() => randInt(r, -6, 6));
      const dx = x2 - x1;
      const dy = y2 - y1;
      if (dx === 0 || dy === 0) return null;
      if (Math.min(x1, y1, x2, y2) >= 0) return null;
      const wrongAbs = (Math.abs(x2) - Math.abs(x1)) ** 2 + (Math.abs(y2) - Math.abs(y1)) ** 2;
      const swapped = (x1 - y1) ** 2 + (x2 - y2) ** 2;
      if (wrongAbs === 0 || swapped === 0) return null;
      return {
        stem: `坐標平面上 A(${fmtInt(x1)}, ${fmtInt(y1)})、B(${fmtInt(x2)}, ${fmtInt(y2)})，AB 的長度是多少？`,
        figure: F.grid({ points: [{ x: x1, y: y1, label: `A(${fmtInt(x1)}, ${fmtInt(y1)})` }, { x: x2, y: y2, label: `B(${fmtInt(x2)}, ${fmtInt(y2)})` }] }),
        options: [
          OS(sqrtOf(dx * dx + dy * dy)),
          OS(sqrtOf(wrongAbs), 'M-T11a'),
          OS(int(Math.abs(dx) + Math.abs(dy)), 'M-R5a'),
          OS(sqrtOf(swapped), 'M-T11b'),
        ],
      };
    },
  },
];
