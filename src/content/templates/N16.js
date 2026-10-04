// N16 자갈치 — (세 자리)÷(한 자리) [4수01-06]. 천장 7.
// 기준: docs/curriculum/08-line1-templates-11-20.md 16절(자갈치시장, 값은 "만 원" 단위, 숫자는 모두 지어낸 값), 09 끝 보강 후보(그림: 수 모형 나누기). 피드백 꼬리표 kind: 'check' | 'nudge'(10 문서 2절).
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

const swap2 = (q) => (q % 10) * 10 + Math.floor(q / 10);
const d3 = (v) => [Math.floor(v / 100), Math.floor(v / 10) % 10, v % 10];

// ── T16-1 정비창 점검 (식) — 1~3단계 ──

/** 몫이 세 자리이고 나머지 없음(1단계: 자리마다 나누어떨어짐, 2단계: 몫 가운데 0) */
function buildDiv(N, d) {
  const q = N / d;
  const H = Math.floor(N / 100) * 100;
  const rest = N - H;
  const [qa, qb, qc] = d3(q);
  const mid0 = qb === 0;
  const discs = mid0
    ? [
        { value: qa * 10 + qc, category: '개념', kind: 'check', feedback: `${d} × ${qa * 10 + qc}${jo(qa * 10 + qc, '은', '는')} ${N}일까요?` },
        { value: qa * 100 + qc * 10, category: '개념', kind: 'check', feedback: `${d} × ${qa * 100 + qc * 10}${jo(qc * 10, '을', '를')} 계산해 볼까요?` },
      ]
    : [{ value: N * d, category: '식', kind: 'check', feedback: '나누면 커질까요?' }];
  const restQ = rest / d;
  const bl = restQ >= 10 ? blankAt(restQ, 0) : { blank: '☐', blankAnswer: String(restQ) };
  return {
    text: [n(N), ' ÷ ', n(d), ' = ?'],
    figure: null,
    input: { kind: 'number' },
    answer: q,
    discriminators: uniq(discs, q),
    hints: [`${eul(N)} ${ro(d)} 나눈 몫을 물어요.`, mid0 ? '백의 자리부터 차례로 나눠 볼까요? 나눌 수 없는 자리에는 몫에 0을 써요.' : `${eul(N)} ${wa(H)} ${ro(rest)} 나눠서 각각 ${ro(d)} 나눠 볼까요?`, `${H} ÷ ${d} = ${ieyo(H / d)}.`, `${rest} ÷ ${d} = ${bl.blank}`],
    blank: `${rest} ÷ ${d} = ${bl.blank}`,
    blankAnswer: bl.blankAnswer,
    blankThen: '몫은 얼마예요?',
    explain: {
      why: [`${H} ÷ ${d} = ${H / d}, ${rest} ÷ ${d} = ${ieyo(restQ)}.`, mid0 ? `몫은 ${H / d} + ${restQ} = ${q}, 십의 자리에 나눌 것이 없어서 0이 들어가요.` : `몫은 ${H / d} + ${restQ} = ${ieyo(q)}.`, `그래서 ${N} ÷ ${d} = ${ieyo(q)}.`],
      alt: [`${d} × ${H / d} = ${H}, ${d} × ${restQ} = ${rest}라서 ${d} × ${q} = ${ieyo(N)}.`, `두 풀이 모두 ${ieyo(q)}.`],
    },
  };
}

