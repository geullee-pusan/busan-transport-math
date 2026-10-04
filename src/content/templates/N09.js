// N09 당리 — 단위분수·분모가 같은 분수의 크기 비교 [4수01-11]. 천장 6.
// 기준: docs/curriculum/07-line1-templates.md v2 9절.
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


const fr = (a, b) => `${a}/${b}`;
const SIGNS = ['>', '<', '='];
const sign = (x, y) => (x > y ? '>' : x < y ? '<' : '=');

/** T9-1 1단계: 그림 두 개, 색칠한 칸이 더 많은 쪽 */
function t91Level1(a, b) {
  const fa = fr(a, 8);
  const fb = fr(b, 8);
  const ans = a > b ? fa : fb;
  return {
    text: [n(fa), jo(fa, '과', '와'), ' ', n(fb), ' 중 색칠한 칸이 더 많은 쪽은 어느 것이에요?'],
    figure: { kind: 'trains', trains: [{ name: fa, cars: 8, shaded: a }, { name: fb, cars: 8, shaded: b }] },
    input: { kind: 'choice', options: [fa, fb] },
    answer: ans,
    discriminators: [{ value: a > b ? fb : fa, category: '개념', kind: 'check', feedback: '색칠한 칸 수를 세어 볼까요?' }],
    hints: [`두 열차 그림에 ${wa(fa)} ${fb}만큼 색칠했어요. 색칠한 칸이 더 많은 쪽을 물어요.`, '두 그림에서 색칠한 칸을 각각 세어 볼까요? 분모가 같으면 분자를 견주어 봐요.', `${fa}${jo(fa, '은', '는')} 1/8이 ${a}개예요.`, `${fb}${jo(fb, '은', '는')} 1/8이 ☐개`],
    blank: `1/8이 ☐개`,
    blankAnswer: String(b),
    blankThen: '어느 쪽이 더 많아요?',
    explain: {
      why: ['두 분수는 모두 8칸으로 똑같이 나눈 것이에요.', `${fa}${jo(fa, '은', '는')} ${a}칸, ${fb}${jo(fb, '은', '는')} ${b}칸이에요.`, `그래서 더 많은 쪽은 ${ieyo(ans)}.`],
      alt: ['분모가 같으면 분자가 큰 쪽이 커요.', `어느 길로 해도 답은 ${ans}로 같아요.`.replace(`${ans}로`, `${ans}${fin(ans) === 'c' ? '으로' : '로'}`)],
    },
  };
}

/** T9-1 2단계: a/d ○ b/d */
function t91Level2(a, b, d) {
  const fa = fr(a, d);
  const fb = fr(b, d);
  const ans = sign(a, b);
  return {
    text: [n(fa), ' ○ ', n(fb), ' 알맞은 기호(>, <, =)를 골라요.'],
    figure: null,
    input: { kind: 'choice', options: SIGNS },
    answer: ans,
    discriminators: SIGNS.filter((s) => s !== ans).map((s) => ({ value: s, category: '개념', kind: 'check', feedback: '같은 크기 조각이 몇 개씩이에요?' })),
    hints: [`${wa(fa)} ${fb}의 크기를 견주는 기호를 물어요.`, '분모가 같으면 조각 하나의 크기가 같아요. 조각이 몇 개인지 견주어 봐요.', `${fa}${jo(fa, '은', '는')} 1/${d}이 ${a}개예요.`, `${fb}${jo(fb, '은', '는')} 1/${d}이 ☐개`],
    blank: `1/${d}이 ☐개`,
    blankAnswer: String(b),
    blankThen: '알맞은 기호는 무엇이에요?',
    explain: {
      why: [`두 분수는 1/${d}이 각각 ${a}개, ${b}개예요.`, `${a > b ? fa : fb}${jo(a > b ? fa : fb, '이', '가')} 조각이 더 많아요.`, `그래서 ${fa} ${ans} ${ieyo(fb)}.`],
      alt: [`띠를 ${d}칸으로 나눠 ${a}칸과 ${b}칸을 칠해 견주어도 돼요.`, `어느 길로 해도 답은 ${ans}로 같아요.`],
    },
  };
}

