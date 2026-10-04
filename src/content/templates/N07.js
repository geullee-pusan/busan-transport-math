// N07 신평 — (두 자리)×(한 자리) [4수01-04]. 천장 6.
// 기준: docs/curriculum/07-line1-templates.md v2 7절. T7-3(도전, 5~6단계)은 T7-2의 5~6단계로 합쳤다.
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

/** (두 자리)×(한 자리) 판별 오답 */
function mulDiscs(a, m) {
  const t = Math.floor(a / 10);
  const u = a % 10;
  const c = Math.floor((u * m) / 10);
  const P = a * m;
  const list = [
    { value: (t * m) * 10 + ((u * m) % 10), category: '계산', kind: 'check', feedback: `일의 자리 ${u * m}에서 ${eun(c * 10)} 어디 갔나요?` },
    { value: t * 10 + u * m, category: '개념', kind: 'nudge', feedbackCheck: '십의 자리를 다시 볼까요?', feedback: `${a}의 ${t * 10}도 ${m}배 했나요?` },
    { value: a + m, category: '식', kind: 'nudge', feedbackCheck: '문제를 다시 읽어 볼까요?', feedback: '곱셈이에요. 몇 번 더하는 셈일까요?' },
  ];
  if (c > 0) list.unshift({ value: (t + c) * m * 10 + ((u * m) % 10), category: '개념', kind: 'check', feedback: '올린 수는 언제 더했나요?' });
  return uniq(list.filter((d) => c > 0 || d.category === '식'), P);
}

