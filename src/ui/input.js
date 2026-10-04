// 답 입력. 시스템 키보드 대신 전화기 배열 키패드를 쓴다(SPEC 9.4). 채점은 "답 내기"를 눌러야만 한다.
import { h, clear } from './dom.js';
import { icon } from './icons.js';

/** "답 내기" + 비활성 이유 한 줄. 아직 못 내면 점선(= 아직) 모양으로 바뀌고 이유를 보인다(opacity로 흐리지 않음). */
function submitButton(onSubmit, why) {
  const btn = h('button.submit', { type: 'button', onclick: () => onSubmit() }, '답 내기');
  const note = h('p.why-off', why);
  return { btn, note, set: (ok) => { btn.disabled = !ok; note.hidden = ok; } };
}

/**
 * @returns {{ el: HTMLElement, value: () => any, reset: () => void, setBlank: (pattern) => void, lock: (on) => void }}
 */
export function makeInput(input, { onSubmit }) {
  const kind = input?.kind ?? 'number';
  if (kind === 'choice') return input.howLabel ? withHow(choiceInput(input, onSubmit), input.howLabel) : choiceInput(input, onSubmit);
  if (kind === 'multi') return multiInput(input, onSubmit);
  if (kind === 'order') return orderInput(input, onSubmit);
  if (kind === 'paint') return paintInput(input, onSubmit);
  if (kind === 'compound') return compoundInput(input, onSubmit);
  if (kind === 'equation') return equationInput(onSubmit);
  return numberInput(input, onSubmit);
}

function keypad(onKey, extra = []) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ...extra, '0', '⌫'];
  // 전화기 배열: 덧붙는 키가 없으면 0은 가운데 열, ⌫는 오른쪽(빈 자리는 그리지 않는다)
  return h('div.keypad', keys.map((k) => h('button.key', { type: 'button', onclick: () => onKey(k), 'aria-label': k === '⌫' ? '하나 지우기' : k, style: k === '0' && !extra.length ? { gridColumn: '2' } : undefined }, k === '⌫' ? icon('backspace') : k)));
}

function numberInput(input, onSubmit) {
  let text = '';
  let blank = null; // 힌트 ④의 빈칸 틀: { pattern: '7☐2', filled: '' }
  const box = h('div.answer-box.active', { 'aria-live': 'polite' }); // 키패드가 채우는 칸(대상)
  const unit = input?.unit ? h('span.unit', input.unit) : null;
  const allowDot = input?.kind === 'decimal';
  // 자리 수 제한: 기본 8자리, 큰 수 역은 템플릿이 maxDigits(조까지 13)를 준다(커리큘럼 11 검토). 끊어 쓰기 표시는 하지 않는다(자릿값 판단을 대신하지 않게).
  const maxDigits = input?.maxDigits ?? 8;
  if (maxDigits > 8) box.classList.add('long');
  const allowSlash = input?.kind === 'fraction';
  const render = () => {
    clear(box);
    if (blank) {
      for (const ch of blank.pattern) box.append(ch === '☐' ? h('span.blank-slot', blank.filled || ' ') : h('span.blank-fixed', ch));
    } else box.append(h('span.answer-text', text || ' '));
  };
  const onKey = (k) => {
    if (blank) {
      if (k === '⌫') blank.filled = '';
      else if (/\d/.test(k)) blank.filled = blank.size > 1 ? (blank.filled + k).slice(0, blank.size) : k;
    } else if (k === '⌫') text = text.slice(0, -1);
    else if (text.length < maxDigits) text += k;
    render();
    syncBtn();
  };
  const sub = submitButton(onSubmit, '답을 먼저 써요');
  const submitBtn = sub.btn;
  const syncBtn = () => {
    submitBtn.textContent = text && !blank ? `${text}${input?.unit ?? ''} — 답 내기` : '답 내기';
    sub.set(blank ? Boolean(blank.filled) : Boolean(text));
  };
  const el = h('div.input', h('div.answer-row', box, unit), keypad(onKey, [allowDot ? '.' : null, allowSlash ? '/' : null].filter(Boolean)), submitBtn, sub.note);
  render();
  syncBtn();
  return {
    el,
    value: () => (blank ? { blank: blank.filled } : text),
    reset: () => {
      text = '';
      render();
      syncBtn();
    },
    // size: 빈칸에 들어갈 숫자 개수(보통 1, '0.1이 ☐개'처럼 두 자리면 2)
    setBlank: (pattern, size = 1) => {
      blank = { pattern, filled: '', size };
      render();
      syncBtn();
    },
    clearBlank: () => {
      blank = null;
      render();
      syncBtn();
    },
    fill: (v) => {
      text = v;
      render();
      syncBtn();
    },
    lock: (on) => el.classList.toggle('locked', on),
  };
}

