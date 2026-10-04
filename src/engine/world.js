// 개념 그래프와 1호선 역 데이터를 묶는다. 화면과 엔진이 함께 쓴다.
import graph from '../../docs/curriculum/concept-graph.json' with { type: 'json' };
import busan from '../data/busan.json' with { type: 'json' };

export const NODES = new Map(graph.nodes.map((n) => [n.id, n]));
export const LINE1 = busan.lines.find((l) => l.id === '1');

/** 1호선 노드 N01~N40 (역 순서대로) */
export const LINE1_NODES = graph.nodes.filter((n) => n.line === 'L1').sort((a, b) => a.order - b.order);

/** 노드 → 1호선 역 정보(이름, 코드, 노선도 좌표) */
export function stationOf(nodeId) {
  const node = NODES.get(nodeId);
  if (!node || node.line !== 'L1') return null;
  return LINE1.stations[node.order - 1];
}

const linkM = new Map(busan.links.filter((k) => k.line === '1').map((k) => [`${k.from}>${k.to}`, k.distanceM]));

/**
 * 노드 역으로 들어오는 구간의 실제 거리(m).
 * 첫 역(다대포해수욕장)은 들어오는 구간이 없으므로 첫 구간(다대포해수욕장–다대포항) 거리를 쓴다.
 * 정답인데 거리가 늘지 않는 일이 없게 하려는 것이다.
 */
export function segmentMeters(nodeId) {
  const node = NODES.get(nodeId);
  if (!node || node.line !== 'L1') return 0;
  const i = Math.max(1, node.order - 1);
  const from = LINE1.stations[i - 1].id;
  const to = LINE1.stations[i].id;
  return linkM.get(`${from}>${to}`) ?? linkM.get(`${to}>${from}`) ?? 0;
}

export const TRANSFERS = busan.transfers;
export const LINES = busan.lines;
