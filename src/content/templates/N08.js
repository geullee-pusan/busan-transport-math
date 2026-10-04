// N08 하단 — 양의 등분할로 분수 이해 [4수01-09]. 천장 6.
// 기준: docs/curriculum/07-line1-templates.md v2 8절(템플릿은 T8-1 하나).
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

const SRC_L1 = 'FACTS: 1호선 다대포해수욕장–노포, 40역, 39.9km, 8량(부산교통공사, 2026-10-04 확인)';
const L1 = () => label('1', { source: SRC_L1 });
const CARS = () => n(8, { real: true, source: SRC_L1 });
const V = (x) => n(x, { virtual: true });

/** 받아내림이 일어난 자리(0 = 일의 자리에서 빌림, 1 = 십의 자리에서 빌림) */
function borrowPos(a, b) {
  const pos = [];
  let br = 0;
  let x = a;
  let y = b;
  for (let i = 0; x > 0 || y > 0; i++) {
    const d = (x % 10) - br - (y % 10);
    br = d < 0 ? 1 : 0;
    if (br) pos.push(i);
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }
  return pos;
}
/** 자리마다 큰 숫자 − 작은 숫자 */
function absDigits(a, b) {
  let out = 0;
  for (let x = a, y = b, p = 1; x > 0 || y > 0; x = Math.floor(x / 10), y = Math.floor(y / 10), p *= 10) out += Math.abs((x % 10) - (y % 10)) * p;
  return out;
}
/** 받아올림 횟수 */
function carries(a, b) {
  let c = 0;
  let count = 0;
  for (let x = a, y = b; x > 0 || y > 0; x = Math.floor(x / 10), y = Math.floor(y / 10)) {
    c = (x % 10) + (y % 10) + c >= 10 ? 1 : 0;
    count += c;
  }
  return count;
}
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
    if (d.value === answer || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};
/** 여럿 고르기 채점 */
function multiGrade(answer, discs) {
  const key = (arr) => [...new Set((Array.isArray(arr) ? arr : []).map(Number))].sort((x, y) => x - y).join(',');
  const want = key(answer);
  return (r) => {
    if (!Array.isArray(r) || r.length === 0) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '답을 먼저 골라 볼까요?' };
    const got = key(r);
    if (got === want) return { correct: true };
    const d = discs.find((x) => key(x.value) === got);
    return d ? { correct: false, category: d.category, kind: d.kind ?? 'check', feedbackCheck: d.feedbackCheck, feedback: d.feedback } : { correct: false, category: null, kind: 'check', feedback: null };
  };
}


const roOnly = (x) => (fin(x) === 'c' ? '으로' : '로');
const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';
const fr = (a, b) => `${a}/${b}`;

/** '3/8' → [3, 8] */
function parseFrac(r) {
  const m = String(r ?? '').trim().match(/^(\d+)\s*\/\s*(\d+)$/);
  return m && Number(m[2]) !== 0 ? [Number(m[1]), Number(m[2])] : null;
}
/**
 * 분수 채점. 값이 같고 꼴만 다른 분수(6/16)는 다시 묻기(0.7절).
 * 엔진에 다시 묻기 결과가 아직 없어서 flags.careless(벌 없음) + flags.reask로 돌려준다.
 */
function fracGrade(nu, de, discs, reask) {
  return (r) => {
    if (isBlank(r)) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '답을 먼저 써 볼까요?' };
    const f = parseFrac(r);
    if (!f) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '분수로 써 볼까요?' };
    if (f[0] === nu && f[1] === de) return { correct: true };
    const exact = discs.find((d) => String(d.value) === `${f[0]}/${f[1]}`);
    if (exact) return { correct: false, category: exact.category, kind: exact.kind ?? 'check', feedbackCheck: exact.feedbackCheck, feedback: exact.feedback };
    if (f[0] * de === nu * f[1]) return { correct: false, flags: { careless: true, reask: true }, kind: 'check', feedback: reask };
    const same = discs.find((d) => {
      const g = parseFrac(d.value);
      return g && g[0] * f[1] === f[0] * g[1];
    });
    if (same) return { correct: false, category: same.category, kind: same.kind ?? 'check', feedbackCheck: same.feedbackCheck, feedback: same.feedback };
    return { correct: false, category: null, kind: 'check', feedback: null };
  };
}
const REASK8 = '8칸으로 나눈 그림이에요. 분모를 8로 쓸까요?';

