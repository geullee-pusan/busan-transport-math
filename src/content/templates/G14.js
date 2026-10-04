// G14 부암 — 초 단위 시간의 덧셈·뺄셈 [4수03-14]. 천장 7(시범은 1~6). 서면 환승 융합(N25 × G14) 포함.
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

const SRC_L1 = 'FACTS: 1호선 역 순서(부산역 19번째 → 서면 25번째, 부산교통공사, 2026-10-04 확인)';
const SRC_L2 = 'FACTS: 2호선 장산–양산, 43역, 45.2km, 6량(부산교통공사, 2026-10-04 확인)';
const L1 = () => label('1', { source: SRC_L1 });
const L2 = () => label('2', { source: SRC_L2 });

/** 분초 덧셈 문장 조각(맨 계산) */
const msMath = (sec) => msText(sec, n);

// ── T14-1 정비창 점검 (식) — 1~3단계 ──
// 단계 불변식: 1 받아올림 없음 / 2 초 받아올림 / 3 뺄셈 받아내림.
// scene = 식 앞 교통 장면 조각(없으면 식만)
function t141Add(x, y, level, scene = null) {
  const sum = x + y;
  const answer = msAns(sum);
  const [a, b, c, d] = [Math.floor(x / 60), x % 60, Math.floor(y / 60), y % 60];
  const discs =
    level === 1
      ? []
      : cleanDiscs(
          [
            { value: { m: a + c, s: b + d }, category: '개념', kind: 'check', feedback: `${b + d}초는 1분보다 길지 않나요?` },
            { value: { m: a + c + 1, s: b + d }, category: '계산', kind: 'check', feedback: '초 칸을 다시 볼까요?' },
            { value: { m: a + c, s: b + d - 60 }, category: '계산', kind: 'check', feedback: '받아올린 1분은 어디 갔나요?' },
          ],
          answer,
        );
  const carry = b + d >= 60;
  return {
    text: [...(scene ?? []), ...msMath(x), ' + ', ...msMath(y), ' = ?'],
    figure: null,
    input: { kind: 'compound', fields: MS_FIELDS },
    answer,
    discriminators: discs,
    grade: cgrade(MS_FIELDS, answer, discs),
    hints: [
      `${ms(x)} + ${ms(y)}를 몇 분 몇 초로 구해요.`,
      carry ? '초끼리, 분끼리 더해 볼까요? 초가 60을 넘으면 1분으로 바꿔요.' : '초끼리, 분끼리 따로 더해 볼까요?',
      carry ? `초끼리 ${b} + ${d} = ${b + d}초, 1분 ${b + d - 60}초예요.` : `초끼리 ${b} + ${d} = ${b + d}초예요.`,
      `${ms(x)} + ${ms(y)} = ☐분 ${answer.s}초`,
    ],
    blank: '☐',
    blankAnswer: String(answer.m),
    explain: {
      why: carry
        ? [`초끼리 ${b} + ${d} = ${b + d}초예요.`, `${b + d}초는 1분 ${b + d - 60}초라서 1분을 분 쪽으로 올려요.`, `분은 ${a} + ${c} + 1 = ${answer.m}분이에요.`, `그래서 ${ms0(sum)}예요.`]
        : [`초끼리 ${b} + ${d} = ${b + d}초예요.`, `분끼리 ${a} + ${c} = ${a + c}분이에요.`, `그래서 ${ms0(sum)}예요.`],
      alt: [`초로 바꾸면 ${x} + ${y} = ${sum}초, 60초씩 묶으면 ${ms0(sum)}예요.`, `두 풀이 모두 ${ms0(sum)}예요.`],
    },
  };
}
function t141Sub(x, y, scene = null) {
  const diff = x - y;
  const answer = msAns(diff);
  const [a, b, c, d] = [Math.floor(x / 60), x % 60, Math.floor(y / 60), y % 60];
  const discs = cleanDiscs(
    [
      { value: { m: a - c - 1, s: b + 100 - d }, category: '개념', kind: 'check', feedback: '1분을 빌리면 몇 초일까요?' },
      { value: { m: a - c, s: d - b }, category: '개념', kind: 'check', feedback: `${b}초에서 ${d}초를 뺄 수 있나요?` },
      { value: { m: a - c, s: b + 60 - d }, category: '계산', kind: 'check', feedback: '분 칸을 다시 볼까요?' },
    ],
    answer,
  );
  return {
    text: [...(scene ?? []), ...msMath(x), ' − ', ...msMath(y), ' = ?'],
    figure: null,
    input: { kind: 'compound', fields: MS_FIELDS },
    answer,
    discriminators: discs,
    grade: cgrade(MS_FIELDS, answer, discs),
    hints: [`${ms(x)} − ${ms(y)}를 몇 분 몇 초로 구해요.`, `초끼리 뺄 수 없으면 1분을 60초로 바꿔 빌려 와요.`, `${a}분 ${b}초는 ${a - 1}분 ${b + 60}초와 같아요.`, `${b + 60} − ${d} = ${blankAt(answer.s, answer.s >= 10 ? 1 : 0).blank}`],
    blank: blankAt(answer.s, answer.s >= 10 ? 1 : 0).blank,
    blankAnswer: blankAt(answer.s, answer.s >= 10 ? 1 : 0).blankAnswer,
    explain: {
      why: [`${b}초에서 ${d}초를 뺄 수 없어서 1분을 60초로 빌려 와요.`, `초는 ${b + 60} − ${d} = ${answer.s}초, 분은 ${a - 1} − ${c} = ${answer.m}분이에요.`, `그래서 ${ms0(diff)}예요.`],
      alt: [`초로 바꾸면 ${x} − ${y} = ${diff}초, 60초씩 묶으면 ${ms0(diff)}예요.`, `두 풀이 모두 ${ms0(diff)}예요.`],
    },
  };
}
const T14_1 = {
  id: 'T14-1',
  node: 'G14',
  title: '정비창 점검: 분초 덧셈·뺄셈',
  repr: '식',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 3) {
      const [x, y] = draw(
        rng,
        () => [rng.int(2, 5) * 60 + rng.int(0, 50), rng.int(1, 3) * 60 + rng.int(10, 55)],
        ([p, q]) => p % 60 < q % 60 && Math.floor(p / 60) - Math.floor(q / 60) - 1 >= 1 && (p - q) % 60 >= 5,
        [190, 100],
      );
      return t141Sub(x, y, ['어느 날 부암역 승강장에서 나는 열차를 ', ...msText(x), ' 기다렸고, 친구는 ', ...msText(y), ' 기다렸어요. 내가 몇 분 몇 초 더 기다렸는지 식으로 계산해요. ']);
    }
    const [x, y] = draw(
      rng,
      () => [rng.int(1, 4) * 60 + rng.int(5, 55), (level === 2 && rng.next() < 0.4 ? 0 : rng.int(1, 3) * 60) + rng.int(5, 55)],
      ([p, q]) => {
        const s = (p % 60) + (q % 60);
        return level === 1 ? s < 60 && q >= 60 : s > 60;
      },
      level === 1 ? [135, 90] : [105, 30],
    );
    return t141Add(x, y, level, ['집에서 부암역까지 ', ...msText(x), ' 걸었고, 승강장에서 열차를 ', ...msText(y), ' 기다렸어요. 모두 몇 분 몇 초인지 식으로 계산해요. ']);
  },
};

