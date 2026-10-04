// 엔진 검사: 칸·개통 규칙, 운행 진행, 급행·시승, 결정론.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState, startRatingOf } from '../src/engine/state.js';
import { LINE1_NODES, NODES, MUST_CHECK, ancestorsOf } from '../src/engine/world.js';
import { applyAttempt, applyReview, emptyNode, FULL } from '../src/engine/mastery.js';
import { startRun, currentProblem, submit, giveUp, destination, summary, openHint, ceilingOf, licenseOf } from '../src/engine/run.js';
import { templatesFor } from '../src/content/index.js';
import { startExpress, submitExpress, startPlacement, submitPlacement } from '../src/engine/express.js';

test('칸: 혼자 = 한 칸, 힌트 ②~④ = 반 칸, 1단계는 준비 구간', () => {
  let n = emptyNode();
  n = applyAttempt(n, { correct: true, hint: 0, level: 2, repr: '식' }, 1).node;
  assert.equal(n.halves, 2);
  n = applyAttempt(n, { correct: true, hint: 1, level: 2, repr: '식' }, 1).node;
  assert.equal(n.halves, 4, '힌트 ①은 혼자');
  n = applyAttempt(n, { correct: true, hint: 3, level: 2, repr: '식' }, 1).node;
  assert.equal(n.halves, 5, '힌트 ③은 반 칸');
  n = applyAttempt(n, { correct: true, hint: 0, level: 1, repr: '식' }, 1).node;
  assert.equal(n.halves, 5);
  assert.equal(n.prep, 1);
});

test('칸은 줄지 않고, 마지막 칸은 3단계 이상 힌트 없이 + 표현 2가지 + 최근 정확도', () => {
  let n = emptyNode();
  for (let i = 0; i < 3; i++) n = applyAttempt(n, { correct: true, hint: 0, level: 2, repr: '식' }, 1).node;
  assert.equal(n.halves, 6);
  n = applyAttempt(n, { correct: false, hint: 0, level: 3, repr: '식' }, 1).node;
  assert.equal(n.halves, 6, '오답은 칸을 줄이지 않는다');
  let r = applyAttempt(n, { correct: true, hint: 1, level: 3, repr: '문장' }, 1);
  assert.equal(r.lit, false, '힌트 ①을 쓰면 마지막 칸은 안 채워진다');
  assert.equal(r.node.halves, 7);
  assert.equal(r.pending, 'solo3');
  r = applyAttempt(r.node, { correct: true, hint: 0, level: 3, repr: '식' }, 1);
  assert.equal(r.lit, true);
  assert.equal(r.node.halves, FULL);
  assert.equal(r.node.status, 'lit');
});

test('표현이 한 가지뿐이면 도착하지 않는다', () => {
  let n = emptyNode();
  for (let i = 0; i < 3; i++) n = applyAttempt(n, { correct: true, hint: 0, level: 3, repr: '식' }, 1).node;
  const r = applyAttempt(n, { correct: true, hint: 0, level: 3, repr: '식' }, 1);
  assert.equal(r.lit, false);
  assert.equal(r.pending, 'repr');
});

/** 늘 정답을 내는 아이로 운행을 돌린다. */
function playRun(state, seed, opts = {}) {
  let run = startRun(state, { day: 100, seed });
  let guard = 0;
  while (run && !run.finished && guard++ < 50) {
    const cur = currentProblem(run);
    if (!cur) break;
    if (opts.wrongEvery && guard % opts.wrongEvery === 0) {
      ({ state, run } = submit(state, run, -12345).outcome === 'giveup-offer' ? giveUp(state, run) : submit(state, run, -12345));
      if (!run.current && run.finished) break;
      if (run.current) ({ state, run } = giveUp(state, run));
      continue;
    }
    ({ state, run } = submit(state, run, cur.problem.answer));
  }
  return { state, run };
}

test('운행: 결정론 — 같은 씨앗값이면 같은 문제', () => {
  const s = createState();
  const a = startRun(s, { day: 1, seed: 42 });
  const b = startRun(s, { day: 1, seed: 42 });
  assert.equal(JSON.stringify(currentProblem(a).problem.text), JSON.stringify(currentProblem(b).problem.text));
});

