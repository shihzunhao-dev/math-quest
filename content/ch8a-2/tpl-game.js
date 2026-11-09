// Game-flavoured templates (block worlds, parkour). Generic settings only:
// no game names, characters or art (the site is public).
import { randInt, pick } from '../../js/rng.js';
import { sqrtOf, int, fmtInt, isSquare, isqrt } from '../../js/mathfmt.js';
import { O, OS, OT } from '../../js/qhelp.js';
import * as F from '../../js/figures.js';

const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10]];

function triple(r, maxC = 60) {
  const [a, b, c] = pick(r, TRIPLES);
  const k = randInt(r, 1, Math.max(1, Math.floor(maxC / c)));
  return r() < 0.5 ? [a * k, b * k, c * k] : [b * k, a * k, c * k];
}

export default [
  {
    id: 'R1-G', node: 'R1',
    gen(r) {
      const k = randInt(r, 4, 16);
      const n = k * k;
      const half = n % 2 === 0 ? String(n / 2) : `\\frac{${n}}{2}`;
      const quarter = n % 4 === 0 ? String(n / 4) : `\\frac{${n}}{4}`;
      return {
        stem: `🧱 你用 ${n} 個方塊，剛好鋪滿一塊正方形的地板。這塊地板一邊有幾格？`,
        options: [O(String(k), k), O(half, n / 2, 'M-R1e'), O(quarter, n / 4, 'M-R1e'), O(`±${k}`, `pm${k}`, 'M-R1f')],
      };
    },
  },
  {
    id: 'R3-G', node: 'R3',
    gen(r) {
      const n = randInt(r, 20, 250);
      if (isSquare(n)) return null;
      const f = isqrt(n);
      const h = Math.floor(n / 2);
      const pair = (a, b, mis = null) => OT(`${a} 格和 ${b} 格`, mis);
      return {
        stem: `🌾 一塊正方形農田的面積是 ${n} 格。它的邊長介於哪兩個整數之間？`,
        options: [pair(f, f + 1), pair(n - 1, n + 1, 'M-R3a'), pair(h, h + 1, 'M-R3c'), pair(f - 1, f, 'M-R3d')],
      };
    },
  },
  {
    id: 'T9-G1', node: 'T9',
    gen(r) {
      const useTriple = r() < 0.7;
      const [a, b] = useTriple ? triple(r, 40) : [randInt(r, 3, 20), randInt(r, 3, 20)];
      if (a === b) return null;
      return {
        stem: `⛏️ 從基地往東挖 ${a} 格，再往北挖 ${b} 格，就到了礦坑。如果改成從基地斜著挖一條直線隧道，隧道長幾格？`,
        figure: F.walk({ a, b, labA: `${a} 格`, labB: `${b} 格`, from: '基地', to: '礦坑' }),
        options: [OS(sqrtOf(a * a + b * b)), OS(int(a + b), 'M-R5a'), OS(int(a * a + b * b), 'M-T2b'), OS(sqrtOf(Math.abs(a * a - b * b)), 'M-T9a')],
      };
    },
  },
  {
    id: 'T9-G2', node: 'T9',
    gen(r) {
      const [a, b] = r() < 0.6 ? triple(r, 20) : [randInt(r, 2, 9), randInt(r, 1, 6)];
      if (a === b) return null;
      return {
        stem: `🏃 跑酷關卡裡，兩個跳台水平相距 ${a} 格，高度差 ${b} 格。從低的跳台邊緣直線飛到高的跳台邊緣，飛行距離是多少格？`,
        figure: F.rightTri({ a, b, labA: `${a} 格`, labB: `${b} 格`, labC: '?', flip: r() < 0.5 }),
        options: [OS(sqrtOf(a * a + b * b)), OS(int(a + b), 'M-R5a'), OS(int(a * a + b * b), 'M-T2b'), OS(sqrtOf(Math.abs(a * a - b * b)), 'M-T9a')],
      };
    },
  },
  {
    id: 'T9-G3', node: 'T9',
    gen(r) {
      const [f, h, L] = triple(r, 50);
      return {
        stem: `🪂 從 ${h} 格高的塔頂拉一條滑索到地面，滑索長 ${L} 格。滑索落地的地方，離塔底有幾格？`,
        figure: F.ladder({ labL: `${L} 格`, labF: '?', labH: `${h} 格` }),
        options: [OS(int(f)), OS(sqrtOf(L * L + h * h), 'M-T9a'), OS(int(L - h), 'M-T2c'), OS(int(L * L - h * h), 'M-T2b')],
      };
    },
  },
  {
    id: 'T10-G', node: 'T10',
    gen(r) {
      const z = randInt(r, -300, 300);
      const x1 = randInt(r, -250, -10);
      const x2 = randInt(r, 10, 250);
      const [p, q] = r() < 0.5 ? [x1, x2] : [x2, x1];
      const d = Math.abs(x2 - x1);
      if (Math.abs(x1 + x2) === d || x1 + x2 === 0) return null;
      return {
        stem: `🪙 方塊世界用 (x, z) 表示地面上的位置。一枚金幣在 (${fmtInt(p)}, ${fmtInt(z)})，另一枚在 (${fmtInt(q)}, ${fmtInt(z)})。兩枚金幣相距幾格？`,
        options: [OS(int(d)), OS(int(Math.abs(x1 + x2)), 'M-T10a'), OS(int(-d), 'M-T10b'), OS(int(0), 'M-T10c')],
      };
    },
  },
  {
    id: 'T11-G', node: 'T11',
    gen(r) {
      const [dx0, dz0] = r() < 0.7 ? triple(r, 150) : [randInt(r, 5, 60), randInt(r, 5, 60)];
      const dx = r() < 0.5 ? dx0 : -dx0;
      const dz = r() < 0.5 ? dz0 : -dz0;
      // The sign-error distractor only differs from the answer when a coordinate crosses 0,
      // so make at least one axis cross it.
      const cross = (d) => (d > 0 ? randInt(r, -d + 1, -1) : randInt(r, 1, -d - 1));
      if (Math.abs(dx) < 2 || Math.abs(dz) < 2) return null;
      const crossX = r() < 0.5;
      const x1 = crossX ? cross(dx) : randInt(r, -200, 200);
      const z1 = crossX ? randInt(r, -200, 200) : cross(dz);
      const x2 = x1 + dx;
      const z2 = z1 + dz;
      const wrongAbs = (Math.abs(x2) - Math.abs(x1)) ** 2 + (Math.abs(z2) - Math.abs(z1)) ** 2;
      const swapped = (x1 - z1) ** 2 + (x2 - z2) ** 2;
      if (wrongAbs === 0 || swapped === 0) return null;
      return {
        stem: `🧭 方塊世界用 (x, z) 表示地面上的位置。你的基地在 (${fmtInt(x1)}, ${fmtInt(z1)})，鑽石礦在 (${fmtInt(x2)}, ${fmtInt(z2)})。兩地的直線距離是多少格？`,
        options: [
          OS(sqrtOf(dx * dx + dz * dz)),
          OS(sqrtOf(wrongAbs), 'M-T11a'),
          OS(int(Math.abs(dx) + Math.abs(dz)), 'M-R5a'),
          OS(sqrtOf(swapped), 'M-T11b'),
        ],
      };
    },
  },
];