/** 3단계: 나머지 있음 */
function t161Level3(N, d) {
  const q = Math.floor(N / d);
  const r = N % d;
  const answer = { q, r };
  return {
    text: [n(N), ' ÷ ', n(d), ' = ', unknown('□'), ' … ', unknown('□')],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'q', label: '몫' }, { key: 'r', label: '나머지' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'r', value: r + d, category: '개념', kind: 'nudge', feedbackCheck: '나머지를 다시 볼까요?', feedback: `나머지 ${r + d}${jo(r + d, '이', '가')} ${d}보다 작나요?` },
        { key: 'q', value: q - 1, category: '계산', kind: 'check', feedback: `${d} × ${q - 1}${jo(q - 1, '을', '를')} 다시 계산해 볼까요?` },
        { key: 'r', value: 0, category: '계산', kind: 'check', feedback: '나머지를 다시 볼까요?' },
      ],
      answer,
    ),
    hints: [`${eul(N)} ${ro(d)} 나눈 몫과 나머지를 물어요.`, '백의 자리부터 차례로 나누고, 남은 수는 다음 자리와 합쳐서 나눠 볼까요?', `${d} × ${q} = ${ieyo(d * q)}.`, `${N} − ${d * q} = ☐`],
    blank: `${N} − ${d * q} = ☐`,
    blankAnswer: String(r),
    blankThen: '몫과 나머지를 써요.',
    explain: {
      why: [`${d} × ${q} = ${d * q}${jo(d * q, '이고', '고')}, ${N} − ${d * q} = ${ieyo(r)}.`, `나머지 ${eun(r)} ${d}보다 작아요.`, `그래서 ${N} ÷ ${d} = ${q} … ${ieyo(r)}.`],
      alt: [`${d} × ${q} + ${r} = ${N}${roOnly(N)} 확인해요.`, `두 풀이 모두 몫 ${q}, 나머지 ${ieyo(r)}.`],
    },
  };
}

function pickDiv3(rng, level) {
  return draw(
    rng,
    () => {
      const d = rng.int(2, level === 1 ? 3 : 9);
      const q = rng.int(101, 499);
      return [d * q, d];
    },
    ([N, d]) => {
      const q = N / d;
      const [a, b, c] = d3(q);
      if (N > 999 || c === 0) return false;
      if (level === 1) return b !== 0 && a * d < 10 && b * d < 10 && c * d < 10 && !(a === d && b === d && c === d);
      return b === 0 && a * d < 10;
    },
    level === 1 ? [369, 3] : [624, 6],
  );
}

const T16_1 = {
  id: 'T16-1',
  node: 'N16',
  title: '정비창 점검: (세 자리)÷(한 자리)',
  repr: '식',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 3) {
      const [N, d] = draw(rng, () => [rng.int(300, 999), rng.int(3, 9)], ([NN, dd]) => NN % dd !== 0 && Math.floor(NN / dd) >= 100 && Math.floor(NN / dd) % 10 !== 0, [745, 6]);
      return t161Level3(N, d);
    }
    const [N, d] = pickDiv3(rng, level);
    return buildDiv(N, d);
  },
};

// ── T16-2 시장의 상자와 값 (문장 + 그림) — 1~4단계 ──

/** 1단계: 오징어 묶음(몫 두 자리) */
function t162Level1(N, d) {
  const q = N / d;
  const tq = Math.floor(q / 10) * 10;
  const part1 = d * tq;
  const part2 = N - part1;
  return {
    text: ['어느 날 자갈치시장 가게에서 오징어 ', V(N), '마리를 ', V(d), '마리씩 한 묶음으로 묶었어요. 몇 묶음이에요?'],
    figure: null,
    input: { kind: 'number', unit: '묶음' },
    answer: q,
    discriminators: uniq(
      [
        { value: swap2(q), category: '계산', kind: 'check', feedback: `${d} × ${swap2(q)}${jo(swap2(q), '이', '가')} ${N}일까요?` },
        { value: N * d, category: '식', kind: 'check', feedback: '묶음이 마리보다 많을까요?' },
      ],
      q,
    ),
    hints: [`오징어는 ${N}마리이고, ${d}마리씩 한 묶음이에요. 묶음 수를 물어요.`, `${eul(N)} ${wa(part1)} ${ro(part2)} 나눠 볼까요? 둘 다 ${d}마리씩 묶기 쉬워요.`, `${part1}마리는 ${tq}묶음이에요.`, `${part2} ÷ ${d} = ☐`],
    blank: `${part2} ÷ ${d} = ☐`,
    blankAnswer: String(q % 10),
    blankThen: '모두 몇 묶음이에요?',
    explain: {
      why: [`${N}마리를 ${d}마리씩 묶으면 ${N} ÷ ${d}이에요.`, `${part1} ÷ ${d} = ${tq}, ${part2} ÷ ${d} = ${q % 10}, 합치면 ${ieyo(q)}.`, `그래서 ${q}묶음이에요.`],
      alt: [`${d} × ${q} = ${N}${roOnly(N)} 확인해요.`, `어느 길로 해도 답은 ${q}묶음이에요.`],
    },
  };
}

