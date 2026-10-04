// N14 동대신 — (두 자리)÷(한 자리), 나머지 없음 [4수01-06]. 천장 6.
// 기준: docs/curriculum/08-line1-templates-11-20.md 14절, 09 끝 보강 후보(그림: 수 모형 나누기). 피드백 꼬리표 kind: 'check' | 'nudge'(10 문서 2절).
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

const FORTY = () => n(40, { real: true, source: SRC_L1 });
const num = (v) => Number(String(v ?? '').trim());
const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';
/** 십의 자리에서 남은 것을 버린 몫(72 ÷ 4 → 10) */
const dropTens = (N, d) => Math.floor(Math.floor(N / 10) / d) * 10 + Math.floor((N % 10) / d);
/** 몫의 두 숫자를 바꾼 수 */
const swapQ = (q) => (q % 10) * 10 + Math.floor(q / 10);

/** 나눗셈 판별 오답 */
function divDiscs(N, d, q) {
  return uniq(
    [
      { value: dropTens(N, d), category: '개념', kind: 'nudge', feedbackCheck: '십의 자리를 다시 볼까요?', feedback: `십의 자리에서 남은 ${(Math.floor(N / 10) % d) * 10}${jo((Math.floor(N / 10) % d) * 10, '은', '는')} 어디로 갔나요?` },
      { value: swapQ(q), category: '계산', kind: 'check', feedback: `몫에 ${eul(d)} 곱하면 ${N}${jo(N, '이', '가')} 되나요?` },
      { value: N * d, category: '식', kind: 'check', feedback: '나누면 커질까요?' },
    ].filter((x) => x.value >= 10 || x.category !== '개념'),
    q,
  );
}

/** 나눗셈 힌트: N = (나누는 수 × 몇십) + 나머지 부분 */
function divHints(N, d, q, lead) {
  const tensQ = Math.floor(q / 10) * 10;
  const part1 = d * tensQ;
  const part2 = N - part1;
  return {
    hints: [lead, `${eul(N)} ${wa(part1)} ${ro(part2)} 나눠 볼까요? 둘 다 ${ro(d)} 나누기 쉬워요.`, `${part1} ÷ ${d} = ${ieyo(tensQ)}.`, `${part2} ÷ ${d} = ☐`],
    blank: `${part2} ÷ ${d} = ☐`,
    blankAnswer: String(q % 10),
    blankThen: '몫은 얼마예요?',
  };
}

function divExplain(N, d, q) {
  const tensQ = Math.floor(q / 10) * 10;
  const part1 = d * tensQ;
  const part2 = N - part1;
  return {
    why: [`${eun(N)} ${wa(part1)} ${ieyo(part2)}.`, `${part1} ÷ ${d} = ${tensQ}, ${part2} ÷ ${d} = ${q % 10}${jo(q % 10, '이라', '라')} 몫은 ${ieyo(q)}.`, `그래서 ${N} ÷ ${d} = ${ieyo(q)}.`],
    alt: [`세로로 나눠요. 십의 자리부터 ${ro(d)} 나누고, 남은 수는 일의 자리와 합쳐 다시 나눠요.`, `어느 길로 해도 답은 ${ro(q)} 같아요.`],
  };
}

// ── T14-1 정비창 점검 (식) — 1~3단계 ──
function buildDiv(N, d, q) {
  return {
    text: [n(N), ' ÷ ', n(d), ' = ?'],
    figure: null,
    input: { kind: 'number' },
    answer: q,
    discriminators: divDiscs(N, d, q),
    ...divHints(N, d, q, `${eul(N)} ${ro(d)} 나눈 몫을 물어요.`),
    explain: {
      why: [divExplain(N, d, q).why[0], divExplain(N, d, q).why[1], `그래서 ${N} ÷ ${d} = ${ieyo(q)}.`],
      alt: [`${d} × ${q} = ${N}${roOnly(N)} 확인해요.`, ...divExplain(N, d, q).alt],
    },
  };
}

