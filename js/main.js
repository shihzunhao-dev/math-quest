// App shell: state, router, shared UI helpers.
import { loadState, saveState } from './store.js';
import { level } from './engine.js';
import * as home from './ui/home.js';
import * as play from './ui/play.js';
import * as pages from './ui/pages.js';
import * as proof from './ui/proof.js';

export const app = {
  state: loadState(),
  get profile() {
    return this.state.profiles[this.state.current] || null;
  },
  save() {
    saveState(this.state);
  },
};

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function toast(html, ms = 2600) {
  const box = document.getElementById('toasts');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = html;
  box.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

export function announce(events) {
  for (const e of events) {
    if (e.type === 'achievement') toast(`${e.a.icon} 獲得成就：<b>${esc(e.a.title)}</b>`, 3600);
    if (e.type === 'levelup') toast(`⬆️ 升到等級 ${e.level}！`);
  }
}

export function topbar(back = '#/home', backText = '‹ 回地圖') {
  const p = app.profile;
  const { level: lv, into } = level(p);
  return `<div class="topbar">
    ${back ? `<a class="back" href="${back}">${backText}</a>` : ''}
    <span class="name">${esc(p.name)}</span>
    <span class="lv">Lv ${lv}</span>
    <div class="xpbar" title="${into}/100 XP"><span style="width:${into}%"></span></div>
    <span class="muted">${p.xp} XP</span>
  </div>`;
}

export const go = (hash) => {
  if (location.hash === hash) route();
  else location.hash = hash;
};

function route() {
  const el = document.getElementById('app');
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  window.scrollTo(0, 0);
  if (!app.profile && parts[0] !== 'profiles') return pages.profiles(el);
  try {
    switch (parts[0]) {
      case undefined:
      case 'home':
        return home.render(el);
      case 'profiles':
        return pages.profiles(el);
      case 'node':
        return play.practice(el, parts[1], parts[2]);
      case 'review':
        return play.review(el);
      case 'test':
        return play.test(el, parts[1], parts[2]);
      case 'proof':
        return proof.render(el, { standalone: true });
      case 'ach':
        return pages.achievements(el);
      case 'cards':
        return pages.cards(el);
      case 'settings':
        return pages.settings(el);
      case 'report':
        return pages.report(el);
      case 'codes':
        return pages.codes(el);
      default:
        return home.render(el);
    }
  } catch (err) {
    console.error(err);
    el.innerHTML = `<div class="card"><h2>出了點問題</h2><p>${esc(err.message)}</p><p><a class="btn" href="#/home">回首頁</a></p></div>`;
  }
}

window.addEventListener('hashchange', route);
route();
