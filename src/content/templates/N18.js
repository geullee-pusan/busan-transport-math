// N18 중앙 — 단위분수·진분수·가분수·대분수 [4수01-10]. 천장 6.
// 기준: docs/curriculum/08-line1-templates-11-20.md 18절(1호선 열차 한 대 8량을 1로 보는 칸 그림), 09 끝 보강 후보(문장: 대분수 ↔ 가분수 이야기). 피드백 꼬리표 kind: 'check' | 'nudge'(10 문서 2절).
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
// 대분수 글자는 "2와 5/8". 우리말로 "이와 팔분의 오"라 끝 글자의 조사는 분자로 정한다(mjo).

const fr = (a, b) => `${a}/${b}`;
const mix = (w, r) => `${w}${jo(w, '과', '와')} ${r}/8`;
const mjo = (r, c, v) => jo(r, c, v);
const blankOf = (v) => (v >= 10 ? blankAt(v, 0) : { blank: '☐', blankAnswer: String(v) });
const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';
const parseFr = (s) => {
  const m = String(s ?? '').trim().match(/^(\d+)\s*\/\s*(\d+)$/);
  return m ? [Number(m[1]), Number(m[2])] : null;
};

/** 분모가 8인 가분수 채점: 값이 같아도 분모가 다르면 다시 묻기(형식을 배우는 역, 07 0.7절) */
function fracGrade(num, discs) {
  return (r) => {
    if (isBlank(r)) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '답을 먼저 써 볼까요?' };
    const p = parseFr(r);
    if (!p || p[1] === 0) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '분수로 써 볼까요?' };
    if (p[0] === num && p[1] === 8) return { correct: true };
    if (p[0] * 8 === num * p[1]) return { correct: false, flags: { careless: true, reask: true }, kind: 'check', feedback: '분모가 8인 분수로 써 볼까요?' };
    const d = discs.find((x) => {
      const q = parseFr(x.value);
      return q && q[0] === p[0] && q[1] === p[1];
    });
    return d ? { correct: false, category: d.category, kind: d.kind ?? 'check', feedbackCheck: d.feedbackCheck, feedback: d.feedback } : { correct: false, category: null, kind: 'check', feedback: null };
  };
}

// ── T18-1 열차 한 대를 1로 (그림 → 분수) — 1~6단계 ──