/** 3단계: 몫과 곱셈 확인식(식 입력) */
function t141Level3(N, d, q) {
  return {
    text: [n(N), ' ÷ ', n(d), '의 몫을 구하고, 맞는지 곱셈식으로 확인해요. 확인하는 곱셈식을 써요.'],
    figure: null,
    input: { kind: 'equation' },
    answer: { left: d, op: '×', right: q, result: N, commutative: true },
    discriminators: [
      { match: (r) => r?.op === '÷' && num(r.left) === N && num(r.right) === d && num(r.result) === q, category: '식', kind: 'check', feedback: '곱셈식으로 써 볼까요?' },
      { match: (r) => r?.op === '×' && [num(r.left), num(r.right)].includes(d) && [num(r.left), num(r.right)].includes(dropTens(N, d)), category: '개념', kind: 'nudge', feedbackCheck: '십의 자리를 다시 볼까요?', feedback: `십의 자리에서 남은 수는 어디로 갔나요?` },
      { match: (r) => r?.op === '×' && num(r.result) !== N && num(r.result) > 0, category: '계산', kind: 'check', feedback: `곱이 ${N}${jo(N, '이', '가')} 되나요?` },
    ],
    hints: [`${eul(N)} ${ro(d)} 나눈 몫과, 그것을 확인하는 곱셈식을 물어요.`, `${d} × 몇이 ${N}${jo(N, '이', '가')} 될까요? 십의 자리부터 나눠 봐요.`, `${d} × ${Math.floor(q / 10) * 10} = ${ieyo(d * Math.floor(q / 10) * 10)}.`, `${d} × ☐ = ${N - d * Math.floor(q / 10) * 10}`],
    blank: `${d} × ☐ = ${N - d * Math.floor(q / 10) * 10}`,
    blankAnswer: String(q % 10),
    blankThen: '확인하는 곱셈식을 써요.',
    explain: {
      why: [divExplain(N, d, q).why[0], divExplain(N, d, q).why[1], `그래서 ${N} ÷ ${d} = ${q}, 확인식은 ${d} × ${q} = ${ieyo(N)}.`],
      alt: divExplain(N, d, q).alt,
    },
  };
}

/** 단계별 (나뉠 수, 나누는 수) */
function pickDiv(rng, level) {
  return draw(
    rng,
    () => {
      const d = rng.int(2, level === 1 ? 4 : 8);
      const q = rng.int(11, 49);
      return [d * q, d, q];
    },
    ([N, d, q]) => {
      if (N > 99 || q === d || q % 10 === 0) return false;
      const tens = Math.floor(N / 10);
      if (level === 1) return tens % d === 0 && (N % 10) % d === 0;
      return tens % d !== 0 && swapQ(q) !== q;
    },
    level === 1 ? [69, 3, 23] : level === 2 ? [72, 4, 18] : [96, 8, 12],
  );
}

const T14_1 = {
  id: 'T14-1',
  node: 'N14',
  title: '정비창 점검: (두 자리)÷(한 자리)',
  repr: '식',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const [N, d, q] = pickDiv(rng, level);
    return level === 3 ? t141Level3(N, d, q) : buildDiv(N, d, q);
  },
};

// ── T14-2 1호선 칸·역 (문장) — 1~6단계(5~6단계는 도전) ──
function t142Level1(q) {
  const N = 8 * q;
  return {
    text: [L1(), '호선은 ', CARS(), '량이에요. 어느 날 ', V(N), '명이 칸마다 똑같이 탔어요. 한 칸에 몇 명이에요?'],
    figure: { kind: 'train', cars: 8 },
    input: { kind: 'number', unit: '명' },
    answer: q,
    discriminators: divDiscs(N, 8, q),
    ...divHints(N, 8, q, `사람은 ${N}명, 칸은 8개예요. 칸마다 같은 수만큼 타요. 한 칸에 몇 명인지 물어요.`),
    explain: { why: [`${N}명을 8칸에 똑같이 나누면 ${N} ÷ 8이에요.`, divExplain(N, 8, q).why[1], `그래서 한 칸에 ${q}명이에요.`], alt: [`8 × ${q} = ${N}${roOnly(N)} 확인해요.`, `어느 길로 해도 답은 ${ro(q)} 같아요.`] },
  };
}

