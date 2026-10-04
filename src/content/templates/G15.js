// G15 가야 — 시간표 읽기와 배차 [4수03-14 활용]. 천장 7(시범은 1~5).
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

// 시간표는 모두 "이 문제의 가야역 시간표"(07 0.4-13: "(가상)" 대신 문장으로 가정을 밝힌다). 1~6단계 시각은 "몇 시 몇 분"까지, 초는 기다리는 시간에서만(10 문서 G15).
const ORD = ['첫째', '둘째', '셋째', '넷째', '다섯째'];
/** 하루 분(분 단위 시각) → 문장 조각 / 글자 */
const tText = (t) => hmsText(Math.floor(t / 60), t % 60);
const tStr = (t) => hms(Math.floor(t / 60), t % 60);
const tHm = (t) => hm(Math.floor(t / 60), t % 60);
const timetable = (h, times, title = '이 문제의 가야역 서면 방향') => ({ kind: 'table', columns: [title, '출발 시각'], rows: times.map((m, i) => [ORD[i], m === null ? '□' : hm(h, m)]) });

// ── T15-1 시간표 읽기 (빈칸·표) — 1~3단계 ──
// 단계 불변식: 1 다음 열차 시각 / 2 다음 열차까지 기다리는 분초 / 3 같은 간격 시간표의 빈칸.
function t151Level1(h, times, i, a) {
  const answer = { h, m: times[i + 1] };
  const discs = cleanDiscs([{ value: { h, m: times[i] }, category: '읽기', kind: 'check', feedback: `${h}시 ${times[i]}분은 ${h}시 ${a}분보다 앞일까요, 뒤일까요?` }], answer);
  return {
    text: ['이 문제의 가야역 시간표예요. ', ...hmsText(h, a), '에 승강장에 왔어요. 다음 열차는 몇 시 몇 분이에요?'],
    figure: timetable(h, times),
    input: { kind: 'compound', fields: HM_FIELDS },
    answer,
    discriminators: discs,
    grade: cgrade(HM_FIELDS, answer, discs),
    hints: [`구하는 것: 다음 열차 시각 / 알고 있는 것: 승강장에 온 시각 ${h}시 ${a}분`, `시간표에서 ${h}시 ${a}분 바로 앞과 바로 뒤의 열차를 찾아볼까요?`, `바로 앞 열차는 ${h}시 ${times[i]}분이라 이미 떠났어요.`, `다음 열차: ${h}시 ${blankAt(times[i + 1], times[i + 1] >= 10 ? 1 : 0).blank}분`],
    blank: blankAt(times[i + 1], times[i + 1] >= 10 ? 1 : 0).blank,
    blankAnswer: blankAt(times[i + 1], times[i + 1] >= 10 ? 1 : 0).blankAnswer,
    explain: { why: [`${h}시 ${times[i]}분 열차는 ${h}시 ${a}분보다 앞이라 이미 떠났어요.`, `${h}시 ${a}분 뒤에 처음 오는 열차는 ${h}시 ${times[i + 1]}분이에요.`, `그래서 다음 열차는 ${h}시 ${times[i + 1]}분이에요.`], alt: ['시간표를 위에서부터 내려가며 온 시각보다 늦은 첫 칸을 찾아도 돼요.', `어느 길로 해도 답은 ${h}시 ${times[i + 1]}분이에요.`] },
  };
}
function t151Level2(h, times, i, a, s) {
  const next = times[i + 1];
  const wait = next * 60 - (a * 60 + s);
  const answer = msAns(wait);
  const discs = cleanDiscs(
    [
      { value: { m: next - a, s: 60 - s }, category: '계산', kind: 'check', feedback: '분 칸을 다시 볼까요?' },
      { value: { m: next - a - 1, s: 100 - s }, category: '계산', kind: 'check', feedback: '1분은 몇 초일까요?' },
    ],
    answer,
  );
  return {
    text: ['이 문제의 가야역 시간표예요. ', ...hmsText(h, a, s), '에 승강장에 왔어요. 다음 열차까지 몇 분 몇 초 기다려요?'],
    figure: timetable(h, times),
    input: { kind: 'compound', fields: MS_FIELDS },
    answer,
    discriminators: discs,
    grade: cgrade(MS_FIELDS, answer, discs),
    hints: [`구하는 것: 다음 열차까지 기다리는 시간 / 알고 있는 것: 승강장에 온 시각 ${hms(h, a, s)}`, `다음 열차는 ${h}시 ${next}분이에요. ${h}시 ${a + 1}분까지 몇 초 남았는지부터 볼까요?`, `${hms(h, a, s)}에서 ${h}시 ${a + 1}분까지는 ${60 - s}초예요.`, `${60 - s}초 + ${next - a - 1}분 = ☐분 ${answer.s}초`],
    blank: '☐',
    blankAnswer: String(answer.m),
    explain: { why: [`${hms(h, a, s)}에서 ${h}시 ${a + 1}분까지 ${60 - s}초예요.`, `${h}시 ${a + 1}분에서 ${h}시 ${next}분까지 ${next - a - 1}분이에요.`, `그래서 ${ms0(wait)} 기다려요.`], alt: [`1분을 받아내림해서 ${h}시 ${next}분 0초 − ${h}시 ${a}분 ${s}초를 계산하면 ${ms0(wait)}예요.`, `어느 길로 해도 답은 ${ms0(wait)}예요.`] },
  };
}
function t151Level3(h, m0, g) {
  const all = [0, 1, 2, 3, 4].map((i) => m0 + i * g);
  const shown = [all[0], all[1], null, all[3], null];
  const fields = [
    { key: 'm3', label: `셋째 열차(${h}시 몇 분)` },
    { key: 'm5', label: `다섯째 열차(${h}시 몇 분)` },
  ];
  const answer = { m3: all[2], m5: all[4] };
  const discs = cleanDiscs([{ value: { m3: all[1] + g - 2 }, category: '개념', kind: 'check', feedback: `${h}시 ${all[0]}분과 ${h}시 ${all[1]}분 사이는 몇 분이에요?` }], answer);
  return {
    text: ['이 문제의 가야역 시간표예요. 열차는 같은 간격으로 떠나요. 빈칸의 시각을 채워요.'],
    figure: timetable(h, shown),
    input: { kind: 'compound', fields },
    answer,
    discriminators: discs,
    grade: cgrade(fields, answer, discs),
    hints: [`구하는 것: 셋째와 다섯째 열차 시각 / 알고 있는 것: 열차가 같은 간격으로 떠나요`, '첫째와 둘째 열차 사이가 몇 분인지 볼까요?', `${h}시 ${all[0]}분과 ${h}시 ${all[1]}분 사이는 ${g}분이에요.`, `셋째 열차: ${h}시 ${blankAt(all[2], all[2] >= 10 ? 1 : 0).blank}분`],
    blank: blankAt(all[2], all[2] >= 10 ? 1 : 0).blank,
    blankAnswer: blankAt(all[2], all[2] >= 10 ? 1 : 0).blankAnswer,
    explain: { why: [`열차는 ${g}분마다 와요.`, `셋째는 ${all[1]} + ${g} = ${all[2]}분, 다섯째는 ${all[3]} + ${g} = ${all[4]}분이에요.`, `그래서 ${h}시 ${all[2]}분, ${h}시 ${all[4]}분이에요.`], alt: [`넷째 ${h}시 ${all[3]}분에서 ${g}분 앞이 셋째예요.`, `어느 길로 해도 답은 ${h}시 ${all[2]}분, ${h}시 ${all[4]}분이에요.`] },
  };
}
const T15_1 = {
  id: 'T15-1',
  node: 'G15',
  title: '시간표 읽기',
  repr: '빈칸',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const h = rng.int(6, 9);
    if (level === 3) {
      const [m0, g] = draw(rng, () => [rng.int(1, 9), rng.int(5, 8)], ([a, b]) => a + 4 * b <= 59, [2, 6]);
      return t151Level3(h, m0, g);
    }
    const [m0, g, i] = draw(rng, () => [rng.int(1, 9), rng.int(5, 8), rng.int(0, 2)], ([a, b]) => a + 3 * b <= 59, [2, 6, 1]);
    const times = [0, 1, 2, 3].map((k) => m0 + k * g);
    const a = draw(rng, () => rng.int(times[i] + 1, times[i + 1] - (level === 2 ? 2 : 1)), (x) => x !== h, times[i] + 2);
    if (level === 1) return t151Level1(h, times, i, a);
    return t151Level2(h, times, i, a, rng.int(5, 55));
  },
};