// ── T14-2 서면에서 갈아타기 (문장) — 1~4단계 + 도전 5~6단계 ──
// 단계 불변식: 1 받아올림 없음 / 2 초 받아올림 / 3 합과 기준 비교(차 5~30초) / 4 시각 − 시간 = 시각(초 받아내림) / 5 □ 범위의 가장 긴 시간 / 6 오류 찾기.
function t142Level1(x, y) {
  const sum = x + y;
  const answer = msAns(sum);
  return {
    text: ['부암역에서 서면역까지 ', ...msText(x), ', 서면역에서 갈아타는 데 ', ...msText(y), '가 걸렸어요. 모두 몇 분 몇 초예요?'],
    figure: { kind: 'stations', line: '2', stations: ['부암', '서면'] },
    input: { kind: 'compound', fields: MS_FIELDS },
    answer,
    discriminators: [],
    grade: cgrade(MS_FIELDS, answer, []),
    hints: [`부암에서 서면까지 ${ms(x)}, 갈아타는 데 ${ms(y)} 걸렸어요. 모두 걸린 시간을 물어요.`, '초끼리, 분끼리 따로 모아 볼까요?', `초끼리 ${x % 60} + ${y % 60} = ${(x % 60) + (y % 60)}초예요.`, `☐분 ${answer.s}초`],
    blank: '☐',
    blankAnswer: String(answer.m),
    explain: { why: [`초끼리 ${x % 60} + ${y % 60} = ${answer.s}초예요.`, `분끼리 ${Math.floor(x / 60)} + ${Math.floor(y / 60)} = ${answer.m}분이에요.`, `그래서 모두 ${ms0(sum)}예요.`], alt: [`초로 바꾸면 ${x} + ${y} = ${sum}초예요. 60초씩 묶으면 ${ms0(sum)}예요.`, `두 풀이 모두 ${ms0(sum)}예요.`] },
  };
}
function t142Level2(x, y) {
  const sum = x + y;
  const answer = msAns(sum);
  const raw = { m: Math.floor(x / 60) + Math.floor(y / 60), s: (x % 60) + (y % 60) };
  const discs = cleanDiscs(
    [
      { value: raw, category: '개념', kind: 'check', feedback: `${raw.s}초는 1분보다 길지 않나요?` },
      { value: { m: raw.m, s: raw.s - 60 }, category: '계산', kind: 'check', feedback: '받아올린 1분은 어디 갔나요?' },
    ],
    answer,
  );
  return {
    text: ['어느 날 서면역에서 갈아타는 데 걸은 시간이 ', ...msText(x), ', 기다린 시간이 ', ...msText(y), (y % 60 === 0 ? '이었어요.' : '였어요.') + ' 모두 몇 분 몇 초예요?'],
    figure: null,
    input: { kind: 'compound', fields: MS_FIELDS },
    answer,
    discriminators: discs,
    grade: cgrade(MS_FIELDS, answer, discs),
    hints: [`걸은 시간은 ${ms(x)}, 기다린 시간은 ${ms(y)}예요. 모두 몇 분 몇 초인지 물어요.`, '초끼리 모은 다음, 60초가 넘으면 1분으로 바꿔 볼까요?', `초끼리 ${x % 60} + ${y % 60} = ${raw.s}초, 1분 ${raw.s - 60}초예요.`, `${raw.m}분 + 1분 ${raw.s - 60}초 = ☐분 ${raw.s - 60}초`],
    blank: '☐',
    blankAnswer: String(answer.m),
    explain: { why: [`초끼리 ${x % 60} + ${y % 60} = ${raw.s}초예요.`, `${raw.s}초는 1분 ${raw.s - 60}초라서 분은 ${raw.m} + 1 = ${answer.m}분이에요.`, `그래서 모두 ${ms0(sum)}예요.`], alt: [`초로 바꾸면 ${x} + ${y} = ${sum}초, 60초씩 묶으면 ${ms0(sum)}예요.`, `두 풀이 모두 ${ms0(sum)}예요.`] },
  };
}
const CAN = ['탈 수 있어요', '탈 수 없어요'];
function t142Level3(x, y, T) {
  const sum = x + y;
  const can = sum <= T * 60 ? CAN[0] : CAN[1];
  const fields = [...MS_FIELDS, { key: 'can', label: '이 열차를', options: CAN }];
  const answer = { ...msAns(sum), can };
  const raw = { m: Math.floor(x / 60) + Math.floor(y / 60), s: (x % 60) + (y % 60) };
  const rawCan = raw.m < T ? CAN[0] : CAN[1];
  const discs = cleanDiscs(
    [
      { value: { ...raw, can: rawCan }, category: '개념', kind: 'nudge', feedbackCheck: `${raw.s}초는 1분보다 길지 않나요?`, feedback: `${raw.s}초를 분과 초로 바꿔 볼까요?` },
      { value: raw, category: '개념', kind: 'nudge', feedbackCheck: `${raw.s}초는 1분보다 길지 않나요?`, feedback: `${raw.s}초를 분과 초로 바꿔 볼까요?` },
      { value: { ...msAns(sum), can: can === CAN[0] ? CAN[1] : CAN[0] }, category: '개념', kind: 'check', feedback: '열차가 떠나는 때와 다시 견주어 볼까요?' },
    ],
    answer,
  );
  const ms1 = raw.s - 60;
  return {
    text: ['부암역에서 서면역까지 ', ...msText(x), ', 서면역에서 갈아타는 데 ', ...msText(y), '가 걸려요. ', L1(), '호선 열차가 ', V(T), '분 뒤에 떠나요. 걸리는 시간은 모두 몇 분 몇 초이고, 이 열차를 탈 수 있을까요?'],
    figure: null,
    input: { kind: 'compound', fields },
    answer,
    discriminators: discs,
    grade: cgrade(fields, answer, discs),
    hints: [`부암에서 서면까지 ${ms(x)}, 갈아타는 데 ${ms(y)} 걸려요. 열차는 ${T}분 뒤에 떠나요. 탈 수 있는지 물어요.`, `두 시간을 합한 뒤 ${T}분과 견주어 볼까요?`, `초끼리 더하면 ${x % 60} + ${y % 60} = ${raw.s}초, 1분 ${ms1}초예요.`, `${Math.floor(x / 60)}분 + ${Math.floor(y / 60)}분 + 1분 ${ms1}초 = ☐분 ${ms1}초`],
    blank: '☐',
    blankAnswer: String(answer.m),
    blankThen: '탈 수 있어요?',
    explain: {
      why: [`${ms(x)} + ${ms(y)} = ${raw.m}분 ${raw.s}초 = ${ms0(sum)}예요.`, sum <= T * 60 ? `${T}분보다 ${T * 60 - sum}초 짧아서 이 열차를 탈 수 있어요.` : `${T}분보다 ${sum - T * 60}초 길어서 이 열차는 탈 수 없어요.`, `그래서 ${ms0(sum)}, ${can}.`],
      alt: [`초로 바꾸면 ${x}초 + ${y}초 = ${sum}초, ${T}분은 ${T * 60}초예요.`, `${sum}초와 ${T * 60}초를 견주어도 ${can}.`, `두 풀이 모두 ${can}.`],
    },
  };
}
function t142Level4(h, m, s, t) {
  const arr = h * 3600 + m * 60 + s;
  const dep = arr - t;
  const answer = { h: Math.floor(dep / 3600), m: Math.floor((dep % 3600) / 60), s: dep % 60 };
  const [a, b] = [Math.floor(t / 60), t % 60];
  const discs = cleanDiscs(
    [
      { value: { h, m: m - a, s: s + 60 - b }, category: '계산', kind: 'check', feedback: '분 칸을 다시 볼까요?' },
      { value: { h, m: m - a, s: b - s }, category: '개념', kind: 'check', feedback: `${s}초에서 ${b}초를 뺄 수 있나요?` },
    ],
    answer,
  );
  return {
    text: ['어느 날 서면역 ', L2(), '호선 승강장에 ', ...hmsText(h, m, s), '에 도착했어요. 부암역에서 ', ...msText(t), ' 걸렸어요. 부암역에서 몇 시 몇 분 몇 초에 출발했어요?'],
    figure: null,
    input: { kind: 'compound', fields: HMS_FIELDS },
    answer,
    discriminators: discs,
    grade: cgrade(HMS_FIELDS, answer, discs),
    hints: [`서면에 ${hms(h, m, s)}에 도착했고, 부암에서 ${ms(t)} 걸렸어요. 출발한 시각을 물어요.`, '도착 시각에서 걸린 시간만큼 거꾸로 가 볼까요? 초끼리 뺄 수 없으면 1분을 빌려 와요.', `${m}분 ${s}초는 ${m - 1}분 ${s + 60}초와 같아요.`, `초: ${s + 60} − ${b} = ${blankAt(answer.s, answer.s >= 10 ? 1 : 0).blank}`],
    blank: blankAt(answer.s, answer.s >= 10 ? 1 : 0).blank,
    blankAnswer: blankAt(answer.s, answer.s >= 10 ? 1 : 0).blankAnswer,
    explain: {
      why: [`${s}초에서 ${b}초를 뺄 수 없어서 1분을 60초로 빌려 와요.`, `초는 ${s + 60} − ${b} = ${answer.s}초, 분은 ${m - 1} − ${a} = ${answer.m}분이에요.`, `그래서 ${hms(answer.h, answer.m, answer.s)}에 출발했어요.`],
      alt: [`${hms(answer.h, answer.m, answer.s)}에서 ${ms(t)} 뒤를 세어 보면 ${hms(h, m, s)}예요.`, `두 풀이 모두 ${hms(answer.h, answer.m, answer.s)}예요.`],
    },
  };
}
function t142Level5(X, Y) {
  const best = Y * 60 - X - 10;
  const answer = msAns(best);
  const discs = cleanDiscs([{ value: msAns(Y * 60 - X), category: '개념', kind: 'check', feedback: `${Y}분보다 짧아야 해요. 같아도 될까요?` }], answer);
  return {
    text: [unknown('□분 □0초'), ' + ', ...msMath(X), '가 ', n(Y), '분보다 짧아요. ', unknown('□분 □0초'), '가 될 수 있는 가장 긴 시간은 몇 분 몇 초예요?'],
    figure: null,
    challenge: true,
    input: { kind: 'compound', fields: MS_FIELDS },
    answer,
    discriminators: discs,
    grade: cgrade(MS_FIELDS, answer, discs),
    hints: [`□분 □0초와 ${ms(X)}를 합한 시간이 ${Y}분보다 짧아요. 그런 시간 중 가장 긴 것을 물어요.`, `${Y}분에서 ${ms(X)}를 거꾸로 빼 볼까요? 같으면 안 되는 것도 생각해요.`, `${Y}분 − ${ms(X)} = ${ms(Y * 60 - X)}예요.`, `${ms(Y * 60 - X)}보다 10초 짧은 시간: ☐분 ${answer.s}초`],
    blank: '☐',
    blankAnswer: String(answer.m),
    explain: { why: [`${Y}분 − ${ms(X)} = ${ms(Y * 60 - X)}예요.`, `합이 ${Y}분보다 짧아야 하니 ${ms(Y * 60 - X)}는 안 되고, 10초 단위로 그보다 짧은 것 중 가장 긴 것을 골라요.`, `그래서 ${ms0(best)}예요.`], alt: [`${ms0(best)} + ${ms(X)} = ${ms(best + X)}로 ${Y}분보다 짧아요.`, `${ms0(best + 10)} + ${ms(X)} = ${Y}분이라 짧지 않아요.`, `그래서 답은 ${ms0(best)}예요.`] },
  };
}
const WHERE = ['초를 분으로 바꾸지 않았어요', '분끼리 더하지 않았어요', '초끼리 잘못 더했어요'];
function t142Level6(a, b, c) {
  const fields = [{ key: 'where', label: '틀린 곳', options: WHERE }, ...MS_FIELDS];
  const sum = a * 60 + b + c;
  const answer = { where: WHERE[0], ...msAns(sum) };
  const discs = cleanDiscs(
    [
      { value: { m: a, s: b + c }, category: '개념', kind: 'check', feedback: `${b + c}초는 1분보다 길지 않나요?` },
      { value: { where: WHERE[1] }, category: '개념', kind: 'check', feedback: '초 칸의 수를 다시 볼까요?' },
      { value: { where: WHERE[2] }, category: '개념', kind: 'check', feedback: `${b} + ${c}를 다시 계산해 볼까요?` },
    ],
    answer,
  );
  return {
    text: ['친구가 ', n(a), '분 ', n(b), '초 + ', n(c), '초 = ', n(a), '분 ', n(b + c), '초라고 했어요. 틀린 곳을 고르고 바른 답을 써요.'],
    figure: null,
    challenge: true,
    input: { kind: 'compound', fields },
    answer,
    discriminators: discs,
    grade: cgrade(fields, answer, discs),
    hints: [`친구가 ${a}분 ${b}초와 ${c}초를 합해 ${a}분 ${b + c}초라고 했어요. 틀린 곳과 바른 답을 물어요.`, `${b + c}초가 1분보다 긴지 볼까요?`, `${b + c}초는 1분 ${b + c - 60}초예요.`, `${a}분 + 1분 ${b + c - 60}초 = ☐분 ${b + c - 60}초`],
    blank: '☐',
    blankAnswer: String(a + 1),
    explain: { why: [`${b + c}초는 60초보다 길어서 1분 ${b + c - 60}초로 바꿔야 해요.`, `친구는 초를 분으로 바꾸지 않았어요.`, `그래서 바른 답은 ${ms0(sum)}예요.`], alt: [`초로 바꾸면 ${a * 60 + b} + ${c} = ${sum}초, 60초씩 묶으면 ${ms0(sum)}예요.`, `두 풀이 모두 ${ms0(sum)}예요.`] },
  };
}
const T14_2 = {
  id: 'T14-2',
  node: 'G14',
  title: '서면에서 갈아타기',
  repr: '문장',
  minLevel: 1,
  maxLevel: 6,
  generate(rng, level) {
    if (level === 1) {
      const [x, y] = draw(rng, () => [60 + rng.int(10, 50), rng.int(2, 3) * 60 + rng.int(5, 30)], ([p, q]) => (p % 60) + (q % 60) < 60, [110, 125]);
      return t142Level1(x, y);
    }
    if (level === 2) {
      const [x, y] = draw(rng, () => [rng.int(1, 3) * 60 + rng.int(20, 55), rng.int(1, 2) * 60 + rng.int(10, 55)], ([p, q]) => (p % 60) + (q % 60) > 60, [160, 95]);
      return t142Level2(x, y);
    }
    if (level === 3) {
      const [x, y, T] = draw(
        rng,
        () => [60 + rng.pick([30, 35, 40, 45, 50, 55]), rng.int(2, 3) * 60 + rng.pick([15, 20, 25, 30, 35, 40, 45]), rng.int(4, 6)],
        ([p, q, t]) => {
          const d = Math.abs(p + q - 60 * t);
          return (p % 60) + (q % 60) > 60 && d >= 5 && d <= 30;
        },
        [110, 205, 5],
      );
      return t142Level3(x, y, T);
    }
    if (level === 4) {
      const [h, m, s, t] = draw(
        rng,
        () => [rng.int(6, 9), rng.int(8, 55), rng.int(1, 30), rng.int(2, 4) * 60 + rng.int(10, 55)],
        ([, mm, ss, tt]) => ss < tt % 60 && mm - Math.floor(tt / 60) - 1 >= 1,
        [7, 12, 5, 220],
      );
      return t142Level4(h, m, s, t);
    }
    if (level === 5) {
      const [X, Y] = draw(rng, () => [rng.int(1, 2) * 60 + rng.int(1, 5) * 10, rng.int(3, 5)], ([x, y]) => y * 60 - x - 10 >= 60, [110, 4]);
      return t142Level5(X, Y);
    }
    const [a, b, c] = draw(rng, () => [rng.int(1, 4), rng.int(30, 55), rng.int(15, 45)], ([, bb, cc]) => bb + cc > 60 && bb + cc < 100, [1, 45, 30]);
    return t142Level6(a, b, c);
  },
};

