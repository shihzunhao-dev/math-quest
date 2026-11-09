// Run every template many times through the real generator + self-check.
// Usage: node tools/stress-test.mjs [runsPerTemplate]
import { PACKS } from '../content/index.js';
import { generate } from '../js/selfcheck.js';
import { renderMath } from '../js/mathfmt.js';

const RUNS = Number(process.argv[2] || 500);
let failed = 0;
let total = 0;

for (const pack of PACKS) {
  console.log(`# ${pack.id} ${pack.title}`);
  const codesUsed = new Set();
  for (const node of Object.values(pack.nodes)) {
    if (node.templates.length === 0) {
      console.log(`FAIL node ${node.id} has no templates`);
      failed++;
    }
    for (const t of node.templates) {
      const errors = new Map();
      let retriesTotal = 0;
      const seen = new Set();
      for (let i = 0; i < RUNS; i++) {
        total++;
        const seed = (i * 2654435761) >>> 0;
        try {
          const { q, seed: used } = generate(t, seed, pack.misconceptions);
          if (used !== seed) retriesTotal++;
          renderMath(q.stem);
          if (q.kind === 'input') {
            seen.add(q.answer.tex + q.stem);
            q.traps.forEach((d) => codesUsed.add(d.mis));
          } else {
            q.options.forEach((o) => {
              renderMath(o.tex);
              if (o.mis) codesUsed.add(o.mis);
            });
            seen.add(q.stem + q.options.map((o) => o.tex).sort().join('|'));
          }
          // reproducibility: same seed -> same question
          const again = generate(t, used, pack.misconceptions);
          if (JSON.stringify(again.q) !== JSON.stringify(q)) errors.set('not reproducible from seed', 1);
        } catch (e) {
          errors.set(e.message, (errors.get(e.message) || 0) + 1);
        }
      }
      const status = errors.size ? 'FAIL' : 'ok  ';
      if (errors.size) failed++;
      console.log(`${status} ${t.id.padEnd(6)} distinct=${String(seen.size).padStart(4)} retried=${(retriesTotal / RUNS * 100).toFixed(0)}%`);
      for (const [msg, n] of errors) console.log(`       ${n}× ${msg}`);
    }
  }
  const unused = Object.keys(pack.misconceptions).filter((c) => !codesUsed.has(c));
  if (unused.length) console.log(`note: misconception codes never produced: ${unused.join(', ')}`);
}
console.log(`\n${total} generations, ${failed} failing templates`);
process.exit(failed ? 1 : 0);
