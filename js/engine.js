// Learning rules: mastery, stars, XP, spaced review, tests, achievements.
// Rewards are tied to learning (mastery, retention, beating your own traps), never to speed or volume alone.
import { PACKS, getPack } from '../content/index.js';
import { generate } from './selfcheck.js';
import { newSeed } from './rng.js';

export const RULES = {
  masterStreak: 3, // consecutive first-try correct answers in a node
  roundSize: 5,
  reviewDays: [1, 3, 7, 14, 30],
  wrongRunForHelp: 2,
  xp: { practice: 10, review: 15, master: 30, star3: 20, test: 5 },
  xpPerLevel: 100,
};

const DAY = 86400000;
const key = (pack, node) => `${pack}/${node}`;
const today = () => new Date().toLocaleDateString('sv'); // YYYY-MM-DD local

export function nodeState(p, pack, node) {
  return p.nodes[key(pack, node)] || { streak: 0, seen: 0, correct: 0, stars: 0, masteredAt: null, review: null, wrongRun: 0, helpRuns: 0 };
}

export const isUnlocked = (p, pack, nodeId) => pack.nodes[nodeId].prereqs.every((pr) => nodeState(p, pack.id, pr).stars >= 2);

export const level = (p) => ({ level: Math.floor(p.xp / RULES.xpPerLevel) + 1, into: p.xp % RULES.xpPerLevel });

export function makeQuestion(p, pack, nodeId, { seed = newSeed(), templateId = null } = {}) {
  const node = pack.nodes[nodeId];
  let tpl = node.templates.find((t) => t.id === templateId);
  if (!tpl) {
    const used = {};
    for (const a of p.attempts) if (a.pack === pack.id && a.node === nodeId) used[a.tpl] = (used[a.tpl] || 0) + 1;
    const min = Math.min(...node.templates.map((t) => used[t.id] || 0));
    const least = node.templates.filter((t) => (used[t.id] || 0) === min);
    tpl = least[seed % least.length];
  }
  const { q, seed: usedSeed } = generate(tpl, seed, pack.misconceptions);
  return { tpl: tpl.id, seed: usedSeed, q };
}

function touchDay(p) {
  const d = today();
  if (!p.days.includes(d)) p.days.push(d);
}

// ctx: { pack, node, tpl, seed, mode: practice|review|pre|post, trapCodes: [mis codes offered] }
// res: { correct, mis, note }
export function recordAnswer(p, ctx, res) {
  const now = Date.now();
  const events = [];
  touchDay(p);
  p.attempts.push({ t: now, pack: ctx.pack, node: ctx.node, tpl: ctx.tpl, seed: ctx.seed, mode: ctx.mode, correct: res.correct, mis: res.mis || null, note: res.note || null });
  p.misCount = p.misCount || {};
  if (ctx.mode === 'pre' || ctx.mode === 'post') {
    if (res.correct) gainXp(p, RULES.xp.test, events);
    if (!res.correct && res.mis) p.misCount[res.mis] = (p.misCount[res.mis] || 0) + 1;
    return events.concat(checkAchievements(p));
  }
  const s = { ...nodeState(p, ctx.pack, ctx.node) };
  s.seen++;
  if (res.correct) {
    s.correct++;
    s.wrongRun = 0;
    const beaten = (ctx.trapCodes || []).filter((c) => p.misCount[c]);
    if (beaten.length) {
      p.trapWins = (p.trapWins || 0) + 1;
      events.push({ type: 'trap', codes: beaten });
    }
    if (ctx.mode === 'review') {
      gainXp(p, RULES.xp.review, events);
      const step = Math.min((s.review?.step ?? 0) + 1, RULES.reviewDays.length - 1);
      s.review = { due: now + RULES.reviewDays[step] * DAY, step };
      if (s.stars === 2) {
        s.stars = 3;
        gainXp(p, RULES.xp.star3, events);
        events.push({ type: 'star3' });
      }
    } else {
      gainXp(p, RULES.xp.practice, events);
      s.streak++;
      if (s.stars < 2 && s.streak >= RULES.masterStreak) {
        s.stars = 2;
        s.masteredAt = now;
        s.review = { due: now + RULES.reviewDays[0] * DAY, step: 0 };
        gainXp(p, RULES.xp.master, events);
        events.push({ type: 'mastered' });
        if (s.helpRuns > 0) p.comebacks = (p.comebacks || 0) + 1;
      }
    }
  } else {
    s.streak = 0;
    s.wrongRun++;
    if (res.mis) p.misCount[res.mis] = (p.misCount[res.mis] || 0) + 1;
    if (s.wrongRun === RULES.wrongRunForHelp) {
      s.helpRuns++;
      events.push({ type: 'help' });
    }
    if (ctx.mode === 'review') s.review = { due: now + DAY, step: 0 };
  }
  p.nodes[key(ctx.pack, ctx.node)] = s;
  return events.concat(checkAchievements(p));
}

function gainXp(p, n, events) {
  const before = level(p).level;
  p.xp += n;
  events.push({ type: 'xp', n });
  if (level(p).level > before) events.push({ type: 'levelup', level: level(p).level });
}

