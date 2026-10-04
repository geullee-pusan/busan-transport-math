// 모든 문제 템플릿을 모아 노드 id로 찾게 한다.
// 새 역 템플릿을 만들면 아래 import와 ALL 목록에 한 줄씩 더한다(Vite와 node --test 둘 다에서 돌아가게 정적 import를 쓴다).
import N01 from './templates/N01.js';
import N02 from './templates/N02.js';
import N03 from './templates/N03.js';
import N04 from './templates/N04.js';
import N05 from './templates/N05.js';
import N06 from './templates/N06.js';
import N07 from './templates/N07.js';
import N08 from './templates/N08.js';
import N09 from './templates/N09.js';
import N10 from './templates/N10.js';
import B from './templates/B.js';

const ALL = [...N01, ...N02, ...N03, ...N04, ...N05, ...N06, ...N07, ...N08, ...N09, ...N10, ...B];

const byNode = new Map();
for (const t of ALL) {
  if (!byNode.has(t.node)) byNode.set(t.node, []);
  byNode.get(t.node).push(t);
}

/** 노드의 일반 템플릿(진단 문항 제외) */
export function templatesFor(node) {
  return (byNode.get(node) ?? []).filter((t) => !t.diagnostic);
}

/** 노드의 급행 통과 진단 템플릿 */
export function diagnosticsFor(node) {
  return (byNode.get(node) ?? []).filter((t) => t.diagnostic);
}

/** 템플릿이 하나라도 있는 노드 */
export function nodesWithTemplates() {
  return [...byNode.keys()];
}

export function allTemplates() {
  return ALL;
}
