// N13 서대신 — (몇십)×(몇십), (두 자리)×(두 자리) [4수01-04]. 천장 7.
// 기준: docs/curriculum/08-line1-templates-11-20.md 13절(서대신 = 13번째 역), 09 끝 보강 후보(그림: 넓이 모형 2 × 2). 피드백 꼬리표 kind: 'check' | 'nudge'(10 문서 2절).
import { n, unknown, label } from '../num.js';

// ── 말 도우미(숫자 뒤 조사) ──
const DIG = ['c', 'l', 'v', 'c', 'v', 'v', 'c', 'l', 'l', 'v']; // 영 일 이 삼 사 오 육 칠 팔 구
function fin(x) {
  let s = String(x);
  if (s.includes('/')) s = s.split('/')[0];
  if (s.includes('.')) return DIG[Number(s.at(-1))];
  const v = Math.abs(Math.round(Number(s)));
  if (v === 0) return 'c';
  if (v % 10) return DIG[v % 10];
  return 'c'; // 십·백·천
}
const jo = (x, c, v) => (fin(x) === 'v' ? v : c);
const ieyo = (x) => `${x}${jo(x, '이에요', '예요')}`;
const ro = (x) => `${x}${fin(x) === 'c' ? '으로' : '로'}`;
const eul = (x) => `${x}${jo(x, '을', '를')}`;
const wa = (x) => `${x}${jo(x, '과', '와')}`;
const eun = (x) => `${x}${jo(x, '은', '는')}`;
const roOnly = (x) => (fin(x) === 'c' ? '으로' : '로');
/** 글자 낱말 뒤 조사(받침이 있으면 c, 없으면 v) */
const bat = (w) => {
  const code = String(w).charCodeAt(String(w).length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0;
};
const jw = (w, c, v) => `${w}${bat(w) ? c : v}`;

const SRC_L1 = 'FACTS: 1호선 다대포해수욕장–노포, 40역, 39.9km, 8량(부산교통공사, 2026-10-04 확인)';
const SRC_ORDER = 'FACTS: 1호선 역 순서(다대포해수욕장 1번째 … 노포 40번째, 부산교통공사, 2026-10-04 확인)';
const L1 = () => label('1', { source: SRC_L1 });
const CARS = () => n(8, { real: true, source: SRC_L1 });
const V = (x) => n(x, { virtual: true });

/** 오른쪽에서 k번째 자리(0 = 일의 자리)를 빈칸으로 */
function blankAt(v, k = 1) {
  const s = String(v);
  const i = s.length - 1 - k;
  return { blank: s.slice(0, i) + '☐' + s.slice(i + 1), blankAnswer: s[i] };
}
function draw(rng, make, ok, fallback) {
  for (let t = 0; t < 50; t++) {
    const p = make();
    if (ok(p)) return p;
  }
  return fallback;
}
const uniq = (list, answer) => {
  const seen = new Set();
  return list.filter((d) => {
    const k = JSON.stringify(d.value);
    if (d.value === answer || k === JSON.stringify(answer) || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};
/** 칸 묶음(compound) 판별 오답: 그 칸의 정답과 같거나 같은 칸에서 값이 겹치는 것을 뺀다. */
const uniqK = (list, answer) => {
  const seen = new Set();
  return list.filter((d) => {
    const k = `${d.key}|${JSON.stringify(d.value)}`;
    if (String(d.value) === String(answer[d.key]) || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};
/** 여럿 고르기 채점 */
function multiGrade(answer, discs) {
  const key = (arr) => [...new Set((Array.isArray(arr) ? arr : []).map(String))].sort().join('|');
  const want = key(answer);
  return (r) => {
    if (!Array.isArray(r) || r.length === 0) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '답을 먼저 골라 볼까요?' };
    const got = key(r);
    if (got === want) return { correct: true };
    const d = discs.find((x) => key(x.value) === got);
    return d ? { correct: false, category: d.category, kind: d.kind ?? 'check', feedbackCheck: d.feedbackCheck, feedback: d.feedback } : { correct: false, category: null, kind: 'check', feedback: null };
  };
}

const SEO = () => n(13, { real: true, source: SRC_ORDER });
const STATIONS13 = ['다대포해수욕장', '다대포항', '낫개', '신장림', '장림', '동매', '신평', '하단', '당리', '사하', '괴정', '대티', '서대신'];
/** 두 자리 × 두 자리를 잘못 계산한 값들 */
function twoByTwoDiscs(x, y) {
  const t = Math.floor(y / 10);
  const u = y % 10;
  const xt = Math.floor(x / 10);
  const xu = x % 10;
  const P = x * y;
  return uniq(
    [
      { value: x * u + x * t, category: '개념', kind: 'nudge', feedbackCheck: '십의 자리 곱을 다시 볼까요?', feedback: `${y}의 ${eun(t)} ${t}일까요, ${t * 10}일까요?` },
      { value: x * u, category: '식', kind: 'nudge', feedbackCheck: '곱한 것을 다시 볼까요?', feedback: `${x} × ${wa(u)} ${x} × ${t * 10}${jo(t * 10, '을', '를')} 다 더했나요?` },
      { value: x * t * 10, category: '식', kind: 'nudge', feedbackCheck: '곱한 것을 다시 볼까요?', feedback: `${x} × ${wa(u)} ${x} × ${t * 10}${jo(t * 10, '을', '를')} 다 더했나요?` },
      { value: xt * t * 100 + xu * u, category: '개념', kind: 'check', feedback: `${x} × ${eun(y)} ${xt} × ${wa(t)} ${xu} × ${u}뿐일까요?` },
    ],
    P,
  );
}

// ── T13-1 정비창 점검 (식) — 1~3단계 ──
function t131Level1(a, b) {
  const A = a * 10;
  const B = b * 10;
  const P = A * B;
  const bl = blankAt(P, 1);
  return {
    text: [n(A), ' × ', n(B), ' = ?'],
    figure: null,
    input: { kind: 'number' },
    answer: P,
    discriminators: uniq(
      [
        { value: a * b * 10, category: '계산', kind: 'check', feedback: '끝의 0이 몇 개일까요?' },
        { value: a * b, category: '계산', kind: 'check', feedback: '끝의 0은 어디 갔나요?' },
        { value: A + B, category: '식', kind: 'nudge', feedbackCheck: '문제를 다시 읽어 볼까요?', feedback: '곱셈이에요. 몇 번 더하는 셈일까요?' },
      ],
      P,
    ),
    hints: [`${wa(A)} ${B}의 곱을 물어요.`, `${eun(A)} 10이 ${a}개, ${eun(B)} 10이 ${b}개예요. ${a} × ${b}부터 생각해 볼까요?`, '10 × 10 = 100이에요.', `${A} × ${B} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${A} × ${eun(B)} ${a} × ${b}에 10 × 10 = 100을 곱한 것과 같아요.`, `${a} × ${b} = ${ieyo(a * b)}.`, `그래서 ${A} × ${B} = ${ieyo(P)}.`],
      alt: [`${A} × ${b} = ${A * b}, 그것을 10배 하면 ${ieyo(P)}.`, `어느 길로 해도 답은 ${ro(P)} 같아요.`],
    },
  };
}

function t131Level2(x, b) {
  const B = b * 10;
  const P = x * B;
  const bl = blankAt(P, 0);
  return {
    text: [n(x), ' × ', n(B), ' = ?'],
    figure: null,
    input: { kind: 'number' },
    answer: P,
    discriminators: uniq(
      [
        { value: x * b, category: '계산', kind: 'check', feedback: '끝의 0은 어디 갔나요?' },
        { value: x + B, category: '식', kind: 'nudge', feedbackCheck: '문제를 다시 읽어 볼까요?', feedback: '곱셈이에요. 몇 번 더하는 셈일까요?' },
      ],
      P,
    ),
    hints: [`${wa(x)} ${B}의 곱을 물어요.`, `${eun(B)} ${b}의 10배예요. ${x} × ${b}부터 구해 볼까요?`, `${x} × ${b} = ${ieyo(x * b)}.`, `${x} × ${B} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${x} × ${eun(B)} ${x} × ${b}의 10배예요.`, `${x} × ${b} = ${x * b}, 10배 하면 ${ieyo(P)}.`, `그래서 ${x} × ${B} = ${ieyo(P)}.`],
      alt: [`${eul(x)} ${Math.floor(x / 10) * 10}${jo(Math.floor(x / 10) * 10, '과', '와')} ${ro(x % 10)} 나눠요. ${Math.floor(x / 10) * 10} × ${B} = ${Math.floor(x / 10) * 10 * B}, ${x % 10} × ${B} = ${ieyo((x % 10) * B)}.`, `어느 길로 해도 답은 ${ro(P)} 같아요.`],
    },
  };
}

function buildTwo(x, y) {
  const t = Math.floor(y / 10);
  const u = y % 10;
  const P = x * y;
  const bl = blankAt(P, 1);
  const xt = Math.floor(x / 10) * 10;
  const xu = x % 10;
  return {
    text: [n(x), ' × ', n(y), ' = ?'],
    figure: { kind: 'vertical', op: '×', a: x, b: y },
    input: { kind: 'number' },
    answer: P,
    discriminators: twoByTwoDiscs(x, y),
    hints: [`${wa(x)} ${y}의 곱을 물어요.`, `${eul(y)} ${wa(t * 10)} ${ro(u)} 나눠서 ${x}에 각각 곱해 볼까요?`, `${x} × ${u} = ${x * u}, ${x} × ${t * 10} = ${ieyo(x * t * 10)}.`, `${x * u} + ${x * t * 10} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${x} × ${eun(y)} ${x} × ${wa(t * 10)} ${x} × ${eul(u)} 합친 거예요.`, `${x * t * 10} + ${x * u} = ${ieyo(P)}.`, `그래서 ${x} × ${y} = ${ieyo(P)}.`],
      alt: [`${eul(x)} ${wa(xt)} ${ro(xu)} 나눠요. ${xt} × ${y} = ${xt * y}, ${xu} × ${y} = ${xu * y}, ${xt * y} + ${xu * y} = ${ieyo(P)}.`, `두 풀이 모두 ${ieyo(P)}.`],
    },
  };
}

const T13_1 = {
  id: 'T13-1',
  node: 'N13',
  title: '정비창 점검: (두 자리)×(두 자리)',
  repr: '식',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 1) {
      const [a, b] = draw(rng, () => [rng.int(2, 9), rng.int(2, 9)], ([p, q]) => p !== q && (p * q) % 10 !== 0, [3, 4]);
      return t131Level1(a, b);
    }
    if (level === 2) {
      const [x, b] = draw(rng, () => [rng.int(12, 98), rng.int(2, 9)], ([p, q]) => p % 10 > 1 && p !== q * 10 && (p * q) % 10 !== 0, [23, 4]);
      return t131Level2(x, b);
    }
    const [x, y] = draw(rng, () => [rng.int(12, 49), rng.int(12, 39)], ([p, q]) => p % 10 > 1 && q % 10 > 1 && p !== q && (p * q) % 10 !== q % 10, [23, 14]);
    return buildTwo(x, y);
  },
};

// ── T13-2 역마다 같은 수 (문장 + 노선 그림) — 1~4단계 ──
function t132Level1(c) {
  const P = 13 * c;
  const bl = blankAt(P, 0);
  return {
    text: ['다대포해수욕장부터 서대신까지는 ', SEO(), '역이에요. 어느 날 역마다 ', V(c), '명씩 탔어요. 모두 몇 명이에요?'],
    figure: null,
    input: { kind: 'number', unit: '명' },
    answer: P,
    discriminators: uniq(
      [
        { value: 13 * (c / 10), category: '계산', kind: 'check', feedback: '끝의 0은 어디 갔나요?' },
        { value: 13 + c, category: '식', kind: 'nudge', feedbackCheck: '문제를 다시 읽어 볼까요?', feedback: '역마다 같은 수예요. 몇 번 더할까요?' },
      ],
      P,
    ),
    hints: [`다대포해수욕장부터 서대신까지 13역이고, 역마다 ${c}명씩 탔어요. 모두 몇 명인지 물어요.`, `${c}명씩 13역이에요. ${eun(c)} 10이 ${c / 10}개라는 것을 써 볼까요?`, `13 × ${c / 10} = ${ieyo(13 * (c / 10))}.`, `13 × ${c} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${c}명씩 13역이니 13 × ${eul(c)} 해요.`, `13 × ${c / 10} = ${13 * (c / 10)}, 10배 하면 ${ieyo(P)}.`, `그래서 모두 ${P}명이에요.`],
      alt: [`13을 10과 3으로 나눠요. 10 × ${c} = ${10 * c}, 3 × ${c} = ${3 * c}, 합치면 ${ieyo(P)}.`, `어느 길로 해도 답은 ${ro(P)} 같아요.`],
    },
  };
}