/** 1단계: 꽉 찬 칸 → 분수 */
function t81Level1(k) {
  const ans = fr(k, 8);
  const discs = [
    { value: fr(k, 8 - k), category: '개념', kind: 'nudge', feedbackCheck: '분모가 무엇을 나타내는지 볼까요?', feedback: '분모는 전체 칸 수예요. 모두 몇 칸이에요?' },
    { value: fr(8, k), category: '개념', kind: 'nudge', feedbackCheck: '분모와 분자를 다시 볼까요?', feedback: '전체 칸 수는 위에 쓸까요, 아래에 쓸까요?' },
  ].filter((d) => d.value !== ans);
  return {
    text: [L1(), '호선 ', CARS(), '량 열차 그림이에요. ', V(k), '량이 꽉 찼어요. 꽉 찬 칸은 전체의 얼마인지 분수로 나타내요.'],
    figure: { kind: 'train', cars: 8, filled: k },
    input: { kind: 'fraction' },
    answer: ans,
    discriminators: discs,
    grade: fracGrade(k, 8, discs, REASK8),
    hints: [`열차는 8량이에요. 그중 ${k}량이 꽉 찼어요. 꽉 찬 칸이 전체의 얼마인지 물어요.`, '분모는 전체 칸 수, 분자는 꽉 찬 칸 수예요. 그림의 칸을 세어 봐요.', '전체는 8칸이에요.', '☐/8'],
    blank: '☐/8',
    blankAnswer: String(k),
    explain: {
      why: ['분수는 전체를 똑같이 나눈 것 중 몇 개인지 나타내요.', '1호선 8량은 크기가 같은 8칸이라 한 칸이 1/8이에요.', `그래서 꽉 찬 ${k}칸은 ${ieyo(ans)}.`],
      alt: [`1/8이 ${k}개면 ${ieyo(ans)}.`, `어느 길로 해도 답은 ${ans}${roOnly(ans)} 같아요.`],
    },
  };
}

/** 2단계: 분수 → 색칠 */
function t81Level2(p) {
  const f = fr(p, 8);
  return {
    text: [L1(), '호선 ', CARS(), '량 그림에 ', n(f), '만큼 색칠해요.'],
    figure: { kind: 'train', cars: 8, paint: true },
    input: { kind: 'paint', cells: 8 },
    answer: p,
    discriminators: uniq(
      [
        { value: 8 - p, category: '개념', kind: 'nudge', feedbackCheck: '분자가 무엇을 나타내는지 볼까요?', feedback: '분자는 색칠할 칸 수예요. 몇 칸일까요?' },
        { value: 8, category: '개념', kind: 'nudge', feedbackCheck: '분자가 무엇을 나타내는지 볼까요?', feedback: '분모는 전체 칸 수예요. 분자는요?' },
      ],
      p,
    ),
    hints: [`8칸 중 ${f}만큼 색칠하라고 해요. 색칠할 칸 수를 물어요.`, '분모 8은 전체 칸 수예요. 분자는 무엇을 뜻할까요?', '한 칸이 1/8이에요.', `${f}은 1/8이 ☐개`.replace(`${f}은`, `${f}${jo(f, '은', '는')}`)],
    blank: `${f}${jo(f, '은', '는')} 1/8이 ☐개`,
    blankAnswer: String(p),
    explain: {
      why: [`${f}${jo(f, '은', '는')} 8칸으로 똑같이 나눈 것 중 ${p}칸이에요.`, `1/8이 ${p}개예요.`.replace(`${p}개예요`, `${p}개예요`), `그래서 ${p}칸을 색칠해요.`],
      alt: [`분자 ${p}만큼 칸을 세어 칠해도 돼요.`, `어느 길로 해도 답은 ${ro(p)} 같아요.`],
    },
  };
}