// ── T14-3 시간 띠 (그림) — 1~3단계 ──
// 그림: { kind: 'timeband', from: 0, to: 360, marks: 10, bars: [{ from, to, unknown? }] } — 0초~360초(6분) 띠, 10초 눈금, 이어 붙인 구간 막대(초).
// 단계 불변식: 1 받아올림 없는 두 막대 / 2 1분 눈금을 넘는 두 막대 / 3 끝과 앞 막대로 뒤 막대 구하기(받아내림).
function band(bars) {
  return { kind: 'timeband', from: 0, to: 360, marks: 10, bars };
}
function t143Add(x, y, level) {
  const sum = x + y;
  const answer = msAns(sum);
  const raw = { m: Math.floor(x / 60) + Math.floor(y / 60), s: (x % 60) + (y % 60) };
  const next = Math.floor(x / 60) + 1;
  const discs = level === 1 ? [] : cleanDiscs([{ value: raw, category: '개념', kind: 'check', feedback: `띠에서 ${next}분 눈금을 지났나요?` }], answer);
  const up = next * 60 - x;
  return {
    text: ['시간 띠에 ', ...msText(x), ' 막대와 ', ...msText(y), ' 막대를 이어 붙였어요. 막대의 끝은 몇 분 몇 초예요?'],
    figure: band([{ from: 0, to: x }, { from: x, to: sum }]),
    input: { kind: 'compound', fields: MS_FIELDS },
    answer,
    discriminators: discs,
    grade: cgrade(MS_FIELDS, answer, discs),
    hints:
      level === 1
        ? [`${ms(x)} 막대와 ${ms(y)} 막대를 이어 붙였어요. 끝 시간을 물어요.`, '띠에서 분 눈금을 먼저 세고, 남은 초를 세어 볼까요?', `분끼리 ${Math.floor(x / 60)} + ${Math.floor(y / 60)} = ${raw.m}분이에요.`, `${raw.m}분 ${blankAt(answer.s, 1).blank}초`]
        : [`${ms(x)} 막대와 ${ms(y)} 막대를 이어 붙였어요. 끝 시간을 물어요.`, `띠에서 ${next}분 눈금까지 몇 초가 남았는지 볼까요?`, `${ms(x)}에서 ${next}분까지는 ${up}초예요.`, `${next}분 + ${blankAt(sum - next * 60, 1).blank}초`],
    blank: level === 1 ? blankAt(answer.s, 1).blank : blankAt(sum - next * 60, 1).blank,
    blankAnswer: level === 1 ? blankAt(answer.s, 1).blankAnswer : blankAt(sum - next * 60, 1).blankAnswer,
    explain: {
      why:
        level === 1
          ? [`분끼리 ${raw.m}분, 초끼리 ${raw.s}초예요.`, '초가 60을 넘지 않아서 바꿀 것이 없어요.', `그래서 끝은 ${ms0(sum)}예요.`]
          : [`${ms(x)}에서 ${up}초 가면 ${next}분 눈금이에요.`, `${ms(y)}에서 ${up}초를 쓰고 ${sum - next * 60}초가 남아요.`, `그래서 끝은 ${ms0(sum)}예요.`],
      alt: [`초끼리 더하면 ${raw.s}초${raw.s >= 60 ? `, 1분 ${raw.s - 60}초` : ''}예요. 분과 합치면 ${ms0(sum)}예요.`, `두 풀이 모두 ${ms0(sum)}예요.`],
    },
  };
}
function t143Back(E, F) {
  const back = E - F;
  const answer = msAns(back);
  const [a, b, c, d] = [Math.floor(E / 60), E % 60, Math.floor(F / 60), F % 60];
  const discs = cleanDiscs(
    [
      { value: { m: a - c - 1, s: b + 100 - d }, category: '개념', kind: 'check', feedback: '1분을 빌리면 몇 초일까요?' },
      { value: { m: a - c, s: d - b }, category: '개념', kind: 'check', feedback: `${b}초에서 ${d}초를 뺄 수 있나요?` },
    ],
    answer,
  );
  return {
    text: ['시간 띠에 막대 두 개를 이어 붙였더니 끝이 ', ...msText(E), E % 60 === 0 ? '이에요. 앞 막대는 ' : '예요. 앞 막대는 ', ...msText(F), '예요. 뒤 막대는 몇 분 몇 초예요?'],
    figure: band([{ from: 0, to: F }, { from: F, to: E, unknown: true }]),
    input: { kind: 'compound', fields: MS_FIELDS },
    answer,
    discriminators: discs,
    grade: cgrade(MS_FIELDS, answer, discs),
    hints: [`막대 두 개의 끝은 ${ms(E)}, 앞 막대는 ${ms(F)}예요. 뒤 막대의 길이를 물어요.`, `띠에서 앞 막대 끝부터 ${c + 1}분 눈금까지, 그다음 끝까지 세어 볼까요?`, `${ms(F)}에서 ${c + 1}분까지는 ${(c + 1) * 60 - F}초예요.`, `${(c + 1) * 60 - F}초 + ${ms(E - (c + 1) * 60)} = ☐분 ${answer.s}초`],
    blank: '☐',
    blankAnswer: String(answer.m),
    explain: { why: [`${ms(F)}에서 ${c + 1}분 눈금까지 ${(c + 1) * 60 - F}초예요.`, `${c + 1}분에서 끝 ${ms(E)}까지는 ${ye(ms(E - (c + 1) * 60))}.`, `그래서 뒤 막대는 ${ms0(back)}예요.`], alt: [`${ms(E)} − ${ms(F)}를 1분 빌려 계산하면 ${a - 1}분 ${b + 60}초 − ${ms(F)} = ${ms0(back)}예요.`, `두 풀이 모두 ${ms0(back)}예요.`] },
  };
}
const T14_3 = {
  id: 'T14-3',
  node: 'G14',
  title: '시간 띠',
  repr: '그림',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 1) {
      const [x, y] = draw(rng, () => [rng.int(1, 2) * 60 + rng.int(1, 3) * 10, rng.int(1, 3) * 60 + rng.int(1, 2) * 10], ([p, q]) => (p % 60) + (q % 60) < 60 && p + q <= 360, [80, 130]);
      return t143Add(x, y, 1);
    }
    if (level === 2) {
      const [x, y] = draw(rng, () => [rng.int(1, 2) * 60 + rng.int(3, 5) * 10, rng.int(2, 5) * 10], ([p, q]) => (p % 60) + q > 60 && p + q <= 360, [100, 50]);
      return t143Add(x, y, 2);
    }
    const [E, F] = draw(rng, () => [rng.int(3, 5) * 60 + rng.int(0, 3) * 10, 60 + rng.int(3, 5) * 10], ([e, f]) => e % 60 < f % 60 && e <= 360 && (e - f) % 60 !== 0, [260, 110]);
    return t143Back(E, F);
  },
};

