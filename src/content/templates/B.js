// B 정비창 곁가지 — B02 자릿값, B06 두 자리 덧셈·뺄셈, B11 곱셈구구.
// 기준: docs/curriculum/07-line1-templates.md v2 0.1절·0.10절(진단 2문항씩) + 노드마다 1~3단계 맨 계산 연습 하나.
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
    if (!Array.isArray(r) || r.length === 0) return { correct: false, flags: { careless: true }, feedback: '답을 먼저 골라 볼까요?' };
    const got = key(r);
    if (got === want) return { correct: true };
    const d = discs.find((x) => key(x.value) === got);
    return d ? { correct: false, category: d.category, feedback: d.feedback } : { correct: false, category: null, feedback: null };
  };
}


// ── B02 자릿값 ──

/** B02 연습 (식) — 1~3단계 */
const B02_P = {
  id: 'B02-P',
  node: 'B02',
  title: '정비창 연습: 자릿값',
  repr: '식',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level <= 2) {
      const [a, b, c] = draw(
        rng,
        () => [rng.int(1, 9), rng.int(level === 2 ? 0 : 1, 9), rng.int(level === 2 ? 0 : 1, 9)],
        ([x, y, z]) => (level === 1 ? true : (y === 0) !== (z === 0)),
        level === 1 ? [3, 5, 7] : [3, 0, 7],
      );
      return placeValue(a, b, c);
    }
    const big = rng.next() < 0.5;
    const cards = draw(rng, () => rng.shuffle([0, ...rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 2)]), () => true, [4, 0, 9]);
    return cardNumber(cards, big);
  },
};

function placeValue(a, b, c) {
  const v = a * 100 + b * 10 + c;
  const bl = blankAt(v, 1);
  const discs = [];
  if (b === 0) discs.push({ value: a * 10 + c, category: '개념', feedback: '0인 자리도 자리를 지켜요. 몇 자리 수예요?' });
  if (c === 0) discs.push({ value: a * 10 + b, category: '개념', feedback: '0인 자리도 자리를 지켜요. 몇 자리 수예요?' });
  discs.push({ value: a + b + c, category: '개념', feedback: `100이 ${a}개면 얼마일까요?` });
  return {
    text: [n(100), '이 ', n(a), '개, ', n(10), '이 ', n(b), '개, ', n(1), '이 ', n(c), '개인 수는 얼마예요?'],
    figure: { kind: 'placeValue', hundreds: a, tens: b, ones: c },
    input: { kind: 'number' },
    answer: v,
    discriminators: uniq(discs, v),
    hints: [`100이 ${a}개, 10이 ${b}개, 1이 ${c}개인 수를 물어요.`, '자리 칸에 숫자 카드를 놓아 볼까요? 백의 자리, 십의 자리, 일의 자리 순서예요.', `100이 ${a}개면 ${ieyo(a * 100)}.`, bl.blank],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`백의 자리에 ${a}, 십의 자리에 ${b}, 일의 자리에 ${eul(c)} 써요.`, b === 0 || c === 0 ? '0인 자리에도 0을 꼭 써야 자리가 맞아요.' : '자리마다 숫자 하나씩 써요.', `그래서 ${ieyo(v)}.`],
      alt: [`${a * 100} + ${b * 10} + ${c} = ${ieyo(v)}.`, `어느 길로 해도 답은 ${ro(v)} 같아요.`],
    },
  };
}

