// 개념 그래프와 1호선 역 데이터를 묶는다. 화면과 엔진이 함께 쓴다.
import graph from '../../docs/curriculum/concept-graph.json' with { type: 'json' };
import busan from '../data/busan.json' with { type: 'json' };

export const NODES = new Map(graph.nodes.map((n) => [n.id, n]));
export const LINE1 = busan.lines.find((l) => l.id === '1');

/** 1호선 노드 N01~N40 (역 순서대로) */
export const LINE1_NODES = graph.nodes.filter((n) => n.line === 'L1').sort((a, b) => a.order - b.order);

/** 노선별 노드(추천 순서대로). 화면 노선 id: L1 → '1', L2 → '2' */
export const LINE_NODES = {
  L1: LINE1_NODES,
  L2: graph.nodes.filter((n) => n.line === 'L2').sort((a, b) => a.order - b.order),
  DH: graph.nodes.filter((n) => n.line === 'DH').sort((a, b) => a.order - b.order), // 동해선(도전 노선, 커리큘럼 12)
};
export const LINE_OF_GRAPH = { L1: '1', L2: '2', DH: 'DH' };

/** 노드 → 역 정보(이름, 코드, 노선도 좌표). 1호선은 역 순서, 2호선은 개념 그래프의 역 이름으로 찾는다. */
export function stationOf(nodeId) {
  const node = NODES.get(nodeId);
  if (!node) return null;
  if (node.line === 'L1') return LINE1.stations[node.order - 1];
  const line = busan.lines.find((l) => l.id === LINE_OF_GRAPH[node.line]);
  if (!line || !node.station) return null;
  return line.stations.find((s) => s.name === node.station) ?? null;
}

const linkM = new Map(busan.links.filter((k) => k.line === '1').map((k) => [`${k.from}>${k.to}`, k.distanceM]));

/**
 * 노드 역으로 들어오는 구간의 실제 거리(m).
 * 첫 역(다대포해수욕장)은 들어오는 구간이 없으므로 첫 구간(다대포해수욕장–다대포항) 거리를 쓴다.
 * 정답인데 거리가 늘지 않는 일이 없게 하려는 것이다.
 */
export function segmentMeters(nodeId) {
  const node = NODES.get(nodeId);
  if (!node) return 0;
  if (node.line === 'L2' || node.line === 'DH') {
    // 2호선·동해선: 추천 순서상 앞 노드의 역에서 이 역까지(첫 역은 다음 역까지)
    const list = LINE_NODES[node.line];
    const i = list.findIndex((n) => n.id === nodeId);
    const a = stationOf(list[Math.max(0, i - 1)].id);
    const b = stationOf(list[Math.max(1, i)]?.id ?? nodeId);
    if (!a || !b) return 0;
    const lid = LINE_OF_GRAPH[node.line];
    const all = busan.links.filter((k) => k.line === lid);
    const line2 = busan.lines.find((l) => l.id === lid).stations.map((s) => s.id);
    const [ia, ib] = [line2.indexOf(a.id), line2.indexOf(b.id)].sort((x, y) => x - y);
    let m = 0;
    for (let k = ia; k < ib; k++) m += all.find((x) => (x.from === line2[k] && x.to === line2[k + 1]) || (x.to === line2[k] && x.from === line2[k + 1]))?.distanceM ?? 0;
    return m;
  }
  if (node.line !== 'L1') return 0;
  const i = Math.max(1, node.order - 1);
  const from = LINE1.stations[i - 1].id;
  const to = LINE1.stations[i].id;
  return linkM.get(`${from}>${to}`) ?? linkM.get(`${to}>${from}`) ?? 0;
}

export const TRANSFERS = busan.transfers;
export const LINES = busan.lines;

/** 노드의 선수 역 전체(개념 그래프를 거슬러 올라감) */
export function ancestorsOf(id, seen = new Set()) {
  for (const p of NODES.get(id)?.prereqs ?? []) {
    if (seen.has(p.node)) continue;
    seen.add(p.node);
    ancestorsOf(p.node, seen);
  }
  return seen;
}

/** 시승 추정으로 켜지 않는 역: 판별 오답이 가장 흔하고 뒤 역이 많이 기대는 곳(N03·N08·N15·N16·N19·N20),
 *  앞 분수 역과 사이가 먼 곳(N17·N18). 커리큘럼 자문 01 2.4.2절 */
export const MUST_CHECK = new Set(['N03', 'N08', 'N15', 'N16', 'N17', 'N18', 'N19', 'N20']);
export const FAR_FROM_EVIDENCE = new Set(['N17', 'N18']);
