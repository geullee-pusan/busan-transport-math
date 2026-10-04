// N10 사하 — 분모가 10인 분수와 소수 한 자리 [4수01-12]. 천장 6.
// 기준: docs/curriculum/07-line1-templates.md v2 10절(템플릿은 T10-1 하나). 묻는 꼴과 다른 꼴의 같은 값은 다시 묻기(0.7절).
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
const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';
const fr = (a, b) => `${a}/${b}`;
const tenth = (k) => Number((k / 10).toFixed(1));
const near = (a, b) => Math.abs(a - b) < 1e-9;
const SRC_LEN = SRC_L1;

/**
 * 소수 채점. 이 역은 형식도 배우는 역이라, 값이 같은 분수(7/10)는 다시 묻기(0.7절).
 * 엔진에 다시 묻기 결과가 아직 없어서 flags.careless(벌 없음) + flags.reask로 돌려준다.
 */
function decGrade(ans, discs, textNums) {
  return (r) => {
    if (isBlank(r)) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '답을 먼저 써 볼까요?' };
    const s = String(r).trim();
    const f = s.match(/^(\d+)\s*\/\s*(\d+)$/);
    if (f && Number(f[2]) !== 0) {
      if (near(Number(f[1]) / Number(f[2]), ans)) return { correct: false, flags: { careless: true, reask: true }, kind: 'check', feedback: '소수로 물었어요. 소수로 써 볼까요?' };
      return { correct: false, category: '개념', kind: 'check', feedback: '소수로 써 볼까요?' };
    }
    const v = Number(s);
    if (Number.isNaN(v)) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '소수로 써 볼까요?' };
    if (near(v, ans)) return { correct: true };
    const d = discs.find((x) => near(Number(x.value), v));
    if (d) return { correct: false, category: d.category, kind: d.kind ?? 'check', feedbackCheck: d.feedbackCheck, feedback: d.feedback };
    if (textNums.some((x) => near(x, v))) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '문제에 있는 수를 그대로 썼어요' };
    return { correct: false, category: null, kind: 'check', feedback: null };
  };
}

/** 1단계: 수직선 색칠 → 소수 */
function t101Level1(k) {
  const ans = tenth(k);
  const discs = uniq(
    [
      { value: k, category: '개념', kind: 'nudge', feedbackCheck: '무엇을 물었는지 다시 볼까요?', feedback: '칸 수가 아니라 길이를 물었어요. 한 칸은 몇 km예요?' },
      { value: k / 100, category: '개념', kind: 'check', feedback: '1을 10칸으로 나눈 한 칸은 얼마예요?' },
    ],
    ans,
  );
  return {
    text: [n(0), 'km에서 ', n(1), 'km까지를 똑같이 ', n(10), '칸으로 나눈 수직선이에요. 색칠한 길이는 몇 km예요?'],
    figure: { kind: 'numberline', from: 0, to: 1, ticks: 10, shaded: k },
    input: { kind: 'decimal', unit: 'km' },
    answer: ans,
    discriminators: discs,
    grade: decGrade(ans, discs, [0, 1, 10]),
    hints: ['0km부터 1km까지를 10칸으로 똑같이 나눴어요. 색칠한 길이가 몇 km인지 물어요.', '한 칸은 1km를 10칸으로 나눈 것 중 하나예요. 색칠한 칸을 세어 봐요.', '한 칸은 0.1km예요.', '0.☐'],
    blank: '0.☐',
    blankAnswer: String(k),
    explain: {
      why: ['1을 똑같이 10칸으로 나눈 한 칸이 1/10이고, 이것을 0.1이라고 써요.', `색칠한 칸은 ${k}칸이라 0.1이 ${k}개예요.`, `그래서 색칠한 길이는 ${ans}km예요.`],
      alt: [`${fr(k, 10)}km를 소수로 쓰면 ${ans}km예요.`, `어느 길로 해도 답은 ${ans}${roOnly(ans)} 같아요.`],
    },
  };
}

