// Question sessions: practice rounds, daily review, pre/post tests.
import { app, esc, topbar, announce, toast, go } from '../main.js';
import { getPack } from '../../content/index.js';
import { makeQuestion, recordAnswer, dueReviews, RULES, testNodes, isUnlocked } from '../engine.js';
import { renderMath } from '../mathfmt.js';
import { inputBlock, bindInput } from './keypad.js';
import { feedbackHtml } from './feedback.js';
import { roundSummary, reviewSummary, testSummary } from './summary.js';
import * as proof from './proof.js';

export function practice(el, packId, nodeId) {
  const pack = getPack(packId);
  const node = pack?.nodes[nodeId];
  const p = app.profile;
  if (!node || !isUnlocked(p, pack, nodeId)) return go('#/home');
  if (node.intro === 'proof' && !p.proofDone) {
    return proof.render(el, { onDone: () => practice(el, packId, nodeId) });
  }
  const items = Array.from({ length: RULES.roundSize }, () => ({ pack, nodeId }));
  runSession(el, {
    title: `${nodeId}　${node.title}`,
    sub: node.intro === 'proof' ? '<a href="#/proof">🧩 再玩一次拼圖證明</a>' : '',
    mode: 'practice',
    items,
    onEnd: (results) => roundSummary(el, pack, nodeId, results),
  });
}

export function review(el) {
  const due = dueReviews(app.profile).slice(0, 10);
  if (!due.length) return go('#/home');
  runSession(el, {
    title: '📅 今日複習',
    mode: 'review',
    items: due.map((d) => ({ pack: getPack(d.pack), nodeId: d.node })),
    onEnd: (results) => reviewSummary(el, results),
  });
}

export function test(el, packId, mode) {
  const pack = getPack(packId);
  if (!pack || !['pre', 'post'].includes(mode)) return go('#/home');
  const items = testNodes(pack).map((nodeId) => ({ pack, nodeId }));
  const name = mode === 'pre' ? '前測' : '後測';
  el.innerHTML = `${topbar()}<div class="card">
    <h1>🧭 ${name}</h1>
    <p>共 ${items.length} 題，每個關卡一題，用來找出你已經會的和還需要加強的地方。</p>
    <p>不會的題目請按「<b>還沒學過／不會</b>」，<b>不要用猜的</b>，結果才準。</p>
    <p class="muted">${mode === 'pre' ? '前測答對的關卡，之後只要再答對 1 題就能精熟。' : '做完會和前測的結果並排比較。'}作答時不會顯示對錯。</p>
    <div class="row" style="margin-top:12px"><button class="btn big" id="start">開始${name}</button></div></div>`;
  el.querySelector('#start').addEventListener('click', () =>
    runSession(el, { title: `🧭 ${name}`, mode, items, onEnd: (results) => testSummary(el, pack, mode, results) }),
  );
}

function runSession(el, cfg) {
  const results = [];
  let i = 0;
  const next = () => {
    if (i >= cfg.items.length) return cfg.onEnd(results);
    showQuestion(el, cfg, cfg.items[i], i, results, () => {
      i++;
      next();
    });
  };
  next();
}

function showQuestion(el, cfg, item, idx, results, done) {
  const p = app.profile;
  const { pack, nodeId } = item;
  const node = pack.nodes[nodeId];
  const isTest = cfg.mode === 'pre' || cfg.mode === 'post';
  let made;
  try {
    made = makeQuestion(p, pack, nodeId);
  } catch (e) {
    console.error(e);
    toast('這一題產生失敗，已略過。');
    results.push({ node: nodeId, skipped: true });
    return done();
  }
  const { q, tpl, seed } = made;
  if (location.search.includes('debug')) window.__pqQ = q; // test hook only
  const dots = cfg.items
    .map((_, k) => {
      if (k === idx) return '<i class="now"></i>';
      if (k > idx) return '<i></i>';
      if (isTest) return '<i style="background:var(--primary-soft)"></i>';
      return `<i class="${results[k]?.correct ? 'ok' : 'no'}"></i>`;
    })
    .join('');
  const sub = cfg.mode === 'practice' ? cfg.sub || '' : `<span class="muted">${nodeId}　${esc(node.title)}</span>`;
  const optsHtml =
    q.kind === 'input'
      ? inputBlock()
      : `<div class="opts">${q.options.map((o, i) => `<button class="opt" data-i="${i}">${renderMath(o.tex)}</button>`).join('')}</div>` +
        (isTest ? `<div class="row" style="margin-top:12px"><button class="btn ghost" id="dunno">還沒學過／不會</button></div>` : '');

  el.innerHTML = `${topbar(isTest ? '#/home' : '#/home', '‹ 離開')}
    <h2 style="margin-top:0">${cfg.title}</h2>${sub}
    <div class="progress">${dots}</div>
    <div class="card">
      <div class="stem">${renderMath(q.stem)}</div>
      ${q.figure || ''}
      ${optsHtml}
      <div id="fb"></div>
    </div>`;

  const ctx = {
    pack: pack.id, node: nodeId, tpl, seed, mode: cfg.mode,
    trapCodes: q.kind === 'input' ? q.traps.map((t) => t.mis) : q.options.filter((o) => o.mis).map((o) => o.mis),
  };
  const correctTex = q.kind === 'input' ? q.answer.tex : q.options.find((o) => o.mis === null).tex;

  const finish = (res, btn) => {
    const events = recordAnswer(p, ctx, res);
    results.push({ node: nodeId, correct: res.correct, mis: res.mis || null });
    app.save();
    announce(events);
    if (isTest) {
      if (btn) btn.classList.add('picked');
      setTimeout(done, 300);
      return;
    }
    el.querySelector('#fb').innerHTML = feedbackHtml({ res, correctTex, events, pack, nodeId, p }) +
      `<div class="next-row"><button class="btn big" id="next">${idx + 1 < cfg.items.length ? '下一題 ›' : '看結果 ›'}</button></div>`;
    const nextBtn = el.querySelector('#next');
    nextBtn.addEventListener('click', done);
    nextBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  if (q.kind === 'input') {
    bindInput(el, q, (res) => finish(res));
    return;
  }
  el.querySelectorAll('.opt').forEach((btn) =>
    btn.addEventListener('click', () => {
      el.querySelectorAll('.opt, #dunno').forEach((b) => (b.disabled = true));
      const opt = q.options[Number(btn.dataset.i)];
      const correct = opt.mis === null;
      if (!isTest) {
        btn.classList.add(correct ? 'right' : 'wrong');
        if (!correct) el.querySelectorAll('.opt').forEach((b) => q.options[Number(b.dataset.i)].mis === null && b.classList.add('right'));
      }
      finish({ correct, mis: opt.mis }, btn);
    }),
  );
  el.querySelector('#dunno')?.addEventListener('click', (e) => {
    el.querySelectorAll('.opt, #dunno').forEach((b) => (b.disabled = true));
    finish({ correct: false, mis: null, note: 'dunno' }, e.currentTarget);
  });
}