/** 1단계: 그림 → 가분수 */
function t181Level1(k) {
  const num = 8 + k;
  const ans = fr(num, 8);
  const bl = blankOf(num);
  const discs = [
    { value: fr(k, 8), category: '개념', kind: 'check', feedback: '열차 한 대의 칸도 셌나요?' },
    { value: fr(num, 16), category: '개념', kind: 'check', feedback: '전체 1은 몇 칸이에요?' },
  ];
  return {
    text: [L1(), '호선 열차 한 대(', CARS(), '량)를 ', n(1), jo(1, '로', '로'), ' 보면 그림의 칸은 모두 얼마예요? 가분수로 써요.'],
    figure: { kind: 'trains', trains: [{ name: '열차 한 대', cars: 8 }, { name: '', cars: k }] },
    input: { kind: 'fraction' },
    answer: ans,
    discriminators: discs,
    grade: fracGrade(num, discs),
    hints: ['열차 한 대(8량)를 1로 봐요. 그림의 칸이 모두 얼마인지 가분수로 물어요.', '한 칸은 1/8이에요. 칸이 모두 몇 개인지 세어 볼까요?', '열차 한 대는 8/8이에요.', `1/8이 ${bl.blank}개`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '가분수로 써요.',
    explain: {
      why: ['열차 한 대를 1로 보면 한 칸은 1/8이에요.', `칸은 8 + ${k} = ${num}개라서 1/8이 ${num}개예요.`, `그래서 그림의 칸은 ${ieyo(ans)}.`],
      alt: [`대분수로 쓰면 ${mix(1, k)}${mjo(k, '이에요', '예요')}. 가분수로 바꾸면 ${ieyo(ans)}.`, `두 생각 모두 ${ieyo(ans)}.`],
    },
  };
}

/** 2단계: 가분수 → 대분수 */
function t181Level2(N) {
  const w = Math.floor(N / 8);
  const r = N % 8;
  const answer = { w, num: r, den: 8 };
  return {
    text: [n(fr(N, 8)), jo(N, '을', '를'), ' 대분수로 써요.'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'w', label: '자연수' }, { key: 'num', label: '분자' }, { key: 'den', label: '분모' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'den', value: N, category: '개념', kind: 'nudge', feedbackCheck: '분모를 다시 볼까요?', feedback: `8/8이 1이에요. ${fr(N, 8)}에서 1을 빼면요?` },
        { key: 'num', value: N, category: '개념', kind: 'nudge', feedbackCheck: '분자를 다시 볼까요?', feedback: `8/8이 1이에요. ${fr(N, 8)}에서 1을 빼면요?` },
        { key: 'w', value: 0, category: '개념', kind: 'check', feedback: '자연수 부분을 다시 볼까요?' },
      ],
      answer,
    ),
    hints: [`${eul(fr(N, 8))} 대분수로 쓰는 문제예요.`, '8/8은 1이에요. 1을 몇 번 덜어 낼 수 있는지 볼까요?', `${fr(N, 8)}${jo(N, '은', '는')} 1/8이 ${N}개예요.`, `8/8을 덜어 낼 수 있는 횟수: ☐번`],
    blank: '☐번',
    blankAnswer: String(w),
    blankThen: '대분수로 써요.',
    explain: {
      why: [`8/8이 1이라서 1/8 ${N}개에서 8개씩 ${w}번 묶을 수 있어요.`, `남는 것은 1/8이 ${r}개예요.`, `그래서 ${fr(N, 8)} = ${mix(w, r)}${mjo(r, '이에요', '예요')}.`],
      alt: [`${N} ÷ 8 = ${w} … ${r}, 몫이 자연수, 나머지가 분자예요.`, `두 풀이 모두 ${mix(w, r)}${mjo(r, '이에요', '예요')}.`],
    },
  };
}

/** 3단계: 가분수 고르기 */
function t181Level3(p, q, c, d, order) {
  const items = { proper: fr(p, 8), whole: '8/8', improper: fr(q, 8), mixed: mix(c, d) };
  const options = order.map((k) => items[k]);
  const answer = options.filter((o) => o === items.whole || o === items.improper);
  const sortA = (arr) => options.filter((o) => arr.includes(o));
  const discs = [
    { value: sortA([...answer, items.mixed]), category: '개념', kind: 'nudge', feedbackCheck: `${items.mixed}의 모양을 다시 볼까요?`, feedback: `${items.mixed}${mjo(d, '은', '는')} 대분수예요.` },
    { value: sortA([items.improper]), category: '개념', kind: 'nudge', feedbackCheck: '빠진 것이 없나요?', feedback: '분자와 분모가 같은 분수는요?' },
    { value: sortA([...answer, items.proper]), category: '개념', kind: 'check', feedback: `${items.proper}${jo(p, '은', '는')} 1보다 작지 않나요?` },
  ];
  return {
    text: [n(items[order[0]]), ', ', n(items[order[1]]), ', ', n(items[order[2]]), ', ', n(items[order[3]]), ' 중 가분수를 모두 골라요.'],
    figure: null,
    input: { kind: 'multi', options },
    answer,
    discriminators: uniq(discs, answer),
    grade: multiGrade(answer, discs),
    hints: ['분수 네 개 중 가분수를 모두 물어요.', '분수마다 분자와 분모의 크기를 견주어 볼까요?', '분자가 분모와 같거나 분모보다 큰 분수가 가분수예요.', '가분수는 모두 ☐개'],
    blank: '모두 ☐개',
    blankAnswer: '2',
    blankThen: '가분수를 골라요.',
    explain: {
      why: [`${items.proper}${jo(p, '은', '는')} 분자가 분모보다 작은 진분수, ${items.mixed}${mjo(d, '은', '는')} 자연수와 진분수로 된 대분수예요.`, `8/8과 ${items.improper}${jo(q, '은', '는')} 분자가 분모와 같거나 커요.`, `그래서 가분수는 8/8과 ${ieyo(items.improper)}.`],
      alt: ['1과 같거나 1보다 큰 수를 분수 하나로 쓴 것이 가분수예요.', `두 생각 모두 8/8과 ${ieyo(items.improper)}.`],
    },
  };
}