/** 2단계: 분수 → 소수, 소수 → 분수 */
function t101Level2(a, b) {
  const fa = fr(a, 10);
  const db = tenth(b);
  const dec = tenth(a);
  const fb = fr(b, 10);
  const discs = [
    { key: 'dec', value: a / 100, category: '개념', kind: 'check', feedback: `1을 10칸으로 나눈 ${a}칸은 어디일까요?` },
    { key: 'dec', value: a + 0.1, category: '개념', kind: 'check', feedback: `1을 10칸으로 나눈 ${a}칸은 어디일까요?` },
    { key: 'frac', value: fr(b, 100), category: '개념', kind: 'check', feedback: '0.1은 몇 분의 1일까요?' },
  ];
  return {
    text: [n(fa), jo(fa, '을', '를'), ' 소수로, ', n(db), jo(db, '을', '를'), ' 분수로 써요.'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'dec', label: `${fa}${jo(fa, '을', '를')} 소수로`, kind: 'decimal' }, { key: 'frac', label: `${db}${jo(db, '을', '를')} 분수로`, kind: 'fraction' }] },
    answer: { dec, frac: fb },
    discriminators: discs,
    grade(r) {
      const D = r?.dec;
      const F = r?.frac;
      if (isBlank(D) && isBlank(F)) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '답을 먼저 써 볼까요?' };
      const fm = String(F ?? '').trim().match(/^(\d+)\s*\/\s*(\d+)$/);
      const decOk = !isBlank(D) && near(Number(String(D).trim()), dec) && !String(D).includes('/');
      const fracOk = fm && Number(fm[1]) === b && Number(fm[2]) === 10;
      if (decOk && fracOk) return { correct: true };
      if (String(D ?? '').trim() === fa || near(Number(String(F ?? '').trim()), db)) return { correct: false, flags: { careless: true, reask: true }, kind: 'check', feedback: '묻는 꼴과 다르게 썼어요. 다시 볼까요?' };
      for (const d of discs) {
        const got = d.key === 'dec' ? Number(String(D ?? '').trim()) : String(F ?? '').trim();
        if (d.key === 'dec' ? near(got, d.value) : got === d.value) return { correct: false, category: d.category, kind: d.kind ?? 'check', feedbackCheck: d.feedbackCheck, feedback: d.feedback };
      }
      return { correct: false, category: null, kind: 'check', feedback: `${!decOk ? '소수' : '분수'} 칸을 다시 볼까요?` };
    },
    hints: [`${fa}${jo(fa, '은', '는')} 소수로, ${db}${jo(db, '은', '는')} 분수로 바꿔 쓰는 것을 물어요.`, '1을 10칸으로 똑같이 나눈 한 칸이 1/10, 곧 0.1이에요. 몇 칸인지 생각해 봐요.', `${fa}${jo(fa, '은', '는')} 0.1이 ${a}개예요.`, `${db}${jo(db, '은', '는')} ☐/10`],
    blank: '☐/10',
    blankAnswer: String(b),
    explain: {
      why: [`${fa}${jo(fa, '은', '는')} 1/10이 ${a}개라 ${ieyo(dec)}.`, `${db}${jo(db, '은', '는')} 0.1이 ${b}개라 ${ieyo(fb)}.`, `그래서 ${fa} = ${dec}, ${db} = ${ieyo(fb)}.`],
      alt: ['0부터 1까지 10칸으로 나눈 수직선에서 같은 자리를 찾아봐요.', `어느 길로 해도 답은 ${dec}과 ${fb}${roOnly(fb)} 같아요.`.replace(`${dec}과`, `${dec}${jo(dec, '과', '와')}`)],
    },
  };
}

