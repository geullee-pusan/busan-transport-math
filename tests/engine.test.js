// 엔진 검사: 칸·개통 규칙, 운행 진행, 급행·시승, 결정론.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState } from '../src/engine/state.js';
import { applyAttempt, emptyNode, FULL } from '../src/engine/mastery.js';
import { startRun, currentProblem, submit, giveUp, destination, summary, openHint } from '../src/engine/run.js';
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
