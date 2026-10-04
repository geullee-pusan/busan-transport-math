// N01 다대포해수욕장 — 세 자리 수의 덧셈 [4수01-03]. 천장 6.
// 기준: docs/curriculum/07-line1-templates.md v2 1절. T1-3(도전, 4~6단계)은 T1-2의 4~6단계로 합쳤다.
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


/** 자리마다 더하고 10을 버린 값(받아올림 무시) */
function noCarry(a, b) {
  let out = 0;
  for (let x = a, y = b, p = 1; x > 0 || y > 0; x = Math.floor(x / 10), y = Math.floor(y / 10), p *= 10) out += (((x % 10) + (y % 10)) % 10) * p;
  return out;
}
/** 자리마다 합을 이어 씀(368+275 → 51313) */
function concatSums(a, b) {
  const da = String(a).split('').map(Number);
  const db = String(b).split('').map(Number);
  return Number(da.map((d, i) => d + db[i]).join(''));
}
function addDiscs(a, b) {
  const sum = a + b;
  return uniq(
    [
      { value: noCarry(a, b), category: '계산', feedback: '일의 자리 10은 어디로 갔을까요?' },
      { value: sum - 10, category: '계산', feedback: '받아올린 1을 더했나요?' },
      { value: sum - 100, category: '계산', feedback: '받아올린 1을 더했나요?' },
      { value: concatSums(a, b), category: '개념', feedback: '한 자리에 숫자가 둘 들어갔나요?' },
    ].filter((d) => d.value !== sum && (carries(a, b) > 0 || d.value === concatSums(a, b))),
    sum,
  );
}

