// SVG figures drawn from question parameters. Math coordinates are y-up; the
// scene is auto-fitted into the viewBox.

const W = 320;
const H = 230;
const PAD = 30;

function fit(points, w = W, h = H, pad = PAD) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const s = Math.min((w - 2 * pad) / (maxX - minX || 1), (h - 2 * pad) / (maxY - minY || 1));
  const ox = (w - (maxX - minX) * s) / 2;
  const oy = (h - (maxY - minY) * s) / 2;
  const T = ([x, y]) => [ox + (x - minX) * s, h - oy - (y - minY) * s];
  return { T, s };
}

const f = (n) => n.toFixed(1);
const ptsAttr = (pts) => pts.map((p) => `${f(p[0])},${f(p[1])}`).join(' ');
const escText = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function sideLabel(T, p, q, away, text, dist = 16) {
  const [x1, y1] = T(p);
  const [x2, y2] = T(q);
  const [ax, ay] = T(away);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  let nx = -(y2 - y1);
  let ny = x2 - x1;
  const len = Math.hypot(nx, ny) || 1;
  nx /= len;
  ny /= len;
  if ((ax - mx) * nx + (ay - my) * ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  return textAt(mx + nx * dist, my + ny * dist, text);
}

const textAt = (x, y, text, cls = 'lbl') =>
  `<text class="${cls}" x="${f(x)}" y="${f(y)}" text-anchor="middle" dominant-baseline="middle">${escText(text)}</text>`;

function rightMark(T, v, a, b, size = 11) {
  const [vx, vy] = T(v);
  const unit = (p) => {
    const [x, y] = T(p);
    const l = Math.hypot(x - vx, y - vy) || 1;
    return [((x - vx) / l) * size, ((y - vy) / l) * size];
  };
  const [ux, uy] = unit(a);
  const [wx, wy] = unit(b);
  return `<polyline class="ra" points="${f(vx + ux)},${f(vy + uy)} ${f(vx + ux + wx)},${f(vy + uy + wy)} ${f(vx + wx)},${f(vy + wy)}"/>`;
}

const svg = (body, w = W, h = H) =>
  `<svg class="fig" viewBox="0 0 ${w} ${h}" role="img" aria-label="題目附圖">${body}</svg>`;

const centroid = (pts) => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];

// Right triangle with legs a (horizontal) and b (vertical). Labels are plain strings or null.
export function rightTri({ a, b, labA, labB, labC, flip = false, altitude = null, vertexNames = null }) {
  const sx = flip ? -1 : 1;
  const R = [0, 0];
  const A = [sx * a, 0];
  const B = [0, b];
  const { T } = fit([R, A, B]);
  const c = centroid([R, A, B]);
  let body = `<polygon class="shape" points="${ptsAttr([R, A, B].map(T))}"/>`;
  body += rightMark(T, R, A, B);
  if (labA != null) body += sideLabel(T, R, A, c, labA);
  if (labB != null) body += sideLabel(T, R, B, c, labB);
  if (labC != null) body += sideLabel(T, A, B, c, labC);
  if (altitude) {
    const t = (a * a) / (a * a + b * b);
    const foot = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
    body += `<line class="dash" x1="${f(T(R)[0])}" y1="${f(T(R)[1])}" x2="${f(T(foot)[0])}" y2="${f(T(foot)[1])}"/>`;
    body += rightMark(T, foot, R, A, 8);
    const m = T([(R[0] + foot[0]) / 2, (R[1] + foot[1]) / 2]);
    body += textAt(m[0] + (flip ? 12 : -12), m[1] - 8, altitude);
  }
  if (vertexNames) {
    [R, A, B].forEach((p, i) => {
      const [x, y] = T(p);
      const [cx, cy] = T(c);
      const l = Math.hypot(x - cx, y - cy) || 1;
      body += textAt(x + ((x - cx) / l) * 14, y + ((y - cy) / l) * 14, vertexNames[i], 'vn');
    });
  }
  return svg(body);
}

export function rectDiag({ w, h, labW, labH, labD }) {
  const P = [[0, 0], [w, 0], [w, h], [0, h]];
  const { T } = fit(P);
  const c = centroid(P);
  let body = `<polygon class="shape" points="${ptsAttr(P.map(T))}"/>`;
  body += `<line class="diag" x1="${f(T(P[0])[0])}" y1="${f(T(P[0])[1])}" x2="${f(T(P[2])[0])}" y2="${f(T(P[2])[1])}"/>`;
  body += rightMark(T, P[1], P[0], P[2]);
  body += sideLabel(T, P[0], P[1], c, labW);
  body += sideLabel(T, P[1], P[2], c, labH);
  const m = T([w / 2, h / 2]);
  body += textAt(m[0] - 14, m[1] - 12, labD);
  return svg(body);
}