function mulHints(a, m, lead) {
  const t = Math.floor(a / 10);
  const u = a % 10;
  const P = a * m;
  const bl = blankAt(P, 1);
  if (u === 0) {
    return {
      hints: [lead, `${eun(a)} 10이 ${t}개예요. ${m}배 하면 10이 몇 개일까요?`, `${t} × ${m} = ${ieyo(t * m)}.`, `${a} × ${m} = ${bl.blank}`],
      blank: bl.blank,
      blankAnswer: bl.blankAnswer,
    };
  }
  return {
    hints: [lead, `${eul(a)} ${wa(t * 10)} ${u}${roOnly(u)} 나눠서 각각 ${m}배 해 볼까요? ${eul(a)} ${m}번 더해도 돼요.`, `${u} × ${m} = ${u * m}, ${t * 10} × ${m} = ${ieyo(t * 10 * m)}.`, `${t * 10 * m} + ${u * m} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
  };
}

function mulExplain(a, m, unit = '') {
  const t = Math.floor(a / 10);
  const u = a % 10;
  const P = a * m;
  if (u === 0) {
    return {
      why: [`${eun(a)} 10이 ${t}개예요.`, `${m}배 하면 10이 ${t * m}개라서 ${ieyo(P)}.`, `그래서 ${a} × ${m} = ${ieyo(P)}.`],
      alt: [`${eul(a)} ${m}번 더해도 ${ieyo(P)}.`, `어느 길로 해도 답은 ${ro(P)} 같아요.`],
    };
  }
  const up = (t + 1) * 10;
  return {
    why: [`${a} × ${m}${jo(m, '은', '는')} ${t * 10} × ${wa(m)} ${u} × ${eul(m)} 합친 거예요.`, `${t * 10 * m} + ${u * m} = ${ieyo(P)}.`, `그래서 ${a} × ${m} = ${P}${unit}${unit ? '이에요' : jo(P, '이에요', '예요')}.`],
    alt: [`${up} × ${m} = ${up * m}에서 ${10 - u} × ${m} = ${eul((10 - u) * m)} 빼요.`, `${up * m} − ${(10 - u) * m} = ${ieyo(P)}.`, `어느 길로 해도 답은 ${ro(P)} 같아요.`],
  };
}

function buildMul(a, m) {
  const P = a * m;
  return {
    text: [n(a), ' × ', n(m), ' = ?'],
    figure: { kind: 'vertical', op: '×', a, b: m },
    input: { kind: 'number' },
    answer: P,
    discriminators: mulDiscs(a, m),
    ...mulHints(a, m, `${wa(a)} ${m}의 곱을 물어요.`),
    explain: mulExplain(a, m),
  };
}

/** T7-1 정비창 점검 (식) — 1~3단계 */
const T7_1 = {
  id: 'T7-1',
  node: 'N07',
  title: '정비창 점검: (두 자리)×(한 자리)',
  repr: '식',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const tensOnly = level === 1 && rng.next() < 0.5;
    const [a, m] = draw(
      rng,
      () => [tensOnly ? rng.int(1, 9) * 10 : rng.int(11, 99), rng.int(2, 9)],
      ([x, y]) => {
        const t = Math.floor(x / 10);
        const u = x % 10;
        const c = Math.floor((u * y) / 10);
        const P = x * y;
        if (P % 10 === y && u !== 0) return false;
        if (u === 1 || (u === 0 && !tensOnly)) return false;
        if (level === 1) return u * y < 10 && t * y < 10;
        if (level === 2) return u * y >= 10 && t * y + c < 10;
        return u * y >= 10 && t * y + c >= 10;
      },
      level === 1 ? [32, 3] : level === 2 ? [27, 3] : [68, 7],
    );
    return buildMul(a, m);
  },
};

/** T7-2 1단계: (몇십) × 8 */
function t72Level1(c) {
  const P = c * 8;
  const bl = blankAt(P, 1);
  return {
    text: [L1(), '호선은 ', CARS(), '량이에요. 한 칸에 좌석이 ', V(c), '석이면 열차 좌석은 모두 몇 석이에요?'],
    figure: { kind: 'train', cars: 8 },
    input: { kind: 'number', unit: '석' },
    answer: P,
    discriminators: uniq(
      [
        { value: (c / 10) * 8, category: '계산', kind: 'check', feedback: '끝의 0은 어디 갔나요?' },
        { value: c + 8, category: '식', kind: 'nudge', feedbackCheck: '문제를 다시 읽어 볼까요?', feedback: '칸마다 같은 수예요. 몇 번 더할까요?' },
      ],
      P,
    ),
    hints: [`열차는 8칸이고, 한 칸에 좌석이 ${c}석이에요. 열차 전체 좌석 수를 물어요.`, `${c}석씩 8칸이에요. 10이 몇 개인지 생각해 볼까요?`, `${c / 10} × 8 = ${ieyo((c / 10) * 8)}.`, `${c} × 8 = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${c}석씩 8칸이니 ${c} × 8을 해요.`, `${eun(c)} 10이 ${c / 10}개라서 10이 ${(c / 10) * 8}개가 돼요.`, `그래서 모두 ${P}석이에요.`],
      alt: [`${c}을 8번 더해도 ${ieyo(P)}.`.replace(`${c}을`, eul(c)), `어느 길로 해도 답은 ${ro(P)} 같아요.`],
    },
  };
}

/** T7-2 2단계: 앞 k칸에 x명씩 */
function t72Level2(k, x) {
  const P = x * k;
  const h = mulHints(x, k, `앞 ${k}칸에 한 칸마다 ${x}명씩 탔어요. 앞 ${k}칸에 탄 사람 수를 모두 물어요.`);
  const e = mulExplain(x, k, '명');
  return {
    text: [L1(), '호선 열차 앞 ', V(k), '칸에 ', V(x), '명씩 탔어요. 앞 ', V(k), '칸에 탄 사람은 모두 몇 명이에요?'],
    figure: { kind: 'train', cars: 8, highlight: Array.from({ length: k }, (_, i) => i) },
    input: { kind: 'number', unit: '명' },
    answer: P,
    discriminators: mulDiscs(x, k),
    ...h,
    explain: { why: [...e.why.slice(0, -1), `그래서 모두 ${P}명이에요.`], alt: e.alt },
  };
}

/** T7-2 3단계: 칸 수가 다른 두 곱 비교 */
function t72Level3(a, k, b) {
  const ga = a * 8;
  const na = b * k;
  const more = ga > na ? '가' : '나';
  const bl = blankAt(na, 0);
  const rest = 8 - k;
  return {
    text: ['두 열차가 있어요. 가 열차는 ', CARS(), '량 모두에 ', V(a), '명씩, 나 열차는 ', CARS(), '량 중 ', V(k), '칸에만 ', V(b), '명씩 탔어요. 사람이 더 많이 탄 열차는 어느 쪽이에요?'],
    figure: { kind: 'trains', trains: [{ name: '가 열차', cars: 8 }, { name: '나 열차', cars: 8, filled: k }] },
    input: { kind: 'compound', fields: [{ key: 'ga', label: '가 열차' }, { key: 'na', label: '나 열차' }, { key: 'more', label: '더 많은 열차', options: ['가', '나'] }] },
    answer: { ga, na, more },
    discriminators: [
      { key: 'na', value: b * 8, category: '읽기', kind: 'check', feedback: '나 열차는 몇 칸에 탔나요?' },
      { key: 'more', value: more === '가' ? '나' : '가', category: '개념', kind: 'check', feedback: `${wa(ga)} ${eul(na)} 견주어 볼까요?` },
    ],
    hints: [`가 열차는 8칸에 ${a}명씩, 나 열차는 ${k}칸에 ${b}명씩 탔어요. 어느 열차에 사람이 더 많은지 물어요.`, '두 열차에 탄 사람을 각각 구해서 견주어 볼까요?', `가 열차는 ${a} × 8 = ${ga}명이에요.`, `나 열차는 ${b} × ${k} = ${bl.blank}명`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '더 많은 열차는 어느 쪽이에요?',
    explain: {
      why: [`가 열차는 ${a} × 8 = ${ga}명, 나 열차는 ${b} × ${k} = ${na}명이에요.`, `${more} 열차가 ${Math.abs(ga - na)}명 더 많아요.`, `그래서 더 많이 탄 열차는 ${more} 열차예요.`],
      alt: [
        `${k}칸끼리 견주면 나 열차가 한 칸에 ${b - a}명씩, 모두 ${(b - a) * k}명 더 많아요.`,
        `가 열차는 남은 ${rest}칸에 ${a * rest}명이 더 있어요.`,
        `${(b - a) * k}${jo((b - a) * k, '과', '와')} ${a * rest}${jo(a * rest, '을', '를')} 견주면 ${more} 열차가 더 많아요.`,
        `어느 길로 해도 답은 ${more} 열차로 같아요.`,
      ],
    },
  };
}

/** T7-2 4단계: ×를 +로 잘못 눌렀어요 */
function t72Level4(m, x) {
  const w = x + m;
  const P = x * m;
  const bl = blankAt(P, 1);
  return {
    text: ['앞 ', V(m), '칸에 같은 수만큼 탔어요. 역무원이 한 칸 사람 수에 ', V(m), jo(m, '을', '를'), ' 곱해야 하는데, 계산기에서 × 대신 +를 눌러 ', V(w), jo(w, '이', '가'), ' 나왔어요. 바르게 계산하면 얼마예요?'],
    figure: null,
    input: { kind: 'number' },
    answer: P,
    discriminators: uniq(
      [
        { value: w * m, category: '식', kind: 'nudge', feedbackCheck: `${eun(w)} 무엇을 곱한 결과예요?`, feedback: `${eun(w)} 잘못 나온 수예요. 한 칸 사람 수는요?` },
        { value: x, category: '식', kind: 'nudge', feedbackCheck: '무엇을 물었는지 다시 볼까요?', feedback: `${x}명을 찾았어요. 다음엔요?` },
        { value: w - m, category: '식', kind: 'nudge', feedbackCheck: '무엇을 물었는지 다시 볼까요?', feedback: `${x}명을 찾았어요. 다음엔요?` },
      ],
      P,
    ),
    hints: [`칸은 ${m}칸이에요. 계산기에서 잘못 누른 결과가 ${ieyo(w)}. 바르게 계산한 값을 물어요.`, '잘못 누른 계산을 거꾸로 해서 한 칸 사람 수부터 찾아볼까요?', `한 칸 사람 수는 ${w} − ${m} = ${ieyo(x)}.`, `${x} × ${m} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`+를 눌러 ${w}${jo(w, '이', '가')} 나왔으니 한 칸 사람 수는 ${w} − ${m} = ${ieyo(x)}.`, `바르게 계산하면 ${x} × ${m} = ${ieyo(P)}.`, `그래서 답은 ${ieyo(P)}.`],
      alt: [`${eul(x)} ${m}번 더해도 ${ieyo(P)}.`, `어느 길로 해도 답은 ${ro(P)} 같아요.`],
    },
  };
}