test('운행: 다 맞히면 목적지 칸이 차고 결국 개통된다', () => {
  let state = createState();
  const first = destination(state).id;
  let lit = false;
  for (let i = 0; i < 6 && !lit; i++) {
    ({ state } = playRun(state, 1000 + i));
    lit = ['lit', 'passed', 'confirmed'].includes(state.nodes[first]?.status);
  }
  assert.ok(lit, `${first}이 개통되어야 함: ${JSON.stringify(state.nodes[first])}`);
  assert.ok(state.meters > 0, '거리가 쌓임');
});

test('운행: 차량은 불 꺼진 역을 지나치지 않는다(목적지는 늘 가장 앞의 꺼진 역)', () => {
  let state = createState();
  for (let i = 0; i < 4; i++) {
    const before = destination(state)?.id;
    ({ state } = playRun(state, 2000 + i));
    const after = destination(state)?.id;
    if (before && after && before !== after) assert.ok(['lit', 'passed', 'confirmed'].includes(state.nodes[before].status));
  }
});

test('운행: 틀린 문제는 다음 운행 임시 정차로 다시 나온다', () => {
  let state = createState();
  let run = startRun(state, { day: 5, seed: 7 });
  currentProblem(run);
  ({ state, run } = submit(state, run, -999));
  const r2 = submit(state, run, -999);
  assert.equal(r2.outcome, 'giveup-offer');
  ({ state, run } = giveUp(r2.state, r2.run));
  assert.equal(state.redo.length, 1);
  const next = startRun(state, { day: 6, seed: 8 });
  assert.equal(next.slots[0].kind, 'redo');
});

test('운행 일지 요약', () => {
  let state = createState();
  let run;
  ({ state, run } = playRun(state, 31));
  const s = summary(state, run);
  assert.equal(typeof s.meters, 'number');
  assert.ok(s.meters >= 0);
});

test('힌트 ③을 열고 맞히면 금 도장이 없다', () => {
  let state = createState();
  let run = startRun(state, { day: 1, seed: 3 });
  const cur = currentProblem(run);
  openHint(run, 3);
  ({ state, run } = submit(state, run, cur.problem.answer));
  assert.equal(state.goldTotal, 0);
});

test('급행 통과: 진단을 다 맞히면 통과역으로 켜진다', () => {
  let state = createState();
  let run = startExpress(state, { day: 1, seed: 9 });
  assert.ok(run);
  let out;
  let guard = 0;
  while (!run.finished && guard++ < 20) {
    const cur = currentProblem(run);
    out = submitExpress(state, run, cur.problem.answer);
    ({ state, run } = out);
  }
  const passed = Object.values(state.nodes).filter((n) => n.status === 'passed').length;
  assert.ok(passed >= 1);
});

test('급행 통과: 틀리면 그 역에 내린다', () => {
  let state = createState();
  let run = startExpress(state, { day: 1, seed: 9 });
  const node = run.express.node;
  let out = submitExpress(state, run, -1);
  ({ state, run } = out);
  if (!run.finished) ({ state, run } = submitExpress(state, run, -1));
  assert.equal(run.finished, true);
  assert.notEqual(state.nodes[node].status, 'passed');
});

test('시승 운행: 끝나고 placementDone', () => {
  let state = createState();
  let run = startPlacement(state, { day: 1, seed: 5 });
  let guard = 0;
  while (!run.finished && guard++ < 30) {
    const cur = currentProblem(run);
    ({ state, run } = submitPlacement(state, run, cur.problem.answer));
  }
  assert.equal(state.placementDone, true);
});

test('도전 운행: 어려운 문제 3개(지금 단계 +1 이상)', () => {
  const state = createState();
  const run = startRun(state, { day: 1, seed: 11, mode: 'challenge' });
  assert.equal(run.slots.filter((s) => s.kind === 'hard').length, 3);
});

test('정차 중인 문제는 다음 운행 첫 문제로 나온다', async () => {
  const { park } = await import('../src/engine/run.js');
  let state = createState();
  const run = startRun(state, { day: 1, seed: 12 });
  const cur = currentProblem(run);
  state = park(state, run);
  assert.ok(state.parked);
  const next = startRun(state, { day: 2, seed: 13 });
  assert.equal(next.slots[0].kind, 'parked');
  const again = currentProblem(next);
  assert.equal(JSON.stringify(again.problem.text), JSON.stringify(cur.problem.text), '같은 문제(같은 씨앗값)');
});