/** 3단계: 1호선 39.9km 쪼개기 */
function t101Level3() {
  const discs = [
    { key: 'tenth', value: 99, category: '개념', kind: 'check', feedback: '0.9km는 0.1km가 몇 개일까요?' },
    { key: 'tenth', value: 0.9, category: '개념', kind: 'check', feedback: '0.1km가 몇 개인지 물었어요. 몇 개일까요?' },
  ];
  return {
    text: [L1(), '호선 전체 길이는 ', n(39.9, { real: true, source: SRC_LEN }), 'km예요. ', n(1), 'km가 몇 개, ', n(0.1), 'km가 몇 개인 길이예요?'],
    figure: { kind: 'numberline', from: 39, to: 40, ticks: 10, mark: 39.9 },
    input: { kind: 'compound', fields: [{ key: 'one', label: '1km' }, { key: 'tenth', label: '0.1km' }] },
    answer: { one: 39, tenth: 9 },
    discriminators: discs,
    grade(r) {
      const o = Number(String(r?.one ?? '').trim());
      const t = Number(String(r?.tenth ?? '').trim());
      if (isBlank(r?.one) && isBlank(r?.tenth)) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '답을 먼저 써 볼까요?' };
      if (o === 39 && t === 9) return { correct: true };
      if (o === 0 && t === 399) return { correct: false, flags: { careless: true, reask: true }, kind: 'check', feedback: '1km로 묶을 수 있는 만큼은 몇 개일까요?' };
      const d = discs.find((x) => near(Number(x.value), t));
      if (o === 39 && d) return { correct: false, category: d.category, kind: d.kind ?? 'check', feedbackCheck: d.feedbackCheck, feedback: d.feedback };
      return { correct: false, category: null, kind: 'check', feedback: `${o === 39 ? '0.1km' : '1km'} 칸을 다시 볼까요?` };
    },
    hints: ['1호선 전체 길이는 39.9km예요. 1km가 몇 개, 0.1km가 몇 개인지 물어요.', '39.9를 자연수 부분과 소수 부분으로 나눠 볼까요?', '자연수 부분은 39예요.', '0.9km는 0.1km가 ☐개'],
    blank: '0.1km가 ☐개',
    blankAnswer: '9',
    explain: {
      why: ['39.9는 39와 0.9를 합친 수예요.', '39km는 1km가 39개, 0.9km는 0.1km가 9개예요.', '그래서 1km가 39개, 0.1km가 9개예요.'],
      alt: ['0.1km가 399개라고 할 수도 있지만, 1km로 묶을 수 있는 만큼 묶으면 39개와 9개예요.', '어느 길로 해도 답은 39와 9로 같아요.'],
    },
  };
}

/** 4단계: 0.1이 N개인 수 */
function t101Level4(N) {
  const ans = tenth(N);
  const t = Math.floor(N / 10);
  const u = N % 10;
  const discs = uniq(
    [
      { value: N, category: '개념', kind: 'nudge', feedbackCheck: '소수점의 자리를 다시 볼까요?', feedback: `0.1이 10개면 1이에요. ${N}개면요?` },
      { value: N / 100, category: '개념', kind: 'nudge', feedbackCheck: '소수점의 자리를 다시 볼까요?', feedback: `0.1이 10개면 1이에요. ${N}개면요?` },
    ],
    ans,
  );
  return {
    text: [n(0.1), '이 ', n(N), '개인 수는 얼마예요?'],
    figure: null,
    input: { kind: 'decimal' },
    answer: ans,
    discriminators: discs,
    grade: decGrade(ans, discs, [0.1, N]),
    hints: [`0.1이 ${N}개 있어요. 그 수를 물어요.`, `0.1이 10개면 1이에요. ${N}개 안에 10개 묶음이 몇 개 있을까요?`, `10개 묶음이 ${t}개예요.`, `${t}개 묶음을 빼면 0.1이 ☐개 남아요.`],
    blank: '☐',
    blankAnswer: String(u),
    explain: {
      why: ['1을 똑같이 10칸으로 나눈 한 칸이 0.1이에요.', `0.1이 ${N}개면 1이 ${t}개와 0.1이 ${u}개예요.`, `그래서 ${ieyo(ans)}.`],
      alt: [`${fr(N, 10)}${jo(N, '을', '를')} 생각해요. 10/10이 1이니 1이 ${t}개와 ${fr(u, 10)}이에요.`.replace(`${fr(u, 10)}이에요`, `${fr(u, 10)}${jo(u, '이에요', '예요')}`), `어느 길로 해도 답은 ${ans}${roOnly(ans)} 같아요.`],
    },
  };
}

