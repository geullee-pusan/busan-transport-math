// N12 대티 — (세 자리)×(한 자리) [4수01-04]. 천장 6.
// 기준: docs/curriculum/08-line1-templates-11-20.md 12절, 09 끝 보강 후보(빈칸: 넓이 모형 세 부분). 피드백 꼬리표 kind: 'check' | 'nudge'(10 문서 2절).
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

const digits3 = (a) => [Math.floor(a / 100), Math.floor(a / 10) % 10, a % 10];
/** 곱셈 올림 횟수(일·십의 자리에서 다음 자리로 올리는 횟수) */
function mulCarries(a, m) {
  let c = 0;
  let count = 0;
  const [h, t, u] = digits3(a);
  for (const d of [u, t]) {
    c = Math.floor((d * m + c) / 10);
    if (c > 0) count++;
  }
  void h;
  return count;
}
/** 올림을 버린 값: 자리마다 곱의 일의 자리만 쓰고 맨 앞은 그대로 */
function noCarry(a, m) {
  const [h, t, u] = digits3(a);
  return h * m * 100 + ((t * m) % 10) * 10 + ((u * m) % 10);
}
/** 올린 수를 먼저 더하고 곱한 값 */
function carryFirst(a, m) {
  const [h, t, u] = digits3(a);
  let out = 0;
  let c = 0;
  let p = 1;
  for (const d of [u, t]) {
    const v = (d + c) * m;
    out += (v % 10) * p;
    c = Math.floor(v / 10);
    p *= 10;
  }
  return out + (h + c) * m * 100;
}

/** (세 자리)×(한 자리) 판별 오답 */
function mulDiscs(a, m) {
  const [h, t, u] = digits3(a);
  const P = a * m;
  const list = [];
  if (t === 0) list.push({ value: (h * 10 + u) * m, category: '개념', kind: 'nudge', feedbackCheck: '백의 자리를 다시 볼까요?', feedback: `${a}의 ${h * 100}도 ${m}배 했나요?` });
  if (mulCarries(a, m) > 0) {
    list.push({ value: noCarry(a, m), category: '계산', kind: 'check', feedback: '올린 수는 어디 갔나요?' });
    list.push({ value: carryFirst(a, m), category: '개념', kind: 'check', feedback: '올린 수는 언제 더했나요?' });
  }
  list.push({ value: a + m, category: '식', kind: 'nudge', feedbackCheck: '문제를 다시 읽어 볼까요?', feedback: '곱셈이에요. 몇 번 더하는 셈일까요?' });
  return uniq(list, P);
}

/** 자리별로 나눈 조각(0인 자리는 뺀다) */
function parts(a) {
  const [h, t, u] = digits3(a);
  return [h * 100, t * 10, u].filter((x) => x > 0);
}