const R_EQ = '똑같이 나눈 조각 중 하나예요';
const R_NEQ = '똑같이 나누지 않았어요';
/** 3단계: 똑같이 나눴는지 판단 */
function t81Level3(widths) {
  const p = widths.length;
  const equal = widths.every((w) => w === widths[0]);
  const rCount = `조각이 ${p}개예요`;
  const yn = equal ? '예' : '아니요';
  return {
    text: ['띠를 ', n(p), '조각으로 나누고 한 조각을 색칠했어요. 색칠한 조각을 ', n(fr(1, p)), '이라고 할 수 있어요? 이유도 골라요.'],
    figure: { kind: 'strip', parts: widths, shaded: [0] },
    input: { kind: 'compound', fields: [{ key: 'yn', label: '할 수 있어요?', options: ['예', '아니요'] }, { key: 'why', label: '이유', options: [R_EQ, R_NEQ, rCount] }] },
    answer: { yn, why: equal ? R_EQ : R_NEQ },
    discriminators: equal
      ? [{ key: 'yn', value: '아니요', category: '개념', kind: 'nudge', feedbackCheck: '그림을 다시 볼까요?', feedback: '조각의 크기를 견주어 볼까요?' }, { key: 'why', value: rCount, category: '개념', kind: 'check', feedback: '조각 수만 세면 될까요?' }]
      : [{ key: 'yn', value: '예', category: '개념', kind: 'check', feedback: '조각의 크기가 모두 같나요?' }, { key: 'why', value: rCount, category: '개념', kind: 'check', feedback: '조각 수만 세면 될까요?' }],
    hints: [`띠는 ${p}조각이고 그중 한 조각을 색칠했어요. 그 조각을 1/${p}이라고 할 수 있는지, 그 까닭을 물어요.`, '조각들의 길이를 견주어 볼까요? 분수는 똑같이 나눈 것으로 나타내요.', equal ? '조각의 길이가 모두 같아요.' : '조각의 길이가 서로 달라요.', `1/${p}이 되려면 띠를 ☐조각으로 똑같이 나눠야 해요.`],
    blank: `띠를 ☐조각으로 똑같이`,
    blankAnswer: String(p),
    blankThen: `1/${p}이라고 할 수 있어요?`,
    explain: {
      why: ['분수는 전체를 똑같이 나눈 것 중 몇 개인지 나타내요.', equal ? `이 띠는 ${p}조각의 크기가 모두 같아요.` : '이 띠는 조각의 크기가 서로 달라요.', equal ? `그래서 1/${p}이라고 할 수 있어요.` : `그래서 1/${p}이라고 할 수 없어요.`],
      alt: [`똑같이 ${p}조각으로 나눈 띠와 나란히 놓고 견주어 봐요.`, `어느 길로 해도 답은 '${yn}'로 같아요.`],
    },
  };
}

