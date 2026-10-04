// G17 개금 — 길이 단위의 관계와 여러 표현 [4수03-16]. 천장 6.
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

// 이웃한 단위끼리만(cm ↔ mm, km ↔ m). 5자리 m(14000m 등)를 쓰는 문항은 requires: ['N20'](N20이 개통된 아이에게만).
const SRC_MT = 'FACTS: 황령산 서면에서 거의 정동쪽 약 2km, 금정산 서면에서 거의 정북쪽 약 14km(좌표 계산·OSM, 2026-10-04 확인)';
const KM_FIELDS = [
  { key: 'km', label: 'km' },
  { key: 'm', label: 'm' },
];

// ── T17-1 단위 바꾸기 (식) — 1~3단계 ──
// 단계 불변식: 1 cm·mm → mm / 2 km·m → m / 3 m → km·m.
// scene = 식 앞 교통 장면 조각(없으면 식만)
function t171Level1(a, b, scene = null) {
  const ans = 10 * a + b;
  return {
    text: [...(scene ?? []), n(a), 'cm ', n(b), 'mm = □mm'],
    figure: null,
    input: { kind: 'number', unit: 'mm' },
    answer: ans,
    discriminators: [a + b, 100 * a + b].filter((v) => v !== ans).map((v) => ({ value: v, category: '개념', kind: 'check', feedback: '1cm는 몇 mm예요?' })),
    hints: [`${a}cm ${b}mm를 mm로만 나타내요.`, `${a}cm가 몇 mm인지 먼저 바꿔 볼까요?`, `1cm = 10mm라서 ${a}cm = ${10 * a}mm예요.`, `${10 * a} + ${b} = ${blankAt(ans, 1).blank}`],
    blank: blankAt(ans, 1).blank,
    blankAnswer: blankAt(ans, 1).blankAnswer,
    explain: { why: ['1cm는 10mm예요.', `${a}cm는 ${10 * a}mm이고, ${b}mm를 더해요.`, `그래서 ${a}cm ${b}mm = ${ans}mm예요.`], alt: [`자의 작은 눈금을 0부터 세면 ${ans}칸이에요.`, `두 방법 모두 ${ans}mm예요.`] },
  };
}
function t171Level2(a, b, scene = null) {
  const ans = 1000 * a + b;
  const discs = [100 * a + b / 10, 1000 * a + b / 100].filter((v) => v !== ans && Number.isInteger(v)).map((v) => ({ value: v, category: '개념', kind: 'nudge', feedbackCheck: '답의 자릿수를 다시 볼까요?', feedback: `1km는 1000m예요. ${a}km는요?` }));
  return {
    text: [...(scene ?? []), n(a), 'km ', n(b), 'm = □m'],
    figure: null,
    input: { kind: 'number', unit: 'm' },
    answer: ans,
    discriminators: discs,
    hints: [`${a}km ${b}m를 m로만 나타내요.`, `${a}km가 몇 m인지 먼저 바꿔 볼까요?`, `1km = 1000m라서 ${a}km = ${1000 * a}m예요.`, `${1000 * a} + ${b} = ${blankAt(ans, 2).blank}`],
    blank: blankAt(ans, 2).blank,
    blankAnswer: blankAt(ans, 2).blankAnswer,
    explain: { why: ['1km는 1000m예요.', `${a}km는 ${1000 * a}m이고, ${b}m를 더해요.`, `그래서 ${a}km ${b}m = ${ans}m예요.`], alt: [`${ans}m에서 천의 자리 ${a}${jo(a, "은", "는")} ${a}km, 나머지 ${b}${jo(b, "은", "는")} ${b}m예요.`, `두 방법 모두 ${ans}m예요.`] },
  };
}
function t171Level3(T, scene = null) {
  const answer = { km: Math.floor(T / 1000), m: T % 1000 };
  const discs = cleanDiscs([{ value: { km: Math.floor(T / 100), m: T % 100 }, category: '개념', kind: 'check', feedback: '1km는 몇 m예요?' }], answer);
  return {
    text: [...(scene ?? []), n(T), 'm = ', unknown('□'), 'km ', unknown('□'), 'm'],
    figure: null,
    input: { kind: 'compound', fields: KM_FIELDS },
    answer,
    discriminators: discs,
    grade: cgrade(KM_FIELDS, answer, discs),
    hints: [`${T}m를 몇 km 몇 m로 나타내요.`, '1000m씩 묶으면 몇 km가 될까요?', `${T}m 안에 1000m가 ${answer.km}번 들어가요.`, `${T} − ${1000 * answer.km} = ${blankAt(answer.m, 2).blank}`],
    blank: blankAt(answer.m, 2).blank,
    blankAnswer: blankAt(answer.m, 2).blankAnswer,
    explain: { why: ['1000m가 1km예요.', `${T}m는 1000m가 ${answer.km}번이고 ${answer.m}m가 남아요.`, `그래서 ${answer.km}km ${answer.m}m예요.`], alt: [`${T}에서 천의 자리 숫자 ${answer.km}${jo(answer.km, '이', '가')} km, 나머지 ${answer.m}${jo(answer.m, '이', '가')} m예요.`, `두 방법 모두 ${answer.km}km ${answer.m}m예요.`] },
  };
}
const T17_1 = {
  id: 'T17-1',
  node: 'G17',
  title: '단위 바꾸기',
  repr: '식',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 1) {
      const [a, b] = [rng.int(2, 9), rng.int(1, 9)];
      return t171Level1(a, b, ['공책에 노선도를 그렸어요. 개금역에서 다음 역까지 그은 선이 ', V(a), 'cm ', V(b), 'mm예요. 몇 mm일까요? ']);
    }
    if (level === 2) {
      const [a, b] = [rng.int(1, 9), rng.int(1, 9) * 100];
      return t171Level2(a, b, ['개금역 앞에서 버스를 타고 ', V(a), 'km ', V(b), 'm를 갔어요. 몇 m일까요? ']);
    }
    const T = draw(rng, () => rng.int(1101, 8999), (t) => t % 1000 >= 110 && t % 10 !== 0 && t % 100 >= 10, 1450);
    return t171Level3(T, ['어느 날 개금역 앞에서 버스를 타고 ', V(T), 'm를 갔어요. 몇 km 몇 m일까요? ']);
  },
};