function t142Level2(k, q) {
  const N = k * q;
  return {
    text: ['어느 날 ', L1(), '호선 앞 ', V(k), '칸에 ', V(N), '명이 칸마다 똑같이 탔어요. 한 칸에 몇 명인지 식과 답을 써요.'],
    figure: { kind: 'train', cars: 8, highlight: Array.from({ length: k }, (_, i) => i) },
    input: { kind: 'equation' },
    answer: { left: N, op: '÷', right: k, result: q },
    discriminators: [
      { match: (r) => r?.op === '÷' && num(r.left) === N && num(r.right) === q && num(r.result) === k, category: '식', kind: 'check', feedback: '이 식은 어떤 상황이에요?' },
      { match: (r) => r?.op === '×' && num(r.left) === N, category: '식', kind: 'check', feedback: '한 칸 사람 수가 전체보다 많을까요?' },
      { match: (r) => r?.op === '-', category: '식', kind: 'check', feedback: '칸마다 똑같이 나눠 탔나요?' },
    ],
    // 상황과 다른 곱셈식(k × q = N, 값은 맞음)은 07 0.7절대로 정답 + equationMismatch.
    grade(r) {
      const { left, op, right, result } = r ?? {};
      if ([left, op, right, result].every(isBlank)) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '답을 먼저 써 볼까요?' };
      if (op === '÷' && num(left) === N && num(right) === k && num(result) === q) return { correct: true };
      if (op === '×' && num(result) === N && ((num(left) === k && num(right) === q) || (num(left) === q && num(right) === k))) return { correct: true, flags: { equationMismatch: true } };
      for (const d of this.discriminators) if (d.match(r)) return { correct: false, category: d.category, kind: d.kind, feedbackCheck: d.feedbackCheck, feedback: d.feedback };
      if (op === '÷' && num(left) === N && num(right) === k) return { correct: false, category: '계산', kind: 'check', feedback: `${k} × ${num(result)}${jo(num(result), '이', '가')} ${N}인지 확인해 볼까요?` };
      return { correct: false, category: '식', kind: 'check', feedback: null };
    },
    ...divHints(N, k, q, `앞 ${k}칸에 ${N}명이 똑같이 탔어요. 한 칸의 사람 수를 구하는 식과 답을 물어요.`),
    explain: { why: [`${N}명을 ${k}칸에 똑같이 나누는 상황이에요.`, divExplain(N, k, q).why[1], `그래서 식은 ${N} ÷ ${k} = ${ieyo(q)}.`], alt: [`${k} × ${q} = ${N}${roOnly(N)} 확인해요.`, `어느 길로 해도 답은 ${ro(q)} 같아요.`] },
  };
}

/** 3단계: 40역 탐방, 하루 a역과 b역 */
function t142Level3(a, b) {
  const da = 40 / a;
  const db = 40 / b;
  const answer = { da, db, which: `하루 ${b}역`, diff: da - db };
  return {
    text: [L1(), '호선 ', FORTY(), '역을 모두 가 보는 역 탐방을 해요. 하루에 ', V(a), '역씩 가는 방법과 하루에 ', V(b), '역씩 가는 방법이 있어요. 각각 며칠 걸리고, 어느 쪽이 며칠 빨리 끝나요?'],
    figure: null,
    input: {
      kind: 'compound',
      fields: [
        { key: 'da', label: `하루 ${a}역(일)` },
        { key: 'db', label: `하루 ${b}역(일)` },
        { key: 'which', label: '빨리 끝나는 쪽', options: [`하루 ${a}역`, `하루 ${b}역`] },
        { key: 'diff', label: '며칠 빨리' },
      ],
    },
    answer,
    discriminators: uniqK(
      [
        { key: 'which', value: `하루 ${a}역`, category: '읽기', kind: 'check', feedback: '어느 쪽 날수가 적은지 다시 볼까요?' },
        { key: 'diff', value: b - a, category: '식', kind: 'check', feedback: '며칠 빨리 끝나는지 물었어요.' },
        { key: 'diff', value: da + db, category: '식', kind: 'check', feedback: '며칠 빨리 끝나는지 물었어요.' },
      ],
      answer,
    ),
    hints: [`${L1().label}호선은 40역이에요. 하루에 ${a}역씩 가는 방법과 ${b}역씩 가는 방법이 있어요. 각각 며칠 걸리고 어느 쪽이 며칠 빨리 끝나는지 물어요.`, `40역을 ${a}역씩, ${b}역씩 묶으면 각각 몇 묶음일까요?`, `${a}역씩이면 ${da}일이에요.`, `40 ÷ ${b} = ☐일`],
    blank: '☐일',
    blankAnswer: String(db),
    blankThen: '어느 쪽이 며칠 빨리 끝나요?',
    explain: {
      why: [`하루 ${a}역씩이면 40 ÷ ${a} = ${da}일, 하루 ${b}역씩이면 40 ÷ ${b} = ${db}일이에요.`, `${da} − ${db} = ${da - db}일 차이예요.`, `그래서 하루 ${b}역씩 가는 쪽이 ${da - db}일 빨리 끝나요.`],
      alt: [`${a} × ${da} = 40, ${b} × ${db} = 40으로 확인해요.`, `두 풀이 모두 하루 ${b}역씩이 ${da - db}일 빨라요.`],
    },
  };
}