/** 4단계: 색칠하지 않은 칸 */
function t81Level4(k) {
  const r = 8 - k;
  const ans = fr(r, 8);
  const discs = [
    { value: fr(k, 8), category: '읽기', kind: 'check', feedback: '색칠하지 않은 칸을 물었어요. 몇 칸이에요?' },
    { value: fr(k, r), category: '개념', kind: 'nudge', feedbackCheck: '분모가 무엇을 나타내는지 볼까요?', feedback: '분모는 전체 칸 수예요. 모두 몇 칸이에요?' },
    { value: fr(r, k), category: '개념', kind: 'nudge', feedbackCheck: '분모가 무엇을 나타내는지 볼까요?', feedback: '분모는 전체 칸 수예요. 모두 몇 칸이에요?' },
    { value: fr(8, r), category: '개념', kind: 'nudge', feedbackCheck: '분모와 분자를 다시 볼까요?', feedback: '전체 칸 수는 위에 쓸까요, 아래에 쓸까요?' },
  ].filter((d) => d.value !== ans);
  return {
    text: [L1(), '호선 ', CARS(), '량 그림에서 ', V(k), '량을 색칠했어요. 색칠하지 않은 칸은 전체의 얼마예요?'],
    figure: { kind: 'train', cars: 8, shaded: k },
    input: { kind: 'fraction' },
    answer: ans,
    discriminators: discs,
    grade: fracGrade(r, 8, discs, REASK8),
    hints: [`열차는 8량이에요. 색칠한 칸은 ${k}량이에요. 색칠하지 않은 칸이 전체의 얼마인지 물어요.`, '색칠하지 않은 칸을 손가락으로 세어 볼까요? 분모는 전체 칸 수예요.', `색칠하지 않은 칸은 ${r}칸이에요.`, '☐/8'],
    blank: '☐/8',
    blankAnswer: String(r),
    explain: {
      why: ['분수는 전체를 똑같이 나눈 것 중 몇 개인지 나타내요.', `1호선 8량은 크기가 같은 8칸이라 한 칸이 1/8이에요.`, `그래서 색칠하지 않은 ${r}칸은 ${ieyo(ans)}.`],
      alt: [`색칠한 칸이 ${k}/8이고 전체는 8/8이에요.`, `남은 칸은 ${ieyo(ans)}.`, `어느 길로 해도 답은 ${ans}${roOnly(ans)} 같아요.`],
    },
  };
}

/** 5단계(도전): 부분 → 전체 */
function t81Level5(d, k) {
  const ans = d * k;
  const bl = ans >= 10 ? blankAt(ans, 0) : { blank: '☐', blankAnswer: String(ans) };
  const u = fr(1, d);
  return {
    text: ['띠의 ', n(u), '이 ', n(k), '칸이에요. 띠 전체는 몇 칸이에요?'],
    figure: { kind: 'strip', partial: true, cells: k },
    challenge: true,
    input: { kind: 'number', unit: '칸' },
    answer: ans,
    discriminators: uniq(
      [k, d, d + k].map((v) => ({ value: v, category: '개념', kind: 'check', feedback: `${d}/${d}${jo(d, '은', '는')} 몇 칸일까요?` })),
      ans,
    ),
    hints: [`띠의 ${u}이 ${k}칸이에요. 띠 전체가 몇 칸인지 물어요.`, `${u}이 몇 개 모이면 띠 전체가 될까요? 그림에 이어 그려 봐요.`, `${u}이 ${d}개면 전체예요.`, `${k} × ${d} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${u}이 ${k}칸이면 전체 ${d}/${d}는 그것이 ${d}개예요.`.replace(`${d}/${d}는`, `${d}/${d}${jo(d, '은', '는')}`), `${k} × ${d} = ${ieyo(ans)}.`, `그래서 띠 전체는 ${ans}칸이에요.`],
      alt: [`${k}칸을 ${d}번 이어 그리면 ${ans}칸이에요.`, `어느 길로 해도 답은 ${ro(ans)} 같아요.`],
    },
  };
}

