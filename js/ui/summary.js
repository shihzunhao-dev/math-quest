// End-of-session screens.
import { app, esc, topbar, announce, go } from '../main.js';
import { getPack } from '../../content/index.js';
import { finishRound, finishTest, nodeState, isUnlocked, RULES, testNodes } from '../engine.js';
import { codeBox } from './feedback.js';

export function roundSummary(el, pack, nodeId, results) {
  const p = app.profile;
  announce(finishRound(p, pack.id, nodeId));
  app.save();
  const node = pack.nodes[nodeId];
  const s = nodeState(p, pack.id, nodeId);
  const right = results.filter((r) => r.correct).length;
  const opened = Object.values(pack.nodes)
    .filter((n) => n.prereqs.includes(nodeId) && isUnlocked(p, pack, n.id) && nodeState(p, pack.id, n.id).stars < 2)
    .map((n) => `<a class="btn secondary" href="#/node/${pack.id}/${n.id}">${n.id} ${esc(n.title)} ›</a>`)
    .join('');
  const status =
    s.stars >= 2
      ? `<p>🎉 已精熟，拿到 ${'★'.repeat(s.stars)}。${s.stars === 2 ? '明天回來複習，就能拿到第三顆星和加倍的兌換碼。' : ''}</p>${codeBox(nodeId, 2)}${s.stars >= 3 ? codeBox(nodeId, 3) : ''}`
      : `<p>再<b>連續答對 ${RULES.masterStreak - s.streak} 題</b>就精熟，精熟就能拿到遊戲兌換碼。</p>`;
  el.innerHTML = `${topbar()}<div class="card">
    <h1>${esc(node.title)}：這一輪答對 ${right}/${results.length}</h1>
    ${status}
    <div class="row" style="margin-top:12px">
      <button class="btn big" id="again">再練一輪</button>
      <a class="btn ghost big" href="#/home">回地圖</a>
    </div>
    ${opened ? `<h2>新解鎖的關卡</h2><div class="row">${opened}</div>` : ''}
  </div>`;
  el.querySelector('#again').addEventListener('click', () => go(`#/node/${pack.id}/${nodeId}`));
}

export function reviewSummary(el, results) {
  const right = results.filter((r) => r.correct).length;
  const pack = getPack('ch8a-2');
  const rows = results
    .map((r) => `<tr><td>${r.node} ${esc(pack.nodes[r.node]?.title || '')}</td><td>${r.correct ? '<span class="ok-mark">🟢 記得</span>' : '<span class="no-mark">🔴 明天再複習</span>'}</td></tr>`)
    .join('');
  el.innerHTML = `${topbar()}<div class="card"><h1>今日複習完成：${right}/${results.length}</h1>
    <table class="result-table">${rows}</table>
    <p class="muted">答對的關卡，下次複習的間隔會拉長；答錯的明天會再出現。</p>
    <div class="row" style="margin-top:12px"><a class="btn big" href="#/home">回地圖</a></div></div>`;
}

export function testSummary(el, pack, mode, results) {
  const p = app.profile;
  announce(finishTest(p, pack.id, mode, results));
  app.save();
  const pre = mode === 'post' ? p.tests[`${pack.id}/pre`] : null;
  const preOk = (node) => pre?.results.find((r) => r.node === node)?.correct;
  const mark = (ok) => (ok ? '<span class="ok-mark">🟢</span>' : '<span class="no-mark">🔴</span>');
  let rows = '';
  for (const sec of pack.sections) {
    rows += `<tr><th colspan="3">${esc(sec.title)}</th></tr>`;
    for (const id of sec.nodes) {
      const r = results.find((x) => x.node === id);
      rows += `<tr><td>${id} ${esc(pack.nodes[id].title)}</td>${pre ? `<td>${mark(preOk(id))}</td>` : ''}<td>${mark(r?.correct)}</td></tr>`;
    }
  }
  const n = results.filter((r) => r.correct).length;
  const nPre = pre ? pre.results.filter((r) => r.correct).length : 0;
  el.innerHTML = `${topbar()}<div class="card">
    <h1>${mode === 'pre' ? '前測結果' : '後測結果'}：${n}/${testNodes(pack).length}</h1>
    ${pre ? `<p>前測 ${nPre} 題 → 後測 ${n} 題（${n - nPre >= 0 ? '+' : ''}${n - nPre}）</p>` : '<p>答對的關卡，之後只要再答對 1 題就能精熟；🔴 的關卡就是接下來要加強的地方。</p>'}
    <table class="result-table"><tr><th>關卡</th>${pre ? '<th>前測</th>' : ''}<th>${mode === 'pre' ? '結果' : '後測'}</th></tr>${rows}</table>
    <div class="row" style="margin-top:12px"><a class="btn big" href="#/home">回地圖</a><a class="btn ghost" href="#/report">看學習報告</a></div></div>`;
}