/** 4단계: 대분수만큼의 칸 수 */
function t181Level4(a, b) {
  const ans = 8 * a + b;
  return {
    text: [L1(), '호선 열차 한 대는 ', CARS(), '량이에요. 어느 날 차량 기지에 ', L1(), '호선 열차 ', V(mix(a, b)), '대만큼의 칸이 있었어요. 칸은 모두 몇 량이에요?'],
    figure: null,
    input: { kind: 'number', unit: '량' },
    answer: ans,
    discriminators: uniq(
      [
        { value: 10 * a + b, category: '개념', kind: 'check', feedback: `열차 ${a}대는 몇 량이에요?` },
        { value: 8 + b, category: '개념', kind: 'check', feedback: `열차 ${a}대는 몇 량이에요?` },
        { value: a + b, category: '개념', kind: 'check', feedback: `열차 ${a}대는 몇 량이에요?` },
      ],
      ans,
    ),
    hints: [`칸은 1호선 열차 ${mix(a, b)}대만큼 있어요. 모두 몇 량인지 물어요.`, `열차 한 대는 8량이에요. ${a}대와 ${b}/8대를 따로 생각해 볼까요?`, `열차 ${a}대는 ${8 * a}량이에요.`, `${b}/8대는 ☐량`],
    blank: '☐량',
    blankAnswer: String(b),
    blankThen: '칸은 모두 몇 량이에요?',
    explain: {
      why: [`열차 한 대가 8량이니 ${a}대는 ${8 * a}량, ${b}/8대는 ${b}량이에요.`, `모두 ${8 * a} + ${b} = ${ans}량이에요.`, `그래서 ${mix(a, b)} = ${fr(ans, 8)}, 칸은 ${ans}량이에요.`],
      alt: [`${mix(a, b)}${mjo(b, '을', '를')} 가분수로 바꾸면 ${fr(ans, 8)}, 곧 1/8(1량)이 ${ans}개예요.`, `두 풀이 모두 ${ans}량이에요.`],
    },
  };
}

/** 5단계: 자연수 부분이 w인 □/8의 양 끝 */
function t181Level5(w) {
  const min = fr(8 * w + 1, 8);
  const max = fr(8 * w + 7, 8);
  const answer = { min, max };
  const bl = blankOf(8 * w + 1);
  return {
    text: [unknown('□/8'), '을 대분수로 나타내면 자연수 부분이 ', n(w), jo(w, '이에요', '예요'), '. 이런 ', unknown('□/8'), ' 중 가장 작은 것과 가장 큰 것은 무엇이에요?'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'min', label: '가장 작은 것', kind: 'fraction' }, { key: 'max', label: '가장 큰 것', kind: 'fraction' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'min', value: fr(8 * w, 8), category: '개념', kind: 'check', feedback: `${fr(8 * w, 8)}${jo(8 * w, '을', '를')} 대분수로 나타낼 수 있나요?` },
        { key: 'max', value: fr(8 * w + 8, 8), category: '개념', kind: 'check', feedback: `${fr(8 * w + 8, 8)}의 자연수 부분은 ${w}인가요?` },
      ],
      answer,
    ),
    hints: [`□/8을 대분수로 나타내면 자연수 부분이 ${ieyo(w)}. 그런 분수 중 가장 작은 것과 가장 큰 것을 물어요.`, `자연수 부분이 ${w}인 대분수를 작은 것부터 적어 볼까요?`, `자연수 부분이 ${w}인 대분수는 ${mix(w, 1)}부터 ${mix(w, 7)}까지예요.`, `${mix(w, 1)} = ${bl.blank}/8`],
    blank: `${bl.blank}/8`,
    blankAnswer: bl.blankAnswer,
    blankThen: '가장 작은 것과 가장 큰 것을 써요.',
    explain: {
      why: [`${w} = ${fr(8 * w, 8)}이고, ${w + 1} = ${fr(8 * w + 8, 8)}이에요.`, `자연수 부분이 ${w}이려면 ${fr(8 * w, 8)}보다 크고 ${fr(8 * w + 8, 8)}보다 작아야 해요.`, `그래서 가장 작은 것은 ${min}, 가장 큰 것은 ${ieyo(max)}.`],
      alt: [`${mix(w, 1)}과 ${mix(w, 7)}을 가분수로 바꿔도 ${min}, ${max}예요.`.replace(`${mix(w, 1)}과`, `${mix(w, 1)}${mjo(1, '과', '와')}`).replace(`${mix(w, 7)}을`, `${mix(w, 7)}${mjo(7, '을', '를')}`).replace(`${max}예요`, ieyo(max)), `두 풀이 모두 ${wa(min)} ${ieyo(max)}.`],
    },
  };
}

