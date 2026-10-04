// N02 다대포항 — 세 자리 수의 뺄셈(받아내림 한 번) [4수01-03]. 천장 6.
// 기준: docs/curriculum/07-line1-templates.md 2절. T2-3(도전, 5~6단계)은 N01처럼 T2-2의 5~6단계로 합쳤다.
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

/** 첫 받아내림을 설명하는 문장(힌트 ③) */
function firstStep(a, b) {
  const pos = borrowPos(a, b);
  const au = a % 10;
  const bu = b % 10;
  const at = Math.floor(a / 10) % 10;
  const bt = Math.floor(b / 10) % 10;
  if (pos.includes(0)) return `일의 자리 ${au}에서 ${eul(bu)} 뺄 수 없어서 십의 자리에서 10을 빌려 와요.`;
  if (pos.includes(1)) return `일의 자리는 ${au} − ${bu} = ${ieyo(au - bu)}. 십의 자리 ${at}에서 ${eul(bt)} 뺄 수 없어서 백의 자리에서 빌려 와요.`;
  return `일의 자리는 ${au} − ${bu} = ${ieyo(au - bu)}.`;
}
function subDiscs(a, b) {
  const d = a - b;
  const pos = borrowPos(a, b);
  const au = a % 10;
  const bu = b % 10;
  const at = Math.floor(a / 10) % 10;
  const bt = Math.floor(b / 10) % 10;
  const where = pos.includes(0) ? `일의 자리 ${au}에서 ${eul(bu)} 뺄 수 있나요?` : `십의 자리 ${at}에서 ${eul(bt)} 뺄 수 있나요?`;
  return uniq(
    [
      { value: absDigits(a, b), category: '개념', kind: 'check', feedback: where },
      { value: d + 10, category: '계산', kind: 'nudge', feedbackCheck: '빌려 준 자리를 다시 볼까요?', feedback: '빌려 준 자리는 1 줄었나요?' },
      { value: d + 100, category: '계산', kind: 'nudge', feedbackCheck: '빌려 준 자리를 다시 볼까요?', feedback: '빌려 준 자리는 1 줄었나요?' },
      { value: a + b, category: '식', kind: 'nudge', feedbackCheck: '답을 처음 수와 견주어 볼까요?', feedback: '빼기 문제예요. 답이 커질까요?' },
    ].filter((x) => pos.length > 0 || x.value === a + b),
    d,
  );
}

/** T2-1 정비창 점검 (식) — 1~3단계 */
const T2_1 = {
  id: 'T2-1',
  node: 'N02',
  title: '정비창 점검: 세 자리 뺄셈',
  repr: '식',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const want = level === 1 ? 0 : 1;
    const [a, b] = draw(
      rng,
      () => {
        const x = rng.int(300, 989);
        return [x, rng.int(100, x - 100)];
      },
      ([x, y]) => {
        const d = x - y;
        const pos = borrowPos(x, y);
        if (pos.length !== want || d === y || d < 100) return false;
        if (want === 1 && absDigits(x, y) === d) return false;
        if (level === 3 && !pos.includes(0)) return false; // 3단계는 일의 자리 받아내림으로 고정
        return true;
      },
      level === 1 ? [586, 243] : [432, 127],
    );
    const d = a - b;
    return build(a, b, d, level);
  },
};

