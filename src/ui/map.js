// 홈 노선도. 좌표는 Subway game의 노선도 좌표(schematic.json)와 같다(두 앱의 노선도 모양을 맞춘다).
// 역 상태는 모양으로 구분한다(SPEC 9.5b): 연한 빈 원(아직 못 감) / 진한 빈 원(갈 수 있음) / 이중 고리(목적지)
//   / 굵은 고리 + 흰 속(개통) / 고리 + ≫(통과역) / 꽉 찬 원(확정). 노선 선은 진한 테두리 + 속 노선 색(SPEC 9.6).
import { s } from './dom.js';
import { LINES, LINE1_NODES, stationOf } from '../engine/world.js';
import { line2Open, playableNodes } from '../engine/run.js';
import { nodeState } from '../engine/state.js';
import { FULL } from '../engine/mastery.js';
import { stationMark, stationTail, TIERS } from './art/marks.js';

const INK = '#1F3342';
const DONE = new Set(['lit', 'passed', 'confirmed']);
const MARK_TIER = TIERS.mid; // 격자 한 칸 = 20 단위. 이웃 역 간격이 약 12~20 단위라 중간 단계

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

  // 다른 노선: 개통 예정(#5E6B76 3px 점선 = 아직, 바다 3.55·육지 4.79:1. 번호 배지만 노선 색 — 시각 자문 1차 4.2)
  for (const line of LINES) {
    if (line.id === '1') continue;
    const pts = line.stations.map(P).map(([x, y]) => `${x},${y}`).join(' ');
    svg.append(s('polyline', { points: pts, fill: 'none', stroke: '#5E6B76', 'stroke-width': 3, 'stroke-dasharray': '6 4', 'stroke-linecap': 'round' }));
    const [bx, by] = P(line.stations.at(-1));
    svg.append(badge(bx, by - 26, { BGL: '김해', DH: '동해' }[line.label] ?? line.label, line.color)); // 'BGL'은 아이가 모르는 말(학생 #3)
    if (onAnyStation) for (const st of line.stations) {
      const [x, y] = P(st);
      (svg.__targets ??= []).push({ x, y, id: st.id, node: null, other: true });
    }
  }

  // 1호선, 그리고 열렸으면 2호선 시범 구간(서면에서 갈아탐 — 지도 규칙, SPEC 3.1)
  const l1 = LINES.find((l) => l.id === '1');
  const tracks = [{ nodes: LINE1_NODES, stations: l1.stations, color: l1.color, label: '1' }];
  if (line2Open(state)) {
    const l2 = LINES.find((l) => l.id === '2');
    const nodes = playableNodes('L2');
    tracks.push({ nodes, stations: nodes.map((n) => stationOf(n.id)), color: l2.color, label: '2' });
  }
  let train = null;
  for (const tr of tracks) {
    const t = drawTrack(svg, tr, { state, destId, P, onStation, onAnyStation });
    if (t) train = t;
  }
  // 내 차량: 목적지 앞(구간 진행만큼). 노선도 위 차량은 실제 차량 모양(고른 카드 차량은 출발 장면과 일지에).
  if (train) svg.append(s('g', { class: 'my-train', transform: `translate(${train[0] + 14},${train[1] - 14})` }, s('rect', { x: -12, y: -8, width: 24, height: 16, rx: 5, fill: state.profile.color || l1.color, stroke: INK, 'stroke-width': 2 }), s('rect', { x: -7, y: -4, width: 6, height: 5, fill: '#fff' }), s('rect', { x: 2, y: -4, width: 6, height: 5, fill: '#fff' })));
  // 누른 점에서 가장 가까운 역(화면에서 반경 24 CSS px 안). 원을 키우면 이웃 역과 겹치므로 거리로 고른다(UX 확인).
  svg.addEventListener('click', (e) => {
    const m = svg.getScreenCTM();
    if (!m || !svg.__targets) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const scale = Math.hypot(m.a, m.b) || 1;
    let best = null;
    for (const t of svg.__targets) {
      const d = Math.hypot(t.x - pt.x, t.y - pt.y) * scale - (t.other ? 0 : 6); // 켤 수 있는 노선의 역을 조금 우선
      if (d <= 24 && (!best || d < best.d)) best = { ...t, d };
    }
    if (!best) return;
    if (best.node && onStation) onStation(best.node);
    if (onAnyStation) onAnyStation(best.id);
  });
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

