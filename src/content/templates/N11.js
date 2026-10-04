// N11 괴정 — 소수 한 자리의 크기 비교 [4수01-14]. 천장 5.
// 기준: docs/curriculum/08-line1-templates-11-20.md 11절, 09 끝 보강 후보(문장: 이웃 역 거리 순서). 피드백 꼬리표 kind: 'check' | 'nudge'(10 문서 2절).
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

const tenth = (k) => Number((k / 10).toFixed(1));
const near = (a, b) => Math.abs(a - b) < 1e-9;
const SIGNS = ['>', '=', '<'];
const signOf = (x, y) => (near(x, y) ? '=' : x > y ? '>' : '<');
/** 0.1이 몇 개인지(소수 한 자리 → 정수) */
const cnt = (d) => Math.round(d * 10);

/** 순서 정하기 채점 */
function orderGrade(answer, discs) {
  const key = (arr) => (Array.isArray(arr) ? arr.map(String).join('|') : '');
  return (r) => {
    if (!Array.isArray(r) || r.length === 0) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '답을 먼저 늘어놓아 볼까요?' };
    if (r.length < answer.length) return { correct: false, flags: { careless: true }, kind: 'check', feedback: '모두 눌러 볼까요?' };
    if (key(r) === key(answer)) return { correct: true };
    const d = discs.find((x) => key(x.value) === key(r));
    return d ? { correct: false, category: d.category, kind: d.kind ?? 'check', feedbackCheck: d.feedbackCheck, feedback: d.feedback } : { correct: false, category: null, kind: 'check', feedback: null };
  };
}

// ── T11-1 소수 비교 (수직선 → 기호) — 1~5단계 ──

/** 1단계: 수직선 위 두 거리(자연수 부분이 0과 1) */
function t111Level1(x, y, farIsDaeti) {
  const nearD = tenth(x); // 0.x
  const farD = tenth(10 + y); // 1.y (y < x)
  const farName = farIsDaeti ? '대티역' : '사하역';
  const nearName = farIsDaeti ? '사하역' : '대티역';
  const dD = farIsDaeti ? farD : nearD;
  const dS = farIsDaeti ? nearD : farD;
  return {
    text: ['괴정역에서 대티역까지 ', V(dD), 'km, 괴정역에서 사하역까지 ', V(dS), 'km라고 해 봐요. 더 먼 역은 어디예요?'],
    figure: { kind: 'numberline', from: 0, to: 2, ticks: 20, origin: '괴정역' },
    input: { kind: 'choice', options: ['대티역', '사하역'] },
    answer: farName,
    discriminators: [{ value: nearName, category: '개념', kind: 'nudge', feedbackCheck: '자연수 부분을 다시 볼까요?', feedback: `${eun(farD)} 1보다 크고 ${eun(nearD)} 1보다 작나요?` }],
    hints: [`대티역까지는 ${dD}km, 사하역까지는 ${dS}km예요. 더 먼 역을 물어요.`, '수직선에서 두 거리의 자리를 찾아볼까요? 오른쪽에 있을수록 멀어요.', `${eun(nearD)} 0과 1 사이, ${eun(farD)} 1과 2 사이에 있어요.`, `${eun(farD)} 0.1이 1☐개, ${eun(nearD)} 0.1이 ${x}개`],
    blank: '1☐',
    blankAnswer: String(y),
    blankThen: '어느 역이 더 멀어요?',
    explain: {
      why: [`${eun(farD)} 1과 0.${y}${jo(y, '이고', '고')}, ${eun(nearD)} 1보다 작아요.`, `자연수 부분이 큰 ${farD}${jo(farD, '이', '가')} 더 커요.`, `그래서 ${jw(farName, '이', '가')} 더 멀어요.`],
      alt: [`0.1이 몇 개인지 세어요. ${eun(farD)} ${10 + y}개, ${eun(nearD)} ${x}개라서 ${farD}${jo(farD, '이', '가')} 커요.`, `두 풀이 모두 ${jw(farName, '이에요', '예요')}.`],
    },
  };
}

