// 문제 그림. 템플릿의 figure 객체를 그린다. 모르는 그림 종류는 그리지 않는다(문장만으로 풀 수 있어야 한다).
// 그림이 판단을 대신하지 않게 한다(SPEC 9.5c): 합계나 답을 그림에 쓰지 않는다.
// 'vertical'(세로셈)은 그리지 않는다. 세로셈 틀은 연습장에서 빈 채로 쓴다(한 길만 밀어주지 않게).
import { h, s } from './dom.js';

const INK = '#1F3342';
const SHADE = '#9FB3C1';

export function drawFigure(fig) {
  if (!fig) return null;
  const f = DRAW[fig.kind];
  return f ? f(fig) : null;
}

const DRAW = {
  train: (fig) => trains({ trains: [{ name: fig.name ?? '', cars: fig.cars ?? 8, split: fig.split, highlight: fig.highlight, crowded: fig.crowded, perCar: fig.perCar, full: fig.full ?? fig.filled ?? fig.shaded }] }),
  trains: (fig) => trains(fig),
  cards: (fig) => h('div.fig-cards', fig.cards.map((c) => h('span.num-card', String(c)))),
  groups: (fig) => groups(fig),
  strip: (fig) => strip(fig),
  strips: (fig) => wrap(h('div.fig-strips', fig.strips.map((k) => stripSvg(Array.from({ length: k }, () => 1), [], 280)))),
  squares: (fig) => squares(fig),
  numberline: (fig) => numberline(fig),
  stations: (fig) => stations(fig),
  table: (fig) => table(fig),
  base10: (fig) => base10(fig),
  array: (fig) => arrayFig(fig),
  areaModel: (fig) => areaModel(fig),
};

const wrap = (el, caption) => h('div.fig', el, caption ? h('div.fig-cap', caption) : null);

function car(x, y, w, end, { shaded, mark } = {}) {
  return s('g', {}, s('rect', { x, y, width: w, height: 22, rx: end ? 8 : 3, fill: shaded ? SHADE : '#fff', stroke: INK, 'stroke-width': mark ? 3 : 1.6 }), s('rect', { x: x + 6, y: y + 5, width: 8, height: 6, fill: '#DCE6EE' }), s('rect', { x: x + w - 14, y: y + 5, width: 8, height: 6, fill: '#DCE6EE' }));
}

function trains({ trains: list, coupled }) {
  const carW = 34;
  const gap = 4;
  const total = coupled ? list.reduce((a, t) => a + t.cars, 0) : Math.max(...list.map((t) => t.cars));
  const width = total * (carW + gap) + (coupled ? list.length * 8 : 0) + 20;
  const height = coupled ? 52 : list.length * 52 + 6;
  const svg = s('svg', { viewBox: `0 0 ${width} ${height}`, class: 'figure' });
  if (coupled) {
    let x = 10;
    list.forEach((t) => {
      for (let i = 0; i < t.cars; i++, x += carW + gap) svg.append(car(x, 18, carW, i === 0 || i === t.cars - 1));
      x += 8;
    });
    return wrap(svg);
  }
  list.forEach((t, r) => {
    const y = r * 52 + 22;
    if (t.name) svg.append(s('text', { x: 10, y: y - 6, class: 'fig-label' }, t.name));
    for (let i = 0; i < t.cars; i++) {
      const extraGap = t.split && i >= t.split ? 10 : 0; // 앞 몇 량과 뒤 몇 량 나눠 보이기
      const shaded = (Array.isArray(t.full) && t.full.includes(i)) || (typeof t.crowded === 'number' && i < t.crowded) || (Array.isArray(t.crowded) && t.crowded.includes(i));
      const mark = Array.isArray(t.highlight) && t.highlight.includes(i);
      svg.append(car(10 + i * (carW + gap) + extraGap, y, carW, i === 0 || i === t.cars - 1, { shaded, mark }));
    }
  });
  return wrap(svg);
}

function groups({ items, groups: g }) {
  // 사람 수만 보여주고 나누는 건 아이가 한다(칸 안 사람 수를 숫자로 보여주지 않음).
  const perRow = 12;
  const svg = s('svg', { viewBox: `0 0 ${Math.min(items, perRow) * 22 + 10} ${Math.ceil(items / perRow) * 26 + 6}`, class: 'figure' });
  for (let i = 0; i < items; i++) {
    const x = 12 + (i % perRow) * 22;
    const y = 14 + Math.floor(i / perRow) * 26;
    svg.append(s('circle', { cx: x, cy: y - 4, r: 4, fill: INK }), s('rect', { x: x - 5, y: y + 1, width: 10, height: 9, rx: 3, fill: INK }));
  }
  return wrap(svg);
}