function mulHints(a, m, lead) {
  const ps = parts(a);
  const P = a * m;
  const bl = blankAt(P, 1);
  const prods = ps.map((x) => `${x} × ${m} = ${x * m}`).join(', ');
  const split = ps.length === 2 ? `${wa(ps[0])} ${ro(ps[1])}` : `${ps[0]}, ${wa(ps[1])} ${ro(ps[2])}`;
  const u = a % 10;
  if (u * m < 10) {
    // 일의 자리 곱에 올림이 없으면 빈칸 값이 ③의 부분곱에 그대로 보인다. ③은 앞 부분곱만, ④는 일의 자리 곱을 직접 계산하게(11 검토 4).
    const head = ps.slice(0, -1);
    const bl0 = blankAt(P, 0);
    const prods0 = head.map((x) => `${x} × ${m} = ${x * m}`).join(', ');
    return {
      hints: [lead, `${eul(a)} ${split} 나눠서 각각 ${m}배 해 볼까요?`, `${prods0}${jo(head.at(-1) * m, "이에요", "예요")}.`, `${head.map((x) => x * m).join(' + ')} + ${u} × ${m} = ${bl0.blank}`],
      blank: bl0.blank,
      blankAnswer: bl0.blankAnswer,
    };
  }
  return {
    hints: [lead, `${eul(a)} ${split} 나눠서 각각 ${m}배 해 볼까요?`, `${prods}${jo(ps.at(-1) * m, "이에요", "예요")}.`, `${ps.map((x) => x * m).join(' + ')} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
  };
}

function mulExplain(a, m, unit = '') {
  const ps = parts(a);
  const P = a * m;
  const end = unit ? `${P}${unit}이에요` : ieyo(P);
  return {
    why: [`${a} × ${m}${jo(m, '은', '는')} ${ps.map((x) => `${x} × ${m}`).join(', ')}${jo(m, '을', '를')} 합친 거예요.`, `${ps.map((x) => x * m).join(' + ')} = ${ieyo(P)}.`, `그래서 ${a} × ${m} = ${end}.`],
    alt: m <= 4 ? [`${eul(a)} ${m}번 더해요. ${Array(m).fill(a).join(' + ')} = ${ieyo(P)}.`, `두 풀이 모두 ${ieyo(P)}.`] : ['세로로 일의 자리부터 곱하고, 올린 수는 다음 자리의 곱에 더해요.', `어느 길로 해도 답은 ${ro(P)} 같아요.`],
  };
}

/** scene = { text: 식 앞 교통 장면 조각, unit } (없으면 식만) */
function buildMul(a, m, scene = null) {
  const [, t] = digits3(a);
  return {
    text: [...(scene?.text ?? []), n(a), ' × ', n(m), ' = ?'],
    figure: { kind: 'vertical', op: '×', a, b: m },
    input: scene?.unit ? { kind: 'number', unit: scene.unit } : { kind: 'number' },
    answer: a * m,
    discriminators: mulDiscs(a, m),
    ...mulHints(a, m, `${wa(a)} ${m}의 곱을 물어요.${t === 0 ? ` ${eun(a)} 십의 자리가 0이에요.` : ''}`),
    explain: mulExplain(a, m),
  };
}

/** 단계별 (세 자리, 한 자리) 고르기: 1 올림 없음 / 2 올림 한 번 / 3 올림 여러 번 또는 십의 자리 0 */
function pickMul(rng, level) {
  return draw(
    rng,
    () => [rng.int(101, 499), rng.int(2, 9)],
    ([a, m]) => {
      const [h, t, u] = digits3(a);
      const P = a * m;
      if (u === 0 || u === 1 || P % 10 === m) return false;
      if (Number(`${a}${m}`) === P) return false;
      const c = mulCarries(a, m);
      if (level === 1) return t !== 0 && u * m < 10 && t * m < 10 && h * m < 10;
      if (level === 2) return t !== 0 && c === 1 && P < 10000;
      return (t === 0 && u * m >= 10) || c === 2;
    },
    level === 1 ? [213, 3] : level === 2 ? [128, 3] : [305, 4],
  );
}

/** T12-1 정비창 점검 (식) — 1~3단계 */
const T12_1 = {
  id: 'T12-1',
  node: 'N12',
  title: '정비창 점검: (세 자리)×(한 자리)',
  repr: '식',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const [a, m] = pickMul(rng, level);
    return buildMul(a, m, {
      text: [level >= 3 ? '어느 날 대티역을 지난 열차마다 ' : '대티역을 지난 열차마다 ', V(a), '명씩 타 있었어요. 열차 ', V(m), '대에 탄 사람은 모두 몇 명인지 식으로 계산해요. '],
      unit: '명',
    });
  },
};

// ── T12-2 열차 칸마다 (문장 + 그림) — 1~4단계 ──

/** 1단계: (몇백몇십) × 8 */
function t122Level1(c) {
  const P = c * 8;
  const bl = blankAt(P, 1);
  return {
    text: [L1(), '호선은 ', CARS(), '량이에요. 어느 날 열차 한 대의 칸마다 ', V(c), '명씩 탔어요. 열차에 탄 사람은 모두 몇 명이에요?'],
    figure: { kind: 'train', cars: 8 },
    input: { kind: 'number', unit: '명' },
    answer: P,
    discriminators: uniq(
      [
        { value: (c / 10) * 8, category: '계산', kind: 'check', feedback: '끝의 0은 어디 갔나요?' },
        { value: c + 8, category: '식', kind: 'nudge', feedbackCheck: '문제를 다시 읽어 볼까요?', feedback: '칸마다 같은 수예요. 몇 번 더할까요?' },
      ],
      P,
    ),
    hints: [`열차는 8칸이고, 칸마다 ${c}명씩 탔어요. 열차에 탄 사람 수를 모두 물어요.`, `${c}명씩 8칸이에요. ${eul(c)} ${wa(Math.floor(c / 100) * 100)} ${ro(c % 100)} 나눠 생각해 볼까요?`, `${Math.floor(c / 100) * 100} × 8 = ${ieyo(Math.floor(c / 100) * 800)}.`, `${Math.floor(c / 100) * 800} + ${c % 100} × 8 = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: { ...mulExplain(c, 8, '명'), why: [`${c}명씩 8칸이니 ${c} × 8을 해요.`, `${Math.floor(c / 100) * 100} × 8 = ${Math.floor(c / 100) * 800}, ${c % 100} × 8 = ${ieyo((c % 100) * 8)}.`, `그래서 모두 ${P}명이에요.`] },
  };
}

/** 2단계: 8량에 칸마다 x명(올림 두 번) */
function t122Level2(x) {
  const P = x * 8;
  const e = mulExplain(x, 8, '명');
  return {
    text: [L1(), '호선 ', CARS(), '량 열차에 칸마다 ', V(x), '명씩 탔어요. 열차에 탄 사람은 모두 몇 명이에요?'],
    figure: { kind: 'train', cars: 8, perCar: x },
    input: { kind: 'number', unit: '명' },
    answer: P,
    discriminators: mulDiscs(x, 8),
    ...mulHints(x, 8, `열차는 8칸이고, 칸마다 ${x}명씩 탔어요. 열차에 탄 사람 수를 모두 물어요.`),
    explain: { why: [...e.why.slice(0, -1), `그래서 모두 ${P}명이에요.`], alt: e.alt },
  };
}

/** 3단계: 칸 수가 다른 두 곱 비교 */
function t122Level3(a, k, b) {
  const front = a * 8;
  const back = b * k;
  const more = front > back ? '앞' : '뒤';
  const bl = blankAt(back, 0);
  const answer = { front, back, more };
  return {
    text: ['앞 열차는 ', CARS(), '량 모두에 ', V(a), '명씩, 뒤 열차는 ', CARS(), '량 중 ', V(k), '칸에만 ', V(b), '명씩 탔어요. 사람이 더 많이 탄 열차는 어느 쪽이에요?'],
    figure: { kind: 'trains', trains: [{ name: '앞 열차', cars: 8 }, { name: '뒤 열차', cars: 8, full: k }] },
    input: { kind: 'compound', fields: [{ key: 'front', label: '앞 열차' }, { key: 'back', label: '뒤 열차' }, { key: 'more', label: '더 많은 열차', options: ['앞', '뒤'] }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'back', value: b * 8, category: '읽기', kind: 'check', feedback: '뒤 열차는 몇 칸에 탔나요?' },
        { key: 'more', value: more === '앞' ? '뒤' : '앞', category: '개념', kind: 'check', feedback: '두 열차의 사람 수를 다시 견주어 볼까요?' },
      ],
      answer,
    ),
    hints: [`앞 열차는 8칸에 ${a}명씩, 뒤 열차는 ${k}칸에 ${b}명씩 탔어요. 어느 열차에 사람이 더 많은지 물어요.`, '두 열차에 탄 사람을 각각 구해서 견주어 볼까요?', `앞 열차는 ${a} × 8 = ${front}명이에요.`, `뒤 열차는 ${b} × ${k} = ${bl.blank}명`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '더 많은 열차는 어느 쪽이에요?',
    explain: {
      why: [`앞 열차는 ${a} × 8 = ${front}명, 뒤 열차는 ${b} × ${k} = ${back}명이에요.`, `${more} 열차가 ${Math.abs(front - back)}명 더 많아요.`, `그래서 더 많이 탄 열차는 ${more} 열차예요.`],
      alt: [`${k}칸끼리 보면 뒤 열차가 한 칸에 ${b - a}명씩 더 많아 ${b - a} × ${k} = ${(b - a) * k}명 더 많아요.`, `앞 열차는 남은 ${8 - k}칸에 ${a * (8 - k)}명이 더 있어요.`, `두 풀이 모두 ${more} 열차예요.`],
    },
  };
}

/** 4단계: × 대신 −를 눌렀어요 */
function t122Level4(m, x) {
  const w = x - m;
  const P = x * m;
  const bl = blankAt(P, 1);
  return {
    text: ['어느 날 역무원이 한 칸 승객 수에 ', V(m), jo(m, '을', '를'), ' 곱해야 하는데, 계산기에서 × 대신 −를 눌러 ', V(w), jo(w, '이', '가'), ' 나왔어요. 바르게 계산하면 얼마예요?'],
    figure: null,
    input: { kind: 'number' },
    answer: P,
    discriminators: uniq(
      [
        { value: w * m, category: '식', kind: 'nudge', feedbackCheck: `${eun(w)} 무엇을 뺀 결과예요?`, feedback: `${eun(w)} 잘못 나온 수예요. 한 칸 승객은요?` },
        { value: x, category: '식', kind: 'nudge', feedbackCheck: '무엇을 물었는지 다시 볼까요?', feedback: `${x}명을 찾았어요. 다음엔요?` },
        { value: (w - m) * m, category: '식', kind: 'check', feedback: `${eun(w)} 무엇을 뺀 결과예요?` },
      ],
      P,
    ),
    hints: [`곱해야 할 수는 ${ieyo(m)}. 계산기에서 잘못 누른 결과가 ${ieyo(w)}. 바르게 계산한 값을 물어요.`, '잘못 누른 계산을 거꾸로 해서 한 칸 승객 수부터 찾아볼까요?', `한 칸 승객 수는 ${w} + ${m} = ${x}명이에요.`, `${x} × ${m} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`−를 눌러 ${w}${jo(w, '이', '가')} 나왔으니 한 칸 승객 수는 ${w} + ${m} = ${x}명이에요.`, `바르게 계산하면 ${x} × ${m} = ${ieyo(P)}.`, `그래서 답은 ${ieyo(P)}.`],
      alt: [...mulExplain(x, m).why.slice(0, 2), `어느 길로 해도 답은 ${ro(P)} 같아요.`],
    },
  };
}

const T12_2 = {
  id: 'T12-2',
  node: 'N12',
  title: '열차 칸마다',
  repr: '문장',
  minLevel: 1,
  maxLevel: 4,
  generate(rng, level) {
    if (level === 1) return t122Level1(rng.pick([110, 120, 130, 140, 150, 160]));
    if (level === 2) return t122Level2(draw(rng, () => rng.int(102, 124), (x) => mulCarries(x, 8) === 2 && x % 10 > 1 && (x * 8) % 10 !== 8, 124));
    if (level === 3) {
      const [a, b] = draw(rng, () => [rng.int(100, 130), rng.int(101, 150)], ([p, q]) => q > p && Math.abs(p * 8 - q * 7) >= 1 && Math.abs(p * 8 - q * 7) <= 30, [105, 118]);
      return t122Level3(a, 7, b);
    }
    const [m, x] = draw(rng, () => [rng.int(3, 8), rng.int(102, 199)], ([mm, xx]) => xx % 10 !== 0 && mulCarries(xx, mm) >= 1 && ![mm, xx - mm].includes(xx * mm), [6, 125]);
    return t122Level4(m, x);
  },
};

// ── T12-3 도전 문제 (challenge) — 5~6단계 ──

/** 5단계: h□u × m < T */
function t123Level5(h, u, m, k, T) {
  const answer = Array.from({ length: k + 1 }, (_, i) => i);
  const val = (d) => (100 * h + 10 * d + u) * m;
  const discs = [
    { value: answer.slice(0, -1), category: '개념', kind: 'nudge', feedbackCheck: '빠진 것이 없나요?', feedback: `${h}${k}${u} × ${m}도 계산해 봤나요?` },
    { value: [...answer, k + 1], category: '개념', kind: 'check', feedback: `${h}${k + 1}${u} × ${m}${jo(m, '은', '는')} ${T}보다 작나요?` },
  ];
  if (k >= 1) discs.push({ value: answer.slice(1), category: '개념', kind: 'nudge', feedbackCheck: '빠진 것이 없나요?', feedback: '□에 0도 넣어 봤나요?' });
  return {
    text: [unknown(`${h}□${u}`), ' × ', n(m), jo(m, '이', '가'), ' ', n(T), '보다 작아요. □에 들어갈 수 있는 수를 모두 골라요.'],
    figure: null,
    challenge: true,
    input: { kind: 'multi', options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
    answer,
    discriminators: uniq(discs, answer),
    grade: multiGrade(answer, discs),
    hints: [`${h}□${u}의 ${m}배가 ${T}보다 작게 되는 □를 모두 찾아요.`, '□에 0부터 차례로 넣어 볼까요? 조건이 바뀌는 곳을 찾아봐요.', `□가 ${k + 1}${jo(k + 1, '이면', '면')} ${h}${k + 1}${u} × ${m} = ${ro(val(k + 1))} ${T}보다 커요.`, '들어갈 수 있는 수: 0부터 ☐까지'],
    blank: '0부터 ☐까지',
    blankAnswer: String(k),
    explain: {
      why: [`${h}${k}${u} × ${m} = ${ro(val(k))} ${T}보다 작아요.`, `${h}${k + 1}${u} × ${m} = ${ro(val(k + 1))} ${T}보다 커요.`, `그래서 들어갈 수 있는 수는 0부터 ${k}까지예요.`],
      alt: [`어림해서 ${h}□0 × ${m}부터 보고, 경계의 수만 정확히 계산해도 돼요.`, `어느 길로 해도 답은 0부터 ${k}까지로 같아요.`],
    },
  };
}

/** 6단계: 숫자 카드 4장으로 (세 자리)×(한 자리)의 가장 큰 곱 */
function t123Level6(cards) {
  let best = 0;
  let pair = null;
  let bestTop = 0; // 가장 큰 숫자를 세 자리 수의 백의 자리에 둔 것 중 가장 큰 곱
  const big = Math.max(...cards);
  const idx = [0, 1, 2, 3];
  for (const m of idx)
    for (const i of idx)
      for (const j of idx)
        for (const k of idx) {
          if (new Set([m, i, j, k]).size < 4) continue;
          const a = cards[i] * 100 + cards[j] * 10 + cards[k];
          const v = a * cards[m];
          if (v > best) {
            best = v;
            pair = [a, cards[m]];
          }
          if (cards[i] === big && v > bestTop) bestTop = v;
        }
  const bl = blankAt(best, 1);
  return {
    text: ['숫자 카드 ', n(cards[0]), ', ', n(cards[1]), ', ', n(cards[2]), ', ', n(cards[3]), jo(cards[3], '을', '를'), ' 한 번씩 써서 (세 자리 수) × (한 자리 수)를 만들어요. 곱이 가장 클 때는 얼마예요?'],
    figure: { kind: 'cards', cards },
    challenge: true,
    input: { kind: 'number' },
    answer: best,
    discriminators: uniq([{ value: bestTop, category: '개념', kind: 'nudge', feedbackCheck: '다른 자리에도 놓아 봤나요?', feedback: `${eul(big)} 한 자리 쪽에 놓아 봤나요?` }], best),
    hints: ['카드 네 장으로 세 자리 수 하나와 한 자리 수 하나를 만들어요. 두 수의 곱이 가장 클 때를 물어요.', '한 자리 수는 세 자리 수 전체에 곱해져요. 어느 숫자를 한 자리 수로 둘지 여러 가지로 견주어 볼까요?', `가장 큰 숫자를 세 자리 수 맨 앞에 두면 가장 큰 곱이 ${ieyo(bestTop)}.`, `${pair[0]} × ${pair[1]} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: ['한 자리 수는 세 자리 수의 모든 자리에 곱해져서 힘이 커요.', `견주어 보면 ${pair[0]} × ${pair[1]} = ${ro(best)} 가장 커요.`, `그래서 가장 큰 곱은 ${ieyo(best)}.`],
      alt: [`가장 큰 숫자를 세 자리 수 맨 앞에 두면 ${bestTop}까지밖에 안 돼요.`, `어느 길로 해도 답은 ${ro(best)} 같아요.`],
    },
  };
}

const T12_3 = {
  id: 'T12-3',
  node: 'N12',
  title: '도전 문제: 세 자리 곱',
  repr: '식',
  challenge: true,
  minLevel: 5,
  maxLevel: 6,
  generate(rng, level) {
    if (level === 5) {
      const [h, u, m, k, T] = draw(
        rng,
        () => {
          const hh = rng.int(1, 4);
          const uu = rng.int(1, 9);
          const mm = rng.int(2, 8);
          const kk = rng.int(1, 8);
          const lo = (100 * hh + 10 * kk + uu) * mm;
          const hi = (100 * hh + 10 * (kk + 1) + uu) * mm;
          const TT = Math.ceil((lo + 1) / 100) * 100;
          return [hh, uu, mm, kk, TT < hi ? TT : 0];
        },
        ([, , , , TT]) => TT > 0,
        [2, 7, 4, 4, 1000],
      );
      return t123Level5(h, u, m, k, T);
    }
    const cards = draw(rng, () => rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4), () => true, [3, 6, 8, 2]);
    return t123Level6(cards);
  },
};

