// N06 동매 — 곱셈과 나눗셈의 관계 [4수01-05]. 천장 6.
// 기준: docs/curriculum/07-line1-templates.md v2 6절. 상황과 다른 식(값은 맞음)은 판별 오답(식)으로 다시 묻는다(0.7절).
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
const num = (v) => Number(String(v ?? '').trim());
const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';
const SITUATION = '이 식은 어떤 상황이에요?';

/** 상황과 다른 식(값은 맞음). 0.7절: N06에서는 정답이 아니다. */
function mismatch(N, d, q) {
  return [
    { match: (r) => r?.op === '÷' && num(r.left) === N && num(r.right) === q && num(r.result) === d, category: '식', kind: 'check', feedback: SITUATION },
    { match: (r) => r?.op === '×' && num(r.result) === N && ((num(r.left) === d && num(r.right) === q) || (num(r.left) === q && num(r.right) === d)), category: '식', kind: 'check', feedback: SITUATION },
  ];
}
/** 칸이 여럿인 답을 직접 채점(규칙이 특수한 compound) */
function compoundGrade(keys, isRight, discs, fallback = '다시 볼까요?') {
  return (r) => {
    if (keys.every((k) => isBlank(r?.[k]))) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '답을 먼저 써 볼까요?' };
    if (isRight(r)) return { correct: true };
    for (const d of discs) if (d.key && !isBlank(r?.[d.key]) && String(r[d.key]).trim() === String(d.value)) return { correct: false, category: d.category, kind: d.kind ?? 'check', feedbackCheck: d.feedbackCheck, feedback: d.feedback };
    return { correct: false, category: null, kind: 'check', feedback: fallback };
  };
}
/** 문자열 보기 여럿 고르기 */
function multiGradeS(answer, discs) {
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

/** T6-1 1단계: 곱셈식을 보고 나눗셈 빈칸 */
function t61Level1(x, byEight) {
  const P = 8 * x;
  const d = byEight ? 8 : x;
  const ans = byEight ? x : 8;
  return {
    text: [n(8), ' × ', n(x), ' = ', n(P), jo(P, '을', '를'), ' 보고 빈칸을 채워요. ', n(P), ' ÷ ', n(d), ' = ', unknown('□')],
    figure: { kind: 'train', cars: 8, perCar: x },
    allowAnswerInText: true, // 곱셈식의 수가 그대로 나눗셈의 몫이 되는 것이 이 단계의 핵심이다.
    input: { kind: 'number' },
    answer: ans,
    discriminators: uniq(
      [
        { value: P * d, category: '식', kind: 'check', feedback: `${eun(P)} ${d}로 나누면 커질까요?`.replace(`${d}로`, `${d}${roOnly(d)}`) },
        { value: P - d, category: '식', kind: 'nudge', feedbackCheck: '몫을 곱해서 확인해 볼까요?', feedback: '나눗셈식이에요. 곱셈식에서 찾아볼까요?' },
      ],
      ans,
    ),
    hints: [`8 × ${x} = ${eul(P)} 보고 ${P} ÷ ${d}의 몫을 물어요.`, `곱셈식에서 ${eun(P)} ${d}${jo(d, '이', '가')} 몇 묶음인지 보여 줘요. 그림에서 찾아봐요.`, `8 × ${x} = ${P}에는 8, ${x}, ${P} 세 수가 있어요.`, `${d} × ☐ = ${P}`],
    blank: `${d} × ☐ = ${P}`,
    blankAnswer: String(ans),
    explain: {
      why: [`8 × ${x} = ${eun(P)} ${d}${jo(d, '이', '가')} ${ans}묶음이면 ${P}이라는 뜻이에요.`.replace(`${P}이라는`, `${P}${jo(P, '이라는', '라는')}`), `그래서 ${P} ÷ ${d} = ${ieyo(ans)}.`],
      alt: [`${P}에서 ${d}씩 빼면 ${ans}번 만에 0이 돼요.`, `어느 길로 해도 답은 ${ro(ans)} 같아요.`],
    },
  };
}

/** T6-1 2단계: 곱셈식 하나 → 나눗셈식 두 개 */
function t61Level2(x) {
  const P = 8 * x;
  const isA = (e) => e?.op === '÷' && num(e.left) === P && num(e.right) === 8 && num(e.result) === x;
  const isB = (e) => e?.op === '÷' && num(e.left) === P && num(e.right) === x && num(e.result) === 8;
  return {
    text: [n(8), ' × ', n(x), ' = ', n(P), jo(P, '을', '를'), ' 보고 나눗셈식 두 개를 만들어요.'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'eq1', label: '나눗셈식 1', kind: 'equation' }, { key: 'eq2', label: '나눗셈식 2', kind: 'equation' }] },
    answer: { eq1: { left: P, op: '÷', right: 8, result: x }, eq2: { left: P, op: '÷', right: x, result: 8 } },
    discriminators: [],
    grade(r) {
      const a = r?.eq1;
      const b = r?.eq2;
      const empty = (e) => !e || ['left', 'op', 'right', 'result'].every((k) => isBlank(e[k]));
      if (empty(a) && empty(b)) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '답을 먼저 써 볼까요?' };
      if ((isA(a) && isB(b)) || (isA(b) && isB(a))) return { correct: true };
      if ((isA(a) && isA(b)) || (isB(a) && isB(b))) return { correct: false, category: '식', kind: 'check', feedback: '두 식이 같아요. 다른 식은요?' };
      if (a?.op === '×' || b?.op === '×') return { correct: false, category: '식', kind: 'nudge', feedbackCheck: '두 식을 다시 볼까요?', feedback: '나눗셈식으로 써 볼까요?' };
      const leftOk = (e) => e?.op === '÷' && num(e?.left) === P && [8, x].includes(num(e?.right));
      if (leftOk(a) && leftOk(b)) return { correct: false, category: '계산', kind: 'check', feedback: '몫을 다시 볼까요?' };
      return { correct: false, category: '식', kind: 'check', feedback: `${P}에서 시작하는 식일까요?` };
    },
    hints: [`8 × ${x} = ${eul(P)} 보고 만들 수 있는 나눗셈식 두 개를 물어요.`, `${eun(P)} 8이 ${x}묶음이기도 하고, ${x}${jo(x, '이', '가')} 8묶음이기도 해요.`, `나눗셈식 하나는 ${P} ÷ 8 = ${ieyo(x)}.`, `${P} ÷ ${x} = ☐`],
    blank: `${P} ÷ ${x} = ☐`,
    blankAnswer: '8',
    explain: {
      why: [`8 × ${x} = ${eun(P)} 8씩 ${x}묶음이에요.`, `그래서 ${P} ÷ 8 = ${x}, ${P} ÷ ${x} = 8이에요.`],
      alt: [`${x} × 8 = ${P}로 생각해도 두 식이 나와요.`.replace(`${P}로`, `${P}${roOnly(P)}`), `어느 길로 해도 답은 ${P} ÷ 8 = ${x}, ${P} ÷ ${x} = 8로 같아요.`],
    },
  };
}

