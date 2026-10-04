// 개념 그래프 검사: node docs/curriculum/tools/validate-graph.mjs [path]
// 1) id 중복·없는 선수 2) 순환 3) 모든 노드가 선수가 없는 뿌리까지 닿음
// 4) 노선 순서만 따라가도 같은 노선 선수 조건이 채워짐(다른 노선·곁가지 선수는 따로 보고)
// 5) minLevel이 개통 단계(masteryLevel)보다 높으면 경고, 선수 노드 천장보다 높으면 오류
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = process.argv.slice(2).find(a => !a.startsWith('--')) ?? path.join(here, '..', 'concept-graph.json');
const g = JSON.parse(fs.readFileSync(file, 'utf8'));
const byId = new Map();
const errors = [], warnings = [], notes = [];

for (const n of g.nodes) {
  if (byId.has(n.id)) errors.push(`id 중복: ${n.id}`);
  byId.set(n.id, n);
}
for (const n of g.nodes) {
  for (const p of n.prereqs) {
    const q = byId.get(p.node);
    if (!q) { errors.push(`${n.id}: 없는 선수 ${p.node}`); continue; }
    if (p.minLevel && p.minLevel > q.ceiling) errors.push(`${n.id}: ${p.node}≥${p.minLevel}인데 ${p.node} 천장은 ${q.ceiling}`);
    if (p.minLevel && p.minLevel > g.rules.masteryLevel) warnings.push(`${n.id}: ${p.node}≥${p.minLevel}은 개통(${g.rules.masteryLevel}단계)으로 채워지지 않음`);
  }
  if (n.floor && n.floor > n.ceiling) errors.push(`${n.id}: floor > ceiling`);
}

// cycles
const state = new Map();
const visit = (id, stack) => {
  if (state.get(id) === 2) return;
  if (state.get(id) === 1) { errors.push(`순환: ${[...stack, id].join(' → ')}`); return; }
  state.set(id, 1);
  for (const p of byId.get(id)?.prereqs ?? []) if (byId.has(p.node)) visit(p.node, [...stack, id]);
  state.set(id, 2);
};
for (const n of g.nodes) visit(n.id, []);

// route order: same-line prereqs must have smaller order
for (const n of g.nodes) {
  for (const p of n.prereqs) {
    const q = byId.get(p.node);
    if (!q) continue;
    if (q.line === n.line) {
      if (q.order >= n.order) errors.push(`노선 순서 위반: ${n.line} ${n.id}(${n.order}) ← ${q.id}(${q.order})`);
    } else {
      notes.push(`${n.id}(${n.line}) ← ${q.id}(${q.line})`);
    }
  }
}

console.log(`노드 ${g.nodes.length}개`);
if (errors.length) console.log('\n오류\n- ' + errors.join('\n- '));
if (warnings.length) console.log('\n경고\n- ' + warnings.join('\n- '));
const cross = notes.filter(s => !s.includes('(DEPOT)'));
console.log(`\n다른 노선 선수 간선 ${cross.length}개 (곁가지 선수 ${notes.length - cross.length}개는 시승 운행·정비창으로 처리)`);
if (process.argv.includes('--verbose')) console.log('- ' + cross.join('\n- '));
process.exit(errors.length ? 1 : 0);
