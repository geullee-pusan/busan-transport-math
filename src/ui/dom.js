// 작은 DOM 도우미. 라이브러리 없이 쓴다.

/**
 * h('div.class#id', { onclick, attrs... }, children...)
 */
export function h(tag, props = {}, ...children) {
  const [name, ...rest] = tag.split(/(?=[.#])/);
  const el = document.createElement(name || 'div');
  for (const r of rest) {
    if (r.startsWith('.')) el.classList.add(r.slice(1));
    else if (r.startsWith('#')) el.id = r.slice(1);
  }
  if (props && (typeof props !== 'object' || props instanceof Node || Array.isArray(props))) {
    children.unshift(props);
    props = {};
  }
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') for (const [sk, sv] of Object.entries(v)) { if (sk.startsWith('--')) el.style.setProperty(sk, sv); else el.style[sk] = sv; }
    else if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

const SVGNS = 'http://www.w3.org/2000/svg';
export function s(tag, attrs = {}, ...children) {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) el.setAttribute(k, v);
  for (const c of children.flat(Infinity)) if (c) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}

export function clear(el) {
  while (el.firstChild) el.firstChild.remove();
  return el;
}

/** 거리(m) → 1 km부터는 "6 km"(정수), 그 아래는 "900 m"(100 m 단위). 소수는 쓰지 않는다. */
export const kmText = (m) => (m < 1000 ? `${Math.floor(m / 100) * 100} m` : `${Math.floor(m / 1000)} km`);