function t132Level2(c) {
  const P = 13 * c;
  const bl = blankAt(P, 1);
  return {
    text: ['어느 날 역마다 ', V(c), '명씩 탔어요. 다대포해수욕장부터 서대신까지 ', SEO(), '역에서 탄 사람은 모두 몇 명이에요?'],
    figure: null,
    input: { kind: 'number', unit: '명' },
    answer: P,
    discriminators: uniq(
      [
        { value: c * 3 + c, category: '개념', kind: 'nudge', feedbackCheck: '십의 자리 곱을 다시 볼까요?', feedback: '13의 1은 1일까요, 10일까요?' },
        { value: c * 3, category: '식', kind: 'nudge', feedbackCheck: '곱한 것을 다시 볼까요?', feedback: `${c} × 3과 ${c} × 10을 다 더했나요?` },
        { value: c * 10, category: '식', kind: 'nudge', feedbackCheck: '곱한 것을 다시 볼까요?', feedback: `${c} × 3과 ${c} × 10을 다 더했나요?` },
        { value: 13 + c, category: '식', kind: 'nudge', feedbackCheck: '문제를 다시 읽어 볼까요?', feedback: '역마다 같은 수예요. 몇 번 더할까요?' },
      ],
      P,
    ),
    hints: [`13역에서 역마다 ${c}명씩 탔어요. 모두 몇 명인지 물어요.`, `13을 10과 3으로 나눠서 ${c}에 각각 곱해 볼까요?`, `${c} × 10 = ${c * 10}, ${c} × 3 = ${ieyo(c * 3)}.`, `${c * 10} + ${c * 3} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${c}명씩 13역이니 ${c} × 13을 해요.`, `${c} × 10 = ${c * 10}, ${c} × 3 = ${c * 3}, 합치면 ${ieyo(P)}.`, `그래서 모두 ${P}명이에요.`],
      alt: [`${eul(c)} ${Math.floor(c / 10) * 10}${jo(Math.floor(c / 10) * 10, '과', '와')} ${ro(c % 10)} 나눠요. ${Math.floor(c / 10) * 10} × 13 = ${Math.floor(c / 10) * 130}, ${c % 10} × 13 = ${ieyo((c % 10) * 13)}.`, `어느 길로 해도 답은 ${ro(P)} 같아요.`],
    },
  };
}