function build(a, b, d, level) {
  const bl = blankAt(d, 1);
  const explainWhy = borrowPos(a, b).length
    ? [firstStep(a, b), '빌려 준 자리는 1 줄어든 수로 계산해요.', `그래서 ${a} − ${b} = ${ieyo(d)}.`]
    : ['같은 자리끼리 빼요.', '어느 자리도 빌려 올 필요가 없어요.', `그래서 ${a} − ${b} = ${ieyo(d)}.`];
  const alt = [`${b}에서 ${a}까지 더해서 세어도 돼요.`, `${b} + ${d} = ${ieyo(a)}.`, `어느 길로 해도 답은 ${ro(d)} 같아요.`];
  if (level < 3) {
    return {
      text: [n(a), ' − ', n(b), ' = ?'],
      figure: { kind: 'vertical', op: '−', a, b },
      input: { kind: 'number' },
      answer: d,
      discriminators: subDiscs(a, b),
      hints: [`${a} − ${b}의 값을 구해요.`, '자리를 맞춰 세로로 써 봐요. 일의 자리부터 차례로 해요.', firstStep(a, b), `${a} − ${b} = ${bl.blank}`],
      blank: bl.blank,
      blankAnswer: bl.blankAnswer,
      explain: { why: explainWhy, alt },
    };
  }
  // 3단계: 뺄셈 + 덧셈 검산식(equation)
  const wrongs = [absDigits(a, b), d + 10, d + 100].filter((v) => v !== d);
  return {
    text: [n(a), ' − ', n(b), '의 답을 구해서, 그 답에 ', n(b), jo(b, '을', '를'), ' 더하는 덧셈식으로 써요.'],
    figure: { kind: 'vertical', op: '−', a, b },
    input: { kind: 'equation' },
    answer: { left: d, op: '+', right: b, result: a, commutative: true },
    discriminators: [
      { match: (r) => Number(r?.left) === wrongs[0] || Number(r?.right) === wrongs[0], category: '개념', kind: 'check', feedback: '작은 숫자에서 큰 숫자를 뺄 수 있나요?' },
      { match: (r) => wrongs.slice(1).includes(Number(r?.left)) || wrongs.slice(1).includes(Number(r?.right)), category: '계산', kind: 'nudge', feedbackCheck: '빌려 준 자리를 다시 볼까요?', feedback: '빌려 준 자리는 1 줄었나요?' },
    ],
    hints: [
      `${a} − ${b}의 답과, 그 답이 맞는지 확인하는 덧셈식을 물어요.`,
      '먼저 세로로 빼요. 그 답에 빼는 수를 더하면 처음 수가 나와야 해요.',
      firstStep(a, b),
      `${bl.blank} + ${b} = ${a}`,
    ],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [...explainWhy.slice(0, -1), `${a} − ${b} = ${ieyo(d)}.`, `${d} + ${b} = ${a}${jo(a, '이', '가')} 되니 맞게 뺀 거예요.`, `그래서 덧셈식은 ${d} + ${b} = ${ieyo(a)}.`],
      alt: [`${b} + ${d}처럼 순서를 바꿔 써도 돼요.`, `어느 길로 해도 답은 ${ro(d)} 같아요.`],
    },
  };
}

