// Recompute every sample item in docs/03-items.md from its rule and check that
// (1) the documented answer equals the computed answer,
// (2) each distractor equals the value its misconception rule produces,
// (3) the four options are pairwise distinct and none equals the answer.
const S = Math.sqrt;
const EPS = 1e-9;

const items = [];
// item(id, correct: [documented, computed], distractors: [[label, documented, computedByRule], ...])
function item(id, correct, distractors) {
  items.push({ id, correct, distractors });
}

// P1-A (x+3)^2, test at x = 2 (polynomials compared by value at two points)
for (const x of [2, 5]) {
  item(`P1-A@x=${x}`, [x * x + 6 * x + 9, (x + 3) ** 2], [
    ['M-P1a', x * x + 9, x * x + 3 ** 2],
    ['mid-once', x * x + 3 * x + 9, x * x + 3 * x + 9],
    ['3^2=6', x * x + 6 * x + 6, x * x + 2 * 3 * x + 3 * 2],
  ]);
}

// R1-A: -6 is a square root of 2a+10
item('R1-A', [13, ((-6) ** 2 - 10) / 2], [
  ['M-R1a', -8, (-6 - 10) / 2],
  ['M-R1a-abs', -2, (6 - 10) / 2],
  ['M-R1b', '無解', '無解'],
]);

// R1-C square of area 50
item('R1-C', [5 * S(2), S(50)], [
  ['M-R1e-half', 25, 50 / 2],
  ['M-R1e-quarter', 12.5, 50 / 4],
  ['M-R1f', '±5√2', '±5√2'],
]);

// R7-B compare 3*sqrt5 and sqrt40
item('R7-B', ['3√5 較大', 3 * S(5) > S(40) ? '3√5 較大' : '√40 較大'], [
  ['M-R7a', '√40 較大', 5 < 40 ? '√40 較大' : '3√5 較大'],
  ['equal', '一樣大', '一樣大'],
  ['incomparable', '無法比較', '無法比較'],
]);

// R7-C (sqrt7)^2
item('R7-C', [7, S(7) ** 2], [
  ['M-R7b-49', 49, 7 * 7],
  ['M-R7b-root', S(7), S(7)],
  ['M-R1f', '±7', '±7'],
]);

// R2-B square roots of 9/16
item('R2-B', ['±3/4', `±${S(9)}/${S(16)}`], [
  ['M-R1b', '3/4', `${S(9)}/${S(16)}`],
  ['M-R2b-num', '±3/16', `±${S(9)}/16`],
  ['M-R2b-den', '±9/4', `±9/${S(16)}`],
]);

// R3-B sqrt20 between tenths
{
  const t = Math.floor(S(20) * 10) / 10;
  if (!(t * t < 20 && (t + 0.1) ** 2 > 20)) throw new Error('R3-B bracket wrong');
  item('R3-B', ['4.4-4.5', `${t.toFixed(1)}-${(t + 0.1).toFixed(1)}`], [
    ['M-R3b', '4.5-4.6', `${(t + 0.1).toFixed(1)}-${(t + 0.2).toFixed(1)}`],
    ['half', '10-11', `${20 / 2}-${20 / 2 + 1}`],
    ['M-R3b-squares', '19.36-20.25', `${(t * t).toFixed(2)}-${((t + 0.1) ** 2).toFixed(2)}`],
  ]);
  if (4.5 * 4.5 <= 20) throw new Error('R3-B distractor 4.5-4.6 would be correct');
}

// R8-A 2sqrt3 * 3sqrt6
item('R8-A', [18 * S(2), 2 * S(3) * 3 * S(6)], [
  ['M-R5c-coefAdd', 15 * S(2), (2 + 3) * S(3 * 6)],
  ['M-R8a', 18, 2 * 3 * S(3 + 6)],
  ['M-R5c-mixed', 6 * S(3), S(2 * 3 * 3 * 6)],
]);

// R8-B sqrt48 / sqrt3
item('R8-B', [4, S(48) / S(3)], [
  ['M-R8b', 16, 48 / 3],
  ['M-R8a', 3 * S(5), S(48 - 3)],
  ['forgot-divide', 4 * S(3), S(48)],
]);

// R9-A (sqrt3+sqrt2)^2
item('R9-A', [5 + 2 * S(6), (S(3) + S(2)) ** 2], [
  ['M-P1a', 5, 3 + 2],
  ['mid-once', 5 + S(6), 3 + 2 + S(6)],
  ['M-R9a', 1, 3 - 2],
]);

// R9-B (sqrt3+sqrt2)(sqrt3-sqrt2)
item('R9-B', [1, (S(3) + S(2)) * (S(3) - S(2))], [
  ['M-R9a-add', 5, 3 + 2],
  ['M-R9a-rev', -1, 2 - 3],
  ['first-only', S(6), S(3) * S(2)],
]);

// R7-A sqrt((-5)^2)
item('R7-A', [5, S((-5) ** 2)], [
  ['M-R1c', -5, -5],
  ['M-R1c-undef', '無意義', '無意義'],
  ['M-T2b', 25, (-5) ** 2],
]);

