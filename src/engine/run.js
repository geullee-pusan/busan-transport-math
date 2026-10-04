// 운행(한 번 학습) 진행. 같은 상태 + 같은 씨앗값 + 같은 답이면 같은 결과가 나온다.
// SPEC 3.1(숙달·급행), 3.4(운행 방식), 3.5(적응형), 3.7(꼼수 막기), 3.8(보상).
import { templatesFor, diagnosticsFor } from '../content/index.js';
import { createRng, hashSeed } from './rng.js';
import { grade } from './grade.js';
import { applyAttempt, applyReview, emptyNode, FULL, nextRating, LONG_GAPS } from './mastery.js';
import { nodeState } from './state.js';
import { LINE_NODES, NODES, segmentMeters } from './world.js';

const DONE = new Set(['lit', 'passed', 'confirmed']);

/** 템플릿이 있는 노드(그 노선의 추천 순서) */
export function playableNodes(line = 'L1') {
  return (LINE_NODES[line] ?? []).filter((n) => templatesFor(n.id).length > 0);
}

/**
 * 2호선은 지도 규칙으로 연다(개념 잠금이 아님, 커리큘럼 자문 10 1.3절):
 * 1호선 서면(N25)이 켜지면 서면에서 갈아탈 수 있다.
 */
export function line2Open(state) {
  return DONE.has(nodeState(state, 'N25').status) && playableNodes('L2').length > 0;
}

/**
 * 이번 운행의 노선. 2호선이 열렸으면 운행마다 1호선 : 2호선 = 2 : 1로 번갈아 고른다(아이는 고르지 않음).
 * 고른 노선에 갈 역이 없으면 다른 노선.
 */
export function chooseLine(state) {
  const has = (line) => playableNodes(line).some((n) => needsVisit(nodeState(state, n.id)));
  const want = line2Open(state) && state.runs % 3 === 2 ? 'L2' : 'L1';
  if (has(want)) return want;
  const other = want === 'L1' ? 'L2' : 'L1';
  if (other === 'L2' && !line2Open(state)) return want;
  return has(other) ? other : want;
}

/** 갈 역: 꺼진 역, 또는 점검 중인 추정 역 */
const needsVisit = (ns) => !DONE.has(ns.status) || ns.inspect === true;

/**
 * 목적지 = 점검 중인 역이 있으면 그 역, 없으면 그 노선의 추천 순서상 가장 앞의 꺼진 역(템플릿이 있는 역만).
 * 점검: 시승으로 추정해 켠 역을 임시 정차에서 두 번 연달아 못 맞히면 불은 둔 채 다시 들른다(커리큘럼 자문 01 2.4.2절).
 */
export function destination(state, line = chooseLine(state)) {
  const nodes = playableNodes(line);
  return nodes.find((n) => nodeState(state, n.id).inspect) ?? nodes.find((n) => !DONE.has(nodeState(state, n.id).status)) ?? null;
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
  const line = chooseLine(state);
  const dest = destination(state, line);
  if (!dest) return null;
  const ceil = ceilingOf(dest.id);
  // 점검 중인 역은 3단계 문제로 확인한다.
  const L = nodeState(state, dest.id).inspect ? clamp(Math.max(3, workingLevel(state, dest.id)), 1, ceil) : workingLevel(state, dest.id);
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
    line,
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
    stateRef: state,
  };
}