// T4: AB ⊥ BC, AC ⊥ CD
export function twoTri({ a, b, d, labAB, labBC, labCD, labAD }) {
  const B = [0, 0];
  const A = [0, a];
  const C = [b, 0];
  const c = Math.hypot(a, b);
  const D = [C[0] + (a / c) * d, C[1] + (b / c) * d];
  const { T } = fit([A, B, C, D]);
  const g = centroid([A, B, C, D]);
  let body = `<polygon class="shape" points="${ptsAttr([A, B, C].map(T))}"/>`;
  body += `<polygon class="shape alt" points="${ptsAttr([A, C, D].map(T))}"/>`;
  body += rightMark(T, B, A, C) + rightMark(T, C, A, D);
  body += sideLabel(T, A, B, C, labAB) + sideLabel(T, B, C, A, labBC);
  body += sideLabel(T, C, D, A, labCD) + sideLabel(T, A, D, C, labAD);
  [['A', A], ['B', B], ['C', C], ['D', D]].forEach(([n, p]) => {
    const [x, y] = T(p);
    const [cx, cy] = T(g);
    const l = Math.hypot(x - cx, y - cy) || 1;
    body += textAt(x + ((x - cx) / l) * 14, y + ((y - cy) / l) * 14, n, 'vn');
  });
  return svg(body);
}

export function equilateral({ labSide, labH = null }) {
  const P = [[0, 0], [2, 0], [1, Math.sqrt(3)]];
  const { T } = fit(P);
  const c = centroid(P);
  let body = `<polygon class="shape" points="${ptsAttr(P.map(T))}"/>`;
  if (labSide != null) body += sideLabel(T, P[0], P[1], c, labSide);
  if (labH != null) {
    const top = T(P[2]);
    const foot = T([1, 0]);
    body += `<line class="dash" x1="${f(top[0])}" y1="${f(top[1])}" x2="${f(foot[0])}" y2="${f(foot[1])}"/>`;
    body += rightMark(T, [1, 0], [2, 0], P[2], 8);
    body += textAt(foot[0] + 14, (top[1] + foot[1]) / 2, labH);
  }
  return svg(body);
}

// T7: right triangle with squares or equilateral triangles on both legs
export function shapesOnLegs({ labC, type }) {
  const R = [0, 0];
  const A = [4, 0];
  const B = [0, 3];
  const extra =
    type === 'square'
      ? [[[0, 0], [4, 0], [4, -4], [0, -4]], [[0, 0], [0, 3], [-3, 3], [-3, 0]]]
      : [[[0, 0], [4, 0], [2, -2 * Math.sqrt(3)]], [[0, 0], [0, 3], [-1.5 * Math.sqrt(3), 1.5]]];
  const { T } = fit([R, A, B, ...extra.flat()]);
  let body = extra.map((p) => `<polygon class="shape fill" points="${ptsAttr(p.map(T))}"/>`).join('');
  body += `<polygon class="shape" points="${ptsAttr([R, A, B].map(T))}"/>`;
  body += rightMark(T, R, A, B);
  body += sideLabel(T, A, B, R, labC);
  return svg(body);
}

export function ladder({ labL, labF, labH }) {
  const R = [0, 0];
  const Fp = [3, 0];
  const Tp = [0, 4];
  const { T } = fit([R, Fp, Tp, [-0.6, 0], [0, 4.6], [4, 0]]);
  const c = centroid([R, Fp, Tp]);
  const g0 = T([-0.6, 0]);
  const g1 = T([4, 0]);
  const w0 = T([0, 0]);
  const w1 = T([0, 4.6]);
  let body = `<line class="ground" x1="${f(g0[0])}" y1="${f(g0[1])}" x2="${f(g1[0])}" y2="${f(g1[1])}"/>`;
  body += `<line class="wall" x1="${f(w0[0])}" y1="${f(w0[1])}" x2="${f(w1[0])}" y2="${f(w1[1])}"/>`;
  const a = T(Fp);
  const b = T(Tp);
  body += `<line class="ladder" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"/>`;
  body += rightMark(T, R, Fp, Tp);
  body += sideLabel(T, Fp, Tp, R, labL) + sideLabel(T, R, Fp, c, labF) + sideLabel(T, R, Tp, c, labH);
  return svg(body);
}

