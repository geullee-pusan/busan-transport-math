// 급행 통과와 시승 운행(배치). SPEC 3.1절.
//   급행: 역마다 자기 진단 2문제(하나 틀리면 예비 1문제). 연달아 세 번째 역은 확인 문제 1개 더(그 역의 3단계 일반 문제).
//         진단이나 확인 문제를 틀리면 그 역에 내린다. 2역을 지난 뒤 "여기서 내릴까요?"를 한 번 묻는다(ask).
//   시승: 줄기(자연수·분수·소수)마다 진단 문항이 있는 역들 사이에서 이분 탐색(모두 5역, 8~10문제).
//         진단 2문제를 모두 맞힌 역은 통과역으로 켠다. 끝나면 추정 규칙(커리큘럼 자문 01 2.4.2절)으로 앞 역도 켠다:
//           통과한 역의 선수 역, 또는 같은 줄기에서 뒤의 역이 통과한 앞 역. 단 선수 묶음에 시승에서 틀린 역이 있거나
//           필수 확인 역(MUST_CHECK)이면 켜지 않는다. 추정 역은 inferred 표시를 달고 다음 날부터 임시 정차에서 확인한다.
//         시승 결과(state.placement)는 처음 보는 역의 시작 실력에도 쓴다(state.js startRatingOf).
import { diagnosticsFor } from '../content/index.js';
import { grade as baseGrade } from './grade.js';

export const UNKNOWN = '__아직몰라요__';
const grade = (p, r) => (r === UNKNOWN ? { correct: false, category: null, feedback: null, flags: {} } : baseGrade(p, r));
import { FULL } from './mastery.js';
import { nodeState } from './state.js';
import { segmentMeters, NODES, ancestorsOf, MUST_CHECK } from './world.js';
import { currentProblem, destination, playableNodes, ceilingOf, chooseLine } from './run.js';

function blankRun(state, { day, seed }, mode, dest) {
  return { mode, day, seed, dest, stateRef: state, slots: [], index: 0, current: null, finished: false, tries: 0, hint: 0, recentReprs: [], events: [], startMeters: state.meters, startDone: Object.entries(state.nodes).filter(([, ns]) => ['lit', 'passed', 'confirmed'].includes(ns.status)).map(([id]) => id) };
}

const diagSlot = (node, diagIndex) => ({ kind: 'diag', node, level: 3, diagnostic: true, diagIndex });

function record(state, node, correct, repr) {
  const ns = nodeState(state, node);
  state.nodes[node] = { ...ns, attempts: [...ns.attempts, { c: correct, h: 0, l: 3, r: repr, x: 1 }].slice(-20) };
}

function markPassed(state, node, day, extra = {}) {
  const ns = nodeState(state, node);
  const wasOpen = ns.status === 'open';
  state.nodes[node] = { ...ns, status: 'passed', passed: true, halves: FULL, litDay: day, reviewDay: day + 1, rating: Math.max(ns.rating, 3.5), ...extra };
  if (wasOpen) state.meters += segmentMeters(node);
}


/** 시승 결과로 앞 역을 추정해 켤 수 있는가 */
export function inferable(id, passedIds, missedIds) {
  if (MUST_CHECK.has(id) || missedIds.includes(id)) return false;
  const anc = ancestorsOf(id);
  if (missedIds.some((m) => anc.has(m))) return false;
  const y = NODES.get(id);
  return passedIds.some((x) => {
    const nx = NODES.get(x);
    return ancestorsOf(x).has(id) || (nx.strand === y.strand && nx.order > y.order);
  });
}

// ── 급행 통과 ──

export function startExpress(state, opts) {
  const line = chooseLine(state);
  const dest = destination(state, line);
  if (!dest || diagnosticsFor(dest.id).length === 0 || nodeState(state, dest.id).inspect) return null;
  const run = blankRun(state, opts, 'express', dest.id);
  run.line = line;
  run.express = { node: dest.id, count: 0, right: 0, wrong: 0, reserveUsed: false };
  run.slots.push(diagSlot(dest.id, 0), diagSlot(dest.id, Math.min(1, diagnosticsFor(dest.id).length - 1)));
  return run;
}