/** 지금 슬롯의 문제를 만든다(이미 만들었으면 그대로). */
export function currentProblem(run, state = run.stateRef) {
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
  // 출제 조건(requires): 문제에 필요한 다른 개념(예: 5자리 수 N20, 서면 환승 N25)을 아직 켜지 않았으면 씨앗값을 바꿔 다시 만든다.
  // 열 번 안에 조건 없는 문제가 안 나오면 그 템플릿의 가장 쉬운 단계로.
  const met = (p) => !p.requires || p.requires.every((id) => DONE.has(state?.nodes?.[id]?.status));
  let problem = template.generate(createRng(s), level);
  for (let k = 1; k <= 10 && !met(problem); k++) problem = template.generate(createRng(hashSeed(s, 'req', k)), level);
  if (!met(problem)) {
    // 이 템플릿은 조건이 늘 필요하다(예: 서면 환승 융합). 같은 역의 다른 템플릿으로 바꾼다.
    const others = templatesFor(slot.node).filter((t) => t.id !== template.id && t.minLevel <= level && level <= t.maxLevel);
    for (const t of others) {
      const p = t.generate(createRng(s), clamp(level, t.minLevel, t.maxLevel));
      if (met(p)) {
        template = t;
        problem = p;
        break;
      }
    }
  }
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
  if (run.tries === 1) run.firstCategory = result.category ?? null;
  // 첫 오답에는 점검(check)만 보여준다. 도움(nudge) 문구는 같은 문제의 두 번째 오답부터.
  // 그래야 두 번째 정답이 "스스로 고친 것"이 되어 금 도장을 줄 수 있다(커리큘럼 자문 10 2절).
  if (run.tries === 1 && result.kind === 'nudge') {
    result.feedback = result.feedbackCheck ?? '다시 확인해 볼까요?';
    result.kind = 'check';
  }
  if (result.kind === 'nudge') run.nudged = true;
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

  if (ns.inspect && slot.kind !== 'diag') {
    // 점검 중인 추정 역: 3단계 이상을 힌트 ① 이하로 2문제 맞히면 확정. 칸과 거리는 이미 있으므로 늘지 않는다.
    const right = (ns.inspectRight ?? 0) + (correct && hint <= 1 && level >= 3 ? 1 : 0);
    const node = { ...ns, attempts: [...ns.attempts, { c: correct, h: hint, l: level, r: template.repr, d: run.day }].slice(-20), rating: nextRating(ns.rating, { correct, hint }), inspectRight: right };
    if (right >= 2) {
      Object.assign(node, { status: 'confirmed', inspect: false, inferred: false, confirmedDay: run.day, longStage: 0, reviewDay: run.day + LONG_GAPS[0] });
      run.events.push({ type: 'inspected', node: slot.node });
    }
    state.nodes[slot.node] = node;
  } else if (slot.kind === 'review' && DONE.has(before)) {
    let next = applyReview(ns, correct, hint, run.day);
    if (ns.inferred && next.status !== 'confirmed') {
      // 추정 역을 임시 정차에서 두 번 연달아 못 맞히면 점검으로 돌린다. 첫 실패가 계산 실수면 한 번 더 기회.
      const strikes = (ns.inferStrikes ?? 0) + (correct ? 0 : 1);
      const grace = !correct && strikes === 1 ? run.firstCategory === '계산' : ns.inferGrace ?? false;
      next = { ...next, inferStrikes: strikes, inferGrace: grace };
      if (strikes >= (grace ? 3 : 2)) {
        next = { ...next, inspect: true, inspectRight: 0 };
        run.events.push({ type: 'inspect', node: slot.node });
      }
    }
    state.nodes[slot.node] = next;
    if (correct) state.meters += Math.round(segmentMeters(slot.node) / 16); // 다시 달린 구간은 절반(한 칸 몫의 절반)
  } else if (slot.kind === 'diag') {
    // 급행 진단은 칸에 넣지 않는다(별도 판정).
    state.nodes[slot.node] = { ...ns, attempts: [...ns.attempts, { c: correct, h: hint, l: level, r: template.repr, x: 1 }].slice(-20) };
  } else {
    const { node, gained, lit, pending } = applyAttempt(ns.status ? ns : emptyNode(), { correct, hint, level, repr: template.repr, counted }, run.day);
    state.nodes[slot.node] = node;
    if (gained > 0) {
      const perHalf = segmentMeters(slot.node) / FULL;
      state.meters += Math.round(perHalf * gained);
      run.events.push({ type: 'tick', node: slot.node, gained });
    }
    if (correct && gained === 0) state.meters += Math.round(segmentMeters(slot.node) / 16);
    if (lit) run.events.push({ type: 'lit', node: slot.node });
    if (correct && counted && level < 2 && before === 'open') run.events.push({ type: 'prep', node: slot.node }); // 1단계 정답: 준비 구간(칸은 그대로)
    if (pending) run.events.push({ type: 'pending', node: slot.node, code: pending });
  }

  // 금 도장: 힌트 ① 이하로 두 번 안에 맞힘, 2단계 이상. "첫 시도" 조건은 실수 공포와 앱 끄기 꼼수를 만들어서 뺐다.
  // 엄격함은 칸(숙달)이 맡는다: 두 번째 정답은 칸에서 반 칸이다.
  if (correct && run.hint <= 1 && run.tries <= 1 && !run.nudged && level >= 2 && slot.kind !== 'diag') {
    state.goldTotal += 1;
    const card = state.cards.includes(state.activeCard) ? state.activeCard : state.license;
    state.cardGold = { ...state.cardGold, [card]: (state.cardGold[card] ?? 0) + 1 };
    run.events.push({ type: 'gold' });
  }

  if (correct && hint >= 2) run.events.push({ type: 'hinted' });
  if (correct && run.tries > 0) run.events.push({ type: 'retried' }); // 다시 생각해서 맞힘(행동 기록, 메달 아님)
  // 자기 변화: 이 역에서 바로 전 정답은 힌트 ②~④와 함께였는데 이번엔 힌트 없이 첫 시도에 맞힘
  if (correct && hint === 0 && run.tries === 0) {
    const prev = ns.attempts.filter((x) => x.c && typeof x.d === 'number' && x.d < run.day).at(-1); // 다른 날의 기록과만 비교
    if (prev && prev.h >= 2 && !run.events.some((e) => e.type === 'grew')) run.events.push({ type: 'grew', node: slot.node });
  }

  // 힌트 ②~④를 썼거나 넘긴 문제는 다음 운행 임시 정차로 다시 낸다(같은 템플릿, 다른 씨앗값).
  if (slot.kind !== 'diag' && (!correct || hint >= 2)) {
    state.redo = [...state.redo.filter((r) => !(r.node === slot.node && r.templateId === template.id)), { node: slot.node, templateId: template.id, level }].slice(-3);
  }
  if (slot.kind === 'redo' && correct) state.redo = state.redo.filter((r) => !(r.node === slot.node && r.templateId === slot.templateId));
  if (slot.kind === 'parked') state.parked = null;

  // 면허(차량 등급): 혼자 맞힌 문제가 3개 이상인 가장 높은 단계
  // 혼자 맞힌 문제에서만 오른다. 넘긴 문제 뒤에 축하가 나오지 않게(UX 7차 A-1).
  const lic = correct && hint <= 1 && slot.kind !== 'easy' ? licenseOf(state) : state.license;
  if (lic > state.license) {
    // 아이가 따로 고르지 않았으면(지금 면허 차량을 타고 있었으면) 새 차량으로 바꿔 탄다.
    if ((state.activeCard ?? state.license) === state.license) state.activeCard = lic;
    state.license = lic;
    if (!state.cards.includes(lic)) state.cards = [...state.cards, lic];
    const evidence = Object.entries(state.nodes).filter(([, ns]) => ns.attempts.some((a) => a.c && a.h <= 1 && a.l >= lic && !a.x)).map(([id]) => id).slice(0, 3);
    run.events.push({ type: 'license', tier: lic, evidence });
  }

  run.stateRef = state;
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
  run.nudged = false;
  run.firstCategory = null;
  run.current = null;
  // 목적지에 도착(점등)하면 남은 목적지 문제는 다음 역 문제로 바꾼다.
  if (run.events.some((e) => (e.type === 'lit' || e.type === 'inspected') && e.node === run.dest)) {
    const nd = destination(state, run.line ?? 'L1');
    if (nd && nd.id !== run.dest) {
      for (let i = run.index; i < run.slots.length; i++) {
        if (run.slots[i].node === run.dest && run.slots[i].kind !== 'review') run.slots[i] = { ...run.slots[i], node: nd.id, level: Math.min(run.slots[i].level, ceilingOf(nd.id)) };
      }
      run.dest = nd.id;
    }
  }
  if (run.index >= run.slots.length || !destination(state, run.line ?? 'L1')) run.finished = true;
}