/** 6단계: x/8 ○ a와 b/8 */
const SIGNS = ['>', '=', '<'];
function t181Level6(x, a, b) {
  const v = 8 * a + b;
  const ans = x > v ? '>' : x < v ? '<' : '=';
  const bl = blankOf(v);
  return {
    text: [n(fr(x, 8)), ' ○ ', n(mix(a, b)), '에서 ○ 안에 알맞은 기호를 골라요.'],
    figure: null,
    input: { kind: 'choice', options: SIGNS },
    answer: ans,
    discriminators: SIGNS.filter((s) => s !== ans).map((s) => (s === '=' ? { value: s, category: '개념', kind: 'check', feedback: '두 수가 같은 크기일까요?' } : { value: s, category: '개념', kind: 'nudge', feedbackCheck: '두 수를 다시 볼까요?', feedback: '같은 꼴로 바꿔 견주어 볼까요?' })),
    hints: [`${wa(fr(x, 8))} ${mix(a, b)}의 크기를 견주는 기호를 물어요.`, '두 수를 같은 꼴로 바꿔 볼까요? 가분수끼리 견주면 쉬워요.', `${eun(a)} 8/8이 ${a}개예요.`, `${mix(a, b)} = ${bl.blank}/8`],
    blank: `${bl.blank}/8`,
    blankAnswer: bl.blankAnswer,
    blankThen: '알맞은 기호는 무엇이에요?',
    explain: {
      why: [`${mix(a, b)}${mjo(b, '을', '를')} 가분수로 바꾸면 ${ieyo(fr(v, 8))}.`, `${wa(fr(x, 8))} ${fr(v, 8)}의 분자를 견주면 ${wa(x)} ${ieyo(v)}.`, `그래서 ${fr(x, 8)} ${ans} ${mix(a, b)}${mjo(b, '이에요', '예요')}.`],
      alt: [`${fr(x, 8)}${jo(x, '을', '를')} 대분수로 바꾸면 ${mix(Math.floor(x / 8), x % 8)}${mjo(x % 8, '이에요', '예요')}. 대분수끼리 견주어도 돼요.`, `어느 길로 해도 답은 ${ans}로 같아요.`],
    },
  };
}

const T18_1 = {
  id: 'T18-1',
  node: 'N18',
  title: '열차 한 대를 1로',
  repr: '그림',
  minLevel: 1,
  maxLevel: 6,
  generate(rng, level) {
    if (level === 1) return t181Level1(rng.int(1, 7));
    if (level === 2) return t181Level2(draw(rng, () => rng.int(9, 23), (N) => N % 8 !== 0, 11));
    if (level === 3) {
      const q = draw(rng, () => rng.int(9, 20), (v) => v !== 16, 13);
      return t181Level3(rng.int(1, 7), q, rng.int(1, 2), rng.int(1, 7), rng.shuffle(['proper', 'whole', 'improper', 'mixed']));
    }
    if (level === 4) return t181Level4(rng.int(1, 3), rng.int(1, 7));
    if (level === 5) return t181Level5(rng.int(1, 3));
    const [x, a, b] = draw(rng, () => [rng.int(9, 30), rng.int(1, 3), rng.int(1, 7)], ([xx, aa, bb]) => xx % 8 !== 0 && xx !== 8 * aa + bb && Math.abs(xx - 8 * aa - bb) <= 4 && xx % 8 !== bb, [19, 2, 5]);
    return t181Level6(x, a, b);
  },
};