export function walk({ a, b, labA, labB }) {
  const O = [0, 0];
  const E = [a, 0];
  const N = [a, b];
  const { T } = fit([O, E, N]);
  const c = centroid([O, E, N]);
  const p = [O, E, N].map(T);
  let body = `<polyline class="path" points="${ptsAttr(p)}"/>`;
  body += `<line class="dash" x1="${f(p[0][0])}" y1="${f(p[0][1])}" x2="${f(p[2][0])}" y2="${f(p[2][1])}"/>`;
  body += rightMark(T, E, O, N);
  body += sideLabel(T, O, E, c, labA) + sideLabel(T, E, N, c, labB) + sideLabel(T, O, N, E, '?');
  body += textAt(p[0][0] - 4, p[0][1] + 16, '家', 'vn') + textAt(p[2][0] + 4, p[2][1] - 14, '學校', 'vn');
  return svg(body);
}

// T1 static: big square with four triangles and the tilted inner square
export function proofSquare({ a, b }) {
  const n = a + b;
  const outer = [[0, 0], [n, 0], [n, n], [0, n]];
  const inner = [[a, 0], [n, a], [b, n], [0, b]];
  const { T } = fit(outer);
  let body = `<polygon class="shape tri-fill" points="${ptsAttr(outer.map(T))}"/>`;
  body += `<polygon class="shape inner" points="${ptsAttr(inner.map(T))}"/>`;
  const c = [n / 2, n / 2];
  body += sideLabel(T, [0, 0], [a, 0], c, String(a), 14) + sideLabel(T, [a, 0], [n, 0], c, String(b), 14);
  body += sideLabel(T, [n, 0], [n, a], c, String(a), 14) + sideLabel(T, [n, a], [n, n], c, String(b), 14);
  const m = T(c);
  body += textAt(m[0], m[1], '?', 'lbl big');
  return svg(body);
}

export function numberLine({ p, q }) {
  const c = Math.hypot(p, q);
  const maxX = Math.ceil(c) + 1;
  const P0 = [0, 0];
  const P1 = [p, 0];
  const P2 = [p, q];
  const { T, s } = fit([[-1, 0], [maxX, 0], P2, [0, c]], W, H, 26);
  const a0 = T([-1, 0]);
  const a1 = T([maxX, 0]);
  let body = `<line class="axis" x1="${f(a0[0])}" y1="${f(a0[1])}" x2="${f(a1[0])}" y2="${f(a1[1])}"/>`;
  for (let i = -1; i <= maxX; i++) {
    const [x, y] = T([i, 0]);
    body += `<line class="tick" x1="${f(x)}" y1="${f(y - 5)}" x2="${f(x)}" y2="${f(y + 5)}"/>` + textAt(x, y + 16, String(i), 'tk');
  }
  body += `<polygon class="shape" points="${ptsAttr([P0, P1, P2].map(T))}"/>`;
  body += rightMark(T, P1, P0, P2);
  // leg on the axis: label inside the triangle so it does not collide with tick numbers
  const mid = T([p / 2, 0]);
  body += textAt(mid[0], mid[1] - 12, String(p)) + sideLabel(T, P1, P2, P0, String(q));
  const r = c * s;
  const [ox, oy] = T(P0);
  const [ex, ey] = T(P2);
  const [px, py] = T([c, 0]);
  body += `<path class="arc" d="M ${f(ex)} ${f(ey)} A ${f(r)} ${f(r)} 0 0 1 ${f(px)} ${f(py)}"/>`;
  body += `<circle class="dot" cx="${f(px)}" cy="${f(py)}" r="4"/>` + textAt(px, py - 14, 'P', 'vn');
  body += `<circle class="dot" cx="${f(ox)}" cy="${f(oy)}" r="3"/>`;
  return svg(body);
}

export function grid({ points }) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const x0 = Math.min(0, ...xs) - 1;
  const x1 = Math.max(0, ...xs) + 1;
  const y0 = Math.min(0, ...ys) - 1;
  const y1 = Math.max(0, ...ys) + 1;
  const { T } = fit([[x0, y0], [x1, y1]], W, H, 18);
  let body = '';
  for (let x = x0; x <= x1; x++) {
    const a = T([x, y0]);
    const b = T([x, y1]);
    body += `<line class="${x === 0 ? 'axis' : 'gl'}" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"/>`;
  }
  for (let y = y0; y <= y1; y++) {
    const a = T([x0, y]);
    const b = T([x1, y]);
    body += `<line class="${y === 0 ? 'axis' : 'gl'}" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"/>`;
  }
  const o = T([0, 0]);
  body += textAt(o[0] - 8, o[1] + 10, 'O', 'tk');
  for (const p of points) {
    const [x, y] = T([p.x, p.y]);
    body += `<circle class="dot" cx="${f(x)}" cy="${f(y)}" r="4.5"/>` + textAt(x, y - 14, p.label, 'vn');
  }
  return svg(body);
}