/** T9-1 3단계: 네 분수 늘어놓기 */
function t91Level3(nums, d) {
  const items = nums.map((x) => fr(x, d));
  const sorted = [...nums].sort((x, y) => x - y).map((x) => fr(x, d));
  const rev = [...sorted].reverse();
  const key = (arr) => (Array.isArray(arr) ? arr.map(String).join('|') : '');
  const discs = [{ value: rev, category: '읽기', kind: 'check', feedback: '작은 것부터예요. 맨 앞은 어느 것일까요?' }];
  const text = [];
  items.forEach((f, i) => {
    text.push(n(f));
    text.push(i < 3 ? ', ' : `${jo(f, '을', '를')} 작은 것부터 늘어놓아요.`);
  });
  const third = [...nums].sort((x, y) => x - y)[2];
  return {
    text,
    figure: null,
    input: { kind: 'order', items },
    answer: sorted,
    discriminators: discs,
    grade(r) {
      if (!Array.isArray(r) || r.length === 0) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '답을 먼저 늘어놓아 볼까요?' };
      if (key(r) === key(sorted)) return { correct: true };
      if (key(r) === key(rev)) return { correct: false, category: '읽기', kind: discs[0].kind ?? 'check', feedbackCheck: discs[0].feedbackCheck, feedback: discs[0].feedback };
      return { correct: false, category: null, kind: 'check', feedback: null };
    },
    hints: [`${items.join(', ')}${jo(items[3], '을', '를')} 작은 것부터 차례로 늘어놓는 순서를 물어요.`, '분모가 같아요. 조각 하나의 크기가 같으면 무엇을 견주면 될까요?', `가장 작은 것은 ${ieyo(sorted[0])}.`, `${sorted[0]}, ${sorted[1]}, ☐/${d}, ${sorted[3]}`],
    blank: `☐/${d}`,
    blankAnswer: String(third),
    explain: {
      why: [`모두 1/${d}${jo(d, '이', '이')} 몇 개인지로 나타낸 분수예요.`, '분모가 같으면 분자가 작을수록 작아요.', `그래서 ${sorted.join(', ')} 순서예요.`],
      alt: [`띠를 ${d}칸으로 나눠 칠한 칸 수를 견주어도 돼요.`, `어느 길로 해도 답은 ${sorted.join(', ')} 순서로 같아요.`],
    },
  };
}

/** T9-1 분모가 같은 분수 (그림 → 기호) — 1~3단계 */
const T9_1 = {
  id: 'T9-1',
  node: 'N09',
  title: '분모가 같은 분수',
  repr: '그림',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 1) {
      const [a, b] = draw(rng, () => [rng.int(1, 7), rng.int(1, 7)], ([x, y]) => x !== y, [3, 5]);
      return t91Level1(a, b);
    }
    if (level === 2) {
      const d = rng.int(5, 9);
      const [a, b] = draw(rng, () => [rng.int(1, d - 1), rng.int(1, d - 1)], ([x, y]) => x !== y, [4, 5]);
      return t91Level2(a, b, d);
    }
    const d = rng.pick([6, 7, 8, 9, 10]);
    const nums = rng.shuffle(Array.from({ length: d - 1 }, (_, i) => i + 1)).slice(0, 4);
    const sortedOk = nums.join() !== [...nums].sort((x, y) => x - y).join();
    return t91Level3(sortedOk ? nums : [...nums].reverse(), d);
  },
};