/** 5단계: 0.1이 □개인 수의 범위 */
function t101Level5(A, d) {
  const B = tenth(10 * A + d);
  const lo = 10 * A;
  const hi = 10 * A + d;
  const answer = Array.from({ length: d - 1 }, (_, i) => lo + 1 + i);
  const options = Array.from({ length: d + 3 }, (_, i) => lo - 1 + i);
  const discs = [
    { value: [lo, ...answer, hi], category: '개념', kind: 'check', feedback: `${A}.0은 ${A}${jo(A, '과', '와')} 같아요. ${A}보다 커야 하죠?` },
    { value: [lo, ...answer], category: '개념', kind: 'check', feedback: `${A}.0은 ${A}${jo(A, '과', '와')} 같아요. ${A}보다 커야 하죠?` },
    { value: [...answer, hi], category: '개념', kind: 'check', feedback: `${B}보다 작아야 해요. ${B}도 될까요?` },
  ];
  return {
    text: [n(0.1), '이 ', unknown('□'), '개인 수가 ', n(A), '보다 크고 ', n(B), '보다 작아요. □에 들어갈 수 있는 수를 모두 골라요.'],
    figure: null,
    input: { kind: 'multi', options },
    answer,
    discriminators: discs,
    grade: multiGrade(answer, discs),
    hints: [`0.1이 □개인 수가 ${A}보다 크고 ${B}보다 작아야 해요. 들어갈 수 있는 □를 모두 물어요.`, `${eun(A)} 0.1이 몇 개일까요? ${B}도 0.1이 몇 개인지 생각해 봐요.`, `${eun(A)} 0.1이 ${lo}개예요.`, `${lo + 1}부터 ☐까지`],
    blank: `${lo + 1}부터 ☐까지`,
    blankAnswer: String(hi - 1),
    explain: {
      why: [`${eun(A)} 0.1이 ${lo}개, ${eun(B)} 0.1이 ${hi}개예요.`, `그 사이의 수는 0.1이 ${lo}개보다 많고 ${hi}개보다 적어요.`, `그래서 □는 ${answer.join(', ')}${jo(hi - 1, '이에요', '예요')}.`],
      alt: [`수직선에서 ${A}과 ${B} 사이 눈금을 세어도 돼요.`.replace(`${A}과`, `${A}${jo(A, '과', '와')}`), `어느 길로 해도 답은 ${answer.join(', ')}${roOnly(hi - 1)} 같아요.`],
    },
  };
}