function buildAdd(a, b) {
  const sum = a + b;
  const bl = blankAt(sum, 1);
  const u = (a % 10) + (b % 10);
  return {
    text: [n(a), ' + ', n(b), ' = ?'],
    figure: { kind: 'vertical', op: '+', a, b },
    input: { kind: 'number' },
    answer: sum,
    discriminators: addDiscs(a, b),
    hints: [`${a} + ${b}의 값을 구해요.`, '자리를 맞춰 세로로 써 봐요. 일의 자리부터 차례로 해요.', `일의 자리는 ${a % 10} + ${b % 10} = ${ieyo(u)}.`, `${a} + ${b} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: ['같은 자리끼리 더해요.', '한 자리의 합이 10이 넘으면 10을 윗자리로 올려요.', `그래서 ${a} + ${b} = ${ieyo(sum)}.`],
      alt: [`${Math.floor(a / 100) * 100} + ${Math.floor(b / 100) * 100}을 먼저 하고 나머지를 더해도 돼요.`, `어느 길로 해도 답은 ${ro(sum)} 같아요.`],
    },
  };
}

/** T1-1 정비창 점검 (식) — 1~3단계 */
const T1_1 = {
  id: 'T1-1',
  node: 'N01',
  title: '정비창 점검: 세 자리 덧셈',
  repr: '식',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const want = level === 1 ? [0, 1] : level === 2 ? [2] : [3];
    const [a, b] = draw(
      rng,
      () => [rng.int(100, 899), rng.int(100, 899)],
      ([x, y]) => {
        const sum = x + y;
        if (x === y || !want.includes(carries(x, y))) return false;
        if (level < 3 && sum > 999) return false;
        return sum % 10 !== x % 10 && sum % 10 !== y % 10; // 우연 겹침
      },
      level === 1 ? [245, 138] : level === 2 ? [368, 275] : [586, 417],
    );
    return buildAdd(a, b);
  },
};

/** T1-2 1단계: 두 역에서 탄 사람 */
function t12Level1(a, b) {
  const sum = a + b;
  const bl = blankAt(sum, 1);
  return {
    text: ['다대포해수욕장역에서 ', V(a), '명, 다대포항역에서 ', V(b), '명이 탔어요. 두 역에서 탄 사람은 모두 몇 명이에요?'],
    figure: { kind: 'train', cars: 8 },
    input: { kind: 'number', unit: '명' },
    answer: sum,
    discriminators: addDiscs(a, b),
    hints: [`다대포해수욕장역에서 ${a}명, 다대포항역에서 ${b}명이 탔어요. 두 역에서 탄 사람 수를 모두 물어요.`, '자리를 맞춰 세로로 써 봐요.', `일의 자리는 ${a % 10} + ${b % 10} = ${ieyo((a % 10) + (b % 10))}.`, `${a} + ${b} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: { why: ['두 역에서 탄 사람을 합쳐요.', `${a} + ${b} = ${ieyo(sum)}.`, `그래서 모두 ${sum}명이에요.`], alt: [`${Math.floor(a / 100) * 100} + ${Math.floor(b / 100) * 100}을 먼저 하고 나머지를 더해요.`, `어느 길로 해도 답은 ${ro(sum)} 같아요.`] },
  };
}

/** T1-2 2단계: 모두 몇 명 + 기준과 비교 */
function t12Level2(a, b, T) {
  const sum = a + b;
  const more = sum > T ? '많아요' : '적어요';
  const bl = blankAt(sum, 1);
  return {
    text: ['다대포해수욕장역에서 ', V(a), '명, 다대포항역에서 ', V(b), '명이 탔어요. 모두 몇 명이에요? ', V(T), '명보다 많아요?'],
    figure: { kind: 'train', cars: 8 },
    input: { kind: 'compound', fields: [{ key: 'sum', label: '모두 몇 명' }, { key: 'more', label: `${T}명보다`, options: ['많아요', '적어요'] }] },
    answer: { sum, more },
    discriminators: [
      { key: 'sum', value: noCarry(a, b), category: '계산', feedback: '일의 자리 10은 어디로 갔을까요?' },
      { key: 'sum', value: sum - 10, category: '계산', feedback: '받아올린 1을 더했나요?' },
      { key: 'more', value: more === '많아요' ? '적어요' : '많아요', category: '개념', feedback: `${wa(sum)} ${T}의 백의 자리를 볼까요?` },
    ].filter((d) => d.value !== sum),
    hints: [`두 역에서 ${a}명과 ${b}명이 탔어요. 모두 몇 명인지, 그 수가 ${T}명보다 많은지 물어요.`, '먼저 모두 몇 명인지 구해요. 그다음 백의 자리부터 견주어 봐요.', `일의 자리는 ${a % 10} + ${b % 10} = ${ieyo((a % 10) + (b % 10))}.`, `${a} + ${b} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: `${T}명보다 많아요, 적어요?`,
    explain: {
      why: [`${a} + ${b} = ${ieyo(sum)}.`, `${eun(sum)} ${T}보다 ${sum > T ? '커요' : '작아요'}.`, `그래서 모두 ${sum}명이고, ${T}명보다 ${more}.`],
      alt: ['백의 자리끼리 먼저 더한 다음 나머지를 더해요.', `어느 길로 해도 답은 ${ro(sum)} 같아요.`],
    },
  };
}

/** T1-2 3단계: 앞 4량, 뒤 4량은 앞보다 m명 더 */
function t12Level3(p, m) {
  const back = p + m;
  const total = p + back;
  const bl = blankAt(total, 1);
  return {
    text: [L1(), '호선 열차는 ', CARS(), '량이에요. 앞 ', n(4), '량에 ', V(p), '명이 탔고, 뒤 ', n(4), '량에는 앞보다 ', V(m), '명 더 많이 탔어요. 열차에 탄 사람은 모두 몇 명이에요?'],
    figure: { kind: 'train', cars: 8, split: 4 },
    input: { kind: 'number', unit: '명' },
    answer: total,
    discriminators: uniq(
      [
        { value: back, category: '식', feedback: '뒤 4량만 구했어요. 앞 4량은요?' },
        { value: 2 * p, category: '읽기', feedback: '뒤 4량은 앞과 똑같이 탔나요?' },
        { value: p + m, category: '식', feedback: '뒤 4량만 구했어요. 앞 4량은요?' },
        { value: total - 10, category: '계산', feedback: '받아올린 1을 더했나요?' },
      ],
      total,
    ),
    hints: [`앞 4량에는 ${p}명이 탔어요. 뒤 4량은 앞보다 ${m}명 많아요. 열차 전체에 탄 사람 수를 물어요.`, '뒤 4량에 탄 사람부터 구해 볼까요? 그림의 앞과 뒤에 사람 수를 적어 봐요.', `뒤 4량에는 ${p} + ${m} = ${back}명이 탔어요.`, `${p} + ${back} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`뒤 4량은 앞보다 ${m}명 많으니 ${p} + ${m} = ${back}명이에요.`, `열차 전체는 앞과 뒤를 합친 ${p} + ${back} = ${total}명이에요.`, `그래서 모두 ${total}명이에요.`],
      alt: [`앞 4량이 두 번 있다고 생각하면 ${p} + ${p} = ${2 * p}명이에요.`, `뒤에만 ${m}명이 더 있으니 ${2 * p} + ${m} = ${total}명이에요.`, `어느 길로 해도 답은 ${ro(total)} 같아요.`],
    },
  };
}

