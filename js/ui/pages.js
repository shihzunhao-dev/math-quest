// Profiles, achievements, history cards, settings/backup, learning report.
import { app, esc, topbar, toast, go } from '../main.js';
import { PACKS } from '../../content/index.js';
import { ACHIEVEMENTS, unlockedCards, nodeState } from '../engine.js';
import { newProfile, exportProfile, parseImport, requestPersist } from '../store.js';

export function profiles(el) {
  const list = Object.values(app.state.profiles);
  el.innerHTML = `<div class="card" style="max-width:620px;margin:40px auto">
    <h1>📐 根號與畢氏闖關</h1>
    <p class="muted">康軒八上第二章：平方根與畢氏定理</p>
    ${list.length ? `<h2>選擇你的紀錄</h2><div class="row">${list.map((p) => `<button class="btn secondary big" data-id="${p.id}">${esc(p.name)}</button>`).join('')}</div>` : ''}
    <h2>${list.length ? '或建立新的' : '先取一個名字'}</h2>
    <p class="muted">名字只存在這台平板裡，不會上傳。</p>
    <div class="row"><input type="text" id="nm" maxlength="20" placeholder="例如：小畢" autocomplete="off">
    <button class="btn big" id="mk">開始</button></div>
    <p class="muted" style="margin-top:16px">已經有匯出的紀錄檔？<a href="#/settings" id="imp">到設定匯入</a></p>
  </div>`;
  el.querySelectorAll('[data-id]').forEach((b) =>
    b.addEventListener('click', () => {
      app.state.current = b.dataset.id;
      app.save();
      go('#/home');
    }),
  );
  const create = () => {
    const name = el.querySelector('#nm').value.trim();
    if (!name) return toast('先輸入一個名字');
    const p = newProfile(name);
    app.state.profiles[p.id] = p;
    app.state.current = p.id;
    app.save();
    requestPersist();
    go('#/home');
  };
  el.querySelector('#mk').addEventListener('click', create);
  el.querySelector('#nm').addEventListener('keydown', (e) => e.key === 'Enter' && create());
  el.querySelector('#imp').addEventListener('click', (e) => {
    if (!app.profile) {
      e.preventDefault();
      importFlow();
    }
  });
}

export function achievements(el) {
  const p = app.profile;
  el.innerHTML = `${topbar()}<h1>🏅 成就</h1><p class="muted">每個成就都和「學會」有關，不比快、不比多。</p>
    <div class="grid2">${ACHIEVEMENTS.map((a) => `<div class="card ach ${p.achievements[a.id] ? '' : 'off'}">
      <div class="icon">${a.icon}</div><div><b>${esc(a.title)}</b><br><span class="muted">${esc(a.desc)}</span></div></div>`).join('')}</div>`;
}

export function cards(el) {
  const p = app.profile;
  let html = `${topbar()}<h1>📜 數學史卡片</h1>`;
  for (const pack of PACKS) {
    const got = new Set(unlockedCards(p, pack).map((c) => c.id));
    html += `<p class="muted">已收集 ${got.size}/${pack.cards.length}</p><div class="grid2">`;
    for (const c of pack.cards) {
      const how = c.unlock.proof ? '完成拼圖證明' : `精熟「${pack.nodes[c.unlock.node].title}」`;
      html += got.has(c.id)
        ? `<div class="card"><h2 style="margin-top:0">${esc(c.title)}</h2><p>${esc(c.text)}</p></div>`
        : `<div class="card ach off"><div class="icon">🔒</div><div><b>？？？</b><br><span class="muted">${esc(how)}後解鎖</span></div></div>`;
    }
    html += '</div>';
  }
  el.innerHTML = html;
}

function importFlow() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    try {
      const p = parseImport(await file.text());
      const exists = app.state.profiles[p.id];
      app.state.profiles[p.id] = p;
      app.state.current = p.id;
      app.save();
      toast(exists ? `已用檔案裡的紀錄覆蓋「${esc(p.name)}」` : `已匯入「${esc(p.name)}」`);
      go('#/home');
    } catch (e) {
      toast(`匯入失敗：${esc(e.message)}`, 4000);
    }
  });
  input.click();
}

export async function settings(el) {
  const p = app.profile;
  if (!p) return importFlow();
  const persisted = await requestPersist();
  el.innerHTML = `${topbar()}<h1>⚙️ 設定與備份</h1>
    <div class="card"><h2 style="margin-top:0">💾 備份學習紀錄</h2>
      <p>紀錄只存在這台平板的瀏覽器裡。清除瀏覽器資料就會不見，請定期匯出。</p>
      <p class="muted">上次匯出：${p.lastExport ? new Date(p.lastExport).toLocaleString() : '從來沒有'}　｜　瀏覽器${persisted ? '已同意長期保存資料' : '沒有承諾長期保存資料'}</p>
      <div class="row"><button class="btn" id="exp">匯出紀錄檔</button><button class="btn secondary" id="imp">匯入紀錄檔</button></div></div>
    <div class="card" style="margin-top:12px"><h2 style="margin-top:0">👤 使用者</h2>
      <div class="row"><a class="btn secondary" href="#/profiles">切換或新增使用者</a><a class="btn ghost" href="#/report">學習報告</a>
      <button class="btn danger" id="del">刪除「${esc(p.name)}」的紀錄</button></div>
      <p class="muted" id="delhint"></p></div>`;
  el.querySelector('#exp').addEventListener('click', () => {
    exportProfile(p);
    p.lastExport = Date.now();
    app.save();
    toast('已匯出，檔案在下載資料夾');
  });
  el.querySelector('#imp').addEventListener('click', importFlow);
  let armed = false;
  el.querySelector('#del').addEventListener('click', () => {
    if (!armed) {
      armed = true;
      el.querySelector('#delhint').textContent = '刪除後無法復原。確定的話再按一次。';
      return;
    }
    delete app.state.profiles[p.id];
    app.state.current = null;
    app.save();
    go('#/profiles');
  });
}

export function report(el) {
  const p = app.profile;
  let html = `${topbar()}<h1>📊 學習報告</h1>`;
  for (const pack of PACKS) {
    const mis = Object.entries(p.misCount || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
    html += `<div class="card"><h2 style="margin-top:0">最常掉進的陷阱</h2>${
      mis.length
        ? `<table class="result-table">${mis.map(([code, n]) => `<tr><td>${n} 次</td><td>${esc(pack.misconceptions[code] || code)}</td></tr>`).join('')}</table>`
        : '<p class="muted">還沒有資料。</p>'
    }</div>`;
    html += `<div class="card" style="margin-top:12px"><h2 style="margin-top:0">各關卡</h2><table class="result-table"><tr><th>關卡</th><th>作答</th><th>答對率</th><th>星</th></tr>`;
    for (const sec of pack.sections) {
      for (const id of sec.nodes) {
        const s = nodeState(p, pack.id, id);
        const rate = s.seen ? `${Math.round((s.correct / s.seen) * 100)}%` : '—';
        html += `<tr><td>${id} ${esc(pack.nodes[id].title)}</td><td>${s.seen}</td><td>${rate}</td><td>${'★'.repeat(s.stars) || '—'}</td></tr>`;
      }
    }
    html += '</table></div>';
  }
  el.innerHTML = html;
}
