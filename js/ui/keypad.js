// Answer keypad for fill-in questions (digits, √, −, .). Used only where we need
// to tell "correct but not simplified" apart from wrong.
import { renderMath, simplifySqrt } from '../mathfmt.js';
import { toast } from '../main.js';

const KEYS = ['7', '8', '9', '⌫', '4', '5', '6', '√', '1', '2', '3', '−', '0', '.', 'C'];

export function inputBlock() {
  return `<div class="answer-box" id="ans"><span class="muted">用下面的按鍵輸入答案</span></div>
    <div class="keypad">${KEYS.map((k) => `<button data-k="${k}" aria-label="${k === 'C' ? '清除' : k}">${k === 'C' ? '清除' : k}</button>`).join('')}
    <button class="submit" id="submit">送出</button></div>`;
}

const toMarkup = (s) => s.replace(/√(\d*)/g, (_, d) => `√{${d || ' '}}`);

export function parseAnswer(s) {
  const m = s.match(/^(−)?(\d+(?:\.\d+)?)?(?:√(\d+))?$/);
  if (!m || (!m[2] && !m[3])) return null;
  const sign = m[1] ? -1 : 1;
  const coef = m[2] ? Number(m[2]) : 1;
  const rad = m[3] ? Number(m[3]) : null;
  return { value: sign * coef * (rad ? Math.sqrt(rad) : 1), rad };
}

export function bindInput(el, q, onAnswer) {
  let typed = '';
  const box = el.querySelector('#ans');
  const show = () => {
    box.innerHTML = typed ? renderMath(toMarkup(typed)) : '<span class="muted">用下面的按鍵輸入答案</span>';
  };
  el.querySelectorAll('.keypad [data-k]').forEach((b) =>
    b.addEventListener('click', () => {
      const k = b.dataset.k;
      if (k === '⌫') typed = typed.slice(0, -1);
      else if (k === 'C') typed = '';
      else if (typed.length < 12) typed += k;
      show();
    }),
  );
  el.querySelector('#submit').addEventListener('click', () => {
    const a = parseAnswer(typed);
    if (!a) {
      toast('看不懂這個寫法，例如可以輸入 2√5 或 12');
      return;
    }
    el.querySelectorAll('.keypad button').forEach((b) => (b.disabled = true));
    const correct = Math.abs(a.value - q.answer.key) < 1e-9;
    if (correct) {
      const notSimplest = a.rad && simplifySqrt(a.rad)[0] !== 1;
      box.style.borderColor = 'var(--good)';
      onAnswer({ correct: true, mis: null, note: notSimplest ? 'simplify' : null });
      return;
    }
    box.style.borderColor = 'var(--bad)';
    const trap = q.traps.find((t) => Math.abs(t.key - a.value) < 1e-6);
    onAnswer({ correct: false, mis: trap ? trap.mis : null });
  });
}