/** 3단계: 그림에서 역 수 세기(양 끝 포함) + 곱 */
function t132Level3(x) {
  const P = 13 * x;
  const bl = blankAt(P, 1);
  const answer = { count: 13, total: P };
  const fb = '다대포해수욕장도 사람이 탄 역인가요?';
  return {
    text: ['어느 날 다대포해수욕장부터 서대신까지 역마다 ', V(x), '명씩 탔어요. 두 역을 포함해 몇 역이고, 모두 몇 명이 탔어요?'],
    figure: { kind: 'stations', stations: STATIONS13 },
    input: { kind: 'compound', fields: [{ key: 'count', label: '역 수' }, { key: 'total', label: '모두' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'count', value: 12, category: '개념', kind: 'check', feedback: fb },
        { key: 'total', value: 12 * x, category: '개념', kind: 'check', feedback: fb },
      ],
      answer,
    ),
    counting: true,
    hints: [`다대포해수욕장부터 서대신까지 역마다 ${x}명씩 탔어요. 역 수와 모두 탄 사람 수를 물어요.`, '그림에서 역을 하나씩 짚으며 세어 볼까요? 양 끝 역도 사람이 탄 역이에요.', '다대포해수욕장이 1번째, 다대포항이 2번째 역이에요.', '서대신은 1☐번째 역'],
    blank: '1☐',
    blankAnswer: '3',
    blankThen: '역 수와 모두 탄 사람 수를 써요.',
    explain: {
      why: ['다대포해수욕장부터 서대신까지 역은 13개예요(정거장 간격은 12개).', `${x} × 13 = ${x * 10} + ${x * 3} = ${ieyo(P)}.`, `그래서 13역, 모두 ${P}명이에요.`],
      alt: [`${x} × 13 = ${x} × 10 + ${x} × 3 = ${x * 10} + ${x * 3} = ${ieyo(P)}.`, `두 풀이 모두 ${P}명이에요.`],
    },
  };
}