// ── T15-2 서면까지 가기 (문장) — 1~4단계 + 도전 5단계 ──
// 단계 불변식: 1 시각 + 분(시 안 바뀜) / 2 시각 + 분(시가 바뀜) / 3 늦지 않는 가장 늦은 열차 / 4 도착 시각 − 분(시가 바뀜) / 5 같은 간격 열차 수(첫차 포함).
function t152Level12(h, m, g) {
  const t = h * 60 + m + g;
  const answer = { h: Math.floor(t / 60), m: t % 60 };
  const cross = m + g >= 60;
  const discs = cross
    ? cleanDiscs(
        [
          { value: { h, m: m + g }, category: '개념', kind: 'check', feedback: `${m + g}분은 1시간보다 길까요?` },
          { value: { h, m: m + g - 60 }, category: '계산', kind: 'check', feedback: '시 칸을 다시 볼까요?' },
        ],
        answer,
      )
    : [];
  return {
    text: ['가야역에서 서면역까지 열차로 ', V(g), '분 걸린다고 해 봐요. ', ...hmsText(h, m), ' 열차를 타면 서면역에 몇 시 몇 분에 도착해요?'],
    figure: { kind: 'stations', line: '2', stations: ['가야', '부암', '서면'] },
    input: { kind: 'compound', fields: HM_FIELDS },
    answer,
    discriminators: discs,
    grade: cgrade(HM_FIELDS, answer, discs),
    hints: cross
      ? [`구하는 것: 서면역에 도착하는 시각 / 알고 있는 것: ${h}시 ${m}분에 탐, ${g}분 걸림`, `${h + 1}시 정각까지 몇 분 남았는지 먼저 볼까요?`, `${h}시 ${m}분에서 ${h + 1}시까지는 ${60 - m}분이에요.`, `${h + 1}시 ☐분`]
      : [`구하는 것: 서면역에 도착하는 시각 / 알고 있는 것: ${h}시 ${m}분에 탐, ${g}분 걸림`, '분에 걸리는 시간을 이어 세어 볼까요?', `${h}시 ${m}분에서 ${g}분 뒤예요.`, `${h}시 ${blankAt(m + g, m + g >= 10 ? 1 : 0).blank}분`],
    blank: cross ? '☐' : blankAt(m + g, m + g >= 10 ? 1 : 0).blank,
    blankAnswer: cross ? String(answer.m) : blankAt(m + g, m + g >= 10 ? 1 : 0).blankAnswer,
    explain: {
      why: cross
        ? [`${h}시 ${m}분에서 ${60 - m}분 가면 ${h + 1}시예요.`, `남은 ${g - (60 - m)}분을 더 가요.`, `그래서 ${tStr(t)}에 도착해요.`]
        : [`${h}시 ${m}분에서 ${g}분 뒤는 ${m} + ${g} = ${m + g}분이에요.`, '60분보다 작아서 시는 그대로예요.', `그래서 ${tStr(t)}에 도착해요.`],
      alt: cross ? [`${m} + ${g} = ${m + g}분은 1시간 ${m + g - 60}분이에요.`, `어느 길로 해도 답은 ${ye(tStr(t))}.`] : [`${tStr(t)}에서 ${g}분 앞은 ${h}시 ${m}분이에요.`, '확인해 보면 답이 맞아요.'],
    },
  };
}
function t152Level3(D, g, e, k) {
  const t2 = D - g - e;
  const trains = [t2 - k, t2, t2 + k];
  const opts = trains.map(tHm);
  return {
    // 열차 시각은 표가 보여 준다(02 문서 규칙 10).
    text: [...tText(D), '까지 서면역에 닿으면 돼요. 가야역에서 ', V(g), '분 걸린다고 해 봐요. 가장 늦게 탈 수 있는 열차는 어느 것이에요?'],
    figure: { kind: 'table', columns: ['이 문제의 가야역 서면 방향', '출발 시각'], rows: trains.map((t, i) => [ORD[i], tHm(t)]) },
    input: { kind: 'choice', options: opts },
    answer: opts[1],
    discriminators: [
      { value: opts[2], category: '계산', kind: 'check', feedback: `${tStr(trains[2])} 열차는 몇 시 몇 분에 도착해요?` },
      { value: opts[0], category: '개념', kind: 'check', feedback: '더 늦게 떠나는 열차도 탈 수 있을까요?' },
    ],
    hints: [`구하는 것: ${tStr(D)}까지 서면역에 닿는 열차 중 가장 늦은 열차 / 알고 있는 것: 열차 시각 ${trains.map(tStr).join(', ')}, 서면역까지 ${g}분`, '열차마다 서면역 도착 시각을 적어 볼까요?', `${tStr(trains[0])} 열차는 ${tStr(trains[0] + g)}에 도착해요.`, `${tStr(trains[1])} 열차는 ☐시 ${(trains[1] + g) % 60}분에 도착`],
    blank: '☐',
    blankAnswer: String(Math.floor((trains[1] + g) / 60)),
    blankThen: '늦지 않는 가장 늦은 열차는?',
    explain: {
      why: [`${trains.map((t) => `${tStr(t)} 열차는 ${tStr(t + g)}`).join(', ')}에 도착해요.`, `${tStr(D)}까지 도착하는 열차 중 가장 늦은 것은 ${tStr(trains[1])} 열차예요.`, `그래서 ${opts[1]} 열차예요.`],
      alt: [`${tStr(D)}에서 ${g}분을 거꾸로 빼면 ${ye(tStr(D - g))}.`, `${tStr(D - g)}${tStr(D - g).endsWith("분") ? "이나" : "나"} 그보다 앞에 출발하면 돼요.`, `어느 길로 해도 답은 ${opts[1]} 열차예요.`],
    },
  };
}
function t152Level4(H, m, g) {
  const t = H * 60 + m - g;
  const answer = { h: Math.floor(t / 60), m: t % 60 };
  const discs = cleanDiscs(
    [
      { value: { h: H, m: m - g }, category: '개념', kind: 'check', feedback: '분 칸이 0보다 작아도 될까요?' },
      { value: { h: H, m: t % 60 }, category: '개념', kind: 'check', feedback: '시 칸을 다시 볼까요?' },
    ],
    answer,
  );
  return {
    text: ['오늘 서면역에 ', ...hmsText(H, m), '에 도착했어요. 가야역에서 ', V(g), '분 걸렸어요. 가야역에서 몇 시 몇 분 열차를 탔어요?'],
    figure: null,
    input: { kind: 'compound', fields: HM_FIELDS },
    answer,
    discriminators: discs,
    grade: cgrade(HM_FIELDS, answer, discs),
    hints: [`구하는 것: 가야역에서 탄 열차 시각 / 알고 있는 것: 서면역 도착 ${H}시 ${m}분, 걸린 시간 ${g}분`, `${H}시 정각까지 거꾸로 가 본 다음, 남은 분만큼 더 거꾸로 가 볼까요?`, `${H}시 ${m}분에서 ${m}분 거꾸로 가면 ${H}시 정각이에요.`, `${H}시에서 ${g - m}분 앞: ${answer.h}시 ${blankAt(answer.m, 1).blank}분`],
    blank: blankAt(answer.m, 1).blank,
    blankAnswer: blankAt(answer.m, 1).blankAnswer,
    explain: { why: [`${H}시 ${m}분에서 ${m}분 거꾸로 가면 ${H}시예요.`, `${g - m}분 더 거꾸로 가면 ${ye(tStr(t))}.`, `그래서 ${tStr(t)} 열차를 탔어요.`], alt: [`${tStr(t)}에서 ${g}분 뒤는 ${H}시 ${m}분이에요.`, '확인해 보면 답이 맞아요.'] },
  };
}
function t152Level5(h, m0, g) {
  const count = (60 - m0) / g + 1;
  const list = Array.from({ length: count }, (_, i) => h * 60 + m0 + i * g);
  return {
    text: ['이 문제에서 가야역 첫차가 ', ...hmsText(h, m0), '에 떠나고, 그 뒤로 ', V(g), '분마다 열차가 떠나요. ', V(h + 1), '시 정각까지(그 시각에 떠나는 열차도 세어요) 열차는 모두 몇 대 떠나요?'],
    figure: null,
    challenge: true,
    input: { kind: 'number', unit: '대' },
    answer: count,
    discriminators: [{ value: count - 1, category: '개념', kind: 'nudge', feedbackCheck: '떠나는 시각을 다 적어 볼까요?', feedback: `${h}시 ${m0}분 열차도 세었나요?` }],
    hints: [`첫차는 ${h}시 ${m0}분, ${g}분마다 열차가 떠나요. ${h + 1}시 정각까지 떠나는 열차 수를 물어요.`, '떠나는 시각을 차례로 적어 볼까요?', `${list.slice(0, 3).map(tStr).join(', ')}, …`, `마지막 열차는 ${h + 1}시 정각이에요. 모두 ☐대`],
    blank: '☐',
    blankAnswer: String(count),
    explain: { why: [`떠나는 시각은 ${ye(list.map(tStr).join(', '))}.`, `첫차부터 ${h + 1}시 열차까지 세면 ${count}대예요.`, `그래서 ${count}대예요.`], alt: [`${h}시 ${m0}분부터 ${h + 1}시까지 ${60 - m0}분이에요. ${g}분 간격이 ${(60 - m0) / g}번이에요.`, `간격 수에 첫차 1대를 더해 ${count}대예요.`, `어느 길로 해도 답은 ${count}대예요.`] },
  };
}
const T15_2 = {
  id: 'T15-2',
  node: 'G15',
  title: '서면까지 가기',
  repr: '문장',
  minLevel: 1,
  maxLevel: 5,
  generate(rng, level) {
    if (level <= 2) {
      const [h, m, g] = draw(rng, () => [rng.int(6, 9), rng.int(level === 1 ? 2 : 52, level === 1 ? 50 : 58), rng.int(3, 6)], ([, mm, gg]) => (level === 1 ? mm + gg <= 59 : mm + gg > 60), level === 1 ? [7, 14, 4] : [7, 57, 4]);
      return t152Level12(h, m, g);
    }
    if (level === 3) {
      const H = rng.int(7, 9);
      const D = H * 60 + rng.pick([0, 0, 5, 10]);
      return t152Level3(D, rng.int(3, 6), rng.int(0, 2), rng.int(5, 7));
    }
    if (level === 4) {
      const [H, m, g] = draw(rng, () => [rng.int(7, 9), rng.int(1, 4), rng.int(3, 6)], ([, mm, gg]) => mm < gg, [8, 3, 4]);
      return t152Level4(H, m, g);
    }
    const [h, m0, g] = draw(
      rng,
      () => [rng.int(5, 8), rng.pick([0, 10, 20, 24, 30, 36, 40]), rng.pick([4, 5, 6, 8, 10])],
      ([hh, mm, gg]) => {
        if (mm === 0 || (60 - mm) % gg !== 0) return false;
        const c = (60 - mm) / gg + 1;
        return c >= 4 && c <= 8 && ![hh, mm, gg, hh + 1].includes(c);
      },
      [5, 30, 6],
    );
    return t152Level5(h, m0, g);
  },
};