/** 2단계: 자연수 부분이 같은 두 소수 */
function t111Level2(a, b, c) {
  const x = tenth(10 * a + b);
  const y = tenth(10 * a + c);
  const ans = signOf(x, y);
  const bl = blankAt(10 * a + c, 0);
  return {
    text: [n(x), ' ○ ', n(y), '에서 ○ 안에 알맞은 기호를 골라요.'],
    figure: { kind: 'numberline', from: a, to: a + 1, ticks: 10 },
    input: { kind: 'choice', options: SIGNS },
    answer: ans,
    discriminators: SIGNS.filter((s) => s !== ans).map((s) => (s === '=' ? { value: s, category: '개념', kind: 'check', feedback: '두 수가 같은 수일까요?' } : { value: s, category: '개념', kind: 'check', feedback: '소수점 아래 숫자를 다시 볼까요?' })),
    hints: [`${wa(x)} ${y}의 크기를 견주는 기호를 물어요.`, '자연수 부분이 같아요. 0.1이 몇 개인지 견주어 볼까요?', `${eun(x)} 0.1이 ${10 * a + b}개예요.`, `${eun(y)} 0.1이 ${bl.blank}개`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '알맞은 기호는 무엇이에요?',
    explain: {
      why: [`${wa(x)} ${eun(y)} 자연수 부분이 ${a}${roOnly(a)} 같아요.`, `소수점 아래 숫자는 ${wa(b)} ${ieyo(c)}.`, `그래서 ${x} ${ans} ${ieyo(y)}.`],
      alt: [`0.1이 ${10 * a + b}개와 ${10 * a + c}개를 견주어도 돼요.`, `어느 길로 해도 답은 ${ans}로 같아요.`],
    },
  };
}

/** 3단계: 0.1이 k개인 수와 소수 견주기 */
function t111Level3(k, m) {
  const num = tenth(k);
  const other = tenth(10 + m);
  const big = Math.max(num, other);
  const small = Math.min(num, other);
  const answer = { num, big };
  const discs = uniqK(
    [
      { key: 'num', value: k, category: '개념', kind: 'nudge', feedbackCheck: '소수점의 자리를 다시 볼까요?', feedback: `0.1이 10개면 1이에요. ${k}개면요?` },
      { key: 'num', value: k / 100, category: '개념', kind: 'nudge', feedbackCheck: '소수점의 자리를 다시 볼까요?', feedback: `0.1이 10개면 1이에요. ${k}개면요?` },
      { key: 'big', value: small, category: '개념', kind: 'check', feedback: '두 수를 다시 견주어 볼까요?' },
      { key: 'big', value: k, category: '개념', kind: 'check', feedback: '더 큰 수를 소수로 써 볼까요?' },
    ],
    answer,
  );
  return {
    text: [n(0.1), '이 ', n(k), '개인 수와 ', n(other), ' 중 더 큰 수는 얼마예요?'],
    figure: { kind: 'numberline', from: 1, to: 2, ticks: 10 },
    input: { kind: 'compound', fields: [{ key: 'num', label: `0.1이 ${k}개인 수`, kind: 'decimal' }, { key: 'big', label: '더 큰 수', kind: 'decimal' }] },
    answer,
    discriminators: discs,
    hints: [`0.1이 ${k}개인 수와 ${other} 중 더 큰 수를 물어요.`, '두 수를 모두 0.1이 몇 개인지로 나타내 볼까요?', '0.1이 10개면 1이에요.', `${eun(other)} 0.1이 1☐개`],
    blank: '1☐',
    blankAnswer: String(m),
    blankThen: '더 큰 수는 얼마예요?',
    explain: {
      why: [`0.1이 ${k}개인 수는 ${ieyo(num)}.`, `${wa(num)} ${eun(other)} 자연수 부분이 같고, 소수점 아래 숫자는 ${wa(k - 10)} ${ieyo(m)}.`, `그래서 더 큰 수는 ${ieyo(big)}.`],
      alt: [`${eun(other)} 0.1이 ${10 + m}개예요. ${wa(k)} ${10 + m}${jo(10 + m, '을', '를')} 견주어도 돼요.`, `어느 길로 해도 답은 ${ro(big)} 같아요.`],
    },
  };
}

/** 4단계: □.a < B.c 의 □ 범위(경계) */
function t111Level4(a, B, c) {
  const top = c > a ? B : B - 1;
  const answer = Array.from({ length: top + 1 }, (_, i) => i);
  const options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const bc = tenth(10 * B + c);
  const discs = [];
  if (c < a) discs.push({ value: [...answer, B], category: '개념', kind: 'check', feedback: `${B}.${a}${jo(a, '은', '는')} ${bc}보다 작을까요?` });
  else {
    discs.push({ value: answer.slice(0, -1), category: '개념', kind: 'nudge', feedbackCheck: '빠진 것이 없나요?', feedback: `${B}.${a}${jo(a, '과', '와')} ${bc}도 견주어 봤나요?` });
    discs.push({ value: [...answer, B + 1], category: '개념', kind: 'check', feedback: `${B + 1}.${a}${jo(a, '은', '는')} ${bc}보다 작을까요?` });
  }
  if (top >= 1) discs.push({ value: answer.slice(1), category: '개념', kind: 'nudge', feedbackCheck: '빠진 것이 없나요?', feedback: '□에 0도 넣어 봤나요?' });
  return {
    text: [unknown(`□.${a}`), jo(a, '이', '가'), ' ', n(bc), '보다 작아요. □에 들어갈 수 있는 수를 모두 골라요.'],
    figure: null,
    input: { kind: 'multi', options },
    answer,
    discriminators: uniq(discs, answer),
    grade: multiGrade(answer, discs),
    hints: [`□.${a}${jo(a, '이', '가')} ${bc}보다 작아야 해요. 들어갈 수 있는 □를 모두 물어요.`, '□에 0부터 차례로 넣어 볼까요? 자연수 부분이 같아질 때를 조심해요.', `□가 ${B}보다 작으면 자연수 부분이 작아서 늘 ${bc}보다 작아요.`, '0부터 ☐까지'],
    blank: '0부터 ☐까지',
    blankAnswer: String(top),
    explain: {
      why: [`□가 ${B}보다 작으면 자연수 부분이 작아서 ${bc}보다 작아요.`, c > a ? `□가 ${B}${jo(B, '이면', '면')} ${B}.${a}${jo(a, '과', '와')} ${bc}의 소수점 아래 숫자를 견주어요. ${a}${jo(a, '이', '가')} ${c}보다 작아서 돼요.` : `□가 ${B}${jo(B, '이면', '면')} ${B}.${a}${jo(a, '은', '는')} ${bc}보다 커서 안 돼요.`, `그래서 □는 0부터 ${top}까지예요.`],
      alt: [`0.1의 개수로 바꿔요. ${eun(bc)} 0.1이 ${10 * B + c}개예요.`, `어느 길로 해도 답은 0부터 ${top}까지로 같아요.`],
    },
  };
}

/** 5단계(도전): 숫자 카드로 □□.□, 두 번째로 큰 수 */
function t111Level5(cards) {
  const d = [...cards].sort((x, y) => y - x);
  const largest = Number(`${d[0]}${d[1]}.${d[2]}`);
  const second = Number(`${d[0]}${d[2]}.${d[1]}`);
  const swapped = Number(`${d[1]}${d[0]}.${d[2]}`);
  const discs = uniq(
    [
      { value: largest, category: '읽기', kind: 'check', feedback: '가장 큰 수 다음을 물었어요. 다시 볼까요?' },
      { value: swapped, category: '개념', kind: 'check', feedback: '십의 자리를 다시 볼까요?' },
    ],
    second,
  );
  return {
    text: ['숫자 카드 ', n(cards[0]), ', ', n(cards[1]), ', ', n(cards[2]), jo(cards[2], '을', '를'), ' 한 번씩 써서 □□.□ 꼴의 소수를 만들어요. 두 번째로 큰 수는 얼마예요?'],
    figure: { kind: 'cards', cards },
    challenge: true,
    input: { kind: 'decimal' },
    answer: second,
    discriminators: discs,
    hints: ['숫자 카드 세 장으로 □□.□ 꼴의 소수를 만들어요. 두 번째로 큰 수를 물어요.', '가장 큰 수부터 만들어 볼까요? 큰 숫자를 높은 자리에 놓아요.', `가장 큰 수는 ${ieyo(largest)}.`, '두 번째로 큰 수의 일의 자리 숫자: ☐'],
    blank: '일의 자리 숫자: ☐',
    blankAnswer: String(d[2]),
    blankThen: '두 번째로 큰 수를 써요.',
    explain: {
      why: [`가장 큰 수는 큰 숫자부터 놓은 ${ieyo(largest)}.`, `십의 자리 ${d[0]}${jo(d[0], '은', '는')} 그대로 두고, 남은 두 숫자의 자리를 바꾸면 그다음으로 커요.`, `그래서 두 번째로 큰 수는 ${ieyo(second)}.`],
      alt: [`만들 수 있는 수를 큰 것부터 적어 봐요. ${largest}, ${second}, ${swapped}, …`, `어느 길로 해도 답은 ${ro(second)} 같아요.`],
    },
  };
}

const T11_1 = {
  id: 'T11-1',
  node: 'N11',
  title: '소수 비교',
  repr: '그림',
  minLevel: 1,
  maxLevel: 5,
  generate(rng, level) {
    if (level === 1) {
      const [x, y] = draw(rng, () => [rng.int(4, 9), rng.int(1, 8)], ([p, q]) => q < p, [9, 3]);
      return t111Level1(x, y, rng.next() < 0.5);
    }
    if (level === 2) {
      const [a, b, c] = draw(rng, () => [rng.int(1, 8), rng.int(1, 9), rng.int(1, 9)], ([, p, q]) => p !== q, [2, 4, 7]);
      return t111Level2(a, b, c);
    }
    if (level === 3) {
      const [k, m] = draw(rng, () => [rng.int(11, 19), rng.int(1, 9)], ([p, q]) => p - 10 !== q, [15, 3]);
      return t111Level3(k, m);
    }
    if (level === 4) {
      const [a, B, c] = draw(rng, () => [rng.int(1, 9), rng.int(2, 6), rng.int(1, 9)], ([p, , q]) => p !== q, [4, 3, 1]);
      return t111Level4(a, B, c);
    }
    return t111Level5(rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3));
  },
};