/** T2-2 내리고 남은 사람 (문장 + 그림) — 1~6단계(5~6단계는 07의 T2-3 도전 문제) */
function t22Level1(a, b) {
  const d = a - b;
  const bl = blankAt(d, 1);
  return {
    text: ['열차에 ', V(a), '명이 타 있었어요. 다대포항역에서 ', V(b), '명이 내렸어요. 열차에 남은 사람은 몇 명이에요?'],
    figure: { kind: 'train', cars: 8 },
    input: { kind: 'number', unit: '명' },
    answer: d,
    discriminators: uniq([{ value: a + b, category: '식', kind: 'check', feedback: '남은 사람이 처음보다 많을까요?' }], d),
    hints: [`열차에 ${a}명이 타 있었고, 다대포항역에서 ${b}명이 내렸어요. 열차에 남은 사람 수를 물어요.`, '내린 사람은 열차에서 빠져요. 자리를 맞춰 세로로 써 봐요.', firstStep(a, b), `${a} − ${b} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: { why: ['내린 사람만큼 열차 안 사람이 줄어요.', `${a} − ${b} = ${ieyo(d)}.`, `그래서 남은 사람은 ${d}명이에요.`], alt: [`${b}에서 ${a}까지 더해서 세면 ${ieyo(d)}.`, `어느 길로 해도 답은 ${ro(d)} 같아요.`] },
  };
}

function t22Level2(am, pm) {
  const big = Math.max(am, pm);
  const small = Math.min(am, pm);
  const d = big - small;
  const when = am > pm ? '오전' : '오후';
  const other = when === '오전' ? '오후' : '오전';
  const bl = blankAt(d, 1);
  return {
    text: ['다대포항역에서 오전에 ', V(am), '명, 오후에 ', V(pm), '명이 탔어요. 언제 몇 명 더 많이 탔어요?'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'when', label: '언제', options: ['오전', '오후'] }, { key: 'diff', label: '몇 명 더' }] },
    answer: { when, diff: d },
    discriminators: [
      { key: 'when', value: other, category: '읽기', kind: 'check', feedback: `${wa(am)} ${pm} 중 어느 쪽이 커요?` },
      { key: 'diff', value: absDigits(big, small), category: '개념', kind: 'check', feedback: '작은 숫자에서 큰 숫자를 뺄 수 있나요?' },
      { key: 'diff', value: am + pm, category: '식', kind: 'check', feedback: '몇 명 더 많은지 물었어요. 모두 몇 명일까요?' },
    ].filter((x) => x.value !== d),
    hints: [`오전에 ${am}명, 오후에 ${pm}명이 탔어요. 어느 때가 몇 명 더 많은지 물어요.`, '먼저 어느 쪽이 큰지 봐요. 큰 수에서 작은 수를 빼면 차이가 나와요.', firstStep(big, small), `${big} − ${small} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${eun(big)} ${small}보다 커서 ${when}에 더 많이 탔어요.`, `${big} − ${small} = ${ieyo(d)}.`, `그래서 ${when}에 ${d}명 더 많이 탔어요.`],
      alt: [`${small}에서 ${big}까지 더해서 세도 ${ieyo(d)}.`, `어느 길로 해도 답은 ${ro(d)} 같아요.`],
    },
  };
}

function t22Level3(all, empty) {
  const d = all - empty;
  const bl = blankAt(d, 1);
  return {
    text: ['열차에 ', V(all), '명이 타 있었어요. 그중 ', V(empty), '명이 서 있었어요. 앉아 있던 사람은 몇 명이에요?'],
    figure: null,
    input: { kind: 'number', unit: '명' },
    answer: d,
    discriminators: uniq(
      [
        { value: all + empty, category: '식', kind: 'check', feedback: '앉은 사람이 탄 사람보다 많을까요?' },
        { value: empty, category: '읽기', kind: 'check', feedback: `${eun(empty)} 서 있던 사람이에요. 무엇을 물었죠?` },
        { value: absDigits(all, empty), category: '개념', kind: 'check', feedback: `일의 자리 ${all % 10}에서 ${eul(empty % 10)} 뺄 수 있나요?` },
        { value: d + 10, category: '계산', kind: 'nudge', feedbackCheck: '빌려 준 자리를 다시 볼까요?', feedback: '빌려 준 자리는 1 줄었나요?' },
      ],
      d,
    ),
    hints: [
      `열차에 ${all}명이 타 있었고, 그중 ${empty}명이 서 있었어요. 앉아 있던 사람 수를 물어요.`,
      '탄 사람 전체를 서 있던 사람과 앉아 있던 사람으로 나눠 띠를 그려 봐요.',
      `앉은 사람은 ${all} − ${ieyo(empty)}. 일의 자리 ${all % 10}에서 ${eun(empty % 10)} 뺄 수 없어요.`,
      `${all} − ${empty} = ${bl.blank}`,
    ],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: ['탄 사람 전체에서 서 있던 사람을 빼면 앉아 있던 사람이에요.', firstStep(all, empty), `${all} − ${empty} = ${ieyo(d)}.`, `그래서 앉아 있던 사람은 ${d}명이에요.`],
      alt: [`${empty}에서 ${all}까지 더해서 세요.`, `${empty} + ${d} = ${ieyo(all)}.`, `어느 길로 해도 답은 ${ro(d)} 같아요.`],
    },
  };
}

function t22Level4(off, left) {
  const s = off + left;
  const bl = blankAt(s, 1);
  const minus = Math.abs(left - off);
  return {
    text: ['열차에 몇 명이 타 있었는데, 다대포항역에서 ', V(off), '명이 내려서 ', V(left), '명이 남았어요. 처음에 타 있던 사람은 몇 명이에요?'],
    figure: { kind: 'train', cars: 8 },
    input: { kind: 'number', unit: '명' },
    answer: s,
    discriminators: uniq(
      [
        { value: minus, category: '식', kind: 'nudge', feedbackCheck: '구한 수로 문제를 다시 따라가 볼까요?', feedback: '처음에는 지금보다 많았을까요, 적었을까요?' },
        { value: s - 10, category: '계산', kind: 'nudge', feedbackCheck: '십의 자리를 다시 계산해 볼까요?', feedback: '받아올린 1을 더했나요?' },
        { value: s - 100, category: '계산', kind: 'nudge', feedbackCheck: '백의 자리를 다시 계산해 볼까요?', feedback: '받아올린 1을 더했나요?' },
      ],
      s,
    ),
    hints: [
      `다대포항역에서 ${off}명이 내린 뒤 ${left}명이 남았어요. 내리기 전에 타 있던 사람 수를 물어요.`,
      '처음 사람 수는 내린 사람과 남은 사람으로 나뉘어요. 그림에 두 부분을 표시해 봐요.',
      `일의 자리는 ${left % 10} + ${off % 10} = ${ieyo((left % 10) + (off % 10))}.`,
      `${left} + ${off} = ${bl.blank}`,
    ],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: ['처음 사람은 내린 사람과 남은 사람을 합친 수예요.', `${left} + ${off} = ${ieyo(s)}.`, `그래서 처음에 ${s}명이 타 있었어요.`],
      alt: [`확인해 봐요: ${s} − ${off} = ${ieyo(left)}.`, `어느 길로 해도 답은 ${ro(s)} 같아요.`],
    },
  };
}

function t22Level5(h, k, u, b, T) {
  const answer = Array.from({ length: k + 1 }, (_, i) => i);
  const discs = [
    { value: answer.slice(0, -1), category: '개념', kind: 'nudge', feedbackCheck: '빠진 것이 없나요?', feedback: `${h}${k}${u} − ${b}도 계산해 봤나요?` },
    { value: [...answer, k + 1], category: '개념', kind: 'check', feedback: `${h}${k + 1}${u} − ${b}도 계산해 봤나요?` },
  ];
  return {
    text: [unknown(`${h}□${u}`), ' − ', n(b), jo(b, '이', '가'), ' ', n(T), '보다 작아요. □에 들어갈 수 있는 수를 모두 골라요.'],
    figure: null,
    challenge: true,
    input: { kind: 'multi', options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
    answer,
    discriminators: discs,
    grade: multiGrade(answer, discs),
    hints: [
      `${h}□${u}에서 ${b}의 차가 ${T}보다 작게 되는 □를 모두 찾아요.`,
      '□에 0부터 차례로 넣어 볼까요? 조건이 바뀌는 곳을 찾아봐요.',
      `${T} + ${b} = ${T + b}이니, ${h}□${u}${jo(u, '은', '는')} ${T + b}보다 작아야 해요.`,
      `들어갈 수 있는 수: 0부터 ☐까지`,
    ],
    blank: '0부터 ☐까지',
    blankAnswer: String(k),
    explain: {
      why: [
        `□가 ${k}이면 ${h}${k}${u} − ${b} = ${ro((h * 100 + k * 10 + u) - b)} ${T}보다 작아요.`,
        `□가 ${k + 1}이면 ${h}${k + 1}${u} − ${b} = ${ro((h * 100 + (k + 1) * 10 + u) - b)} ${T}보다 커요.`,
        `그래서 들어갈 수 있는 수는 0부터 ${k}까지예요.`,
      ],
      alt: [`${T} + ${b} = ${T + b}보다 작은 ${h}□${u}${jo(u, '을', '를')} 찾아도 돼요.`, `어느 길로 해도 답은 0부터 ${k}까지로 같아요.`],
    },
  };
}

/** 카드 6장으로 만든 세 자리 수 두 개의 가장 작은 차 */
function minDiff(cards) {
  let best = Infinity;
  let pair = null;
  const perm = (arr, cur) => {
    if (cur.length === 6) {
      if (cur[0] === 0 || cur[3] === 0) return;
      const x = cur[0] * 100 + cur[1] * 10 + cur[2];
      const y = cur[3] * 100 + cur[4] * 10 + cur[5];
      if (x > y && x - y < best) {
        best = x - y;
        pair = [x, y];
      }
      return;
    }
    for (let i = 0; i < arr.length; i++) perm([...arr.slice(0, i), ...arr.slice(i + 1)], [...cur, arr[i]]);
  };
  perm(cards, []);
  return { best, pair };
}
/** 흔한 실수: 백의 자리는 맞게 골랐지만 큰 수 뒤에 큰 숫자, 작은 수 뒤에 작은 숫자를 둠 */
function greedyWrong(cards, pair) {
  const [x, y] = pair;
  const hx = Math.floor(x / 100);
  const hy = Math.floor(y / 100);
  const rest = cards.filter((c) => c !== hx && c !== hy).sort((p, q) => q - p);
  // 큰 수 뒤에 큰 숫자, 작은 수 뒤에 작은 숫자
  const bx = hx * 100 + rest[0] * 10 + rest[1];
  const by = hy * 100 + rest[2] * 10 + rest[3];
  return bx - by;
}

function t22Level6(cards) {
  const { best, pair } = minDiff(cards);
  const wrong = greedyWrong(cards, pair);
  const [x, y] = pair;
  const text = ['숫자 카드 '];
  cards.forEach((c, i) => {
    text.push(n(c));
    text.push(i < cards.length - 1 ? ', ' : jo(c, '을', '를'));
  });
  text.push(' 한 번씩 써서 세 자리 수 두 개를 만들어요. 두 수의 차가 가장 작을 때 차는 얼마예요?');
  const bl = blankAt(y, 2);
  return {
    text,
    figure: { kind: 'cards', cards },
    challenge: true,
    input: { kind: 'number' },
    answer: best,
    discriminators: uniq([{ value: wrong, category: '개념', kind: 'nudge', feedbackCheck: '다른 수도 만들어 견주어 볼까요?', feedback: '큰 수 뒤에는 어떤 숫자를 둘까요?' }], best),
    hints: [
      '카드 여섯 장으로 세 자리 수 두 개를 만들어요. 두 수의 차이가 가장 작을 때를 물어요.',
      '백의 자리 숫자의 차이를 가장 작게 해 볼까요? 그다음 큰 수는 작게, 작은 수는 크게 만들어요.',
      `백의 자리에 ${wa(Math.floor(x / 100))} ${eul(Math.floor(y / 100))} 두면 좋아요.`,
      `${x} − ${bl.blank}`,
    ],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: ['백의 자리 숫자가 차에 가장 크게 영향을 줘요.', `백의 자리를 ${wa(Math.floor(x / 100))} ${ro(Math.floor(y / 100))} 두고, 큰 수는 작게, 작은 수는 크게 만들어요.`, `${x} − ${y} = ${ieyo(best)}.`, `그래서 가장 작은 차는 ${ieyo(best)}.`],
      alt: ['다른 짝도 몇 개 계산해서 견주어 봐요.', `어느 길로 해도 답은 ${ro(best)} 같아요.`],
    },
  };
}

const T2_2 = {
  id: 'T2-2',
  node: 'N02',
  title: '내리고 남은 사람',
  repr: '문장',
  minLevel: 1,
  maxLevel: 6,
  generate(rng, level) {
    if (level === 1) {
      const [a, b] = draw(
        rng,
        () => [rng.int(250, 499), rng.int(110, 240)],
        ([x, y]) => borrowPos(x, y).length === 0 && x - y !== y && x - y >= 100 && (x - y) % 10 !== 0,
        [375, 152],
      );
      return t22Level1(a, b);
    }
    if (level === 2) {
      const [am, pm] = draw(
        rng,
        () => [rng.int(210, 590), rng.int(210, 590)],
        ([x, y]) => {
          const big = Math.max(x, y);
          const small = Math.min(x, y);
          const d = big - small;
          return borrowPos(big, small).length === 1 && d >= 30 && d !== small && absDigits(big, small) !== d && d !== x && d !== y;
        },
        [452, 318],
      );
      return t22Level2(am, pm);
    }
    if (level === 3) {
      const [all, empty] = draw(
        rng,
        () => [rng.int(380, 470), rng.int(103, 199)],
        ([x, y]) => {
          const pos = borrowPos(x, y);
          return pos.length === 1 && pos[0] === 0 && x - y !== y && x % 10 !== 0;
        },
        [432, 127],
      );
      return t22Level3(all, empty);
    }
    if (level === 4) {
      const [off, left] = draw(
        rng,
        () => [rng.int(120, 290), rng.int(210, 420)],
        ([o, l]) => o !== l && o + l <= 999 && carries(o, l) >= 1 && o + l !== o * 2,
        [186, 329],
      );
      return t22Level4(off, left);
    }
    if (level === 5) {
      const [h, k, u, b, T] = draw(
        rng,
        () => {
          const hh = rng.int(6, 8);
          const kk = rng.int(2, 7);
          const uu = rng.int(0, 7);
          const dd = rng.int(1, 9 - uu);
          const TT = rng.pick([300, 400]);
          return [hh, kk, uu, hh * 100 - TT + kk * 10 + uu + dd, TT];
        },
        ([hh, kk, uu, bb, TT]) => bb >= 100 && bb <= 599 && hh * 100 + kk * 10 + uu - bb < TT && hh * 100 + (kk + 1) * 10 + uu - bb >= TT,
        [7, 5, 2, 358, 400],
      );
      return t22Level5(h, k, u, b, T);
    }
    const cards = draw(
      rng,
      () => rng.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 6),
      (cs) => {
        const { best } = minDiff(cs);
        return !cs.includes(best) && best >= 2;
      },
      [2, 5, 7, 1, 4, 9],
    );
    return t22Level6(cards);
  },
};

/** 급행 통과 진단 */
const D1 = {
  id: 'N02-D1',
  node: 'N02',
  title: '급행 진단: 받아내림 한 번',
  repr: '식',
  minLevel: 2,
  maxLevel: 2,
  diagnostic: true,
  generate() {
    return { ...build(352, 127, 225, 2), hints: [], blank: null };
  },
};
const D2 = {
  id: 'N02-D2',
  node: 'N02',
  title: '급행 진단: 앉아 있는 사람',
  repr: '문장',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...t22Level3(432, 127), hints: [], blank: null };
  },
};
const D3 = {
  id: 'N02-D3',
  node: 'N02',
  title: '급행 진단(예비): 처음 사람 수',
  repr: '문장',
  minLevel: 4,
  maxLevel: 4,
  diagnostic: true,
  generate() {
    return { ...t22Level4(186, 329), hints: [], blank: null };
  },
};

// ── T2-4 받아내림 세로식 칸 채우기 (빈칸) — 09-templates-additions.md 2절 ──
function t24(a, b, level) {
  const d = a - b;
  const ah = Math.floor(a / 100);
  const at = Math.floor(a / 10) % 10;
  const au = a % 10;
  const bh = Math.floor(b / 100);
  const bt = Math.floor(b / 10) % 10;
  const bu = b % 10;
  const dh = Math.floor(d / 100);
  const dt = Math.floor(d / 10) % 10;
  const du = d % 10;
  const tensBorrow = level === 3;
  const from = tensBorrow ? ah : at; // 빌려 준 자리의 원래 숫자
  const fromName = tensBorrow ? '백의 자리' : '십의 자리';
  const toName = tensBorrow ? '십의 자리' : '일의 자리';
  const top = tensBorrow ? 10 + at : 10 + au; // 받아내린 뒤의 수
  const sub = tensBorrow ? bt : bu;
  const part = top - sub;
  const fields = [
    { key: 'changed', label: `${fromName} ${from}${jo(from, '이', '가')} 바뀐 수` },
    { key: 'part', label: `${toName} ${top} − ${sub}` },
    { key: 'answer', label: '답' },
  ];
  const discs = uniq(
    [
      { key: 'changed', value: from, category: '개념', kind: 'nudge', feedbackCheck: '빌려 준 자리를 다시 볼까요?', feedback: '빌려 준 자리는 1 줄었나요?' },
      { key: 'answer', value: tensBorrow ? d + 100 : d + 10, category: '계산', kind: 'nudge', feedbackCheck: '빌려 준 자리를 다시 볼까요?', feedback: '빌려 준 자리는 1 줄었나요?' },
      { key: 'answer', value: absDigits(a, b), category: '개념', kind: 'check', feedback: `${toName} ${tensBorrow ? at : au}에서 ${eul(sub)} 뺄 수 있나요?` },
      { key: 'answer', value: a + b, category: '식', kind: 'check', feedback: '남은 사람이 처음보다 많을까요?' },
    ],
    null,
  ).filter((x) => x.value !== (x.key === 'changed' ? from - 1 : d));
  const why = tensBorrow
    ? [
        `일의 자리는 ${au} − ${bu} = ${ieyo(du)}.`,
        `십의 자리 ${at}에서 ${eul(bt)} 못 빼서 백의 자리 ${ah}에서 10을 빌려 와요.`,
        `백의 자리는 ${ah - 1}, 십의 자리는 ${ieyo(top)}.`,
        `${top} − ${bt} = ${dt}, ${ah - 1} − ${bh} = ${eul(dh)} 써서 ${ieyo(d)}.`,
        `그래서 남은 사람은 ${d}명이에요.`,
      ]
    : [
        `일의 자리 ${au}에서 ${eul(bu)} 못 빼서 십의 자리 ${at}에서 10을 빌려 와요.`,
        `십의 자리는 ${at - 1}, 일의 자리는 ${ieyo(top)}.`,
        `${top} − ${bu} = ${du}, ${at - 1} − ${bt} = ${dt}, ${ah} − ${bh} = ${dh}${jo(dh, '이라', '라')} ${ieyo(d)}.`,
        `그래서 남은 사람은 ${d}명이에요.`,
      ];
  return {
    text: ['열차에 ', V(a), '명이 타 있었고, 다대포항역에서 ', V(b), '명이 내렸어요. 남은 사람을 세로식으로 계산하고 있어요. 빈칸을 채워요.'],
    figure: { kind: 'vertical', op: '−', a, b },
    input: { kind: 'compound', fields },
    answer: { changed: from - 1, part, answer: d },
    discriminators: discs,
    hints: [
      `열차에 ${a}명이 있었고 ${b}명이 내렸어요. 남은 사람을 구하는 세로식의 빈칸 세 개를 채워요.`,
      tensBorrow
        ? `일의 자리부터 차례로 볼까요? 십의 자리 ${at}에서 ${eul(bt)} 못 빼면 백의 자리에서 10을 빌려 와요.`
        : `일의 자리 ${au}에서 ${eul(bu)} 뺄 수 있는지 먼저 볼까요? 못 빼면 십의 자리에서 10을 빌려 와요.`,
      `${fromName}에서 10을 빌려 오면 ${toName}는 ${top}${jo(top, '이', '가')} 돼요.`,
      `${fromName} ${from} → ☐`,
    ],
    blank: `${from} → ☐`,
    blankAnswer: String(from - 1),
    blankThen: '나머지 칸도 채워요.',
    explain: {
      why,
      alt: ['답에 빼는 수를 더해 확인해요.', `${d} + ${b} = ${ieyo(a)}.`, '처음 수가 나오니 맞아요.', `두 방법 모두 ${d}명이에요.`],
    },
  };
}

/** T2-4 받아내림 세로식 칸 채우기 (빈칸) — 1~3단계 */
const T2_4 = {
  id: 'T2-4',
  node: 'N02',
  title: '받아내림 세로식 칸 채우기',
  repr: '빈칸',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const [a, b] = draw(
      rng,
      () => [rng.int(311, 989), rng.int(111, 789)],
      ([x, y]) => {
        const xh = Math.floor(x / 100);
        const xt = Math.floor(x / 10) % 10;
        const xu = x % 10;
        const yh = Math.floor(y / 100);
        const yt = Math.floor(y / 10) % 10;
        const yu = y % 10;
        if (yu === 0 || yt === 0 || x - y === y) return false;
        if (level === 3) return xu >= yu && xt >= 1 && xt < yt && xh - 1 > yh;
        if (xu >= yu || xt < 1 || xh <= yh) return false;
        return level === 1 ? xt - 1 === yt : xt - 1 > yt;
      },
      level === 1 ? [432, 127] : level === 2 ? [451, 236] : [528, 163],
    );
    return t24(a, b, level);
  },
};

export default [T2_1, T2_2, T2_4, D1, D2, D3];
