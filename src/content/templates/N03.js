// N03 낫개 — 받아내림 여러 번·0이 있는 뺄셈 [4수01-03]. 천장 6.
// 기준: docs/curriculum/07-line1-templates.md v2 3절. T3-3(도전, 5~6단계)은 T3-2의 5~6단계로 합쳤다.
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


const tens = (x) => Math.floor(x / 10) % 10;
const hund = (x) => Math.floor(x / 100);

/** 뺄셈 판별 오답(받아내림 두 번, 0이 있는 뺄셈) */
function subDiscs(a, b) {
  const d = a - b;
  const ad = absDigits(a, b);
  const zeroTens = tens(a) === 0;
  const list = [
    { value: d + 100, category: zeroTens ? '개념' : '계산', kind: zeroTens ? 'check' : 'nudge', ...(zeroTens ? {} : { feedbackCheck: '빌려 준 자리를 다시 볼까요?' }), feedback: zeroTens ? `백의 자리 ${eun(hund(a))} 몇이 됐을까요?` : '빌려 준 자리는 1 줄었나요?' },
    { value: d + 10, category: zeroTens ? '개념' : '계산', kind: 'nudge', feedbackCheck: zeroTens ? '십의 자리를 다시 볼까요?' : '빌려 준 자리를 다시 볼까요?', feedback: zeroTens ? '십의 자리도 빌려 줬어요. 몇이 남았나요?' : '빌려 준 자리는 1 줄었나요?' },
    { value: ad, category: '개념', kind: 'check', feedback: ad === b ? '답이 빼는 수와 같아요. 더해서 확인해 볼까요?' : `일의 자리 ${a % 10}에서 ${eul(b % 10)} 뺄 수 있나요?` },
    { value: d + 110, category: '계산', kind: 'nudge', feedbackCheck: '빌려 준 자리를 다시 볼까요?', feedback: '빌려 준 자리는 1 줄었나요?' },
  ];
  return uniq(list, d);
}

function steps(a, b) {
  if (tens(a) === 0 && a % 10 === 0) return `${a}은 100이 ${hund(a)}개예요. 100 하나를 10이 10개로, 그중 10 하나를 1이 10개로 바꿔요.`;
  if (tens(a) === 0) return `십의 자리가 0이라 백의 자리에서 먼저 빌려 와요. 십의 자리는 10이 되었다가 일의 자리에 빌려 주고 9가 돼요.`;
  return `일의 자리 ${a % 10}에서 ${eul(b % 10)} 뺄 수 없어 십의 자리에서 빌려 오고, 십의 자리도 백의 자리에서 빌려 와요.`;
}

function routesHint3(a, b) {
  const d = a - b;
  const up = Math.ceil(b / 10) * 10;
  const third = `${a - 1}: ${a - 1} − ${b} = ${ieyo(d - 1)}`;
  return `세로: 십의 자리는 10을 받았다가 일의 자리에 10을 빌려 줘서 9가 돼요. / 더해서 세기: ${b} → ${eun(up)} ${up - b}, ${up} → ${eun((hund(b) + 1) * 100)} ${(hund(b) + 1) * 100 - up}이에요. / ${third}.`;
}

function buildSub(a, b) {
  const d = a - b;
  const bl = blankAt(d, 1);
  const zero = a % 100 === 0;
  return {
    text: [n(a), ' − ', n(b), ' = ?'],
    figure: { kind: 'vertical', op: '−', a, b },
    input: { kind: 'number' },
    answer: d,
    discriminators: subDiscs(a, b),
    hints: [
      zero ? `${a} − ${b}의 값을 물어요. ${eun(a)} 십의 자리와 일의 자리가 모두 0이에요.` : `${a} − ${b}의 값을 물어요.`,
      zero ? `편한 길을 골라요. [세로로 받아내림] [${b}에서 ${a}까지 더해서 세기] [${a - 1} − ${b} 먼저]` : '자리를 맞춰 세로로 써 봐요. 받아내림을 한 자리는 1 줄어요.',
      zero ? routesHint3(a, b) : steps(a, b),
      `${a} − ${b} = ${bl.blank}`,
    ],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [steps(a, b), '빌려 준 자리는 1 줄어든 수로 계산해요.', `그래서 ${a} − ${b} = ${ieyo(d)}.`],
      alt: zero
        ? [`${a - 1} − ${b} = ${d - 1}는 받아내림이 없어요.`.replace(`${d - 1}는`, `${d - 1}${jo(d - 1, '은', '는')}`), `${eun(a)} ${a - 1}보다 1 크니까 답도 1 커서 ${ieyo(d)}.`, `어느 길로 해도 답은 ${ro(d)} 같아요.`]
        : [`${b}에서 ${a}까지 더해서 세어도 돼요.`, `${b} + ${d} = ${ieyo(a)}.`, `어느 길로 해도 답은 ${ro(d)} 같아요.`],
    },
  };
}