function cardNumber(cards, big) {
  const nz = cards.filter((x) => x !== 0).sort((x, y) => x - y);
  const v = big ? nz[1] * 100 + nz[0] * 10 : nz[0] * 100 + nz[1];
  const h = Math.floor(v / 100);
  const discs = big
    ? [
        { value: nz[1] * 100 + nz[0], category: '개념', feedback: '0은 어느 자리에 둘까요?' },
        { value: nz[0] * 100 + nz[1] * 10, category: '개념', feedback: '가장 큰 숫자는 어느 자리에 둘까요?' },
        { value: nz[0] * 100 + nz[1], category: '읽기', feedback: '가장 큰 수를 물었어요. 다시 볼까요?' },
      ]
    : [
        { value: nz[0] * 10 + nz[1], category: '개념', feedback: '0이 맨 앞이면 세 자리 수일까요?' },
        { value: nz[0] * 100 + nz[1] * 10, category: '개념', feedback: '0은 어느 자리에 둘까요?' },
        { value: nz[1] * 100 + nz[0] * 10, category: '읽기', feedback: '가장 작은 수를 물었어요. 다시 볼까요?' },
      ];
  const bl = blankAt(v, 1);
  const word = big ? '큰' : '작은';
  return {
    text: ['숫자 카드 ', n(cards[0]), ', ', n(cards[1]), ', ', n(cards[2]), jo(cards[2], '을', '를'), ` 한 번씩 써서 가장 ${word} 세 자리 수를 만들어요.`],
    figure: { kind: 'cards', cards },
    input: { kind: 'number' },
    answer: v,
    discriminators: uniq(discs, v),
    hints: [
      `숫자 카드 ${cards.join(', ')}${fin(cards[2]) === 'c' ? '으로' : '로'} 만들 수 있는 가장 ${word} 세 자리 수를 물어요.`,
      big ? '가장 큰 숫자를 백의 자리에 둬 볼까요? 그다음 큰 숫자는 십의 자리예요.' : '0은 백의 자리에 올 수 없어요. 0이 아닌 가장 작은 숫자를 백의 자리에 둬요.',
      `백의 자리는 ${ieyo(h)}.`,
      bl.blank,
    ],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [big ? '큰 숫자일수록 높은 자리에 둬요.' : '작은 숫자일수록 높은 자리에 두되, 0은 맨 앞에 둘 수 없어요.', `백의 자리 ${h}, 십의 자리 ${Math.floor(v / 10) % 10}, 일의 자리 ${v % 10}이에요.`.replace(/(\d)이에요\.$/, (m, d) => `${d}${jo(Number(d), '이에요', '예요')}.`), `그래서 가장 ${word} 수는 ${ieyo(v)}.`],
      alt: ['만들 수 있는 세 자리 수를 모두 써 보고 견주어도 돼요.', `어느 길로 해도 답은 ${ro(v)} 같아요.`],
    },
  };
}

// ── B06 두 자리 덧셈·뺄셈 ──
function noCarry(a, b) {
  let out = 0;
  for (let x = a, y = b, p = 1; x > 0 || y > 0; x = Math.floor(x / 10), y = Math.floor(y / 10), p *= 10) out += (((x % 10) + (y % 10)) % 10) * p;
  return out;
}

