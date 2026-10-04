// 홈 노선도. 좌표는 Subway game의 노선도 좌표(schematic.json)와 같다(두 앱의 노선도 모양을 맞춘다).
// 역 상태는 모양으로 구분한다(SPEC 9.5b): 연한 빈 원(아직 못 감) / 진한 빈 원(갈 수 있음) / 이중 고리(목적지)
//   / 굵은 고리 + 흰 속(개통) / 고리 + ≫(통과역) / 꽉 찬 원(확정). 노선 선은 진한 테두리 + 속 노선 색(SPEC 9.6).
import { s } from './dom.js';
import { LINES, LINE1_NODES } from '../engine/world.js';
import { nodeState } from '../engine/state.js';
import { FULL } from '../engine/mastery.js';

const INK = '#1F3342';
const DONE = new Set(['lit', 'passed', 'confirmed']);

export function drawMap(state, { destId, onStation, onAnyStation } = {}) {
  // 1호선에 맞춰 확대한다. 다른 노선(개통 예정)은 가장자리에서 잘려도 된다.
  const all = LINES.find((l) => l.id === '1').stations;
  const xs = all.map((p) => p.x);
  const ys = all.map((p) => p.y);
  const pad = 3.2;
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const w = Math.max(...xs) - minX + pad;
  const hgt = Math.max(...ys) - minY + pad;
  const S = 20; // 격자 한 칸 = 20
  const P = (p) => [(p.x - minX) * S, (p.y - minY) * S];

  const svg = s('svg', { viewBox: `0 0 ${w * S} ${hgt * S}`, class: 'map', role: 'img', 'aria-label': '부산 도시철도 노선도' });

  // 다른 노선: 개통 예정(가는 회색 점선, 번호 배지만 노선 색)
  for (const line of LINES) {
    if (line.id === '1') continue;
    const pts = line.stations.map(P).map(([x, y]) => `${x},${y}`).join(' ');
    svg.append(s('polyline', { points: pts, fill: 'none', stroke: '#9AA5AD', 'stroke-width': 3, 'stroke-dasharray': '6 6', 'stroke-linecap': 'round' }));
    const [bx, by] = P(line.stations.at(-1));
    svg.append(badge(bx, by - 26, line.label, line.color));
    if (onAnyStation) for (const st of line.stations) {
      const [x, y] = P(st);
      const dot = s('circle', { cx: x, cy: y, r: 6, fill: 'transparent', stroke: 'none', class: 'tap-dot', role: 'button', 'aria-label': `${st.name}역` });
      dot.addEventListener('click', () => onAnyStation(st.id));
      svg.append(dot);
    }
  }

  // 1호선
  const l1 = LINES.find((l) => l.id === '1');
  const pos = l1.stations.map(P);
  const status = LINE1_NODES.map((n) => nodeState(state, n.id).status);
  // 바깥 테두리
  svg.append(s('polyline', { points: pos.map((p) => p.join(',')).join(' '), fill: 'none', stroke: INK, 'stroke-width': 13, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
  // 속: 빈 선로(흰색), 양 끝 역이 모두 켜진 구간만 노선 색
  for (let i = 0; i < pos.length - 1; i++) {
    const on = DONE.has(status[i]) && DONE.has(status[i + 1]);
    svg.append(s('line', { x1: pos[i][0], y1: pos[i][1], x2: pos[i + 1][0], y2: pos[i + 1][1], stroke: on ? l1.color : '#FFFFFF', 'stroke-width': 8, 'stroke-linecap': 'round' }));
  }
  // 목적지로 가는 구간의 진행(칸)
  const destIdx = LINE1_NODES.findIndex((n) => n.id === destId);
  if (destIdx >= 0) {
    const halves = nodeState(state, destId).halves;
    const from = pos[Math.max(0, destIdx - 1)];
    const to = pos[destIdx];
    if (destIdx > 0 && halves > 0) {
      const t = halves / FULL;
      svg.append(s('line', { x1: from[0], y1: from[1], x2: from[0] + (to[0] - from[0]) * t, y2: from[1] + (to[1] - from[1]) * t, stroke: l1.color, 'stroke-width': 8, 'stroke-linecap': 'round' }));
    }
  }
  svg.append(badge(pos.at(-1)[0] + 26, pos.at(-1)[1], '1', l1.color));

  // 역
  LINE1_NODES.forEach((n, i) => {
    const [x, y] = pos[i];
    const st = status[i];
    const g = s('g', { class: 'station', tabindex: 0, role: 'button', 'aria-label': `${l1.stations[i].name}역` });
    const isDest = n.id === destId;
    if (st === 'confirmed') g.append(s('circle', { cx: x, cy: y, r: 7, fill: INK, stroke: INK, 'stroke-width': 3 }));
    else if (st === 'lit') g.append(s('circle', { cx: x, cy: y, r: 7, fill: '#fff', stroke: INK, 'stroke-width': 4 }));
    else if (st === 'passed') {
      g.append(s('circle', { cx: x, cy: y, r: 7, fill: '#fff', stroke: INK, 'stroke-width': 3 }));
      g.append(s('text', { x: x + 9, y: y - 8, class: 'pass-mark' }, '≫'));
    } else if (isDest) {
      g.append(s('circle', { cx: x, cy: y, r: 10, fill: '#fff', stroke: INK, 'stroke-width': 2.5 }));
      g.append(s('circle', { cx: x, cy: y, r: 5, fill: '#fff', stroke: INK, 'stroke-width': 2.5 }));
    } else g.append(s('circle', { cx: x, cy: y, r: 5, fill: '#fff', stroke: '#B8C2C9', 'stroke-width': 2 }));
    const showName = isDest || DONE.has(st) || i === 0 || i === pos.length - 1;
    if (showName) g.append(s('text', { x: x - 12, y: y + 4, class: `st-name${DONE.has(st) || isDest ? ' bold' : ''}`, 'text-anchor': 'end' }, l1.stations[i].name));
    if (onStation) g.addEventListener('click', () => onStation(n.id));
    if (onAnyStation) g.addEventListener('click', () => onAnyStation(l1.stations[i].id));
    svg.append(g);
  });

  // 내 차량: 목적지 앞(구간 진행만큼)
  if (destIdx >= 0) {
    const halves = nodeState(state, destId).halves;
    const from = pos[Math.max(0, destIdx - 1)];
    const to = pos[destIdx];
    const t = destIdx === 0 ? 0 : halves / FULL;
    const cx = from[0] + (to[0] - from[0]) * t;
    const cy = from[1] + (to[1] - from[1]) * t;
    svg.append(s('g', { class: 'my-train', transform: `translate(${cx + 14},${cy - 14})` }, s('rect', { x: -12, y: -8, width: 24, height: 16, rx: 5, fill: state.profile.color || l1.color, stroke: INK, 'stroke-width': 2 }), s('rect', { x: -7, y: -4, width: 6, height: 5, fill: '#fff' }), s('rect', { x: 2, y: -4, width: 6, height: 5, fill: '#fff' })));
  }
  return svg;
}

function badge(x, y, label, color) {
  const wide = label.length > 1;
  const g = s('g', { class: 'line-badge' });
  if (wide) g.append(s('rect', { x: x - 20, y: y - 12, width: 40, height: 24, rx: 12, fill: color, stroke: INK, 'stroke-width': 1.5 }));
  else g.append(s('circle', { cx: x, cy: y, r: 12, fill: color, stroke: INK, 'stroke-width': 1.5 }));
  const light = ['#895FA7', '#0065B3'].includes(color);
  g.append(s('text', { x, y: y + 5, 'text-anchor': 'middle', class: 'badge-text', fill: light ? '#fff' : INK }, label));
  return g;
}