/** 2단계: 상자에 똑같이(몫 가운데 0) */
function t162Level2(N, d) {
  const base = buildDiv(N, d);
  const q = N / d;
  return {
    ...base,
    text: ['어느 날 자갈치시장에서 생선 ', V(N), '마리를 상자 ', V(d), '개에 똑같이 나눠 담았어요. 한 상자에 몇 마리예요?'],
    input: { kind: 'number', unit: '마리' },
    hints: [`생선 ${N}마리를 상자 ${d}개에 똑같이 담아요. 한 상자의 마리 수를 물어요.`, ...base.hints.slice(1)],
    explain: { why: [...base.explain.why.slice(0, 2), `그래서 한 상자에 ${q}마리예요.`], alt: base.explain.alt },
  };
}

/** 3단계: 한 상자 값 비교(전체 값이 큰 쪽이 한 상자는 쌈) */
function t162Level3(bigName, a, p, smallName, b, q) {
  const P = a * p;
  const Q = b * q;
  const answer = { big: p, small: q, more: smallName };
  const bl = blankAt(q, 0);
  return {
    text: ['어느 날 자갈치시장에서 ', bigName, ' ', V(a), '상자는 ', V(P), '만 원, ', smallName, ' ', V(b), '상자는 ', V(Q), '만 원이었어요. 한 상자 값이 더 비싼 생선은 어느 쪽이에요?'],
    figure: null,
    input: {
      kind: 'compound',
      fields: [
        { key: 'big', label: `${bigName} 한 상자(만 원)` },
        { key: 'small', label: `${smallName} 한 상자(만 원)` },
        { key: 'more', label: '더 비싼 생선', options: [bigName, smallName] },
      ],
    },
    answer,
    discriminators: uniqK([{ key: 'more', value: bigName, category: '개념', kind: 'check', feedback: '한 상자 값을 다시 견주어 볼까요?' }], answer),
    hints: [`${jw(bigName, '은', '는')} ${a}상자에 ${P}만 원, ${jw(smallName, '은', '는')} ${b}상자에 ${Q}만 원이에요. 한 상자 값이 더 비싼 생선을 물어요.`, '생선마다 한 상자 값을 먼저 구해 볼까요?', `${bigName} 한 상자는 ${P} ÷ ${a} = ${p}만 원이에요.`, `${smallName} 한 상자는 ${Q} ÷ ${b} = ${bl.blank}만 원`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '더 비싼 생선은 어느 쪽이에요?',
    explain: {
      why: [`${bigName} 한 상자는 ${P} ÷ ${a} = ${p}만 원, ${smallName} 한 상자는 ${Q} ÷ ${b} = ${q}만 원이에요.`, `전체 값은 ${jw(bigName, '이', '가')} 크지만, 한 상자는 ${jw(smallName, '이', '가')} ${q - p}만 원 더 비싸요.`, `그래서 한 상자 값이 더 비싼 생선은 ${jw(smallName, '이에요', '예요')}.`],
      alt: [`${smallName} 한 상자가 ${p}만 원이라면 ${b}상자는 ${p * b}만 원이에요. 실제로는 ${Q}만 원이라 더 비싸요.`, `두 풀이 모두 ${jw(smallName, '이에요', '예요')}.`],
    },
  };
}

/** 4단계: 잘못 묶은 결과 → 처음 수 → 다시 나누기 */
function t162Level4(d, w, m, r) {
  const N = w * m + r;
  const q2 = Math.floor(N / d);
  const r2 = N % d;
  const answer = { q2, r2 };
  return {
    text: ['어느 날 오징어를 ', V(d), '마리씩 묶어야 하는데 잘못해서 ', V(w), '마리씩 묶었더니 ', V(m), '묶음이 되고 ', V(r), '마리가 남았어요. 바르게 ', V(d), '마리씩 묶으면 몇 묶음이 되고 몇 마리가 남아요?'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'q2', label: '묶음' }, { key: 'r2', label: '남은 마리' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'q2', value: N, category: '식', kind: 'nudge', feedbackCheck: '무엇을 물었는지 다시 볼까요?', feedback: `오징어 ${N}마리를 찾았어요. 다음엔요?` },
        { key: 'q2', value: m, category: '읽기', kind: 'check', feedback: `${m}묶음은 ${w}마리씩 묶었을 때예요.` },
        { key: 'q2', value: Math.floor((w * m) / d), category: '개념', kind: 'nudge', feedbackCheck: `${r}마리는 어디에 들어갔나요?`, feedback: `남은 ${r}마리도 오징어예요.` },
        { key: 'r2', value: 0, category: '계산', kind: 'check', feedback: '남은 마리를 다시 볼까요?' },
      ],
      answer,
    ),
    hints: [`${w}마리씩 묶어 ${m}묶음과 ${r}마리가 남았어요. 바르게 ${d}마리씩 묶을 때의 묶음과 남은 마리를 물어요.`, '오징어가 모두 몇 마리인지부터 구해 볼까요?', `오징어는 ${w} × ${m} + ${r} = ${N}마리예요.`, `${N} ÷ ${d}의 나머지: ☐`],
    blank: '나머지: ☐',
    blankAnswer: String(r2),
    blankThen: '묶음과 남은 마리를 써요.',
    explain: {
      why: [`오징어는 ${w} × ${m} + ${r} = ${N}마리예요.`, `${N} ÷ ${d} = ${q2} … ${ieyo(r2)}.`, `그래서 ${q2}묶음이 되고 ${r2}마리가 남아요.`],
      alt: [`${d} × ${q2} + ${r2} = ${N}${roOnly(N)} 확인해요.`, `두 풀이 모두 ${q2}묶음, ${r2}마리예요.`],
    },
  };
}