/** @returns {{ state, run, result, outcome, passed?: string, stoppedAt?: string, ask?: boolean }} */
export function submitExpress(state0, run, response) {
  const cur = currentProblem(run);
  const result = grade(cur.problem, response);
  if (result.flags?.careless && !result.correct) return { state: state0, run, result, outcome: 'careless' };
  const state = { ...state0, nodes: { ...state0.nodes } };
  const ex = run.express;
  record(state, ex.node, result.correct, cur.template.repr);
  run.current = null;
  run.index += 1;

  const stop = () => {
    run.finished = true;
    run.dest = ex.node;
    return { state, run, result, outcome: 'wrong', stoppedAt: ex.node };
  };

  if (cur.slot.confirm) {
    if (!result.correct) return stop();
    return pass();
  }
  if (result.correct) ex.right += 1;
  else ex.wrong += 1;

  if (ex.wrong >= 2) return stop();
  if (!result.correct) {
    const diags = diagnosticsFor(ex.node);
    if (ex.reserveUsed || diags.length < 3) return stop();
    ex.reserveUsed = true;
    run.slots.splice(run.index, 0, diagSlot(ex.node, 2));
    return { state, run, result, outcome: 'wrong' };
  }
  if (ex.right >= 2) {
    if (ex.count === 2) {
      run.slots.splice(run.index, 0, { kind: 'diag', node: ex.node, level: Math.min(3, ceilingOf(ex.node)), confirm: true });
      return { state, run, result, outcome: 'correct' };
    }
    return pass();
  }
  return { state, run, result, outcome: 'correct' };

  function pass() {
    markPassed(state, ex.node, run.day);
    const passed = ex.node;
    ex.count += 1;
    const nd = destination(state, run.line ?? 'L1');
    if (!nd || diagnosticsFor(nd.id).length === 0 || nodeState(state, nd.id).inspect || ex.count >= 3) {
      run.finished = true;
      run.dest = nd?.id ?? null;
      return { state, run, result, outcome: 'correct', passed };
    }
    Object.assign(ex, { node: nd.id, right: 0, wrong: 0, reserveUsed: false });
    run.dest = nd.id;
    run.slots.splice(run.index, run.slots.length - run.index, diagSlot(nd.id, 0), diagSlot(nd.id, Math.min(1, diagnosticsFor(nd.id).length - 1)));
    return { state, run, result, outcome: 'correct', passed, ask: ex.count === 2 };
  }
}

// ── 시승 운행 ──

const PLACEMENT_TESTS = 5;

/** 줄기별 후보. 가장 큰 줄기에 남는 횟수를, 나머지 줄기에 1역씩 준다. */
function strandGroups(candidates) {
  const groups = [];
  for (const id of candidates) {
    const strand = NODES.get(id)?.strand ?? 'whole';
    let g = groups.find((x) => x.strand === strand);
    if (!g) groups.push((g = { strand, list: [] }));
    g.list.push(id);
  }
  const biggest = groups.reduce((a, b) => (b.list.length > a.list.length ? b : a), groups[0]);
  for (const g of groups) Object.assign(g, { lo: 0, hi: g.list.length - 1, tested: 0, quota: g === biggest ? Math.max(1, PLACEMENT_TESTS - (groups.length - 1)) : 1 });
  return groups;
}

export function startPlacement(state, opts) {
  const candidates = playableNodes().filter((n) => diagnosticsFor(n.id).length > 0).map((n) => n.id);
  if (candidates.length === 0) return null;
  const run = blankRun(state, opts, 'placement', candidates[0]);
  run.placement = { groups: strandGroups(candidates), gi: 0, mid: -1, node: null, k: 0, right: 0, tested: 0, passedIds: [], missedIds: [] };
  nextNode(run);
  return run;
}