function stripSvg(parts, shaded, width = 320, dashedEnd = false) {
  const total = parts.reduce((a, b) => a + b, 0);
  const svg = s('svg', { viewBox: `0 0 ${width + 10} 40`, class: 'figure strip' });
  let x = 5;
  parts.forEach((p, i) => {
    const w = (p / total) * width;
    svg.append(s('rect', { x, y: 6, width: w, height: 26, fill: shaded.includes(i) ? SHADE : '#fff', stroke: INK, 'stroke-width': 1.6 }));
    x += w;
  });
  if (dashedEnd) svg.append(s('line', { x1: x + 4, y1: 19, x2: width + 8, y2: 19, stroke: INK, 'stroke-dasharray': '4 4' }));
  return svg;
}

function strip(fig) {
  if (fig.partial) return wrap(stripSvg(Array.from({ length: fig.cells }, () => 1), Array.from({ length: fig.cells }, (_, i) => i), Math.min(320, fig.cells * 40), false));
  const parts = fig.parts ?? Array.from({ length: fig.cells ?? 4 }, () => 1);
  return wrap(stripSvg(parts, fig.shaded ?? []));
}

function squares({ items }) {
  const size = 64;
  return wrap(
    h('div.fig-squares', items.map((it) => {
      const svg = s('svg', { viewBox: `0 0 ${size + 4} ${size + 4}`, class: 'square-fig' });
      svg.append(s('rect', { x: 2, y: 2, width: size, height: size, fill: '#fff', stroke: INK, 'stroke-width': 2 }));
      const pieces = squarePieces(it.split, size);
      // shaded: 칠한 조각 수(앞에서부터) 또는 조각 번호 배열
      const isShaded = (i) => (Array.isArray(it.shaded) ? it.shaded.includes(i) : i < (it.shaded ?? 0));
      pieces.forEach((p, i) => svg.append(s('polygon', { points: p.map(([x, y]) => `${x + 2},${y + 2}`).join(' '), fill: isShaded(i) ? SHADE : 'none', stroke: INK, 'stroke-width': 1.5 })));
      return h('div.square-item', svg, h('div.fig-cap', it.label));
    })),
  );
}

/** 정사각형 나누기: 'cols4'·'cols3'(세로 줄), 'rows4'(가로 줄), 'grid2x2'(2×2), 'diagonals'(대각선 4조각), 'uneven4'(크기가 다른 4조각) */
function squarePieces(split, S) {
  const v = (n) => Array.from({ length: n }, (_, i) => [[(i * S) / n, 0], [((i + 1) * S) / n, 0], [((i + 1) * S) / n, S], [(i * S) / n, S]]);
  const hz = (n) => Array.from({ length: n }, (_, i) => [[0, (i * S) / n], [S, (i * S) / n], [S, ((i + 1) * S) / n], [0, ((i + 1) * S) / n]]);
  const c = S / 2;
  switch (split) {
    case 'h4':
    case 'rows4': return hz(4);
    case 'grid2x2':
    case 'grid4': return [[[0, 0], [c, 0], [c, c], [0, c]], [[c, 0], [S, 0], [S, c], [c, c]], [[0, c], [c, c], [c, S], [0, S]], [[c, c], [S, c], [S, S], [c, S]]];
    case 'diagonals':
    case 'diag4': return [[[0, 0], [S, 0], [c, c]], [[S, 0], [S, S], [c, c]], [[S, S], [0, S], [c, c]], [[0, S], [0, 0], [c, c]]];
    case 'uneven4': return [[[0, 0], [S * 0.5, 0], [S * 0.5, S], [0, S]], [[S * 0.5, 0], [S, 0], [S, c], [S * 0.5, c]], [[S * 0.5, c], [S * 0.75, c], [S * 0.75, S], [S * 0.5, S]], [[S * 0.75, c], [S, c], [S, S], [S * 0.75, S]]];
    case 'v4':
    default: {
      const m = String(split ?? '').match(/(\d+)/);
      return v(m ? Number(m[1]) : 4);
    }
  }
}

function numberline({ from, to, ticks, shaded, mark, origin }) {
  const W = 340;
  const svg = s('svg', { viewBox: `0 0 ${W + 40} 64`, class: 'figure' });
  const x = (i) => 20 + (i / ticks) * W;
  svg.append(s('line', { x1: 20, y1: 30, x2: 20 + W, y2: 30, stroke: INK, 'stroke-width': 2 }));
  if (typeof shaded === 'number' && shaded > 0) svg.append(s('line', { x1: x(0), y1: 30, x2: x(shaded), y2: 30, stroke: SHADE, 'stroke-width': 8 }));
  for (let i = 0; i <= ticks; i++) svg.append(s('line', { x1: x(i), y1: i === 0 || i === ticks ? 20 : 25, x2: x(i), y2: i === 0 || i === ticks ? 40 : 35, stroke: INK, 'stroke-width': 1.5 }));
  svg.append(s('text', { x: x(0), y: 56, 'text-anchor': 'middle', class: 'fig-label' }, origin ?? String(from)), s('text', { x: x(ticks), y: 56, 'text-anchor': 'middle', class: 'fig-label' }, String(to)));
  if (typeof mark === 'number') {
    const t = ((mark - from) / (to - from)) * ticks;
    svg.append(s('path', { d: `M ${x(t)} 10 l -6 -8 h 12 z`, fill: INK }));
  }
  return wrap(svg);
}

