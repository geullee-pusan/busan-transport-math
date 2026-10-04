// N19 부산역 — 나눗셈 활용: 나머지 처리, 검산 [4수01-06]. 천장 9.
// 기준: docs/curriculum/08-line1-templates-11-20.md 19절(부산시티투어버스: 부산역 출발, 레드·그린·블루라인, 2층 버스 — FACTS ✅), 09 끝 보강 후보(그림: 좌석 줄, 빈칸: 나머지 처리 표). 시간은 "몇 분"으로만. 좌석 수·배차 간격은 실제 값이 따로 있으므로 "~라고 해 봐요"로 쓴다.
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

const SRC_TOUR = 'FACTS: 부산시티투어버스 레드·그린·블루라인, 부산역 출발 → 부산역 도착, 2층 버스(citytourbusan.com, 2026-10-04 확인)';
const TWO = () => label('2', { source: SRC_TOUR });
const LINES = ['레드', '그린', '블루'];
const blankOf = (v) => (v >= 10 ? blankAt(v, 0) : { blank: '☐', blankAnswer: String(v) });
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

// ── T19-1 올림이냐 버림이냐 (문장) — 1~6단계 ──

/** 1단계: 모두 앉으려면 몇 줄(올림) */
function t191Level1(N, s) {
  const q = Math.floor(N / s);
  const r = N % s;
  const ans = q + 1;
  const bl = blankOf(ans);
  return {
    text: ['부산역에서 출발하는 시티투어 ', TWO(), '층 버스 위층에 한 줄이 ', V(s), '자리라고 해 봐요. 단체 ', V(N), '명이 모두 앉으려면 몇 줄이 필요해요?'],
    figure: null,
    input: { kind: 'number', unit: '줄' },
    answer: ans,
    discriminators: uniq(
      [
        { value: q, category: '개념', kind: 'check', feedback: `${N}명이 모두 앉았나요?` },
        { value: r, category: '읽기', kind: 'check', feedback: '무엇을 물었는지 다시 볼까요?' },
      ],
      ans,
    ),
    hints: [`한 줄에 ${s}자리이고, 단체 ${N}명이 모두 앉아요. 필요한 줄 수를 물어요.`, `${s}명씩 묶어 볼까요? 남은 사람도 앉아야 해요.`, `${N} ÷ ${s} = ${q} … ${ieyo(r)}.`, `모두 앉는 데 필요한 줄: ${bl.blank}줄`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${N} ÷ ${s} = ${q} … ${ieyo(r)}.`, `${q}줄이 꽉 차도 ${r}명이 남아서 한 줄이 더 필요해요.`, `그래서 ${ans}줄이에요.`],
      alt: [`${s} × ${q} = ${s * q}명은 ${q}줄, ${N}명은 그보다 많으니 ${ans}줄이에요.`, `두 풀이 모두 ${ans}줄이에요.`],
    },
  };
}

/** 2단계: 꽉 찬 봉투(버림) + 확인 계산 */
function t191Level2(N, s) {
  const q = Math.floor(N / s);
  const r = N % s;
  const answer = { env: q, left: r, chk: N };
  return {
    text: ['어느 날 기념 승차권 ', V(N), '장을 ', V(s), '장씩 봉투에 넣었어요. 꽉 찬 봉투는 몇 개이고 몇 장이 남았어요? (나누는 수) × (몫) + (나머지)도 계산해 확인해요.'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'env', label: '꽉 찬 봉투' }, { key: 'left', label: '남은 장' }, { key: 'chk', label: '확인 계산' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'env', value: q + 1, category: '개념', kind: 'check', feedback: `${q + 1}번째 봉투는 꽉 찼나요?` },
        { key: 'left', value: r + s, category: '개념', kind: 'nudge', feedbackCheck: '남은 장을 다시 볼까요?', feedback: `남은 ${r + s}장으로 봉투를 하나 더 채울 수 있지 않나요?` },
        { key: 'chk', value: s * q, category: '식', kind: 'nudge', feedbackCheck: '확인 계산을 다시 볼까요?', feedback: '나머지도 더했나요?' },
      ],
      answer,
    ),
    hints: [`승차권 ${N}장을 ${s}장씩 봉투에 넣어요. 꽉 찬 봉투 수, 남은 장 수, 확인 계산의 값을 물어요.`, `${s}단에서 ${N}보다 크지 않은 가장 큰 수를 찾아볼까요?`, `${s} × ${q} = ${ieyo(s * q)}.`, `${N} − ${s * q} = ☐`],
    blank: `${N} − ${s * q} = ☐`,
    blankAnswer: String(r),
    blankThen: '세 칸을 채워요.',
    explain: {
      why: [`${N} ÷ ${s} = ${q} … ${ieyo(r)}.`, `${r}장으로는 봉투를 채울 수 없으니 꽉 찬 봉투는 ${q}개예요.`, `그래서 꽉 찬 봉투 ${q}개, 남은 승차권 ${r}장, 확인하면 ${s} × ${q} + ${r} = ${ieyo(N)}.`],
      alt: [`확인 계산이 처음 수 ${N}${jo(N, '과', '와')} 같으니 바르게 나눴어요.`, `두 풀이 모두 ${q}개와 ${r}장이에요.`],
    },
  };
}

/** 3단계: 같은 나눗셈, 올림과 버림을 나란히 */
function t191Level3(N, s) {
  const q = Math.floor(N / s);
  const answer = { ga: q + 1, na: q };
  const fb = '(가)와 (나)는 같은 상황인가요?';
  const bl = blankOf(q + 1);
  return {
    text: ['두 상황의 답을 써요. (가) 한 줄이 ', V(s), '자리라고 해 봐요. ', V(N), '명이 모두 앉으려면 몇 줄이 필요해요? (나) 승차권 ', V(N), '장을 ', V(s), '장씩 묶으면 꽉 찬 묶음은 몇 개예요?'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'ga', label: '(가) 줄' }, { key: 'na', label: '(나) 꽉 찬 묶음' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'ga', value: q, category: '개념', kind: 'check', feedback: fb },
        { key: 'na', value: q + 1, category: '개념', kind: 'check', feedback: fb },
      ],
      answer,
    ),
    hints: [`(가)는 ${N}명이 모두 앉는 줄 수, (나)는 ${N}장을 ${s}장씩 묶은 꽉 찬 묶음 수를 물어요.`, '두 상황 모두 같은 나눗셈이에요. 남은 것을 어떻게 할지 상황마다 생각해 볼까요?', `${N} ÷ ${s} = ${q} … ${ieyo(N % s)}.`, `(가) 모두 앉는 데 필요한 줄: ${bl.blank}줄`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '(나)도 써요.',
    explain: {
      why: [`${N} ÷ ${s} = ${q} … ${ieyo(N % s)}.`, `(가)는 남은 ${N % s}명도 앉아야 해서 한 줄 더, (나)는 남은 ${N % s}장으로 꽉 찬 묶음을 만들 수 없어요.`, `그래서 (가) ${q + 1}줄, (나) ${q}개예요.`],
      alt: ['"모두"를 묻는지, "꽉 찬"을 묻는지 보면 나머지를 어떻게 할지 정할 수 있어요.', `두 풀이 모두 (가) ${q + 1}, (나) ${ieyo(q)}.`],
    },
  };
}

/** 4단계: 첫차 포함 출발 횟수 */
function t191Level4(i, T) {
  const q = Math.floor(T / i);
  const ans = q + 1;
  return {
    text: ['시티투어버스가 부산역에서 첫차부터 ', V(i), '분마다 출발한다고 해 봐요. 첫차가 출발한 뒤 ', V(T), '분 동안 첫차를 포함해 몇 번 출발해요?'],
    figure: null,
    input: { kind: 'number', unit: '번' },
    answer: ans,
    counting: true,
    discriminators: uniq(
      [
        { value: q, category: '개념', kind: 'check', feedback: '출발한 때를 다 적어 볼까요?' },
        { value: q + 2, category: '계산', kind: 'check', feedback: `마지막 차가 ${T}분 안에 출발하나요?` },
      ],
      ans,
    ),
    hints: [`첫차부터 ${i}분마다 출발해요. ${T}분 동안 첫차를 포함해 몇 번 출발하는지 물어요.`, '출발하는 때를 0분부터 차례로 적어 볼까요?', `0분, ${i}분, ${2 * i}분, …처럼 ${i}분씩 늘어나요. ${T}분을 넘기 전까지 적어 봐요.`, '출발 횟수: ☐번'],
    blank: '출발 횟수: ☐번',
    blankAnswer: String(ans),
    explain: {
      why: [`${T} ÷ ${i} = ${q} … ${ieyo(T % i)}.`, `첫차 뒤로 ${q}번 더 출발하고, 첫차까지 세면 ${ans}번이에요.`, `그래서 ${ans}번 출발해요.`],
      alt: [`출발 시각을 적으면 ${Array.from({ length: ans }, (_, k) => `${k * i}`).join(', ')}분으로 ${ans}개예요.`, `두 풀이 모두 ${ans}번이에요.`],
    },
  };
}

/** 5단계: 줄 수에서 인원 범위 */
function t191Level5(s, R) {
  const min = s * (R - 1) + 1;
  const max = s * R;
  const answer = { min, max };
  const bl = blankOf(min);
  return {
    text: ['버스 위층에 한 줄이 ', V(s), '자리라고 해 봐요. 어느 날 단체가 앞줄부터 앉았더니 ', V(R), '줄이 필요했어요(마지막 줄은 덜 찰 수 있어요). 단체는 가장 적을 때와 가장 많을 때 몇 명이에요?'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'min', label: '가장 적을 때' }, { key: 'max', label: '가장 많을 때' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'min', value: s * (R - 1), category: '개념', kind: 'nudge', feedbackCheck: `${s * (R - 1)}명이면 몇 줄이 필요해요?`, feedback: `${s * (R - 1)}명이면 ${R - 1}줄로 되지 않나요?` },
        { key: 'max', value: s * R + 1, category: '개념', kind: 'check', feedback: `${s * R + 1}명이면 몇 줄이 필요해요?` },
      ],
      answer,
    ),
    hints: [`한 줄에 ${s}자리, 필요한 줄은 ${R}줄이에요. 단체가 가장 적을 때와 가장 많을 때를 물어요.`, `마지막 줄이 꽉 찰 때와 1명만 앉을 때를 생각해 볼까요?`, `${R}줄이 꽉 차면 ${s} × ${R} = ${s * R}명이에요.`, `${R - 1}줄이 꽉 차고 1명이 더 있으면: ${bl.blank}명`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '두 칸을 채워요.',
    explain: {
      why: [`가장 많을 때는 ${R}줄이 모두 꽉 찬 ${s} × ${R} = ${max}명이에요.`, `가장 적을 때는 ${R - 1}줄이 꽉 차고 마지막 줄에 1명인 ${min}명이에요.`, `그래서 ${min}명부터 ${max}명까지예요.`],
      alt: [`${s * (R - 1)}명이면 ${R - 1}줄로 충분해서 ${R}줄이 필요하지 않아요.`, `두 풀이 모두 ${wa(min)} ${max}명이에요.`],
    },
  };
}

/** 6단계: 쓴 줄의 빈자리 */
function t191Level6(N, s) {
  const q = Math.floor(N / s);
  const r = N % s;
  const ans = s - r;
  return {
    text: ['버스 위층에 한 줄이 ', V(s), '자리라고 해 봐요. 어느 날 단체 ', V(N), '명이 앞줄부터 앉아 필요한 줄만 썼어요. 쓴 줄에 남은 빈자리는 몇 개예요?'],
    figure: null,
    input: { kind: 'number', unit: '개' },
    answer: ans,
    discriminators: uniq(
      [
        { value: r, category: '읽기', kind: 'check', feedback: '빈자리를 물었어요. 다시 볼까요?' },
        { value: q + 1, category: '읽기', kind: 'check', feedback: '무엇을 물었는지 다시 볼까요?' },
      ],
      ans,
    ),
    hints: [`한 줄에 ${s}자리이고, ${N}명이 필요한 줄만 써서 앉았어요. 쓴 줄의 빈자리 수를 물어요.`, '몇 줄이 꽉 차고 마지막 줄에 몇 명이 앉는지 볼까요?', `${N} ÷ ${s} = ${q} … ${ieyo(r)}.`, '쓴 줄의 빈자리: ☐개'],
    blank: '빈자리: ☐개',
    blankAnswer: String(ans),
    explain: {
      why: [`${N} ÷ ${s} = ${q} … ${r}, ${q}줄이 꽉 차고 마지막 줄에 ${r}명이 앉아요.`, `마지막 줄은 ${s}자리 중 ${r}자리만 차요.`, `그래서 빈자리는 ${s} − ${r} = ${ans}개예요.`],
      alt: [`쓴 줄은 ${q + 1}줄, 자리는 ${s * (q + 1)}개예요. ${s * (q + 1)} − ${N} = ${ieyo(ans)}.`, `두 풀이 모두 ${ans}개예요.`],
    },
  };
}

const T19_1 = {
  id: 'T19-1',
  node: 'N19',
  title: '올림이냐 버림이냐',
  repr: '문장',
  minLevel: 1,
  maxLevel: 6,
  generate(rng, level) {
    if (level === 1 || level === 6) {
      const [N, s] = draw(
        rng,
        () => [rng.int(25, 58), rng.int(3, 4)],
        ([NN, ss]) => NN % ss !== 0 && Math.floor(NN / ss) + 1 <= 15 && (level === 1 ? Math.floor(NN / ss) + 1 !== ss : 2 * (NN % ss) !== ss && ss - (NN % ss) !== Math.floor(NN / ss) + 1),
        [53, 4],
      );
      return level === 1 ? t191Level1(N, s) : t191Level6(N, s);
    }
    if (level === 2) {
      const [N, s] = draw(rng, () => [rng.int(60, 150), rng.int(6, 9)], ([NN, ss]) => NN % ss !== 0 && Math.floor(NN / ss) !== NN % ss, [100, 8]);
      return t191Level2(N, s);
    }
    if (level === 3) {
      const [N, s] = draw(rng, () => [rng.int(40, 99), rng.int(4, 6)], ([NN, ss]) => NN % ss !== 0, [72, 5]);
      return t191Level3(N, s);
    }
    if (level === 4) {
      const [i, T] = draw(rng, () => [rng.pick([10, 12, 15, 20]), rng.int(40, 100)], ([ii, TT]) => TT % ii !== 0 && Math.floor(TT / ii) + 1 <= 9 && ![ii, TT].includes(Math.floor(TT / ii) + 1), [15, 100]);
      return t191Level4(i, T);
    }
    const [s, R] = draw(rng, () => [rng.int(3, 4), rng.int(8, 14)], () => true, [4, 13]);
    return t191Level5(s, R);
  },
};

// ── T19-2 세 노선이 차례로 (문장) — 7~9단계 ──

/** 7단계: 두 조건(마지막 줄 사람 수) 모두 찾기 — "공배수"라는 말 없이 표로 */
function t192Level7(a, r1, b, r2, L) {
  const c1 = (v) => v % a === r1;
  const c2 = (v) => v % b === r2;
  const answer = [];
  const only1 = [];
  const only2 = [];
  for (let v = Math.max(a, b) + 1; v < L; v++) {
    if (c1(v) && c2(v)) answer.push(v);
    else if (c1(v)) only1.push(v);
    else if (c2(v)) only2.push(v);
  }
  const options = [...new Set([...answer, ...only1.slice(0, 4), ...only2.slice(0, 3)])].sort((x, y) => x - y);
  const discs = [
    { value: answer.slice(0, 1), category: '개념', kind: 'check', feedback: `${L}보다 적은 수가 더 있을까요?` },
    { value: options.filter(c1), category: '개념', kind: 'check', feedback: `${b}명씩 서는 조건도 맞는지 볼까요?` },
    { value: options.filter(c2), category: '개념', kind: 'check', feedback: `${a}명씩 서는 조건도 맞는지 볼까요?` },
  ];
  const bl = blankOf(answer[0]);
  return {
    text: ['부산역 시티투어버스 타는 곳에서 단체가 ', V(a), '명씩 줄을 서면 마지막 줄에 ', V(r1), '명, ', V(b), '명씩 줄을 서면 마지막 줄에 ', V(r2), '명이 서요. 단체는 ', V(L), '명보다 적어요. 단체는 몇 명일 수 있어요? 모두 골라요.'],
    figure: { kind: 'table', columns: [`${a}명씩 서면 마지막 줄 ${r1}명`, `${b}명씩 서면 마지막 줄 ${r2}명`], rows: [['…', '…']] },
    input: { kind: 'multi', options },
    answer,
    discriminators: uniq(discs, answer),
    grade: multiGrade(answer, discs),
    hints: [`${a}명씩 서면 마지막 줄에 ${r1}명, ${b}명씩 서면 마지막 줄에 ${r2}명이에요. ${L}명보다 적은 단체 인원을 모두 물어요.`, `표의 두 칸에 조건마다 될 수 있는 인원을 작은 것부터 적어 볼까요? 두 칸에 모두 있는 수를 찾아요.`, `${a}명씩일 때 될 수 있는 인원은 ${r1}, ${a + r1}, ${2 * a + r1}, …예요.`, `두 칸에 모두 있는 가장 작은 수: ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '나머지도 모두 골라요.',
    explain: {
      why: [`${a}명씩일 때 ${r1}, ${a + r1}, ${2 * a + r1}, …, ${b}명씩일 때 ${r2}, ${b + r2}, ${2 * b + r2}, …예요.`, `두 줄에 모두 있는 수는 ${answer.join(', ')}${jo(answer.at(-1), '이에요', '예요')}.`, `그래서 단체는 ${answer.join(', ')}명일 수 있어요.`],
      alt: [`찾은 수는 ${(a * b) / gcd(a, b)}씩 커져요. 표를 길게 적어 보면 보여요.`, `어느 길로 해도 답은 ${answer.join(', ')}${roOnly(answer.at(-1))} 같아요.`],
    },
  };
}

/** 8단계: 노선 이름이 주기로 돌아감 */
function t192Level8(k, X) {
  const rem = k % 3;
  const nth = LINES[(k - 1) % 3];
  const p = LINES.indexOf(X) + 1;
  const cnt = Math.floor((k - p) / 3) + 1;
  const answer = { nth, cnt };
  const bl = blankOf(cnt);
  const wrongLine = LINES[rem % 3];
  return {
    text: ['부산역에서 시티투어버스가 레드, 그린, 블루라인 차례로 돌아가며 출발한다고 해 봐요. 첫차는 레드예요. ', V(k), '번째로 출발하는 버스는 어느 노선이고, ', V(k), '번째까지 ', X, '라인은 몇 번 출발해요?'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'nth', label: `${k}번째 버스`, options: LINES }, { key: 'cnt', label: `${X}라인 출발 횟수` }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'nth', value: wrongLine, category: '개념', kind: 'nudge', feedbackCheck: '첫차가 무슨 노선이었죠?', feedback: `나머지 ${rem}${jo(rem, '은', '는')} 몇 번째 노선이에요?` },
        { key: 'cnt', value: Math.floor(k / 3), category: '개념', kind: 'check', feedback: `${k}번째 버스까지 다 세었나요?` },
        { key: 'cnt', value: Math.floor(k / 3) + 1, category: '개념', kind: 'check', feedback: `${k}번째 버스까지 다 세었나요?` },
      ],
      answer,
    ),
    hints: [`레드, 그린, 블루 차례로 출발해요. ${k}번째 버스의 노선과 ${k}번째까지 ${X}라인 출발 횟수를 물어요.`, '세 노선이 한 번씩 출발하면 한 묶음이에요. 몇 묶음이 돌고 몇 대가 남을까요?', `${k} ÷ 3 = ${Math.floor(k / 3)} … ${ieyo(rem)}.`, `${X}라인 출발 횟수: ${bl.blank}번`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: `${k}번째 버스의 노선도 골라요.`,
    explain: {
      why: [`${k} ÷ 3 = ${Math.floor(k / 3)} … ${rem}, 세 노선이 ${Math.floor(k / 3)}번 돌고 ${rem}대가 더 출발해요.`, `남은 ${rem}대는 레드${rem === 2 ? ', 그린' : ''}이라 ${k}번째는 ${nth}라인이고, ${X}라인은 ${cnt}번 출발해요.`, `그래서 ${nth}라인, ${cnt}번이에요.`],
      alt: [`${X}라인은 ${p}, ${p + 3}, ${p + 6}, …번째 버스예요. ${k}번째까지 세면 ${cnt}번이에요.`, `두 풀이 모두 ${nth}라인, ${cnt}번이에요.`],
    },
  };
}