/** T9-2 1단계: 같은 길이의 띠, 한 칸이 더 긴 쪽 */
function t92Level1(a, b) {
  const fa = fr(1, a);
  const fb = fr(1, b);
  const small = Math.min(a, b);
  const big = Math.max(a, b);
  const ans = fr(1, small);
  return {
    text: ['같은 길이의 띠를 ', n(a), '칸과 ', n(b), '칸으로 똑같이 나눴어요. ', n(fa), jo(fa, '과', '와'), ' ', n(fb), ' 중 한 칸이 더 긴 쪽은 어느 것이에요?'],
    figure: { kind: 'strips', strips: [a, b] },
    input: { kind: 'choice', options: [fa, fb] },
    answer: ans,
    discriminators: [{ value: fr(1, big), category: '개념', kind: 'check', feedback: `${big}칸짜리 한 칸이 더 길까요?` }],
    hints: [`같은 길이의 띠 두 개가 각각 ${a}칸, ${b}칸이에요. 한 칸이 더 긴 쪽을 물어요.`, '그림에서 한 칸의 길이를 견주어 볼까요? 많이 나눌수록 한 칸은 어떻게 될까요?', `${small}칸 쪽이 더 적게 나눈 띠예요.`, '더 적게 나눈 띠는 ☐칸'],
    blank: '더 적게 나눈 띠는 ☐칸',
    blankAnswer: String(small),
    blankThen: '한 칸이 더 긴 쪽은 어느 것이에요?',
    explain: {
      why: ['같은 띠를 적게 나눌수록 한 칸이 커요.', `${small}칸으로 나눈 한 칸이 ${big}칸으로 나눈 한 칸보다 길어요.`, `그래서 더 긴 쪽은 ${ieyo(ans)}.`],
      alt: [`${fr(1, small)} 한 칸을 다시 나누면 ${fr(1, big)} 여러 칸이 돼요.`, `어느 길로 해도 답은 ${ans}로 같아요.`],
    },
  };
}

/** T9-2 2단계: 1/a ○ 1/b */
function t92Level2(a, b) {
  const fa = fr(1, a);
  const fb = fr(1, b);
  const ans = sign(1 / a, 1 / b);
  const wrong = sign(a, b);
  return {
    text: [n(fa), ' ○ ', n(fb), ' 알맞은 기호(>, <, =)를 골라요.'],
    figure: null,
    input: { kind: 'choice', options: SIGNS },
    answer: ans,
    discriminators: [
      { value: wrong, category: '개념', kind: 'check', feedback: `${b}칸으로 나눈 한 칸이 더 클까요?`.replace(`${b}칸`, `${Math.max(a, b)}칸`) },
      { value: '=', category: '개념', kind: 'check', feedback: '한 칸의 크기가 같을까요?' },
    ].filter((d) => d.value !== ans),
    hints: [`${wa(fa)} ${fb}의 크기를 견주는 기호를 물어요.`, '같은 띠를 몇 칸으로 나눈 것인지 떠올려 볼까요? 그중 한 칸의 길이를 견주어 봐요.', `${fa}${jo(fa, '은', '는')} 띠를 ${a}칸으로 똑같이 나눈 한 칸이에요.`, `한 칸이 더 긴 쪽: 1/☐`],
    blank: '1/☐',
    blankAnswer: String(Math.min(a, b)),
    blankThen: '알맞은 기호는 무엇이에요?',
    explain: {
      why: ['분자가 1이면 분모가 작을수록 커요.', `${Math.min(a, b)}칸으로 나눈 한 칸이 ${Math.max(a, b)}칸으로 나눈 한 칸보다 길어요.`, `그래서 ${fa} ${ans} ${ieyo(fb)}.`],
      alt: ['같은 띠 두 개를 그려 한 칸씩 칠해 견주어도 돼요.', `어느 길로 해도 답은 ${ans}로 같아요.`],
    },
  };
}