const POOL = [
  { id: 'grid', split: 'grid2x2', shaded: 1, equal4: true, ok: true },
  { id: 'cols', split: 'cols4', shaded: 1, equal4: true, ok: true },
  { id: 'rows', split: 'rows4', shaded: 1, equal4: true, ok: true },
  { id: 'diag', split: 'diagonals', shaded: 1, equal4: true, ok: true },
  { id: 'uneven', split: 'uneven4', shaded: 1, equal4: false, ok: false },
  { id: 'two', split: 'grid2x2', shaded: 2, equal4: true, ok: false },
  { id: 'three', split: 'cols3', shaded: 1, equal4: false, ok: false },
];
const LABELS = ['가', '나', '다', '라'];
/** 6단계: 1/4을 바르게 색칠한 그림 모두 */
function t81Level6(items) {
  const labeled = items.map((it, i) => ({ ...it, label: LABELS[i] }));
  const answer = labeled.filter((x) => x.ok).map((x) => x.label);
  const discs = [];
  const un = labeled.find((x) => x.id === 'uneven');
  if (un) discs.push({ value: [...answer, un.label], category: '개념', kind: 'check', feedback: '조각 크기가 모두 같나요?' });
  const two = labeled.find((x) => x.id === 'two');
  if (two) discs.push({ value: [...answer, two.label], category: '개념', kind: 'check', feedback: '색칠한 조각이 몇 개예요?' });
  const eq4 = labeled.filter((x) => x.equal4).map((x) => x.label);
  const key = (arr) => [...arr].sort().join('|');
  const grade = (r) => {
    if (!Array.isArray(r) || r.length === 0) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '답을 먼저 골라 볼까요?' };
    if (key(r) === key(answer)) return { correct: true };
    const d = discs.find((x) => key(x.value) === key(r));
    return d ? { correct: false, category: d.category, kind: d.kind ?? 'check', feedbackCheck: d.feedbackCheck, feedback: d.feedback } : { correct: false, category: null, kind: 'check', feedback: null };
  };
  const list = answer.join(', ');
  return {
    text: ['정사각형을 여러 가지로 나눈 그림 ', n(4), '개가 있어요. ', n('1/4'), '을 바르게 색칠한 것을 모두 골라요.'],
    figure: { kind: 'squares', items: labeled.map(({ label, split, shaded }) => ({ label, split, shaded })) },
    input: { kind: 'multi', options: LABELS },
    answer,
    discriminators: discs,
    grade,
    hints: ['정사각형 그림 네 개 중 1/4을 바르게 색칠한 것을 모두 물어요.', '조각의 크기가 모두 같은지, 4조각 중 1조각만 색칠했는지 봐요.', `똑같이 4조각으로 나눈 그림은 ${eq4.join(', ')}예요.`, '바르게 색칠한 그림은 ☐개'],
    blank: '바르게 색칠한 그림은 ☐개',
    blankAnswer: String(answer.length),
    blankThen: '어느 그림이에요?',
    explain: {
      why: ['1/4은 똑같이 나눈 4조각 중 1조각이에요.', '조각 모양이 달라도 크기가 같으면 1/4이에요.', `그래서 답은 ${list}예요.`],
      alt: ['조각 하나를 오려 다른 조각에 겹쳐 보면 크기가 같은지 알 수 있어요.', `어느 길로 해도 답은 ${list}로 같아요.`],
    },
  };
}

/** 같은 크기가 아닌 조각 너비 */
function unevenWidths(rng, p) {
  for (let t = 0; t < 50; t++) {
    const w = Array.from({ length: p }, () => rng.int(1, 4));
    if (!w.every((x) => x === w[0])) return w;
  }
  return [1, 2, 1, 3].slice(0, p).concat(Array(Math.max(0, p - 4)).fill(2));
}

/** T8-1 열차 칸 색칠 (그림) — 1~6단계 */
const T8_1 = {
  id: 'T8-1',
  node: 'N08',
  title: '열차 칸 색칠',
  repr: '그림',
  minLevel: 1,
  maxLevel: 6,
  generate(rng, level) {
    if (level === 1) return t81Level1(rng.pick([1, 2, 3, 5, 6, 7]));
    if (level === 2) return t81Level2(rng.pick([2, 3, 5, 6, 7]));
    if (level === 3) {
      const p = rng.int(3, 6);
      return t81Level3(rng.next() < 0.4 ? Array(p).fill(1) : unevenWidths(rng, p));
    }
    if (level === 4) return t81Level4(rng.pick([1, 2, 3, 5, 6, 7]));
    if (level === 5) {
      const [d, k] = draw(rng, () => [rng.int(2, 5), rng.int(2, 6)], ([a, b]) => a * b !== 8 && a !== b, [4, 3]);
      return t81Level5(d, k);
    }
    const valid = POOL.filter((x) => x.ok);
    const bad = POOL.filter((x) => !x.ok);
    const nv = rng.int(1, 3);
    const items = rng.shuffle([...rng.shuffle(valid).slice(0, nv), ...rng.shuffle(bad).slice(0, 4 - nv)]);
    return t81Level6(items);
  },
};