/** 4단계: 숫자 카드 6장, 가장 큰 합 */
function t12Level4(cards) {
  const d = [...cards].sort((x, y) => y - x);
  const best = (d[0] + d[1]) * 100 + (d[2] + d[3]) * 10 + (d[4] + d[5]);
  const wrong = (d[0] + d[1]) * 100 + (d[2] + d[4]) * 10 + (d[3] + d[5]);
  const text = ['숫자 카드 '];
  cards.forEach((c, i) => {
    text.push(n(c));
    text.push(i < cards.length - 1 ? ', ' : jo(c, '을', '를'));
  });
  text.push(' 한 번씩 써서 세 자리 수 두 개를 만들어 더해요. 합이 가장 클 때는 얼마예요?');
  const x = d[0] * 100 + d[2] * 10 + d[4];
  const y = d[1] * 100 + d[3] * 10 + d[5];
  const bl = blankAt(best, 2);
  return {
    text,
    figure: { kind: 'cards', cards },
    challenge: true,
    input: { kind: 'number' },
    answer: best,
    discriminators: uniq([{ value: wrong, category: '개념', feedback: '큰 숫자를 어느 자리에 둬야 할까요?' }], best),
    hints: ['카드 여섯 장으로 세 자리 수 두 개를 만들어요. 그 합이 가장 클 때를 물어요.', '가장 큰 숫자 두 개를 어느 자리에 두면 좋을까요?', `백의 자리에 ${wa(d[0])} ${d[1]}, 십의 자리에 ${wa(d[2])} ${eul(d[3])} 둬요.`, `합은 ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: ['백의 자리 숫자가 합에 가장 크게 영향을 줘요.', `백에 ${d[0]}·${d[1]}, 십에 ${d[2]}·${d[3]}, 일에 ${d[4]}·${eul(d[5])} 둬요.`, `예: ${x} + ${y} = ${ieyo(best)}.`, `그래서 가장 큰 합은 ${ieyo(best)}.`],
      alt: [`(${d[0]}+${d[1]})×100 + (${d[2]}+${d[3]})×10 + (${d[4]}+${d[5]}) = ${ieyo(best)}.`, `어느 길로 해도 답은 ${ro(best)} 같아요.`],
    },
  };
}

/** 5단계: h□u + B가 1000보다 큼, □의 가장 작은 수 */
function t12Level5(h, k, u, B) {
  const lo = h * 100 + (k - 1) * 10 + u;
  const hi = h * 100 + k * 10 + u;
  return {
    text: [unknown(`${h}□${u}`), ' + ', n(B), '의 합이 ', n(1000), '보다 커요. □에 들어갈 수 있는 가장 작은 수는?'],
    figure: null,
    challenge: true,
    input: { kind: 'number' },
    answer: k,
    discriminators: [{ value: k - 1, category: '개념', feedback: `${lo} + ${eun(B)} 1000보다 클까요?` }],
    hints: [`${h}□${u}${jo(u, '과', '와')} ${B}의 합이 1000보다 크게 되는 □ 중 가장 작은 수를 찾아요.`, '□에 0부터 차례로 넣어 볼까요?', `1000 − ${B} = ${ieyo(1000 - B)}. ${h}□${u}${jo(u, '은', '는')} 이보다 커야 해요.`, `□ = ☐ 이면 ${h}□${u} + ${B}${jo(B, '이', '가')} 처음으로 1000보다 커요.`],
    blank: '☐',
    blankAnswer: String(k),
    explain: {
      why: [`□가 ${k - 1}이면 ${lo} + ${B} = ${ro(lo + B)} 1000보다 크지 않아요.`, `□가 ${k}이면 ${hi} + ${B} = ${ro(hi + B)} 1000보다 커요.`, `그래서 가장 작은 수는 ${ieyo(k)}.`],
      alt: [`1000 − ${B} = ${ieyo(1000 - B)}. ${h}□${u}${jo(u, '은', '는')} ${1000 - B}보다 커야 해요.`, `어느 길로 해도 답은 ${ro(k)} 같아요.`],
    },
  };
}

/** 6단계: X에 더해 받아올림이 세 번 생기는 가장 작은 세 자리 수 */
function t12Level6(X) {
  const x0 = X % 10;
  const x1 = Math.floor(X / 10) % 10;
  const x2 = Math.floor(X / 100);
  const y0 = 10 - x0;
  const y1 = 9 - x1;
  const y2 = 9 - x2;
  const Y = y2 * 100 + y1 * 10 + y0;
  const discs = x1 >= 1 ? [{ value: y2 * 100 + (10 - x1) * 10 + y0, category: '개념', feedback: '십의 자리에도 올라온 1이 있나요?' }] : [];
  const bl = blankAt(Y, 1);
  return {
    text: [n(X), '에 어떤 세 자리 수를 더했더니 일의 자리, 십의 자리, 백의 자리에서 모두 받아올림이 있었어요. 어떤 수가 될 수 있는 가장 작은 세 자리 수는?'],
    figure: null,
    challenge: true,
    input: { kind: 'number' },
    answer: Y,
    discriminators: uniq(discs, Y),
    hints: [`${X}에 어떤 세 자리 수를 더할 때 일·십·백의 자리에서 모두 받아올림이 생기는 가장 작은 수를 찾아요.`, '일의 자리부터 받아올림이 생기는 가장 작은 숫자를 정해요.', `일의 자리: ${x0} + ${y0} = 10이니 ${ieyo(y0)}.`, bl.blank],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`일의 자리 ${x0} + ${y0} = 10으로 받아올림.`, `십의 자리 ${x1} + ${y1} + 1 = 10으로 받아올림.`, `백의 자리 ${x2} + ${y2} + 1 = 10으로 받아올림.`, `그래서 가장 작은 수는 ${ieyo(Y)}.`],
      alt: [`${X} + ${Y} = 1000이에요.`, `어느 길로 해도 답은 ${ro(Y)} 같아요.`],
    },
  };
}

/** T1-2 타는 승객 (문장 + 그림) — 1~6단계(4~6단계는 07의 T1-3 도전 문제) */
const T1_2 = {
  id: 'T1-2',
  node: 'N01',
  title: '타는 승객',
  repr: '문장',
  minLevel: 1,
  maxLevel: 6,
  generate(rng, level) {
    if (level === 1) {
      const [a, b] = draw(rng, () => [rng.int(150, 499), rng.int(100, 299)], ([x, y]) => x !== y && carries(x, y) <= 1 && x + y <= 999 && (x + y) % 10 !== x % 10 && (x + y) % 10 !== y % 10, [245, 138]);
      return t12Level1(a, b);
    }
    if (level === 2) {
      const [a, b, T] = draw(
        rng,
        () => [rng.int(210, 480), rng.int(210, 480), rng.pick([500, 600, 700, 800])],
        ([x, y, t]) => x !== y && carries(x, y) === 2 && x + y <= 999 && Math.abs(x + y - t) >= 15 && Math.abs(x + y - t) <= 150,
        [368, 275, 600],
      );
      return t12Level2(a, b, T);
    }
    if (level === 3) {
      const [p, m] = draw(rng, () => [rng.int(150, 290), rng.int(12, 69)], ([x, y]) => carries(x, x + y) >= 1 && carries(x, y) <= 1 && 2 * x + y <= 999, [237, 48]);
      return t12Level3(p, m);
    }
    if (level === 4) {
      const cards = draw(rng, () => rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 6), () => true, [3, 5, 8, 1, 2, 6]);
      return t12Level4(cards);
    }
    if (level === 5) {
      const [h, k, u, B] = draw(
        rng,
        () => {
          const hh = rng.int(2, 6);
          const kk = rng.int(2, 8);
          const uu = rng.int(1, 9);
          return [hh, kk, uu, 1000 - (hh * 100 + kk * 10 + uu) + rng.int(1, 10)];
        },
        ([hh, kk, uu, bb]) => bb >= 100 && bb <= 999 && hh * 100 + (kk - 1) * 10 + uu + bb <= 1000 && hh * 100 + kk * 10 + uu + bb > 1000,
        [4, 1, 7, 586],
      );
      return t12Level5(h, k, u, B);
    }
    const X = draw(rng, () => rng.int(111, 889), (x) => x % 10 >= 1 && Math.floor(x / 10) % 10 >= 1 && Math.floor(x / 100) <= 8, 281);
    return t12Level6(X);
  },
};

/** 급행 통과 진단 */
const D1 = {
  id: 'N01-D1',
  node: 'N01',
  title: '급행 진단: 세 자리 덧셈',
  repr: '식',
  minLevel: 2,
  maxLevel: 2,
  diagnostic: true,
  generate() {
    return { ...buildAdd(368, 275), hints: [], blank: null };
  },
};
const D2 = {
  id: 'N01-D2',
  node: 'N01',
  title: '급행 진단: 앞 4량과 뒤 4량',
  repr: '문장',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...t12Level3(237, 48), hints: [], blank: null };
  },
};
const D3 = {
  id: 'N01-D3',
  node: 'N01',
  title: '급행 진단(예비): 네 자리가 되는 덧셈',
  repr: '식',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...buildAdd(586, 417), hints: [], blank: null };
  },
};

// ── T1-4 수 모형으로 더하기 (그림) — 09-templates-additions.md 1절 ──
const digits3 = (x) => ({ hundreds: Math.floor(x / 100), tens: Math.floor(x / 10) % 10, ones: x % 10 });

function t14(a, b, level) {
  const sum = a + b;
  const A = digits3(a);
  const B = digits3(b);
  const H = A.hundreds + B.hundreds;
  const T = A.tens + B.tens;
  const O = A.ones + B.ones;
  const S = digits3(sum);
  const bl = blankAt(sum, 1);
  const concat = Number(`${H}${T}${O}`);
  const discs =
    level === 1
      ? []
      : uniq(
          [
            { value: concat, category: '개념', feedback: `일 모형 ${O}개는 그대로 둘까요?` },
            { value: sum - 10, category: '계산', feedback: '바꾼 십 모형도 세었나요?' },
            ...(level === 3
              ? [
                  { value: sum - 100, category: '계산', feedback: '바꾼 백 모형도 세었나요?' },
                  { value: sum - 110, category: '계산', feedback: '바꾼 모형도 세었나요?' },
                ]
              : []),
          ],
          sum,
        );
  const hint2 =
    level === 1
      ? '그림에서 같은 모형끼리 세어 볼까요? 백 모형, 십 모형, 일 모형 차례로 세어 봐요.'
      : level === 2
        ? '일 모형 10개는 십 모형 1개로 바꿔 볼까요? 바꾼 다음 모형을 세어 봐요.'
        : '일 모형 10개는 십 모형 1개로 바꿔 볼까요? 십 모형 10개는 백 모형 1개로 바꿔요.';
  const hint3 =
    level === 1
      ? `백 모형 ${H}개, 십 모형 ${T}개, 일 모형 ${O}개예요.`
      : level === 2
        ? `일 모형은 ${O}개라서 십 모형 1개와 일 모형 ${O - 10}개가 돼요.`
        : `일 모형 ${O}개는 십 모형 1개와 일 모형 ${O - 10}개가 돼요. 그러면 십 모형은 ${T + 1}개예요.`;
  const why =
    level === 1
      ? [`백 모형 ${H}개, 십 모형 ${T}개, 일 모형 ${O}개예요.`, '10개가 되는 모형이 없어서 바꿀 것이 없어요.', `그래서 ${sum}명이에요.`]
      : level === 2
        ? [`일 모형 ${A.ones} + ${B.ones} = ${O}개는 십 모형 1개와 일 모형 ${O - 10}개로 바꿔요.`, `십 모형은 ${A.tens} + ${B.tens} + 1 = ${T + 1}개, 백 모형은 ${H}개예요.`, `그래서 ${sum}명이에요.`]
        : [
            `일 모형 ${A.ones} + ${B.ones} = ${O}개는 십 모형 1개와 일 모형 ${O - 10}개로 바꿔요.`,
            `십 모형 ${A.tens} + ${B.tens} + 1 = ${T + 1}개는 백 모형 1개와 십 모형 ${T + 1 - 10}개로 바꿔요.`,
            `백 모형은 ${A.hundreds} + ${B.hundreds} + 1 = ${H + 1}개예요.`,
            `그래서 ${sum}명이에요.`,
          ];
  const s1 = a + B.hundreds * 100;
  const s2 = s1 + B.tens * 10;
  return {
    text: ['다대포해수욕장역에서 탄 사람 ', V(a), '명과 다대포항역에서 탄 사람 ', V(b), '명을 수 모형으로 나타내 같은 모형끼리 모았어요. 모두 몇 명이에요?'],
    // 화면이 그리는 것은 모은 모형(hundreds·tens·ones). addends는 두 수를 따로 그릴 때 쓸 수 있는 덧붙임 정보.
    figure: { kind: 'base10', hundreds: H, tens: T, ones: O, addends: [A, B] },
    input: { kind: 'number', unit: '명' },
    answer: sum,
    discriminators: discs,
    hints: [`다대포해수욕장역에서 ${a}명, 다대포항역에서 ${b}명이 탔어요. 모두 몇 명인지 물어요.`, hint2, hint3, `백 ${S.hundreds}개, 십 ${S.tens}개, 일 ${S.ones}개 → ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why,
      alt: [`${a} + ${B.hundreds * 100} = ${s1}, ${s1} + ${B.tens * 10} = ${s2}, ${s2} + ${B.ones} = ${ieyo(sum)}.`, `두 풀이 모두 ${sum}명이에요.`],
    },
  };
}

/** T1-4 수 모형으로 더하기 (그림) — 1~3단계 */
const T1_4 = {
  id: 'T1-4',
  node: 'N01',
  title: '수 모형으로 더하기',
  repr: '그림',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const [a, b] = draw(
      rng,
      () => [rng.int(111, 499), rng.int(111, 399)],
      ([x, y]) => {
        const X = digits3(x);
        const Y = digits3(y);
        if (x === y || x + y > 999 || [X.tens, X.ones, Y.tens, Y.ones].includes(0) || String(x + y).includes('0')) return false;
        const onesUp = X.ones + Y.ones >= 10;
        const tensUp = X.tens + Y.tens + (onesUp ? 1 : 0) >= 10;
        if ((x + y) % 10 === X.ones || (x + y) % 10 === Y.ones) return false;
        if (level === 1) return !onesUp && !tensUp;
        if (level === 2) return onesUp && !tensUp;
        return onesUp && tensUp;
      },
      level === 1 ? [245, 132] : level === 2 ? [245, 138] : [186, 257],
    );
    return t14(a, b, level);
  },
};

export default [T1_1, T1_2, T1_4, D1, D2, D3];