// ── T15-3 노선 시간 그림 (그림) — 1~3단계 ──
// 그림: { kind: 'stations', stations: [...], times: [...] } — 기존 노선 그림에 구간마다 걸리는 시간 글자(times, 덧붙임 정보)를 단다.
// 단계 불변식: 1 분끼리 두 구간 / 2 분초 두 구간(받아올림) / 3 구간 셋 + 서면 정차 시간.
function t153Level1(a, b) {
  return {
    text: ['가야–부암은 ', V(a), '분, 부암–서면은 ', V(b), '분 걸린다고 해 봐요. 가야역에서 서면역까지 몇 분 걸려요?'],
    figure: { kind: 'stations', line: '2', stations: ['가야', '부암', '서면'], times: [`${a}분`, `${b}분`] },
    input: { kind: 'number', unit: '분' },
    answer: a + b,
    discriminators: [],
    hints: [`구하는 것: 가야역에서 서면역까지 걸리는 시간 / 알고 있는 것: 가야–부암 ${a}분, 부암–서면 ${b}분`, '역 사이 시간을 차례로 이어 볼까요?', `가야에서 부암까지 ${a}분이에요.`, `${a} + ${b} = ☐`],
    blank: '☐',
    blankAnswer: String(a + b),
    explain: { why: ['가야에서 서면까지 가려면 부암을 지나요.', `두 구간 시간을 이으면 ${a} + ${b} = ${a + b}분이에요.`, `그래서 ${a + b}분 걸려요.`], alt: [`서면에서 가야 쪽으로 거꾸로 이어도 ${b} + ${a} = ${a + b}분이에요.`, `어느 길로 해도 답은 ${a + b}분이에요.`] },
  };
}
function t153Level2(x, y) {
  const sum = x + y;
  const answer = msAns(sum);
  const raw = { m: Math.floor(x / 60) + Math.floor(y / 60), s: (x % 60) + (y % 60) };
  const discs = cleanDiscs([{ value: raw, category: '개념', kind: 'check', feedback: `${raw.s}초는 1분보다 길까요?` }], answer);
  return {
    text: ['가야–부암은 ', ...msText(x), ', 부암–서면은 ', ...msText(y), ' 걸린다고 해 봐요. 가야역에서 서면역까지 몇 분 몇 초 걸려요?'],
    figure: { kind: 'stations', line: '2', stations: ['가야', '부암', '서면'], times: [ms(x), ms(y)] },
    input: { kind: 'compound', fields: MS_FIELDS },
    answer,
    discriminators: discs,
    grade: cgrade(MS_FIELDS, answer, discs),
    hints: [`구하는 것: 가야역에서 서면역까지 걸리는 시간 / 알고 있는 것: 가야–부암 ${ms(x)}, 부암–서면 ${ms(y)}`, '초끼리 모은 다음 60초이거나 60초보다 길면 1분으로 바꿔 볼까요?', `초끼리 ${x % 60} + ${y % 60} = ${raw.s}초, 1분 ${raw.s - 60}초예요.`, `☐분 ${answer.s}초`],
    blank: '☐',
    blankAnswer: String(answer.m),
    explain: { why: [`초끼리 ${raw.s}초는 1분 ${raw.s - 60}초예요.`, `분끼리 ${raw.m}분에 1분을 더해 ${answer.m}분이에요.`, `그래서 ${ms0(sum)} 걸려요.`], alt: [`초로 바꾸면 ${x} + ${y} = ${sum}초, 60초씩 묶으면 ${ms0(sum)}예요.`, `어느 길로 해도 답은 ${ms0(sum)}예요.`] },
  };
}
function t153Level3(x, y, z, p) {
  const sum = x + y + z + p;
  const answer = msAns(sum);
  const noStop = x + y + z;
  const raw = { m: [x, y, z].reduce((acc, v) => acc + Math.floor(v / 60), 0), s: (x % 60) + (y % 60) + (z % 60) + p };
  const discs = cleanDiscs(
    [
      { value: msAns(noStop), category: '읽기', kind: 'nudge', feedbackCheck: '그림의 시간을 모두 썼나요?', feedback: '서면역에서 멈춘 시간은요?' },
      { value: raw, category: '개념', kind: 'check', feedback: '초 칸이 60보다 커도 될까요?' },
    ],
    answer,
  );
  return {
    // 구간 시간은 그림이 보여 준다(02 문서 규칙 10).
    text: ['이 문제의 노선 그림을 봐요. 열차는 서면역에서 ', V(p), '초 멈춘다고 해 봐요. 가야역에서 전포역까지 몇 분 몇 초 걸려요?'],
    figure: { kind: 'stations', line: '2', stations: ['가야', '부암', '서면', '전포'], times: [ms(x), ms(y), ms(z)], stop: { at: '서면', time: `${p}초` } },
    input: { kind: 'compound', fields: MS_FIELDS },
    answer,
    discriminators: discs,
    grade: cgrade(MS_FIELDS, answer, discs),
    hints: [`구하는 것: 가야역에서 전포역까지 걸리는 시간 / 알고 있는 것: 그림의 세 구간 시간, 서면역에서 ${p}초 멈춤`, '그림에 있는 시간을 모두 적은 다음, 분끼리 초끼리 모아 볼까요?', `분끼리 ${raw.m}분, 초끼리 ${raw.s}초예요.`, `${raw.m}분 ${raw.s}초 = ☐분 ${answer.s}초`],
    blank: '☐',
    blankAnswer: String(answer.m),
    explain: { why: [`세 구간과 서면역에서 멈춘 ${p}초를 모두 모아요.`, `분끼리 ${raw.m}분, 초끼리 ${raw.s}초예요.`, `${raw.s}초는 ${rase(ms(raw.s))} ${ms0(sum)}예요.`, `그래서 ${ms0(sum)} 걸려요.`], alt: [`초로 바꾸면 ${x} + ${y} + ${p} + ${z} = ${sum}초, 60초씩 묶으면 ${ms0(sum)}예요.`, `어느 길로 해도 답은 ${ms0(sum)}예요.`] },
  };
}
const T15_3 = {
  id: 'T15-3',
  node: 'G15',
  title: '노선 시간 그림',
  repr: '그림',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 1) return t153Level1(rng.int(2, 4), rng.int(2, 4));
    if (level === 2) {
      const [x, y] = draw(rng, () => [60 + rng.int(3, 5) * 10, rng.int(1, 2) * 60 + rng.int(2, 5) * 10], ([a, b]) => (a % 60) + (b % 60) > 60, [110, 140]);
      return t153Level2(x, y);
    }
    const [x, y, z, p] = draw(
      rng,
      () => [60 + rng.int(1, 5) * 10, 60 + rng.int(1, 5) * 10, 60 + rng.int(1, 5) * 10, rng.pick([20, 30, 40])],
      ([a, b, c, d]) => (a % 60) + (b % 60) + (c % 60) + d >= 60 && (a + b + c + d) % 60 !== 0,
      [80, 70, 80, 30],
    );
    return t153Level3(x, y, z, p);
  },
};

// ── 급행 통과 진단 ──
const D1 = { id: 'G15-D1', node: 'G15', title: '급행 진단: 시가 바뀌는 도착 시각', repr: '문장', minLevel: 2, maxLevel: 2, diagnostic: true, generate: () => asDiag(t152Level12(7, 57, 4)) };
const D2 = { id: 'G15-D2', node: 'G15', title: '급행 진단: 다음 열차까지 기다리는 시간', repr: '빈칸', minLevel: 2, maxLevel: 2, diagnostic: true, generate: () => asDiag(t151Level2(7, [2, 8, 14, 20], 1, 10, 25)) };
const D3 = { id: 'G15-D3', node: 'G15', title: '급행 진단(예비): 늦지 않는 가장 늦은 열차', repr: '문장', minLevel: 3, maxLevel: 3, diagnostic: true, generate: () => asDiag(t152Level3(8 * 60, 4, 0, 6)) };

export default [T15_1, T15_2, T15_3, D1, D2, D3];