/** 급행 통과 진단 */
const D1 = {
  id: 'N08-D1',
  node: 'N08',
  title: '급행 진단: 색칠하지 않은 칸',
  repr: '그림',
  minLevel: 4,
  maxLevel: 4,
  diagnostic: true,
  generate() {
    return { ...t81Level4(3), hints: [], blank: null };
  },
};
const D2 = {
  id: 'N08-D2',
  node: 'N08',
  title: '급행 진단: 똑같이 나눴나요',
  repr: '그림',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...t81Level3([1, 2, 1, 3]), hints: [], blank: null };
  },
};
const D3 = {
  id: 'N08-D3',
  node: 'N08',
  title: '급행 진단(예비): 띠 전체',
  repr: '그림',
  minLevel: 5,
  maxLevel: 5,
  diagnostic: true,
  generate() {
    return { ...t81Level5(4, 3), hints: [], blank: null };
  },
};

// ── T8-2 분수 읽고 쓰기 (문장) — 09-templates-additions.md 8절 ──
const KN = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십'];
const readFr = (k, d) => `${KN[d]}분의 ${KN[k]}`;

/** 1단계: 분수 → 읽기 */
function t82Level1(k, d, rng) {
  const f = fr(k, d);
  const right = readFr(k, d);
  const swapped = `${KN[k]}분의 ${KN[d]}`;
  const plain = `${KN[k]} ${KN[d]}`;
  return {
    text: [n(f), jo(f, '을', '를'), ' 바르게 읽은 것은 어느 것이에요?'],
    figure: null,
    input: { kind: 'choice', options: rng.shuffle([right, swapped, plain]) },
    answer: right,
    discriminators: [
      { value: swapped, category: '개념', kind: 'nudge', feedbackCheck: '읽는 차례를 다시 볼까요?', feedback: '분모부터 읽어요' },
      { value: plain, category: '개념', kind: 'nudge', feedbackCheck: '읽는 차례를 다시 볼까요?', feedback: '분모를 먼저 읽고 "분의"를 붙여요' },
    ],
    hints: [`분수 ${f}${jo(f, '을', '를')} 읽는 말을 물어요. 보기는 세 개예요.`, '분모는 아래, 분자는 위에 있는 수예요. 어느 수를 먼저 읽을까요?', `${f}의 분모는 ${ieyo(d)}.`, '분모: ☐'],
    blank: '분모: ☐',
    blankAnswer: String(d),
    blankThen: '바르게 읽은 것은 어느 것이에요?',
    explain: {
      why: ['분수는 분모를 먼저 읽고 "분의"를 붙인 다음 분자를 읽어요.', `${f}의 분모는 ${d}, 분자는 ${ieyo(k)}.`, `그래서 ${f}${jo(f, '은', '는')} "${right}"라고 읽어요.`],
      alt: [`${d}칸으로 똑같이 나눈 것 중 ${k}칸이라고 생각하고 "${KN[d]}분의"부터 말해요.`, `두 생각 모두 "${right}"예요.`],
    },
  };
}

/** 2단계: 읽기 → 분수 */
function t82Level2(k, d) {
  const ans = fr(k, d);
  const r = readFr(k, d);
  const discs = [{ value: fr(d, k), category: '개념', kind: 'check', feedback: `${r}에서 분모는 몇이에요?` }];
  return {
    text: ['"', r, '"', jo(k, '을', '를'), ' 분수로 써요.'],
    figure: null,
    input: { kind: 'fraction' },
    answer: ans,
    discriminators: discs,
    grade: fracGrade(k, d, discs, `"${r}" 그대로 분모와 분자를 써 볼까요?`),
    hints: [`"${r}"${jo(k, '을', '를')} 분수로 쓰는 것을 물어요.`, '"분의" 앞에 읽은 수가 분모예요. 분모는 아래에 써요.', `분모는 ${ieyo(d)}.`, `☐/${d}`],
    blank: `☐/${d}`,
    blankAnswer: String(k),
    explain: {
      why: ['"몇분의 몇"에서 앞의 수가 분모, 뒤의 수가 분자예요.', `"${r}"의 분모는 ${d}, 분자는 ${ieyo(k)}.`, `그래서 ${ieyo(ans)}.`],
      alt: [`${d}칸으로 똑같이 나눈 것 중 ${k}칸을 떠올려도 돼요.`, `두 생각 모두 ${ieyo(ans)}.`],
    },
  };
}