// ── T17-2 개금역 근처 길 (문장) — 1~4단계 + 도전 5~6단계 ──
// 단계 불변식: 1 실제 km → m(네 자리) / 2 실제 km → m(다섯 자리, N20) / 3 km·m와 m 비교와 차 / 4 m → km·m(백의 자리 0) / 5 □ 범위 모두 / 6 오류 찾기.
function t172Level1() {
  return {
    text: ['서면에서 황령산까지 약 ', n(2, { real: true, source: SRC_MT }), 'km예요. 약 몇 m예요?'],
    figure: null,
    input: { kind: 'number', unit: 'm' },
    answer: 2000,
    discriminators: [200, 20].map((v) => ({ value: v, category: '개념', kind: 'check', feedback: '1km는 몇 m예요?' })),
    hints: ['서면에서 황령산까지 약 2km예요. 이 거리를 m로 물어요.', '1km가 몇 m인지 먼저 떠올려 볼까요?', '1km는 1000m예요.', '2km = ☐000m'],
    blank: '☐000',
    blankAnswer: '2',
    explain: { why: ['1km는 1000m예요.', '2km는 1000m가 2번이라 2000m예요.', '그래서 약 2000m예요.'], alt: ['1000m를 두 번 이어 세어도 2000m예요.', '두 방법 모두 약 2000m예요.'] },
  };
}
function t172Level2() {
  return {
    text: ['서면에서 금정산까지 약 ', n(14, { real: true, source: SRC_MT }), 'km예요. 약 몇 m예요?'],
    figure: null,
    input: { kind: 'number', unit: 'm' },
    answer: 14000,
    requires: ['N20'],
    discriminators: [1400, 140, 1004].map((v) => ({ value: v, category: '개념', kind: 'check', feedback: '1km는 몇 m예요?' })),
    hints: ['서면에서 금정산까지 약 14km예요. 이 거리를 m로 물어요.', '1km가 몇 m인지 떠올려 볼까요? 14km는 1km가 14번이에요.', '10km는 10000m예요.', '14km = 1☐000m'],
    blank: '1☐000',
    blankAnswer: '4',
    explain: { why: ['1km는 1000m예요.', '14km는 1000m가 14번이라 14000m예요.', '그래서 약 14000m예요.'], alt: ['10km = 10000m, 4km = 4000m, 합치면 14000m예요.', '두 방법 모두 약 14000m예요.'] },
  };
}
const FAR = ['공원', '도서관'];
function t172Level3(x, Y) {
  const park = 1000 + 100 * x;
  const far = park > Y ? FAR[0] : FAR[1];
  const diff = Math.abs(park - Y);
  const fields = [
    { key: 'park', label: '공원까지(m)' },
    { key: 'far', label: '더 먼 곳', options: FAR },
    { key: 'diff', label: '몇 m 더 먼지' },
  ];
  const answer = { park, far, diff };
  const otherFar = far === FAR[0] ? FAR[1] : FAR[0];
  const discs = cleanDiscs(
    [
      { value: { park: 100 * x, far: FAR[1] }, category: '개념', kind: 'nudge', feedbackCheck: `1km ${100 * x}m와 ${Y}m, 단위가 같나요?`, feedback: `1km ${100 * x}m를 m로 바꿔 볼까요?` },
      { value: { park: 100 * x }, category: '개념', kind: 'nudge', feedbackCheck: `1km ${100 * x}m와 ${Y}m, 단위가 같나요?`, feedback: `1km ${100 * x}m를 m로 바꿔 볼까요?` },
      { value: { park, far: otherFar }, category: '개념', kind: 'check', feedback: '두 거리를 다시 견주어 볼까요?' },
    ],
    answer,
  );
  const bl = blankAt(park, 2);
  return {
    text: ['개금역에서 공원까지 ', V(1), 'km ', V(100 * x), 'm, 도서관까지 ', V(Y), 'm예요. 공원까지는 몇 m예요? 어느 쪽이 몇 m 더 멀어요?'],
    figure: null,
    input: { kind: 'compound', fields },
    answer,
    discriminators: discs,
    grade: cgrade(fields, answer, discs),
    hints: [`공원까지 1km ${100 * x}m, 도서관까지 ${Y}m예요. 어느 쪽이 몇 m 더 먼지 물어요.`, '두 거리를 같은 단위로 바꿔 볼까요?', '1km는 1000m예요.', `1km ${100 * x}m = ${bl.blank}m`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '어느 쪽이 몇 m 더 멀어요?',
    explain: {
      why: [`1km ${100 * x}m = 1000m + ${100 * x}m = ${park}m예요.`, park > Y ? `${park}m가 ${Y}m보다 ${diff}m 더 멀어요.` : `${Y}m가 ${park}m보다 ${diff}m 더 멀어요.`, `그래서 ${far}이 ${diff}m 더 멀어요.`],
      alt: [`${Y}m = 1km ${Y - 1000}m예요.`, `1km ${Y - 1000}m와 1km ${100 * x}m를 견주면 ${Math.max(Y - 1000, 100 * x)}m − ${Math.min(Y - 1000, 100 * x)}m = ${diff}m 차이예요.`, `두 풀이 모두 ${far}이 ${diff}m 더 멀어요.`],
    },
  };
}
function t172Level4(a, b) {
  const T = 1000 * a + b;
  const answer = { km: a, m: b };
  const discs = cleanDiscs(
    [
      { value: { km: a, m: b * 10 }, category: '개념', kind: 'check', feedback: `${T}에서 천의 자리 숫자는 몇이에요?` },
      { value: { km: Math.floor(T / 100), m: T % 100 }, category: '개념', kind: 'check', feedback: `${T}에서 천의 자리 숫자는 몇이에요?` },
    ],
    answer,
  );
  return {
    text: ['개금역에서 어떤 길의 길이를 m로 쓰면 ', V(T), 'm예요. 몇 km 몇 m예요?'],
    figure: null,
    input: { kind: 'compound', fields: KM_FIELDS },
    answer,
    discriminators: discs,
    grade: cgrade(KM_FIELDS, answer, discs),
    hints: [`길이가 ${T}m예요. 몇 km 몇 m인지 물어요.`, '1000m씩 묶으면 몇 km인지 볼까요? 자리마다 숫자를 써 봐요.', `${T}에서 천의 자리 숫자는 ${a}, 백의 자리 숫자는 0이에요.`, `${a}km ☐${String(b).padStart(2, '0').slice(1)}m`],
    blank: `☐${String(b).padStart(2, '0').slice(1)}`,
    blankAnswer: String(b).padStart(2, '0')[0],
    explain: { why: [`${T}m는 1000m가 ${a}번이고 ${b}m가 남아요.`, '백의 자리가 0이라서 남는 것은 두 자리 수예요.', `그래서 ${a}km ${b}m예요.`], alt: [`${a}km ${b}m를 다시 m로 바꾸면 ${1000 * a} + ${b} = ${T}m예요.`, `두 방법 모두 ${a}km ${b}m예요.`] },
  };
}
function t172Level5(a, d) {
  const options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const answer = options.filter((k) => k < d);
  const discs = [{ value: [...answer, d], category: '개념', kind: 'check', feedback: `${a}${d}50m는 ${a}km ${d}00m보다 짧나요?` }];
  return {
    text: [unknown(`${a}□50`), 'm가 ', n(a), 'km ', n(100 * d), 'm보다 짧아요. □에 들어갈 수 있는 수를 모두 골라요.'],
    figure: null,
    challenge: true,
    input: { kind: 'multi', options },
    answer,
    discriminators: discs,
    grade: mgrade(answer, discs),
    hints: [`${a}□50m가 ${a}km ${100 * d}m보다 짧게 되는 □를 모두 찾아요.`, '두 길이를 같은 단위로 바꿔 볼까요?', `${a}km ${100 * d}m = ${1000 * a + 100 * d}m예요.`, `${a}□50 < ${1000 * a + 100 * d}에서 □가 될 수 있는 가장 큰 수: ☐`],
    blank: '☐',
    blankAnswer: String(d - 1),
    explain: { why: [`${a}km ${100 * d}m = ${1000 * a + 100 * d}m예요.`, `□가 ${d}이면 ${a}${d}50m로 ${1000 * a + 100 * d}m보다 길어요.`, `그래서 □는 ${answer.join(', ')}예요.`.replace(/(\d)예요\.$/, (x, k) => `${k}${jo(Number(k), '이에요', '예요')}.`)], alt: [`백의 자리를 견주면 □는 ${d}보다 작아야 해요.`, `두 풀이 모두 ${answer.join(', ')}${jo(answer.at(-1), '이에요', '예요')}.`] },
  };
}
function t172Level6(a, b) {
  const ans = 1000 * a + b;
  const wrong = Number(`${a}${b}`);
  return {
    text: ['친구가 ', n(a), 'km ', n(b), 'm를 ', n(wrong), 'm라고 썼어요. 바른 길이는 몇 m예요?'],
    figure: null,
    challenge: true,
    input: { kind: 'number', unit: 'm' },
    answer: ans,
    discriminators: [
      { value: 1000 * a + 100 * b, category: '개념', kind: 'check', feedback: `${b}m는 ${b}00m일까요?` },
      { value: 100 * a + b, category: '개념', kind: 'check', feedback: '1km는 몇 m예요?' },
    ].filter((d) => d.value !== ans),
    hints: [`친구는 ${a}km ${b}m를 ${wrong}m라고 썼어요. 바른 길이를 m로 물어요.`, `${a}km를 먼저 m로 바꿔 볼까요?`, `${a}km = ${1000 * a}m예요.`, `${1000 * a} + ${b} = ${a}00☐`],
    blank: `${a}00☐`,
    blankAnswer: String(b),
    explain: { why: [`${a}km는 ${1000 * a}m예요.`, `${1000 * a}m에 ${b}m를 더하면 ${ans}m예요.`, `그래서 바른 길이는 ${ans}m예요.`], alt: [`${ans}m에서 천의 자리 ${a}${jo(a, "은", "는")} ${a}km, 일의 자리 ${b}${jo(b, "은", "는")} ${b}m예요. 가운데 두 자리는 0이에요.`, `두 방법 모두 ${ans}m예요.`] },
  };
}
const T17_2 = {
  id: 'T17-2',
  node: 'G17',
  title: '개금역 근처 길',
  repr: '문장',
  minLevel: 1,
  maxLevel: 6,
  generate(rng, level) {
    if (level === 1) return t172Level1();
    if (level === 2) return t172Level2();
    if (level === 3) {
      const [x, Y] = draw(rng, () => [rng.int(1, 8), 1000 + rng.int(11, 99) * 10], ([xx, yy]) => {
        const d = Math.abs(1000 + 100 * xx - yy);
        return d >= 50 && d <= 400 && yy % 100 !== 0;
      }, [2, 1350]);
      return t172Level3(x, Y);
    }
    if (level === 4) return t172Level4(rng.int(2, 8), rng.int(1, 9) * 10);
    if (level === 5) return t172Level5(rng.int(1, 5), rng.int(3, 8));
    return t172Level6(rng.int(2, 8), rng.int(1, 9));
  },
};

// ── T17-3 길 수직선 (그림) — 1~3단계 ──
// 그림: 기존 { kind: 'numberline', from: 0, to: 2000, ticks: 20, mark } (m, 100m 눈금). 3단계는 marks: [p, q](점 두 개, 덧붙임 정보)를 단다.
// 10 문서는 1·2단계가 "점 찍기"인데 화면에 수직선 입력이 없어서, 찍힌 점의 길이를 읽는 문제로 바꿨다.
// 단계 불변식: 1 점 → km·m / 2 점 → m(1km 넘음) / 3 두 점 사이 m(한 점은 km·m).
const LINE = (extra) => ({ kind: 'numberline', from: 0, to: 2000, ticks: 20, unit: 'm', ...extra });
function t173Level1(v) {
  const answer = { km: 1, m: v - 1000 };
  return {
    text: ['개금역 근처 길을 ', n(0), 'm부터 ', n(2000), 'm까지 수직선으로 나타냈어요. 작은 눈금 한 칸은 ', n(100), 'm예요. 점이 가리키는 길이는 몇 km 몇 m예요?'],
    figure: LINE({ mark: v }),
    input: { kind: 'compound', fields: KM_FIELDS },
    answer,
    discriminators: [],
    grade: cgrade(KM_FIELDS, answer, []),
    hints: ['수직선 위의 점이 가리키는 길이를 몇 km 몇 m로 물어요.', '1000m(1km) 눈금을 먼저 찾고, 거기서 몇 칸 더 갔는지 세어 볼까요?', `점은 1000m 눈금에서 작은 눈금 ${(v - 1000) / 100}칸 더 갔어요.`, `1km ☐00m`],
    blank: '☐00',
    blankAnswer: String((v - 1000) / 100),
    explain: { why: ['1000m는 1km예요.', `점은 1km에서 ${(v - 1000) / 100}칸, 곧 ${v - 1000}m 더 간 곳이에요.`, `그래서 1km ${v - 1000}m예요.`], alt: [`0부터 작은 눈금을 세면 ${v / 100}칸, ${v}m = 1km ${v - 1000}m예요.`, `두 방법 모두 1km ${v - 1000}m예요.`] },
  };
}
function t173Level2(v) {
  return {
    text: ['개금역 근처 길을 ', n(0), 'm부터 ', n(2000), 'm까지 수직선으로 나타냈어요. 작은 눈금 한 칸은 ', n(100), 'm예요. 점이 가리키는 길이는 몇 m예요?'],
    figure: LINE({ mark: v }),
    input: { kind: 'number', unit: 'm' },
    answer: v,
    discriminators: [{ value: v / 10, category: '개념', kind: 'check', feedback: '점은 1km 눈금을 지났나요?' }],
    hints: ['수직선 위의 점이 가리키는 길이를 m로 물어요.', '0부터 작은 눈금을 몇 칸 지났는지 세어 볼까요?', `점은 0에서 작은 눈금 ${v / 100}칸 간 곳이에요.`, `100 × ${v / 100} = ${blankAt(v, 2).blank}`],
    blank: blankAt(v, 2).blank,
    blankAnswer: blankAt(v, 2).blankAnswer,
    explain: { why: ['작은 눈금 한 칸은 100m예요.', `점까지 ${v / 100}칸이라 ${v}m예요.`, `그래서 ${v}m예요.`], alt: [`1000m 눈금에서 ${(v - 1000) / 100}칸 더 가서 1km ${v - 1000}m, 곧 ${v}m예요.`, `두 방법 모두 ${v}m예요.`] },
  };
}
function t173Level3(p, q) {
  const ans = q - p;
  const near = Math.abs(q - 1000 - p);
  return {
    text: ['개금역 근처 길 수직선에 점 두 개가 있어요. 한 점은 ', V(p), 'm, 다른 점은 ', V(1), 'km ', V(q - 1000), 'm에 있어요. 두 점 사이는 몇 m예요?'],
    figure: LINE({ marks: [p, q] }),
    input: { kind: 'number', unit: 'm' },
    answer: ans,
    discriminators: near > 0 && near !== ans ? [{ value: near, category: '개념', kind: 'check', feedback: `1km ${q - 1000}m는 몇 m예요?` }] : [],
    hints: [`한 점은 ${p}m, 다른 점은 1km ${q - 1000}m에 있어요. 두 점 사이의 길이를 물어요.`, '두 길이를 같은 단위로 바꿔 볼까요?', `1km ${q - 1000}m = ${q}m예요.`, `${q} − ${p} = ${blankAt(ans, 2).blank}`],
    blank: blankAt(ans, 2).blank,
    blankAnswer: blankAt(ans, 2).blankAnswer,
    explain: { why: [`1km ${q - 1000}m는 ${q}m예요.`, `${q}m − ${p}m = ${ans}m예요.`, `그래서 두 점 사이는 ${ans}m예요.`], alt: [`${p}m에서 1000m까지 ${1000 - p}m, 1000m에서 ${q}m까지 ${q - 1000}m예요. 합치면 ${ans}m예요.`, `두 풀이 모두 ${ans}m예요.`] },
  };
}
const T17_3 = {
  id: 'T17-3',
  node: 'G17',
  title: '길 수직선',
  repr: '그림',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 1) return t173Level1(1000 + rng.int(1, 9) * 100);
    if (level === 2) return t173Level2(1000 + rng.int(1, 9) * 100);
    const [p, q] = draw(rng, () => [rng.int(2, 9) * 100, 1000 + rng.int(1, 9) * 100], ([a, b]) => ![a, b - 1000, 1, 100, 1000].includes(b - a), [800, 1300]);
    return t173Level3(p, q);
  },
};

// ── 급행 통과 진단 ──
const D1 = { id: 'G17-D1', node: 'G17', title: '급행 진단: 2km 300m는 몇 m', repr: '식', minLevel: 2, maxLevel: 2, diagnostic: true, generate: () => asDiag(t171Level2(2, 300, ['개금역 앞에서 버스로 ', V(2), 'km ', V(300), 'm를 갔어요. '])) };
const D2 = { id: 'G17-D2', node: 'G17', title: '급행 진단: 공원과 도서관', repr: '문장', minLevel: 3, maxLevel: 3, diagnostic: true, generate: () => asDiag(t172Level3(2, 1350)) };
const D3 = { id: 'G17-D3', node: 'G17', title: '급행 진단(예비): m를 km와 m로', repr: '문장', minLevel: 4, maxLevel: 4, diagnostic: true, generate: () => asDiag(t172Level4(3, 50)) };

export default [T17_1, T17_2, T17_3, D1, D2, D3];