/** T9-2 3단계: 분모가 커지면(작아지면) 한 조각은? */
function t92Level3(grow) {
  const dir = grow ? '커지면' : '작아지면';
  const change = grow ? '작아져요' : '커져요';
  const R = grow ? '같은 것을 더 많이 나눠서' : '같은 것을 더 적게 나눠서';
  const opts = grow ? [R, '분모 숫자가 커서', '조각 수가 줄어서'] : [R, '분모 숫자가 작아서', '조각 수가 늘어서'];
  return {
    text: ['분모가 ', dir, ' 한 조각의 크기는 어떻게 될까요? 이유도 골라요.'],
    figure: { kind: 'strips', strips: [2, 4, 8] },
    input: { kind: 'compound', fields: [{ key: 'change', label: '한 조각의 크기', options: ['커져요', '작아져요'] }, { key: 'why', label: '이유', options: opts }] },
    answer: { change, why: R },
    discriminators: [
      { key: 'change', value: grow ? '커져요' : '작아져요', category: '개념', kind: 'nudge', feedbackCheck: '띠 그림을 다시 볼까요?', feedback: '띠를 더 많이 나누면 한 칸은요?' },
      { key: 'why', value: opts[1], category: '개념', kind: 'nudge', feedbackCheck: '이유를 다시 읽어 볼까요?', feedback: '숫자가 커서일까요? 띠 그림을 떠올려 봐요.' },
      { key: 'why', value: opts[2], category: '개념', kind: 'check', feedback: '분모는 무엇을 나타낼까요?' },
    ],
    hints: [`분모가 ${dir} 한 조각의 크기가 어떻게 되는지, 그 이유도 물어요.`, '같은 띠를 2칸, 4칸, 8칸으로 나눈 그림을 떠올려 볼까요?', '띠를 2칸으로 나누면 한 칸은 띠의 반이에요.', '1/2, 1/4, 1/8 중 한 칸이 가장 작은 것은 1/☐'],
    blank: '1/☐',
    blankAnswer: '8',
    blankThen: '조각의 크기는 어떻게 될까요?',
    explain: {
      why: ['분모는 전체를 몇 조각으로 똑같이 나눴는지 나타내요.', grow ? '같은 것을 더 많이 나누면 한 조각이 작아져요.' : '같은 것을 더 적게 나누면 한 조각이 커져요.', `그래서 한 조각의 크기는 ${change}.`],
      alt: ['1/2, 1/4, 1/8 띠를 나란히 그려 한 칸을 견주어 봐요.', `어느 길로 해도 답은 '${change}'로 같아요.`],
    },
  };
}

/** T9-2 4단계: 1/□ > 1/k */
function t92Level4(k) {
  const answer = Array.from({ length: k - 2 }, (_, i) => i + 2);
  const opts = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  const discs = [
    { value: [...answer, k], category: '개념', kind: 'check', feedback: `${fr(1, k)}${jo(1, '과', '와')} ${fr(1, k)}${jo(1, '은', '는')} 같아요. 더 커야 하죠?` },
    { value: opts.filter((x) => x > k), category: '개념', kind: 'check', feedback: `${fr(1, k + 1)}${jo(1, '은', '는')} ${fr(1, k)}보다 클까요?` },
  ];
  return {
    text: [unknown('1/□'), '이 ', n(fr(1, k)), '보다 커요. □에 들어갈 수 있는 수를 모두 골라요. (□는 ', n(2), '부터)'],
    figure: null,
    challenge: false,
    input: { kind: 'multi', options: opts },
    answer,
    discriminators: discs,
    grade: multiGrade(answer, discs),
    hints: [`1/□이 ${fr(1, k)}보다 커야 해요. 들어갈 수 있는 수를 모두 물어요.`, `띠를 2칸, 3칸, …으로 나눈 그림을 그려 볼까요? 한 칸이 ${k}칸짜리의 한 칸보다 긴 것을 찾아봐요.`, `${k}칸보다 적게 나누면 한 칸이 더 길어요.`, '들어갈 수 있는 수: 2부터 ☐까지'],
    blank: '2부터 ☐까지',
    blankAnswer: String(k - 1),
    explain: {
      why: ['분자가 1이면 분모가 작을수록 커요.', `${fr(1, k)}보다 크려면 □는 ${k}보다 작아야 해요.`, `그래서 들어갈 수 있는 수는 ${answer.join(', ')}이에요.`.replace(/이에요\.$/, `${jo(k - 1, '이에요', '예요')}.`)],
      alt: [`같은 띠를 2칸부터 ${k}칸까지 나눠 한 칸을 견주어도 돼요.`, `어느 길로 해도 답은 ${answer.join(', ')}${fin(k - 1) === 'c' ? '으로' : '로'} 같아요.`],
    },
  };
}