/** 9단계: 몇 번째 버스 + 간격 수는 하나 적다 */
function t192Level9(g, X, m) {
  const p = LINES.indexOf(X) + 1;
  const idx = 3 * (m - 1) + p;
  const ans = (idx - 1) * g;
  const bl = blankOf(ans);
  return {
    text: ['같은 순서(레드, 그린, 블루)로 ', V(g), '분마다 한 대씩 출발한다고 해 봐요. 첫차(레드)가 ', n(0), '분에 출발해요. ', X, '라인이 ', V(m), '번째로 출발하는 것은 첫차가 출발하고 몇 분 뒤예요?'],
    figure: null,
    input: { kind: 'number', unit: '분' },
    answer: ans,
    discriminators: uniq(
      [
        { value: idx * g, category: '개념', kind: 'nudge', feedbackCheck: '첫차는 몇 분에 출발했나요?', feedback: '첫차는 0분이에요. 2번째 차는 몇 분?' },
        { value: m * g, category: '식', kind: 'nudge', feedbackCheck: '무엇을 물었는지 다시 볼까요?', feedback: `${X}라인 ${m}번째는 전체에서 몇 번째 버스예요?` },
      ],
      ans,
    ),
    hints: [`세 노선이 차례로 ${g}분마다 출발하고, 첫차는 0분이에요. ${X}라인이 ${m}번째로 출발하는 때를 물어요.`, `${X}라인 ${m}번째가 전체에서 몇 번째 버스인지 먼저 찾아볼까요? 1번째 버스는 0분이에요.`, `${X}라인 ${m}번째는 전체에서 ${idx}번째 버스예요.`, `(${idx} − 1) × ${g} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${X}라인은 ${p}, ${p + 3}, ${p + 6}, …번째 버스라서 ${m}번째는 전체에서 ${idx}번째예요.`, `1번째가 0분이고 ${idx}번째까지 간격은 ${idx - 1}개라 ${idx - 1} × ${g} = ${ans}분이에요.`, `그래서 첫차가 출발하고 ${ans}분 뒤예요.`],
      alt: [`${X}라인끼리는 ${3 * g}분 간격이에요. 첫 ${X}라인이 ${(p - 1) * g}분이니 ${(p - 1) * g} + ${3 * g} × ${m - 1} = ${ieyo(ans)}.`, `두 풀이 모두 ${ans}분이에요.`],
    },
  };
}

