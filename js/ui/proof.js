// T1 interactive proof: four congruent right triangles rearranged inside an (a+b) square.
// Arrangement A leaves a tilted c×c square uncovered; arrangement B leaves an a×a and a b×b square.
import { app, topbar, announce, go } from '../main.js';
import { checkAchievements } from '../engine.js';

// each triangle: right-angle vertex R and direction θ (degrees, screen coords) of its a-leg; b-leg is θ+90°
function arrangements(a, b) {
  const n = a + b;
  return {
    A: [[0, 0, 0], [n, 0, 90], [n, n, 180], [0, n, 270]],
    B: [[0, a, 0], [n, 0, 90], [a, a, 270], [a, n, 180]],
  };
}

function triPoints([x, y, th], a, b) {
  const t = (th * Math.PI) / 180;
  const u = [Math.cos(t), Math.sin(t)];
  const v = [-Math.sin(t), Math.cos(t)];
  return [[x, y], [x + a * u[0], y + a * u[1]], [x + b * v[0], y + b * v[1]]];
}

function lerpTri(p, q, k) {
  let d = q[2] - p[2];
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + d * k];
}

export function render(el, { onDone = null, standalone = false } = {}) {
  let a = 3;
  let b = 4;
  let state = 'A';
  let seen = new Set(['A']);
  let anim = null;

  el.innerHTML = `${topbar('#/home', '‹ 回地圖')}
    <h2 style="margin-top:0">🧩 拼圖證明：a² + b² = c²</h2>
    <div class="proof-wrap proof">
      <div class="card"><svg id="pf" viewBox="-0.6 -0.6 8.2 8.2"></svg>
        <div class="row" style="margin-top:10px"><button class="btn big" id="swap">重新排列 ↻</button></div>
      </div>
      <div class="card">
        <p>大正方形的邊長是 <b>a + b</b>，裡面放了 <b>4 個一樣的直角三角形</b>（兩股 a、b，斜邊 c）。</p>
        <p>按「重新排列」，看看三角形移動後，<b>藍色（沒被蓋住）的部分</b>變成什麼。</p>
        <div class="slider-row"><span>a = <b id="av">3</b></span><input type="range" id="ar" min="1" max="6" step="1" value="3"></div>
        <div class="slider-row"><span>b = <b id="bv">4</b></span><input type="range" id="br" min="1" max="6" step="1" value="4"></div>
        <div id="explain"></div>
      </div>
    </div>`;

  const svg = el.querySelector('#pf');
  const explain = el.querySelector('#explain');

  function draw(tris) {
    const n = a + b;
    const s = 7 / n; // scale into the 7-unit viewBox
    const P = (pt) => `${(pt[0] * s).toFixed(3)},${(pt[1] * s).toFixed(3)}`;
    const k = anim ? anim.k : 1;
    const showA = state === 'A' && k >= 1;
    const showB = state === 'B' && k >= 1;
    let h = `<rect class="area" x="0" y="0" width="7" height="7"/>`;
    h += tris.map((t) => `<polygon class="tri" points="${triPoints(t, a, b).map(P).join(' ')}"/>`).join('');
    h += `<rect class="frame" x="0" y="0" width="7" height="7"/>`;
    h += `<text class="alabel" x="3.5" y="3.6" text-anchor="middle" style="opacity:${showA ? 1 : 0}">c²</text>`;
    h += `<text class="alabel" x="${((a / 2) * s).toFixed(2)}" y="${((a / 2) * s + 0.25).toFixed(2)}" text-anchor="middle" style="opacity:${showB ? 1 : 0}">a²</text>`;
    h += `<text class="alabel" x="${((a + b / 2) * s).toFixed(2)}" y="${((a + b / 2) * s + 0.25).toFixed(2)}" text-anchor="middle" style="opacity:${showB ? 1 : 0}">b²</text>`;
    h += `<text class="alabel" x="${((a / 2) * s).toFixed(2)}" y="-0.15" text-anchor="middle">a</text>`;
    h += `<text class="alabel" x="${((a + b / 2) * s).toFixed(2)}" y="-0.15" text-anchor="middle">b</text>`;
    svg.innerHTML = h;
  }

  function still() {
    draw(arrangements(a, b)[state]);
    const both = seen.has('A') && seen.has('B');
    explain.innerHTML =
      (state === 'A'
        ? `<p>現在沒被蓋住的是一個<b>斜放的正方形</b>，邊長是 c，面積是 <b>c²</b>。</p>`
        : `<p>現在沒被蓋住的是<b>兩個正方形</b>，面積分別是 <b>a²</b> 和 <b>b²</b>。</p>`) +
      (both
        ? `<p>兩次都是同一個大正方形、同樣 4 個三角形，所以剩下的面積一定相等：</p>
           <p style="font-size:1.5rem;text-align:center"><b>a² + b² = c²</b></p>
           <p class="muted">拉拉看上面的 a、b，不管怎麼變都成立。</p>
           <button class="btn big" id="got">我看懂了 ✔</button>`
        : '<p class="muted">再按一次「重新排列」比較看看。</p>');
    explain.querySelector('#got')?.addEventListener('click', finish);
  }

  function swap() {
    if (anim) return;
    const from = arrangements(a, b)[state];
    state = state === 'A' ? 'B' : 'A';
    seen.add(state);
    const to = arrangements(a, b)[state];
    const t0 = performance.now();
    anim = { k: 0 };
    const step = (now) => {
      const raw = Math.min(1, (now - t0) / 1200);
      const k = raw < 0.5 ? 2 * raw * raw : 1 - (-2 * raw + 2) ** 2 / 2;
      anim.k = raw;
      draw(from.map((f, i) => lerpTri(f, to[i], k)));
      if (raw < 1) requestAnimationFrame(step);
      else {
        anim = null;
        still();
      }
    };
    requestAnimationFrame(step);
  }

  function finish() {
    const p = app.profile;
    if (!p.proofDone) {
      p.proofDone = true;
      announce(checkAchievements(p));
      app.save();
    }
    if (onDone) onDone();
    else go(standalone ? '#/home' : '#/home');
  }

  el.querySelector('#swap').addEventListener('click', swap);
  const bindSlider = (id, label, set) =>
    el.querySelector(id).addEventListener('input', (e) => {
      set(Number(e.target.value));
      el.querySelector(label).textContent = e.target.value;
      if (!anim) still();
    });
  bindSlider('#ar', '#av', (v) => (a = v));
  bindSlider('#br', '#bv', (v) => (b = v));
  still();
}