/** T6-1 3단계: 몫과 곱셈구구 몇 단 */
function t61Level3(d, q) {
  const P = d * q;
  // 나누는 수가 몫 ± 1이면(56 ÷ 8 → 8) 개념 오답(몫 = 나누는 수)과 ±1 계산 실수가 같은 값이 된다.
  // 더 구체적인 개념 오답을 앞에 두고 겹치는 ±1은 뺀다(uniq). "차례로 외워"는 핵심 전략을 알려 주므로 nudge(10 문서 2.5절),
  // 첫 오답 점검은 아이가 낸 답으로 되돌려 계산하게 한다(문제의 수와 아이의 답만 넣음).
  const discs = uniq(
    [
      { key: 'q', value: d, category: '개념', kind: 'nudge', feedbackCheck: '곱해서 확인해 볼까요?', feedback: `${d}단에서 ${eun(P)} 몇 번째에 있나요?` },
      { key: 'q', value: P * d, category: '식', kind: 'check', feedback: `${eul(P)} 나누면 커질까요?` },
      { key: 'q', value: q - 1, category: '계산', kind: 'nudge', feedbackCheck: `${d} × ${q - 1}, 다시 계산해 볼까요?`, feedback: `${d}단을 차례로 외워 볼까요?` },
      { key: 'q', value: q + 1, category: '계산', kind: 'nudge', feedbackCheck: `${d} × ${q + 1}, 다시 계산해 볼까요?`, feedback: `${d}단을 차례로 외워 볼까요?` },
    ],
    q,
  );
  return {
    text: [n(P), ' ÷ ', n(d), ' = ', unknown('□'), '. 곱셈구구 몇 단을 보면 되는지도 써요.'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'q', label: '몫' }, { key: 'dan', label: '몇 단' }] },
    answer: { q, dan: d },
    discriminators: discs,
    // 몫 q는 d단(d × q)에도, q단(q × d)에도 있다. 두 단 모두 맞게 본다.
    grade: compoundGrade(['q', 'dan'], (r) => num(r?.q) === q && [d, q].includes(num(r?.dan)), discs),
    hints: [`${P} ÷ ${d}의 몫과, 곱셈구구 몇 단을 보면 되는지 물어요.`, `${d} × 몇이 ${P}${jo(P, '이', '가')} 될까요? ${d}단을 차례로 떠올려 봐요.`, `${d} × ${q - 1} = ${ieyo(d * (q - 1))}.`, `${d} × ☐ = ${P}`],
    blank: `${d} × ☐ = ${P}`,
    blankAnswer: String(q),
    blankThen: '곱셈구구 몇 단이에요?',
    explain: {
      why: [`${d} × ${q} = ${eun(P)} ${d}${jo(d, '이', '가')} ${q}묶음이면 ${P}${jo(P, '이라는', '라는')} 뜻이에요.`, `그래서 ${P} ÷ ${d} = ${q}이고, ${d}단을 보면 돼요.`],
      alt: [`${P}에서 ${d}씩 빼면 ${q}번 만에 0이 돼요.`, `어느 길로 해도 답은 ${ro(q)} 같아요.`],
    },
  };
}