/** 6단계: 수직선 두 점 */
function t101Level6(t1, t2) {
  const d1 = tenth(t1);
  const d2 = tenth(t2);
  return {
    text: ['사하역에서 괴정역까지 ', V(d1), 'km, 사하역에서 당리역까지 ', V(d2), 'km예요. ', n(0), 'km부터 ', n(2), 'km까지 수직선에 두 거리를 점으로 찍어요.'],
    figure: { kind: 'numberline', from: 0, to: 2, ticks: 20, origin: '사하역' },
    input: { kind: 'compound', fields: [{ key: 'goejeong', label: '괴정역', kind: 'numberline' }, { key: 'dangni', label: '당리역', kind: 'numberline' }] },
    answer: { goejeong: d1, dangni: d2 },
    discriminators: [
      { key: 'goejeong', value: d2, category: '읽기', kind: 'check', feedback: '괴정역까지는 몇 km였죠?' },
      { key: 'dangni', value: d1, category: '읽기', kind: 'check', feedback: '당리역까지는 몇 km였죠?' },
    ],
    hints: [`사하역에서 괴정역까지 ${d1}km, 당리역까지 ${d2}km예요. 두 거리를 수직선에 점으로 찍는 문제예요.`, '수직선의 작은 눈금 한 칸은 얼마일까요? 0에서 몇 칸 가야 하는지 세어 봐요.', '작은 눈금 한 칸은 0.1km예요.', `${d1}km는 0.1km가 ☐개`],
    blank: '0.1km가 ☐개',
    blankAnswer: String(t1),
    blankThen: '두 점을 어디에 찍을까요?',
    explain: {
      why: [`${eun(d1)} 0.1이 ${t1}개라서 0에서 작은 눈금 ${t1}칸이에요.`, `${eun(d2)} 0.1이 ${t2}개라서 ${t2}칸이에요.`, `그래서 괴정역은 ${d1}, 당리역은 ${d2}에 점을 찍어요.`],
      alt: ['1을 먼저 찾고, 1에서 몇 칸 더 가거나 덜 가는지 세어도 돼요.', `어느 길로 해도 답은 ${d1}${jo(d1, '과', '와')} ${d2}${roOnly(d2)} 같아요.`],
    },
  };
}

/** T10-1 0.1 알기 (수직선·빈칸) — 1~6단계 */
const T10_1 = {
  id: 'T10-1',
  node: 'N10',
  title: '0.1 알기',
  repr: '빈칸',
  minLevel: 1,
  maxLevel: 6,
  generate(rng, level) {
    if (level === 1) return t101Level1(rng.int(1, 9));
    if (level === 2) {
      const [a, b] = draw(rng, () => [rng.int(1, 9), rng.int(1, 9)], ([x, y]) => x !== y, [7, 9]);
      return t101Level2(a, b);
    }
    if (level === 3) return t101Level3();
    if (level === 4) return t101Level4(draw(rng, () => rng.int(11, 99), (x) => x % 10 !== 0, 48));
    if (level === 5) return t101Level5(rng.int(1, 5), rng.int(3, 6));
    const [t1, t2] = draw(rng, () => [rng.int(5, 19), rng.int(5, 19)], ([x, y]) => x !== y && x % 10 !== 0 && y % 10 !== 0 && Math.abs(x - y) >= 3, [12, 8]);
    return t101Level6(t1, t2);
  },
};

/** 급행 통과 진단 */
const D1 = {
  id: 'N10-D1',
  node: 'N10',
  title: '급행 진단: 분수를 소수로',
  repr: '식',
  minLevel: 2,
  maxLevel: 2,
  diagnostic: true,
  generate() {
    const discs = [
      { value: 0.07, category: '개념', kind: 'check', feedback: '1을 10칸으로 나눈 7칸은 어디일까요?' },
      { value: 7.1, category: '개념', kind: 'check', feedback: '1을 10칸으로 나눈 7칸은 어디일까요?' },
    ];
    return {
      text: [n('7/10'), '을 소수로 써요.'],
      figure: null,
      input: { kind: 'decimal' },
      answer: 0.7,
      discriminators: discs,
      grade: decGrade(0.7, discs, []),
      hints: [],
      blank: null,
      explain: { why: ['7/10은 1/10이 7개예요.', '그래서 0.7이에요.'], alt: [] },
    };
  },
};
const D2 = {
  id: 'N10-D2',
  node: 'N10',
  title: '급행 진단: 39.9km 쪼개기',
  repr: '빈칸',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...t101Level3(), hints: [], blank: null };
  },
};
const D3 = {
  id: 'N10-D3',
  node: 'N10',
  title: '급행 진단(예비): 0.1의 개수 범위',
  repr: '빈칸',
  minLevel: 5,
  maxLevel: 5,
  diagnostic: true,
  generate() {
    return { ...t101Level5(2, 5), hints: [], blank: null };
  },
};

