// Feedback after a practice/review answer.
import { esc } from '../main.js';
import { renderMath } from '../mathfmt.js';
import { nodeState } from '../engine.js';
import { codeFor, REWARD_TEXT } from '../codes.js';

export const codeBox = (nodeId, star) =>
  `<div class="redeem"><span class="muted">🎟️ 遊戲兌換碼（${REWARD_TEXT[star]}）</span><b class="code">${codeFor(nodeId, star)}</b></div>`;

export function feedbackHtml({ res, correctTex, events, pack, nodeId, p }) {
  const node = pack.nodes[nodeId];
  const xp = events.filter((e) => e.type === 'xp').reduce((s, e) => s + e.n, 0);
  let html = '';
  if (res.correct) {
    html += `<div class="fb good"><h3>🟢 答對了！${xp ? `　+${xp} XP` : ''}</h3>`;
    if (res.note === 'simplify') html += `<p>答案正確，不過還可以化成最簡根式：<b>${renderMath(toMarkup(correctTex))}</b>。</p>`;
    if (events.some((e) => e.type === 'trap')) html += '<p>🕵️ 這題的陷阱裡，有你以前掉進去過的，這次你識破了！</p>';
    html += '</div>';
  } else {
    const text = res.mis ? pack.misconceptions[res.mis] : '再檢查一次計算過程。';
    html += `<div class="fb bad"><h3>${res.mis ? '🟡 這是一個常見的陷阱' : '🔴 不對喔'}</h3>
      <p>${esc(text)}</p>
      <p>正確答案：<b>${renderMath(toMarkup(correctTex))}</b></p></div>`;
  }
  if (events.some((e) => e.type === 'help')) {
    const links = node.junyi.map((j) => `<li><a href="${j.url}" target="_blank" rel="noopener">${esc(j.title)}</a></li>`).join('');
    const weak = node.prereqs
      .map((id) => ({ id, s: nodeState(p, pack.id, id).stars }))
      .sort((a, b) => a.s - b.s)
      .map(({ id }) => `<a href="#/node/${pack.id}/${id}">${id} ${esc(pack.nodes[id].title)}</a>`)
      .join('、');
    html += `<div class="help"><b>卡住了嗎？</b>
      ${links ? `<p>看看均一的教學影片（會開新分頁）：</p><ul>${links}</ul>` : node.hint ? `<p>${esc(node.hint)}</p>` : ''}
      ${weak ? `<p>或先回去練習：${weak}</p>` : ''}</div>`;
  }
  if (events.some((e) => e.type === 'mastered')) {
    html += `<div class="celebrate">🎉 精熟！「${esc(node.title)}」拿到 ★★${codeBox(nodeId, 2)}</div>`;
  }
  if (events.some((e) => e.type === 'star3')) {
    html += `<div class="celebrate">🌟 三顆星！隔了一段時間還記得，記得很牢。${codeBox(nodeId, 3)}</div>`;
  }
  return html;
}

// plain answers like "2√5" (from input questions) need markup braces
const toMarkup = (s) => (s.includes('√{') ? s : s.replace(/√(\d+)/g, '√{$1}'));