/** T9-2 5단계: 두 조건 */
function t92Level5(D, A, U) {
  const lim = Math.min(A, U);
  const loose = Math.max(A, U);
  const answer = Array.from({ length: lim - 2 }, (_, i) => i + 2);
  const opts = Array.from({ length: 9 }, (_, i) => i + 2);
  const discs = [{ value: Array.from({ length: loose - 2 }, (_, i) => i + 2), category: '개념', kind: 'check', feedback: '두 조건을 모두 맞춰 봤나요?' }];
  return {
    text: [unknown(`□/${D}`), '가 ', n(fr(A, D)), '보다 작고, ', unknown('1/□'), '은 ', n(fr(1, U)), '보다 커요. □에 들어갈 수 있는 수를 모두 골라요. (□는 ', n(2), '부터)'],
    figure: null,
    challenge: true,
    input: { kind: 'multi', options: opts },
    answer,
    discriminators: discs,
    grade: multiGrade(answer, discs),
    hints: [`□/${D}는 ${fr(A, D)}보다 작아야 하고, 1/□은 ${fr(1, U)}보다 커야 해요. 두 조건을 모두 맞추는 수를 물어요.`, '조건마다 들어갈 수 있는 수를 따로 적어 볼까요? 두 목록에 모두 있는 수를 찾아요.', `첫째 조건에서 □는 ${A}보다 작아요.`, '들어갈 수 있는 수: 2부터 ☐까지'],
    blank: '2부터 ☐까지',
    blankAnswer: String(lim - 1),
    explain: {
      why: [`□/${D}${jo(D, '이', '가')} ${fr(A, D)}보다 작으려면 □는 ${A}보다 작아야 해요.`, `1/□이 ${fr(1, U)}보다 크려면 □는 ${U}보다 작아야 해요.`, `그래서 들어갈 수 있는 수는 ${answer.join(', ')}${jo(lim - 1, '이에요', '예요')}.`],
      alt: ['보기의 수를 하나씩 넣어 두 조건을 확인해도 돼요.', `어느 길로 해도 답은 ${answer.join(', ')}${fin(lim - 1) === 'c' ? '으로' : '로'} 같아요.`],
    },
  };
}

/** T9-2 6단계: 전체가 다른 비교 */
function t92Level6(a, m, b) {
  const x = 8 / a;
  const y = m / b;
  const A = `8량의 ${fr(1, a)}`;
  const B = `앞 ${m}량의 ${fr(1, b)}`;
  const more = x > y ? A : x < y ? B : '같아요';
  const byFrac = a < b ? A : a > b ? B : '같아요';
  const concl = more === '같아요' ? '두 쪽은 같아요' : `${more}${jo(1, '이', '이')} 더 많아요`;
  return {
    text: [L1(), '호선 열차 ', CARS(), '량의 ', n(fr(1, a)), '과 그 열차 앞 ', V(m), '량의 ', n(fr(1, b)), '은 각각 몇 량이에요? 어느 쪽이 더 많아요?'],
    figure: { kind: 'train', cars: 8, front: m },
    input: { kind: 'compound', fields: [{ key: 'x', label: A }, { key: 'y', label: B }, { key: 'more', label: '더 많은 쪽', options: [A, B, '같아요'] }] },
    answer: { x, y, more },
    discriminators: byFrac !== more ? [{ key: 'more', value: byFrac, category: '개념', kind: 'check', feedback: '두 분수의 전체는 같은 크기예요?' }] : [],
    hints: [`8량의 ${fr(1, a)}과 앞 ${m}량의 ${fr(1, b)}이 각각 몇 량인지, 어느 쪽이 더 많은지 물어요.`, '전체가 몇 량인지 먼저 보고, 그 전체를 똑같이 나눠 볼까요?', `8량의 ${fr(1, a)}은 ${x}량이에요.`, `앞 ${m}량의 ${fr(1, b)}은 ☐량`],
    blank: '☐량',
    blankAnswer: String(y),
    blankThen: '어느 쪽이 더 많아요?',
    explain: {
      why: [`8량을 ${a}묶음으로 똑같이 나눈 한 묶음은 ${x}량이에요.`, `앞 ${m}량을 ${b}묶음으로 똑같이 나눈 한 묶음은 ${y}량이에요.`, '분수끼리 크기를 견주는 것은 전체가 같을 때만 맞아요.', `그래서 ${concl}.`],
      alt: [`8 ÷ ${a} = ${x}, ${m} ÷ ${b} = ${ieyo(y)}.`, `어느 길로 해도 답은 '${more}'로 같아요.`],
    },
  };
}