/** 4단계: 일의 자리를 잘못 본 결과 → 바른 곱 */
function t132Level4(t, u, v) {
  const p = 10 * t + u;
  const q = 10 * t + v;
  const W = 13 * q;
  const d = v - u;
  const P = 13 * p;
  const bl = blankAt(P, 0);
  return {
    text: ['다대포해수욕장부터 서대신까지 ', SEO(), '역에서 역마다 같은 수만큼 탔어요. 어느 날 역무원이 장부에서 한 역의 사람 수 일의 자리 ', V(u), jo(u, '을', '를'), ' ', V(v), roOnly(v), ' 잘못 보고 계산했더니 ', V(W), '명이 나왔어요. 바르게 계산하면 몇 명이에요?'],
    figure: null,
    input: { kind: 'number', unit: '명' },
    answer: P,
    discriminators: uniq(
      [
        { value: W - d, category: '개념', kind: 'nudge', feedbackCheck: '잘못 본 것은 몇 역이에요?', feedback: `한 역에서 ${d}명씩, 13역이면요?` },
        { value: W + 13 * d, category: '개념', kind: 'nudge', feedbackCheck: `${eun(W)} 무엇을 잘못 본 결과예요?`, feedback: `${v}${roOnly(v)} 잘못 봤으면 결과가 컸을까요?` },
        { value: p, category: '식', kind: 'nudge', feedbackCheck: '무엇을 물었는지 다시 볼까요?', feedback: `한 역 ${p}명을 찾았어요. 다음엔요?` },
        { value: q, category: '식', kind: 'nudge', feedbackCheck: '무엇을 물었는지 다시 볼까요?', feedback: `${q}명은 잘못 본 수예요. 13역이면요?` },
      ],
      P,
    ),
    hints: [`13역에서 역마다 같은 수만큼 탔어요. 일의 자리 ${eul(u)} ${v}${roOnly(v)} 잘못 보고 계산한 결과가 ${W}명이에요. 바르게 계산한 수를 물어요.`, '한 역에서 몇 명씩 더 세었을까요? 13역이면 모두 몇 명을 더 센 걸까요?', `한 역에서 ${d}명씩, 13역이면 ${13 * d}명을 더 셌어요.`, `${W} − ${13 * d} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${eul(u)} ${v}${roOnly(v)} 보면 한 역에서 ${d}명씩 더 센 거예요.`, `13역이면 ${d} × 13 = ${13 * d}명을 더 세었으니 ${W} − ${13 * d} = ${ieyo(P)}.`, `그래서 바르게 계산하면 ${P}명이에요.`],
      alt: [`잘못 본 수는 ${q}명이니 한 역의 바른 수는 ${p}명이에요. ${p} × 13 = ${ieyo(P)}.`, `두 풀이 모두 ${P}명이에요.`],
    },
  };
}