// R2-A sqrt(2^4 * 3^2)
item('R2-A', [12, S(2 ** 4 * 3 ** 2)], [
  ['M-R2a-noroot', 144, 2 ** 4 * 3 ** 2],
  ['M-R2a-partial', 36, S(2 ** 4) * 3 ** 2],
  ['exp-to-1', 6, 2 * 3],
]);

// R3-A sqrt(40) between consecutive integers
const lo = Math.floor(S(40));
item('R3-A', ['6-7', `${lo}-${lo + 1}`], [
  ['M-R3a', '39-41', `${40 - 1}-${40 + 1}`],
  ['half', '20-21', `${40 / 2}-${40 / 2 + 1}`],
  ['wrong-square', '5-6', `${lo - 1}-${lo}`],
]);

// R4-A sqrt(72) -- "simplest form" template: unsimplified forms are SUPPOSED to
// equal the answer in value, so options are compared by written form, and the
// rule check is: the value-equal ones must not be in simplest form.
item('R4-A', [6 * S(2), S(72)], [
  ['M-R4a', 2 * S(18), 2 * S(18)],
  ['M-R4a-2', 3 * S(8), 3 * S(8)],
  ['M-R4b', 36 * S(2), 36 * S(2)],
]);
items[items.length - 1].formMode = { answer: '6√2', options: ['2√18', '3√8', '36√2'] };
const isSimplest = (s) => {
  const m = s.match(/^(\d*)√(\d+)$/);
  const r = Number(m[2]);
  for (let k = 2; k * k <= r; k++) if (r % (k * k) === 0) return false;
  return true;
};

// R5-A sqrt(8)+sqrt(18)
item('R5-A', [5 * S(2), S(8) + S(18)], [
  ['M-R5b', S(26), S(8 + 18)],
  ['radicands-add', 5 * S(4), (2 + 3) * S(2 + 2)],
  ['M-R5c', 6 * S(2), 2 * 3 * S(2)],
]);
// NOTE: 5*sqrt(4) = 10 numerically; distinctness is checked below.

// R6-A 6/sqrt(3)
item('R6-A', [2 * S(3), 6 / S(3)], [
  ['M-R6a', 6 * S(3), 6 * S(3)],
  ['cancel-as-3', 2, 6 / 3],
  ['M-R5c', S(2), S(6 / 3)],
]);

// R6-B 1/(sqrt5 - 2)
item('R6-B', [S(5) + 2, 1 / (S(5) - 2)], [
  ['M-R6b-reverse', -S(5) - 2, (S(5) + 2) / (2 ** 2 - 5)],
  ['M-R6b-nosquare', (S(5) + 2) / 3, (S(5) + 2) / (5 - 2)],
  ['M-R6a', S(5) - 2, S(5) - 2],
]);

// T1-A a=3,b=4
{
  const a = 3, b = 4, big = (a + b) ** 2, tri = (a * b) / 2;
  item('T1-A', [25, big - 4 * tri], [
    ['M-T1a', 1, big - 4 * (a * b)],
    ['one-tri', 43, big - tri],
    ['M-T1b', 5, S(big - 4 * tri)],
  ]);
}

// T2-A legs 6, 8
item('T2-A', [10, S(36 + 64)], [
  ['M-R5a', 14, 6 + 8],
  ['M-T2b', 100, 36 + 64],
  ['M-T2a', 2 * S(7), S(64 - 36)],
]);

// T2-B hyp 13, leg 5
item('T2-B1', [12, S(169 - 25)], [
  ['M-T2a', S(194), S(169 + 25)],
  ['M-T2c', 8, 13 - 5],
  ['M-T2b', 144, 169 - 25],
]);
// T2-B hyp 6, leg 4
item('T2-B2', [2 * S(5), S(36 - 16)], [
  ['M-T2a', 2 * S(13), S(36 + 16)],
  ['M-T2c', 2, 6 - 4],
  ['M-T2b', 20, 36 - 16],
]);

// T2-C square side 5
item('T2-C', [5 * S(2), S(25 + 25)], [
  ['M-T2d', 10, 5 * 2],
  ['M-T2b', 50, 25 + 25],
  ['M-T1b', 25, 5 * 5],
]);

// T3-A: which triple is right-angled (value: 1 if a^2+b^2=c^2)
const isRight = (a, b, c) => (a * a + b * b === c * c ? 'right' : 'not');
item('T3-A', ['right', isRight(6, 8, 10)], [
  ['M-T3a-plus1', 'not', isRight(4, 5, 6)],
  ['misremember', 'not', isRight(5, 12, 14)],
  ['M-T3a-sum', 'not', isRight(3, 4, 7)],
]);
// options here are distinct triples; correctness check only needs each wrong triple to be 'not'

// T3-B legs 9, 12
item('T3-B', [15, S(81 + 144)], [
  ['M-R5a', 21, 9 + 12],
  ['M-T2b', 225, 81 + 144],
  ['5-12-13', 13, 13],
]);