// ── T11-2 기호 넣기 (식) — 1~3단계 ──
/** x ○ y. kind: 1 = 자연수 부분이 다름(소수점 아래 숫자는 거꾸로), 2 = 자연수 부분이 같음, 3 = 자연수와 소수 */
function t112(x, y, kind) {
  const ans = signOf(x, y);
  const wrongFb = kind === 2 ? '소수점 아래 숫자를 다시 볼까요?' : '자연수 부분을 다시 볼까요?';
  const cy = cnt(y);
  const bl = blankAt(cy, 0);
  const isInt = (v) => Number.isInteger(v);
  return {
    text: [n(x), ' ○ ', n(y), '에서 ○ 안에 알맞은 기호를 골라요.'],
    figure: null,
    input: { kind: 'choice', options: SIGNS },
    answer: ans,
    discriminators: SIGNS.filter((s) => s !== ans).map((s) => (s === '=' ? { value: s, category: '개념', kind: 'check', feedback: '두 수가 같은 수일까요?' } : { value: s, category: '개념', kind: 'check', feedback: wrongFb })),
    hints: [
      `${x} ○ ${y}의 ○에 들어갈 기호를 물어요.`,
      '두 수가 0.1이 몇 개인지 세어 볼까요? 개수가 많은 쪽이 커요.',
      `${eun(x)} 0.1이 ${cnt(x)}개예요.`,
      `${eun(y)} 0.1이 ${bl.blank}개`,
    ],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '알맞은 기호는 무엇이에요?',
    explain: {
      why: [
        Math.floor(x) === Math.floor(y) ? `자연수 부분이 같아서 소수점 아래 숫자를 견주어요.` : `자연수 부분을 먼저 견주어요. ${eun(Math.floor(x))} ${Math.floor(y)}보다 ${x > y ? '커요' : '작아요'}.`,
        `0.1의 개수로 보면 ${cnt(x)}개와 ${cy}개예요.`,
        `그래서 ${x} ${ans} ${ieyo(y)}.`,
      ],
      alt: [isInt(x) || isInt(y) ? `${isInt(x) ? x : y}${jo(isInt(x) ? x : y, '은', '는')} ${isInt(x) ? x : y}.0과 같은 크기예요.` : '수직선에 두 수를 찍으면 오른쪽에 있는 수가 커요.', `어느 길로 해도 답은 ${ans}로 같아요.`],
    },
  };
}