function addSub(a, b, op) {
  const ans = op === '+' ? a + b : a - b;
  const bl = blankAt(ans, 1);
  const au = a % 10;
  const bu = b % 10;
  const discs =
    op === '+'
      ? [
          { value: noCarry(a, b), category: '개념', feedback: '일의 자리 10은 어디로 갔을까요?' },
          { value: ans - 10, category: '계산', feedback: '받아올린 1을 더했나요?' },
        ]
      : [
          { value: absDigits(a, b), category: '개념', feedback: `일의 자리 ${au}에서 ${eul(bu)} 뺄 수 있나요?` },
          { value: ans + 10, category: '계산', feedback: '빌려 준 자리는 1 줄었나요?' },
        ];
  const carry = op === '+' ? au + bu >= 10 : au < bu;
  return {
    text: [n(a), ` ${op === '+' ? '+' : '−'} `, n(b), ' = ?'],
    figure: { kind: 'vertical', op: op === '+' ? '+' : '−', a, b },
    input: { kind: 'number' },
    answer: ans,
    discriminators: carry ? uniq(discs, ans) : [],
    hints: [
      `${a} ${op === '+' ? '+' : '−'} ${b}의 값을 구해요.`,
      '자리를 맞춰 세로로 써 봐요. 일의 자리부터 해요.',
      op === '+' ? `일의 자리는 ${au} + ${bu} = ${ieyo(au + bu)}.` : carry ? `일의 자리 ${au}에서 ${eul(bu)} 뺄 수 없어서 십의 자리에서 10을 빌려 와요.` : `일의 자리는 ${au} − ${bu} = ${ieyo(au - bu)}.`,
      `${a} ${op === '+' ? '+' : '−'} ${b} = ${bl.blank}`,
    ],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [
        op === '+' ? '같은 자리끼리 더해요.' : '같은 자리끼리 빼요.',
        carry ? (op === '+' ? '일의 자리 합이 10이 넘으면 10을 십의 자리로 올려요.' : '일의 자리에서 뺄 수 없으면 십의 자리에서 10을 빌려 와요.') : '올리거나 빌려 올 자리가 없어요.',
        `그래서 ${a} ${op === '+' ? '+' : '−'} ${b} = ${ieyo(ans)}.`,
      ],
      alt: op === '+' ? [`${Math.floor(b / 10) * 10}을 먼저 더하고 ${eul(bu)} 더해도 돼요.`.replace(`${Math.floor(b / 10) * 10}을`, eul(Math.floor(b / 10) * 10)), `어느 길로 해도 답은 ${ro(ans)} 같아요.`] : [`${b}에서 ${a}까지 더해서 세어도 돼요.`, `어느 길로 해도 답은 ${ro(ans)} 같아요.`],
    },
  };
}

/** B06 연습 (식) — 1~3단계 */
const B06_P = {
  id: 'B06-P',
  node: 'B06',
  title: '정비창 연습: 두 자리 덧셈·뺄셈',
  repr: '식',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const op = level === 1 ? rng.pick(['+', '-']) : level === 2 ? '+' : '-';
    const [a, b] = draw(
      rng,
      () => [rng.int(11, 89), rng.int(11, 89)],
      ([x, y]) => {
        if (x === y) return false;
        if (op === '+') {
          const c = (x % 10) + (y % 10) >= 10;
          return x + y <= 99 && (level === 1 ? !c : c) && (x + y) % 10 !== x % 10;
        }
        if (x <= y + 9) return false;
        const br = x % 10 < y % 10;
        return (level === 1 ? !br : br) && x - y !== y;
      },
      level === 2 ? [47, 38] : level === 3 ? [62, 27] : [53, 24],
    );
    return addSub(a, b, op);
  },
};

// ── B11 곱셈구구 ──
function times(a, b) {
  const P = a * b;
  const bl = P >= 10 ? blankAt(P, 1) : { blank: '☐', blankAnswer: String(P) };
  return {
    text: [n(a), ' × ', n(b), ' = ?'],
    figure: null,
    input: { kind: 'number' },
    answer: P,
    discriminators: uniq(
      [
        { value: a * (b - 1), category: '계산', feedback: `${a}단을 차례로 외워 볼까요?` },
        { value: a * (b + 1), category: '계산', feedback: `${a}단을 차례로 외워 볼까요?` },
        { value: (a - 1) * b, category: '계산', feedback: `${b}단과 헷갈렸나요?` },
        { value: (a + 1) * b, category: '계산', feedback: `${b}단과 헷갈렸나요?` },
        { value: a + b, category: '식', feedback: '곱셈이에요. 몇 번 더하는 셈일까요?' },
      ].filter((d) => d.value > 0 && d.value !== a && d.value !== b),
      P,
    ),
    hints: [`${a} × ${b}의 값을 물어요.`, `${a}씩 ${b}묶음이에요. ${a}단을 떠올려 봐요.`, `${a} × ${b - 1} = ${ieyo(a * (b - 1))}.`, `${a} × ${b} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${a} × ${b - 1} = ${a * (b - 1)}에 ${eul(a)} 하나 더하면 돼요.`, `${a * (b - 1)} + ${a} = ${ieyo(P)}.`, `그래서 ${a} × ${b} = ${ieyo(P)}.`],
      alt: [`${b} × ${a}${fin(a) === 'c' ? '으로' : '로'} 생각해도 ${ieyo(P)}.`, `어느 길로 해도 답은 ${ro(P)} 같아요.`],
    },
  };
}