/** T6-1 4단계(도전): □ ÷ d = q */
function t61Level4(d, q) {
  const P = d * q;
  const bl = blankAt(P, 1);
  return {
    text: [unknown('□'), ' ÷ ', n(d), ' = ', n(q), '에서 □는 얼마예요?'],
    figure: null,
    challenge: true,
    input: { kind: 'number' },
    answer: P,
    discriminators: uniq([{ value: d + q, category: '식', kind: 'check', feedback: null }], P),
    hints: [`어떤 수를 ${d}${roOnly(d)} 나눈 몫이 ${ieyo(q)}. 그 어떤 수를 물어요.`, `□는 ${d}씩 ${q}묶음이에요. 곱셈식으로 바꿔 볼까요?`, `${d} × ${q - 1} = ${ieyo(d * (q - 1))}.`, `${d} × ${q} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`□ ÷ ${d} = ${eun(q)} □를 ${d}씩 묶으면 ${q}묶음이라는 뜻이에요.`, `${d} × ${q} = ${ieyo(P)}.`, `그래서 □는 ${ieyo(P)}.`],
      alt: [`확인해 봐요: ${P} ÷ ${d} = ${ieyo(q)}.`, `어느 길로 해도 답은 ${ro(P)} 같아요.`],
    },
  };
}

/** T6-1 5단계: N명이 □칸에 △명씩 — 모든 경우 */
function t61Level5(N, rng) {
  const label = (a, b) => `${a}칸 ${b}명`;
  const valid = [];
  for (let a = 2; a <= 9; a++) if (N % a === 0 && N / a >= 2 && N / a <= 9) valid.push([a, N / a]);
  const distract = [];
  if (N / 2 >= 10) distract.push([2, N / 2]);
  for (const [a, b] of valid) {
    if (b + 1 <= 9 && a * (b + 1) !== N) distract.push([a, b + 1]);
    if (a - 1 >= 2 && (a - 1) * b !== N) distract.push([a - 1, b]);
  }
  const seen = new Set();
  const dis = rng.shuffle(distract).filter(([a, b]) => {
    const k = `${a},${b}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 3);
  const options = [...valid, ...dis].sort((p, q) => p[0] - q[0] || p[1] - q[1]).map(([a, b]) => label(a, b));
  const answer = valid.map(([a, b]) => label(a, b));
  const discs = [];
  const half = valid.filter(([a, b]) => a <= b).map(([a, b]) => label(a, b));
  if (half.length !== answer.length) discs.push({ value: half, category: '개념', kind: 'nudge', feedbackCheck: '빠진 것이 없나요?', feedback: '칸과 사람 수를 바꿔도 될까요?' });
  if (N / 2 >= 10) discs.push({ value: [...answer, label(2, N / 2)], category: '개념', kind: 'check', feedback: '모두 한 자리 수인지 볼까요?' });
  const [a0, b0] = valid[0];
  return {
    text: [V(N), '명이 □칸에 △명씩 똑같이 앉아요. □와 △가 모두 한 자리 수인 경우를 모두 골라요.'],
    figure: null,
    input: { kind: 'multi', options },
    answer,
    discriminators: discs,
    grade: multiGradeS(answer, discs),
    hints: [`${N}명이 칸마다 같은 수만큼 앉아요. 칸 수와 한 칸 사람 수가 모두 한 자리 수인 경우를 모두 물어요.`, `곱해서 ${N}${jo(N, '이', '가')} 되는 두 한 자리 수를 곱셈구구에서 찾아볼까요? 순서를 바꾼 짝도 봐요.`, `${a0} × ${b0} = ${ieyo(N)}.`, `${b0}칸 ☐명`],
    blank: `${b0}칸 ☐명`,
    blankAnswer: String(a0),
    explain: {
      why: [`곱해서 ${N}${jo(N, '이', '가')} 되는 한 자리 수 짝은 ${valid.map(([a, b]) => `${a} × ${b}`).join(', ')}${jo(valid.at(-1)[1], '이에요', '예요')}.`, '칸 수와 한 칸 사람 수를 바꾸면 다른 경우예요.', `그래서 답은 ${answer.join(', ')}이에요.`],
      alt: [`${N}을 2, 3, 4, …로 차례로 나눠 몫이 한 자리 수인지 봐도 돼요.`.replace(`${N}을`, eul(N)), `어느 길로 해도 답은 ${answer.join(', ')}으로 같아요.`],
    },
  };
}

/** T6-1 6단계(도전): 곱과 몫으로 두 수 찾기 */
function t61Level6(s, r) {
  const big = s * r;
  const P = big * s;
  return {
    text: ['두 수를 곱하면 ', n(P), jo(P, '이고', '고'), ', 큰 수를 작은 수로 나누면 ', n(r), '예요. 두 수는 얼마예요?'.replace('예요', jo(r, '이에요', '예요'))],
    figure: null,
    challenge: true,
    input: { kind: 'compound', fields: [{ key: 'big', label: '큰 수' }, { key: 'small', label: '작은 수' }] },
    answer: { big, small: s },
    discriminators: [
      { key: 'big', value: P, category: '개념', kind: 'nudge', feedbackCheck: '두 수를 다시 볼까요?', feedback: '큰 수를 작은 수로 나누면 몇이에요?' },
      { key: 'small', value: r, category: '개념', kind: 'check', feedback: '나눈 몫과 작은 수를 헷갈렸나요?' },
    ].filter((d) => d.value !== (d.key === 'big' ? big : s)),
    hints: [`두 수의 곱은 ${ieyo(P)}. 큰 수를 작은 수로 나눈 몫은 ${ieyo(r)}. 두 수를 물어요.`, `큰 수는 작은 수의 ${r}배예요. 작은 수를 1, 2, 3, …으로 넣어 볼까요?`, `작은 수가 1이면 큰 수는 ${r}, 곱은 ${ro(r)} ${P}${jo(P, '이', '가')} 아니에요.`, `작은 수 ☐, 큰 수 ${big}`],
    blank: `작은 수 ☐, 큰 수 ${big}`,
    blankAnswer: String(s),
    explain: {
      why: [`큰 수는 작은 수의 ${r}배예요.`, `작은 수가 ${s}이면 큰 수는 ${s} × ${r} = ${ieyo(big)}.`.replace(`${s}이면`, `${s}${jo(s, '이면', '면')}`), `${big} × ${s} = ${P}이 되어 맞아요.`.replace(`${P}이`, `${P}${jo(P, '이', '가')}`), `그래서 큰 수는 ${big}, 작은 수는 ${ieyo(s)}.`],
      alt: [`곱셈구구에서 곱이 ${P}인 짝을 모두 찾고 몫이 ${r}인 짝을 골라도 돼요.`.replace(`${P}인`, `${P}${jo(P, '인', '인')}`), `어느 길로 해도 답은 ${big}과 ${s}${roOnly(s)} 같아요.`.replace(`${big}과`, wa(big))],
    },
  };
}

/** T6-1 곱셈식 ↔ 나눗셈식 (식·빈칸) — 1~6단계 */
const T6_1 = {
  id: 'T6-1',
  node: 'N06',
  title: '곱셈식과 나눗셈식',
  repr: '식',
  minLevel: 1,
  maxLevel: 6,
  generate(rng, level) {
    const xs = [3, 4, 5, 6, 7, 9];
    if (level === 1) return t61Level1(rng.pick(xs), rng.next() < 0.6);
    if (level === 2) return t61Level2(rng.pick(xs));
    if (level === 3 || level === 4) {
      const [d, q] = draw(rng, () => [rng.int(3, 9), rng.int(3, 9)], ([a, b]) => a !== b, [8, 7]);
      return level === 3 ? t61Level3(d, q) : t61Level4(d, q);
    }
    if (level === 5) return t61Level5(rng.pick([12, 18, 24, 28, 32, 36, 42, 48, 54, 56, 63, 72]), rng);
    const [s, r] = draw(rng, () => [rng.int(2, 4), rng.int(2, 5)], ([a, b]) => a !== b, [2, 4]);
    return t61Level6(s, r);
  },
};

/** T6-2 1단계 */
function t62Level1(q) {
  const N = 8 * q;
  return {
    text: [L1(), '호선은 ', CARS(), '량이에요. ', V(N), '명이 칸마다 똑같이 타면 한 칸에 몇 명이에요?'],
    figure: { kind: 'train', cars: 8 },
    input: { kind: 'number', unit: '명' },
    answer: q,
    discriminators: uniq(
      [
        { value: N * 8, category: '식', kind: 'check', feedback: '한 칸 사람 수가 전체보다 많을까요?' },
        { value: N - 8, category: '식', kind: 'check', feedback: '칸마다 똑같이 탔나요?' },
        { value: 8, category: '읽기', kind: 'check', feedback: '8은 칸 수예요. 무엇을 물었죠?' },
      ],
      q,
    ),
    hints: [`사람은 ${N}명, 칸은 8개예요. 칸마다 같은 수만큼 타요. 한 칸에 몇 명인지 물어요.`, '8 × 몇이 될까요? 곱셈구구 8단을 떠올려 봐요.', `8 × ${q - 1} = ${ieyo(8 * (q - 1))}.`, `8 × ☐ = ${N}`],
    blank: `8 × ☐ = ${N}`,
    blankAnswer: String(q),
    explain: {
      why: [`${N}명을 8칸에 똑같이 나눠요.`, `8 × ${q} = ${N}이니 ${N} ÷ 8 = ${ieyo(q)}.`, `그래서 한 칸에 ${q}명이에요.`],
      alt: [`${N}에서 8씩 빼면 ${q}번 만에 0이 돼요.`, `어느 길로 해도 답은 ${ro(q)} 같아요.`],
    },
  };
}

/** T6-2 2단계: 식과 답 */
function t62Level2(q) {
  const N = 8 * q;
  return {
    text: ['어느 날 ', V(N), '명이 ', L1(), '호선 ', CARS(), '량에 칸마다 똑같이 탔어요. 한 칸에 몇 명인지 식과 답을 써요.'],
    figure: { kind: 'train', cars: 8 },
    input: { kind: 'equation' },
    answer: { left: N, op: '÷', right: 8, result: q },
    discriminators: [...mismatch(N, 8, q), { match: (r) => r?.op === '×' && num(r.left) === N, category: '식', kind: 'check', feedback: '한 칸 사람 수가 전체보다 많을까요?' }],
    hints: [`${N}명이 8칸에 같은 수만큼 탔어요. 한 칸에 몇 명인지 식과 답을 물어요.`, '전체를 칸 수만큼 똑같이 나누는 식이에요. 8단에서 몫을 찾아요.', `8 × ${q} = ${ieyo(N)}.`, `${N} ÷ 8 = ☐`],
    blank: `${N} ÷ 8 = ☐`,
    blankAnswer: String(q),
    explain: {
      why: [`${N}명을 8칸에 똑같이 나누는 상황이에요.`, `8 × ${q} = ${N}이니 한 칸에 ${q}명씩이에요.`, `그래서 식은 ${N} ÷ 8 = ${ieyo(q)}.`],
      alt: [`${N}에서 8씩 빼면 ${q}번 만에 0이 돼요.`, `어느 길로 해도 답은 ${ro(q)} 같아요.`],
    },
  };
}

/** T6-2 3단계: 두 열차 비교 */
function t62Level3(a, b) {
  const A = 8 * a;
  const B = 8 * b;
  const which = a > b ? '앞' : '뒤';
  const diff = Math.abs(a - b);
  return {
    text: ['어느 날 ', V(A), '명이 앞 열차 ', CARS(), '량에, ', V(B), '명이 뒤 열차 ', CARS(), '량에 칸마다 똑같이 탔어요. 한 칸에 탄 사람이 더 많은 열차는 어느 쪽이고, 몇 명 더 많아요?'],
    figure: { kind: 'trains', trains: [{ name: '앞 열차', cars: 8 }, { name: '뒤 열차', cars: 8 }] },
    input: { kind: 'compound', fields: [{ key: 'which', label: '열차', options: ['앞', '뒤'] }, { key: 'diff', label: '몇 명 더' }] },
    answer: { which, diff },
    discriminators: [
      { key: 'diff', value: Math.abs(A - B), category: '읽기', kind: 'check', feedback: '한 칸의 차이를 물었어요. 다시 볼까요?' },
      { key: 'which', value: which === '앞' ? '뒤' : '앞', category: '읽기', kind: 'nudge', feedbackCheck: '두 열차를 다시 견주어 볼까요?', feedback: '한 칸에 몇 명씩인지 견주어 볼까요?' },
    ],
    hints: [`앞 열차 8량에 ${A}명, 뒤 열차 8량에 ${B}명이 탔어요. 한 칸에 탄 사람이 더 많은 열차와 그 차이를 물어요.`, '두 열차의 한 칸 사람 수를 각각 구해 볼까요? 그다음 견주어요.', `앞 열차는 한 칸에 ${A} ÷ 8 = ${a}명이에요.`, `뒤 열차는 한 칸에 ${B} ÷ 8 = ☐명`],
    blank: `${B} ÷ 8 = ☐`,
    blankAnswer: String(b),
    blankThen: '어느 열차가 몇 명 더 많아요?',
    explain: {
      why: [`앞 열차는 한 칸에 ${A} ÷ 8 = ${a}명, 뒤 열차는 ${B} ÷ 8 = ${b}명이에요.`, `${Math.max(a, b)} − ${Math.min(a, b)} = ${ieyo(diff)}.`, `그래서 ${which} 열차가 한 칸에 ${diff}명 더 많아요.`],
      alt: [`전체 차이 ${Math.abs(A - B)}명을 8칸에 나눠도 한 칸 차이가 나와요.`, `${Math.abs(A - B)} ÷ 8 = ${ieyo(diff)}.`, `어느 길로 해도 답은 ${ro(diff)} 같아요.`],
    },
  };
}

/** T6-2 1호선 칸마다 (문장) — 1~3단계 */
const T6_2 = {
  id: 'T6-2',
  node: 'N06',
  title: '1호선 칸마다',
  repr: '문장',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 1) return t62Level1(rng.pick([6, 7, 9]));
    if (level === 2) return t62Level2(rng.pick([3, 4, 5, 6, 7, 9]));
    const [a, b] = draw(rng, () => [rng.int(3, 9), rng.int(3, 9)], ([x, y]) => x !== y && Math.abs(x - y) <= 3, [6, 7]);
    return t62Level3(a, b);
  },
};