const T19_2 = {
  id: 'T19-2',
  node: 'N19',
  title: '세 노선이 차례로',
  repr: '문장',
  minLevel: 7,
  maxLevel: 9,
  generate(rng, level) {
    if (level === 7) {
      const [a, r1, b, r2, L] = draw(
        rng,
        () => {
          // 08처럼 나머지가 서로 다른 두 조건(마지막 줄이 한 명 모자람). 토성 7단계와 숫자가 겹치지 않게 짝을 따로 둔다(11 검토).
          const [aa, bb] = rng.pick([[4, 6], [6, 8], [4, 10], [6, 9]]);
          return [aa, aa - 1, bb, bb - 1, rng.pick([40, 50, 60, 70, 80])];
        },
        ([aa, rr1, bb, rr2, LL]) => {
          let c = 0;
          for (let v = Math.max(aa, bb) + 1; v < LL; v++) if (v % aa === rr1 && v % bb === rr2) c++;
          return c >= 2 && c <= 4;
        },
        [4, 3, 6, 5, 50],
      );
      return t192Level7(a, r1, b, r2, L);
    }
    if (level === 8) {
      const k = draw(rng, () => rng.int(31, 70), (v) => v % 3 !== 0, 50);
      return t192Level8(k, rng.pick(LINES));
    }
    return t192Level9(rng.pick([3, 4, 5]), rng.pick(LINES), rng.int(5, 12));
  },
};