function stations({ stations: names }) {
  const W = Math.max(220, names.length * 90);
  const svg = s('svg', { viewBox: `0 0 ${W} 56`, class: 'figure' });
  const step = (W - 40) / Math.max(1, names.length - 1);
  svg.append(s('line', { x1: 20, y1: 22, x2: 20 + step * (names.length - 1), y2: 22, stroke: INK, 'stroke-width': 8, 'stroke-linecap': 'round' }), s('line', { x1: 20, y1: 22, x2: 20 + step * (names.length - 1), y2: 22, stroke: '#F7941D', 'stroke-width': 4, 'stroke-linecap': 'round' }));
  names.forEach((nm, i) => svg.append(s('circle', { cx: 20 + step * i, cy: 22, r: 6, fill: '#fff', stroke: INK, 'stroke-width': 2.5 }), s('text', { x: 20 + step * i, y: 48, 'text-anchor': 'middle', class: 'fig-label' }, nm)));
  return wrap(svg);
}

function table({ columns, rows }) {
  return wrap(h('table.fig-table', h('tr', columns.map((c) => h('th', c))), rows.map((r) => h('tr', { onclick: (e) => e.currentTarget.classList.toggle('marked') }, r.map((c) => h('td', String(c)))))));
}

function base10({ hundreds = 0, tens = 0, ones = 0 }) {
  const svg = s('svg', { viewBox: `0 0 ${hundreds * 46 + tens * 14 + Math.ceil(ones / 5) * 14 + 40} 50`, class: 'figure' });
  let x = 6;
  for (let i = 0; i < hundreds; i++, x += 46) {
    svg.append(s('rect', { x, y: 4, width: 40, height: 40, fill: '#fff', stroke: INK, 'stroke-width': 1.6 }));
    for (let k = 1; k < 10; k++) svg.append(s('line', { x1: x + k * 4, y1: 4, x2: x + k * 4, y2: 44, stroke: '#C5D0D8', 'stroke-width': 0.6 }), s('line', { x1: x, y1: 4 + k * 4, x2: x + 40, y2: 4 + k * 4, stroke: '#C5D0D8', 'stroke-width': 0.6 }));
  }
  x += 6;
  for (let i = 0; i < tens; i++, x += 14) svg.append(s('rect', { x, y: 4, width: 8, height: 40, fill: '#fff', stroke: INK, 'stroke-width': 1.4 }));
  x += 6;
  for (let i = 0; i < ones; i++) svg.append(s('rect', { x: x + Math.floor(i / 5) * 14, y: 4 + (i % 5) * 9, width: 8, height: 8, fill: '#fff', stroke: INK, 'stroke-width': 1.2 }));
  return wrap(svg);
}

function arrayFig({ rows, cols, label }) {
  const c = 18;
  const svg = s('svg', { viewBox: `0 0 ${cols * c + 10} ${rows * c + 10}`, class: 'figure' });
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) svg.append(s('rect', { x: 5 + k * c, y: 5 + r * c, width: c - 4, height: c - 4, rx: 3, fill: '#fff', stroke: INK, 'stroke-width': 1.4 }));
  return wrap(svg, label ?? null);
}

function areaModel({ parts }) {
  const [cols = [1], rows = [1]] = parts ?? [];
  const tw = cols.reduce((a, b) => a + b, 0);
  const th = rows.reduce((a, b) => a + b, 0);
  const W = 300;
  const H = Math.max(60, Math.min(180, (th / tw) * W));
  const svg = s('svg', { viewBox: `0 0 ${W + 50} ${H + 40}`, class: 'figure' });
  let y = 24;
  rows.forEach((rv) => {
    const hh = (rv / th) * H;
    let x = 40;
    cols.forEach((cv) => {
      const ww = (cv / tw) * W;
      svg.append(s('rect', { x, y, width: ww, height: hh, fill: '#fff', stroke: INK, 'stroke-width': 1.6 }));
      x += ww;
    });
    svg.append(s('text', { x: 32, y: y + hh / 2 + 5, 'text-anchor': 'end', class: 'fig-label' }, String(rv)));
    y += hh;
  });
  let x = 40;
  cols.forEach((cv) => {
    const ww = (cv / tw) * W;
    svg.append(s('text', { x: x + ww / 2, y: 18, 'text-anchor': 'middle', class: 'fig-label' }, String(cv)));
    x += ww;
  });
  return wrap(svg);
}