// ── T10-2 0.1km 표지판 (문장) — 09-templates-additions.md 10절 ──
/** 1단계: 소수 → 0.1의 개수 */
function t102Level1(k) {
  const d = tenth(k);
  return {
    text: ['사하역 출구에서 버스 정류장까지 ', V(d), 'km예요. ', n(0.1), 'km가 몇 개인 길이예요?'],
    figure: null,
    input: { kind: 'number', unit: '개' },
    answer: k,
    discriminators: [
      { value: d, category: '개념', kind: 'check', feedback: `0.1이 몇 개 모이면 ${d}일까요?` },
      { value: k * 10, category: '개념', kind: 'check', feedback: `0.1이 몇 개 모이면 ${d}일까요?` },
    ],
    hints: [`사하역 출구에서 버스 정류장까지 ${d}km예요. 0.1km가 몇 개인 길이인지 물어요.`, '0부터 1까지를 10칸으로 나눈 수직선을 떠올려 볼까요? 한 칸이 0.1이에요.', '0.1이 2개면 0.2예요.', `${d}${jo(d, '은', '는')} 0.1이 ☐개`],
    blank: '0.1이 ☐개',
    blankAnswer: String(k),
    explain: {
      why: ['0.1은 1을 똑같이 10칸으로 나눈 한 칸이에요.', `${d}${jo(d, '은', '는')} 그 칸이 ${k}개예요.`, `그래서 0.1km가 ${k}개인 길이예요.`],
      alt: [`${d}km = ${fr(k, 10)}km이고, 1/10km가 ${k}개예요.`, `두 생각 모두 ${k}개예요.`],
    },
  };
}

/** 2단계: 분수(문장) → 소수 */
function t102Level2(k) {
  const f = fr(k, 10);
  const ans = tenth(k);
  const discs = [
    { value: k / 100, category: '개념', kind: 'check', feedback: `1을 10칸으로 나눈 ${k}칸은 어디일까요?` },
    { value: Number((k + 0.1).toFixed(1)), category: '개념', kind: 'check', feedback: `1을 10칸으로 나눈 ${k}칸은 어디일까요?` },
  ];
  return {
    text: ['사하역에서 공원까지 ', V(f), 'km예요. 소수로 몇 km예요?'],
    figure: null,
    input: { kind: 'decimal', unit: 'km' },
    answer: ans,
    discriminators: discs,
    grade: decGrade(ans, discs, []),
    hints: [`사하역에서 공원까지 ${f}km예요. 이 거리를 소수로 물어요.`, '1을 10칸으로 똑같이 나눈 한 칸이 1/10, 곧 0.1이에요. 몇 칸인지 생각해 봐요.', `${f}${jo(f, '은', '는')} 1/10이 ${k}개예요.`, '0.☐km'],
    blank: '0.☐',
    blankAnswer: String(k),
    explain: {
      why: ['1/10은 0.1과 같아요.', `${f}${jo(f, '은', '는')} 1/10이 ${k}개라서 0.1이 ${k}개예요.`, `그래서 ${ans}km예요.`],
      alt: [`0부터 1까지 10칸으로 나눈 수직선에서 ${k}번째 눈금이 ${ieyo(ans)}.`, `두 생각 모두 ${ans}km예요.`],
    },
  };
}

