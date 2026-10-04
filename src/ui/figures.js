// 문제 그림. 템플릿의 figure 객체를 그린다. 모르는 그림 종류는 그리지 않는다(문장만으로 풀 수 있어야 한다).
// 그림이 판단을 대신하지 않게 한다(SPEC 9.5c): 합계나 답을 그림에 쓰지 않는다.
// 'vertical'(세로셈)은 그리지 않는다. 세로셈 틀은 연습장에서 빈 채로 쓴다(한 길만 밀어주지 않게).
import { h, s } from './dom.js';
import { LINES } from '../engine/world.js';

const INK = '#1F3342';
const SHADE = '#9FB3C1';
// 시각 자문 1차 그림 규칙(docs/visual/assets/figure-kit.mjs). 새 그림(clock·ruler·timeband)부터 이 값을 쓴다.
const FIG = { fill: '#7F93A3', mute: '#7A8691', outline: 2, divider: 1.5, grid: 1, mark: 4 };

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
  placeValue: (fig) => base10(fig),
  clock: (fig) => clock(fig),
  ruler: (fig) => ruler(fig),
  timeband: (fig) => timeband(fig),
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
      const filled = (v) => (Array.isArray(v) ? v.includes(i) : typeof v === 'number' && i < v);
      const shaded = filled(t.full) || filled(t.crowded);
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

function numberline({ from, to, ticks, shaded, mark, marks, origin, unit }) {
  const W = 340;
  // unit이 있으면 끝 눈금 글자에 단위를 붙이므로(예: "2000 m") 양옆 여백을 넓힌다
  const svg = s('svg', { viewBox: unit ? `-14 0 ${W + 68} 64` : `0 0 ${W + 40} 64`, class: 'figure' });
  const u = (v) => (unit ? `${v} ${unit}` : String(v));
  const x = (i) => 20 + (i / ticks) * W;
  svg.append(s('line', { x1: 20, y1: 30, x2: 20 + W, y2: 30, stroke: INK, 'stroke-width': 2 }));
  if (typeof shaded === 'number' && shaded > 0) svg.append(s('line', { x1: x(0), y1: 30, x2: x(shaded), y2: 30, stroke: SHADE, 'stroke-width': 8 }));
  for (let i = 0; i <= ticks; i++) svg.append(s('line', { x1: x(i), y1: i === 0 || i === ticks ? 20 : 25, x2: x(i), y2: i === 0 || i === ticks ? 40 : 35, stroke: INK, 'stroke-width': 1.5 }));
  svg.append(s('text', { x: x(0), y: 56, 'text-anchor': 'middle', class: 'fig-label' }, origin ?? u(from)), s('text', { x: x(ticks), y: 56, 'text-anchor': 'middle', class: 'fig-label' }, u(to)));
  // 점 표시: mark 하나 또는 marks 여러 개(진한 삼각, 위). 점이 가리키는 수는 쓰지 않는다
  for (const v of [mark, ...(Array.isArray(marks) ? marks : [])]) {
    if (typeof v !== 'number') continue;
    const t = ((v - from) / (to - from)) * ticks;
    svg.append(s('path', { d: `M ${x(t)} 22 l -6 -10 h 12 z`, fill: INK }));
  }
  return wrap(svg);
}

/**
 * 노선 그림. times: 역 사이마다 걸리는 시간 글자(선 위), stop: { at, time } 그 역에서 멈추는 시간([정차 30초] 꼬리표),
 * line: 노선 id('1', '2' …, 없으면 1호선) — 노선 공식 색(docs/FACTS.md, src/data/busan.json)
 */