function nextNode(run) {
  const p = run.placement;
  while (p.gi < p.groups.length) {
    const g = p.groups[p.gi];
    if (g.lo <= g.hi && g.tested < g.quota) break;
    p.gi += 1;
  }
  if (p.gi >= p.groups.length) {
    run.finished = true;
    return;
  }
  const g = p.groups[p.gi];
  p.mid = Math.floor((g.lo + g.hi) / 2);
  p.node = g.list[p.mid];
  p.k = 0;
  p.right = 0;
  p.tested += 1;
  g.tested += 1;
  run.dest = p.node;
  run.slots.push(diagSlot(p.node, 0), diagSlot(p.node, Math.min(1, diagnosticsFor(p.node).length - 1)));
}

/** 시승 결과 요약(처음 보는 역의 시작 실력에 쓴다, state.js startRatingOf) */
function placementResult(p) {
  const passes = {};
  const misses = {};
  const farthest = {};
  for (const id of p.passedIds) {
    const { strand, order } = NODES.get(id);
    passes[strand] = (passes[strand] ?? 0) + 1;
    farthest[strand] = Math.max(farthest[strand] ?? 0, order);
  }
  for (const id of p.missedIds) {
    const { strand } = NODES.get(id);
    misses[strand] = (misses[strand] ?? 0) + 1;
  }
  return { passes, misses, farthest, any: p.passedIds.length > 0 };
}

export function submitPlacement(state0, run, response) {
  const cur = currentProblem(run);
  const result = grade(cur.problem, response);
  if (result.flags?.careless && !result.correct) return { state: state0, run, result, outcome: 'careless' };
  const p = run.placement;
  const g = p.groups[p.gi];
  const node = p.node;
  const state = { ...state0, nodes: { ...state0.nodes } };
  record(state, node, result.correct, cur.template.repr);
  run.current = null;
  run.index += 1;
  p.k += 1;
  if (result.correct) p.right += 1;

  if (p.k === 1 && result.correct) return { state, run, result, outcome: 'correct' };
  if (p.k === 1 && !result.correct) run.slots.splice(run.index, 1); // 두 번째 진단은 내지 않는다

  if (p.right >= 2) {
    markPassed(state, node, run.day);
    p.passedIds.push(node);
    g.lo = p.mid + 1;
  } else {
    state.nodes[node] = { ...nodeState(state, node), rating: 2, placementMissed: true };
    p.missedIds.push(node);
    g.hi = p.mid - 1;
  }
  nextNode(run);
  if (run.finished) finishPlacement(state, run);
  return { state, run, result, outcome: result.correct ? 'correct' : 'wrong' };
}

function finishPlacement(state, run) {
  const p = run.placement;
  state.placement = placementResult(p);
  // 추정 규칙: 아직 꺼진 역 중 켤 수 있는 역을 통과역(추정)으로 켠다. 다음 날부터 임시 정차에서 확인한다.
  // 추천 순서대로 보며, 선수 닫힘(1호선 역)이 모두 켜져 있어야 켠다(커리큘럼 11 검토 7). 그래서 필수 확인 역에 기대는 역은
  // 그 역이 확인될 때까지 추정하지 않는다(N04←N03, N09·N10←N08, N16·N19←N15 …).
  const playable = new Set(playableNodes().map((n) => n.id));
  const lit = (id) => ['lit', 'passed', 'confirmed'].includes(nodeState(state, id).status);
  for (const n of playableNodes()) {
    const s = nodeState(state, n.id);
    if (s.status !== 'open' || !inferable(n.id, p.passedIds, p.missedIds)) continue;
    if ([...ancestorsOf(n.id)].some((a) => playable.has(a) && !lit(a))) continue;
    markPassed(state, n.id, run.day, { inferred: true, rating: Math.max(s.rating, 3) });
  }
  state.placement.inferredCount = Object.values(state.nodes).filter((x) => x.inferred).length;
  state.placementDone = true;
  run.dest = destination(state, 'L1')?.id ?? null;
}