/** 3단계: k번째 표지판(출구에는 표지판 없음) */
function t102Level3(k) {
  const ans = tenth(k);
  const discs = uniq(
    [
      { value: tenth(k - 1), category: '개념', kind: 'check', feedback: '첫 표지판은 몇 km에 있나요?' },
      { value: tenth(k + 1), category: '개념', kind: 'check', feedback: '첫 표지판은 몇 km에 있나요?' },
      { value: k, category: '개념', kind: 'check', feedback: `0.1km가 ${k}개면 몇 km예요?` },
    ],
    ans,
  );
  return {
    text: ['(가상) 사하역 출구부터 ', V(0.1), 'km마다 표지판이 있어요. 첫 표지판은 출구에서 ', V(0.1), 'km 떨어진 곳에 있어요. ', V(k), '번째 표지판까지 몇 km예요?'],
    // 출구(0)에는 표지판이 없고, 0.1km 눈금마다 표지판이 있다.
    figure: { kind: 'numberline', from: 0, to: 1, ticks: 10, origin: '출구' },
    input: { kind: 'decimal', unit: 'km' },
    answer: ans,
    discriminators: discs,
    grade: decGrade(ans, discs, [0.1, k]),
    hints: [`출구부터 0.1km마다 표지판이 있고, 첫 표지판은 0.1km에 있어요. ${k}번째 표지판까지의 거리를 물어요.`, '표지판마다 거리를 차례로 적어 볼까요?', '첫 번째 0.1km, 두 번째 0.2km예요.', `${k}번째: 0.☐km`],
    blank: '0.☐km',
    blankAnswer: String(k),
    explain: {
      why: ['표지판 하나가 0.1km씩이에요.', `${k}번째 표지판까지 0.1km가 ${k}개라서 ${ans}km예요.`],
      alt: [`${fr(k, 10)}km와 같아요. ${fr(k, 10)} = ${ieyo(ans)}.`, `두 생각 모두 ${ans}km예요.`],
    },
  };
}

/** T10-2 0.1km 표지판 (문장) — 1~3단계 */
const T10_2 = {
  id: 'T10-2',
  node: 'N10',
  title: '0.1km 표지판',
  repr: '문장',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 1) return t102Level1(rng.int(2, 9));
    if (level === 2) return t102Level2(rng.int(2, 9));
    return t102Level3(rng.int(3, 9));
  },
};

// ── T10-3 같은 수를 세 가지로 (식) — 09-templates-additions.md 10절 ──
// 틀: "[  ] = 0.1이 [  ]개 = [  ]/10". 3단계는 1을 넘는 수라 분수 칸을 두지 않는다(가분수는 N18).
/** 1단계: 소수에서 출발 */
function t103Level1(k) {
  const d = tenth(k);
  return {
    text: ['빈칸을 채워요. ', n(d), ' = ', n(0.1), '이 ', unknown('□'), '개 = ', unknown('□'), '/', n(10)],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'count', label: '0.1이 □개' }, { key: 'num', label: '□/10' }] },
    answer: { count: k, num: k },
    discriminators: [{ key: 'count', value: k * 10, category: '개념', kind: 'nudge', feedbackCheck: `0.1이 ${k * 10}개면 ${d}일까요?`, feedback: '0.1이 10개면 1이에요. 몇 개면 될까요?' }],
    hints: [`${d}${jo(d, '을', '를')} 0.1의 개수와 분수로 나타내는 문제예요.`, `0과 1 사이를 10칸으로 나눈 수직선에서 ${d}${jo(d, '을', '를')} 찾아볼까요?`, `${d}${jo(d, '은', '는')} 수직선에서 ${k}번째 칸이에요.`, '0.1이 ☐개'],
    blank: '0.1이 ☐개',
    blankAnswer: String(k),
    blankThen: '분수 칸도 채워요.',
    explain: {
      why: ['0.1은 1/10이에요.', `${d}${jo(d, '은', '는')} 0.1이 ${k}개라서 ${fr(k, 10)}${jo(k, '과', '와')} 같아요.`],
      alt: [`수직선에서 1을 10칸으로 나눈 ${k}칸째가 ${d}이고, 분수로는 ${ieyo(fr(k, 10))}.`.replace(`${d}이고`, `${d}${jo(d, '이고', '고')}`), '두 생각 모두 같은 수예요.'],
    },
  };
}