// T4-A AB=3 BC=4 CD=12
{
  const AC = S(9 + 16);
  item('T4-A', [13, S(AC * AC + 144)], [
    ['M-R5a-all', 19, 3 + 4 + 12],
    ['M-T4a', 4 * S(10), S(16 + 144)],
    ['M-R5a', 17, AC + 12],
  ]);
}

// T4-B leg 6, other leg = hyp - 2 : x^2 + 36 = (x+2)^2
{
  const x = (36 - 4) / 4; // 4x + 4 = 36
  const hyp = x + 2;
  item('T4-B', [10, hyp], [
    ['M-P1a', '無解', '無解'], // x^2+36 = x^2+4 -> 36 = 4, contradiction
    ['M-T4c', 2 * S(10), S(36 + 4)],
    ['M-T4b', 8, x],
  ]);
  if (x * x + 36 !== (x + 2) ** 2) throw new Error('T4-B equation check failed');
}

// T5-A legs 6, 8
item('T5-A', [4.8, (6 * 8) / 10], [
  ['M-T5a-1', 2.4, (6 * 8) / 2 / 10],
  ['M-T5a-2', 9.6, (6 * 8 * 2) / 10],
  ['average', 7, (6 + 8) / 2],
]);

// T6-A/B/C equilateral, side 6 / height 6
item('T6-A', [3 * S(3), S(36 - 9)], [
  ['M-T6a', S(33), S(36 - 3)],
  ['M-T6c', 3, 6 / 2],
  ['M-T2a', 3 * S(5), S(36 + 9)],
]);
item('T6-B', [9 * S(3), (S(3) / 4) * 36], [
  ['M-T6b-noHalf', 18 * S(3), 6 * 3 * S(3)],
  ['M-T6b-noQuarter', 36 * S(3), S(3) * 36],
  ['M-T6b-noSquare', (3 * S(3)) / 2, (S(3) / 4) * 6],
]);
item('T6-C', [4 * S(3), (2 * 6) / S(3)], [
  ['M-T6c', 12, 2 * 6],
  ['formula-inverted', 3 * S(3), (S(3) / 2) * 6],
  ['M-R6a', 12 * S(3), 12 * S(3)],
]);

// T7-A hyp 8
item('T7-A', [64, 8 * 8], [
  ['each-c2', 128, 2 * 64],
  ['one-only', 32, 64 / 2],
  ['M-T7a', '條件不足', '條件不足'],
]);

// T8-A legs 2, 1
item('T8-A', [S(5), S(4 + 1)], [
  ['M-T8a-sum', 3, 2 + 1],
  ['M-T2b', 5, 4 + 1],
  ['M-T8a-leg', 2, 2],
]);

// T9-A ladder 5, foot 3
item('T9-A', [4, S(25 - 9)], [
  ['M-T9a', S(34), S(25 + 9)],
  ['M-T2c', 2, 5 - 3],
  ['M-T2b', 16, 25 - 9],
]);

// T10-A A(-3,2) B(5,2)
item('T10-A', [8, Math.abs(5 - -3)], [
  ['M-T10a-sum', 2, 5 + -3],
  ['M-T10a-neg', -8, -3 - 5],
  ['same-y', 0, 0],
]);

// T11-A A(1,-2) B(4,2)
item('T11-A', [5, S((4 - 1) ** 2 + (2 - -2) ** 2)], [
  ['M-T11a', 3, S((4 - 1) ** 2 + (2 - 2) ** 2)],
  ['M-R5a', 7, Math.abs(4 - 1) + Math.abs(2 - -2)],
  ['M-T11b', S(13), S((1 - -2) ** 2 + (4 - 2) ** 2)],
]);

// ---- checks ----
const eq = (a, b) =>
  typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) < EPS : a === b;

let failures = 0;
for (const it of items) {
  const errs = [];
  const [docAns, compAns] = it.correct;
  if (!eq(docAns, compAns)) errs.push(`answer doc=${docAns} computed=${compAns}`);
  for (const [label, doc, comp] of it.distractors) {
    if (!eq(doc, comp)) errs.push(`${label} doc=${doc} rule=${comp}`);
  }
  if (it.formMode) {
    const { answer, options } = it.formMode;
    const all = [answer, ...options];
    if (new Set(all).size !== all.length) errs.push('written forms collide');
    if (!isSimplest(answer)) errs.push(`answer ${answer} is not simplest form`);
    it.distractors.forEach(([label, doc], i) => {
      if (eq(doc, docAns) && isSimplest(options[i]))
        errs.push(`${label} ${options[i]} equals answer and is already simplest`);
    });
  } else if (it.id !== 'T3-A') {
    const opts = [docAns, ...it.distractors.map((d) => d[1])];
    for (let i = 0; i < opts.length; i++)
      for (let j = i + 1; j < opts.length; j++)
        if (eq(opts[i], opts[j])) errs.push(`options ${i} and ${j} collide (${opts[i]})`);
  }
  if (errs.length) {
    failures++;
    console.log(`FAIL ${it.id}: ${errs.join('; ')}`);
  } else {
    console.log(`ok   ${it.id}`);
  }
}
console.log(`\n${items.length - failures}/${items.length} items passed`);
process.exit(failures ? 1 : 0);