export function licenseOf(state) {
  // 단계 L 이상 문제를 혼자 맞힌 역의 수
  let best = 1;
  for (let l = 11; l >= 2; l--) {
    const stations = Object.values(state.nodes).filter((ns) => ns.attempts.some((a) => a.c && a.h <= 1 && a.l >= l && !a.x)).length; // 진단(시승·급행) 문제는 세지 않는다
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
  const newly = nowDone.filter((id) => !run.startDone.includes(id)).sort((a, b) => (NODES.get(a)?.order ?? 0) - (NODES.get(b)?.order ?? 0)); // 역 순서대로
  return {
    newlyLit: newly,
    meters: state.meters - run.startMeters,
    totalMeters: state.meters,
    gold: run.events.filter((e) => e.type === 'gold').length,
    hinted: run.events.filter((e) => e.type === 'hinted').length,
    retried: run.events.filter((e) => e.type === 'retried').length,
    licenseEvidence: run.events.findLast((e) => e.type === 'license')?.evidence ?? [],
    grewAt: run.events.find((e) => e.type === 'grew')?.node ?? null,
    license: run.events.findLast((e) => e.type === 'license')?.tier ?? null, // 두 단계 오르면 도착 단계 하나로 알린다
    pending: run.events.filter((e) => e.type === 'pending').at(-1) ?? null,
    redo: state.redo.length,
    dest: destination(state, run.line ?? 'L1')?.id ?? null,
    destHalves: destination(state, run.line ?? 'L1') ? nodeState(state, destination(state, run.line ?? 'L1').id).halves : 0,
    line2Opened: run.line === 'L1' && run.events.some((e) => e.type === 'lit' && e.node === 'N25') && line2Open(state),
  };
}