function choiceInput(input, onSubmit) {
  let chosen = null;
  const btns = input.options.map((o) =>
    h('button.choice', {
      type: 'button',
      onclick: () => {
        chosen = o;
        btns.forEach((b) => b.classList.toggle('chosen', b.textContent === o));
        sub.set(true);
      },
    }, o),
  );
  const sub = submitButton(onSubmit, '하나를 먼저 골라요');
  sub.set(false);
  const el = h('div.input', h('div.choices', btns), sub.btn, sub.note);
  return { el, value: () => chosen, reset: () => { chosen = null; btns.forEach((b) => b.classList.remove('chosen')); sub.set(false); }, setBlank() {}, clearBlank() {}, lock: (on) => el.classList.toggle('locked', on) };
}

function compoundInput(input, onSubmit) {
  const vals = {};
  let active = input.fields.find((f) => !f.options)?.key ?? null;
  const rows = input.fields.map((f) => {
    if (f.options) {
      const btns = f.options.map((o) => h('button.choice.small', { type: 'button', onclick: () => { vals[f.key] = o; btns.forEach((b) => b.classList.toggle('chosen', b.textContent === o)); } }, o));
      return h('div.field', h('label', f.label), h('div.choices', btns));
    }
    const box = h('div.answer-box.field-box', { onclick: () => { active = f.key; paint(); } });
    box.dataset.key = f.key;
    return h('div.field', h('label', f.label), box);
  });
  const paint = () => {
    for (const r of rows) {
      const box = r.querySelector('.field-box');
      if (!box) continue;
      box.textContent = vals[box.dataset.key] ?? ' ';
      box.classList.toggle('active', box.dataset.key === active);
    }
  };
  const onKey = (k) => {
    if (!active) return;
    const cur = vals[active] ?? '';
    vals[active] = k === '⌫' ? cur.slice(0, -1) : (cur + k).slice(0, input.fields.find((x) => x.key === active)?.maxDigits ?? 8);
    paint();
  };
  const hasNumber = input.fields.some((f) => !f.options);
  const extra = [input.fields.some((f) => f.kind === 'decimal' || f.kind === 'numberline') ? '.' : null, input.fields.some((f) => f.kind === 'fraction') ? '/' : null].filter(Boolean);
  const el = h('div.input', rows, hasNumber ? keypad(onKey, extra) : null, h('button.submit', { type: 'button', onclick: () => onSubmit() }, '답 내기'));
  paint();
  return { el, value: () => ({ ...vals }), reset: () => { for (const k of Object.keys(vals)) delete vals[k]; paint(); }, setBlank() {}, clearBlank() {}, lock: (on) => el.classList.toggle('locked', on) };
}

function equationInput(onSubmit) {
  const v = { left: '', op: '', right: '', result: '' };
  let active = 'left';
  const slot = (key) => {
    const b = h('div.answer-box.eq-box', { onclick: () => { active = key; paint(); } });
    b.dataset.key = key;
    return b;
  };
  const left = slot('left');
  const right = slot('right');
  const result = slot('result');
  const ops = ['+', '-', '×', '÷'].map((o) => h('button.op', { type: 'button', onclick: () => { v.op = o; paint(); } }, o === '-' ? '−' : o));
  const opShow = h('span.eq-op');
  const paint = () => {
    ops.forEach((b, i) => b.classList.toggle('chosen', ['+', '-', '×', '÷'][i] === v.op));
    for (const b of [left, right, result]) {
      b.textContent = v[b.dataset.key] || ' ';
      b.classList.toggle('active', b.dataset.key === active);
    }
    opShow.textContent = v.op === '-' ? '−' : v.op || '○';
  };
  const onKey = (k) => {
    v[active] = k === '⌫' ? v[active].slice(0, -1) : (v[active] + k).slice(0, 6);
    paint();
  };
  const el = h('div.input', h('div.equation', left, opShow, right, h('span', '='), result), h('div.ops', ops), keypad(onKey), h('button.submit', { type: 'button', onclick: () => onSubmit() }, '답 내기'));
  paint();
  return { el, value: () => ({ ...v }), reset: () => { Object.assign(v, { left: '', op: '', right: '', result: '' }); active = 'left'; paint(); }, setBlank() {}, clearBlank() {}, lock: (on) => el.classList.toggle('locked', on) };
}