const T16_2 = {
  id: 'T16-2',
  node: 'N16',
  title: '시장의 상자와 값',
  repr: '문장',
  minLevel: 1,
  maxLevel: 4,
  generate(rng, level) {
    if (level === 1) {
      const [N, d] = draw(rng, () => {
        const dd = rng.int(3, 8);
        return [dd * rng.int(21, 99), dd];
      }, ([NN, dd]) => NN >= 100 && NN <= 999 && (NN / dd) % 10 !== 0 && swap2(NN / dd) !== NN / dd, [312, 6]);
      return t162Level1(N, d);
    }
    if (level === 2) {
      const [N, d] = pickDiv3(rng, 2);
      return t162Level2(N, d);
    }
    if (level === 3) {
      const names = rng.shuffle(['갈치', '고등어']);
      const [a, p, b, q] = draw(
        rng,
        () => {
          const aa = rng.int(5, 9);
          const bb = rng.int(3, aa - 1);
          const pp = rng.int(20, 60);
          return [aa, pp, bb, pp + rng.int(1, 9)];
        },
        ([aa, pp, bb, qq]) => aa * pp <= 999 && bb * qq >= 100 && aa * pp > bb * qq,
        [7, 35, 4, 39],
      );
      return t162Level3(names[0], a, p, names[1], b, q);
    }
    const [d, w, m, r] = draw(
      rng,
      () => [rng.int(3, 7), rng.int(4, 9), rng.int(30, 99), rng.int(1, 8)],
      ([dd, ww, mm, rr]) => dd !== ww && rr < ww && ww * mm + rr >= 100 && ww * mm + rr <= 999 && (ww * mm + rr) % dd !== 0 && Math.floor((ww * mm) / dd) !== Math.floor((ww * mm + rr) / dd) && ![mm, ww * mm + rr].includes(Math.floor((ww * mm + rr) / dd)),
      [6, 8, 78, 2],
    );
    return t162Level4(d, w, m, r);
  },
};