function stations({ stations: names, times, stop, line = '1' }) {
  const lineColor = LINES.find((l) => l.id === String(line))?.color ?? '#F7941D';
  const hasTimes = Array.isArray(times) && times.length > 0;
  const stopIdx = stop ? names.indexOf(stop.at) : -1;
  const W = Math.max(220, names.length * (hasTimes ? 110 : 90));
  const top = hasTimes ? 16 : 0; // 시간 글자 자리
  const ly = 22 + top;
  const H = 56 + top + (stopIdx >= 0 ? 28 : 0);
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'figure' });
  const step = (W - 40) / Math.max(1, names.length - 1);
  const sx = (i) => 20 + step * i;
  svg.append(s('line', { x1: 20, y1: ly, x2: sx(names.length - 1), y2: ly, stroke: INK, 'stroke-width': 8, 'stroke-linecap': 'round' }), s('line', { x1: 20, y1: ly, x2: sx(names.length - 1), y2: ly, stroke: lineColor, 'stroke-width': 4, 'stroke-linecap': 'round' }));
  if (hasTimes) times.forEach((tx, i) => { if (tx != null && i < names.length - 1) svg.append(s('text', { x: (sx(i) + sx(i + 1)) / 2, y: ly - 10, 'text-anchor': 'middle', class: 'fig-label fig-strong' }, String(tx))); });
  names.forEach((nm, i) => svg.append(s('circle', { cx: sx(i), cy: ly, r: 6, fill: '#fff', stroke: INK, 'stroke-width': 2.5 }), s('text', { x: sx(i), y: ly + 26, 'text-anchor': 'middle', class: 'fig-label' }, nm)));
  if (stopIdx >= 0) {
    // 정차 꼬리표. ⏸는 오답 신호와 같은 모양이라 그림에 쓰지 않는다(시각 3차)
    const label = `정차 ${stop.time}`;
    const w = 20 + label.length * 13;
    const cx = Math.min(Math.max(sx(stopIdx), w / 2 + 2), W - w / 2 - 2);
    const cy = ly + 46;
    svg.append(
      s('rect', { x: cx - w / 2, y: cy - 14, width: w, height: 26, rx: 6, fill: '#fff', stroke: INK, 'stroke-width': FIG.outline }),
      s('text', { x: cx, y: cy + 5, 'text-anchor': 'middle', class: 'fig-label fig-strong' }, label),
    );
  }
  return wrap(svg);
}

/** 바늘 시계: 시침(짧고 굵게)·분침(길게)·초침(s가 있을 때만, 가늘게 + 꼬리). 숫자 1~12, 분 눈금 60개(5분마다 길게). 시각을 글자로 쓰지 않는다 */
function clock({ h = 12, m = 0, s: sec }) {
  const C = 110;
  const R = 96;
  const svg = s('svg', { viewBox: '0 0 220 220', class: 'figure clock-fig', role: 'img', 'aria-label': '바늘 시계' });
  svg.append(s('circle', { cx: C, cy: C, r: R, fill: '#fff', stroke: INK, 'stroke-width': 3 }));
  const at = (deg, r) => [C + r * Math.sin((deg * Math.PI) / 180), C - r * Math.cos((deg * Math.PI) / 180)];
  for (let i = 0; i < 60; i++) {
    const big = i % 5 === 0;
    const [x1, y1] = at(i * 6, R - (big ? 12 : 6));
    const [x2, y2] = at(i * 6, R - 1.5);
    svg.append(s('line', { x1, y1, x2, y2, stroke: big ? INK : FIG.mute, 'stroke-width': big ? FIG.outline : FIG.divider, 'stroke-linecap': 'round' }));
  }
  for (let n = 1; n <= 12; n++) {
    const [x, y] = at(n * 30, R - 28);
    svg.append(s('text', { x, y: y + 7, 'text-anchor': 'middle', class: 'clock-num' }, String(n)));
  }
  const hasSec = typeof sec === 'number';
  const sv = hasSec ? sec : 0;
  const hand = (deg, len, width, tail = 0) => {
    const [x2, y2] = at(deg, len);
    const [x1, y1] = at(deg + 180, tail);
    return s('line', { x1, y1, x2, y2, stroke: INK, 'stroke-width': width, 'stroke-linecap': 'round' });
  };
  svg.append(hand(((h % 12) + m / 60 + sv / 3600) * 30, 50, 7));
  svg.append(hand((m + sv / 60) * 6, 78, 4));
  if (hasSec) svg.append(hand(sv * 6, 86, 1.5, 18), s('circle', { cx: C, cy: C, r: 4, fill: '#fff', stroke: INK, 'stroke-width': 1.5 }));
  svg.append(s('circle', { cx: C, cy: C, r: hasSec ? 2 : 5, fill: INK }));
  return wrap(svg);
}