/** B11 연습 (식) — 1~3단계 */
const B11_P = {
  id: 'B11-P',
  node: 'B11',
  title: '정비창 연습: 곱셈구구',
  repr: '식',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const dans = level === 1 ? [2, 5] : level === 2 ? [3, 4, 6] : [7, 8, 9];
    const a = rng.pick(dans);
    const b = draw(rng, () => rng.int(2, 9), (x) => x !== a || level === 3, 7);
    return times(a, b);
  },
};

// ── 정비창 진단(07 0.10절): 노드마다 2문항, 직접 입력만 ──
const diag = (id, node, title, make) => ({ id, node, title, repr: '식', minLevel: 2, maxLevel: 2, diagnostic: true, generate: () => ({ ...make(), hints: [], blank: null }) });

const B02_D1 = diag('B02-D1', 'B02', '정비창 진단: 0이 있는 자릿값', () => {
  const p = placeValue(3, 0, 7);
  return { ...p, discriminators: [{ value: 37, category: '개념', feedback: '0인 자리도 자리를 지켜요. 몇 자리 수예요?' }] };
});
const B02_D2 = diag('B02-D2', 'B02', '정비창 진단: 가장 큰 세 자리 수', () => cardNumber([4, 0, 9], true));
const B06_D1 = diag('B06-D1', 'B06', '정비창 진단: 두 자리 덧셈', () => {
  const p = addSub(47, 38, '+');
  return { ...p, discriminators: [{ value: 75, category: '개념', feedback: '일의 자리 10은 어디로 갔을까요?' }, { value: 715, category: '개념', feedback: '한 자리에 숫자가 둘 들어갔나요?' }] };
});
const B06_D2 = diag('B06-D2', 'B06', '정비창 진단: 두 자리 뺄셈', () => {
  const p = addSub(62, 27, '-');
  return { ...p, discriminators: [{ value: 45, category: '개념', feedback: '일의 자리 2에서 7을 뺄 수 있나요?' }, { value: 89, category: '식', feedback: '빼기 문제예요. 답이 커질까요?' }] };
});
const B11_D1 = diag('B11-D1', 'B11', '정비창 진단: 곱셈구구', () => {
  const p = times(7, 8);
  return { ...p, discriminators: [{ value: 54, category: '계산', feedback: '7단을 차례로 외워 볼까요?' }, { value: 48, category: '계산', feedback: '7단을 차례로 외워 볼까요?' }, { value: 15, category: '식', feedback: '곱셈이에요. 몇 번 더하는 셈일까요?' }] };
});
const B11_D2 = diag('B11-D2', 'B11', '정비창 진단: 그림으로 곱셈', () => ({
  text: ['그림처럼 한 줄에 ', V(6), '명씩 ', V(4), '줄로 섰어요. 모두 몇 명이에요?'],
  figure: { kind: 'groups', items: 24, groupSize: 6, rows: 4 },
  input: { kind: 'number', unit: '명' },
  answer: 24,
  discriminators: [
    { value: 18, category: '계산', feedback: '6씩 몇 줄인지 다시 세어 볼까요?' },
    { value: 30, category: '계산', feedback: '6씩 몇 줄인지 다시 세어 볼까요?' },
    { value: 10, category: '식', feedback: '줄마다 같은 수예요. 몇 번 더할까요?' },
  ],
  explain: { why: ['6명씩 4줄이니 6 × 4를 해요.', '그래서 모두 24명이에요.'], alt: [] },
}));

export default [B02_P, B06_P, B11_P, B02_D1, B02_D2, B06_D1, B06_D2, B11_D1, B11_D2];