/** 급행 통과 진단 */
const D1 = {
  id: 'N06-D1',
  node: 'N06',
  title: '급행 진단: 구구로 나누기',
  repr: '식',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return {
      text: [n(56), ' ÷ ', n(8), ' = ?'],
      figure: null,
      input: { kind: 'number' },
      answer: 7,
      discriminators: [
        { value: 8, category: '개념', kind: 'nudge', feedbackCheck: '곱해서 확인해 볼까요?', feedback: '8단에서 56은 몇 번째에 있나요?' },
        { value: 448, category: '식', kind: 'check', feedback: '56을 나누면 커질까요?' },
      ],
      hints: [],
      blank: null,
      explain: { why: ['8 × 7 = 56이에요.', '그래서 56 ÷ 8 = 7이에요.'], alt: [] },
    };
  },
};
const D2 = {
  id: 'N06-D2',
  node: 'N06',
  title: '급행 진단: 나뉠 수 구하기',
  repr: '식',
  minLevel: 4,
  maxLevel: 4,
  diagnostic: true,
  generate() {
    return { ...t61Level4(7, 9), hints: [], blank: null };
  },
};
const D3 = {
  id: 'N06-D3',
  node: 'N06',
  title: '급행 진단(예비): 두 열차 한 칸',
  repr: '문장',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...t62Level3(6, 7), hints: [], blank: null };
  },
};