/** 자: cm 큰 눈금과 숫자 0~cm, mm: true면 작은 눈금(5 mm 눈금은 중간 길이). mark.from·to는 mm 위치, 그 구간에 물건 띠 + 이름. 길이는 쓰지 않는다 */
function ruler({ cm = 10, mm = false, mark }) {
  const U = 30; // 1 cm = 30
  const X0 = 20;
  const W = cm * U;
  const x = (v) => X0 + (v / 10) * U; // v: mm
  const RY = 52; // 자 윗변
  const svg = s('svg', { viewBox: `0 0 ${W + 40} 124`, class: 'figure ruler-fig' });
  if (mark && typeof mark.from === 'number' && typeof mark.to === 'number') {
    const a = x(mark.from);
    const b = x(mark.to);
    svg.append(s('rect', { x: a, y: 10, width: Math.max(0, b - a), height: 30, rx: 6, fill: '#fff', stroke: INK, 'stroke-width': FIG.outline }));
    if (mark.label) svg.append(s('text', { x: (a + b) / 2, y: 31, 'text-anchor': 'middle', class: 'fig-label fig-strong' }, mark.label));
    // 물건 끝에서 자 눈금까지 가는 맞춤선(보조선)
    for (const xx of [a, b]) svg.append(s('line', { x1: xx, y1: 40, x2: xx, y2: RY, stroke: FIG.mute, 'stroke-width': FIG.grid }));
  }
  svg.append(s('rect', { x: X0 - 12, y: RY, width: W + 24, height: 62, rx: 6, fill: '#fff', stroke: INK, 'stroke-width': FIG.outline }));
  const step = mm ? 1 : 10;
  for (let v = 0; v <= cm * 10; v += step) {
    const isCm = v % 10 === 0;
    const len = isCm ? 22 : v % 5 === 0 ? 15 : 9;
    svg.append(s('line', { x1: x(v), y1: RY, x2: x(v), y2: RY + len, stroke: INK, 'stroke-width': isCm ? FIG.outline : FIG.divider }));
    if (isCm) svg.append(s('text', { x: x(v), y: RY + 42, 'text-anchor': 'middle', class: 'fig-label fig-strong' }, String(v / 10)));
  }
  svg.append(s('text', { x: X0 + W + 6, y: RY + 56, 'text-anchor': 'end', class: 'fig-label' }, 'cm'));
  return wrap(svg);
}

/** 시간 띠(초 단위): 축과 눈금(marks초마다, 1분마다 길게 + "N분" 글자), 그 위에 막대.
 *  unknown: true인 막대는 점선(= 아직, 선 문법)으로 길이를 묻는 칸. 막대 길이는 글자로 쓰지 않는다 */
function timeband({ from = 0, to = 360, marks = 10, bars = [] }) {
  const W = 360;
  const X0 = 24;
  const span = Math.max(1, to - from);
  const x = (t) => X0 + ((t - from) / span) * W;
  const AY = 52; // 축
  const svg = s('svg', { viewBox: `0 0 ${W + 48} 84`, class: 'figure timeband-fig' });
  for (const b of bars) {
    const a = x(b.from);
    const w = Math.max(0, x(b.to) - a);
    svg.append(s('rect', b.unknown
      ? { x: a, y: 14, width: w, height: 28, rx: 4, fill: 'var(--unknown-bg)', stroke: INK, 'stroke-width': FIG.outline } // 모르는 수 = 회색 실선 □(점선은 '아직·채울 칸', 시각 3차)
      : { x: a, y: 14, width: w, height: 28, rx: 4, fill: FIG.fill, stroke: INK, 'stroke-width': FIG.outline }));
    if (b.unknown) svg.append(s('text', { x: a + w / 2, y: 34, 'text-anchor': 'middle', class: 'fig-label fig-strong' }, '□'));
  }
  svg.append(s('line', { x1: x(from), y1: AY, x2: x(to), y2: AY, stroke: INK, 'stroke-width': FIG.outline }));
  const step = Math.max(1, marks);
  for (let t = from; t <= to; t += step) {
    const minute = t % 60 === 0;
    svg.append(s('line', { x1: x(t), y1: AY, x2: x(t), y2: AY + (minute ? 12 : 6), stroke: minute ? INK : FIG.mute, 'stroke-width': minute ? FIG.outline : FIG.divider }));
    if (minute) svg.append(s('text', { x: x(t), y: AY + 28, 'text-anchor': 'middle', class: 'fig-label' }, t === 0 ? '0' : `${t / 60}분`));
  }
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