const noop = () => {};
const api = (el, value, reset) => ({ el, value, reset, setBlank: noop, clearBlank: noop, lock: (on) => el.classList.toggle('locked', on) });

/** 여럿 고르기: 고른 값 배열(작은 차례) */
function multiInput(input, onSubmit) {
  const chosen = new Set();
  const btns = input.options.map((o) => {
    const b = h('button.choice.small', { type: 'button', onclick: () => { chosen.has(o) ? chosen.delete(o) : chosen.add(o); b.classList.toggle('chosen', chosen.has(o)); sub.set(chosen.size > 0); } }, String(o));
    return b;
  });
  const sub = submitButton(onSubmit, '맞는 것을 먼저 골라요');
  sub.set(false);
  const el = h('div.input', h('div.small', '맞는 것을 모두 골라요.'), h('div.choices', btns), sub.btn, sub.note);
  return api(el, () => input.options.filter((o) => chosen.has(o)), () => { chosen.clear(); btns.forEach((b) => b.classList.remove('chosen')); sub.set(false); });
}

/** 순서 정하기: 누른 차례대로 배열 */
function orderInput(input, onSubmit) {
  let seq = [];
  const shown = h('div.answer-box.order-box');
  const paint = () => { shown.textContent = seq.length ? seq.join('  →  ') : ' '; 
    // 고른 것 = 굵은 테두리 + 배지 안에 누른 차례
    btns.forEach((b, i) => { const k = seq.indexOf(input.items[i]); b.classList.toggle('chosen', k >= 0); if (k >= 0) b.dataset.order = String(k + 1); else delete b.dataset.order; });
    sub.set(seq.length > 0);
  };
  const sub = submitButton(onSubmit, '차례대로 먼저 눌러요');
  const btns = input.items.map((o) => h('button.choice.small', { type: 'button', onclick: () => { if (!seq.includes(o)) seq.push(o); paint(); } }, String(o)));
  const el = h('div.input', h('div.small', '차례대로 눌러요.'), shown, h('div.choices', btns), h('div.choices', h('button.secondary', { type: 'button', onclick: () => { seq.pop(); paint(); } }, icon('backspace'), '하나 지우기')), sub.btn, sub.note);
  paint();
  return api(el, () => seq.slice(), () => { seq = []; paint(); });
}

/** 칸 색칠: 칠한 칸 수(화면에 칠한 칸 수는 쓰지 않는다, SPEC 9.4) */
function paintInput(input, onSubmit) {
  const on = new Set();
  const cells = Array.from({ length: input.cells }, (_, i) => {
    const c = h('button.paint-cell', { type: 'button', 'aria-label': `${i + 1}번째 칸`, onclick: () => { on.has(i) ? on.delete(i) : on.add(i); c.classList.toggle('on', on.has(i)); } });
    return c;
  });
  const el = h('div.input', h('div.small', '칸을 눌러 색칠해요.'), h('div.paint-row', cells), h('button.submit', { type: 'button', onclick: () => onSubmit() }, '답 내기'));
  return api(el, () => on.size, () => { on.clear(); cells.forEach((c) => c.classList.remove('on')); });
}

/** 고르기 문제의 "어떻게 어림했어요?" 칸: 채워야 선택지를 누를 수 있다(SPEC 4절). 내용은 채점하지 않는다. */
function withHow(inner, labelText) {
  let how = '';
  const box = h('div.answer-box.how-box', ' ');
  const keys = h('div.keypad.mini', ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+', '−', '⌫'].map((k) => h('button.key', { type: 'button', 'aria-label': k === '⌫' ? '하나 지우기' : k, onclick: () => { how = k === '⌫' ? how.slice(0, -1) : (how + k).slice(0, 16); box.textContent = how || ' '; inner.el.querySelector('.choices')?.classList.toggle('locked', !how); } }, k === '⌫' ? icon('backspace') : k)));
  inner.el.querySelector('.choices')?.classList.add('locked');
  inner.el.prepend(h('div.how', h('div.small', labelText), box, keys));
  return { ...inner, value: () => (how ? inner.value() : null) };
}
