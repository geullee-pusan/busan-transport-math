// 운행(한 번 학습) 진행. 같은 상태 + 같은 씨앗값 + 같은 답이면 같은 결과가 나온다.
// SPEC 3.1(숙달·급행), 3.4(운행 방식), 3.5(적응형), 3.7(꼼수 막기), 3.8(보상).
import { templatesFor, diagnosticsFor } from '../content/index.js';
import { createRng, hashSeed } from './rng.js';
import { grade } from './grade.js';
import { applyAttempt, applyReview, emptyNode, FULL } from './mastery.js';
import { nodeState } from './state.js';
import { LINE1_NODES, NODES, segmentMeters } from './world.js';

const DONE = new Set(['lit', 'passed', 'confirmed']);

/** 템플릿이 있는 1호선 노드(역 순서) */
export function playableNodes() {
  return LINE1_NODES.filter((n) => templatesFor(n.id).length > 0);
}

/** 목적지 = 노선 순서상 가장 앞의 꺼진 역(템플릿이 있는 역만) */
export function destination(state) {
  return playableNodes().find((n) => !DONE.has(nodeState(state, n.id).status)) ?? null;
}

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

/** 노드에서 낼 수 있는 가장 높은 단계(역 천장과 템플릿이 만들 수 있는 단계 중 작은 쪽) */
export function ceilingOf(nodeId) {
  const tmax = Math.max(0, ...templatesFor(nodeId).map((t) => t.maxLevel));
  return Math.min(NODES.get(nodeId)?.ceiling ?? tmax, tmax);
}

function workingLevel(state, nodeId) {
  return clamp(Math.round(nodeState(state, nodeId).rating), 1, ceilingOf(nodeId));
}

/** 같은 표현이 연달아 나오지 않게 템플릿을 고른다. */
function pickTemplate(nodeId, level, rng, recentReprs) {
  const fits = templatesFor(nodeId).filter((t) => t.minLevel <= level && level <= t.maxLevel);
  if (fits.length === 0) return null;
  const fresh = fits.filter((t) => !recentReprs.slice(-2).includes(t.repr));
  return rng.pick(fresh.length ? fresh : fits);
}

function reviewDue(state, day, exclude) {
  const due = Object.entries(state.nodes)
    .filter(([id, ns]) => id !== exclude && DONE.has(ns.status) && ns.reviewDay !== null && ns.reviewDay <= day)
    .sort((a, b) => a[1].reviewDay - b[1].reviewDay);
  return due.length ? due[0][0] : null;
}

/**
 * 보통 운행을 시작한다.
 * @returns {object|null} run (목적지가 없으면 null — 1호선 완주)
 */
export function startRun(state, { day, seed, mode = 'normal' }) {
  const dest = destination(state);
  if (!dest) return null;
  const L = workingLevel(state, dest.id);
  const ceil = ceilingOf(dest.id);
  const slots = [];
  if (state.parked) slots.push({ kind: 'parked', ...state.parked });
  for (const r of state.redo) slots.push({ kind: 'redo', node: r.node, level: r.level, templateId: r.templateId });
  if (mode === 'challenge') {
    slots.push({ kind: 'hard', node: dest.id, level: clamp(L + 1, 1, ceil) }, { kind: 'hard', node: dest.id, level: clamp(L + 1, 1, ceil) }, { kind: 'hard', node: dest.id, level: clamp(L + 2, 1, ceil) });
  } else {
    slots.push(
      { kind: 'warm', node: dest.id, level: clamp(L - 1, 1, ceil), skippable: false },
      { kind: 'warm', node: dest.id, level: clamp(L - 1, 1, ceil), skippable: true },
      { kind: 'hard', node: dest.id, level: L },
      { kind: 'hard', node: dest.id, level: clamp(L + 1, 1, ceil) },
    );
    const rv = reviewDue(state, day, dest.id);
    slots.push(rv ? { kind: 'review', node: rv, level: workingLevel(state, rv) } : { kind: 'hard', node: dest.id, level: L });
    slots.push({ kind: 'finish', node: dest.id, level: clamp(L - 1, 1, ceil) });
  }
  return {
    mode,
    day,
    seed,
    dest: dest.id,
    slots,
    index: 0,
    tries: 0, // 지금 문제에서 틀린 횟수
    hint: 0, // 지금 문제에서 연 가장 높은 힌트
    wrongStreak: 0,
    recentReprs: [],
    current: null,
    events: [],
    startMeters: state.meters,
    startDone: Object.entries(state.nodes).filter(([, ns]) => DONE.has(ns.status)).map(([id]) => id),
    finished: false,
  };
}