// ── T16-3 도전 문제 (challenge) — 5~7단계 ──
function t163Level5(d) {
  const r = 999 % d;
  const ans = 999 - r;
  const bl = blankAt(ans, 0);
  return {
    text: [n(d), '로 나누어떨어지는 가장 큰 세 자리 수는 얼마예요?'.replace('로', d === 6 || d === 3 ? '으로' : '로')],
    figure: null,
    challenge: true,
    input: { kind: 'number' },
    answer: ans,
    discriminators: uniq(
      [
        { value: 999, category: '개념', kind: 'check', feedback: `999 ÷ ${d}${jo(d, '은', '는')} 나누어떨어지나요?` },
        { value: ans + d, category: '개념', kind: 'check', feedback: '세 자리 수인지 다시 볼까요?' },
        { value: r, category: '읽기', kind: 'check', feedback: '무엇을 물었는지 다시 볼까요?' },
      ],
      ans,
    ),
    hints: [`${ro(d)} 나누어떨어지는 세 자리 수 중 가장 큰 수를 물어요.`, `가장 큰 세 자리 수 999를 먼저 ${ro(d)} 나눠 볼까요? 나머지만큼 줄이면 돼요.`, `999 ÷ ${d} = ${Math.floor(999 / d)} … ${ieyo(r)}.`, `999 − ${r} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`999 ÷ ${d} = ${Math.floor(999 / d)} … ${r}, 999는 나누어떨어지지 않아요.`, `나머지 ${r}만큼 줄인 ${ans}${jo(ans, '은', '는')} ${d} × ${Math.floor(999 / d)}${jo(Math.floor(999 / d), '이에요', '예요')}.`, `그래서 가장 큰 수는 ${ieyo(ans)}.`],
      alt: [`${ans} + ${d} = ${ans + d}${jo(ans + d, '은', '는')} 네 자리 수라서 ${ans}${jo(ans, '이', '가')} 가장 커요.`, `두 풀이 모두 ${ieyo(ans)}.`],
    },
  };
}

function t163Level6(xy, d) {
  const answer = Array.from({ length: d - 1 }, (_, i) => i + 1);
  const tail = String(xy).padStart(2, '0');
  const discs = [
    { value: [...answer, d], category: '개념', kind: 'check', feedback: `${d}${tail} ÷ ${d}의 몫은 몇 자리예요?` },
  ];
  if (answer.length >= 2) discs.push({ value: answer.slice(0, -1), category: '개념', kind: 'nudge', feedbackCheck: '빠진 것이 없나요?', feedback: `${d - 1}${tail} ÷ ${d}도 계산해 봤나요?` });
  return {
    text: [unknown(`□${tail}`), ' ÷ ', n(d), '의 몫이 두 자리 수예요. □에 들어갈 수 있는 수를 모두 골라요.'],
    figure: null,
    challenge: true,
    input: { kind: 'multi', options: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    answer,
    discriminators: uniq(discs, answer),
    grade: multiGrade(answer, discs),
    hints: [`□${tail}${jo(xy % 10, '을', '를')} ${ro(d)} 나눈 몫이 두 자리 수가 되는 □를 모두 물어요.`, `몫이 세 자리가 되려면 나뉠 수가 ${d} × 100 = ${d * 100}보다 크거나 같아야 해요. □를 넣어 견주어 볼까요?`, `□가 ${d}${jo(d, '이면', '면')} ${d}${tail}${jo(xy % 10, '이', '가')} ${d * 100}보다 커요.`, '1부터 ☐까지'],
    blank: '1부터 ☐까지',
    blankAnswer: String(d - 1),
    explain: {
      why: [`나뉠 수가 ${d * 100}보다 작으면 몫은 두 자리예요.`, `□${tail}${jo(xy % 10, '이', '가')} ${d * 100}보다 작으려면 □는 ${d}보다 작아야 해요.`, `그래서 □는 1부터 ${d - 1}까지예요.`],
      alt: [`${d - 1}${tail} ÷ ${wa(d)} ${d}${tail} ÷ ${eul(d)} 직접 나눠 몫의 자리 수를 견주어도 돼요.`, `어느 길로 해도 답은 1부터 ${d - 1}까지로 같아요.`],
    },
  };
}

function t163Level7(d, r) {
  const qmin = Math.ceil((100 - r) / d);
  const min = d * qmin + r;
  const max = d * 99 + r;
  const answer = { min, max };
  const bl = blankAt(qmin, 0);
  return {
    text: ['세 자리 수를 ', n(d), jo(d, '으로', '로').replace('으로', roOnly(d)), ' 나눴더니 몫은 두 자리 수, 나머지는 ', n(r), jo(r, '이에요', '예요'), '. 나뉠 수가 될 수 있는 가장 작은 수와 가장 큰 수는 얼마예요?'],
    figure: null,
    challenge: true,
    input: { kind: 'compound', fields: [{ key: 'min', label: '가장 작은 수' }, { key: 'max', label: '가장 큰 수' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'min', value: d * 10 + r, category: '개념', kind: 'check', feedback: `${d * 10 + r}${jo(d * 10 + r, '은', '는')} 세 자리 수인가요?` },
        { key: 'max', value: d * 99, category: '개념', kind: 'check', feedback: `나머지 ${r}도 들어갔나요?` },
        { key: 'max', value: 999, category: '개념', kind: 'check', feedback: `999 ÷ ${d}의 나머지는 ${r}인가요?` },
      ],
      answer,
    ),
    hints: [`세 자리 수를 ${ro(d)} 나누면 몫은 두 자리, 나머지는 ${ieyo(r)}. 나뉠 수의 가장 작은 수와 가장 큰 수를 물어요.`, `나뉠 수 = ${d} × (몫) + ${ieyo(r)}. 몫이 될 수 있는 가장 작은 수와 가장 큰 수를 먼저 생각해 볼까요?`, `몫이 99이면 ${d} × 99 + ${r} = ${ieyo(max)}.`, `나뉠 수가 세 자리가 되는 가장 작은 몫: ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '가장 작은 수와 가장 큰 수를 써요.',
    explain: {
      why: [`몫이 10이면 ${d} × 10 + ${r} = ${d * 10 + r}${roOnly(d * 10 + r)} 세 자리가 아니에요.`, `몫이 ${qmin}부터 세 자리가 되어 ${d} × ${qmin} + ${r} = ${min}, 몫이 99이면 ${ieyo(max)}.`, `그래서 가장 작은 수는 ${min}, 가장 큰 수는 ${ieyo(max)}.`],
      alt: [`${min} ÷ ${d} = ${qmin} … ${r}, ${max} ÷ ${d} = 99 … ${r}${roOnly(r)} 확인해요.`, `두 풀이 모두 ${wa(min)} ${ieyo(max)}.`],
    },
  };
}

const T16_3 = {
  id: 'T16-3',
  node: 'N16',
  title: '도전 문제: 세 자리 나눗셈',
  repr: '식',
  challenge: true,
  minLevel: 5,
  maxLevel: 7,
  generate(rng, level) {
    if (level === 5) return t163Level5(rng.pick([4, 6, 7, 8]));
    if (level === 6) return t163Level6(rng.int(11, 99), rng.int(3, 8));
    const [d, r] = draw(rng, () => [rng.int(5, 9), rng.int(1, 8)], ([dd, rr]) => rr < dd, [7, 6]);
    return t163Level7(d, r);
  },
};

// ── T16-4 수 모형 나누기 (그림) — 1~3단계, 09 보강 후보 ──
function t164Level1(N, d) {
  const q = N / d;
  const [H, T, U] = d3(N);
  return {
    text: [n(N), jo(N, '을', '를'), ' 수 모형으로 나타냈어요. ', n(d), '명이 똑같이 나누어 가지면 한 사람에게 얼마씩이에요?'],
    figure: { kind: 'base10', hundreds: H, tens: T, ones: U },
    input: { kind: 'number' },
    answer: q,
    discriminators: uniq([{ value: N * d, category: '식', kind: 'check', feedback: '나누면 커질까요?' }, { value: (H / d) * 100 + (T / d) * 10, category: '개념', kind: 'check', feedback: '일 모형도 나눴나요?' }], q),
    hints: [`수 모형은 백 모형 ${H}개, 십 모형 ${T}개, 일 모형 ${U}개예요. ${d}명이 똑같이 가질 때 한 사람 몫을 물어요.`, '백 모형부터 한 사람에게 똑같이 나눠 줘 볼까요? 그다음 십 모형, 일 모형도 나눠 줘요.', `백 모형은 한 사람에게 ${H / d}개씩이에요.`, '십 모형은 한 사람에게 ☐개'],
    blank: '십 모형 ☐개',
    blankAnswer: String(T / d),
    blankThen: '한 사람에게 얼마씩이에요?',
    explain: {
      why: [`백 모형 ${H / d}개, 십 모형 ${T / d}개, 일 모형 ${U / d}개씩 나눠 가져요.`, `한 사람에게 ${(H / d) * 100} + ${(T / d) * 10} + ${U / d} = ${ieyo(q)}.`, `그래서 ${N} ÷ ${d} = ${ieyo(q)}.`],
      alt: [`${d} × ${q} = ${N}${roOnly(N)} 확인해요.`, `두 풀이 모두 ${ieyo(q)}.`],
    },
  };
}

/** 2단계: 십 모형이 모자라 몫의 십의 자리가 0 */
function t164Level2(N, d) {
  const q = N / d;
  const [H, T, U] = d3(N);
  const answer = { tens: 0, q };
  const noZero = (H / d) * 10 + (10 * T + U) / d;
  return {
    text: [n(N), jo(N, '을', '를'), ' 수 모형으로 나타냈어요. ', n(d), '명이 똑같이 나누어 가져요. 한 사람이 받는 십 모형은 몇 개이고, 한 사람에게 얼마씩이에요?'],
    figure: { kind: 'base10', hundreds: H, tens: T, ones: U },
    input: { kind: 'compound', fields: [{ key: 'tens', label: '한 사람이 받는 십 모형' }, { key: 'q', label: '한 사람 몫' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'q', value: noZero, category: '개념', kind: 'check', feedback: `${d} × ${noZero}${jo(noZero, '이', '가')} ${N}일까요?` },
        { key: 'tens', value: T, category: '개념', kind: 'check', feedback: `십 모형 ${T}개를 ${d}명이 똑같이 가질 수 있나요?` },
      ],
      answer,
    ),
    hints: [`수 모형은 백 모형 ${H}개, 십 모형 ${T}개, 일 모형 ${U}개예요. ${d}명이 똑같이 가질 때 한 사람이 받는 십 모형 수와 한 사람 몫을 물어요.`, '백 모형부터 나눠 줘 볼까요? 모자라서 나눠 줄 수 없는 모형은 아래 모형으로 바꿔요.', `백 모형은 한 사람에게 ${H / d}개씩이에요.`, '십 모형을 일 모형으로 바꿔 나누면 한 사람에게 일 모형 ☐개'],
    blank: '일 모형 ☐개',
    blankAnswer: String((10 * T + U) / d),
    blankThen: '두 칸을 채워요.',
    explain: {
      why: [`백 모형은 ${H / d}개씩이에요. 십 모형 ${T}개는 ${d}명에게 나눠 줄 수 없어서 일 모형 ${10 * T}개로 바꿔요.`, `일 모형 ${10 * T + U}개를 나누면 ${(10 * T + U) / d}개씩, 몫의 십의 자리는 0이에요.`, `그래서 십 모형은 0개, 한 사람에게 ${ieyo(q)}.`],
      alt: [`${d} × ${q} = ${N}${roOnly(N)} 확인해요.`, `두 풀이 모두 ${ieyo(q)}.`],
    },
  };
}

/** 3단계: 남은 백 모형을 십 모형으로 바꿔 나누기 */
function t164Level3(N, d) {
  const q = N / d;
  const [H, T, U] = d3(N);
  const left = H % d;
  const answer = { change: left, q };
  const dropped = Math.floor(H / d) * 100 + Math.floor(T / d) * 10 + Math.floor(U / d);
  return {
    text: [n(N), jo(N, '을', '를'), ' 수 모형으로 나타냈어요. ', n(d), '명이 똑같이 나누어 가져요. 십 모형으로 바꿔야 하는 백 모형은 몇 개이고, 한 사람에게 얼마씩이에요?'],
    figure: { kind: 'base10', hundreds: H, tens: T, ones: U },
    input: { kind: 'compound', fields: [{ key: 'change', label: '바꾸는 백 모형' }, { key: 'q', label: '한 사람 몫' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'change', value: 0, category: '개념', kind: 'check', feedback: '백 모형이 남지 않나요?' },
        { key: 'q', value: dropped, category: '개념', kind: 'nudge', feedbackCheck: '남은 백 모형을 다시 볼까요?', feedback: '남은 백 모형은 십 모형 10개로 바꿔 볼까요?' },
      ],
      answer,
    ),
    hints: [`수 모형은 백 모형 ${H}개, 십 모형 ${T}개, 일 모형 ${U}개예요. ${d}명이 똑같이 가질 때 바꿔야 하는 백 모형 수와 한 사람 몫을 물어요.`, '백 모형부터 똑같이 나눠 줘 볼까요? 남은 백 모형은 십 모형 10개로 바꿔서 나눠요.', `백 모형은 한 사람에게 ${Math.floor(H / d)}개씩 나눠 줄 수 있어요.`, '남은 백 모형을 바꾼 십 모형까지 나누면 한 사람에게 십 모형 ☐개'],
    blank: '십 모형 ☐개',
    blankAnswer: String(Math.floor((10 * left + T) / d)),
    blankThen: '두 칸을 채워요.',
    explain: {
      why: [`백 모형 ${H}개를 ${d}명이 나누면 ${Math.floor(H / d)}개씩이고 ${left}개가 남아요.`, `남은 ${left}개를 십 모형 ${10 * left}개로 바꿔 십 모형 ${10 * left + T}개를 나누고, 남는 것은 일 모형으로 바꿔 나눠요.`, `그래서 백 모형 ${left}개를 바꾸고, 한 사람에게 ${ieyo(q)}.`],
      alt: [`${d} × ${q} = ${N}${roOnly(N)} 확인해요.`, `두 풀이 모두 ${ieyo(q)}.`],
    },
  };
}

const T16_4 = {
  id: 'T16-4',
  node: 'N16',
  title: '수 모형 나누기',
  repr: '그림',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const [N, d] = draw(
      rng,
      () => {
        const dd = rng.int(2, level === 1 ? 3 : 5);
        return [dd * rng.int(101, 333), dd];
      },
      ([NN, dd]) => {
        if (NN > 999) return false;
        const [H, T, U] = d3(NN);
        const q = NN / dd;
        if (q % 10 === 0) return false;
        if (level === 1) return H % dd === 0 && T % dd === 0 && U % dd === 0 && T > 0 && U > 0;
        if (level === 2) return H % dd === 0 && T > 0 && T < dd && Math.floor(q / 10) % 10 === 0;
        return H >= dd && H % dd >= 1;
      },
      level === 1 ? [264, 2] : level === 2 ? [624, 6] : [532, 4],
    );
    if (level === 1) return t164Level1(N, d);
    return level === 2 ? t164Level2(N, d) : t164Level3(N, d);
  },
};

// ── 급행 통과 진단 ──
const D1 = {
  id: 'N16-D1',
  node: 'N16',
  title: '급행 진단: 624 ÷ 6',
  repr: '식',
  minLevel: 2,
  maxLevel: 2,
  diagnostic: true,
  generate() {
    return { ...buildDiv(624, 6), hints: [], blank: null };
  },
};
const D2 = {
  id: 'N16-D2',
  node: 'N16',
  title: '급행 진단: 한 상자 값 비교',
  repr: '문장',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...t162Level3('갈치', 7, 35, '고등어', 4, 39), hints: [], blank: null };
  },
};
const D3 = {
  id: 'N16-D3',
  node: 'N16',
  title: '급행 진단(예비): 잘못 묶은 오징어',
  repr: '문장',
  minLevel: 4,
  maxLevel: 4,
  diagnostic: true,
  generate() {
    return { ...t162Level4(6, 8, 78, 2), hints: [], blank: null };
  },
};

export default [T16_1, T16_2, T16_3, T16_4, D1, D2, D3];