// ── T18-2 대분수 ↔ 가분수 이야기 (문장) — 1~3단계, 09 보강 후보 ──
function t182Level1(N) {
  const w = Math.floor(N / 8);
  const r = N % 8;
  const answer = { w, num: r, den: 8 };
  return {
    text: ['어느 날 차량 기지에 ', L1(), '호선 칸이 ', V(N), '량 있었어요. 열차 한 대(', CARS(), '량)를 ', n(1), '로 보면 열차 몇 대만큼이에요? 대분수로 써요.'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'w', label: '자연수' }, { key: 'num', label: '분자' }, { key: 'den', label: '분모' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'den', value: N, category: '개념', kind: 'nudge', feedbackCheck: '분모를 다시 볼까요?', feedback: '열차 한 대가 1이에요. 한 대는 몇 량이죠?' },
        { key: 'num', value: N, category: '개념', kind: 'check', feedback: '열차 몇 대를 다 채우고 남는 칸은요?' },
        { key: 'w', value: 0, category: '개념', kind: 'check', feedback: '자연수 부분을 다시 볼까요?' },
      ],
      answer,
    ),
    hints: [`칸이 ${N}량 있어요. 열차 한 대(8량)를 1로 볼 때 열차 몇 대만큼인지 대분수로 물어요.`, '8량씩 묶어 열차를 채워 볼까요? 남는 칸은 한 대의 몇 분의 몇인지 생각해요.', '한 칸은 열차 한 대의 1/8이에요.', '8량씩 채운 열차: ☐대'],
    blank: '☐대',
    blankAnswer: String(w),
    blankThen: '대분수로 써요.',
    explain: {
      why: [`${N}량은 8량짜리 열차 ${w}대와 ${r}량이에요.`, `${r}량은 한 대의 ${ieyo(fr(r, 8))}.`, `그래서 열차 ${mix(w, r)}대만큼이에요.`],
      alt: [`${N}량은 1/8이 ${N}개라서 ${fr(N, 8)}, 대분수로 ${mix(w, r)}${mjo(r, '이에요', '예요')}.`, `두 풀이 모두 ${mix(w, r)}${mjo(r, '이에요', '예요')}.`],
    },
  };
}

