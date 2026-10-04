// 노선도 탐험. 문제를 풀지 않아도 아무 역이나 눌러 실제 사실을 본다. 막차 뒤에도 된다.
// 둘러본 역 표시, 개수, 소리, 연출, 보상은 없다(SPEC 10장 ①).
import { h } from './dom.js';
import { LINES, TRANSFERS, segmentMeters, NODES } from '../engine/world.js';
import busan from '../data/busan.json' with { type: 'json' };

const lineOf = (stationId) => LINES.find((l) => l.stations.some((s) => s.id === stationId));

export function stationSheet(stationId, onClose) {
  const line = lineOf(stationId);
  const idx = line.stations.findIndex((s) => s.id === stationId);
  const st = line.stations[idx];
  const tr = TRANSFERS.find((t) => t.stations.includes(stationId));
  const others = tr ? tr.stations.filter((id) => id !== stationId).map((id) => lineOf(id)?.name).filter(Boolean) : [];
  const link = (a, b) => busan.links.find((k) => (k.from === a && k.to === b) || (k.from === b && k.to === a));
  const next = line.stations[idx + 1];
  const prev = line.stations[idx - 1];
  const km = (m) => `${(m / 1000).toFixed(1)} km`;
  const lines = [
    `${line.name} ${idx + 1}번째 역 (모두 ${line.stations.length}역)`,
    st.code && /^d+$/.test(st.code) ? `역 번호 ${st.code}` : null,
    st.nameEn ? `영어 이름 ${st.nameEn}` : null,
    others.length ? `갈아탈 수 있어요: ${others.join(', ')}` : null,
    prev && link(prev.id, stationId) ? `${prev.name}역까지 ${km(link(prev.id, stationId).distanceM)}` : null,
    next && link(stationId, next.id) ? `${next.name}역까지 ${km(link(stationId, next.id).distanceM)}` : null,
    line.carsPerTrain ? `열차 한 대는 ${line.carsPerTrain}량` : null,
  ].filter(Boolean);
  const sheet = h('div.sheet.explore',
    h('div.sheet-tabs', h('strong', `${st.name}역`), h('button.icon-btn', { type: 'button', onclick: () => { sheet.remove(); onClose?.(); } }, '✕')),
    h('ul.explore-list', lines.map((l) => h('li', l))),
    h('p.small', '출처: 부산교통공사·공공데이터포털 자료(역 순서, 역 사이 거리, 역 번호)'),
  );
  return sheet;
}