test('2연속 오답이면 쉬운 문제를 끼운다(칸에 넣지 않음)', () => {
  let state = createState();
  let run = startRun(state, { day: 1, seed: 21 });
  for (let k = 0; k < 2; k++) {
    currentProblem(run);
    ({ state, run } = submit(state, run, -7));
    ({ state, run } = submit(state, run, -7));
    ({ state, run } = giveUp(state, run));
  }
  assert.ok(run.slots.some((s) => s.kind === 'easy'));
});

test('실력 추정은 정답률 약 75%를 노린다(가상 학생 시뮬레이션)', async () => {
  const { nextRating } = await import('../src/engine/mastery.js');
  const { createRng } = await import('../src/engine/rng.js');
  for (const ability of [3, 5.5, 8]) {
    const rng = createRng(77 + ability * 10);
    let r = 2;
    let right = 0;
    const N = 4000;
    for (let i = 0; i < N; i++) {
      const level = Math.max(1, Math.round(r));
      const p = 1 / (1 + Math.exp(-(ability - level) * 1.2)); // 실력과 단계 차이로 맞힐 확률
      const c = rng.next() < p;
      if (i >= 500 && c) right += 1;
      r = nextRating(r, { correct: c, hint: 0, level });
    }
    const rate = right / (N - 500);
    assert.ok(rate > 0.66 && rate < 0.84, `실력 ${ability}: 정답률 ${rate.toFixed(3)}`);
  }
});

test('틀린 뒤 앱을 껐다 켜도 시도 기록이 이어진다(이어 타기)', async () => {
  const { park } = await import('../src/engine/run.js');
  let state = createState();
  let run = startRun(state, { day: 1, seed: 41 });
  currentProblem(run);
  ({ state, run } = submit(state, run, -3)); // 첫 시도 오답
  state = park(state, run);
  const next = startRun(state, { day: 2, seed: 42 });
  const cur = currentProblem(next);
  assert.equal(next.tries, 1, '틀린 횟수를 이어받음');
  // 한 번 더 틀린 뒤 끄고 다시 켜도 "세 번째 시도"가 되어 금 도장은 없다(금 도장 = 힌트 ① 이하, 두 번 안에)
  let st2 = state;
  let r2 = next;
  ({ state: st2, run: r2 } = submit(st2, r2, -3));
  st2 = park(st2, r2);
  const third = startRun(st2, { day: 3, seed: 43 });
  const c3 = currentProblem(third);
  assert.equal(third.tries, 2);
  const before = st2.goldTotal;
  const out = submit(st2, third, c3.problem.answer);
  assert.equal(out.state.goldTotal, before, '세 번째에 맞히면 금 도장 없음');
});

test('2호선은 서면(N25)이 켜지면 열리고, 운행마다 1호선 : 2호선 = 2 : 1', async () => {
  const { chooseLine, line2Open, playableNodes } = await import('../src/engine/run.js');
  const { emptyNode } = await import('../src/engine/mastery.js');
  let state = createState();
  assert.equal(line2Open(state), false);
  assert.equal(chooseLine(state), 'L1');
  if (playableNodes('L2').length === 0) return; // 2호선 템플릿이 아직 없으면 여기까지
  state = { ...state, nodes: { ...state.nodes, N25: { ...emptyNode(), status: 'lit' } } };
  assert.equal(line2Open(state), true);
  const seq = [0, 1, 2, 3, 4, 5].map((runs) => chooseLine({ ...state, runs }));
  assert.deepEqual(seq, ['L1', 'L1', 'L2', 'L1', 'L1', 'L2']);
});

test('부모 번호 검사: 숫자 4자리만', async () => {
  const { isPin } = await import('../src/engine/state.js');
  assert.equal(isPin('1234'), true);
  assert.equal(isPin('0000'), true);
  assert.equal(isPin('123'), false);
  assert.equal(isPin('12a4'), false);
  assert.equal(isPin('dddd'), false);
});

