// G13 서면 — 1분과 1초, 초 단위 시각 [4수03-13]. 천장 5.
// 기준: docs/curriculum/10-line2-pilot.md 3절. 피드백 꼬리표 kind: 'check' | 'nudge'(10 문서 2절).
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
const eun = (x) => `${x}${jo(x, '은', '는')}`;
const V = (x) => n(x, { virtual: true });

function draw(rng, make, ok, fallback) {
  for (let t = 0; t < 50; t++) {
    const p = make();
    if (ok(p)) return p;
  }
  return fallback;
}

// ── 시간·길이 말 ──
/** 초 → "2분 30초" / "2분" / "45초" (힌트·해설용 글자) */
function ms(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}초`;
  return s === 0 ? `${m}분` : `${m}분 ${s}초`;
}
/** 초 → "2분 0초"처럼 초 칸까지 늘 쓰는 글자(답 칸과 같은 꼴) */
const ms0 = (sec) => `${Math.floor(sec / 60)}분 ${sec % 60}초`;
/** 문장 조각: 분·초(초가 0이면 분만, 분이 0이면 초만). tag: V 또는 n */
function msText(sec, tag = V) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return [tag(s), '초'];
  if (s === 0) return [tag(m), '분'];
  return [tag(m), '분 ', tag(s), '초'];
}
/** 시각 글자 "7시 5분 30초" */
const hms = (h, m, s) => (s === undefined || s === null ? (m === 0 ? `${h}시` : `${h}시 ${m}분`) : `${h}시 ${m}분 ${s}초`);
/** 시각 "7:05" (보기·시간표용) */
const hm = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
/** 시각 문장 조각 */
const hmsText = (h, m, s, tag = V) => (s === undefined || s === null ? (m === 0 ? [tag(h), '시'] : [tag(h), '시 ', tag(m), '분']) : [tag(h), '시 ', tag(m), '분 ', tag(s), '초']);

// ── 채점 도우미 ──
const isBlank = (r) => r === undefined || r === null || (typeof r === 'string' && r.trim() === '');
const eqv = (a, b) => (typeof b === 'number' ? !isBlank(a) && Number(String(a).trim()) === b : String(a ?? '').trim() === String(b));
/** 판별 오답 목록에서 정답과 겹치거나 서로 겹치는 것을 뺀다(칸 묶음 값). */
function cleanDiscs(list, answer) {
  const seen = new Set();
  return list.filter((d) => {
    const keys = Object.keys(d.value);
    if (keys.every((k) => eqv(d.value[k], answer[k]))) return false;
    const id = JSON.stringify(d.value);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}
const out = (d) => ({ correct: false, category: d.category, kind: d.kind ?? 'check', feedbackCheck: d.feedbackCheck, feedback: d.feedback });
/**
 * 칸 여럿(compound) 채점. 판별 오답의 value는 칸 묶음({ m: 1, s: 75 })이고, 적힌 칸이 모두 같으면 그 오답이다.
 * 앞에 적은 판별 오답부터 본다(칸이 많은 것을 앞에).
 */
function cgrade(fields, answer, discs) {
  return (r) => {
    if (fields.every((f) => isBlank(r?.[f.key]))) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '답을 먼저 써 볼까요?' };
    if (fields.every((f) => eqv(r?.[f.key], answer[f.key]))) return { correct: true };
    const d = discs.find((x) => Object.keys(x.value).every((k) => eqv(r?.[k], x.value[k])));
    if (d) return out(d);
    const wrong = fields.filter((f) => !eqv(r?.[f.key], answer[f.key]));
    return { correct: false, category: null, kind: 'check', feedback: `${wrong.map((f) => f.label).join(', ')} 칸을 다시 볼까요?` };
  };
}
/** 여럿 고르기(글자 보기) 채점 */
function mgrade(answer, discs) {
  const key = (arr) => [...new Set((Array.isArray(arr) ? arr : []).map(String))].sort().join('|');
  const want = key(answer);
  return (r) => {
    if (!Array.isArray(r) || r.length === 0) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '답을 먼저 골라 볼까요?' };
    const got = key(r);
    if (got === want) return { correct: true };
    const d = discs.find((x) => key(x.value) === got);
    return d ? out(d) : { correct: false, category: null, kind: 'check', feedback: null };
  };
}
/** 숫자 v의 k번째 자리(0 = 일의 자리)를 빈칸으로 */
function blankAt(v, k = 1) {
  const s = String(v);
  const i = Math.max(0, s.length - 1 - k);
  return { blank: s.slice(0, i) + '☐' + s.slice(i + 1), blankAnswer: s[i] };
}
/** 분·초 칸 */
const MS_FIELDS = [
  { key: 'm', label: '분' },
  { key: 's', label: '초' },
];
const HMS_FIELDS = [
  { key: 'h', label: '시' },
  { key: 'm', label: '분' },
  { key: 's', label: '초' },
];
const HM_FIELDS = [
  { key: 'h', label: '시' },
  { key: 'm', label: '분' },
];
const msAns = (sec) => ({ m: Math.floor(sec / 60), s: sec % 60 });
/** 진단 문항: 힌트 없이 직접 입력만 */
const asDiag = (p) => ({ ...p, hints: [], blank: null });
/** 시간 글자 뒤 "예요/이에요"(…분으로 끝나면 이에요) */
const ye = (str) => `${str}${str.endsWith('분') ? '이에요' : '예요'}`;
const rase = (str) => `${str}${str.endsWith('분') ? '이라서' : '라서'}`;

// ── T13-1 승강장 시계 읽기 (그림) — 1~3단계 ──
// 그림: { kind: 'clock', h, m, s } 바늘 시계(시침·분침·초침). 단계 불변식: 1 초침이 숫자 위 / 2 숫자 사이 눈금 / 3 시계 → 디지털 시각 고르기.
function t131Level1(h, m, k) {
  const s = 5 * k;
  const answer = { h, m, s };
  const discs = cleanDiscs([{ value: { h, m, s: k }, category: '개념', kind: 'check', feedback: `초침이 ${k}${jo(k, '을', '를')} 가리키면 몇 초일까요?` }], answer);
  return {
    text: ['서면역 승강장 시계예요. 몇 시 몇 분 몇 초예요?'],
    figure: { kind: 'clock', h, m, s },
    input: { kind: 'compound', fields: HMS_FIELDS },
    answer,
    discriminators: discs,
    grade: cgrade(HMS_FIELDS, answer, discs),
    hints: ['서면역 시계의 시, 분, 초를 물어요. 짧은바늘, 긴바늘, 초침이 있어요.', `초침이 숫자 1을 가리키면 5초예요. 숫자 ${k}${eun(k).slice(String(k).length)} 몇 초일까요?`, '초침이 숫자 하나를 지날 때마다 5초씩 늘어요.', `${h}시 ${m}분 ☐초`],
    blank: s >= 10 ? blankAt(s, 1).blank : '☐',
    blankAnswer: s >= 10 ? blankAt(s, 1).blankAnswer : String(s),
    explain: {
      why: ['초침은 1분에 한 바퀴를 돌아요.', `숫자와 숫자 사이가 5초라서, 숫자 ${k}${jo(k, '을', '를')} 가리키면 5 × ${k} = ${s}초예요.`, `그래서 ${hms(h, m, s)}예요.`],
      alt: [`작은 눈금을 12부터 하나씩 세면 ${s}칸이라 ${s}초예요.`, `두 방법 모두 ${s}초예요.`],
    },
  };
}
function t131Level2(h, m, k, j) {
  const s = 5 * k + j;
  return {
    text: ['서면역 승강장 시계가 ', V(h), '시 ', V(m), '분 몇 초를 가리켜요. 몇 초예요?'],
    figure: { kind: 'clock', h, m, s },
    input: { kind: 'number', unit: '초' },
    answer: s,
    discriminators: [5 * k, 5 * (k + 1)].filter((v) => v !== s && v !== m && v !== h).map((v) => ({ value: v, category: '계산', kind: 'check', feedback: '작은 눈금을 하나씩 세어 볼까요?' })),
    hints: [`시계는 ${h}시 ${m}분이에요. 초침이 가리키는 초를 물어요.`, `초침 바로 앞의 숫자부터 볼까요? 숫자 ${k}${eun(k).slice(String(k).length)} ${5 * k}초예요.`, `숫자 ${k}에서 작은 눈금 ${j}칸을 더 갔어요.`, `${5 * k} + ${j} = ${blankAt(s, 0).blank}`],
    blank: blankAt(s, 0).blank,
    blankAnswer: blankAt(s, 0).blankAnswer,
    explain: {
      why: [`초침이 숫자 ${k}${jo(k, '을', '를')} 지나 작은 눈금 ${j}칸을 더 갔어요.`, `숫자 ${k}${eun(k).slice(String(k).length)} ${5 * k}초, 작은 눈금 한 칸은 1초예요.`, `그래서 ${5 * k} + ${j} = ${s}초예요.`],
      alt: [`숫자 ${k + 1}${eun(k + 1).slice(String(k + 1).length)} ${5 * (k + 1)}초예요. 거기서 ${5 - j}칸 모자라요.`, `두 방법 모두 ${s}초예요.`],
    },
  };
}
function t131Level3(rng, h, m, k, j) {
  const s = 5 * k + j;
  const right = `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const swap = `${h}:${String(s).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const rough = `${h}:${String(m).padStart(2, '0')}:${String(5 * k).padStart(2, '0')}`;
  return {
    text: ['서면역 승강장 시계예요. 같은 시각을 나타낸 디지털 시계를 골라요.'],
    figure: { kind: 'clock', h, m, s },
    input: { kind: 'choice', options: rng.shuffle([right, swap, rough]) },
    answer: right,
    discriminators: [
      { value: swap, category: '개념', kind: 'check', feedback: '긴바늘과 초침을 다시 볼까요?' },
      { value: rough, category: '계산', kind: 'check', feedback: '작은 눈금을 하나씩 세어 볼까요?' },
    ],
    hints: ['바늘 시계와 같은 시각을 나타낸 디지털 시계를 물어요. 디지털 시계는 시:분:초 차례예요.', '시, 분, 초를 하나씩 읽어서 적어 볼까요?', `짧은바늘은 ${h}시, 긴바늘은 ${m}분이에요.`, `초침은 ☐${String(s).padStart(2, '0').slice(1)}초`],
    blank: `☐${String(s).padStart(2, '0').slice(1)}`,
    blankAnswer: String(s).padStart(2, '0')[0],
    blankThen: '같은 시각의 디지털 시계는?',
    explain: {
      why: [`짧은바늘은 ${h}시, 긴바늘은 ${m}분을 가리켜요.`, `초침은 숫자 ${k}에서 ${j}칸 더 가서 ${s}초예요.`, `그래서 ${right} 시계예요.`],
      alt: [`보기마다 가운데 수(분)와 끝 수(초)를 바늘과 맞춰 봐요.`, `어느 길로 해도 ${right}예요.`],
    },
  };
}
const T13_1 = {
  id: 'T13-1',
  node: 'G13',
  title: '승강장 시계 읽기',
  repr: '그림',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const [h, m, k, j] = draw(
      rng,
      () => [rng.int(1, 11), rng.int(1, 58), rng.int(level === 1 ? 2 : 1, 10), rng.int(1, 4)],
      ([hh, mm, kk, jj]) => {
        const s = level === 1 ? 5 * kk : 5 * kk + jj;
        return s !== mm && s !== hh && mm !== hh && Math.abs(mm - s) >= 3;
      },
      level === 1 ? [7, 15, 4, 0] : [7, 15, 7, 2],
    );
    if (level === 1) return t131Level1(h, m, k);
    if (level === 2) return t131Level2(h, m, k, j);
    return t131Level3(rng, h, m, k, j);
  },
};

// ── T13-2 환승 시간 바꾸기 (문장) — 1~3단계 ──
// 단계 불변식: 1 분초 → 초(1분 대) / 2 초 → 분초 / 3 단위가 다른 두 시간 비교.
function t132Level1(x) {
  const ans = 60 + x;
  return {
    text: ['서면역에서 ', label('1'), '호선에서 ', label('2'), '호선으로 갈아타는 데 ', V(1), '분 ', V(x), '초가 걸렸어요. 몇 초예요?'],
    figure: null,
    input: { kind: 'number', unit: '초' },
    answer: ans,
    discriminators: [{ value: 100 + x, category: '개념', kind: 'check', feedback: '1분은 몇 초예요?' }],
    hints: [`갈아타는 데 1분 ${x}초가 걸렸어요. 이 시간을 초로만 나타내면 몇 초인지 물어요.`, '1분을 초로 바꿔 볼까요? 초침이 한 바퀴 도는 시간이에요.', '1분은 60초예요.', `60 + ${x} = ${blankAt(ans, 1).blank}`],
    blank: blankAt(ans, 1).blank,
    blankAnswer: blankAt(ans, 1).blankAnswer,
    explain: { why: ['1분은 60초예요.', `1분 ${x}초는 60초와 ${x}초를 합친 시간이에요.`, `그래서 60 + ${x} = ${ans}초예요.`], alt: [`60초에서 ${x}초를 이어 세어도 ${ans}초예요.`, `두 방법 모두 ${ans}초예요.`] },
  };
}
function t132Level2(T) {
  const answer = msAns(T);
  const wrong100 = { m: Math.floor(T / 100), s: T % 100 };
  return {
    text: ['서면역 환승 통로를 걷는 데 ', V(T), '초가 걸렸어요. 몇 분 몇 초예요?'],
    figure: null,
    input: { kind: 'compound', fields: MS_FIELDS },
    answer,
    discriminators: cleanDiscs([{ value: wrong100, category: '개념', kind: 'check', feedback: '1분은 몇 초였죠? 다시 볼까요?' }], answer),
    hints: [`환승 통로를 걷는 데 ${T}초가 걸렸어요. 몇 분 몇 초인지 물어요.`, '60초씩 묶어 볼까요? 60초가 1분이에요.', `60초씩 묶으면 ${answer.m}묶음이에요.`, `${T} − ${60 * answer.m} = ${answer.s >= 10 ? blankAt(answer.s, 1).blank : '☐'}`],
    blank: answer.s >= 10 ? blankAt(answer.s, 1).blank : '☐',
    blankAnswer: answer.s >= 10 ? blankAt(answer.s, 1).blankAnswer : String(answer.s),
    explain: { why: ['60초가 1분이에요.', `${T}초에는 60초가 ${answer.m}번 들어가고 ${answer.s}초가 남아요.`, `그래서 ${ms0(T)}예요.`], alt: [`${answer.m}분은 ${60 * answer.m}초예요. ${60 * answer.m}초에서 ${answer.s}초 더 가면 ${T}초예요.`, `두 방법 모두 ${ms0(T)}예요.`] },
  };
}
const LONGER = ['계단 길', '에스컬레이터 길'];
function t132Level3(A, B) {
  const esc = 60 + B;
  const longer = A > esc ? LONGER[0] : LONGER[1];
  const fields = [
    { key: 'esc', label: '에스컬레이터 길(초)' },
    { key: 'longer', label: '더 오래 걸리는 길', options: LONGER },
  ];
  const answer = { esc, longer };
  const wrongLonger = A > 100 + B ? LONGER[0] : LONGER[1];
  const discs = cleanDiscs(
    [
      { value: { esc: 100 + B, longer: wrongLonger }, category: '개념', kind: 'nudge', feedbackCheck: `1분 ${B}초가 ${100 + B}초인지 다시 볼까요?`, feedback: `1분 ${B}초를 초로 다시 바꿔 볼까요?` },
      { value: { esc: 100 + B }, category: '개념', kind: 'nudge', feedbackCheck: `1분 ${B}초가 ${100 + B}초인지 다시 볼까요?`, feedback: `1분 ${B}초를 초로 다시 바꿔 볼까요?` },
      { value: { esc, longer: longer === LONGER[0] ? LONGER[1] : LONGER[0] }, category: '개념', kind: 'check', feedback: '두 시간을 다시 견주어 볼까요?' },
    ],
    answer,
  );
  const bl = blankAt(esc, 1);
  return {
    text: ['서면역에서 갈아타는 길이 두 가지예요. 계단 길은 ', V(A), '초, 에스컬레이터 길은 ', V(1), '분 ', V(B), '초가 걸려요. 에스컬레이터 길은 몇 초예요? 더 오래 걸리는 길은 어느 쪽이에요?'],
    figure: null,
    input: { kind: 'compound', fields },
    answer,
    discriminators: discs,
    grade: cgrade(fields, answer, discs),
    hints: [`계단 길은 ${A}초, 에스컬레이터 길은 1분 ${B}초 걸려요. 더 오래 걸리는 길을 물어요.`, '두 시간을 같은 단위로 바꿔 볼까요?', '1분은 60초예요.', `1분 ${B}초 = ${bl.blank}초`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '더 오래 걸리는 길은?',
    explain: {
      why: [`1분 ${B}초는 60 + ${B} = ${esc}초예요.`, A > esc ? `${A}초가 ${esc}초보다 ${A - esc}초 길어요.` : `${esc}초가 ${A}초보다 ${esc - A}초 길어요.`, `그래서 ${longer}이 더 오래 걸려요.`],
      alt: [`${A}초를 분초로 바꾸면 ${ms(A)}예요.`, `${ms(A)}와 1분 ${B}초를 견주어도 ${longer}이 더 길어요.`, `두 풀이 모두 ${longer}이에요.`],
    },
  };
}
const T13_2 = {
  id: 'T13-2',
  node: 'G13',
  title: '환승 시간 바꾸기',
  repr: '문장',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 1) return t132Level1(draw(rng, () => rng.int(5, 55), (x) => x !== 40 && x !== 20, 20));
    if (level === 2) return t132Level2(draw(rng, () => rng.int(101, 179), (t) => t % 60 !== 0 && t % 100 < 60 && t % 100 !== t % 60, 150));
    const [A, B] = draw(
      rng,
      () => [rng.int(65, 115), rng.pick([10, 15, 20, 25, 30, 35, 40, 45])],
      ([a, b]) => {
        const d = Math.abs(a - (60 + b));
        return d >= 5 && d <= 30 && a !== 60 + b && a !== 100 + b;
      },
      [95, 30],
    );
    return t132Level3(A, B);
  },
};

// ── T13-3 같은 시간 이어 쓰기 (빈칸) — 1~3단계 + 도전 4~5단계 ──
// 틀: "[  ]분 [  ]초 = [  ]초". 단계 불변식: 1 몇 분 → 초 / 2 몇 분 몇 초 → 초 / 3 초 → 몇 분 몇 초 / 4 초침 바퀴 수 → 초 / 5 범위에 드는 시간 모두.
function t133Level1(a) {
  const ans = 60 * a;
  return {
    text: [n(a), '분 = □초'],
    figure: null,
    input: { kind: 'number', unit: '초' },
    answer: ans,
    discriminators: [{ value: 100 * a, category: '개념', kind: 'check', feedback: '1분은 몇 초예요?' }],
    hints: [`${a}분을 초로만 나타내면 몇 초인지 물어요.`, '1분이 몇 초인지 먼저 떠올려 볼까요?', '1분은 60초예요.', `60 × ${a} = ${blankAt(ans, 1).blank}`],
    blank: blankAt(ans, 1).blank,
    blankAnswer: blankAt(ans, 1).blankAnswer,
    explain: { why: ['1분은 60초예요.', `${a}분은 60초가 ${a}번이에요.`, `그래서 ${a}분 = ${ans}초예요.`], alt: [`60초씩 ${a}번 이어 세어도 ${ans}초예요.`, `두 방법 모두 ${ans}초예요.`] },
  };
}
function t133Level2(a, b) {
  const ans = 60 * a + b;
  return {
    text: [n(a), '분 ', n(b), '초 = □초'],
    figure: null,
    input: { kind: 'number', unit: '초' },
    answer: ans,
    discriminators: [{ value: 100 * a + b, category: '개념', kind: 'check', feedback: `${a}분은 ${a}00초일까요?` }],
    hints: [`${a}분 ${b}초를 초로만 나타내면 몇 초인지 물어요.`, `${a}분을 먼저 초로 바꿔 볼까요?`, `${a}분은 ${60 * a}초예요.`, `${60 * a} + ${b} = ${blankAt(ans, 1).blank}`],
    blank: blankAt(ans, 1).blank,
    blankAnswer: blankAt(ans, 1).blankAnswer,
    explain: { why: [`${a}분은 60 × ${a} = ${60 * a}초예요.`, `여기에 ${b}초를 더해요.`, `그래서 ${a}분 ${b}초 = ${ans}초예요.`], alt: [`1분씩 60초, ${a}번이면 ${60 * a}초, 이어서 ${b}초를 세면 ${ans}초예요.`, `두 방법 모두 ${ans}초예요.`] },
  };
}
function t133Level3(T) {
  const answer = msAns(T);
  const fields = MS_FIELDS;
  const discs = cleanDiscs(
    [
      { value: { m: Math.floor(T / 100), s: T % 100 }, category: '개념', kind: 'check', feedback: '1분은 몇 초였죠? 다시 볼까요?' },
      { value: { m: answer.m - 1, s: answer.s + 60 }, category: '계산', kind: 'check', feedback: '초 칸이 60보다 커도 될까요?' },
    ].filter((d) => d.value.m >= 0 && d.value.s < 100),
    answer,
  );
  return {
    text: [unknown('□'), '분 ', unknown('□'), '초 = ', n(T), '초'],
    figure: null,
    input: { kind: 'compound', fields },
    answer,
    discriminators: discs,
    grade: cgrade(fields, answer, discs),
    hints: [`${T}초를 몇 분 몇 초로 나타내는 문제예요.`, '60초씩 묶으면 몇 분이 될까요?', `60초가 ${answer.m}번이면 ${60 * answer.m}초예요.`, `${T} − ${60 * answer.m} = ${answer.s >= 10 ? blankAt(answer.s, 1).blank : '☐'}초`],
    blank: answer.s >= 10 ? blankAt(answer.s, 1).blank : '☐',
    blankAnswer: answer.s >= 10 ? blankAt(answer.s, 1).blankAnswer : String(answer.s),
    explain: { why: [`${T}초 안에 60초가 ${answer.m}번 들어가요.`, `${60 * answer.m}초를 빼면 ${answer.s}초가 남아요.`, `그래서 ${ms0(T)}예요.`], alt: [`${answer.m}분 ${answer.s}초를 다시 초로 바꾸면 ${60 * answer.m} + ${answer.s} = ${T}초예요.`, `두 방법 모두 ${ms0(T)}예요.`] },
  };
}
const TURNS = [
  ['한 바퀴 반', 90],
  ['두 바퀴 반', 150],
  ['세 바퀴 반', 210],
];
function t133Level4(word, ans) {
  const whole = Math.floor(ans / 60);
  return {
    text: [`초침이 ${word} 돌았어요. 몇 초가 지났어요?`],
    figure: null,
    challenge: true,
    input: { kind: 'number', unit: '초' },
    answer: ans,
    discriminators: [{ value: whole * 100 + 50, category: '개념', kind: 'check', feedback: '초침 한 바퀴는 몇 초예요?' }, { value: whole * 60 + 50, category: '개념', kind: 'check', feedback: '반 바퀴는 몇 초일까요?' }].filter((d) => d.value !== ans),
    hints: [`초침이 ${word} 돈 시간을 초로 물어요.`, '한 바퀴와 반 바퀴가 각각 몇 초인지 볼까요?', '초침 한 바퀴는 60초, 반 바퀴는 30초예요.', `${60 * whole} + 30 = ${blankAt(ans, 1).blank}`],
    blank: blankAt(ans, 1).blank,
    blankAnswer: blankAt(ans, 1).blankAnswer,
    explain: { why: ['초침이 한 바퀴 돌면 60초예요.', `${whole}바퀴는 ${60 * whole}초, 반 바퀴는 30초예요.`, `그래서 ${60 * whole} + 30 = ${ans}초예요.`], alt: [`반 바퀴가 ${2 * whole + 1}번이라고 보면 30 × ${2 * whole + 1} = ${ans}초예요.`, `두 방법 모두 ${ans}초예요.`] },
  };
}
function t133Level5(L, U) {
  const all = [];
  for (let t = L - 10; t <= U + 10; t += 10) all.push(t);
  const options = all.map(ms0);
  const answer = all.filter((t) => t > L && t < U).map(ms0);
  const discs = [
    { value: [ms0(L), ...answer], category: '개념', kind: 'check', feedback: `${L}초보다 길어야 해요. 같아도 될까요?` },
    { value: [...answer, ms0(U)], category: '개념', kind: 'check', feedback: `${U}초보다 짧아야 해요. 같아도 될까요?` },
  ];
  return {
    text: [unknown('□분 □0초'), '를 초로 바꾸면 ', n(L), '초보다 길고 ', n(U), '초보다 짧아요. 될 수 있는 시간을 모두 골라요.'],
    figure: null,
    challenge: true,
    input: { kind: 'multi', options },
    answer,
    discriminators: discs,
    grade: mgrade(answer, discs),
    hints: [`□분 □0초를 초로 바꾼 값이 ${L}초보다 길고 ${U}초보다 짧은 경우를 모두 찾아요.`, '보기마다 초로 바꿔 볼까요?', `${ms0(L + 10)}는 ${L + 10}초예요.`, `${ms0(U - 10)} = ${blankAt(U - 10, 1).blank}초`],
    blank: blankAt(U - 10, 1).blank,
    blankAnswer: blankAt(U - 10, 1).blankAnswer,
    explain: { why: [`보기를 초로 바꾸면 ${all.join('초, ')}초예요.`, `${L}초보다 길고 ${U}초보다 짧은 것은 ${all.filter((t) => t > L && t < U).join('초, ')}초예요.`, `그래서 ${answer.join(', ')}예요.`], alt: [`${L}초는 ${ms0(L)}, ${U}초는 ${ms0(U)}예요. 그 사이의 시간을 고르면 돼요.`, `두 풀이 모두 ${answer.join(', ')}예요.`] },
  };
}
const T13_3 = {
  id: 'T13-3',
  node: 'G13',
  title: '같은 시간 이어 쓰기',
  repr: '빈칸',
  minLevel: 1,
  maxLevel: 5,
  generate(rng, level) {
    if (level === 1) return t133Level1(rng.int(2, 5));
    if (level === 2) {
      const [a, b] = draw(rng, () => [rng.int(2, 4), rng.pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 50])], ([x, y]) => 60 * x + y !== y, [3, 10]);
      return t133Level2(a, b);
    }
    if (level === 3) return t133Level3(draw(rng, () => rng.int(121, 299), (t) => t % 60 >= 5 && t % 100 < 60 && Math.floor(t / 100) !== Math.floor(t / 60), 205));
    if (level === 4) {
      const [w, a] = rng.pick(TURNS);
      return t133Level4(w, a);
    }
    const [L, U] = draw(rng, () => { const l = rng.pick([70, 80, 90, 100, 110]); return [l, l + rng.pick([30, 40])]; }, () => true, [100, 130]);
    return t133Level5(L, U);
  },
};

// ── 급행 통과 진단 ──
const D1 = {
  id: 'G13-D1',
  node: 'G13',
  title: '급행 진단: 1분 30초는 몇 초',
  repr: '빈칸',
  minLevel: 2,
  maxLevel: 2,
  diagnostic: true,
  generate() {
    const p = t133Level2(1, 30);
    return asDiag({ ...p, discriminators: [{ value: 130, category: '개념', kind: 'check', feedback: '1분은 몇 초예요?' }] });
  },
};
const D2 = { id: 'G13-D2', node: 'G13', title: '급행 진단: 초침 눈금 읽기', repr: '그림', minLevel: 2, maxLevel: 2, diagnostic: true, generate: () => asDiag(t131Level2(7, 15, 7, 2)) };
const D3 = { id: 'G13-D3', node: 'G13', title: '급행 진단(예비): 초를 분과 초로', repr: '빈칸', minLevel: 3, maxLevel: 3, diagnostic: true, generate: () => asDiag(t133Level3(205)) };

export default [T13_1, T13_2, T13_3, D1, D2, D3];