/** T7-2 5단계(도전): □u × m < T */
function t72Level5(u, m, k, T) {
  const answer = Array.from({ length: k }, (_, i) => i + 1);
  const rough = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => d * 10 * m < T);
  const discs = [{ value: answer.slice(0, -1), category: '개념', kind: 'nudge', feedbackCheck: '빠진 것이 없나요?', feedback: `${k}${u} × ${m}도 계산해 봤나요?` }];
  if (rough.length !== answer.length) discs.push({ value: rough, category: '개념', kind: 'check', feedback: `${k + 1}${u} × ${m}도 계산해 봤나요?` });
  return {
    text: [unknown(`□${u}`), ' × ', n(m), jo(m, '이', '가'), ' ', n(T), '보다 작아요. □에 들어갈 수 있는 수를 모두 골라요.'],
    figure: null,
    challenge: true,
    input: { kind: 'multi', options: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    answer,
    discriminators: discs,
    grade: multiGrade(answer, discs),
    hints: [`□${u}에 ${m}배 한 값이 ${T}보다 작게 되는 □를 모두 찾아요.`, '□에 1부터 차례로 넣어 볼까요? 조건이 바뀌는 곳을 찾아봐요.', `□가 ${k}이면 ${k}${u} × ${m} = ${ieyo((10 * k + u) * m)}.`.replace(`${k}이면`, `${k}${jo(k, '이면', '면')}`), '들어갈 수 있는 수: 1부터 ☐까지'],
    blank: '1부터 ☐까지',
    blankAnswer: String(k),
    explain: {
      why: [
        `${k}${u} × ${m} = ${ro((10 * k + u) * m)} ${T}보다 작아요.`,
        `${k + 1}${u} × ${m} = ${ro((10 * (k + 1) + u) * m)} ${T}보다 커요.`,
        `그래서 들어갈 수 있는 수는 1부터 ${k}까지예요.`,
      ],
      alt: [`어림해서 □0 × ${m}부터 보고, 경계의 수만 정확히 계산해도 돼요.`, `어느 길로 해도 답은 1부터 ${k}까지로 같아요.`],
    },
  };
}