/** T9-2 단위분수 (띠 그림 → 판단) — 1~6단계 */
const T9_2 = {
  id: 'T9-2',
  node: 'N09',
  title: '단위분수',
  repr: '문장',
  minLevel: 1,
  maxLevel: 6,
  generate(rng, level) {
    if (level === 1 || level === 2) {
      const [a, b] = draw(rng, () => [rng.int(2, 9), rng.int(2, 9)], ([x, y]) => x !== y, [4, 8]);
      return level === 1 ? t92Level1(a, b) : t92Level2(a, b);
    }
    if (level === 3) return t92Level3(rng.next() < 0.6);
    if (level === 4) return t92Level4(rng.int(4, 7));
    if (level === 5) {
      const [D, A, U] = draw(rng, () => [rng.int(7, 10), rng.int(3, 9), rng.int(4, 8)], ([d, a, u]) => a < d && a !== u && Math.min(a, u) >= 4, [9, 5, 6]);
      return t92Level5(D, A, U);
    }
    const [a, m, b] = rng.pick([
      [8, 4, 4],
      [4, 4, 2],
      [4, 2, 2],
      [8, 2, 2],
      [4, 4, 4],
      [2, 4, 2],
    ]);
    return t92Level6(a, m, b);
  },
};

/** 급행 통과 진단 */
const D1 = {
  id: 'N09-D1',
  node: 'N09',
  title: '급행 진단: 단위분수 비교',
  repr: '식',
  minLevel: 2,
  maxLevel: 2,
  diagnostic: true,
  generate() {
    return { ...t92Level2(4, 8), hints: [], blank: null };
  },
};
const D2 = {
  id: 'N09-D2',
  node: 'N09',
  title: '급행 진단: 전체가 다른 분수',
  repr: '문장',
  minLevel: 6,
  maxLevel: 6,
  diagnostic: true,
  generate() {
    return { ...t92Level6(8, 4, 4), hints: [], blank: null };
  },
};
const D3 = {
  id: 'N09-D3',
  node: 'N09',
  title: '급행 진단(예비): 1/□의 범위',
  repr: '문장',
  minLevel: 4,
  maxLevel: 4,
  diagnostic: true,
  generate() {
    return { ...t92Level4(5), hints: [], blank: null };
  },
};

// ── T9-3 같은 구간을 달린 만큼 (문장) — 09-templates-additions.md 9절 ──
const blank93 = (v) => v === undefined || v === null || String(v).trim() === '';
const TRAINS93 = ['가', '나'];
const TEST_RUN = '(가상) 시험 운행 열차 두 대가 같은 구간을 달려요.';
const gcd = (x, y) => (y ? gcd(y, x % y) : x);

/** 1단계: 같은 분모, 구간 그림 */
function t93Level1(a, b, d) {
  const fa = fr(a, d);
  const fb = fr(b, d);
  const ans = a > b ? '가' : '나';
  return {
    text: [`${TEST_RUN} 구간을 똑같이 `, V(d), '칸으로 나누어 표시했어요. 가 열차는 구간의 ', V(fa), ', 나 열차는 ', V(fb), '만큼 달렸어요. 더 많이 달린 열차는 어느 쪽이에요?'],
    figure: { kind: 'strip', parts: Array(d).fill(1), shaded: [] },
    input: { kind: 'choice', options: TRAINS93 },
    answer: ans,
    discriminators: [{ value: ans === '가' ? '나' : '가', category: '개념', kind: 'check', feedback: '같은 크기 칸이 몇 개씩이에요?' }],
    hints: [`같은 구간을 ${d}칸으로 똑같이 나눴어요. 가 열차는 ${fa}, 나 열차는 ${fb}만큼 달렸어요. 더 많이 달린 열차를 물어요.`, '그림에서 두 열차가 달린 칸을 각각 세어 볼까요? 분모가 같으면 분자를 견주어 봐요.', `가 열차는 1/${d}이 ${a}칸만큼 달렸어요.`, `나 열차는 1/${d}이 ☐칸`],
    blank: `1/${d}이 ☐칸`,
    blankAnswer: String(b),
    blankThen: '더 많이 달린 열차는 어느 쪽이에요?',
    explain: {
      why: [`두 분수는 같은 구간을 똑같이 ${d}칸으로 나눈 것이에요.`, `가 열차는 ${a}칸, 나 열차는 ${b}칸만큼 달렸어요.`, `그래서 ${ans} 열차가 더 많이 달렸어요.`],
      alt: ['분모가 같으면 분자가 큰 쪽이 커요.', `두 생각 모두 ${ans} 열차예요.`],
    },
  };
}

