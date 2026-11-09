// Local persistence. Everything stays in this browser; export/import is the backup.
const KEY = 'pq.v1';
const SCHEMA = 1;

let memory = null; // fallback when localStorage is unavailable

function readRaw() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return memory;
  }
}
function writeRaw(s) {
  try {
    localStorage.setItem(KEY, s);
  } catch {
    memory = s;
  }
}

export function loadState() {
  const raw = readRaw();
  if (!raw) return { schema: SCHEMA, profiles: {}, current: null };
  try {
    const s = JSON.parse(raw);
    if (s.schema !== SCHEMA || typeof s.profiles !== 'object') throw new Error('bad schema');
    return s;
  } catch (e) {
    console.error('stored data unreadable, starting fresh', e);
    return { schema: SCHEMA, profiles: {}, current: null, corrupted: raw };
  }
}

export const saveState = (state) => writeRaw(JSON.stringify(state));

export function newProfile(name) {
  const now = Date.now();
  return {
    id: `p${now.toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`,
    name: name.trim().slice(0, 20),
    created: now,
    xp: 0,
    nodes: {}, // key `${pack}/${node}`
    attempts: [],
    achievements: {},
    tests: {},
    days: [],
    proofDone: false,
    lastExport: null,
  };
}

export function exportProfile(profile) {
  const data = { app: 'pythagoras-quest', schema: SCHEMA, exportedAt: new Date().toISOString(), profile };
  const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  const day = new Date().toISOString().slice(0, 10);
  a.href = URL.createObjectURL(blob);
  a.download = `學習紀錄-${profile.name}-${day}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function parseImport(text) {
  const data = JSON.parse(text);
  const p = data?.profile;
  if (data?.app !== 'pythagoras-quest' || !p?.id || !p?.name || !Array.isArray(p.attempts) || typeof p.nodes !== 'object') {
    throw new Error('這不是本網站匯出的學習紀錄檔。');
  }
  return p;
}

export async function requestPersist() {
  try {
    if (navigator.storage?.persisted && (await navigator.storage.persisted())) return true;
    if (navigator.storage?.persist) return await navigator.storage.persist();
  } catch {
    /* not supported */
  }
  return false;
}