export function finishRound(p, pack, nodeId) {
  const s = { ...nodeState(p, pack, nodeId) };
  if (s.stars < 1) s.stars = 1;
  p.nodes[key(pack, nodeId)] = s;
  return checkAchievements(p);
}

export function dueReviews(p) {
  const now = Date.now();
  const out = [];
  for (const pack of PACKS) {
    for (const id of Object.keys(pack.nodes)) {
      const s = nodeState(p, pack.id, id);
      if (s.review && s.review.due <= now) out.push({ pack: pack.id, node: id });
    }
  }
  return out;
}

// ---------- tests ----------
export const testNodes = (pack) => pack.sections.flatMap((s) => s.nodes);

export function finishTest(p, packId, mode, results) {
  p.tests[`${packId}/${mode}`] = { t: Date.now(), results };
  if (mode === 'pre') {
    for (const r of results) {
      if (!r.correct) continue;
      const s = { ...nodeState(p, packId, r.node) };
      if (s.stars < 2) s.streak = Math.max(s.streak, RULES.masterStreak - 1);
      p.nodes[key(packId, r.node)] = s;
    }
  }
  return checkAchievements(p);
}

// ---------- cards & achievements ----------
export function unlockedCards(p, pack) {
  return pack.cards.filter((c) => (c.unlock.proof ? p.proofDone : nodeState(p, pack.id, c.unlock.node).stars >= 2));
}

function consecutiveDays(days) {
  const set = new Set(days);
  let best = 0;
  for (const d of set) {
    let n = 0;
    let cur = new Date(`${d}T12:00:00`);
    while (set.has(cur.toLocaleDateString('sv'))) {
      n++;
      cur = new Date(cur.getTime() - DAY);
    }
    best = Math.max(best, n);
  }
  return best;
}

const allMastered = (p, pack, sectionId) =>
  pack.sections.find((s) => s.id === sectionId).nodes.every((n) => nodeState(p, pack.id, n).stars >= 2);

export const ACHIEVEMENTS = [
  { id: 'first_master', icon: '🌱', title: '第一次精熟', desc: '在任何一關連續答對 3 題', check: (p) => Object.values(p.nodes).some((s) => s.stars >= 2) },
  { id: 'pretest', icon: '🧭', title: '出發前的地圖', desc: '完成前測，找出自己的起點', check: (p) => Object.keys(p.tests).some((k) => k.endsWith('/pre')) },
  { id: 'proof', icon: '🧩', title: '拼圖證明者', desc: '親手完成畢氏定理的拼圖證明', check: (p) => p.proofDone },
  { id: 'world_21', icon: '🌙', title: '平方根探險家', desc: '2-1 全部關卡精熟', check: (p) => allMastered(p, getPack('ch8a-2'), '2-1') },
  { id: 'world_22', icon: '🔮', title: '根式魔術師', desc: '2-2 全部關卡精熟', check: (p) => allMastered(p, getPack('ch8a-2'), '2-2') },
  { id: 'world_23', icon: '📐', title: '畢氏定理大師', desc: '2-3 全部關卡精熟', check: (p) => allMastered(p, getPack('ch8a-2'), '2-3') },
  { id: 'trap5', icon: '🕵️', title: '陷阱識破者', desc: '5 次在「曾經害你答錯的陷阱」面前答對', check: (p) => (p.trapWins || 0) >= 5 },
  { id: 'comeback', icon: '💪', title: '越挫越勇', desc: '在卡關過的關卡重新精熟', check: (p) => (p.comebacks || 0) >= 1 },
  { id: 'review3', icon: '🧠', title: '記憶大師', desc: '3 個關卡隔天複習也答對（三顆星）', check: (p) => Object.values(p.nodes).filter((s) => s.stars >= 3).length >= 3 },
  { id: 'days3', icon: '🔥', title: '連續三天', desc: '連續 3 天都有練習', check: (p) => consecutiveDays(p.days) >= 3 },
  { id: 'days7', icon: '🏆', title: '連續一週', desc: '連續 7 天都有練習', check: (p) => consecutiveDays(p.days) >= 7 },
  { id: 'cards_all', icon: '📜', title: '歷史收藏家', desc: '收集全部數學史卡片', check: (p) => PACKS.every((pk) => unlockedCards(p, pk).length === pk.cards.length) },
  {
    id: 'post_up', icon: '📈', title: '看得見的進步', desc: '後測答對的題數比前測多',
    check: (p) => PACKS.some((pk) => {
      const pre = p.tests[`${pk.id}/pre`];
      const post = p.tests[`${pk.id}/post`];
      const n = (t) => t.results.filter((r) => r.correct).length;
      return pre && post && n(post) > n(pre);
    }),
  },
];

export function checkAchievements(p) {
  const events = [];
  for (const a of ACHIEVEMENTS) {
    if (!p.achievements[a.id] && a.check(p)) {
      p.achievements[a.id] = Date.now();
      events.push({ type: 'achievement', a });
    }
  }
  return events;
}