// ── T12-4 넓이 모형 세 부분 (빈칸) — 1~3단계, 09 보강 후보 ──
// figure: { kind: 'areaModel', parts: [[백, 십, 일], [곱하는 수]] }
function t124(a, m) {
  const [h, t, u] = digits3(a);
  const H = h * 100;
  const T = t * 10;
  const P = a * m;
  const answer = { p1: H * m, p2: T * m, p3: u * m, total: P };
  const bl = u * m >= 10 ? blankAt(u * m, 1) : { blank: '☐', blankAnswer: String(u * m) };
  const discs = uniqK(
    [
      { key: 'p1', value: h * m, category: '개념', kind: 'check', feedback: `${H} × ${eun(m)} ${h} × ${m}${jo(m, '과', '와')} 같나요?` },
      { key: 'p2', value: t * m, category: '개념', kind: 'check', feedback: `${T} × ${eun(m)} ${t} × ${m}${jo(m, '과', '와')} 같나요?` },
      ...mulDiscs(a, m).map((d) => ({ ...d, key: 'total' })),
    ],
    answer,
  );
  return {
    text: [n(a), ' × ', n(m), jo(m, '을', '를'), ' 그림처럼 세 부분으로 나눠서 구해요.'],
    figure: { kind: 'areaModel', parts: [[H, T, u], [m]] },
    input: {
      kind: 'compound',
      fields: [
        { key: 'p1', label: `${H} × ${m}` },
        { key: 'p2', label: `${T} × ${m}` },
        { key: 'p3', label: `${u} × ${m}` },
        { key: 'total', label: '모두' },
      ],
    },
    answer,
    discriminators: discs,
    hints: [`그림은 가로가 ${H}, ${T}, ${u}의 세 부분, 세로가 ${ieyo(m)}. 세 부분의 값과 모두를 물어요.`, '세 부분을 각각 구해 볼까요? 세 부분을 합치면 전체예요.', `${H} × ${m} = ${H * m}, ${T} × ${m} = ${ieyo(T * m)}.`, `${u} × ${m} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '"모두" 칸도 채워요.',
    explain: {
      why: [`${a} × ${m}${jo(m, '은', '는')} ${H} × ${m}, ${T} × ${m}, ${u} × ${m}${roOnly(m)} 나눌 수 있어요.`, `${H * m} + ${T * m} + ${u * m} = ${ieyo(P)}.`, `그래서 ${a} × ${m} = ${ieyo(P)}.`],
      alt: mulExplain(a, m).alt,
    },
  };
}

const T12_4 = {
  id: 'T12-4',
  node: 'N12',
  title: '넓이 모형 세 부분',
  repr: '빈칸',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const [a, m] = draw(
      rng,
      () => [rng.int(111, 499), rng.int(2, 9)],
      ([x, y]) => {
        const [h, t, u] = digits3(x);
        if (t === 0 || u < 2 || (x * y) % 10 === y) return false;
        const c = mulCarries(x, y);
        if (level === 1) return u * y < 10 && t * y < 10 && h * y < 10;
        if (level === 2) return c === 1;
        return c === 2;
      },
      level === 1 ? [213, 3] : level === 2 ? [128, 3] : [367, 4],
    );
    return t124(a, m);
  },
};

// ── 급행 통과 진단 ──
const D1 = {
  id: 'N12-D1',
  node: 'N12',
  title: '급행 진단: 305 × 4',
  repr: '식',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...buildMul(305, 4, { text: ['대티역을 지난 열차 ', V(4), '대에 ', V(305), '명씩 타 있었어요. '], unit: '명' }), hints: [], blank: null };
  },
};
const D2 = {
  id: 'N12-D2',
  node: 'N12',
  title: '급행 진단: 두 열차 비교',
  repr: '문장',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...t122Level3(105, 7, 118), hints: [], blank: null };
  },
};
const D3 = {
  id: 'N12-D3',
  node: 'N12',
  title: '급행 진단(예비): 잘못 누른 계산기',
  repr: '문장',
  minLevel: 4,
  maxLevel: 4,
  diagnostic: true,
  generate() {
    return { ...t122Level4(6, 125), hints: [], blank: null };
  },
};

export default [T12_1, T12_2, T12_3, T12_4, D1, D2, D3];
