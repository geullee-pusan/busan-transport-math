// G16 동의대 — 1mm·1km 측정과 어림 [4수03-15]. 천장 5(시범은 1~3).
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

const SRC_MT = 'FACTS: 황령산 서면에서 거의 정동쪽 약 2km, 금정산 서면에서 거의 정북쪽 약 14km(좌표 계산·OSM, 2026-10-04 확인)';
const SRC_L1 = 'FACTS: 1호선 다대포해수욕장–노포, 40역, 39.9km, 8량(부산교통공사, 2026-10-04 확인)';
const SRC_L2 = 'FACTS: 2호선 장산–양산, 43역, 45.2km, 6량(부산교통공사, 2026-10-04 확인)';
const KM2 = () => n(2, { real: true, source: SRC_MT });
const KM14 = () => n(14, { real: true, source: SRC_MT });
const CM_FIELDS = [
  { key: 'cm', label: 'cm' },
  { key: 'mm', label: 'mm' },
];
const UNITS = ['mm', 'cm', 'm', 'km'];

// ── T16-1 자로 재기 (그림) — 1~3단계 ──
// 그림: { kind: 'ruler', cm: 10, mm: true, mark: { from, to, label } } — 0~10cm 자, mm 눈금, 물건이 놓인 자리(from·to는 mm).
// 단계 불변식: 1 0에서 시작, cm·mm 읽기 / 2 0에서 시작, 모두 mm로도 / 3 0이 아닌 눈금에서 시작.
const ruler = (from, to) => ({ kind: 'ruler', cm: 10, mm: true, mark: { from, to, label: '승차권' } });
function t161Level1(a, b) {
  const answer = { cm: a, mm: b };
  return {
    text: ['자 위에 승차권을 놓았어요. 승차권의 한쪽 끝은 자의 눈금 ', n(0), '에 맞췄어요. 승차권의 길이는 몇 cm 몇 mm예요?'],
    figure: ruler(0, 10 * a + b),
    input: { kind: 'compound', fields: CM_FIELDS },
    answer,
    discriminators: [],
    grade: cgrade(CM_FIELDS, answer, []),
    hints: ['자 위에 놓은 승차권의 길이를 몇 cm 몇 mm로 물어요.', '큰 눈금(cm)을 먼저 읽고, 남은 작은 눈금(mm)을 세어 볼까요?', `큰 눈금은 ${a}cm까지예요.`, `${a}cm ☐mm`],
    blank: '☐',
    blankAnswer: String(b),
    explain: { why: [`승차권 끝은 ${a}cm 눈금을 지나 작은 눈금 ${b}칸을 더 갔어요.`, '작은 눈금 한 칸은 1mm예요.', `그래서 ${a}cm ${b}mm예요.`], alt: [`${a + 1}cm 눈금에서 작은 눈금 ${10 - b}칸 모자란 자리예요.`, `두 방법 모두 ${a}cm ${b}mm예요.`] },
  };
}
function t161Level2(a, b) {
  const fields = [...CM_FIELDS, { key: 'all', label: '모두 몇 mm' }];
  const answer = { cm: a, mm: b, all: 10 * a + b };
  const discs = cleanDiscs([{ value: { all: a + b }, category: '개념', kind: 'check', feedback: '작은 눈금은 모두 몇 칸이에요?' }], answer);
  return {
    text: ['자 위에 승차권을 놓았어요. 한쪽 끝은 눈금 ', n(0), '에 맞췄어요. 길이를 몇 cm 몇 mm로 쓰고, 같은 길이를 몇 mm로도 써요.'],
    figure: ruler(0, 10 * a + b),
    input: { kind: 'compound', fields },
    answer,
    discriminators: discs,
    grade: cgrade(fields, answer, discs),
    hints: ['승차권의 길이를 몇 cm 몇 mm로, 또 몇 mm로 물어요.', '0부터 작은 눈금을 모두 세어 볼까요? 큰 눈금 한 칸 안에 작은 눈금이 몇 칸 있는지 봐요.', `큰 눈금 한 칸 안에 작은 눈금이 10칸 있어요. 큰 눈금은 ${a}칸이에요.`, `작은 눈금 모두: ${blankAt(10 * a + b, 1).blank}칸`],
    blank: blankAt(10 * a + b, 1).blank,
    blankAnswer: blankAt(10 * a + b, 1).blankAnswer,
    explain: { why: [`승차권은 ${a}cm ${b}mm예요.`, `작은 눈금을 0부터 세면 큰 눈금 ${a}칸에 10칸씩, 그리고 ${b}칸이 더 있어서 모두 ${10 * a + b}칸이에요.`, `그래서 ${a}cm ${b}mm = ${10 * a + b}mm예요.`], alt: [`작은 눈금을 10칸씩 묶어 세면 ${a}묶음과 ${b}칸이에요.`, `두 방법 모두 ${10 * a + b}mm예요.`] },
  };
}
function t161Level3(s, e, f) {
  const answer = { cm: e - s, mm: f };
  const discs = cleanDiscs([{ value: { cm: e, mm: f }, category: '개념', kind: 'check', feedback: '물건이 0에서 시작했나요?' }], answer);
  return {
    text: ['자 위에 승차권을 놓았어요. 승차권의 한쪽 끝은 자의 ', n(s), 'cm 눈금에 있어요. 승차권의 길이는 몇 cm 몇 mm예요?'],
    figure: ruler(10 * s, 10 * e + f),
    input: { kind: 'compound', fields: CM_FIELDS },
    answer,
    discriminators: discs,
    grade: cgrade(CM_FIELDS, answer, discs),
    hints: [`승차권은 자의 ${s}cm 눈금에서 시작해요. 승차권의 길이를 물어요.`, `${s}cm 눈금부터 큰 눈금을 몇 칸 지나는지 세어 볼까요?`, `끝은 ${e}cm 눈금을 지나 작은 눈금 ${f}칸 더 간 곳이에요.`, `${s}cm부터 큰 눈금 ☐칸, 작은 눈금 ${f}칸`],
    blank: '☐',
    blankAnswer: String(e - s),
    explain: { why: [`승차권 끝은 ${e}cm ${f}mm 눈금이에요.`, `${s}cm에서 시작했으니 큰 눈금은 ${e} − ${s} = ${e - s}칸 지나요.`, `그래서 ${e - s}cm ${f}mm예요.`], alt: [`작은 눈금으로 세면 ${10 * e + f} − ${10 * s} = ${10 * (e - s) + f}칸, ${e - s}cm ${f}mm예요.`, `두 방법 모두 ${e - s}cm ${f}mm예요.`] },
  };
}
const T16_1 = {
  id: 'T16-1',
  node: 'G16',
  title: '자로 재기',
  repr: '그림',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 3) {
      const [s, e, f] = draw(rng, () => [rng.int(1, 3), rng.int(5, 9), rng.int(1, 9)], ([ss, ee]) => ee - ss >= 2 && ee - ss !== ss, [2, 7, 4]);
      return t161Level3(s, e, f);
    }
    const [a, b] = [rng.int(3, 8), rng.int(1, 9)];
    return level === 1 ? t161Level1(a, b) : t161Level2(a, b);
  },
};