function pickSub(rng, level) {
  return draw(
    rng,
    () => {
      const h = rng.int(3, 9);
      const a = level === 1 ? h * 100 + rng.int(1, 9) * 10 + rng.int(1, 8) : level === 2 ? h * 100 + rng.int(1, 8) : h * 100;
      return [a, rng.int(101, a - 100)];
    },
    ([a, b]) => {
      const d = a - b;
      if (d < 100 || d === b || b % 10 === 0) return false;
      const pos = borrowPos(a, b);
      if (level === 1) return pos.length === 2 && !String(a).includes('0') && !String(b).includes('0');
      return pos.includes(0) && pos.includes(1);
    },
    level === 1 ? [523, 187] : level === 2 ? [503, 268] : [400, 237],
  );
}

/** T3-1 정비창 점검 (식) — 1~3단계 */
const T3_1 = {
  id: 'T3-1',
  node: 'N03',
  title: '정비창 점검: 받아내림 여러 번',
  repr: '식',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const [a, b] = pickSub(rng, level);
    return buildSub(a, b);
  },
};

/** T3-2 1·2단계: 내리고 남은 사람 */
function t32Level12(a, b) {
  const d = a - b;
  const bl = blankAt(d, 1);
  return {
    text: ['열차에 ', V(a), '명이 타 있었어요. 낫개역에서 ', V(b), '명이 내렸어요. 열차에 남은 사람은 몇 명이에요?'],
    figure: { kind: 'train', cars: 8 },
    input: { kind: 'number', unit: '명' },
    answer: d,
    discriminators: uniq([...subDiscs(a, b), { value: a + b, category: '식', kind: 'check', feedback: '남은 사람이 처음보다 많을까요?' }], d),
    hints: [`열차에 ${a}명이 타 있었고, 낫개역에서 ${b}명이 내렸어요. 열차에 남은 사람 수를 물어요.`, '내린 사람은 열차에서 빠져요. 자리를 맞춰 세로로 써 봐요.', steps(a, b), `${a} − ${b} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: ['내린 사람만큼 열차 안 사람이 줄어요.', steps(a, b), `${a} − ${b} = ${ieyo(d)}.`, `그래서 남은 사람은 ${d}명이에요.`],
      alt: [`${b}에서 ${a}까지 더해서 세어도 돼요.`, `${b} + ${d} = ${ieyo(a)}.`, `어느 길로 해도 답은 ${ro(d)} 같아요.`],
    },
  };
}

/** T3-2 3단계: 전체 − 앞 4량 → 뒤 4량 + 비교 */
function t32Level3(total, front) {
  const back = total - front;
  const more = front > back ? '앞' : '뒤';
  const bl = blankAt(back, 1);
  return {
    text: [L1(), '호선 ', CARS(), '량 열차에 ', V(total), '명이 타 있어요. 그중 앞 ', V(4), '량에 ', V(front), '명이 탔어요. 뒤 ', V(4), '량에는 몇 명이 탔고, 앞과 뒤 중 어느 쪽에 더 많이 탔어요?'],
    figure: { kind: 'train', cars: 8, split: 4 },
    input: { kind: 'compound', fields: [{ key: 'back', label: '뒤 4량' }, { key: 'more', label: '더 많은 쪽', options: ['앞', '뒤'] }] },
    answer: { back, more },
    discriminators: [
      { key: 'back', value: front, category: '읽기', kind: 'check', feedback: `${front}명은 앞 4량이에요. 뒤 4량은요?` },
      { key: 'back', value: back + 100, category: '계산', kind: 'check', feedback: `백의 자리 ${eun(hund(total))} 몇이 됐을까요?` },
      { key: 'back', value: back + 10, category: '계산', kind: 'check', feedback: '십의 자리는 몇이 남았나요?' },
      { key: 'more', value: more === '앞' ? '뒤' : '앞', category: '읽기', kind: 'check', feedback: `${wa(back)} ${front} 중 어느 쪽이 커요?` },
    ],
    hints: [
      `열차 전체에 ${total}명, 앞 4량에 ${front}명이 탔어요. 뒤 4량에 탄 사람 수와 어느 쪽이 더 많은지 물어요.`,
      '전체에서 앞 4량을 덜어 내면 뒤 4량이 남아요. 그림의 앞과 뒤에 사람 수를 적어 봐요.',
      `${total} − ${front}에서 ${eun(total)} 십의 자리와 일의 자리가 모두 0이에요.`,
      `${total} − ${front} = ${bl.blank}`,
    ],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '앞과 뒤 중 어느 쪽이 더 많아요?',
    explain: {
      why: [`뒤 4량은 ${total} − ${front} = ${back}명이에요.`, `${front}과 ${back}을 견주면 ${more}쪽이 더 커요.`.replace(`${front}과`, wa(front)).replace(`${back}을`, eul(back)), `그래서 뒤 4량은 ${back}명이고, ${more}쪽에 더 많이 탔어요.`],
      alt: [`${front}에서 ${total}까지 더해서 세도 ${back}명이에요.`, `어느 길로 해도 답은 ${ro(back)} 같아요.`],
    },
  };
}

/** T3-2 4단계: 교통카드 잔액 계산기를 잘못 눌렀어요 */
function t32Level4(s, w) {
  const sw = Math.floor(s / 100) * 100 + (s % 10) * 10 + tens(s); // 십·일의 자리를 바꾼 수
  const o = w + sw;
  const ans = o - s;
  const gap = sw - s;
  const bl = blankAt(ans, 1);
  return {
    text: ['교통카드 잔액을 계산기로 셈해요. 처음 금액에서 ', V(s), '원을 빼야 하는데, 숫자를 바꿔 ', V(sw), '원을 뺐어요. 계산기에 ', V(w), '원이 나왔어요. 바르게 빼면 얼마예요?'],
    figure: null,
    input: { kind: 'number', unit: '원' },
    answer: ans,
    discriminators: uniq(
      [
        { value: w - s, category: '식', kind: 'nudge', feedbackCheck: `${eun(w)} 처음 금액일까요?`, feedback: `${eun(w)} 잘못 뺀 결과예요. 처음 금액은 얼마였을까요?` },
        { value: o, category: '식', kind: 'nudge', feedbackCheck: '무엇을 물었는지 다시 볼까요?', feedback: '처음 금액을 찾았어요. 다음엔 무엇을 하죠?' },
        { value: w - gap, category: '개념', kind: 'nudge', feedbackCheck: `${eun(w)} 무엇을 뺀 결과예요?`, feedback: '더 많이 뺐으면 답은 커질까요, 작아질까요?' },
      ],
      ans,
    ),
    hints: [
      `바르게 뺄 수는 ${s}, 잘못 누른 수는 ${sw}, 계산기에 나온 수는 ${ieyo(w)}. 바르게 했을 때의 금액을 물어요.`,
      '편한 길을 골라요. [처음 금액을 먼저 찾기] [얼마나 더 뺐는지 보기]',
      `처음 금액 길: ${w} + ${sw} = ${o}원이 처음 금액이에요. / 더 뺀 길: ${eun(sw)} ${s}보다 ${gap} 커요.`,
      `${o} − ${s} = ${bl.blank} / ${w} + ${gap} = ${bl.blank}`,
    ],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: ['잘못 뺀 계산을 거꾸로 하면 처음 금액이 나와요.', `${w} + ${sw} = ${ieyo(o)}.`, `처음 금액에서 바르게 빼면 ${o} − ${s} = ${ieyo(ans)}.`, `그래서 바르게 빼면 ${ans}원이에요.`],
      alt: [`${eun(sw)} ${s}보다 ${gap} 커요.`, `${gap}을 더 뺐으니 결과가 ${gap}만큼 작게 나왔어요.`.replace(`${gap}을`, eul(gap)), `${w} + ${gap} = ${ieyo(ans)}.`, `어느 길로 해도 답은 ${ro(ans)} 같아요.`],
    },
  };
}

/** T3-2 5단계(도전): □□□ − B, 일·십의 자리 모두 받아내림, 답은 세 자리 */
function t32Level5(B) {
  const ok = (x) => x - B >= 100 && x % 10 < B % 10 && tens(x) - 1 < tens(B);
  let X = B + 100;
  while (!ok(X)) X += 1;
  let onlyOnes = B + 100;
  while (!(onlyOnes - B >= 100 && onlyOnes % 10 < B % 10)) onlyOnes += 1;
  const discs = [{ key: 'small', value: B + 100, category: '개념', kind: 'check', feedback: `${B + 100} − ${B}에서 받아내림이 있나요?` }];
  if (onlyOnes !== X) discs.push({ key: 'small', value: onlyOnes, category: '개념', kind: 'check', feedback: '십의 자리에서도 받아내림이 있나요?' });
  const ans = X - B;
  const bl = { blank: '☐' + String(X).slice(1), blankAnswer: String(X)[0] };
  return {
    text: [unknown('□□□'), ' − ', n(B), jo(B, '을', '를'), ' 할 때 일의 자리와 십의 자리에서 모두 받아내림이 있고, 답은 세 자리 수예요. 이런 □□□ 중 가장 작은 수와 그때의 답을 써요.'],
    figure: null,
    challenge: true,
    input: { kind: 'compound', fields: [{ key: 'small', label: '가장 작은 수' }, { key: 'answer', label: '그때 답' }] },
    answer: { small: X, answer: ans },
    discriminators: discs,
    hints: [
      `${eul(B)} 빼는 수로 쓰는 세 자리 수 □□□를 찾아요. 일의 자리와 십의 자리 모두에서 받아내림이 있어야 하고, 답은 세 자리예요. 가장 작은 □□□와 그때 답을 물어요.`,
      '답이 세 자리가 되려면 □□□는 적어도 얼마일까요? 그 수부터 차례로 따져 봐요.',
      `□□□는 ${B + 100}보다 작을 수 없어요.`,
      `가장 작은 수는 ${bl.blank}`,
    ],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '그때 답은 얼마예요?',
    explain: {
      why: [
        `답이 세 자리가 되려면 □□□는 ${B + 100}보다 크거나 같아야 해요.`,
        `일의 자리에서 받아내림이 있으려면 일의 자리가 ${B % 10}보다 작아야 하고, 그러면서 십의 자리에서도 받아내림이 있어야 해요.`,
        `${X} − ${B} = ${ieyo(ans)}.`,
        `그래서 가장 작은 수는 ${X}이고, 그때 답은 ${ieyo(ans)}.`,
      ],
      alt: [`${B + 100}부터 하나씩 올려 가며 두 받아내림이 함께 생기는지 확인해도 돼요.`, `어느 길로 해도 답은 ${ro(X)} 같아요.`],
    },
  };
}

/** T3-2 6단계(도전): 오류 찾기 */
function t32Level6(a, b, where) {
  const d = a - b;
  const wrong = where === '백의 자리' ? d + 100 : d + 10;
  const options = ['일의 자리', '십의 자리', '백의 자리'];
  return {
    text: ['어떤 풀이에서 "', n(a), ' − ', n(b), ' = ', n(wrong), '"' + jo(wrong, '이라고', '라고') + ' 했어요. 틀린 곳을 골라요.'],
    figure: { kind: 'vertical', op: '−', a, b, result: wrong },
    challenge: true,
    input: { kind: 'choice', options },
    answer: where,
    discriminators: options.filter((o) => o !== where).map((o) => ({ value: o, category: '개념', kind: 'check', feedback: `${o} 숫자는 바른 답과 같아요. 다른 자리는 어떨까요?` })),
    hints: [
      `풀이의 답은 ${ieyo(wrong)}. 어느 자리가 틀렸는지 물어요.`,
      '바른 답을 먼저 구해 볼까요? 두 답을 자리마다 견주어 봐요.',
      `바른 답의 일의 자리는 ${ieyo(d % 10)}.`,
      `${a} − ${b} = ${blankAt(d, where === '백의 자리' ? 2 : 1).blank}`,
    ],
    blank: blankAt(d, where === '백의 자리' ? 2 : 1).blank,
    blankAnswer: blankAt(d, where === '백의 자리' ? 2 : 1).blankAnswer,
    blankThen: '어느 자리가 틀렸어요?',
    explain: {
      why: [
        `바른 답은 ${a} − ${b} = ${ieyo(d)}.`,
        where === '백의 자리' ? '풀이는 백의 자리에서 빌려 준 1을 줄이지 않았어요.' : '풀이는 십의 자리가 일의 자리에 빌려 준 1을 줄이지 않았어요.',
        `그래서 틀린 곳은 ${where}예요.`,
      ],
      alt: [`${wrong} + ${b}를 해 보면 ${ro(wrong + b)} ${a}가 아니에요.`.replace(`${b}를`, eul(b)).replace(`${a}가`, `${a}${jo(a, '이', '가')}`), `어느 길로 해도 답은 ${where}로 같아요.`],
    },
  };
}

/** T3-2 내리고 남은 사람 (문장 + 그림) — 1~6단계(5~6단계는 07의 T3-3 도전 문제) */
const T3_2 = {
  id: 'T3-2',
  node: 'N03',
  title: '내리고 남은 사람',
  repr: '문장',
  minLevel: 1,
  maxLevel: 6,
  generate(rng, level) {
    if (level <= 2) {
      const [a, b] = pickSub(rng, level);
      return t32Level12(a, b);
    }
    if (level === 3) {
      const [total, front] = draw(
        rng,
        () => [rng.pick([500, 600, 700, 800]), rng.int(180, 520)],
        ([t, f]) => f < t - 100 && f % 10 !== 0 && t - f !== f && Math.abs(t - 2 * f) >= 10 && t - f >= 100,
        [600, 312],
      );
      return t32Level3(total, front);
    }
    if (level === 4) {
      const [s, w] = draw(
        rng,
        () => [rng.int(1, 5) * 100 + rng.int(1, 7) * 10 + rng.int(2, 9), rng.int(150, 450)],
        ([ss, ww]) => {
          const t = tens(ss);
          const u = ss % 10;
          if (u <= t) return false;
          const sw = Math.floor(ss / 100) * 100 + u * 10 + t;
          const o = ww + sw;
          const ans = o - ss;
          return o <= 999 && ww > ss && ww - ss !== ss && ![ss, sw, ww].includes(ans) && borrowPos(o, ss).length >= 1;
        },
        [268, 317],
      );
      return t32Level4(s, w);
    }
    if (level === 5) {
      const B = draw(rng, () => rng.int(1, 6) * 100 + rng.int(1, 8) * 10 + rng.int(1, 9), () => true, 258);
      return t32Level5(B);
    }
    const [a, b, where] = draw(
      rng,
      () => {
        const aa = rng.int(3, 9) * 100;
        return [aa, rng.int(101, aa - 100), rng.pick(['백의 자리', '십의 자리'])];
      },
      ([aa, bb]) => {
        const d = aa - bb;
        return d >= 100 && bb % 10 !== 0 && hund(d) <= 8 && tens(d) <= 8;
      },
      [400, 237, '백의 자리'],
    );
    return t32Level6(a, b, where);
  },
};

/** 급행 통과 진단 */
const D1 = {
  id: 'N03-D1',
  node: 'N03',
  title: '급행 진단: 0이 있는 뺄셈',
  repr: '식',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...buildSub(400, 237), hints: [], blank: null };
  },
};
const D2 = {
  id: 'N03-D2',
  node: 'N03',
  title: '급행 진단: 뒤 4량',
  repr: '문장',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...t32Level3(600, 312), hints: [], blank: null };
  },
};
const D3 = {
  id: 'N03-D3',
  node: 'N03',
  title: '급행 진단(예비): 잘못 뺀 계산',
  repr: '문장',
  minLevel: 4,
  maxLevel: 4,
  diagnostic: true,
  generate() {
    return { ...t32Level4(268, 317), hints: [], blank: null };
  },
};

// ── T3-4 수 모형 바꾸어 빼기 (그림) — 09-templates-additions.md 3절 ──
const B_H = '백 모형';
const B_T = '십 모형';

function t34(a, b, level) {
  const d = a - b;
  const ah = hund(a);
  const at = tens(a);
  const au = a % 10;
  const bh = hund(b);
  const bt = tens(b);
  const bu = b % 10;
  const dh = hund(d);
  const dt = tens(d);
  const du = d % 10;
  // 바꾼 뒤의 모형 수(백·십·일)
  const H = ah - 1;
  const T = level === 1 ? at - 1 + 10 : 9;
  const O = au + 10;
  const bl = blankAt(d, 1);
  const left = subDiscs(a, b).map((x) => ({ ...x, key: 'left' }));
  let fields;
  let answer;
  let extra;
  let ask;
  let lastWhy;
  if (level === 1) {
    fields = [{ key: 'count', label: '모형을 바꾼 횟수' }, { key: 'left', label: '남은 사람' }];
    answer = { count: 2, left: d };
    extra = [{ key: 'count', value: 1, category: '개념', kind: 'nudge', feedbackCheck: '모형을 다시 세어 볼까요?', feedback: '십 모형도 모자라지 않나요?' }];
    ask = ' 모형을 몇 번 바꿨는지도 써요.';
    lastWhy = '십 모형 1개, 백 모형 1개를 바꿔서 모두 두 번 바꿨어요.';
  } else if (level === 2) {
    fields = [{ key: 'first', label: '먼저 바꿀 모형', options: [B_H, B_T] }, { key: 'left', label: '남은 사람' }];
    answer = { first: B_H, left: d };
    extra = [{ key: 'first', value: B_T, category: '개념', kind: 'nudge', feedbackCheck: '모형을 다시 세어 볼까요?', feedback: '십 모형이 하나도 없지 않나요?' }];
    ask = ' 일 모형이 모자랄 때 먼저 바꿀 모형도 골라요.';
    lastWhy = '십 모형이 없어서 백 모형부터 바꿨어요.';
  } else {
    fields = [{ key: 'h2t', label: '백 모형 1개 → 십 모형 몇 개' }, { key: 't2o', label: '십 모형 1개 → 일 모형 몇 개' }, { key: 'left', label: '남은 사람' }];
    answer = { h2t: 10, t2o: 10, left: d };
    extra = [
      { key: 'h2t', value: 100, category: '개념', kind: 'check', feedback: '백 모형 1개에 십 모형은 몇 개 들어가요?' },
      { key: 't2o', value: 1, category: '개념', kind: 'check', feedback: '십 모형 1개에 일 모형은 몇 개 들어가요?' },
    ];
    ask = ' 모형을 바꿀 때 몇 개가 되는지도 써요.';
    lastWhy = '백 모형 1개는 십 모형 10개, 십 모형 1개는 일 모형 10개예요.';
  }
  const hint1 =
    level === 3
      ? `처음에 ${a}명이 있었고, 낫개역에서 ${b}명이 내렸어요. 남은 사람을 물어요. ${eun(a)} 백 모형 ${ah}개뿐이에요.`
      : `처음에 ${a}명이 있었고, 낫개역에서 ${b}명이 내렸어요. 남은 사람을 물어요.`;
  const hint2 =
    level === 1
      ? '일 모형이 모자라면 십 모형 1개를 일 모형 10개로 바꿔 볼까요? 십 모형이 모자라면 백 모형을 바꿔요.'
      : level === 2
        ? '십 모형이 하나도 없어요. 일 모형이 모자라면 어느 모형부터 바꿔야 할까요?'
        : '일 모형이 하나도 없어요. 백 모형부터 바꾸면 무엇이 생길까요?';
  const hint3 =
    level === 1
      ? `십 모형 1개를 바꾸면 일 모형이 ${O}개, 백 모형 1개를 바꾸면 십 모형이 ${T}개가 돼요. 백 ${H}, 십 ${T}, 일 ${ieyo(O)}.`
      : `백 모형 1개를 바꾸면 십 모형 10개, 그중 1개를 바꾸면 일 모형 ${O}개예요. 백 ${H}, 십 ${T}, 일 ${O}${jo(O, '이', '가')} 돼요.`;
  return {
    text: ['열차에 ', V(a), '명이 타 있었어요. 낫개역에서 ', V(b), '명이 내렸어요. 수 모형을 바꾸어 가며 남은 사람을 구해요.' + ask],
    figure: { kind: 'base10', hundreds: ah, tens: at, ones: au },
    input: { kind: 'compound', fields },
    answer,
    discriminators: [...extra, ...left],
    hints: [hint1, hint2, hint3, `백 ${H} − ${bh}, 십 ${T} − ${bt}, 일 ${O} − ${bu} → ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '나머지 칸도 채워요.',
    explain: {
      why: [
        `${eul(a)} 백 ${H}개, 십 ${T}개, 일 ${O}개로 바꾸어도 모두 ${a} 그대로예요.`,
        `여기서 백 ${bh}개, 십 ${bt}개, 일 ${bu}개를 덜면 백 ${dh}개, 십 ${dt}개, 일 ${du}개가 남아요.`,
        lastWhy,
        `그래서 남은 사람은 ${d}명이에요.`,
      ],
      alt: [`${b}에서 ${a}까지 더해서 세어도 돼요.`, `${b} + ${d} = ${ieyo(a)}.`, `두 풀이 모두 ${d}명이에요.`],
    },
  };
}

/** T3-4 수 모형 바꾸어 빼기 (그림) — 1~3단계 */
const T3_4 = {
  id: 'T3-4',
  node: 'N03',
  title: '수 모형 바꾸어 빼기',
  repr: '그림',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const [a, b] = pickSub(rng, level);
    return t34(a, b, level);
  },
};

export default [T3_1, T3_2, T3_4, D1, D2, D3];