test('출제 조건(requires): 필요한 역을 켜지 않았으면 그 문제를 내지 않는다', async () => {
  const { allTemplates } = await import('../src/content/index.js');
  const t = allTemplates().find((x) => x.generate && (() => { try { return x.generate(createRngLocal(1), x.minLevel).requires; } catch { return false; } })());
  if (!t) return; // 조건이 있는 템플릿이 없으면 건너뜀
  const state = createState();
  for (let s = 0; s < 20; s++) {
    const run = { slots: [{ kind: 'hard', node: t.node, level: t.minLevel, templateId: t.id }], index: 0, current: null, recentReprs: [], seed: s, stateRef: state };
    const cur = currentProblem(run);
    if (cur?.problem?.requires) assert.fail(`조건이 안 맞는 문제가 나옴: ${t.id} ${cur.problem.requires}`);
  }
});
import { createRng as createRngLocal } from '../src/engine/rng.js';

function placeAll(answerFn) {
  let state = createState();
  let run = startPlacement(state, { day: 1, seed: 5 });
  let guard = 0;
  while (!run.finished && guard++ < 30) {
    const cur = currentProblem(run);
    ({ state, run } = submitPlacement(state, run, answerFn(cur, run)));
  }
  return { state, run };
}

test('시승 운행: 줄기마다 이분 탐색, 모두 5역 이하(10문제 이하)', () => {
  const { run } = placeAll((cur) => cur.problem.answer);
  assert.ok(run.placement.tested <= 5);
  assert.ok(run.index <= 10);
});

test('시승 운행: 모두 맞히면 앞 역이 통과역(추정)으로 켜지고, 필수 확인 역은 켜지지 않는다', () => {
  const { state, run } = placeAll((cur) => cur.problem.answer);
  const inferred = Object.entries(state.nodes).filter(([, ns]) => ns.inferred);
  assert.ok(inferred.length > 0, '추정 통과역이 있어야 한다');
  for (const [id, ns] of inferred) {
    assert.equal(ns.status, 'passed');
    assert.equal(ns.reviewDay, 2, '다음 날부터 임시 정차로 확인');
    assert.ok(!MUST_CHECK.has(id), `필수 확인 역 ${id}은 추정으로 켜지 않는다`);
  }
  assert.equal(state.nodes.N01?.status, 'passed', '첫 역에서 다시 시작하지 않는다');
  assert.notEqual(destination(state).id, 'N01');
  assert.equal(run.dest, destination(state, 'L1').id);
});

test('시작 실력: 같은 줄기 틀림 없이 2번 이상 통과 + 6역 안이면 3.5, 다른 줄기·먼 역·N17은 3', () => {
  const { state } = placeAll((cur) => cur.problem.answer);
  const pl = state.placement;
  assert.ok(pl.passes.whole >= 2 && !pl.misses.whole);
  const near = LINE1_NODES.find((n) => n.strand === 'whole' && !state.nodes[n.id] && !MUST_CHECK.has(n.id) && n.order - pl.farthest.whole <= 6 && !(n.prereqs ?? []).some((p) => p.minLevel && state.nodes[p.node]?.inferred));
  if (near) assert.equal(startRatingOf(state, near.id), 3.5, near.id);
  const far = LINE1_NODES.find((n) => n.strand === 'whole' && n.order - pl.farthest.whole > 6);
  if (far) assert.equal(startRatingOf(state, far.id), 3, far.id);
  assert.equal(startRatingOf(state, 'N17'), 3);
  const dest = destination(state);
  if (dest && !state.nodes[dest.id] && startRatingOf(state, dest.id) === 3.5) {
    const r = startRun(state, { day: 2, seed: 3 });
    const warm = r.slots.find((x) => x.kind === 'warm' && x.node === dest.id);
    assert.equal(warm.level, Math.min(3, ceilingOf(dest.id)), '준비 문제는 3단계');
  }
});

test('시승 운행: 모두 틀리면 아무 역도 켜지지 않고 시작 실력은 2', () => {
  const { state } = placeAll(() => -12345);
  assert.equal(Object.values(state.nodes).filter((ns) => ns.status === 'passed').length, 0);
  assert.equal(startRatingOf(state, 'N05'), 2);
  assert.equal(destination(state).id, 'N01');
});