/** 4단계: 잘못 나눈 결과 → 바른 몫 */
function t142Level4(r, w, p) {
  const total = w * p;
  const ans = total / r;
  return {
    text: ['어느 날 역 탐방 사진을 ', V(r), '명이 똑같이 나눠야 하는데, ', V(w), '명에게 나눴더니 한 사람이 ', V(p), '장씩이었어요. 바르게 나누면 한 사람이 몇 장이에요?'],
    figure: null,
    input: { kind: 'number', unit: '장' },
    answer: ans,
    discriminators: uniq(
      [
        { value: total, category: '식', kind: 'nudge', feedbackCheck: '무엇을 물었는지 다시 볼까요?', feedback: `사진 ${total}장을 찾았어요. ${r}명이면요?` },
        { value: total * r, category: '식', kind: 'check', feedback: '나누면 커질까요?' },
      ],
      ans,
    ),
    hints: [`사진을 ${w}명에게 나눴더니 한 사람이 ${p}장씩이었어요. ${r}명이 똑같이 나눌 때 한 사람의 장 수를 물어요.`, '잘못 나눈 것을 되돌려 사진이 모두 몇 장인지부터 구해 볼까요?', `사진은 모두 ${p} × ${w} = ${total}장이에요.`, `${total} ÷ ${r} = ${ans >= 10 ? Math.floor(ans / 10) : ''}☐`],
    blank: `${total} ÷ ${r} = ${ans >= 10 ? Math.floor(ans / 10) : ''}☐`,
    blankAnswer: String(ans % 10),
    explain: {
      why: [`${w}명에게 ${p}장씩이면 사진은 ${p} × ${w} = ${total}장이에요.`, `${r}명이 똑같이 나누면 ${total} ÷ ${r} = ${ans}장씩이에요.`, `그래서 한 사람이 ${ans}장이에요.`],
      alt: [`${r} × ${ans} = ${total}${roOnly(total)} 확인해요.`, `어느 길로 해도 답은 ${ro(ans)} 같아요.`],
    },
  };
}