// ── T19-3 버스 좌석 줄 (그림) — 1~3단계, 09 보강 후보 ──
function seatText(s, R, N, tail) {
  return ['그림은 시티투어 ', TWO(), '층 버스 위층 좌석이에요. 한 줄에 ', V(s), '자리씩 ', V(R), '줄이라고 해 봐요. 단체 ', V(N), '명이 앞줄부터 앉아요. ', tail];
}

function t193Level1(s, R, N) {
  const q = Math.floor(N / s);
  const r = N % s;
  const answer = { full: q, last: r };
  return {
    text: seatText(s, R, N, '꽉 찬 줄은 몇 줄이고, 마지막 줄에는 몇 명이 앉아요?'),
    figure: { kind: 'array', rows: R, cols: s },
    input: { kind: 'compound', fields: [{ key: 'full', label: '꽉 찬 줄' }, { key: 'last', label: '마지막 줄' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'full', value: q + 1, category: '개념', kind: 'check', feedback: '마지막 줄도 꽉 찼나요?' },
        { key: 'last', value: s - r, category: '읽기', kind: 'check', feedback: '앉은 사람 수를 물었어요.' },
      ],
      answer,
    ),
    hints: [`한 줄에 ${s}자리이고, ${N}명이 앞줄부터 앉아요. 꽉 찬 줄 수와 마지막 줄의 사람 수를 물어요.`, `그림에서 한 줄씩 ${s}명을 채워 볼까요?`, `${s}명씩 두 줄이면 ${2 * s}명이에요.`, '꽉 찬 줄: ☐줄'],
    blank: '꽉 찬 줄: ☐줄',
    blankAnswer: String(q),
    blankThen: '마지막 줄의 사람 수도 써요.',
    explain: {
      why: [`${N} ÷ ${s} = ${q} … ${ieyo(r)}.`, `${q}줄이 꽉 차고 마지막 줄에 ${r}명이 앉아요.`, `그래서 꽉 찬 줄은 ${q}줄, 마지막 줄은 ${r}명이에요.`],
      alt: [`${s} × ${q} + ${r} = ${N}${roOnly(N)} 확인해요.`, `두 풀이 모두 ${q}줄, ${r}명이에요.`],
    },
  };
}