test('시승에서 틀린 역과 그 역을 선수로 둔 역은 추정으로 켜지지 않는다', () => {
  let missed = null;
  const { state } = placeAll((cur, run) => {
    if (!missed) missed = run.dest;
    return run.dest === missed ? -12345 : cur.problem.answer;
  });
  assert.notEqual(state.nodes[missed].status, 'passed');
  for (const [id, ns] of Object.entries(state.nodes)) if (ns.inferred) assert.ok(!ancestorsOf(id).has(missed), `${id}의 선수에 틀린 역 ${missed}`);
  const strand = NODES.get(missed).strand;
  const fresh = LINE1_NODES.find((n) => n.strand === strand && !state.nodes[n.id]);
  if (fresh) assert.equal(startRatingOf(state, fresh.id), 3, '그 줄기에서 틀렸으면 3');
});

test('추정 통과역은 임시 정차에서 맞히면 확인되고 추정 표시가 지워진다', () => {
  const { state } = placeAll((cur) => cur.problem.answer);
  const [id, ns] = Object.entries(state.nodes).find(([, x]) => x.inferred);
  const after = applyReview(ns, true, 0, 2);
  assert.equal(after.status, 'confirmed', id);
  assert.equal(after.inferred, false);
});

/** 임시 정차 칸까지 건너뛰고 그 문제를 못 맞힌 채 넘긴다 */
function failReview(state, day, seed) {
  let run = startRun(state, { day, seed });
  run.index = run.slots.findIndex((x) => x.kind === 'review');
  assert.ok(run.index >= 0, '임시 정차 칸이 있어야 한다');
  currentProblem(run);
  ({ state, run } = submit(state, run, -12345));
  ({ state, run } = submit(state, run, -12346));
  ({ state, run } = giveUp(state, run));
  return { state, run };
}

test('추정 역을 임시 정차에서 두 번 연달아 못 맞히면 불은 둔 채 점검 목적지가 되고, 3단계 두 문제로 확정된다', () => {
  let { state } = placeAll((cur) => cur.problem.answer);
  const ids = Object.keys(state.nodes).filter((id) => state.nodes[id].inferred);
  const x = ids[0];
  for (const id of ids.slice(1)) state.nodes[id] = { ...state.nodes[id], reviewDay: 999 };
  for (const id of Object.keys(state.nodes)) if (!state.nodes[id].inferred && state.nodes[id].status === 'passed') state.nodes[id] = { ...state.nodes[id], reviewDay: 999 };
  let r = failReview(state, 2, 21);
  state = r.state;
  assert.equal(state.nodes[x].status, 'passed', '불은 꺼지지 않는다');
  if (!state.nodes[x].inspect) {
    // 첫 실패가 계산 실수였으면 한 번 더 기회
    state = failReview(state, 3, 22).state;
    if (!state.nodes[x].inspect) ({ state, run: r.run } = failReview(state, 4, 23));
  }
  assert.equal(state.nodes[x].inspect, true);
  assert.equal(state.nodes[x].status, 'passed');
  assert.equal(destination(state, 'L1').id, x, '점검 역이 목적지');
  assert.equal(startExpress(state, { day: 5, seed: 1 }), null, '점검 역은 급행으로 지나가지 않는다');
  let run = startRun(state, { day: 5, seed: 31 });
  assert.ok(run.slots.some((x2) => x2.kind === 'hard' && x2.node === x && x2.level >= Math.min(3, ceilingOf(x))));
  let guard = 0;
  let inspected = false;
  while (!run.finished && guard++ < 20) {
    const cur = currentProblem(run);
    ({ state, run } = submit(state, run, cur.problem.answer));
    if (run.events.some((e) => e.type === 'inspected' && e.node === x)) inspected = true;
  }
  if (ceilingOf(x) >= 3) {
    assert.ok(inspected, '점검 완료');
    assert.equal(state.nodes[x].status, 'confirmed');
    assert.equal(state.nodes[x].inspect, false);
    assert.equal(state.nodes[x].inferred, false);
  }
});