// ── 서면 환승 융합 (N25 × G14) — 10 문서 3절 끝. N25와 G14가 모두 개통되면 연다(requires: ['N25']). ──
function fusion3(per, tr) {
  const total = 6 * per + tr;
  const answer = msAns(total);
  const [a, b] = [Math.floor(per / 60), per % 60];
  const discs = cleanDiscs(
    [
      { value: msAns(7 * per + tr), category: '개념', kind: 'check', feedback: '부산역에서 서면역까지 정거장 수를 다시 볼까요?' },
      { value: { m: 6 * a + Math.floor(tr / 60), s: 6 * b + (tr % 60) }, category: '개념', kind: 'check', feedback: '초 칸이 60보다 커도 될까요?' },
      { value: msAns(6 * per), category: '읽기', kind: 'nudge', feedbackCheck: '문제의 시간을 모두 썼나요?', feedback: '갈아타는 시간도 썼나요?' },
    ],
    answer,
  );
  return {
    text: [L1(), '호선 부산역에서 서면역까지는 ', n(6, { real: true, source: SRC_L1 }), '정거장이에요. 한 정거장에 ', ...msText(per), '씩 걸리고, 서면역에서 갈아타는 데 ', ...msText(tr), '가 걸려요. 부산역에서 ', L2(), '호선을 탈 때까지 모두 몇 분 몇 초예요?'],
    figure: { kind: 'stations', stations: ['부산역', '초량', '부산진', '좌천', '범일', '범내골', '서면'] },
    input: { kind: 'compound', fields: MS_FIELDS },
    answer,
    requires: ['N25'],
    discriminators: discs,
    grade: cgrade(MS_FIELDS, answer, discs),
    hints: [`부산역에서 서면역까지 6정거장, 한 정거장에 ${ms(per)}, 갈아타는 데 ${ms(tr)} 걸려요. 모두 걸린 시간을 물어요.`, '6정거장 동안 걸린 시간을 먼저 구한 다음 갈아타는 시간을 더해 볼까요?', `${ms(per)} × 6 = ${6 * a}분 ${6 * b}초 = ${ye(ms(6 * per))}.`, `${ms(6 * per)} + ${ms(tr)} = ☐분 ${answer.s}초`],
    blank: '☐',
    blankAnswer: String(answer.m),
    explain: {
      why: [`6정거장은 ${ms(per)} × 6 = ${6 * a}분 ${6 * b}초예요.`, `${6 * b}초는 ${rase(ms(6 * b))} ${ye(ms(6 * per))}.`, `갈아타는 ${ms(tr)}를 더하면 ${ms0(total)}예요.`, `그래서 모두 ${ms0(total)}예요.`],
      alt: [`초로 바꾸면 ${per} × 6 + ${tr} = ${total}초, 60초씩 묶으면 ${ms0(total)}예요.`, `두 풀이 모두 ${ms0(total)}예요.`],
    },
  };
}
function fusion4(rng, h, m, s, g) {
  const arr = h * 3600 + m * 60 + s;
  const ready = arr + g * 60;
  const t0 = ready - s; // 초를 버린 시각(그 분 정각)
  const trains = [t0, t0 + 120, t0 + 240];
  const show = (t) => hm(Math.floor(t / 3600), Math.floor((t % 3600) / 60));
  const rh = Math.floor(ready / 3600);
  const rm = Math.floor((ready % 3600) / 60);
  const answer = show(trains[1]);
  const textTrains = [];
  trains.forEach((t, i) => {
    textTrains.push(...hmsText(Math.floor(t / 3600), Math.floor((t % 3600) / 60)));
    textTrains.push(i < 2 ? ', ' : '에 떠나요. ');
  });
  return {
    text: ['어느 날 ', L1(), '호선이 서면역에 ', ...hmsText(h, m, s), '에 도착했어요. 갈아타는 데 ', V(g), '분 걸렸어요. 이 문제의 ', L2(), '호선 열차는 ', ...textTrains, '탈 수 있는 첫 열차는 몇 시 몇 분 열차예요?'],
    figure: { kind: 'table', columns: ['이 문제의 2호선 열차', '떠나는 시각'], rows: trains.map((t, i) => [`${i + 1}`, show(t)]) },
    input: { kind: 'choice', options: trains.map(show) },
    answer,
    requires: ['N25'],
    discriminators: [{ value: show(trains[0]), category: '개념', kind: 'check', feedback: `${hms(rh, rm, s)}에 ${rh}시 ${rm}분 열차가 있나요?` }],
    hints: [`${hms(h, m, s)}에 도착해서 갈아타는 데 ${g}분 걸려요. 탈 수 있는 첫 열차를 물어요.`, '2호선 승강장에 닿는 시각을 먼저 구해 볼까요?', `${hms(h, m, s)}에서 ${g}분 뒤예요.`, `승강장에 닿는 시각: ☐시 ${rm}분 ${s}초`],
    blank: '☐',
    blankAnswer: String(rh),
    blankThen: '탈 수 있는 첫 열차는?',
    explain: {
      why: [`${hms(h, m, s)}에서 ${g}분 뒤는 ${hms(rh, rm, s)}예요.`, `${show(trains[0])} 열차는 그보다 ${s}초 먼저 떠나요.`, `그래서 탈 수 있는 첫 열차는 ${answer} 열차예요.`],
      alt: [`열차마다 떠나기 ${g}분 전까지 서면역에 도착해야 해요.`, `${show(trains[0])} 열차는 ${g}분 전이 도착보다 앞이라 못 타고, ${answer} 열차는 탈 수 있어요.`, `두 풀이 모두 ${answer} 열차예요.`],
    },
  };
}
const T14_F1 = {
  id: 'T14-F1',
  node: 'G14',
  title: '서면 환승 융합: 부산역에서 2호선까지',
  repr: '문장',
  fusion: { with: 'N25' },
  minLevel: 3,
  maxLevel: 3,
  generate(rng) {
    const [per, tr] = draw(rng, () => [rng.int(1, 2) * 60 + rng.int(1, 5) * 10, rng.int(2, 4) * 60 + rng.int(1, 5) * 10], ([p, t]) => ((6 * (p % 60)) % 60) + (t % 60) !== 0 && 6 * (p % 60) >= 60, [130, 220]);
    return fusion3(per, tr);
  },
};
const T14_F2 = {
  id: 'T14-F2',
  node: 'G14',
  title: '서면 환승 융합: 탈 수 있는 첫 열차',
  repr: '그림',
  fusion: { with: 'N25' },
  minLevel: 4,
  maxLevel: 4,
  generate(rng) {
    const [h, m, s, g] = draw(rng, () => [rng.int(7, 8), rng.int(50, 58), rng.pick([10, 20, 30, 40, 50]), rng.int(3, 5)], ([, mm, , gg]) => mm + gg >= 60, [7, 58, 30, 4]);
    return fusion4(rng, h, m, s, g);
  },
};

// ── 급행 통과 진단 ──
const D1 = { id: 'G14-D1', node: 'G14', title: '급행 진단: 1분 45초 + 30초', repr: '식', minLevel: 2, maxLevel: 2, diagnostic: true, generate: () => asDiag(t141Add(105, 30, 2, ['부암역까지 ', ...msText(105), ' 걷고 열차를 ', ...msText(30), ' 기다렸어요. '])) };
const D2 = { id: 'G14-D2', node: 'G14', title: '급행 진단: 이 열차를 탈 수 있을까', repr: '문장', minLevel: 3, maxLevel: 3, diagnostic: true, generate: () => asDiag(t142Level3(110, 205, 5)) };
const D3 = { id: 'G14-D3', node: 'G14', title: '급행 진단(예비): 출발 시각 거꾸로', repr: '문장', minLevel: 4, maxLevel: 4, diagnostic: true, generate: () => asDiag(t142Level4(7, 12, 5, 220)) };

export default [T14_1, T14_2, T14_3, T14_F1, T14_F2, D1, D2, D3];