// ── T16-2 서면에서 산까지 (문장, 실제 값) — 1~3단계 ──
// 실제 값(✅): "약 2km", "약 14km". "약"을 빼지 않는다. 단계 불변식: 1 더 먼·가까운 산 / 2 차 / 3 몇 배.
function t162Level1(far) {
  const ask = far ? '더 먼' : '더 가까운';
  const answer = far ? '금정산' : '황령산';
  return {
    text: ['서면에서 황령산까지는 약 ', KM2(), 'km, 금정산까지는 약 ', KM14(), 'km예요. 서면에서 ', ask, ' 산은 어디예요?'],
    figure: null,
    input: { kind: 'choice', options: ['황령산', '금정산'] },
    answer,
    discriminators: [{ value: far ? '황령산' : '금정산', category: '개념', kind: 'check', feedback: '약 2km와 약 14km 중 어느 쪽이 길어요?' }],
    hints: [`서면에서 황령산까지 약 2km, 금정산까지 약 14km예요. ${ask} 산을 물어요.`, '두 거리의 수를 견주어 볼까요? 단위가 같은지도 봐요.', '두 거리 모두 km예요.', `2와 14 중 큰 수는 1☐`],
    blank: '1☐',
    blankAnswer: '4',
    blankThen: `${ask} 산은?`,
    explain: { why: ['두 거리는 모두 km로 적혀 있어요.', '약 14km가 약 2km보다 길어요.', `그래서 ${ask} 산은 ${answer}이에요.`], alt: ['지도에서 서면과 두 산 사이를 이어 보아도 금정산 쪽 선이 훨씬 길어요.', `두 방법 모두 ${answer}이에요.`] },
  };
}
const t162Level2 = () => ({
  text: ['서면에서 황령산까지는 약 ', KM2(), 'km, 금정산까지는 약 ', KM14(), 'km예요. 금정산은 황령산보다 서면에서 약 몇 km 더 멀어요?'],
  figure: null,
  input: { kind: 'number', unit: 'km' },
  answer: 12,
  discriminators: [{ value: 16, category: '식', kind: 'check', feedback: '더 먼 정도를 물었어요. 다시 볼까요?' }],
  hints: ['황령산까지 약 2km, 금정산까지 약 14km예요. 금정산이 얼마나 더 먼지 물어요.', '두 거리의 차를 구해 볼까요?', '두 거리 모두 km라서 수끼리 견주면 돼요.', '14 − 2 = 1☐'],
  blank: '1☐',
  blankAnswer: '2',
  explain: { why: ['더 먼 정도는 두 거리의 차예요.', '14 − 2 = 12예요.', '그래서 금정산이 약 12km 더 멀어요.'], alt: ['2km에서 14km까지 이어 세면 12km예요.', '두 방법 모두 약 12km예요.'] },
});
const t162Level3 = () => ({
  text: ['서면에서 황령산까지는 약 ', KM2(), 'km, 금정산까지는 약 ', KM14(), 'km예요. 금정산까지의 거리는 황령산까지의 거리의 약 몇 배예요?'],
  figure: null,
  input: { kind: 'number', unit: '배' },
  answer: 7,
  discriminators: [
    { value: 12, category: '읽기', kind: 'check', feedback: '더 먼 정도가 아니라 몇 배를 물었어요' },
    { value: 16, category: '식', kind: 'check', feedback: '몇 배인지 물었어요. 다시 볼까요?' },
  ],
  hints: ['황령산까지 약 2km, 금정산까지 약 14km예요. 금정산까지의 거리가 황령산까지의 몇 배인지 물어요.', '2km를 몇 번 이으면 14km가 되는지 볼까요?', '2km를 2번 이으면 4km, 3번 이으면 6km예요.', '2 × ☐ = 14'],
  blank: '☐',
  blankAnswer: '7',
  explain: { why: ['몇 배는 작은 거리를 몇 번 이으면 큰 거리가 되는지예요.', '2 × 7 = 14예요.', '그래서 약 7배예요.'], alt: ['14 ÷ 2 = 7로 구해도 돼요.', '두 방법 모두 약 7배예요.'] },
});
const T16_2 = {
  id: 'T16-2',
  node: 'G16',
  title: '서면에서 산까지',
  repr: '문장',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 1) return t162Level1(rng.next() < 0.5);
    return level === 2 ? t162Level2() : t162Level3();
  },
};