function t193Level2(s, R, N) {
  // 빈 줄 수: 앉은 줄 수(올림)를 먼저 구해야 한다(11 검토: 뺄셈만 남지 않게).
  const q = Math.floor(N / s);
  const r = N % s;
  const used = q + 1;
  const ans = R - used;
  return {
    text: seatText(s, R, N, '모두 앉고 나면 아무도 앉지 않은 빈 줄은 몇 줄이에요?'),
    figure: { kind: 'array', rows: R, cols: s },
    input: { kind: 'number', unit: '줄' },
    answer: ans,
    discriminators: uniq(
      [
        { value: R - q, category: '개념', kind: 'check', feedback: '마지막 줄에 앉은 사람도 있나요?' },
        { value: used, category: '읽기', kind: 'check', feedback: '빈 줄을 물었어요. 다시 볼까요?' },
        { value: s * R - N, category: '읽기', kind: 'check', feedback: '빈자리가 아니라 빈 줄을 물었어요.' },
      ],
      ans,
    ),
    hints: [`좌석은 한 줄에 ${s}자리씩 ${R}줄이고, ${N}명이 앞줄부터 앉아요. 아무도 앉지 않은 줄의 수를 물어요.`, '사람이 앉은 줄이 몇 줄인지 먼저 구해 볼까요? 덜 찬 줄도 앉은 줄이에요.', `${N} ÷ ${s} = ${q} … ${ieyo(r)}.`, '빈 줄: ☐줄'],
    blank: '빈 줄: ☐줄',
    blankAnswer: String(ans),
    explain: {
      why: [`${N} ÷ ${s} = ${q} … ${r}, 마지막 줄에도 ${r}명이 앉아서 앉은 줄은 ${used}줄이에요.`, `좌석은 ${R}줄이니 ${R} − ${used} = ${ans}줄이 비어요.`, `그래서 빈 줄은 ${ans}줄이에요.`],
      alt: [`그림에서 앞줄부터 ${s}명씩 칠해 보면 ${used}줄을 쓰고 ${ans}줄이 남아요.`, `두 풀이 모두 ${ans}줄이에요.`],
    },
  };
}