/** T7-2 6단계(도전): 숫자 카드 3장으로 가장 큰 곱 */
function t72Level6(cards) {
  let best = 0;
  let pair = null;
  const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  for (const [i, j, k] of perms) {
    const v = (cards[i] * 10 + cards[j]) * cards[k];
    if (v > best) {
      best = v;
      pair = [cards[i] * 10 + cards[j], cards[k]];
    }
  }
  const d = [...cards].sort((x, y) => y - x);
  const wrong = (d[0] * 10 + d[1]) * d[2];
  const bl = blankAt(best, 1);
  return {
    text: ['숫자 카드 ', n(cards[0]), ', ', n(cards[1]), ', ', n(cards[2]), jo(cards[2], '을', '를'), ' 한 번씩 써서 (두 자리 수) × (한 자리 수)를 만들어요. 곱이 가장 클 때는 얼마예요?'],
    figure: { kind: 'cards', cards },
    challenge: true,
    input: { kind: 'number' },
    answer: best,
    discriminators: uniq([{ value: wrong, category: '개념', kind: 'check', feedback: '다른 자리에도 놓아 봤나요?' }], best),
    hints: ['카드 세 장으로 두 자리 수 하나와 한 자리 수 하나를 만들어요. 두 수의 곱이 가장 클 때를 물어요.', '가장 큰 숫자를 한 자리 수 자리에 놓으면 어떨까요? 여러 가지로 놓아 견주어 봐요.', `${d[0] * 10 + d[1]} × ${d[2]} = ${ieyo(wrong)}.`, `${pair[0]} × ${pair[1]} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: ['한 자리 수는 두 자리 수 전체에 곱해져서 힘이 커요.', `여섯 가지를 모두 견주면 ${pair[0]} × ${pair[1]} = ${ro(best)} 가장 커요.`, `그래서 가장 큰 곱은 ${ieyo(best)}.`],
      alt: [`${d[0] * 10 + d[1]} × ${d[2]} = ${ieyo(wrong)}. ${best}보다 작아요.`.replace(`${best}보다`, `${best}보다`), `어느 길로 해도 답은 ${ro(best)} 같아요.`],
    },
  };
}

/** T7-2 칸마다 같은 수 (문장 + 그림) — 1~6단계(5~6단계는 07의 T7-3 도전 문제) */
const T7_2 = {
  id: 'T7-2',
  node: 'N07',
  title: '칸마다 같은 수',
  repr: '문장',
  minLevel: 1,
  maxLevel: 6,
  generate(rng, level) {
    if (level === 1) return t72Level1(rng.pick([30, 40, 50]));
    if (level === 2) {
      const [k, x] = draw(
        rng,
        () => [rng.int(2, 5), rng.int(12, 49)],
        ([kk, xx]) => {
          const u = xx % 10;
          const t = Math.floor(xx / 10);
          const c = Math.floor((u * kk) / 10);
          return u * kk >= 10 && t * kk + c < 10 && xx !== kk && (xx * kk) % 10 !== kk;
        },
        [3, 27],
      );
      return t72Level2(k, x);
    }
    if (level === 3) {
      const [a, k, b] = draw(
        rng,
        () => [rng.int(15, 35), rng.pick([5, 6, 7]), rng.int(16, 45)],
        ([aa, kk, bb]) => bb > aa && Math.abs(aa * 8 - bb * kk) >= 1 && Math.abs(aa * 8 - bb * kk) <= 5,
        [23, 6, 31],
      );
      return t72Level3(a, k, b);
    }
    if (level === 4) {
      const [m, x] = draw(rng, () => [rng.int(3, 7), rng.int(12, 30)], ([mm, xx]) => ![mm, xx + mm].includes(xx * mm) && xx % 10 !== 0, [6, 14]);
      return t72Level4(m, x);
    }
    if (level === 5) {
      const [u, m, k, T] = draw(
        rng,
        () => {
          const uu = rng.int(1, 9);
          const mm = rng.int(3, 8);
          const kk = rng.int(2, 7);
          const lo = (10 * kk + uu) * mm;
          const hi = (10 * (kk + 1) + uu) * mm;
          const TT = Math.ceil((lo + 1) / 100) * 100;
          return [uu, mm, kk, TT <= hi ? TT : 0];
        },
        ([, , , TT]) => TT > 0,
        [4, 6, 4, 300],
      );
      return t72Level5(u, m, k, T);
    }
    const cards = draw(rng, () => rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3), () => true, [2, 5, 7]);
    return t72Level6(cards);
  },
};

/** 급행 통과 진단 */
const D1 = {
  id: 'N07-D1',
  node: 'N07',
  title: '급행 진단: 올림이 두 번',
  repr: '식',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...buildMul(68, 7), hints: [], blank: null };
  },
};
const D2 = {
  id: 'N07-D2',
  node: 'N07',
  title: '급행 진단: 잘못 누른 계산기',
  repr: '문장',
  minLevel: 4,
  maxLevel: 4,
  diagnostic: true,
  generate() {
    return { ...t72Level4(6, 14), hints: [], blank: null };
  },
};
const D3 = {
  id: 'N07-D3',
  node: 'N07',
  title: '급행 진단(예비): 두 열차 비교',
  repr: '문장',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...t72Level3(23, 6, 31), hints: [], blank: null };
  },
};

// ── T7-4 넓이 모형으로 쪼개기 (빈칸) — 09-templates-additions.md 7절 ──
// figure: { kind: 'areaModel', parts: [[가로 조각들(십의 자리 몇십, 일의 자리)], [세로 조각들(곱하는 수)]] }
function t74(a, m) {
  const t = Math.floor(a / 10);
  const u = a % 10;
  const T = t * 10;
  const p1 = T * m;
  const p2 = u * m;
  const P = a * m;
  const bl = p2 >= 10 ? blankAt(p2, 1) : { blank: '☐', blankAnswer: String(p2) };
  const discs = [
    { key: 'p1', value: t * m, category: '개념', kind: 'check', feedback: `${T} × ${eun(m)} ${t} × ${m}${jo(m, '과', '와')} 같나요?` },
    ...mulDiscs(a, m).map((d) => ({ ...d, key: 'total' })),
  ];
  const alt =
    m <= 4
      ? [`${Array(m).fill(a).join(' + ')} = ${ieyo(P)}.`, `두 풀이 모두 ${P}개예요.`]
      : [`${(t + 1) * 10} × ${m} = ${(t + 1) * 10 * m}에서 ${10 - u} × ${m} = ${eul((10 - u) * m)} 빼요.`, `${(t + 1) * 10 * m} − ${(10 - u) * m} = ${ieyo(P)}.`, `두 풀이 모두 ${P}개예요.`];
  return {
    text: ['역 대합실에 의자가 한 줄에 ', V(a), '개씩 ', V(m), '줄 있어요. 그림을 나눠서 의자 수를 구해요.'],
    figure: { kind: 'areaModel', parts: [[T, u], [m]] },
    input: {
      kind: 'compound',
      fields: [
        { key: 'p1', label: `${T} × ${m}` },
        { key: 'p2', label: `${u} × ${m}` },
        { key: 'total', label: '모두' },
      ],
    },
    answer: { p1, p2, total: P },
    discriminators: discs,
    hints: [
      `한 줄에 ${a}개씩 ${m}줄이에요. 그림은 ${wa(T)} ${u}${roOnly(u)} 나뉘어 있어요. 의자 수를 물어요.`,
      '그림의 두 부분을 각각 구해 볼까요? 두 부분을 합치면 전체예요.',
      `${T} × ${m} = ${ieyo(p1)}.`,
      `${u} × ${m} = ${bl.blank}`,
    ],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '"모두" 칸도 채워요.',
    explain: {
      why: [`${a} × ${m}${jo(m, '은', '는')} ${T} × ${wa(m)} ${u} × ${m}${roOnly(m)} 나눌 수 있어요.`, `${p1} + ${p2} = ${P}개예요.`, `그래서 의자는 ${P}개예요.`],
      alt,
    },
  };
}

/** T7-4 넓이 모형으로 쪼개기 (빈칸) — 1~3단계 */
const T7_4 = {
  id: 'T7-4',
  node: 'N07',
  title: '넓이 모형으로 쪼개기',
  repr: '빈칸',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const [a, m] = draw(
      rng,
      () => [rng.int(12, 99), rng.int(2, 9)],
      ([x, y]) => {
        const t = Math.floor(x / 10);
        const u = x % 10;
        const c = Math.floor((u * y) / 10);
        if (u < 2 || (x * y) % 10 === y) return false;
        if (level === 1) return u * y < 10 && t * y < 10;
        if (level === 2) return u * y >= 10 && t * y + c < 10;
        return u * y >= 10 && t * y >= 10;
      },
      level === 1 ? [23, 3] : level === 2 ? [27, 3] : [68, 7],
    );
    return t74(a, m);
  },
};

export default [T7_1, T7_2, T7_4, D1, D2, D3];
