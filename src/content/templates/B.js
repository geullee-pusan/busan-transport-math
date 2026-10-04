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
    if (!Array.isArray(r) || r.length === 0) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '답을 먼저 골라 볼까요?' };
    const got = key(r);
    if (got === want) return { correct: true };
    const d = discs.find((x) => key(x.value) === got);
    return d ? { correct: false, category: d.category, kind: d.kind ?? 'check', feedbackCheck: d.feedbackCheck, feedback: d.feedback } : { correct: false, category: null, kind: 'check', feedback: null };
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
  if (b === 0) discs.push({ value: a * 10 + c, category: '개념', kind: 'nudge', feedbackCheck: '0인 자리를 다시 볼까요?', feedback: '0인 자리도 자리를 지켜요. 몇 자리 수예요?' });
  if (c === 0) discs.push({ value: a * 10 + b, category: '개념', kind: 'nudge', feedbackCheck: '0인 자리를 다시 볼까요?', feedback: '0인 자리도 자리를 지켜요. 몇 자리 수예요?' });
  discs.push({ value: a + b + c, category: '개념', kind: 'check', feedback: `100이 ${a}개면 얼마일까요?` });
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
      alt: [`${a * 100} + ${b * 10} + ${c} = ${ieyo(v)}.`, `어느 길로 해도 답은 ${ieyo(v)}.`],
    },
  };
}

function cardNumber(cards, big) {
  const nz = cards.filter((x) => x !== 0).sort((x, y) => x - y);
  const v = big ? nz[1] * 100 + nz[0] * 10 : nz[0] * 100 + nz[1];
  const h = Math.floor(v / 100);
  const discs = big
    ? [
        { value: nz[1] * 100 + nz[0], category: '개념', kind: 'nudge', feedbackCheck: '다른 수도 만들어 비교해 볼까요?', feedback: '0은 어느 자리에 둘까요?' },
        { value: nz[0] * 100 + nz[1] * 10, category: '개념', kind: 'nudge', feedbackCheck: '다른 수도 만들어 비교해 볼까요?', feedback: '가장 큰 숫자는 어느 자리에 둘까요?' },
        { value: nz[0] * 100 + nz[1], category: '읽기', kind: 'check', feedback: '가장 큰 수를 물었어요. 다시 볼까요?' },
      ]
    : [
        { value: nz[0] * 10 + nz[1], category: '개념', kind: 'check', feedback: '0이 맨 앞이면 세 자리 수일까요?' },
        { value: nz[0] * 100 + nz[1] * 10, category: '개념', kind: 'nudge', feedbackCheck: '다른 수도 만들어 비교해 볼까요?', feedback: '0은 어느 자리에 둘까요?' },
        { value: nz[1] * 100 + nz[0] * 10, category: '읽기', kind: 'check', feedback: '가장 작은 수를 물었어요. 다시 볼까요?' },
      ];
  const bl = blankAt(v, 1);
  const word = big ? '큰' : '작은';
  return {
    text: ['숫자 카드 ', n(cards[0]), ', ', n(cards[1]), ', ', n(cards[2]), jo(cards[2], '을', '를'), ` 한 번씩 써서 세 자리 차량 번호를 만들어요. 가장 ${word} 수는 얼마예요?`],
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
      alt: ['만들 수 있는 세 자리 수를 모두 써 보고 비교해도 돼요.', `어느 길로 해도 답은 ${ieyo(v)}.`],
    },
  };
}

// ── B06 두 자리 덧셈·뺄셈 ──
function noCarry(a, b) {
  let out = 0;
  for (let x = a, y = b, p = 1; x > 0 || y > 0; x = Math.floor(x / 10), y = Math.floor(y / 10), p *= 10) out += (((x % 10) + (y % 10)) % 10) * p;
  return out;
}

/** 정비창 연습 장면: 열차 한 칸에 a명, 다음 역에서 b명이 타거나 내림. 시작말은 수로 고른다(rng를 더 부르지 않음). */
const STARTS = ['', '아침에 ', '오늘 ', '저녁에 '];
function cabinScene(a, b, op) {
  const head = `${STARTS[(a + b) % STARTS.length]}열차 한 칸에 `;
  return op === '+'
    ? { text: [head, V(a), '명이 타 있었어요. 다음 역에서 ', V(b), '명이 더 탔어요.', '\n'], h1: `구하는 것: 열차 한 칸에 탄 사람 수 / 알고 있는 것: 처음 ${a}명, 다음 역에서 ${b}명이 더 탐`, ask: '모두', unit: '명' }
    : { text: [head, V(a), '명이 타 있었어요. 다음 역에서 ', V(b), '명이 내렸어요. 남은 사람은 몇 명이에요?', '\n'], h1: `구하는 것: 남은 사람 수 / 알고 있는 것: 처음 ${a}명, 다음 역에서 ${b}명이 내림`, ask: '남은 사람은', unit: '명' };
}

