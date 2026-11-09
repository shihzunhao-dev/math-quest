// Exact surd arithmetic helpers plus a tiny math markup renderer.
// Markup: √{x} square root, \frac{a}{b} fraction, ^{n} superscript, − minus.

export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function isqrt(n) {
  let x = Math.floor(Math.sqrt(n));
  while (x * x > n) x--;
  while ((x + 1) * (x + 1) <= n) x++;
  return x;
}

export const isSquare = (n) => n >= 0 && isqrt(n) ** 2 === n;

// n -> [k, r] with sqrt(n) = k * sqrt(r), r square-free
export function simplifySqrt(n) {
  let k = 1;
  let r = n;
  for (let d = 2; d * d <= r; d++) {
    while (r % (d * d) === 0) {
      r /= d * d;
      k *= d;
    }
  }
  return [k, r];
}

export const isSquareFree = (n) => simplifySqrt(n)[0] === 1;

// A surd is (num/den) * sqrt(rad), always normalised.
export function surd(num, den = 1, rad = 1) {
  if (rad === 0) num = 0;
  const [k, r] = rad === 0 ? [0, 1] : simplifySqrt(rad);
  num *= k;
  rad = r;
  const g = gcd(num, den) || 1;
  num /= g;
  den /= g;
  if (den < 0) {
    num = -num;
    den = -den;
  }
  return { num, den, rad, value: (num / den) * Math.sqrt(rad) };
}

export const sqrtOf = (n) => surd(1, 1, n);
export const int = (n) => surd(n, 1, 1);
export const frac = (n, d) => surd(n, d, 1);

function surdCore(a, rad, sqrtFn) {
  if (rad === 1) return String(a);
  return (a === 1 ? '' : String(a)) + sqrtFn(rad);
}

// Markup form, e.g. "2√{5}" or "\frac{25√{3}}{4}"
export function texSurd(s) {
  if (s.num === 0) return '0';
  const sign = s.num < 0 ? '−' : '';
  const core = surdCore(Math.abs(s.num), s.rad, (r) => `√{${r}}`);
  return s.den === 1 ? sign + core : `${sign}\\frac{${core}}{${s.den}}`;
}

// Plain unicode form for SVG labels, e.g. "2√5" or "25√3/4"
export function plainSurd(s) {
  if (s.num === 0) return '0';
  const sign = s.num < 0 ? '−' : '';
  const core = surdCore(Math.abs(s.num), s.rad, (r) => `√${r}`);
  return s.den === 1 ? sign + core : `${sign}${core}/${s.den}`;
}

// a + b√r (integers), markup
export function texSum(a, b, r) {
  const [k, rr] = simplifySqrt(r);
  b *= k;
  if (rr === 1) return fmtInt(a + b);
  if (b === 0) return fmtInt(a);
  const root = `${Math.abs(b) === 1 ? '' : Math.abs(b)}√{${rr}}`;
  if (a === 0) return (b < 0 ? '−' : '') + root;
  return `${fmtInt(a)}${b < 0 ? '−' : '+'}${root}`;
}
export const sumValue = (a, b, r) => a + b * Math.sqrt(r);

export const fmtInt = (n) => (n < 0 ? `−${-n}` : String(n));
export const fmtSigned = (n) => (n < 0 ? `(−${-n})` : String(n));

// ---------- markup renderer ----------
const esc = (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c] || c;

function readGroup(src, i) {
  // src[i] === '{'
  let depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') {
      depth--;
      if (depth === 0) return [src.slice(i + 1, j), j + 1];
    }
  }
  throw new Error(`unbalanced braces in: ${src}`);
}

export function renderMath(src) {
  let out = '';
  let i = 0;
  while (i < src.length) {
    if (src.startsWith('√{', i)) {
      const [inner, next] = readGroup(src, i + 1);
      out += `<span class="sq"><span class="sq-s">√</span><span class="sq-r">${renderMath(inner)}</span></span>`;
      i = next;
    } else if (src.startsWith('\\frac{', i)) {
      const [n, mid] = readGroup(src, i + 5);
      const [d, next] = readGroup(src, mid);
      out += `<span class="fr"><span class="fr-n">${renderMath(n)}</span><span class="fr-d">${renderMath(d)}</span></span>`;
      i = next;
    } else if (src.startsWith('^{', i)) {
      const [inner, next] = readGroup(src, i + 1);
      out += `<sup>${renderMath(inner)}</sup>`;
      i = next;
    } else if (src[i] === '\n') {
      out += '<br>';
      i++;
    } else {
      out += esc(src[i]);
      i++;
    }
  }
  return out;
}