/** 5단계(도전): □u ÷ d가 나누어떨어지는 □ */
function t142Level5(u, d, answer) {
  const last = answer.at(-1);
  const discs = [{ value: answer.slice(0, -1), category: '개념', kind: 'nudge', feedbackCheck: '빠진 것이 없나요?', feedback: `${last}${u} ÷ ${d}도 계산해 봤나요?` }];
  const wrongs = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((t) => !answer.includes(t));
  if (wrongs.length) discs.push({ value: [...answer, wrongs[0]].sort((x, y) => x - y), category: '개념', kind: 'check', feedback: `${wrongs[0]}${u} ÷ ${d}${jo(d, '은', '는')} 나누어떨어지나요?` });
  return {
    text: [unknown(`□${u}`), ' ÷ ', n(d), jo(d, '이', '가'), ' 나누어떨어져요. □에 들어갈 수 있는 수를 모두 골라요.'],
    figure: null,
    challenge: true,
    input: { kind: 'multi', options: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    answer,
    discriminators: uniq(discs, answer),
    grade: multiGrade(answer, discs),
    hints: [`□${u}${jo(u, '을', '를')} ${ro(d)} 나눴을 때 나머지가 없는 □를 모두 찾아요.`, `${d}단의 수 중에서 일의 자리가 ${u}인 두 자리 수를 찾아볼까요?`, `${answer[0]}${u} = ${d} × ${(answer[0] * 10 + u) / d}이에요.`.replace(/(\d)이에요\.$/, (m, g) => `${g}${jo(Number(g), '이에요', '예요')}.`), `${answer.slice(0, -1).join(', ')}${answer.length > 1 ? ', ' : ''}☐`],
    blank: `${answer.slice(0, -1).join(', ')}${answer.length > 1 ? ', ' : ''}☐`,
    blankAnswer: String(last),
    explain: {
      why: [`${d}단의 두 자리 수 중 일의 자리가 ${u}인 수는 ${answer.map((t) => t * 10 + u).join(', ')}${jo(answer.at(-1) * 10 + u, '이에요', '예요')}.`, '이 수들은 모두 나누어떨어져요.', `그래서 □는 ${answer.join(', ')}${jo(last, '이에요', '예요')}.`],
      alt: [`□에 1부터 9까지 차례로 넣어 ${ro(d)} 나눠 봐도 돼요.`, `어느 길로 해도 답은 ${answer.join(', ')}${roOnly(last)} 같아요.`],
    },
  };
}

/** 6단계(도전): □□ ÷ d = 1□, 나누어떨어짐 */
function t142Level6(d) {
  const answer = [];
  for (let q = 10; q <= 19; q++) if (d * q <= 99) answer.push(d * q);
  const options = [];
  for (let v = d * 8; v <= 99; v += d) options.push(v);
  const extra = [d * 10 + 1, d * 11 + 2, d * 12 + 1].filter((v) => v <= 99 && !options.includes(v));
  const opts = [...options, ...extra].sort((x, y) => x - y);
  const discs = [
    { value: answer.slice(1), category: '개념', kind: 'nudge', feedbackCheck: '빠진 것이 없나요?', feedback: '1□의 □에 0도 넣어 봤나요?' },
    { value: [d * 9, ...answer], category: '개념', kind: 'check', feedback: `${d * 9} ÷ ${d}의 몫은 1□ 꼴인가요?` },
  ];
  return {
    text: [unknown('□□'), ' ÷ ', n(d), ' = ', unknown('1□'), '이고 나누어떨어져요. 나뉠 수가 될 수 있는 두 자리 수를 모두 골라요.'],
    figure: null,
    challenge: true,
    input: { kind: 'multi', options: opts },
    answer,
    discriminators: uniq(discs, answer),
    grade: multiGrade(answer, discs),
    hints: [`몫이 십몇이고 나누어떨어지는 ${d}의 나뉠 수를 두 자리 수에서 모두 찾아요.`, `몫이 10일 때부터 차례로 ${d}${jo(d, '을', '를')} 곱해 볼까요? 두 자리 수를 넘으면 멈춰요.`, `몫이 10이면 ${ieyo(d * 10)}.`, `${answer.slice(0, -1).join(', ')}, ☐${answer.at(-1) % 10}`],
    blank: `☐${answer.at(-1) % 10}`,
    blankAnswer: String(Math.floor(answer.at(-1) / 10)),
    explain: {
      why: [`나뉠 수는 ${d} × (몫)이고, 몫은 10부터 19까지 될 수 있어요.`, `${d} × 10 = ${d * 10}부터 ${d} × ${answer.length + 9} = ${answer.at(-1)}까지가 두 자리 수예요.`, `그래서 ${answer.join(', ')}${jo(answer.at(-1), '이에요', '예요')}.`],
      alt: [`${d}단을 이어 세어 ${d * 10}부터 99까지 찾아도 돼요.`, `어느 길로 해도 답은 ${answer.join(', ')}${roOnly(answer.at(-1))} 같아요.`],
    },
  };
}

const T14_2 = {
  id: 'T14-2',
  node: 'N14',
  title: '1호선 칸과 역',
  repr: '문장',
  minLevel: 1,
  maxLevel: 6,
  generate(rng, level) {
    if (level === 1) return t142Level1(rng.int(10, 12));
    if (level === 2) {
      const [k, q] = draw(rng, () => [rng.int(2, 4), rng.int(12, 33)], ([kk, qq]) => kk * qq <= 99 && qq % 10 !== 0 && Math.floor((kk * qq) / 10) % kk !== 0, [4, 21]);
      return t142Level2(k, q);
    }
    if (level === 3) {
      // 하루 5역·8역은 8 − 5 = 3이 답(며칠 빨리)과 우연히 같아서 뺀다(4역·10역도 같은 까닭으로 뺀다).
      const [a, b] = rng.pick([
        [4, 5],
        [4, 8],
        [5, 10],
        [8, 10],
      ]);
      return t142Level3(a, b);
    }
    if (level === 4) {
      const [r, w, p] = draw(rng, () => [rng.int(2, 6), rng.int(2, 6), rng.int(12, 40)], ([rr, ww, pp]) => rr !== ww && (ww * pp) % rr === 0 && ww * pp <= 99 && (ww * pp) / rr >= 10 && ![rr, ww, pp].includes((ww * pp) / rr), [4, 3, 24]);
      return t142Level4(r, w, p);
    }
    if (level === 5) {
      const [u, d, ans] = draw(
        rng,
        () => {
          const dd = rng.pick([3, 4, 6, 7, 8]);
          const uu = rng.int(0, 9);
          const a = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((t) => (10 * t + uu) % dd === 0);
          return [uu, dd, a];
        },
        ([, , a]) => a.length >= 2 && a.length <= 5,
        [6, 4, [1, 3, 5, 7, 9]],
      );
      return t142Level5(u, d, ans);
    }
    return t142Level6(rng.pick([6, 7, 8]));
  },
};

// ── T14-3 수 모형 나누기 (그림) — 1~3단계, 09 보강 후보 ──
/** 1단계: 바꿀 필요 없음 */
function t143Level1(N, d) {
  const q = N / d;
  const T = Math.floor(N / 10);
  const U = N % 10;
  return {
    text: [n(N), jo(N, '을', '를'), ' 수 모형으로 나타냈어요. ', n(d), '명이 똑같이 나누어 가지면 한 사람에게 얼마씩이에요?'],
    figure: { kind: 'base10', tens: T, ones: U },
    input: { kind: 'number' },
    answer: q,
    discriminators: uniq([{ value: N * d, category: '식', kind: 'check', feedback: '나누면 커질까요?' }, { value: T / d, category: '개념', kind: 'check', feedback: '일 모형도 나눴나요?' }].filter((x) => Number.isInteger(x.value)), q),
    hints: [`수 모형은 십 모형 ${T}개, 일 모형 ${U}개예요. ${d}명이 똑같이 가질 때 한 사람 몫을 물어요.`, '십 모형부터 한 사람에게 똑같이 나눠 줘 볼까요? 그다음 일 모형도 나눠 줘요.', `한 사람에게 십 모형 ${T / d}개씩이에요.`, `한 사람에게 일 모형 ☐개`],
    blank: '일 모형 ☐개',
    blankAnswer: String(U / d),
    blankThen: '한 사람에게 얼마씩이에요?',
    explain: {
      why: [`십 모형 ${T}개를 ${d}명이 나누면 ${T / d}개씩, 일 모형 ${U}개를 나누면 ${U / d}개씩이에요.`, `한 사람에게 ${T / d * 10} + ${U / d} = ${ieyo(q)}.`, `그래서 ${N} ÷ ${d} = ${ieyo(q)}.`],
      alt: [`${d} × ${q} = ${N}${roOnly(N)} 확인해요.`, `어느 길로 해도 답은 ${ro(q)} 같아요.`],
    },
  };
}

/** 2·3단계: 남은 십 모형을 일 모형으로 바꿔 나누기 */
function t143Level23(N, d) {
  const q = N / d;
  const T = Math.floor(N / 10);
  const U = N % 10;
  const left = T % d;
  const answer = { change: left, q };
  const discs = uniqK(
    [
      { key: 'q', value: dropTens(N, d), category: '개념', kind: 'nudge', feedbackCheck: '남은 십 모형을 다시 볼까요?', feedback: '남은 십 모형은 일 모형 10개로 바꿔 볼까요?' },
      { key: 'change', value: 0, category: '개념', kind: 'check', feedback: '십 모형이 남지 않나요?' },
      { key: 'q', value: swapQ(q), category: '계산', kind: 'check', feedback: `몫에 ${eul(d)} 곱하면 ${N}${jo(N, '이', '가')} 되나요?` },
    ],
    answer,
  );
  return {
    text: [n(N), jo(N, '을', '를'), ' 수 모형으로 나타냈어요. ', n(d), '명이 똑같이 나누어 가져요. 일 모형으로 바꿔야 하는 십 모형은 몇 개이고, 한 사람에게 얼마씩이에요?'],
    figure: { kind: 'base10', tens: T, ones: U },
    input: { kind: 'compound', fields: [{ key: 'change', label: '바꾸는 십 모형' }, { key: 'q', label: '한 사람 몫' }] },
    answer,
    discriminators: discs,
    hints: [`수 모형은 십 모형 ${T}개, 일 모형 ${U}개예요. ${d}명이 똑같이 가질 때 바꿔야 하는 십 모형 수와 한 사람 몫을 물어요.`, '십 모형부터 똑같이 나눠 줘 볼까요? 남은 십 모형은 일 모형 10개로 바꿔서 나눠요.', `십 모형은 한 사람에게 ${Math.floor(T / d)}개씩 나눠 줄 수 있어요.`, '남은 십 모형을 바꾼 일 모형까지 나누면 한 사람에게 일 모형 ☐개'],
    blank: '한 사람에게 ☐개',
    blankAnswer: String((left * 10 + U) / d),
    blankThen: '두 칸을 채워요.',
    explain: {
      why: [`십 모형 ${T}개를 ${d}명이 나누면 ${Math.floor(T / d)}개씩이고 ${left}개가 남아요.`, `남은 ${left}개를 일 모형 ${left * 10}개로 바꾸면 일 모형은 ${left * 10 + U}개, 한 사람에게 ${(left * 10 + U) / d}개씩이에요.`, `그래서 십 모형 ${left}개를 바꾸고, 한 사람에게 ${ieyo(q)}.`],
      alt: [`${d} × ${q} = ${N}${roOnly(N)} 확인해요.`, `어느 길로 해도 몫은 ${ro(q)} 같아요.`],
    },
  };
}

const T14_3 = {
  id: 'T14-3',
  node: 'N14',
  title: '수 모형 나누기',
  repr: '그림',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const [N, d] = draw(
      rng,
      () => {
        const dd = rng.int(2, level === 1 ? 4 : 6);
        return [dd * rng.int(11, 39), dd];
      },
      ([NN, dd]) => {
        const T = Math.floor(NN / 10);
        const U = NN % 10;
        const q = NN / dd;
        if (NN > 99 || q === dd || q % 10 === 0) return false;
        if (level === 1) return T % dd === 0 && U % dd === 0 && U > 0;
        if (level === 2) return T % dd === 1;
        return T % dd >= 2;
      },
      level === 1 ? [48, 4] : level === 2 ? [52, 4] : [75, 5],
    );
    return level === 1 ? t143Level1(N, d) : t143Level23(N, d);
  },
};

// ── 급행 통과 진단 ──
const D1 = {
  id: 'N14-D1',
  node: 'N14',
  title: '급행 진단: 72 ÷ 4',
  repr: '식',
  minLevel: 2,
  maxLevel: 2,
  diagnostic: true,
  generate() {
    return { ...buildDiv(72, 4, 18), hints: [], blank: null };
  },
};
const D2 = {
  id: 'N14-D2',
  node: 'N14',
  title: '급행 진단: 40역 탐방',
  repr: '문장',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...t142Level3(4, 5), hints: [], blank: null };
  },
};
const D3 = {
  id: 'N14-D3',
  node: 'N14',
  title: '급행 진단(예비): 잘못 나눈 사진',
  repr: '문장',
  minLevel: 4,
  maxLevel: 4,
  diagnostic: true,
  generate() {
    return { ...t142Level4(4, 3, 24), hints: [], blank: null };
  },
};

export default [T14_1, T14_2, T14_3, D1, D2, D3];