// ── T6-3 좌석 배열 그림 (그림) — 09-templates-additions.md 6절 ──
// figure: { kind: 'array', rows: 줄 수, cols: 한 줄의 의자 수, label? }
const CHAIRS = '역 대합실 의자가 줄마다 같은 수로 놓여 있어요.';

/** 1단계: 배열 전부 보임 → 곱셈식 */
function t63Level1(r, c) {
  const P = r * c;
  const bl = blankAt(P, 1);
  return {
    text: [`${CHAIRS} 의자는 모두 몇 개예요? 곱셈식으로 써요.`],
    figure: { kind: 'array', rows: r, cols: c },
    input: { kind: 'equation' },
    answer: { left: r, op: '×', right: c, result: P, commutative: true },
    discriminators: [
      { match: (x) => x?.op === '+', category: '식', kind: 'nudge', feedbackCheck: '이 식은 어떤 상황이에요?', feedback: '같은 수씩 여러 줄이에요. 곱셈식으로 써 볼까요?' },
      { match: (x) => x?.op === '÷' || x?.op === '-', category: '식', kind: 'check', feedback: '의자가 모두 몇 개인지 물었어요' },
    ],
    hints: ['대합실 의자가 줄마다 같은 수로 놓여 있어요. 의자가 모두 몇 개인지 곱셈식을 물어요.', '한 줄에 몇 개인지, 몇 줄인지 세어 볼까요? 같은 수씩 여러 줄이면 곱셈식으로 써요.', `한 줄에 ${c}개씩 ${r}줄이에요.`, `${r} × ${c} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`한 줄에 ${c}개씩 ${r}줄이에요.`, `${r} × ${c} = ${ieyo(P)}.`, `${c} × ${r} = ${P}${roOnly(P)} 써도 돼요.`, `그래서 의자는 ${P}개예요.`],
      alt: [`${c}씩 ${r}번 뛰어 세어도 ${ieyo(P)}.`, `두 풀이 모두 ${P}개예요.`],
    },
  };
}

/** 2단계: 첫 줄만 보임, 모두 N개 → 나눗셈식(줄 수) */
function t63Level2(r, c) {
  const N = r * c;
  return {
    text: [`${CHAIRS} 의자는 모두 `, V(N), '개예요. 그림은 첫 줄만 보여요. 줄은 몇 줄이에요? 나눗셈식으로 써요.'],
    // 줄 수가 답이라 첫 줄만 그린다(rows: 1). hiddenRows: 나머지 줄이 가려져 있다는 표시.
    figure: { kind: 'array', rows: 1, cols: c, label: '나머지 줄은 가려져 있어요', hiddenRows: true },
    input: { kind: 'equation' },
    answer: { left: N, op: '÷', right: c, result: r },
    discriminators: [
      ...mismatch(N, c, r),
      { match: (x) => x?.op === '×' && num(x.left) === N, category: '식', kind: 'check', feedback: '줄 수가 의자 수보다 많을까요?' },
      { match: (x) => x?.op === '-' || x?.op === '+', category: '식', kind: 'nudge', feedbackCheck: '이 식은 어떤 상황이에요?', feedback: '한 줄에 같은 수씩이에요. 몇 묶음일까요?' },
    ],
    hints: [`의자는 모두 ${N}개이고, 한 줄에 ${c}개예요. 줄이 몇 줄인지 물어요.`, `${c}개씩 묶으면 몇 묶음일까요? 곱셈구구 ${c}단을 떠올려 봐요.`, `${c} × ${r - 1} = ${c * (r - 1)}, ${c} × ${r + 1} = ${ieyo(c * (r + 1))}.`, `${c} × ☐ = ${N}`],
    blank: `${c} × ☐ = ${N}`,
    blankAnswer: String(r),
    explain: {
      why: [`한 줄에 ${c}개씩 ${r}줄이면 ${c} × ${r} = ${N}개예요.`, `그래서 ${N}개를 ${c}개씩 나누면 ${r}줄, ${N} ÷ ${c} = ${ieyo(r)}.`],
      alt: [`${N}에서 ${c}씩 빼면 ${r}번 만에 0이 돼요.`, `두 풀이 모두 ${r}줄이에요.`],
    },
  };
}

/** 3단계: 배열로 만들 수 있는 식 모두 고르기 */
function t63Level3(r, c, rng) {
  const P = r * c;
  const mul = `${r} × ${c} = ${P}`;
  const byCols = `${P} ÷ ${c} = ${r}`;
  const byRows = `${P} ÷ ${r} = ${c}`;
  const minus = `${P} − ${c} = ${P - c}`;
  const plus = `${c} + ${r} = ${c + r}`;
  const answer = [mul, byCols, byRows];
  const discs = [
    { value: [...answer, minus], category: '개념', kind: 'check', feedback: '줄 하나를 뺀 식이에요. 배열 전체일까요?' },
    { value: [...answer, plus], category: '개념', kind: 'check', feedback: `${c} + ${eun(r)} 의자 수일까요?` },
    { value: [mul, byCols], category: '개념', kind: 'nudge', feedbackCheck: '빠진 것이 없나요?', feedback: '줄로 나누기와 칸으로 나누기 둘 다?' },
    { value: [mul, byRows], category: '개념', kind: 'nudge', feedbackCheck: '빠진 것이 없나요?', feedback: '줄로 나누기와 칸으로 나누기 둘 다?' },
  ];
  return {
    text: [`${CHAIRS} 이 그림으로 만들 수 있는 식을 모두 골라요.`],
    figure: { kind: 'array', rows: r, cols: c },
    input: { kind: 'multi', options: rng.shuffle([mul, byCols, byRows, minus, plus]) },
    answer,
    discriminators: discs,
    grade: multiGradeS(answer, discs),
    hints: ['의자 배열 그림을 보고 만들 수 있는 식을 모두 물어요.', '배열 전체의 의자 수를 곱셈식으로 먼저 써 볼까요? 그 곱셈식으로 나눗셈식도 만들 수 있어요.', `한 줄에 ${c}개씩 ${r}줄이라 ${mul}${jo(P, '이에요', '예요')}.`, `${P} ÷ ${c} = ☐`],
    blank: `${P} ÷ ${c} = ☐`,
    blankAnswer: String(r),
    blankThen: '만들 수 있는 식을 모두 골라요.',
    explain: {
      why: [`한 줄에 ${c}개씩 ${r}줄이라 ${mul}${jo(P, '이에요', '예요')}.`, `${P}개를 ${c}개씩 나누면 ${r}줄, ${r}줄로 똑같이 나누면 한 줄에 ${c}개예요.`, `그래서 ${mul}, ${byCols}, ${byRows} 세 식이에요.`],
      alt: ['곱셈식 하나에서 나눗셈식 두 개가 나와요.', '나머지 두 식은 배열 전체의 의자 수를 나타내지 않아요.'],
    },
  };
}

/** T6-3 좌석 배열 그림 (그림) — 1~3단계 */
const T6_3 = {
  id: 'T6-3',
  node: 'N06',
  title: '좌석 배열 그림',
  repr: '그림',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const [r, c] = draw(rng, () => [rng.int(3, 9), rng.int(3, 9)], ([x, y]) => x !== y, level === 1 ? [6, 8] : level === 2 ? [6, 8] : [7, 8]);
    if (level === 1) return t63Level1(r, c);
    if (level === 2) return t63Level2(r, c);
    return t63Level3(r, c, rng);
  },
};

export default [T6_1, T6_2, T6_3, D1, D2, D3];