function t182Level2(a, b) {
  const num = 8 * a + b;
  const ans = fr(num, 8);
  const bl = blankOf(num);
  const discs = [
    { value: fr(10 * a + b, 8), category: '개념', kind: 'check', feedback: `${eun(a)} 8/8이 몇 개예요?` },
    { value: fr(a + b, 8), category: '개념', kind: 'check', feedback: `${eun(a)} 8/8이 몇 개예요?` },
  ];
  return {
    text: ['어느 날 정비창에 ', L1(), '호선 열차 ', V(mix(a, b)), '대만큼의 칸이 들어왔어요. 열차 한 대를 ', n(1), '로 보고 이 수를 가분수로 써요.'],
    figure: { kind: 'trains', trains: [...Array.from({ length: a }, () => ({ name: '', cars: 8 })), { name: '', cars: b }] },
    input: { kind: 'fraction' },
    answer: ans,
    discriminators: uniq(discs, ans),
    grade: fracGrade(num, discs),
    hints: [`칸은 열차 ${mix(a, b)}대만큼이에요. 이 수를 가분수로 물어요.`, `열차 한 대는 8/8이에요. ${a}대는 1/8이 몇 개일까요?`, `${a}대는 ${fr(8 * a, 8)}이에요.`, `1/8이 ${bl.blank}개`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '가분수로 써요.',
    explain: {
      why: [`${eun(a)} ${fr(8 * a, 8)}이고, 여기에 ${b}/8을 더해요.`, `1/8이 ${8 * a} + ${b} = ${num}개예요.`, `그래서 ${mix(a, b)} = ${ieyo(ans)}.`],
      alt: [`그림의 칸을 세어도 ${num}칸, 곧 ${ieyo(ans)}.`, `두 풀이 모두 ${ieyo(ans)}.`],
    },
  };
}

function t182Level3(a, b, M, gaFirst) {
  const ga = 8 * a + b;
  const more = ga > M ? '가' : '나';
  const answer = { ga, more };
  return {
    text: ['가 차량 기지에는 ', L1(), '호선 열차 ', V(mix(a, b)), '대만큼의 칸이 있고, 나 차량 기지에는 칸이 ', V(M), '량 있어요. 칸이 더 많은 기지는 어디예요?'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'ga', label: '가 기지의 칸(량)' }, { key: 'more', label: '더 많은 기지', options: ['가', '나'] }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'ga', value: 10 * a + b, category: '개념', kind: 'check', feedback: `열차 ${a}대는 몇 량이에요?` },
        { key: 'more', value: more === '가' ? '나' : '가', category: '개념', kind: 'check', feedback: '두 기지의 칸 수를 다시 견주어 볼까요?' },
      ],
      answer,
    ),
    hints: [`가 기지는 열차 ${mix(a, b)}대만큼, 나 기지는 ${M}량이에요. 칸이 더 많은 기지를 물어요.`, '가 기지의 칸이 몇 량인지 먼저 구해 볼까요?', `열차 ${a}대는 ${8 * a}량이에요.`, `${b}/8대는 ☐량`],
    blank: '☐량',
    blankAnswer: String(b),
    blankThen: '칸이 더 많은 기지는 어디예요?',
    explain: {
      why: [`가 기지는 ${8 * a} + ${b} = ${ga}량이에요.`, `${wa(ga)} ${M}${jo(M, '을', '를')} 견주면 ${more} 기지가 ${Math.abs(ga - M)}량 더 많아요.`, `그래서 칸이 더 많은 기지는 ${more} 기지예요.`],
      alt: [`나 기지의 ${M}량을 열차 대수로 바꾸면 ${mix(Math.floor(M / 8), M % 8)}대예요. 대분수끼리 견주어도 돼요.`, `두 풀이 모두 ${more} 기지예요.`],
    },
  };
}

const T18_2 = {
  id: 'T18-2',
  node: 'N18',
  title: '대분수와 가분수 이야기',
  repr: '문장',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 1) return t182Level1(draw(rng, () => rng.int(9, 31), (N) => N % 8 !== 0, 13));
    if (level === 2) return t182Level2(rng.int(1, 3), rng.int(1, 7));
    const [a, b, M] = draw(rng, () => [rng.int(1, 3), rng.int(1, 7), rng.int(9, 31)], ([aa, bb, MM]) => MM % 8 !== 0 && MM !== 8 * aa + bb && Math.abs(MM - 8 * aa - bb) <= 3 && MM !== 10 * aa + bb, [2, 3, 20]);
    return t182Level3(a, b, M);
  },
};