/** 2단계: 같은 분모, 그림 없음, 몇 칸 더 */
function t93Level2(a, b, d) {
  const fa = fr(a, d);
  const fb = fr(b, d);
  const ans = a > b ? '가' : '나';
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  const diff = hi - lo;
  const discs = [
    { key: 'which', value: ans === '가' ? '나' : '가', category: '개념', kind: 'nudge', feedbackCheck: '두 분수를 다시 볼까요?', feedback: '분모가 같으면 무엇을 견줘요?' },
    { key: 'cells', value: hi, category: '읽기', kind: 'check', feedback: '그 열차가 달린 칸이에요. 몇 칸 더예요?' },
    { key: 'cells', value: a + b, category: '식', kind: 'check', feedback: '몇 칸 더 달렸는지 물었어요' },
  ];
  return {
    text: [`${TEST_RUN} 구간을 똑같이 `, V(d), '칸으로 나누어 표시했어요. 가 열차는 구간의 ', V(fa), ', 나 열차는 ', V(fb), '만큼 달렸어요. 어느 열차가 구간의 몇 칸만큼 더 달렸어요?'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'which', label: '열차', options: TRAINS93 }, { key: 'cells', label: '몇 칸 더' }] },
    answer: { which: ans, cells: diff },
    discriminators: discs,
    grade(r) {
      if (blank93(r?.which) && blank93(r?.cells)) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '답을 먼저 써 볼까요?' };
      const w = String(r?.which ?? '').trim();
      const c = String(r?.cells ?? '').trim();
      if (w === ans && Number(c) === diff && c !== '') return { correct: true };
      if (w === ans && c.replace(/\s/g, '') === fr(diff, d)) return { correct: false, flags: { careless: true, reask: true }, kind: 'check', feedback: '구간의 몇 칸만큼인지 물었어요' };
      if (w !== ans && !blank93(r?.which)) return { correct: false, category: discs[0].category, kind: discs[0].kind ?? 'check', feedbackCheck: discs[0].feedbackCheck, feedback: discs[0].feedback };
      const hit = discs.slice(1).find((x) => Number(c) === x.value && c !== '');
      if (hit) return { correct: false, category: hit.category, kind: hit.kind ?? 'check', feedbackCheck: hit.feedbackCheck, feedback: hit.feedback };
      return { correct: false, category: null, kind: 'check', feedback: '몇 칸 더 칸을 다시 볼까요?' };
    },
    hints: [`가 열차는 구간의 ${fa}, 나 열차는 ${fb}만큼 달렸어요. 어느 열차가 몇 칸만큼 더 달렸는지 물어요.`, '구간을 똑같이 나눈 칸을 연습장에 그려 볼까요? 두 열차가 달린 칸 수를 견주어 봐요.', `가 열차는 ${a}칸, 나 열차는 ${b}칸만큼 달렸어요.`, `${hi} − ${lo} = ☐`],
    blank: `${hi} − ${lo} = ☐`,
    blankAnswer: String(diff),
    blankThen: '어느 열차가 더 달렸어요?',
    explain: {
      why: [`${fa}${jo(fa, '은', '는')} ${d}칸 중 ${a}칸, ${fb}${jo(fb, '은', '는')} ${d}칸 중 ${b}칸이에요.`, `${hi} − ${lo} = ${ieyo(diff)}.`, `그래서 ${ans} 열차가 ${diff}칸만큼 더 달렸어요.`],
      alt: [`분수로 쓰면 ${fr(hi, d)} − ${fr(lo, d)} = ${fr(diff, d)}${jo(diff, '이고', '고')}, 구간의 ${diff}칸이에요.`, `두 생각 모두 ${diff}칸이에요.`],
    },
  };
}