/** 2단계: 분수에서 출발 */
function t103Level2(k) {
  const f = fr(k, 10);
  const d = tenth(k);
  return {
    text: ['빈칸을 채워요. ', unknown('□'), ' = ', n(0.1), '이 ', unknown('□'), '개 = ', n(f)],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'dec', label: '소수', kind: 'decimal' }, { key: 'count', label: '0.1이 □개' }] },
    answer: { dec: d, count: k },
    discriminators: [
      { key: 'dec', value: k / 100, category: '개념', kind: 'check', feedback: `1을 10칸으로 나눈 ${k}칸은 어디일까요?` },
      { key: 'dec', value: k, category: '개념', kind: 'check', feedback: '분자를 그대로 썼어요. 0.1이 몇 개예요?' },
    ],
    hints: [`${f}${jo(f, '을', '를')} 소수와 0.1의 개수로 나타내는 문제예요.`, '1을 10칸으로 똑같이 나눈 한 칸이 1/10, 곧 0.1이에요. 몇 칸인지 생각해 봐요.', `${f}${jo(f, '은', '는')} 1/10이 ${k}개예요.`, '0.☐'],
    blank: '0.☐',
    blankAnswer: String(k),
    blankThen: '0.1의 개수 칸도 채워요.',
    explain: {
      why: ['1/10은 0.1이에요.', `${f}${jo(f, '은', '는')} 1/10이 ${k}개라서 0.1이 ${k}개, 곧 ${ieyo(d)}.`],
      alt: [`수직선에서 1을 10칸으로 나눈 ${k}칸째가 ${ieyo(d)}.`, '두 생각 모두 같은 수예요.'],
    },
  };
}

/** 3단계: 0.1이 N개(1을 넘는 수) */
function t103Level3(N) {
  const d = tenth(N);
  const rest = N - 10;
  return {
    text: ['빈칸을 채워요. ', unknown('□'), ' = ', n(0.1), '이 ', n(N), '개 = ', n(1), '과 ', n(0.1), '이 ', unknown('□'), '개'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'dec', label: '소수', kind: 'decimal' }, { key: 'rest', label: '1과 0.1이 □개' }] },
    answer: { dec: d, rest },
    discriminators: [
      { key: 'dec', value: N / 100, category: '개념', kind: 'nudge', feedbackCheck: '소수점의 자리를 다시 볼까요?', feedback: `0.1이 10개면 1이에요. ${N}개면요?` },
      { key: 'dec', value: N, category: '개념', kind: 'nudge', feedbackCheck: '소수점의 자리를 다시 볼까요?', feedback: `0.1이 10개면 1이에요. ${N}개면요?` },
      { key: 'rest', value: N, category: '개념', kind: 'check', feedback: '1을 빼고 나면 0.1이 몇 개 남아요?' },
    ],
    hints: [`0.1이 ${N}개인 수를 소수로, 또 1과 0.1의 개수로 나타내는 문제예요.`, `0.1이 10개면 1이에요. ${N}개 안에 10개 묶음이 몇 개 있을까요?`, `10개 묶음이 1개예요.`, '1개 묶음을 빼면 0.1이 ☐개 남아요.'],
    blank: '☐',
    blankAnswer: String(rest),
    blankThen: '나머지 칸도 채워요.',
    explain: {
      why: ['0.1이 10개면 1이에요.', `0.1이 ${N}개면 1과 0.1이 ${rest}개라서 ${ieyo(d)}.`],
      alt: [`수직선에서 1을 지나 작은 눈금 ${rest}칸을 더 가면 ${ieyo(d)}.`, '두 생각 모두 같은 수예요.'],
    },
  };
}

/** T10-3 같은 수를 세 가지로 (식) — 1~3단계 */
const T10_3 = {
  id: 'T10-3',
  node: 'N10',
  title: '같은 수를 세 가지로',
  repr: '식',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 1) return t103Level1(rng.int(2, 9));
    if (level === 2) return t103Level2(rng.int(2, 9));
    return t103Level3(rng.int(11, 19));
  },
};

export default [T10_1, T10_2, T10_3, D1, D2, D3];