/** 지금 슬롯의 문제를 만든다(이미 만들었으면 그대로). */
export function currentProblem(run) {
  if (run.finished) return null;
  if (run.current) return run.current;
  const slot = run.slots[run.index];
  if (!slot) return null;
  const s = slot.seed ?? hashSeed(run.seed, run.index, slot.node, slot.level);
  const rng = createRng(s);
  let template = slot.templateId ? [...templatesFor(slot.node), ...diagnosticsFor(slot.node)].find((t) => t.id === slot.templateId) : null;
  if (template && (slot.level < template.minLevel || slot.level > template.maxLevel)) template = null;
  if (!template) template = slot.diagnostic ? diagnosticsFor(slot.node)[slot.diagIndex ?? 0] : pickTemplate(slot.node, slot.level, rng, run.recentReprs);
  if (!template) return null;
  const level = clamp(slot.level, template.minLevel, template.maxLevel);
  const problem = template.generate(createRng(s), level);
  run.current = { slot, template, level, seed: s, problem };
  // 이어 타기: 정차했던 문제는 틀린 횟수와 연 힌트를 그대로 이어받는다(다시 나와도 첫 시도가 아님)
  if (slot.kind === 'parked') {
    run.tries = slot.tries ?? 0;
    run.hint = slot.hint ?? 0;
  }
  return run.current;
}

/** 힌트를 연다(1~4). 연 단계 중 가장 높은 값을 기억한다. */
export function openHint(run, k) {
  run.hint = Math.max(run.hint, k);
}

/**
 * 답을 낸다.
 * @returns {{ state, run, result, outcome: 'correct'|'retry'|'giveup-offer'|'careless' }}
 */
export function submit(state, run, response) {
  const cur = currentProblem(run);
  const result = grade(cur.problem, response);
  if (result.flags?.careless && !result.correct) return { state, run, result, outcome: 'careless' };
  if (result.correct) {
    // 다시 시도해서 맞히면 힌트 ②와 같은 무게(반 칸)로 본다.
    const hint = run.tries > 0 ? Math.max(run.hint, 2) : run.hint;
    const next = finishProblem(state, run, true, hint);
    return { ...next, result, outcome: 'correct' };
  }
  run.tries += 1;
  return { state, run, result, outcome: run.tries >= 2 ? 'giveup-offer' : 'retry' };
}

/** 두 번 틀린 뒤 "임시 정차로 넘기기" */
export function giveUp(state, run) {
  return finishProblem(state, run, false, run.hint);
}

function finishProblem(state0, run, correct, hint) {
  const { slot, template, level, seed } = run.current;
  const state = { ...state0, nodes: { ...state0.nodes } };
  const counted = slot.kind !== 'easy';
  const ns = nodeState(state, slot.node);
  const before = ns.status;

  if (slot.kind === 'review' && DONE.has(before)) {
    state.nodes[slot.node] = applyReview(ns, correct, hint, run.day);
    if (correct) state.meters += Math.round(segmentMeters(slot.node) / 16); // 다시 달린 구간은 절반(한 칸 몫의 절반)
  } else if (slot.kind === 'diag') {
    // 급행 진단은 칸에 넣지 않는다(별도 판정).
    state.nodes[slot.node] = { ...ns, attempts: [...ns.attempts, { c: correct, h: hint, l: level, r: template.repr }].slice(-20) };
  } else {
    const { node, gained, lit, pending } = applyAttempt(ns.status ? ns : emptyNode(), { correct, hint, level, repr: template.repr, counted }, run.day);
    state.nodes[slot.node] = node;
    if (gained > 0) {
      const perHalf = segmentMeters(slot.node) / FULL;
      state.meters += Math.round(perHalf * gained);
      run.events.push({ type: 'tick', node: slot.node, gained });
    }
    if (lit) run.events.push({ type: 'lit', node: slot.node });
    if (pending) run.events.push({ type: 'pending', node: slot.node, code: pending });
  }

  // 금 도장: 힌트 ① 이하로 두 번 안에 맞힘, 2단계 이상. "첫 시도" 조건은 실수 공포와 앱 끄기 꼼수를 만들어서 뺐다.
  // 엄격함은 칸(숙달)이 맡는다: 두 번째 정답은 칸에서 반 칸이다.
  if (correct && run.hint <= 1 && run.tries <= 1 && level >= 2 && slot.kind !== 'diag') {
    state.goldTotal += 1;
    const card = state.cards.includes(state.activeCard) ? state.activeCard : state.license;
    state.cardGold = { ...state.cardGold, [card]: (state.cardGold[card] ?? 0) + 1 };
    run.events.push({ type: 'gold' });
  }

  if (correct && hint >= 2) run.events.push({ type: 'hinted' });
  if (correct && run.tries > 0) run.events.push({ type: 'retried' }); // 다시 생각해서 맞힘(행동 기록, 메달 아님)
  // 자기 변화: 이 역에서 바로 전 정답은 힌트 ②~④와 함께였는데 이번엔 힌트 없이 첫 시도에 맞힘
  if (correct && hint === 0 && run.tries === 0) {
    const prev = ns.attempts.filter((x) => x.c).at(-1);
    if (prev && prev.h >= 2 && !run.events.some((e) => e.type === 'grew')) run.events.push({ type: 'grew', node: slot.node });
  }

  // 힌트 ②~④를 썼거나 넘긴 문제는 다음 운행 임시 정차로 다시 낸다(같은 템플릿, 다른 씨앗값).
  if (slot.kind !== 'diag' && (!correct || hint >= 2)) {
    state.redo = [...state.redo.filter((r) => !(r.node === slot.node && r.templateId === template.id)), { node: slot.node, templateId: template.id, level }].slice(-3);
  }
  if (slot.kind === 'redo' && correct) state.redo = state.redo.filter((r) => !(r.node === slot.node && r.templateId === slot.templateId));
  if (slot.kind === 'parked') state.parked = null;

  // 면허(차량 등급): 혼자 맞힌 문제가 3개 이상인 가장 높은 단계
  const lic = licenseOf(state);
  if (lic > state.license) {
    // 아이가 따로 고르지 않았으면(지금 면허 차량을 타고 있었으면) 새 차량으로 바꿔 탄다.
    if ((state.activeCard ?? state.license) === state.license) state.activeCard = lic;
    state.license = lic;
    if (!state.cards.includes(lic)) state.cards = [...state.cards, lic];
    const evidence = Object.entries(state.nodes).filter(([, ns]) => ns.attempts.some((a) => a.c && a.h <= 1 && a.l >= lic)).map(([id]) => id).slice(0, 3);
    run.events.push({ type: 'license', tier: lic, evidence });
  }

  run.wrongStreak = correct ? 0 : run.wrongStreak + 1;
  run.recentReprs.push(template.repr);
  advance(state, run, correct);
  return { state, run };
}