/** 3단계: 그림 없는 상황 → 분수 + 분모·분자 */
function t82Level3(k) {
  const ans = fr(k, 8);
  return {
    text: [L1(), '호선 ', CARS(), '량 열차 중 ', V(k), '량에 냉방이 강하게 나와요. 냉방이 강한 칸은 열차 전체의 얼마예요? 분모와 분자도 써요.'],
    figure: null,
    input: {
      kind: 'compound',
      fields: [
        { key: 'frac', label: '분수', kind: 'fraction' },
        { key: 'den', label: '분모' },
        { key: 'num', label: '분자' },
      ],
    },
    answer: { frac: ans, den: 8, num: k },
    discriminators: [
      { key: 'frac', value: fr(k, 8 - k), category: '개념', kind: 'nudge', feedbackCheck: '분모가 무엇을 나타내는지 볼까요?', feedback: '분모는 전체 칸 수예요. 모두 몇 칸이에요?' },
      { key: 'frac', value: fr(8, k), category: '개념', kind: 'nudge', feedbackCheck: '분모와 분자를 다시 볼까요?', feedback: '전체 칸 수는 위에 쓸까요, 아래에 쓸까요?' },
      { key: 'den', value: k, category: '개념', kind: 'nudge', feedbackCheck: '분모가 무엇을 나타내는지 볼까요?', feedback: '분모는 전체 칸 수예요. 모두 몇 칸이에요?' },
      { key: 'num', value: 8, category: '개념', kind: 'nudge', feedbackCheck: '분자가 무엇을 나타내는지 볼까요?', feedback: '분자는 냉방이 강한 칸 수예요' },
    ],
    hints: [`열차는 8량이에요. 그중 ${k}량에 냉방이 강하게 나와요. 전체의 얼마인지 물어요.`, '열차를 똑같이 몇 칸으로 나눈 것인지 먼저 볼까요?', '전체는 8칸이라 분모는 8이에요.', '분자: ☐'],
    blank: '분자: ☐',
    blankAnswer: String(k),
    blankThen: '분수와 분모도 써요.',
    explain: {
      why: ['1호선 8량은 크기가 같은 8칸이에요.', `그중 ${k}칸이라 ${ans}, 분모는 8, 분자는 ${ieyo(k)}.`, `그래서 냉방이 강한 칸은 전체의 ${ieyo(ans)}.`],
      alt: [`한 칸이 1/8이니 ${k}칸은 1/8이 ${k}개, 곧 ${ieyo(ans)}.`, `두 생각 모두 ${ieyo(ans)}.`],
    },
  };
}

/** T8-2 분수 읽고 쓰기 (문장) — 1~3단계 */
const T8_2 = {
  id: 'T8-2',
  node: 'N08',
  title: '분수 읽고 쓰기',
  repr: '문장',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 3) return t82Level3(rng.pick([1, 2, 3, 5, 6, 7]));
    const d = rng.int(3, 9);
    const k = rng.int(1, d - 1);
    return level === 1 ? t82Level1(k, d, rng) : t82Level2(k, d);
  },
};

// ── T8-3 분수 말 틀 (빈칸) — 09-templates-additions.md 8절 ──
const FRAME = '"전체를 똑같이 [  ]칸으로 나눈 것 중 [  ]칸 → [  ]/[  ]"';
const FRAME_FIELDS = [
  { key: 'whole', label: '전체를 똑같이 [  ]칸으로' },
  { key: 'part', label: '나눈 것 중 [  ]칸' },
  { key: 'frac', label: '분수', kind: 'fraction' },
];