/** scene = { text: 식 앞 교통 장면 조각(끝에 '\n'), h1?, ask?, unit } (없으면 식만) */
function addSub(a, b, op, scene = null) {
  const plus = op === '+';
  const sign = plus ? '+' : '−';
  const ans = plus ? a + b : a - b;
  const bl = blankAt(ans, 1);
  const [at, au] = [Math.floor(a / 10), a % 10];
  const [bt, bu] = [Math.floor(b / 10), b % 10];
  const discs = plus
    ? [
        { value: noCarry(a, b), category: '개념', kind: 'check', feedback: '일의 자리 10은 어디로 갔을까요?' },
        { value: ans - 10, category: '계산', kind: 'nudge', feedbackCheck: '십의 자리를 다시 계산해 볼까요?', feedback: '받아올림한 1을 더했나요?' },
      ]
    : [
        { value: absDigits(a, b), category: '개념', kind: 'check', feedback: `일의 자리 ${au}에서 ${eul(bu)} 뺄 수 있나요?` },
        { value: ans + 10, category: '계산', kind: 'nudge', feedbackCheck: '받아내림한 자리를 다시 볼까요?', feedback: '받아내림한 자리는 1 작아졌나요?' },
      ];
  const carry = plus ? au + bu >= 10 : au < bu;
  const u = au + bu;
  const hint3 = plus
    ? carry
      ? `일의 자리는 ${au} + ${bu} = ${u}${jo(u, '이라서', '라서')} 십의 자리로 1을 받아올림해요.`
      : `일의 자리는 ${au} + ${bu} = ${ieyo(u)}.`
    : carry
      ? `십의 자리에서 받아내림하면 일의 자리는 ${au + 10} − ${bu} = ${ieyo(au + 10 - bu)}.`
      : `일의 자리는 ${au} − ${bu} = ${ieyo(au - bu)}.`;
  let why;
  if (plus && carry) why = [`일의 자리는 ${au} + ${bu} = ${ieyo(u)}.`, '같은 자리의 합이 10이거나 10보다 크면 윗자리로 받아올림해요.', `십의 자리는 ${at} + ${bt} + 1 = ${ieyo(at + bt + 1)}.`];
  else if (plus) why = [`일의 자리는 ${au} + ${bu} = ${ieyo(u)}.`, `십의 자리는 ${at} + ${bt} = ${ieyo(at + bt)}.`];
  else if (carry) why = [`${eun(a)} 10이 ${at}개, 1이 ${au}개예요.`, `10 하나를 1이 10개로 바꾸면 10이 ${at - 1}개, 1이 ${au + 10}개가 돼요.`, `일의 자리는 ${au + 10} − ${bu} = ${au + 10 - bu}, 십의 자리는 ${at - 1} − ${bt} = ${ieyo(at - 1 - bt)}.`];
  else why = [`일의 자리는 ${au} − ${bu} = ${ieyo(au - bu)}.`, `십의 자리는 ${at} − ${bt} = ${ieyo(at - bt)}.`];
  if (scene?.ask) why.push(`${a} ${sign} ${b} = ${ieyo(ans)}.`, `그래서 ${scene.ask} ${ans}${scene.unit}이에요.`);
  else why.push(`그래서 ${a} ${sign} ${b} = ${ieyo(ans)}.`);
  let alt;
  if (plus) alt = bu === 0 ? [`${a}에서 10씩 ${bt}번 뛰어 세어도 ${ieyo(ans)}.`] : [`${a}에 ${eul(bt * 10)} 먼저 더하면 ${a + bt * 10}, 여기에 ${eul(bu)} 더하면 ${ieyo(ans)}.`];
  else if (bu === 0) alt = [`${a}에서 10씩 ${bt}번 거꾸로 뛰어 세어도 ${ieyo(ans)}.`];
  else {
    const up = (bt + 1) * 10;
    alt = [`${b}에서 ${a}까지 이어 세어 봐요. ${b} → ${up}(+${up - b}) → ${a}(+${a - up})예요.`, `${up - b} + ${a - up} = ${ieyo(ans)}.`];
  }
  alt.push(`어느 길로 해도 답은 ${ieyo(ans)}.`);
  return {
    text: [...(scene?.text ?? []), n(a), ` ${sign} `, n(b), ' = ?'],
    figure: { kind: 'vertical', op: sign, a, b },
    input: scene?.unit ? { kind: 'number', unit: scene.unit } : { kind: 'number' },
    answer: ans,
    discriminators: carry ? uniq(discs, ans) : [],
    hints: [scene?.h1 ?? `${a} ${sign} ${b}의 값을 물어요.`, '자리를 맞춰 세로로 써 봐요. 일의 자리부터 해요.', hint3, `${a} ${sign} ${b} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: { why, alt },
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
    return addSub(a, b, op, cabinScene(a, b, op));
  },
};

// ── B11 곱셈구구 ──
/** scene = { text: 식 앞 교통 장면 조각, unit } (없으면 식만) */
function times(a, b, scene = null) {
  const P = a * b;
  const bl = P >= 10 ? blankAt(P, 1) : { blank: '☐', blankAnswer: String(P) };
  return {
    text: [...(scene?.text ?? []), n(a), ' × ', n(b), ' = ?'],
    figure: null,
    input: scene?.unit ? { kind: 'number', unit: scene.unit } : { kind: 'number' },
    answer: P,
    discriminators: uniq(
      [
        { value: a * (b - 1), category: '계산', kind: 'nudge', feedbackCheck: `${a} × ${b}, 다시 계산해 볼까요?`, feedback: `${a}단을 차례로 외워 볼까요?` },
        { value: a * (b + 1), category: '계산', kind: 'nudge', feedbackCheck: `${a} × ${b}, 다시 계산해 볼까요?`, feedback: `${a}단을 차례로 외워 볼까요?` },
        { value: (a - 1) * b, category: '계산', kind: 'check', feedback: `${b}단과 헷갈렸나요?` },
        { value: (a + 1) * b, category: '계산', kind: 'check', feedback: `${b}단과 헷갈렸나요?` },
        { value: a + b, category: '식', kind: 'nudge', feedbackCheck: '문제를 다시 읽어 볼까요?', feedback: '곱셈이에요. 몇 번 더하는 셈일까요?' },
      ].filter((d) => d.value > 0 && d.value !== a && d.value !== b),
      P,
    ),
    hints: [scene?.h1 ?? `${a} × ${b}의 값을 물어요.`, `${a}씩 ${b}묶음이에요. ${a}단을 떠올려 봐요.`, `${a} × ${b - 1} = ${ieyo(a * (b - 1))}.`, `${a} × ${b} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: scene?.ask
        ? [`${a} × ${b - 1} = ${a * (b - 1)}에 ${eul(a)} 하나 더하면 돼요.`, `${a} × ${b} = ${a * (b - 1)} + ${a} = ${ieyo(P)}.`, `그래서 ${scene.ask} ${P}${scene.unit}이에요.`]
        : [`${a} × ${b - 1} = ${a * (b - 1)}에 ${eul(a)} 하나 더하면 돼요.`, `${a * (b - 1)} + ${a} = ${ieyo(P)}.`, `그래서 ${a} × ${b} = ${ieyo(P)}.`],
      alt: [`${b} × ${a}${fin(a) === 'c' ? '으로' : '로'} 생각해도 ${ieyo(P)}.`, `어느 길로 해도 답은 ${ieyo(P)}.`],
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
    // 장면 문장은 04 문서 4절 본보기(그대로). 물음 문장은 빼고 식을 새 줄에 둔다.
    return times(a, b, { text: [level >= 3 ? '퇴근 시간에 승강장에서 ' : '승강장에서 ', V(a), '명씩 ', V(b), '줄로 서서 열차를 기다렸어요.', '\n'], h1: `구하는 것: 줄 선 사람 수 / 알고 있는 것: 한 줄에 ${a}명씩, ${b}줄`, ask: '모두', unit: '명' });
  },
};

// ── 정비창 진단(07 0.10절): 노드마다 2문항, 직접 입력만 ──
const diag = (id, node, title, make) => ({ id, node, title, repr: '식', minLevel: 2, maxLevel: 2, diagnostic: true, generate: () => ({ ...make(), hints: [], blank: null }) });

const B02_D1 = diag('B02-D1', 'B02', '정비창 진단: 0이 있는 자릿값', () => {
  const p = placeValue(3, 0, 7);
  return { ...p, discriminators: [{ value: 37, category: '개념', kind: 'nudge', feedbackCheck: '0인 자리를 다시 볼까요?', feedback: '0인 자리도 자리를 지켜요. 몇 자리 수예요?' }] };
});
const B02_D2 = diag('B02-D2', 'B02', '정비창 진단: 가장 큰 세 자리 수', () => cardNumber([4, 0, 9], true));
const B06_D1 = diag('B06-D1', 'B06', '정비창 진단: 두 자리 덧셈', () => {
  const p = addSub(47, 38, '+', { text: ['열차 한 칸에 ', V(47), '명이 있었고 ', V(38), '명이 더 탔어요.', '\n'], ask: '모두', unit: '명' });
  return { ...p, discriminators: [{ value: 75, category: '개념', kind: 'check', feedback: '일의 자리 10은 어디로 갔을까요?' }, { value: 715, category: '개념', kind: 'check', feedback: '한 자리에 숫자가 둘 들어갔나요?' }] };
});
const B06_D2 = diag('B06-D2', 'B06', '정비창 진단: 두 자리 뺄셈', () => {
  const p = addSub(62, 27, '-', { text: ['열차 한 칸에 ', V(62), '명이 있었고 ', V(27), '명이 내렸어요. 남은 사람은 몇 명이에요?', '\n'], ask: '남은 사람은', unit: '명' });
  return { ...p, discriminators: [{ value: 45, category: '개념', kind: 'check', feedback: '일의 자리 2에서 7을 뺄 수 있나요?' }, { value: 89, category: '식', kind: 'nudge', feedbackCheck: '답을 처음 수와 비교해 볼까요?', feedback: '빼기 문제예요. 답이 커질까요?' }] };
});
const B11_D1 = diag('B11-D1', 'B11', '정비창 진단: 곱셈구구', () => {
  const p = times(7, 8, { text: ['승강장에서 ', V(7), '명씩 ', V(8), '줄로 열차를 기다려요.', '\n'], ask: '모두', unit: '명' });
  return { ...p, discriminators: [{ value: 54, category: '계산', kind: 'nudge', feedbackCheck: '곱하는 두 수를 다시 볼까요?', feedback: '7단을 차례로 외워 볼까요?' }, { value: 48, category: '계산', kind: 'nudge', feedbackCheck: '곱하는 두 수를 다시 볼까요?', feedback: '7단을 차례로 외워 볼까요?' }, { value: 15, category: '식', kind: 'nudge', feedbackCheck: '문제를 다시 읽어 볼까요?', feedback: '곱셈이에요. 몇 번 더하는 셈일까요?' }] };
});
const B11_D2 = diag('B11-D2', 'B11', '정비창 진단: 그림으로 곱셈', () => ({
  text: ['승강장에 그림처럼 한 줄에 ', V(6), '명씩 ', V(4), '줄로 섰어요. 모두 몇 명이에요?'],
  figure: { kind: 'groups', items: 24, groupSize: 6, rows: 4 },
  input: { kind: 'number', unit: '명' },
  answer: 24,
  discriminators: [
    { value: 18, category: '계산', kind: 'check', feedback: '6씩 몇 줄인지 다시 세어 볼까요?' },
    { value: 30, category: '계산', kind: 'check', feedback: '6씩 몇 줄인지 다시 세어 볼까요?' },
    { value: 10, category: '식', kind: 'nudge', feedbackCheck: '문제를 다시 읽어 볼까요?', feedback: '줄마다 같은 수예요. 몇 번 더할까요?' },
  ],
  explain: { why: ['6명씩 4줄이니 6 × 4를 해요.', '그래서 모두 24명이에요.'], alt: [] },
}));

// ── 2학년 시각·길이 기초 진단(10-line2-pilot.md 3.0절, 2호선 첫 운행 전 정비창 곁가지) ──
// 노드는 concept-graph.json v2026-10-04.3의 정비창 기초 노드를 쓴다:
//   B12 시각 읽기(몇 시 몇 분), 1시간 = 60분(2수03-07~09) → G13의 선수
//   B13 길이 1cm·1m, 1m = 100cm(2수03-10~13) → G16의 선수
// G13·G16 자신의 급행 통과 진단과 섞이지 않는다. 엔진 연결은 나중에.
const isBlankB = (r) => r === undefined || r === null || (typeof r === 'string' && r.trim() === '');
function hmGrade(answer, discs) {
  const eq = (a, b) => !isBlankB(a) && Number(String(a).trim()) === b;
  return (r) => {
    if (isBlankB(r?.h) && isBlankB(r?.m)) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '답을 먼저 써 볼까요?' };
    if (eq(r?.h, answer.h) && eq(r?.m, answer.m)) return { correct: true };
    const d = discs.find((x) => eq(r?.h, x.value.h) && eq(r?.m, x.value.m));
    if (d) return { correct: false, category: d.category, kind: d.kind, feedbackCheck: d.feedbackCheck, feedback: d.feedback };
    return { correct: false, category: null, kind: 'check', feedback: '시와 분을 다시 볼까요?' };
  };
}
const BT_D1 = {
  id: 'B12-D1',
  node: 'B12',
  title: '정비창 진단: 몇 시 몇 분 읽기',
  repr: '그림',
  minLevel: 2,
  maxLevel: 2,
  diagnostic: true,
  generate() {
    const answer = { h: 3, m: 25 };
    const discs = [{ value: { h: 3, m: 5 }, category: '개념', kind: 'check', feedback: '긴바늘이 5를 가리키면 몇 분일까요?' }];
    return {
      text: ['역 대합실 시계가 가리키는 시각은 몇 시 몇 분이에요?'],
      // 그림: { kind: 'clock', h, m } 바늘 시계(초침 없음)
      figure: { kind: 'clock', h: 3, m: 25 },
      input: { kind: 'compound', fields: [{ key: 'h', label: '시' }, { key: 'm', label: '분' }] },
      answer,
      discriminators: discs,
      grade: hmGrade(answer, discs),
      hints: [],
      blank: null,
      explain: { why: ['짧은바늘이 3과 4 사이라서 3시예요.', '긴바늘이 5를 가리키면 5 × 5 = 25분이에요.', '그래서 3시 25분이에요.'], alt: [] },
    };
  },
};
const BT_D2 = {
  id: 'B12-D2',
  node: 'B12',
  title: '정비창 진단: 1시간 20분은 몇 분',
  repr: '빈칸',
  minLevel: 2,
  maxLevel: 2,
  diagnostic: true,
  generate: () => ({
    text: ['열차를 ', V(1), '시간 ', V(20), '분 동안 탔어요. 몇 분 동안 탔어요?'],
    figure: null,
    input: { kind: 'number', unit: '분' },
    answer: 80,
    discriminators: [{ value: 120, category: '개념', kind: 'check', feedback: '1시간은 몇 분이에요?' }],
    hints: [],
    blank: null,
    explain: { why: ['1시간은 60분이에요.', '60분과 20분을 합치면 80분이에요.', '그래서 80분이에요.'], alt: [] },
  }),
};
const BL_D1 = {
  id: 'B13-D1',
  node: 'B13',
  title: '정비창 진단: 자로 몇 cm',
  repr: '그림',
  minLevel: 2,
  maxLevel: 2,
  diagnostic: true,
  generate: () => ({
    text: ['자로 연필의 길이를 재었어요. 연필의 한쪽 끝은 눈금 ', n(0), '에 맞췄어요. 연필의 길이는 몇 cm예요?'],
    // 그림: { kind: 'ruler', cm, mm?, mark: { from, to, label } } — from·to는 mm
    figure: { kind: 'ruler', cm: 10, mark: { from: 0, to: 70, label: '연필' } },
    input: { kind: 'number', unit: 'cm' },
    answer: 7,
    discriminators: [],
    hints: [],
    blank: null,
    explain: { why: ['연필의 한쪽 끝이 0에 있어요.', '다른 쪽 끝이 7을 가리켜요.', '그래서 7cm예요.'], alt: [] },
  }),
};
const BL_D2 = {
  id: 'B13-D2',
  node: 'B13',
  title: '정비창 진단: 1m 30cm는 몇 cm',
  repr: '빈칸',
  minLevel: 2,
  maxLevel: 2,
  diagnostic: true,
  generate: () => ({
    text: [n(1), 'm ', n(30), 'cm는 몇 cm예요?'],
    figure: null,
    input: { kind: 'number', unit: 'cm' },
    answer: 130,
    discriminators: [
      { value: 13, category: '개념', kind: 'check', feedback: '1m는 몇 cm예요?' },
      { value: 1030, category: '개념', kind: 'check', feedback: '1m는 몇 cm예요?' },
    ],
    hints: [],
    blank: null,
    explain: { why: ['1m는 100cm예요.', '100cm와 30cm를 합치면 130cm예요.', '그래서 130cm예요.'], alt: [] },
  }),
};

export default [B02_P, B06_P, B11_P, B02_D1, B02_D2, B06_D1, B06_D2, B11_D1, B11_D2, BT_D1, BT_D2, BL_D1, BL_D2];