const T11_2 = {
  id: 'T11-2',
  node: 'N11',
  title: '기호 넣기',
  repr: '식',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const swap = rng.next() < 0.5;
    let x;
    let y;
    if (level === 1) {
      // 큰 수의 소수점 아래 숫자가 더 작게(앞자리만 보면 거꾸로 보이는 함정)
      const [a, p, q] = draw(rng, () => [rng.int(1, 8), rng.int(1, 8), rng.int(2, 9)], ([, pp, qq]) => pp < qq, [2, 3, 8]);
      x = tenth(10 * (a + 1) + p);
      y = tenth(10 * a + q);
    } else if (level === 2) {
      const [a, p, q] = draw(rng, () => [rng.int(1, 9), rng.int(1, 9), rng.int(1, 9)], ([, pp, qq]) => pp !== qq, [4, 6, 2]);
      x = tenth(10 * a + p);
      y = tenth(10 * a + q);
    } else {
      // 자연수 k와 (k−1).d 또는 k.d
      const k = rng.int(2, 9);
      const d = rng.int(1, 9);
      x = k;
      y = rng.next() < 0.5 ? tenth(10 * (k - 1) + d) : tenth(10 * k + d);
    }
    return swap ? t112(y, x, level) : t112(x, y, level);
  },
};