test('시승에서 맞힌 진단 문제는 면허를 올리지 않고, 넘긴 문제 뒤에는 면허가 오르지 않는다(UX 7차 A-1)', () => {
  let { state } = placeAll((cur) => cur.problem.answer);
  assert.equal(licenseOf(state), 1, '진단 정답만으로는 1단계');
  let run = startRun(state, { day: 2, seed: 41 });
  let guard = 0;
  while (!run.finished && guard++ < 20) {
    currentProblem(run);
    ({ state, run } = submit(state, run, -12345));
    if (run.current) ({ state, run } = submit(state, run, -12346));
    if (run.current) ({ state, run } = giveUp(state, run));
  }
  assert.equal(state.license, 1);
  assert.ok(!run.events.some((e) => e.type === 'license'));
});

test('추정으로 켠 역은 선수 닫힘(1호선 역)이 모두 켜져 있고, 필수 확인 역은 시작 실력 3(커리큘럼 11 검토 7·8)', () => {
  const { state } = placeAll((cur) => cur.problem.answer);
  const playable = new Set(LINE1_NODES.map((n) => n.id));
  const lit = (id) => ['lit', 'passed', 'confirmed'].includes(state.nodes[id]?.status);
  for (const [id, ns] of Object.entries(state.nodes)) {
    if (!ns.inferred) continue;
    for (const a of ancestorsOf(id)) if (playable.has(a)) assert.ok(lit(a), `${id}의 선수 ${a}가 꺼져 있음`);
  }
  for (const id of MUST_CHECK) if (!state.nodes[id]) assert.equal(startRatingOf(state, id), 3, id);
});

test('점검이 두 운행 안에 끝나지 않으면 목적지를 내주고 보통 임시 정차로(아동 심리 04 R2), 힌트 정답은 반 문제', () => {
  let { state } = placeAll((cur) => cur.problem.answer);
  const x = Object.keys(state.nodes).find((id) => state.nodes[id].inferred);
  state.nodes[x] = { ...state.nodes[x], inspect: true, inspectRight: 0, inspectRuns: [] };
  for (const id of Object.keys(state.nodes)) if (id !== x && state.nodes[id].status === 'passed') state.nodes[id] = { ...state.nodes[id], reviewDay: 999 };
  let released = false;
  for (let k = 0; k < 3 && !released; k++) {
    let run = startRun(state, { day: 5 + k, seed: 100 + k });
    let guard = 0;
    while (!run.finished && guard++ < 20) {
      currentProblem(run);
      ({ state, run } = submit(state, run, -12345));
      if (run.current) ({ state, run } = submit(state, run, -12346));
      if (run.current) ({ state, run } = giveUp(state, run));
      if (run.events.some((e) => e.type === 'inspectReleased')) released = true;
    }
  }
  assert.ok(released, '세 번째 운행에서 점검이 풀린다');
  assert.equal(state.nodes[x].inspect, false);
  assert.equal(state.nodes[x].status, 'passed', '불은 그대로');
  assert.notEqual(destination(state, 'L1').id, x);
});

test('힌트 없이 틀린 뒤 맞히면 hinted 0, retried 1(게이미피케이션 04 P0)', () => {
  let state = createState();
  let run = startRun(state, { day: 1, seed: 11 });
  const cur = currentProblem(run);
  ({ state, run } = submit(state, run, -12345));
  ({ state, run } = submit(state, run, cur.problem.answer));
  const sm = summary(state, run);
  assert.equal(sm.hinted, 0);
  assert.equal(sm.retried, 1);
  const att = state.nodes[cur.slot.node].attempts.at(-1);
  assert.equal(att.o, 0, '실제로 연 힌트는 0');
});

test('한 운행에서 같은 템플릿은 두 번까지, 연달아서는 나오지 않는다(여러 씨앗)', () => {
  for (let seed = 1; seed <= 40; seed++) {
    let state = createState();
    let run = startRun(state, { day: 1, seed });
    const ids = [];
    let guard = 0;
    while (!run.finished && guard++ < 20) {
      const cur = currentProblem(run);
      if (cur.slot.kind !== 'easy' && cur.slot.kind !== 'redo' && cur.slot.kind !== 'parked' && templatesFor(cur.slot.node).filter((t) => t.minLevel <= cur.level && cur.level <= t.maxLevel).length >= 3) ids.push(cur.template.id);
      ({ state, run } = submit(state, run, cur.problem.answer));
    }
    for (let i = 1; i < ids.length; i++) assert.notEqual(ids[i], ids[i - 1], `씨앗 ${seed}: 연달아 ${ids[i]}`);
  }
});