function t193Level3(s, R, N) {
  const q = Math.floor(N / s);
  const rows = q + 1;
  const can = rows <= R ? '예' : '아니요';
  const answer = { rows, can };
  const bl = blankOf(rows);
  return {
    text: seatText(s, R, N, '모두 앉으려면 몇 줄이 필요하고, 이 버스 위층에 모두 앉을 수 있어요?'),
    figure: { kind: 'array', rows: R, cols: s },
    input: { kind: 'compound', fields: [{ key: 'rows', label: '필요한 줄' }, { key: 'can', label: '모두 앉을 수 있나요?', options: ['예', '아니요'] }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'rows', value: q, category: '개념', kind: 'check', feedback: `${N}명이 모두 앉았나요?` },
        { key: 'can', value: can === '예' ? '아니요' : '예', category: '개념', kind: 'check', feedback: '버스의 줄 수를 다시 볼까요?' },
      ],
      answer,
    ),
    hints: [`좌석은 한 줄에 ${s}자리씩 ${R}줄이에요. ${N}명이 모두 앉는 데 필요한 줄 수와, 모두 앉을 수 있는지 물어요.`, `${s}명씩 묶어 볼까요? 남은 사람도 앉아야 해요.`, `${N} ÷ ${s} = ${q} … ${ieyo(N % s)}.`, `필요한 줄: ${bl.blank}줄`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '모두 앉을 수 있는지 골라요.',
    explain: {
      why: [`${N} ÷ ${s} = ${q} … ${N % s}, 남은 ${N % s}명도 앉아야 해서 ${rows}줄이 필요해요.`, `버스 위층은 ${R}줄이라 ${rows <= R ? '모두 앉을 수 있어요' : '모두 앉을 수 없어요'}.`, `그래서 ${rows}줄, ${jw(can, '이에요', '예요')}.`],
      alt: [`좌석은 ${s} × ${R} = ${s * R}자리예요. ${N}명과 견주어도 ${jw(can, '이에요', '예요')}.`, `두 풀이 모두 ${jw(can, '이에요', '예요')}.`],
    },
  };
}

