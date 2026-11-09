// Question self-check. Replaces human review: every generated question must pass.
import { mulberry32, shuffle } from './rng.js';

const EPS = 1e-9;

function sameKey(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < EPS;
  return a === b;
}

export function selfCheck(q, misconceptions) {
  const errs = [];
  if (!q || typeof q.stem !== 'string') return ['no question'];
  if (q.kind === 'input') {
    if (typeof q.answer?.key !== 'number' || !Number.isFinite(q.answer.key)) errs.push('input answer not numeric');
    for (const d of q.traps || []) {
      if (!misconceptions[d.mis]) errs.push(`unknown misconception ${d.mis}`);
      if (sameKey(d.key, q.answer.key)) errs.push(`trap ${d.mis} equals answer`);
    }
    return errs;
  }
  const opts = q.options || [];
  if (opts.length !== 4) errs.push(`expected 4 options, got ${opts.length}`);
  const correct = opts.filter((o) => o.mis === null);
  if (correct.length !== 1) errs.push(`expected 1 correct option, got ${correct.length}`);
  for (const o of opts) {
    if (o.mis !== null && !misconceptions[o.mis]) errs.push(`unknown misconception ${o.mis}`);
    if (typeof o.key === 'number' && !Number.isFinite(o.key)) errs.push(`non-finite key in ${o.tex}`);
    if (typeof o.tex !== 'string' || !o.tex) errs.push('empty option text');
  }
  for (let i = 0; i < opts.length; i++) {
    for (let j = i + 1; j < opts.length; j++) {
      const a = opts[i];
      const b = opts[j];
      if (a.tex === b.tex) errs.push(`identical text ${a.tex}`);
      const equivPair = (a.mis === null && b.equiv) || (b.mis === null && a.equiv);
      if (!equivPair && sameKey(a.key, b.key)) errs.push(`options collide: ${a.tex} / ${b.tex}`);
    }
  }
  return errs;
}

// Generate a question from a template with retries. Returns { q, seed } or throws.
export function generate(template, seed, misconceptions, maxTries = 20) {
  let s = seed >>> 0;
  let lastErrs = [];
  for (let attempt = 0; attempt < maxTries; attempt++) {
    const rng = mulberry32(s);
    const q = template.gen(rng);
    if (q) {
      const errs = selfCheck(q, misconceptions);
      if (errs.length === 0) {
        if (q.kind !== 'input') q.options = shuffle(rng, q.options);
        return { q, seed: s };
      }
      lastErrs = errs;
    } else {
      lastErrs = ['template returned null'];
    }
    s = (s * 1103515245 + 12345) >>> 0;
  }
  const err = new Error(`template ${template.id} failed ${maxTries} times: ${lastErrs.join('; ')}`);
  err.templateId = template.id;
  throw err;
}