/** 한 노선(또는 시범 구간)의 선로·역·진행을 그린다. 목적지가 이 노선에 있으면 차량 자리를 돌려준다. */
function drawTrack(svg, { nodes, stations, color, label }, { state, destId, P, onStation, onAnyStation }) {
  const pos = stations.map(P);
      const nss = nodes.map((n) => nodeState(state, n.id));
  const ns = (i) => nss[i];
  const status = nss.map((x) => x.status);
  svg.append(s('polyline', { points: pos.map((p) => p.join(',')).join(' '), fill: 'none', stroke: INK, 'stroke-width': 10, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
  for (let i = 0; i < pos.length - 1; i++) {
    const on = DONE.has(status[i]) && DONE.has(status[i + 1]);
    svg.append(s('line', { x1: pos[i][0], y1: pos[i][1], x2: pos[i + 1][0], y2: pos[i + 1][1], stroke: on ? color : '#FFFFFF', 'stroke-width': 7, 'stroke-linecap': 'round' }));
  }
  const destIdx = nodes.findIndex((n) => n.id === destId);
  if (destIdx > 0) {
    const halves = nodeState(state, destId).halves;
    const from = pos[destIdx - 1];
    const to = pos[destIdx];
    if (halves > 0) svg.append(s('line', { x1: from[0], y1: from[1], x2: from[0] + ((to[0] - from[0]) * halves) / FULL, y2: from[1] + ((to[1] - from[1]) * halves) / FULL, stroke: color, 'stroke-width': 8, 'stroke-linecap': 'round' }));
  }
  const end = label === '1' ? pos.at(-1) : pos[0];
  svg.append(badge(end[0] + 26, end[1] + (label === '1' ? 0 : -24), label, color));
  nodes.forEach((n, i) => {
    const [x, y] = pos[i];
    const st = status[i];
    const g = s('g', { class: 'station', tabindex: 0, role: 'button', 'aria-label': `${stations[i].name}역` });
    g.append(s('circle', { cx: x, cy: y, r: 14, fill: 'transparent' })); // 누르는 영역
    const isDest = n.id === destId;
    // 역 점 모양은 art/marks.js(시각 4차 map-marks.mjs): 켜짐 = 노선 색 굵은 고리(흰 구멍) + 진한 테 + 옅은 빛 테, 확정 = 꽉 참,
    // 통과 = 켜짐 + ≫, 점검 = 켜진 모양 + 바깥 점선 고리, 점검 목적지 = 이중 고리의 바깥만 점선.
    // 목적지가 아닌 꺼진 역은 모두 회색 빈 원(아직, UX 8차 5a — 진한 빈 원은 쓰지 않음)
    const inspect = DONE.has(st) && ns(i).inspect;
    const mark = isDest ? (inspect ? 'check-dest' : 'dest') : inspect ? 'check' : DONE.has(st) ? st : 'locked';
    const tail = DONE.has(st) && !isDest ? stationTail(x, y, pos[i - 1] ?? null, pos[i + 1] ?? null, color, MARK_TIER) : '';
    const art = s('g', {});
    art.innerHTML = tail + stationMark(x, y, mark, color, MARK_TIER);
    g.append(art);
    const showName = isDest || DONE.has(st) || (label === '1' && (i === 0 || i === pos.length - 1));
    if (showName) g.append(s('text', { x: x - 12, y: y + 4, class: `st-name${DONE.has(st) || isDest ? ' bold' : ''}`, 'text-anchor': 'end' }, stations[i].name));
    (svg.__targets ??= []).push({ x, y, id: stations[i].id, node: n.id });
    svg.append(g);
  });
  if (destIdx < 0) return null;
  const halves = nodeState(state, destId).halves;
  const from = pos[Math.max(0, destIdx - 1)];
  const to = pos[destIdx];
  const t = destIdx === 0 ? 0 : halves / FULL;
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
}