function advance(state, run, correct) {
  const slot = run.slots[run.index];
  // 2연속 오답: 같은 개념의 쉬운 문제를 끼운다(칸에 넣지 않음, SPEC 3.7).
  if (!correct && run.wrongStreak >= 2 && slot.kind !== 'easy' && slot.kind !== 'diag' && !run.restAfter) {
    run.slots.splice(run.index + 1, 0, { kind: 'easy', node: slot.node, level: Math.max(1, slot.level - 1) });
    run.wrongStreak = 0;
  }
  // 몸풀기 1번을 혼자 맞히면 2번은 건너뛴다.
  if (correct && slot.kind === 'warm' && !slot.skippable && run.hint <= 1 && run.tries === 0) {
    const nx = run.slots[run.index + 1];
    if (nx && nx.kind === 'warm' && nx.skippable) run.slots.splice(run.index + 1, 1);
  }
  run.index += 1;
  run.tries = 0;
  run.hint = 0;
  run.current = null;
  // 목적지에 도착(점등)하면 남은 목적지 문제는 다음 역 문제로 바꾼다.
  if (run.events.some((e) => e.type === 'lit' && e.node === run.dest)) {
    const nd = destination(state);
    if (nd && nd.id !== run.dest) {
      for (let i = run.index; i < run.slots.length; i++) {
        if (run.slots[i].node === run.dest && run.slots[i].kind !== 'review') run.slots[i] = { ...run.slots[i], node: nd.id, level: Math.min(run.slots[i].level, ceilingOf(nd.id)) };
      }
      run.dest = nd.id;
    }
  }
  if (run.index >= run.slots.length || !destination(state)) run.finished = true;
}

export function licenseOf(state) {
  // 단계 L 이상 문제를 혼자 맞힌 역의 수
  let best = 1;
  for (let l = 11; l >= 2; l--) {
    const stations = Object.values(state.nodes).filter((ns) => ns.attempts.some((a) => a.c && a.h <= 1 && a.l >= l)).length;
    if (stations >= 3) {
      best = l;
      break;
    }
  }
  // 한 번에 한 단계씩만 오른다(첫날 여러 단계를 건너뛰어 승급 보상이 바닥나지 않게).
  return Math.max(state.license, Math.min(best, state.license + 1));
}

/** 운행을 중간에 끄면 지금 문제를 정차 중으로 저장한다. */
export function park(state, run) {
  const cur = run.current;
  if (!cur || run.finished) return state;
  return { ...state, parked: { node: cur.slot.node, templateId: cur.template.id, level: cur.level, seed: cur.seed, tries: run.tries, hint: run.hint } };
}

/** 운행 일지 */
export function summary(state, run) {
  const nowDone = Object.entries(state.nodes).filter(([, ns]) => DONE.has(ns.status)).map(([id]) => id);
  const newly = nowDone.filter((id) => !run.startDone.includes(id));
  return {
    newlyLit: newly,
    meters: state.meters - run.startMeters,
    totalMeters: state.meters,
    gold: run.events.filter((e) => e.type === 'gold').length,
    hinted: run.events.filter((e) => e.type === 'hinted').length,
    retried: run.events.filter((e) => e.type === 'retried').length,
    licenseEvidence: run.events.find((e) => e.type === 'license')?.evidence ?? [],
    grewAt: run.events.find((e) => e.type === 'grew')?.node ?? null,
    license: run.events.find((e) => e.type === 'license')?.tier ?? null,
    pending: run.events.filter((e) => e.type === 'pending').at(-1) ?? null,
    redo: state.redo.length,
    dest: destination(state)?.id ?? null,
    destHalves: destination(state) ? nodeState(state, destination(state).id).halves : 0,
  };
}