// ── T16-3 알맞은 단위 (빈칸) — 1~3단계 ──
// 단계 불변식: 1 아주 짧은 것의 단위(mm) / 2 실제 노선 길이의 단위(km) / 3 물건 셋과 단위 잇기.
const THIN = [
  ['승차권의 두께', 'mm'],
  ['교통카드의 두께', 'mm'],
  ['동전의 두께', 'mm'],
];
function t163Level1(item) {
  return {
    text: [`${item}를 잴 때 알맞은 단위는 어느 것이에요?`],
    figure: null,
    input: { kind: 'choice', options: UNITS },
    answer: 'mm',
    discriminators: ['cm', 'm', 'km'].map((u) => ({ value: u, category: '개념', kind: 'check', feedback: `${item}는 손톱보다 두꺼울까요?` })),
    hints: [`${item}를 잴 때 쓰기 좋은 단위를 물어요.`, '자의 작은 눈금 한 칸과 큰 눈금 한 칸 중 어느 쪽에 가까운지 볼까요?', '자의 작은 눈금 한 칸은 1mm, 큰 눈금 한 칸은 1cm예요.', '두께가 작은 눈금 한두 칸쯤이에요. 작은 눈금 한 칸을 나타내는 단위를 골라요.'],
    blank: null,
    explain: { why: [`${item}는 아주 얇아서 자의 작은 눈금 한두 칸쯤이에요.`, '작은 눈금 한 칸이 1mm예요.', '그래서 mm가 알맞아요.'], alt: ['cm로 재면 1cm보다 훨씬 작아서 알맞지 않아요.', '그래서 답은 mm예요.'] },
  };
}
function t163Level2(line) {
  const real = line === 2 ? { len: 45.2, src: SRC_L2, st: 43 } : { len: 39.9, src: SRC_L1, st: 40 };
  return {
    text: [label(String(line), { source: real.src }), '호선 전체 길이는 ', n(real.len, { real: true, source: real.src }), ' □예요. □에 알맞은 단위는 어느 것이에요?'],
    figure: null,
    input: { kind: 'choice', options: UNITS },
    answer: 'km',
    discriminators: [
      { value: 'm', category: '개념', kind: 'check', feedback: `${line}호선은 ${real.st}역이 이어진 길이예요` },
      { value: 'cm', category: '개념', kind: 'check', feedback: `${line}호선은 ${real.st}역이 이어진 길이예요` },
      { value: 'mm', category: '개념', kind: 'check', feedback: `${line}호선은 ${real.st}역이 이어진 길이예요` },
    ],
    hints: [`${line}호선 전체 길이 ${real.len} 뒤에 알맞은 단위를 물어요.`, `${real.len}m라면 얼마나 긴 길일지 떠올려 볼까요?`, `${real.len}m는 교실 몇 개 길이밖에 안 돼요. ${line}호선은 ${real.st}역이 이어져 있어요.`, '역과 역 사이처럼 먼 거리를 나타내는 단위를 골라요.'],
    blank: null,
    explain: { why: [`${line}호선은 ${real.st}역을 잇는 아주 긴 노선이에요.`, '역과 역 사이처럼 먼 거리는 km로 재요.', `그래서 ${line}호선 전체 길이는 ${real.len}km예요.`], alt: [`${real.len}m라면 운동장 한 바퀴도 안 되는 길이라 맞지 않아요.`, '그래서 답은 km예요.'] },
  };
}
const MATCH = [
  { key: 'mt', label: '서면에서 황령산까지', unit: 'km' },
  { key: 'car', label: '열차 한 칸의 길이', unit: 'm' },
  { key: 'ticket', label: '승차권의 긴 쪽', unit: 'cm' },
];
function t163Level3(order) {
  const items = order.map((i) => MATCH[i]);
  const fields = items.map((it) => ({ key: it.key, label: it.label, options: UNITS }));
  const answer = Object.fromEntries(items.map((it) => [it.key, it.unit]));
  const discs = cleanDiscs(
    [
      { value: { mt: 'm' }, category: '개념', kind: 'check', feedback: '서면에서 황령산까지 걸어갈 수 있을까요?' },
      { value: { car: 'cm' }, category: '개념', kind: 'check', feedback: '열차 한 칸은 자로 잴 만큼 짧을까요?' },
      { value: { ticket: 'mm' }, category: '개념', kind: 'check', feedback: '승차권의 긴 쪽은 자의 큰 눈금 몇 칸쯤이에요?' },
    ],
    answer,
  );
  return {
    text: ['물건마다 길이를 잴 때 알맞은 단위를 골라요.'],
    figure: null,
    input: { kind: 'compound', fields },
    answer,
    discriminators: discs,
    grade: cgrade(fields, answer, discs),
    hints: ['서면에서 황령산까지, 열차 한 칸의 길이, 승차권의 긴 쪽에 알맞은 단위를 물어요.', '가장 긴 것부터 가장 짧은 것까지 차례로 놓아 볼까요?', '가장 긴 것은 서면에서 황령산까지예요.', '남은 둘도 긴 차례에 맞춰 큰 단위부터 골라요.'],
    blank: null,
    explain: { why: ['서면에서 황령산까지는 아주 멀어서 km로 재요.', '열차 한 칸은 몇 걸음쯤이라 m, 승차권은 손바닥만 해서 cm로 재요.', '그래서 km, m, cm예요.'], alt: ['긴 차례(황령산 > 열차 한 칸 > 승차권)와 큰 단위 차례(km > m > cm)를 짝지어도 돼요.', '두 방법 모두 km, m, cm예요.'] },
  };
}
const T16_3 = {
  id: 'T16-3',
  node: 'G16',
  title: '알맞은 단위',
  repr: '빈칸',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 1) return t163Level1(rng.pick(THIN)[0]);
    if (level === 2) return t163Level2(rng.pick([1, 2]));
    return t163Level3(rng.shuffle([0, 1, 2]));
  },
};

// ── 급행 통과 진단 ──
const D1 = { id: 'G16-D1', node: 'G16', title: '급행 진단: 0이 아닌 곳에서 재기', repr: '그림', minLevel: 3, maxLevel: 3, diagnostic: true, generate: () => asDiag(t161Level3(2, 7, 4)) };
const D2 = { id: 'G16-D2', node: 'G16', title: '급행 진단: 금정산은 황령산의 몇 배', repr: '문장', minLevel: 3, maxLevel: 3, diagnostic: true, generate: () => asDiag(t162Level3()) };
const D3 = { id: 'G16-D3', node: 'G16', title: '급행 진단(예비): 알맞은 단위 잇기', repr: '빈칸', minLevel: 3, maxLevel: 3, diagnostic: true, generate: () => asDiag(t163Level3([0, 1, 2])) };

export default [T16_1, T16_2, T16_3, D1, D2, D3];