/** 3단계: 단위분수 + 이유 */
function t93Level3(a, b, rng) {
  const fa = fr(1, a);
  const fb = fr(1, b);
  const small = Math.min(a, b);
  const big = Math.max(a, b);
  const ans = a < b ? '가' : '나';
  const R_OK = `${small}칸으로 나눈 한 칸이 더 길어서`;
  const R_BIG = `${big}${jo(big, '이', '가')} ${small}보다 커서`;
  const R_NU = '분자가 같아서';
  const L = (a * b) / gcd(a, b);
  return {
    text: [`${TEST_RUN} 가 열차는 구간의 `, V(fa), ', 나 열차는 ', V(fb), '만큼 달렸어요. 더 많이 달린 열차와 그 이유를 골라요.'],
    figure: null,
    input: {
      kind: 'compound',
      fields: [
        { key: 'which', label: '더 많이 달린 열차', options: TRAINS93 },
        { key: 'why', label: '이유', options: rng.shuffle([R_OK, R_BIG, R_NU]) },
      ],
    },
    answer: { which: ans, why: R_OK },
    discriminators: [
      { key: 'why', value: R_BIG, category: '개념', kind: 'check', feedback: `${big}칸으로 나눈 한 칸이 더 길까요?` },
      { key: 'which', value: ans === '가' ? '나' : '가', category: '개념', kind: 'nudge', feedbackCheck: '띠 그림을 다시 볼까요?', feedback: '많이 나눌수록 한 칸은 어떻게 돼요?' },
      { key: 'why', value: R_NU, category: '개념', kind: 'nudge', feedbackCheck: '두 분수를 다시 볼까요?', feedback: '분자가 같으면 무엇을 견줘요?' },
    ],
    hints: [`같은 구간에서 가 열차는 ${fa}, 나 열차는 ${fb}만큼 달렸어요. 더 많이 달린 열차와 이유를 물어요.`, `같은 구간을 ${small}칸과 ${big}칸으로 나눈 그림을 연습장에 그려 볼까요?`, `${small}칸으로 나누면 한 칸이 더 길어요.`, '한 칸이 더 긴 쪽: ☐칸으로 나눈 구간'],
    blank: '☐칸으로 나눈 구간',
    blankAnswer: String(small),
    blankThen: '더 많이 달린 열차와 이유를 골라요.',
    explain: {
      why: [`같은 구간을 ${small}칸으로 나누면 ${big}칸으로 나눌 때보다 한 칸이 길어요.`, `1/${small}이 1/${big}보다 크니 ${ans} 열차가 더 많이 달렸어요.`],
      alt: [`구간을 ${L}칸이라고 생각하면 ${fa}${jo(fa, '은', '는')} ${L / a}칸, ${fb}${jo(fb, '은', '는')} ${L / b}칸이에요.`, `두 생각 모두 ${ans} 열차예요.`],
    },
  };
}

/** T9-3 같은 구간을 달린 만큼 (문장) — 1~3단계 */
const T9_3 = {
  id: 'T9-3',
  node: 'N09',
  title: '같은 구간을 달린 만큼',
  repr: '문장',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level <= 2) {
      const d = rng.int(5, 10);
      const [a, b] = draw(rng, () => [rng.int(1, d - 1), rng.int(1, d - 1)], ([x, y]) => x !== y && x + y !== d, [2, 1]);
      return level === 1 ? t93Level1(a, b, d) : t93Level2(a, b, d);
    }
    const [a, b] = draw(rng, () => [rng.int(2, 6), rng.int(2, 6)], ([x, y]) => x !== y, [3, 5]);
    return t93Level3(a, b, rng);
  },
};

export default [T9_1, T9_2, T9_3, D1, D2, D3];
