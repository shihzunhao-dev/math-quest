// Home: quick actions and the node map.
import { app, esc, topbar, toast } from '../main.js';
import { PACKS } from '../../content/index.js';
import { nodeState, isUnlocked, dueReviews } from '../engine.js';

const codeCount = (p) => Object.values(p.nodes).reduce((n, s) => n + (s.stars >= 2) + (s.stars >= 3), 0);

const starHtml =(n) => [1, 2, 3].map((i) => (i <= n ? '★' : '<span class="off">★</span>')).join('');

export function render(el) {
  const p = app.profile;
  const due = dueReviews(p).length;
  const pack = PACKS[0];
  const pre = p.tests[`${pack.id}/pre`];
  const post = p.tests[`${pack.id}/post`];
  const daysSinceExport = p.lastExport ? (Date.now() - p.lastExport) / 86400000 : Infinity;
  const needBackup = p.attempts.length >= 20 && daysSinceExport > 7;

  let html = topbar(null);
  if (needBackup) {
    html += `<div class="banner">💾 學習紀錄只存在這台平板。記得到 <a href="#/settings">設定</a> 匯出備份。</div>`;
  }
  html += `<div class="actions">
    <button class="action ${due ? 'hot' : ''}" data-go="#/review" ${due ? '' : 'disabled'}>
      <b>📅 今日複習</b><span class="muted">${due ? `${due} 個關卡等你複習` : '目前沒有要複習的'}</span></button>
    <button class="action ${pre ? '' : 'hot'}" data-go="#/test/${pack.id}/${pre ? 'post' : 'pre'}">
      <b>🧭 ${pre ? '後測' : '前測'}</b><span class="muted">${pre ? (post ? '再測一次看看進步' : '練習一陣子後來測測看') : '先測一次，找出起點'}</span></button>
    <button class="action" data-go="#/ach"><b>🏅 成就</b><span class="muted">${Object.keys(p.achievements).length} 個已解鎖</span></button>
    <button class="action" data-go="#/codes"><b>🎟️ 遊戲兌換碼</b><span class="muted">${codeCount(p)} 組可以帶進遊戲</span></button>
    <button class="action" data-go="#/cards"><b>📜 數學史卡片</b><span class="muted">精熟關卡來收集</span></button>
    <button class="action" data-go="#/settings"><b>⚙️ 設定與備份</b><span class="muted">匯出、匯入、換人</span></button>
  </div>`;

  for (const pk of PACKS) {
    html += `<h1>${esc(pk.title)}</h1>`;
    for (const sec of pk.sections) {
      const done = sec.nodes.filter((n) => nodeState(p, pk.id, n).stars >= 2).length;
      html += `<div class="section-title"><h2>${esc(sec.title)}</h2><span class="muted">精熟 ${done}/${sec.nodes.length}</span></div><div class="nodes">`;
      for (const id of sec.nodes) {
        const node = pk.nodes[id];
        const s = nodeState(p, pk.id, id);
        const open = isUnlocked(p, pk, id);
        const need = node.prereqs.filter((pr) => nodeState(p, pk.id, pr).stars < 2).map((pr) => pk.nodes[pr].title);
        html += `<button class="node ${open ? '' : 'locked'} ${s.stars >= 2 ? 'mastered' : ''}" data-go="#/node/${pk.id}/${id}" ${open ? '' : `aria-disabled="true" data-lock="${esc(need.join('、'))}"`}>
          <span class="code">${id}${open ? '' : ' 🔒'}</span>
          <span class="t">${esc(node.title)}</span>
          <span class="stars">${starHtml(s.stars)}</span>
        </button>`;
      }
      html += '</div>';
    }
  }
  html += `<p class="muted" style="margin-top:24px">★ 完成一輪　★★ 連續答對 3 題（精熟）　★★★ 隔天複習也答對</p>`;
  el.innerHTML = html;

  el.querySelectorAll('[data-go]').forEach((b) =>
    b.addEventListener('click', () => {
      if (b.dataset.lock) {
        toast(`🔒 先精熟：${b.dataset.lock}`);
        return;
      }
      location.hash = b.dataset.go;
    }),
  );
}