// ── T18-3 가분수 ↔ 대분수 틀 (빈칸) — 1~3단계 ──
function t183Mixed(a, b) {
  const ans = 8 * a + b;
  const bl = blankOf(ans);
  return {
    text: [n(mix(a, b)), ' = ', unknown('□'), '/', n(8), '에서 □에 알맞은 수를 써요.'],
    figure: null,
    input: { kind: 'number' },
    answer: ans,
    discriminators: uniq(
      [
        { value: 10 * a + b, category: '개념', kind: 'check', feedback: `${eun(a)} 8/8이 몇 개예요?` },
        { value: a + b, category: '개념', kind: 'check', feedback: `${eun(a)} 8/8이 몇 개예요?` },
        { value: b, category: '개념', kind: 'check', feedback: `자연수 ${a}도 넣었나요?` },
      ],
      ans,
    ),
    hints: [`${mix(a, b)}${mjo(b, '을', '를')} 분모가 8인 가분수로 나타내는 문제예요.`, `자연수 ${a}${jo(a, '을', '를')} 분모가 8인 분수로 바꿔 볼까요?`, `${a} = ${fr(8 * a, 8)}이에요.`, `${fr(8 * a, 8)}${jo(8 * a, '과', '와')} ${b}/8을 합치면 ${bl.blank}/8`],
    blank: `${bl.blank}/8`,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${eun(a)} 8/8이 ${a}개라서 ${ieyo(fr(8 * a, 8))}.`, `${fr(8 * a, 8)}${jo(8 * a, '과', '와')} ${b}/8을 합치면 1/8이 ${ans}개예요.`, `그래서 □는 ${ieyo(ans)}.`],
      alt: [`${a} × 8 + ${b} = ${ro(ans)} 구해도 같아요.`, `두 풀이 모두 ${ieyo(ans)}.`],
    },
  };
}

function t183Improper(N) {
  const w = Math.floor(N / 8);
  const r = N % 8;
  const answer = { w, num: r };
  return {
    text: [n(fr(N, 8)), ' = ', unknown('□'), '와 ', unknown('□'), '/', n(8), '에서 □에 알맞은 수를 써요.'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'w', label: '자연수' }, { key: 'num', label: '분자' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'num', value: N, category: '개념', kind: 'nudge', feedbackCheck: '분자를 다시 볼까요?', feedback: `8/8이 1이에요. ${fr(N, 8)}에서 1을 빼면요?` },
        { key: 'w', value: 0, category: '개념', kind: 'check', feedback: '자연수 부분을 다시 볼까요?' },
        { key: 'num', value: r + 8, category: '개념', kind: 'check', feedback: `분자 ${r + 8}${jo(r + 8, '이', '가')} 8보다 작나요?` },
      ],
      answer,
    ),
    hints: [`${eul(fr(N, 8))} 대분수로 나타내는 틀을 채우는 문제예요.`, '8/8은 1이에요. 1을 몇 번 덜어 낼 수 있는지 볼까요?', `${fr(N, 8)}${jo(N, '은', '는')} 1/8이 ${N}개예요.`, '8/8을 덜어 낼 수 있는 횟수: ☐번'],
    blank: '☐번',
    blankAnswer: String(w),
    blankThen: '두 칸을 채워요.',
    explain: {
      why: [`1/8 ${N}개를 8개씩 묶으면 ${w}묶음과 ${r}개예요.`, `${w}묶음은 자연수 ${w}, 남은 것은 ${ieyo(fr(r, 8))}.`, `그래서 ${fr(N, 8)} = ${mix(w, r)}${mjo(r, '이에요', '예요')}.`],
      alt: [`${N} ÷ 8 = ${w} … ${r}${roOnly(r)} 구해도 같아요.`, `두 풀이 모두 ${mix(w, r)}${mjo(r, '이에요', '예요')}.`],
    },
  };
}

const T18_3 = {
  id: 'T18-3',
  node: 'N18',
  title: '가분수와 대분수 틀',
  repr: '빈칸',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 1) return t183Mixed(1, rng.int(1, 7));
    if (level === 2) return t183Improper(draw(rng, () => rng.int(9, 31), (N) => N % 8 !== 0, 19));
    return t183Mixed(rng.int(2, 3), rng.int(1, 7));
  },
};

// ── 급행 통과 진단 ──
const D1 = {
  id: 'N18-D1',
  node: 'N18',
  title: '급행 진단: 2와 5/8을 가분수로',
  repr: '빈칸',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...t183Mixed(2, 5), hints: [], blank: null };
  },
};
const D2 = {
  id: 'N18-D2',
  node: 'N18',
  title: '급행 진단: 가분수 고르기',
  repr: '그림',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...t181Level3(5, 13, 2, 1, ['proper', 'whole', 'improper', 'mixed']), hints: [], blank: null };
  },
};
const D3 = {
  id: 'N18-D3',
  node: 'N18',
  title: '급행 진단(예비): 19/8과 2와 5/8',
  repr: '그림',
  minLevel: 6,
  maxLevel: 6,
  diagnostic: true,
  generate() {
    return { ...t181Level6(19, 2, 5), hints: [], blank: null };
  },
};

export default [T18_1, T18_2, T18_3, D1, D2, D3];