const T13_2 = {
  id: 'T13-2',
  node: 'N13',
  title: '역마다 같은 수',
  repr: '문장',
  minLevel: 1,
  maxLevel: 4,
  generate(rng, level) {
    if (level === 1) return t132Level1(rng.pick([20, 30, 40, 50, 60, 70]));
    if (level === 2) return t132Level2(draw(rng, () => rng.int(21, 69), (c) => c % 10 > 1, 35));
    if (level === 3) return t132Level3(draw(rng, () => rng.int(21, 49), (c) => c % 10 > 1, 24));
    const [t, u, v] = draw(rng, () => [rng.int(2, 6), rng.int(0, 6), rng.int(1, 9)], ([, uu, vv]) => vv > uu && vv - uu <= 3, [4, 6, 9]);
    return t132Level4(t, u, v);
  },
};

// ── T13-3 도전 문제 (challenge) — 5~7단계 ──
function t133Level5(a, y, k, T) {
  const answer = Array.from({ length: k + 1 }, (_, i) => i);
  const val = (d) => (10 * a + d) * y;
  const discs = [
    { value: answer.slice(0, -1), category: '개념', kind: 'nudge', feedbackCheck: '빠진 것이 없나요?', feedback: `${a}${k} × ${y}도 계산해 봤나요?` },
    { value: [...answer, k + 1], category: '개념', kind: 'check', feedback: `${a}${k + 1} × ${eun(y)} ${T}보다 작나요?` },
  ];
  if (k >= 1) discs.push({ value: answer.slice(1), category: '개념', kind: 'nudge', feedbackCheck: '빠진 것이 없나요?', feedback: '□에 0도 넣어 봤나요?' });
  return {
    text: [unknown(`${a}□`), ' × ', n(y), jo(y, '이', '가'), ' ', n(T), '보다 작아요. □에 들어갈 수 있는 수를 모두 골라요.'],
    figure: null,
    challenge: true,
    input: { kind: 'multi', options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
    answer,
    discriminators: uniq(discs, answer),
    grade: multiGrade(answer, discs),
    hints: [`${a}□에 ${eul(y)} 곱한 값이 ${T}보다 작게 되는 □를 모두 찾아요.`, `어림해서 ${a}0 × ${y}부터 볼까요? 경계 근처의 수만 정확히 계산해 봐요.`, `□가 ${k + 1}${jo(k + 1, '이면', '면')} ${a}${k + 1} × ${y} = ${ro(val(k + 1))} ${T}보다 커요.`, '들어갈 수 있는 수: 0부터 ☐까지'],
    blank: '0부터 ☐까지',
    blankAnswer: String(k),
    explain: {
      why: [`${a}${k} × ${y} = ${ro(val(k))} ${T}보다 작아요.`, `${a}${k + 1} × ${y} = ${ro(val(k + 1))} ${T}보다 커요.`, `그래서 들어갈 수 있는 수는 0부터 ${k}까지예요.`],
      alt: [`□에 0부터 차례로 넣어 곱을 적어 봐도 돼요.`, `어느 길로 해도 답은 0부터 ${k}까지로 같아요.`],
    },
  };
}

function t133Level6(cards) {
  const d = [...cards].sort((p, q) => q - p);
  const best = (10 * d[0] + d[3]) * (10 * d[1] + d[2]);
  const wrong = (10 * d[0] + d[2]) * (10 * d[1] + d[3]);
  const wrong2 = (10 * d[0] + d[1]) * (10 * d[2] + d[3]);
  const bl = blankAt(best, 1);
  return {
    text: ['숫자 카드 ', n(cards[0]), ', ', n(cards[1]), ', ', n(cards[2]), ', ', n(cards[3]), jo(cards[3], '을', '를'), ' 한 번씩 써서 (두 자리 수) × (두 자리 수)를 만들어요. 곱이 가장 클 때는 얼마예요?'],
    figure: { kind: 'cards', cards },
    challenge: true,
    input: { kind: 'number' },
    answer: best,
    discriminators: uniq(
      [
        { value: wrong, category: '개념', kind: 'nudge', feedbackCheck: '다른 짝도 견주어 봤나요?', feedback: `${10 * d[0] + d[3]} × ${10 * d[1] + d[2]}도 계산해 봤나요?` },
        { value: wrong2, category: '개념', kind: 'check', feedback: '다른 짝도 견주어 봤나요?' },
      ],
      best,
    ),
    hints: ['카드 네 장으로 두 자리 수 두 개를 만들어요. 두 수의 곱이 가장 클 때를 물어요.', '큰 숫자 두 개는 십의 자리에 놓아요. 남은 두 숫자를 어느 쪽에 붙일지 견주어 볼까요?', `${10 * d[0] + d[2]} × ${10 * d[1] + d[3]} = ${ieyo(wrong)}.`, `${10 * d[0] + d[3]} × ${10 * d[1] + d[2]} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`십의 자리에는 큰 숫자 ${wa(d[0])} ${eul(d[1])} 놓아요.`, `남은 숫자를 두 가지로 붙여 보면 ${10 * d[0] + d[3]} × ${10 * d[1] + d[2]} = ${best}, ${10 * d[0] + d[2]} × ${10 * d[1] + d[3]} = ${ieyo(wrong)}.`, `그래서 가장 큰 곱은 ${ieyo(best)}.`],
      alt: ['두 수의 차이가 작을수록 곱이 커져요. 그래서 큰 십의 자리 쪽에 작은 일의 자리를 붙여요.', `어느 길로 해도 답은 ${ro(best)} 같아요.`],
    },
  };
}

/** 곱의 일의 자리가 u가 되는 일의 자리 숫자 짝(작은 것 먼저) */
function unitPairs(u) {
  const out = [];
  for (let a = 1; a <= 9; a++) for (let b = a; b <= 9; b++) if ((a * b) % 10 === u) out.push([a, b]);
  return out;
}

function t133Level7(p, q) {
  const P = p * q;
  const answer = { small: p, big: q };
  const u = P % 10;
  return {
    text: ['두 자리 수 두 개를 곱했더니 ', n(P), jo(P, '이에요', '예요'), '. 두 수는 무엇이에요?'],
    figure: null,
    challenge: true,
    input: { kind: 'compound', fields: [{ key: 'small', label: '작은 수' }, { key: 'big', label: '큰 수' }] },
    answer,
    discriminators: [],
    grade(r) {
      const a = Number(String(r?.small ?? '').trim());
      const b = Number(String(r?.big ?? '').trim());
      if ([r?.small, r?.big].every((v) => v === undefined || v === null || String(v).trim() === '')) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '답을 먼저 써 볼까요?' };
      if ((a === p && b === q) || (a === q && b === p)) return { correct: true };
      if (a > 0 && b > 0 && a * b !== P) return { correct: false, category: '계산', kind: 'check', feedback: `${a} × ${b}, 곱해서 확인해 볼까요?` };
      if (a * b === P) return { correct: false, category: '개념', kind: 'check', feedback: '두 수 모두 두 자리 수인가요?' };
      return { correct: false, category: null, kind: 'check', feedback: null };
    },
    hints: [`두 자리 수 두 개의 곱이 ${ieyo(P)}. 그 두 수를 물어요.`, `곱의 일의 자리가 ${u}${jo(u, '이', '가')} 되는 두 일의 자리 숫자를 찾아볼까요? 그다음 어림으로 좁혀 봐요.`, `일의 자리 짝은 ${unitPairs(u).map(([a, b]) => `${a}·${b}`).join(', ')} 중 하나예요.`, `${p} × ☐${q % 10} = ${P}`],
    blank: `☐${q % 10}`,
    blankAnswer: String(Math.floor(q / 10)),
    blankThen: '두 수를 써요.',
    explain: {
      why: [`곱의 일의 자리 ${u}${jo(u, '이', '가')} 나오려면 두 수의 일의 자리는 ${p % 10}${jo(p % 10, '과', '와')} ${q % 10} 같은 짝이어야 해요.`, `어림으로 좁혀 곱해 보면 ${p} × ${q} = ${ieyo(P)}.`, `그래서 두 수는 ${wa(p)} ${ieyo(q)}.`],
      alt: [`${eul(P)} 작은 수로 차례로 나눠 보아도 ${wa(p)} ${q}만 두 자리 수끼리의 곱이에요.`, `두 풀이 모두 ${wa(p)} ${ieyo(q)}.`],
    },
  };
}

const PRIMES2 = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
const T13_3 = {
  id: 'T13-3',
  node: 'N13',
  title: '도전 문제: 두 자리 곱',
  repr: '식',
  challenge: true,
  minLevel: 5,
  maxLevel: 7,
  generate(rng, level) {
    if (level === 5) {
      const [a, y, k, T] = draw(
        rng,
        () => {
          const aa = rng.int(1, 4);
          const yy = draw(rng, () => rng.int(11, 19), (z) => z % 10 !== 0, 14);
          const kk = rng.int(1, 8);
          const lo = (10 * aa + kk) * yy;
          const hi = (10 * aa + kk + 1) * yy;
          const TT = Math.ceil((lo + 1) / 100) * 100;
          return [aa, yy, kk, TT < hi ? TT : 0];
        },
        ([, , , TT]) => TT > 0,
        [2, 14, 8, 400],
      );
      return t133Level5(a, y, k, T);
    }
    if (level === 6) return t133Level6(rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4));
    const [p, q] = draw(rng, () => [rng.pick(PRIMES2), rng.pick(PRIMES2)], ([a, b]) => a < b && a * b < 1000, [17, 23]);
    return t133Level7(p, q);
  },
};

// ── T13-4 넓이 모형 2 × 2 (그림) — 1~3단계, 09 보강 후보 ──
// figure: { kind: 'areaModel', parts: [[가로 몇십, 가로 일], [세로 몇십, 세로 일]] }
function t134(x, y) {
  const xt = Math.floor(x / 10) * 10;
  const xu = x % 10;
  const yt = Math.floor(y / 10) * 10;
  const yu = y % 10;
  const P = x * y;
  const answer = { a: xt * yt, b: xu * yt, c: xt * yu, d: xu * yu, total: P };
  const bl = answer.d >= 10 ? blankAt(answer.d, 1) : { blank: '☐', blankAnswer: String(answer.d) };
  const discs = uniqK(
    [
      { key: 'a', value: (xt / 10) * (yt / 10), category: '개념', kind: 'check', feedback: '끝의 0이 몇 개일까요?' },
      { key: 'a', value: (xt / 10) * yt, category: '개념', kind: 'check', feedback: '끝의 0이 몇 개일까요?' },
      ...twoByTwoDiscs(x, y).map((d) => ({ ...d, key: 'total' })),
    ],
    answer,
  );
  return {
    text: ['역 대합실 바닥에 타일을 가로 ', V(x), '장, 세로 ', V(y), '줄로 깐다고 해 봐요. 그림처럼 네 부분으로 나눠서 타일 수를 구해요.'],
    figure: { kind: 'areaModel', parts: [[xt, xu], [yt, yu]] },
    input: {
      kind: 'compound',
      fields: [
        { key: 'a', label: `${xt} × ${yt}` },
        { key: 'b', label: `${xu} × ${yt}` },
        { key: 'c', label: `${xt} × ${yu}` },
        { key: 'd', label: `${xu} × ${yu}` },
        { key: 'total', label: '모두' },
      ],
    },
    answer,
    discriminators: discs,
    hints: [`타일은 가로 ${x}장씩 세로 ${y}줄이에요. 그림은 네 부분으로 나뉘어 있어요. 네 부분의 타일 수와 모두를 물어요.`, '네 부분을 각각 구해 볼까요? 네 부분을 합치면 전체예요.', `${xt} × ${yt} = ${answer.a}, ${xu} × ${yt} = ${answer.b}, ${xt} × ${yu} = ${ieyo(answer.c)}.`, `${xu} × ${yu} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '"모두" 칸도 채워요.',
    explain: {
      why: [`${x} × ${eun(y)} 네 부분 ${xt} × ${yt}, ${xu} × ${yt}, ${xt} × ${yu}, ${xu} × ${yu}${roOnly(yu)} 나뉘어요.`, `${answer.a} + ${answer.b} + ${answer.c} + ${answer.d} = ${ieyo(P)}.`, `그래서 타일은 ${P}장이에요.`],
      alt: [`${y}${jo(y, '을', '를')} ${wa(yt)} ${ro(yu)} 나눠요. ${x} × ${yt} = ${x * yt}, ${x} × ${yu} = ${x * yu}, 합치면 ${ieyo(P)}.`, `두 풀이 모두 ${P}장이에요.`],
    },
  };
}

const T13_4 = {
  id: 'T13-4',
  node: 'N13',
  title: '넓이 모형으로 네 부분',
  repr: '그림',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const [x, y] = draw(
      rng,
      () => [rng.int(12, 39), rng.int(12, 29)],
      ([p, q]) => {
        if (p % 10 < 2 || q % 10 < 2 || p === q) return false;
        const xu = p % 10;
        const yu = q % 10;
        if (level === 1) return xu * yu < 10 && Math.floor(p / 10) * Math.floor(q / 10) < 10;
        if (level === 2) return xu * yu >= 10 && p < 30;
        return xu * yu >= 10 && p >= 30;
      },
      level === 1 ? [23, 13] : level === 2 ? [23, 14] : [36, 27],
    );
    return t134(x, y);
  },
};

// ── 급행 통과 진단 ──
const D1 = {
  id: 'N13-D1',
  node: 'N13',
  title: '급행 진단: 23 × 14',
  repr: '식',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...buildTwo(23, 14), hints: [], blank: null };
  },
};
const D2 = {
  id: 'N13-D2',
  node: 'N13',
  title: '급행 진단: 13역 세고 곱하기',
  repr: '문장',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...t132Level3(24), hints: [], blank: null };
  },
};
const D3 = {
  id: 'N13-D3',
  node: 'N13',
  title: '급행 진단(예비): 잘못 본 장부',
  repr: '문장',
  minLevel: 4,
  maxLevel: 4,
  diagnostic: true,
  generate() {
    return { ...t132Level4(4, 6, 9), hints: [], blank: null };
  },
};

export default [T13_1, T13_2, T13_3, T13_4, D1, D2, D3];