function t83(d, k, figure, opts = {}) {
  const f = fr(k, d);
  const pick = opts.pick ?? null;
  const fields = pick ? [{ key: 'pick', label: '말 틀을 쓸 수 있는 그림', options: ['가', '나'] }, ...FRAME_FIELDS] : FRAME_FIELDS;
  const answer = pick ? { pick, whole: d, part: k, frac: f } : { whole: d, part: k, frac: f };
  const discs = [
    ...(pick ? [{ key: 'pick', value: pick === '가' ? '나' : '가', category: '개념', kind: 'check', feedback: "'똑같이' 나눴나요?" }] : []),
    { key: 'whole', value: k, category: '개념', kind: 'nudge', feedbackCheck: '처음 칸이 무엇을 나타내는지 볼까요?', feedback: '처음 칸은 전체 칸 수예요' },
    { key: 'frac', value: fr(d, k), category: '개념', kind: 'nudge', feedbackCheck: '분모와 분자를 다시 볼까요?', feedback: '전체 칸 수는 위에 쓸까요, 아래에 쓸까요?' },
  ];
  return {
    text: [pick ? `두 그림 중 이 말 틀을 쓸 수 있는 그림을 고르고, 말 틀을 채워요. ${FRAME}` : `${opts.lead ?? ''}그림을 보고 말 틀을 채워요. ${FRAME}`],
    figure,
    input: { kind: 'compound', fields },
    answer,
    discriminators: discs,
    hints: [
      opts.hint1,
      pick ? '조각의 크기가 모두 같은지 먼저 볼까요? 그다음 전체 조각 수와 색칠한 조각 수를 세어요.' : '전체 칸 수와 색칠한 칸 수를 각각 세어 볼까요?',
      pick ? `${pick} 그림은 크기가 같은 ${d}조각으로 나뉘어 있어요.` : `전체는 ${d}칸이에요.`,
      '색칠한 칸: ☐칸',
    ],
    blank: '색칠한 칸: ☐칸',
    blankAnswer: String(k),
    blankThen: '말 틀을 모두 채워요.',
    explain: {
      why: [
        ...(pick ? [`${pick} 그림만 똑같이 나뉘어 있어요. 분수는 똑같이 나눈 것으로 나타내요.`] : []),
        '분모는 전체 칸 수, 분자는 색칠한 칸 수예요.',
        `그래서 전체를 똑같이 ${d}칸으로 나눈 것 중 ${k}칸이라 ${ieyo(f)}.`,
      ],
      alt: [`한 칸이 1/${d}이고 ${k}칸이니 ${ieyo(f)}.`, `두 생각 모두 ${ieyo(f)}.`],
    },
  };
}

/** T8-3 분수 말 틀 (빈칸) — 1~3단계 */
const T8_3 = {
  id: 'T8-3',
  node: 'N08',
  title: '분수 말 틀',
  repr: '빈칸',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 1) {
      const k = rng.int(1, 7);
      return t83(8, k, { kind: 'train', cars: 8, full: Array.from({ length: k }, (_, i) => i) }, { hint1: `열차는 8칸이고, 그중 ${k}칸이 색칠되어 있어요. 말 틀을 채우는 문제예요.` });
    }
    if (level === 2) {
      const d = rng.pick([3, 4, 5, 6, 7, 9, 10]);
      const k = rng.int(1, d - 1);
      return t83(d, k, { kind: 'strip', parts: Array(d).fill(1), shaded: Array.from({ length: k }, (_, i) => i) }, { hint1: `띠가 ${d}칸으로 똑같이 나뉘었고, ${k}칸이 색칠되어 있어요. 말 틀을 채우는 문제예요.` });
    }
    const k = rng.int(1, 3);
    const eqFirst = rng.next() < 0.5;
    const eq = { split: rng.pick(['grid2x2', 'cols4', 'rows4', 'diagonals']), shaded: k };
    const uneven = { split: 'uneven4', shaded: k };
    const [first, second] = eqFirst ? [eq, uneven] : [uneven, eq];
    return t83(4, k, { kind: 'squares', items: [{ label: '가', ...first }, { label: '나', ...second }] }, { pick: eqFirst ? '가' : '나', hint1: '정사각형 그림 두 개가 있어요. 말 틀을 쓸 수 있는 그림을 고르고 말 틀을 채우는 문제예요.' });
  },
};

export default [T8_1, T8_2, T8_3, D1, D2, D3];
