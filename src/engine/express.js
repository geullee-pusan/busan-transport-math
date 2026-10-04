// 급행 통과와 시승 운행(배치). SPEC 3.1절.
//   급행: 역마다 자기 진단 2문제(하나 틀리면 예비 1문제). 연달아 세 번째 역은 확인 문제 1개 더(그 역의 3단계 일반 문제).
//         진단이나 확인 문제를 틀리면 그 역에 내린다. 2역을 지난 뒤 "여기서 내릴까요?"를 한 번 묻는다(ask).
//   시승: 진단 문항이 있는 역들 사이에서 이분 탐색. 진단 2문제를 모두 맞힌 역은 통과역으로 미리 켠다.
import { diagnosticsFor } from '../content/index.js';
import { grade as baseGrade } from './grade.js';

export const UNKNOWN = '__아직몰라요__';
const grade = (p, r) => (r === UNKNOWN ? { correct: false, category: null, feedback: null, flags: {} } : baseGrade(p, r));
import { FULL } from './mastery.js';
import { nodeState } from './state.js';
import { segmentMeters } from './world.js';
import { currentProblem, destination, playableNodes, ceilingOf, chooseLine } from './run.js';

function blankRun(state, { day, seed }, mode, dest) {
  return { mode, day, seed, dest, stateRef: state, slots: [], index: 0, current: null, finished: false, tries: 0, hint: 0, recentReprs: [], events: [], startMeters: state.meters, startDone: Object.entries(state.nodes).filter(([, ns]) => ['lit', 'passed', 'confirmed'].includes(ns.status)).map(([id]) => id) };
}

const diagSlot = (node, diagIndex) => ({ kind: 'diag', node, level: 3, diagnostic: true, diagIndex });

function record(state, node, correct, repr) {
  const ns = nodeState(state, node);
  state.nodes[node] = { ...ns, attempts: [...ns.attempts, { c: correct, h: 0, l: 3, r: repr }].slice(-20) };
}

function markPassed(state, node, day) {
  const ns = nodeState(state, node);
  state.nodes[node] = { ...ns, status: 'passed', passed: true, halves: FULL, litDay: day, reviewDay: day + 1, rating: Math.max(ns.rating, 3.5) };
  state.meters += segmentMeters(node);
}

// ── 급행 통과 ──

export function startExpress(state, opts) {
  const line = chooseLine(state);
  const dest = destination(state, line);
  if (!dest || diagnosticsFor(dest.id).length === 0) return null;
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
    if (!nd || diagnosticsFor(nd.id).length === 0 || ex.count >= 3) {
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

export function startPlacement(state, opts) {
  const candidates = playableNodes().filter((n) => diagnosticsFor(n.id).length > 0).map((n) => n.id);
  if (candidates.length === 0) return null;
  const run = blankRun(state, opts, 'placement', candidates[0]);
  run.placement = { candidates, lo: 0, hi: candidates.length - 1, mid: -1, k: 0, right: 0, tested: 0 };
  nextNode(run);
  return run;
}

function nextNode(run) {
  const p = run.placement;
  if (p.lo > p.hi || p.tested >= 5) {
    run.finished = true;
    return;
  }
  p.mid = Math.floor((p.lo + p.hi) / 2);
  p.k = 0;
  p.right = 0;
  p.tested += 1;
  const node = p.candidates[p.mid];
  run.dest = node;
  run.slots.push(diagSlot(node, 0), diagSlot(node, Math.min(1, diagnosticsFor(node).length - 1)));
}

export function submitPlacement(state0, run, response) {
  const cur = currentProblem(run);
  const result = grade(cur.problem, response);
  if (result.flags?.careless && !result.correct) return { state: state0, run, result, outcome: 'careless' };
  const p = run.placement;
  const node = p.candidates[p.mid];
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
    for (let i = 0; i < p.mid; i++) {
      const id = p.candidates[i];
      const s = nodeState(state, id);
      if (s.status === 'open') state.nodes[id] = { ...s, rating: Math.max(s.rating, 3) }; // 앞 역은 실력 추정만 올린다(불은 켜지 않음)
    }
    p.lo = p.mid + 1;
  } else {
    state.nodes[node] = { ...nodeState(state, node), rating: 2 };
    p.hi = p.mid - 1;
  }
  nextNode(run);
  if (run.finished) state.placementDone = true;
  return { state, run, result, outcome: result.correct ? 'correct' : 'wrong' };
}