// ── T11-3 이웃 역 거리 순서 (문장) — 1~3단계, 09 보강 후보 ──
const PLACES = ['사하역', '대티역', '도서관', '공원'];

function t113(items, level) {
  // items: [{ name, d, asCount? }]
  const answer = [...items].sort((p, q) => p.d - q.d).map((p) => p.name);
  const rev = [...answer].reverse();
  const byDigit = [...items].sort((p, q) => (cnt(p.d) % 10) - (cnt(q.d) % 10) || p.d - q.d).map((p) => p.name);
  const discs = [{ value: rev, category: '읽기', kind: 'check', feedback: '가까운 곳부터 물었어요. 맨 앞은 어디예요?' }];
  discs.push({ value: byDigit, category: '개념', kind: 'nudge', feedbackCheck: '거리를 하나씩 다시 읽어 볼까요?', feedback: '자연수 부분부터 견주어 볼까요?' });
  const cItem = items.find((p) => p.asCount);
  if (cItem) {
    const asBig = [...items].sort((p, q) => (p.asCount ? 99 : p.d) - (q.asCount ? 99 : q.d)).map((p) => p.name);
    discs.push({ value: asBig, category: '개념', kind: 'check', feedback: `0.1km가 ${cnt(cItem.d)}개는 몇 km일까요?` });
  }
  const clean = uniq(discs, answer);
  const text = ['괴정역에서 '];
  items.forEach((p, i) => {
    text.push(i === 0 ? `${p.name}까지 ` : `, ${p.name}까지 `);
    if (p.asCount) text.push(n(0.1), 'km가 ', V(cnt(p.d)), '개');
    else text.push(V(p.d), 'km');
  });
  text.push('라고 해 봐요. 괴정역에서 가까운 곳부터 차례로 눌러요.');
  const mid = [...items].sort((p, q) => p.d - q.d)[1];
  const bl = blankAt(cnt(mid.d), 0);
  const listTxt = items.map((p) => (p.asCount ? `${p.name} 0.1km가 ${cnt(p.d)}개` : `${p.name} ${p.d}km`)).join(', ');
  return {
    text,
    figure: null,
    input: { kind: 'order', items: items.map((p) => p.name) },
    answer,
    discriminators: clean,
    grade: orderGrade(answer, clean),
    hints: [`괴정역에서 ${listTxt}예요. 가까운 곳부터 늘어놓는 순서를 물어요.`, '거리를 모두 0.1km가 몇 개인지로 바꿔 볼까요? 개수가 적을수록 가까워요.', `가장 가까운 곳은 ${jw(answer[0], '이에요', '예요')}.`, `${mid.name}까지 0.1km가 ${bl.blank}개`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '가까운 곳부터 차례로 눌러요.',
    explain: {
      why: [`0.1km의 개수로 보면 ${items.map((p) => `${p.name} ${cnt(p.d)}개`).join(', ')}예요.`, '개수가 적을수록 가까워요.', `그래서 ${answer.join(', ')} 순서예요.`],
      alt: ['자연수 부분을 먼저 견주고, 같으면 소수점 아래 숫자를 견주어도 돼요.', `어느 길로 해도 답은 ${answer.join(', ')} 순서로 같아요.`],
    },
  };
}

const T11_3 = {
  id: 'T11-3',
  node: 'N11',
  title: '이웃 역 거리 순서',
  repr: '문장',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const names = rng.shuffle(PLACES);
    if (level === 1) {
      // 자연수 부분이 0, 1, 2로 모두 다르고, 소수점 아래 숫자는 거꾸로
      const ds = draw(rng, () => [rng.int(6, 9), rng.int(2, 5), rng.int(1, 4)], ([p, q, r]) => p > q && q > r, [8, 4, 1]);
      const vals = [tenth(ds[0]), tenth(10 + ds[1]), tenth(20 + ds[2])];
      const order = rng.shuffle([0, 1, 2]);
      return t113(order.map((i, j) => ({ name: names[j], d: vals[i] })), 1);
    }
    if (level === 2) {
      // 두 곳은 자연수 부분이 같다
      const [p, q, r] = draw(rng, () => [rng.int(1, 9), rng.int(1, 9), rng.int(5, 9)], ([pp, qq, rr]) => pp !== qq && rr > Math.min(pp, qq), [2, 7, 8]);
      const vals = rng.shuffle([tenth(10 + p), tenth(10 + q), tenth(r)]);
      return t113(vals.map((d, j) => ({ name: names[j], d })), 2);
    }
    // 네 곳, 하나는 "0.1km가 □개"
    const counts = draw(rng, () => rng.shuffle([rng.int(5, 9), rng.int(11, 14), rng.int(15, 19), rng.int(21, 24)]), (cs) => cs.every((c) => c % 10 !== 0), [7, 13, 16, 21]);
    const ci = rng.int(0, 3);
    const items = counts.map((c, j) => ({ name: names[j], d: tenth(c), asCount: j === ci }));
    // 개수로 나온 곳이 이미 가장 멀면 함정이 안 되므로, 가장 멀지 않게 바꾼다
    const maxJ = counts.indexOf(Math.max(...counts));
    if (maxJ === ci) {
      items[ci].asCount = false;
      items[(ci + 1) % 4].asCount = true;
    }
    return t113(items, 3);
  },
};

// ── 급행 통과 진단 ──
const D1 = {
  id: 'N11-D1',
  node: 'N11',
  title: '급행 진단: 1.3과 0.9',
  repr: '식',
  minLevel: 1,
  maxLevel: 1,
  diagnostic: true,
  generate() {
    return { ...t112(1.3, 0.9, 1), hints: [], blank: null };
  },
};
const D2 = {
  id: 'N11-D2',
  node: 'N11',
  title: '급행 진단: □.4 < 3.1',
  repr: '그림',
  minLevel: 4,
  maxLevel: 4,
  diagnostic: true,
  generate() {
    return { ...t111Level4(4, 3, 1), hints: [], blank: null };
  },
};
const D3 = {
  id: 'N11-D3',
  node: 'N11',
  title: '급행 진단(예비): 0.1이 15개인 수',
  repr: '그림',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...t111Level3(15, 3), hints: [], blank: null };
  },
};

export default [T11_1, T11_2, T11_3, D1, D2, D3];