const T19_3 = {
  id: 'T19-3',
  node: 'N19',
  title: '버스 좌석 줄',
  repr: '그림',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const [s, R, N] = draw(
      rng,
      () => {
        const ss = rng.int(3, 4);
        const RR = rng.int(6, 10);
        const NN = level === 3 ? ss * (RR - 1) + rng.int(1, 2 * ss - 1) : rng.int(ss * 2 + 1, ss * RR - 1);
        return [ss, RR, NN];
      },
      ([ss, RR, NN]) => NN % ss !== 0 && Math.floor(NN / ss) <= 9 && Math.floor(NN / ss) !== NN % ss && (level !== 2 || (RR - Math.floor(NN / ss) - 1 >= 1 && ![ss, RR, NN].includes(RR - Math.floor(NN / ss) - 1))),
      [4, 8, 27],
    );
    if (level === 1) return t193Level1(s, R, N);
    return level === 2 ? t193Level2(s, R, N) : t193Level3(s, R, N);
  },
};

// ── T19-4 나머지 처리 결정 표 (빈칸) — 1~3단계, 09 보강 후보 ──
function t194(N, s, level) {
  const q = Math.floor(N / s);
  const r = N % s;
  const rows = [['(가) 모두 앉는 데 필요한 줄', '□'], ['(나) 꽉 찬 묶음', '□']];
  const fields = [{ key: 'ga', label: '(가) 줄' }, { key: 'na', label: '(나) 묶음' }];
  const answer = { ga: q + 1, na: q };
  const text = [n(N), ' ÷ ', n(s), ' = ', n(q), ' … ', n(r), jo(r, '이에요', '예요'), '. 이 나눗셈으로 상황마다 답을 써요. (가) 단체 ', V(N), '명이 한 줄 ', V(s), '자리 좌석에 모두 앉는 데 필요한 줄 수 (나) 승차권 ', V(N), '장을 ', V(s), '장씩 묶은 꽉 찬 묶음 수'];
  const discs = [
    { key: 'ga', value: q, category: '개념', kind: 'check', feedback: '(가)는 모두 앉아야 해요. 다시 볼까요?' },
    { key: 'na', value: q + 1, category: '개념', kind: 'check', feedback: '(나)는 꽉 찬 묶음을 물었어요.' },
  ];
  if (level >= 2) {
    rows.push(['(다) (나)에서 남은 승차권', '□']);
    fields.push({ key: 'da', label: '(다) 남은 장' });
    answer.da = r;
    text.push(' (다) (나)에서 묶고 남은 승차권 수');
    discs.push({ key: 'da', value: s - r, category: '개념', kind: 'check', feedback: '(다)는 남은 승차권을 물었어요.' });
  }
  if (level >= 3) {
    rows.push(['(라) (가)에서 마지막 줄의 빈자리', '□']);
    fields.push({ key: 'ra', label: '(라) 빈자리' });
    answer.ra = s - r;
    text.push(' (라) (가)에서 마지막 줄의 빈자리 수');
    discs.push({ key: 'ra', value: r, category: '개념', kind: 'check', feedback: '(라)는 빈자리를 물었어요.' });
  }
  const bl = blankOf(q + 1);
  return {
    text,
    figure: { kind: 'table', columns: ['상황', '답'], rows },
    input: { kind: 'compound', fields },
    answer,
    discriminators: uniqK(discs, answer),
    hints: ['나눗셈 하나로 여러 상황의 답을 정하는 표예요. 상황마다 답을 물어요.', '남은 것을 한 번 더 셀지, 버릴지, 그대로 답할지 상황마다 생각해 볼까요?', `(나)는 남은 ${r}장으로 꽉 찬 묶음을 만들 수 없어요.`, `(가) 필요한 줄: ${bl.blank}줄`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '표의 칸을 모두 채워요.',
    explain: {
      why: [`(가)는 남은 ${r}명도 앉아야 하니 ${q} + 1 = ${q + 1}줄, (나)는 남은 것을 버려 ${q}묶음이에요.`, ...(level >= 2 ? [`(다)는 나머지 그대로 ${r}장${level >= 3 ? `, (라)는 ${s} − ${r} = ${s - r}자리예요` : '이에요'}.`] : []), `그래서 표의 답은 ${Object.values(answer).join(', ')}${jo(Object.values(answer).at(-1), '이에요', '예요')}.`],
      alt: ['"모두", "꽉 찬", "남은", "빈"이라는 말을 보면 나머지를 어떻게 할지 정할 수 있어요.', `두 풀이 모두 ${Object.values(answer).join(', ')}${jo(Object.values(answer).at(-1), '이에요', '예요')}.`],
    },
  };
}

const T19_4 = {
  id: 'T19-4',
  node: 'N19',
  title: '나머지 처리 표',
  repr: '빈칸',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const [N, s] = draw(rng, () => [rng.int(30, 99), rng.int(3, 9)], ([NN, ss]) => NN % ss !== 0 && Math.floor(NN / ss) >= 3 && Math.floor(NN / ss) <= 14 && 2 * (NN % ss) !== ss && (level < 2 || ![Math.floor(NN / ss), Math.floor(NN / ss) + 1].includes(NN % ss)) && (level < 3 || ![Math.floor(NN / ss), Math.floor(NN / ss) + 1, NN % ss].includes(ss - (NN % ss))), [53, 4]);
    return t194(N, s, level);
  },
};

// ── 급행 통과 진단 ──
const D1 = {
  id: 'N19-D1',
  node: 'N19',
  title: '급행 진단: 모두 앉으려면',
  repr: '문장',
  minLevel: 1,
  maxLevel: 1,
  diagnostic: true,
  generate() {
    return { ...t191Level1(53, 4), hints: [], blank: null };
  },
};
const D2 = {
  id: 'N19-D2',
  node: 'N19',
  title: '급행 진단: 꽉 찬 봉투와 확인',
  repr: '문장',
  minLevel: 2,
  maxLevel: 2,
  diagnostic: true,
  generate() {
    return { ...t191Level2(100, 8), hints: [], blank: null };
  },
};
const D3 = {
  id: 'N19-D3',
  node: 'N19',
  title: '급행 진단(예비): 첫차 포함 출발 횟수',
  repr: '문장',
  minLevel: 4,
  maxLevel: 4,
  diagnostic: true,
  generate() {
    return { ...t191Level4(15, 100), hints: [], blank: null };
  },
};

export default [T19_1, T19_2, T19_3, T19_4, D1, D2, D3];
