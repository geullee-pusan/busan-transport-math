// N04 신장림 — 덧셈·뺄셈 어림셈과 검산, 세 수의 계산 [4수01-08]. 천장 7.
// 기준: docs/curriculum/07-line1-templates.md v2 4절.
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


const hund = (x) => Math.floor(x / 100);
const r10 = (x) => Math.round(x / 10) * 10;
const r100 = (x) => Math.round(x / 100) * 100;
const f10 = (x) => Math.floor(x / 10) * 10;
const c10 = (x) => Math.ceil(x / 10) * 10;
const HOW = '어떻게 어림했어요?';

/** 앞자리만 더해도 맞는 숫자를 피한 두 수(SPEC 고르기 찍기 방지) */
function goodPair([a, b]) {
  const c = r100(a + b);
  return a !== b && a % 10 !== 0 && b % 10 !== 0 && r100(r10(a) + r10(b)) === c && Math.abs(a + b - c) <= 30 && (hund(a) + hund(b)) * 100 === c - 100;
}

/** T4-1 1단계: 하루에 탄 사람은 대충 몇백 명? */
function t41Level1(a, b) {
  const c = r100(a + b);
  const ra = r10(a);
  const rb = r10(b);
  const S = ra + rb;
  const front = (hund(a) + hund(b)) * 100;
  const bl = blankAt(S, 2);
  return {
    text: ['신장림역에서 오전에 ', V(a), '명, 오후에 ', V(b), '명이 탔어요. 하루에 탄 사람은 대충 몇백 명쯤일까요?'],
    figure: null,
    estimateFirst: true,
    estimate: { answer: c, min: c - 100, max: c + 100 },
    input: { kind: 'choice', options: [String(c - 100), String(c), String(c + 100)], howLabel: HOW, unit: '명' },
    answer: String(c),
    discriminators: [{ value: String(front), category: '개념', feedback: `${wa(a)} ${b}의 뒷자리도 봤나요?` }],
    hints: [`오전에 ${a}명, 오후에 ${b}명이 탔어요. 하루 동안 탄 사람이 대충 몇백 명인지 물어요.`, `${eun(a)} 약 몇백 몇십일까요? 두 수를 몇백 몇십으로 바꿔서 어림해 봐요.`, `${eun(a)} 약 ${ra}, ${eun(b)} 약 ${ieyo(rb)}.`, `${ra} + ${rb} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '대충 몇백 명쯤일까요?',
    explain: {
      why: [`${eun(a)} 약 ${ra}, ${eun(b)} 약 ${ieyo(rb)}.`, `${ra} + ${rb} = ${S}이라 대충 ${c}쯤이에요.`.replace(`${S}이라`, `${S}${jo(S, '이라', '라')}`), `앞자리만 더하면 ${front}이 되어 너무 작아요.`.replace(`${front}이`, `${front}${jo(front, '이', '가')}`), `그래서 하루에 탄 사람은 대충 ${c}명쯤이에요.`],
      alt: [`정확히 계산하면 ${a} + ${b} = ${ieyo(a + b)}.`, `${a + b}도 ${c}에 가장 가까워요.`, `어느 길로 해도 답은 ${ro(c)} 같아요.`],
    },
  };
}

/** T4-1 2단계: 친구의 답을 어림으로 판단 */
function t41Level2(a, b, w) {
  const sum = a + b;
  const c = r100(sum);
  const ra = r10(a);
  const rb = r10(b);
  const S = ra + rb;
  const right = w === sum;
  const ans = right ? '맞아요' : '틀려요';
  const bl = blankAt(S, 2);
  return {
    text: ['친구가 ', n(a), ' + ', n(b), ' = ', n(w), jo(w, '이라고', '라고'), ' 했어요. 대충 몇백쯤인지 어림해서 맞는지 판단해요.'],
    figure: null,
    estimateFirst: true,
    estimate: { answer: c, min: c - 100, max: c + 100 },
    input: { kind: 'choice', options: ['맞아요', '틀려요'], howLabel: HOW },
    answer: ans,
    discriminators: [{ value: right ? '틀려요' : '맞아요', category: '개념', feedback: right ? '어림한 수와 가까운가요?' : '어림한 수와 몇백이나 차이 나요. 맞을까요?' }],
    hints: [`친구가 계산한 답은 ${ieyo(w)}. 그 답이 맞는지 대충 몇백쯤인지 어림해서 판단해요.`, `${wa(a)} ${eul(b)} 각각 몇백 몇십으로 바꿔 봐요. 어림한 수와 친구의 답을 견주어 봐요.`, `${eun(a)} 약 ${ra}, ${eun(b)} 약 ${ieyo(rb)}.`, `${ra} + ${rb} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '친구의 답이 맞아요, 틀려요?',
    explain: {
      why: right
        ? [`${eun(a)} 약 ${ra}, ${eun(b)} 약 ${ieyo(rb)}.`, `어림한 합은 ${S}, 대충 ${c}쯤이에요.`, `친구의 답 ${eun(w)} 어림한 수와 가까워요.`, '그래서 친구의 답은 맞아요.']
        : [`${eun(a)} 약 ${ra}, ${eun(b)} 약 ${ieyo(rb)}.`, `어림한 합은 ${S}, 대충 ${c}쯤이에요.`, `친구의 답 ${eun(w)} 어림한 수와 몇백이나 차이 나요.`, '그래서 친구의 답은 틀려요.'],
      alt: [`정확히 계산하면 ${a} + ${b} = ${ieyo(sum)}.`, '어림으로 판단한 것과 계산한 답이 같아요.', `어느 길로 해도 답은 '${ans}'로 같아요.`],
    },
  };
}

/** T4-1 3단계: 세 단체가 모두 탈 수 있을까? */
function t41Level3(C, x, y, z) {
  const sum = x + y + z;
  const can = sum <= C;
  const ans = can ? '탈 수 있어요' : '탈 수 없어요';
  const est = can ? [c10(x), c10(y), c10(z)] : [f10(x), f10(y), f10(z)];
  const E = est[0] + est[1] + est[2];
  const word = can ? '크게' : '작게';
  const bl = blankAt(E, 1);
  return {
    text: ['이번 열차에는 ', V(C), '명이 더 탈 수 있어요. 신장림역 승강장에 가 단체 ', V(x), '명, 나 단체 ', V(y), '명, 다 단체 ', V(z), '명이 기다려요. 세 단체가 모두 탈 수 있을까요?'],
    figure: null,
    estimateFirst: true,
    estimate: { answer: sum, min: sum - 50, max: sum + 50 },
    input: { kind: 'choice', options: ['탈 수 있어요', '탈 수 없어요'], howLabel: HOW },
    answer: ans,
    discriminators: [{ value: can ? '탈 수 없어요' : '탈 수 있어요', category: '개념', feedback: can ? '너무 크게 어림하지 않았나요?' : '너무 작게 어림하지 않았나요?' }],
    hints: [
      `이번 열차에는 ${C}명이 더 탈 수 있어요. 기다리는 단체는 세 개예요. 모두 탈 수 있는지 물어요.`,
      `${eun(x)} 약 몇십일까요? 세 단체를 몇십으로 바꿔서 ${C}보다 많은지 적은지 봐요.`,
      `${word} 어림하면 ${est[0]}, ${est[1]}, ${ieyo(est[2])}.`,
      `${est[0]} + ${est[1]} + ${est[2]} = ${bl.blank}`,
    ],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: `${C}보다 많아요, 적어요?`,
    explain: {
      why: can
        ? [`크게 어림해도 ${est[0]} + ${est[1]} + ${est[2]} = ${E}명이에요.`, `진짜 인원은 이보다 적으니 ${C}명을 넘지 않아요.`, '크게 어림하면 계산 없이 판단이 끝나요.', '탈 수 있는지는 크게, 못 타는지는 작게 어림해요.', '그래서 세 단체가 모두 탈 수 있어요.']
        : [`작게 어림해도 ${est[0]} + ${est[1]} + ${est[2]} = ${E}명이에요.`, `진짜 인원은 이보다 많으니 ${C}명을 넘어요.`, '작게 어림하면 계산 없이 판단이 끝나요.', '탈 수 있는지는 크게, 못 타는지는 작게 어림해요.', '그래서 세 단체가 모두 탈 수는 없어요.'],
      alt: [
        `정확히 더하면 ${x} + ${y} + ${z} = ${sum}명이에요.`,
        can ? `${C}명보다 ${C - sum}명 적어요.` : `${C}명보다 ${sum - C}명 많아요.`,
        '어림으로 판단한 것과 계산한 답이 같아요.',
        `어느 길로 해도 답은 '${ans}'로 같아요.`,
      ],
    },
  };
}

/** T4-1 어림으로 판단 (문장) — 1~3단계 */
const T4_1 = {
  id: 'T4-1',
  node: 'N04',
  title: '어림으로 판단',
  repr: '문장',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level <= 2) {
      const [a, b] = draw(rng, () => [rng.int(410, 690), rng.int(210, 490)], goodPair, [548, 379]);
      if (level === 1) return t41Level1(a, b);
      const sum = a + b;
      const w = rng.next() < 0.25 ? sum : rng.pick([sum + 900, sum + 300, sum - 300]);
      return t41Level2(a, b, w);
    }
    const can = rng.next() < 0.34;
    const [C, x, y, z] = draw(
      rng,
      () => [rng.int(25, 34) * 10, rng.int(81, 135), rng.int(81, 135), rng.int(81, 135)],
      ([c, p, q, r]) => {
        if (new Set([p, q, r]).size < 3 || [p, q, r].some((v) => v % 10 === 0)) return false;
        if (can) return c10(p) + c10(q) + c10(r) <= c && p + q + r <= c - 10;
        return f10(p) + f10(q) + f10(r) > c && p + q + r - c >= 15;
      },
      can ? [330, 92, 103, 87] : [280, 118, 107, 86],
    );
    return t41Level3(C, x, y, z);
  },
};

// ── T4-2 타고 내리는 승객 ──
const TRACE = '역마다 열차 안 사람 수를 표에 차례로 적어 볼까요?';

/** 1단계: 탐만 두 번 */
function t42Level1(s, p, q) {
  const ans = s + p + q;
  const mid = s + p;
  const bl = blankAt(ans, 1);
  return {
    text: ['열차에 ', V(s), '명이 타 있었어요. 신장림역에서 ', V(p), '명이 타고, 장림역에서 ', V(q), '명이 더 탔어요. 지금 열차에 있는 사람은 몇 명이에요?'],
    figure: { kind: 'stations', stations: ['신장림', '장림'] },
    input: { kind: 'number', unit: '명' },
    answer: ans,
    discriminators: uniq(
      [
        { value: mid, category: '식', feedback: '장림역 뒤까지 따라갔나요?' },
        { value: s + q, category: '읽기', feedback: '신장림역에서 탄 사람은요?' },
        { value: ans - 10, category: '계산', feedback: '받아올린 1을 더했나요?' },
      ],
      ans,
    ),
    hints: [`처음에 ${s}명이 있었어요. 신장림역에서 ${p}명, 장림역에서 ${q}명이 탔어요. 지금 열차에 있는 사람 수를 물어요.`, TRACE, `신장림역을 지난 뒤에는 ${mid}명이에요.`, `${mid} + ${q} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`신장림역에서 ${p}명이 타서 ${s} + ${p} = ${mid}명이에요.`, `장림역에서 ${q}명이 더 타서 ${mid} + ${q} = ${ans}명이에요.`, `그래서 지금 ${ans}명이 있어요.`],
      alt: [`두 역에서 탄 사람은 ${p} + ${q} = ${p + q}명이에요.`, `${s} + ${p + q} = ${ans}명이에요.`, `어느 길로 해도 답은 ${ro(ans)} 같아요.`],
    },
  };
}

/** 2단계: V1(탐 → 내림) 또는 V2(내림 → 탐) */
function t42Level2(s, p, q, v2) {
  const ans = s + p - q;
  const mid = v2 ? s - q : s + p;
  const bl = blankAt(ans, 1);
  const story = v2
    ? ['열차에 ', V(s), '명이 타 있었어요. 신장림역에서 ', V(q), '명이 내리고, 장림역에서 ', V(p), '명이 탔어요. 지금 열차에 있는 사람은 몇 명이에요?']
    : ['열차에 ', V(s), '명이 타 있었어요. 신장림역에서 ', V(p), '명이 타고, 장림역에서 ', V(q), '명이 내렸어요. 지금 열차에 있는 사람은 몇 명이에요?'];
  const discs = v2
    ? [
        { value: s + p + q, category: '식', feedback: '내린 사람도 열차에 남았나요?' },
        { value: s - q, category: '식', feedback: '장림역 뒤까지 따라갔나요?' },
        { value: s + p, category: '읽기', feedback: '신장림역에서 내린 사람은요?' },
      ]
    : [
        { value: s + p + q, category: '식', feedback: '내린 사람도 열차에 남았나요?' },
        { value: s + p, category: '식', feedback: '장림역 뒤까지 따라갔나요?' },
        { value: s - q, category: '읽기', feedback: '신장림역에서 탄 사람은요?' },
      ];
  return {
    text: story,
    figure: { kind: 'stations', stations: ['신장림', '장림'] },
    input: { kind: 'number', unit: '명' },
    answer: ans,
    discriminators: uniq(discs, ans),
    hints: [
      v2 ? `처음에 ${s}명이 있었어요. 신장림역에서 ${q}명이 내리고, 장림역에서 ${p}명이 탔어요. 지금 열차에 있는 사람 수를 물어요.` : `처음에 ${s}명이 있었어요. 신장림역에서 ${p}명이 타고, 장림역에서 ${q}명이 내렸어요. 지금 열차에 있는 사람 수를 물어요.`,
      TRACE,
      `신장림역을 지난 뒤에는 ${mid}명이에요.`,
      v2 ? `${mid} + ${p} = ${bl.blank}` : `${mid} − ${q} = ${bl.blank}`,
    ],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: v2
        ? [`신장림역에서 ${q}명이 내려 ${s} − ${q} = ${mid}명이에요.`, `장림역에서 ${p}명이 타서 ${mid} + ${p} = ${ans}명이에요.`, `그래서 지금 ${ans}명이 있어요.`]
        : [`신장림역에서 ${p}명이 타서 ${s} + ${p} = ${mid}명이에요.`, `장림역에서 ${q}명이 내려 ${mid} − ${q} = ${ans}명이에요.`, `그래서 지금 ${ans}명이 있어요.`],
      alt:
        p > q
          ? [`탄 사람이 내린 사람보다 ${p} − ${q} = ${p - q}명 많아요.`, `처음보다 ${p - q}명 늘었으니 ${s} + ${p - q} = ${ans}명이에요.`, `어느 길로 해도 답은 ${ro(ans)} 같아요.`]
          : [`내린 사람이 탄 사람보다 ${q} − ${p} = ${q - p}명 많아요.`, `처음보다 ${q - p}명 줄었으니 ${s} − ${q - p} = ${ans}명이에요.`, `어느 길로 해도 답은 ${ro(ans)} 같아요.`],
    },
  };
}

/** 3단계: V4 내리기(타기) 전에는 몇 명? */
function t42Level3(s, p, q, offFirst) {
  const ans = offFirst ? s - q : s + p;
  const end = s + p - q;
  const bl = blankAt(ans, 1);
  const before = offFirst ? '타기' : '내리기';
  return {
    text: offFirst
      ? ['열차에 ', V(s), '명이 타 있었어요. 신장림역에서 ', V(q), '명이 내렸어요. 장림역에서는 ', V(p), '명이 타요. 장림역에서 타기 전에는 열차에 몇 명이 있어요?']
      : ['열차에 ', V(s), '명이 타 있었어요. 신장림역에서 ', V(p), '명이 탔어요. 장림역에서는 ', V(q), '명이 내려요. 장림역에서 내리기 전에는 열차에 몇 명이 있어요?'],
    figure: { kind: 'stations', stations: ['신장림', '장림'] },
    input: { kind: 'number', unit: '명' },
    answer: ans,
    discriminators: uniq(
      [
        { value: end, category: '읽기', feedback: `${before} 전을 물었어요. 어디서 멈출까요?` },
        { value: s + p + q, category: '식', feedback: '내린 사람도 열차에 남았나요?' },
        { value: offFirst ? s + q : s - p, category: '식', feedback: offFirst ? '내린 사람이 열차에 남았나요?' : '탄 사람은 열차에서 빠질까요?' },
      ],
      ans,
    ),
    hints: [
      offFirst ? `처음에 ${s}명이 있었고, 신장림역에서 ${q}명이 내렸어요. 장림역에서 ${p}명이 타기 전의 사람 수를 물어요.` : `처음에 ${s}명이 있었고, 신장림역에서 ${p}명이 탔어요. 장림역에서 ${q}명이 내리기 전의 사람 수를 물어요.`,
      `${TRACE} 어느 칸에서 멈출지 봐요.`,
      offFirst ? `신장림역에서 내리기 전에는 ${s}명이에요.` : `신장림역에서 타기 전에는 ${s}명이에요.`,
      offFirst ? `${s} − ${q} = ${bl.blank}` : `${s} + ${p} = ${bl.blank}`,
    ],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [
        offFirst ? `신장림역에서 ${q}명이 내려 ${s} − ${q} = ${ans}명이 됐어요.` : `신장림역에서 ${p}명이 타서 ${s} + ${p} = ${ans}명이 됐어요.`,
        `장림역에서 ${before} 전이니 여기서 멈춰요.`,
        `그래서 ${ans}명이에요.`,
      ],
      alt: [`끝까지 가면 ${end}명이에요.`, offFirst ? `장림역에서 탄 ${p}명을 되돌리면 ${end} − ${p} = ${ans}명이에요.` : `장림역에서 내린 ${q}명을 되돌리면 ${end} + ${q} = ${ans}명이에요.`, `어느 길로 해도 답은 ${ro(ans)} 같아요.`],
    },
  };
}

/** 4단계: V3 처음 몇 명? */
function t42Level4(s, p, q, offFirst) {
  const e = s + p - q;
  const bl = blankAt(s, 1);
  return {
    text: offFirst
      ? ['신장림역에서 ', V(q), '명이 내리고, 장림역에서 ', V(p), '명이 탔더니 지금 열차에 ', V(e), '명이 있어요. 처음에는 몇 명이 타 있었어요?']
      : ['신장림역에서 ', V(p), '명이 타고, 장림역에서 ', V(q), '명이 내렸더니 지금 열차에 ', V(e), '명이 있어요. 처음에는 몇 명이 타 있었어요?'],
    figure: { kind: 'stations', stations: ['신장림', '장림'] },
    input: { kind: 'number', unit: '명' },
    answer: s,
    discriminators: uniq(
      [
        { value: e + p - q, category: '개념', feedback: '거꾸로 갈 때 탄 사람은 어떻게 할까요?' },
        { value: e + p + q, category: '식', feedback: '모두 더해도 될까요? 거꾸로 따라가 봐요.' },
        { value: e - p, category: '식', feedback: '내린 사람도 되돌렸나요?' },
        { value: e + q, category: '식', feedback: '탄 사람도 되돌렸나요?' },
      ],
      s,
    ),
    hints: [
      offFirst ? `신장림역에서 ${q}명이 내리고 장림역에서 ${p}명이 탄 뒤 ${e}명이 됐어요. 처음 사람 수를 물어요.` : `신장림역에서 ${p}명이 타고 장림역에서 ${q}명이 내린 뒤 ${e}명이 됐어요. 처음 사람 수를 물어요.`,
      '지금부터 거꾸로 거슬러 올라가 볼까요? 장림역에서 일어난 일부터 되돌려요.',
      offFirst ? `장림역에서 타기 전에는 ${e} − ${p} = ${e - p}명이에요.` : `장림역에서 내리기 전에는 ${e} + ${q} = ${e + q}명이에요.`,
      offFirst ? `${e - p} + ${q} = ${bl.blank}` : `${e + q} − ${p} = ${bl.blank}`,
    ],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: offFirst
        ? [`장림역에서 탄 ${p}명을 되돌리면 ${e} − ${p} = ${e - p}명이에요.`, `신장림역에서 내린 ${q}명을 되돌리면 ${e - p} + ${q} = ${s}명이에요.`, `그래서 처음에 ${s}명이 타 있었어요.`]
        : [`장림역에서 내린 ${q}명을 되돌리면 ${e} + ${q} = ${e + q}명이에요.`, `신장림역에서 탄 ${p}명을 되돌리면 ${e + q} − ${p} = ${s}명이에요.`, `그래서 처음에 ${s}명이 타 있었어요.`],
      alt: [`확인해 봐요: ${s}명에서 차례로 따라가면 ${e}명이 돼요.`, `어느 길로 해도 답은 ${ro(s)} 같아요.`],
    },
  };
}

/** 5단계: 정원 범위 */
function t42Level5(K, s, q) {
  const now = s - q;
  const ans = K - now;
  const bl = blankAt(ans, 1);
  return {
    text: ['열차 앞쪽 두 칸에는 모두 ', V(K), '명까지 탈 수 있다고 해요. 그 두 칸에 ', V(s), '명이 타 있었는데, 신장림역에서 ', V(q), '명이 내렸어요. 신장림역에서 많아야 몇 명이 더 탈 수 있어요?'],
    figure: { kind: 'train', cars: 8, highlight: [0, 1] },
    input: { kind: 'number', unit: '명' },
    answer: ans,
    discriminators: uniq(
      [
        { value: K - s, category: '식', feedback: '내린 사람 자리도 셌나요?' },
        { value: now, category: '식', feedback: '지금 탄 사람 수예요. 더 탈 수는요?' },
        { value: K - s - q, category: '개념', feedback: '내리면 자리가 늘까요, 줄까요?' },
      ].filter((d) => d.value > 0),
      ans,
    ),
    hints: [`두 칸에는 ${K}명까지 탈 수 있어요. ${s}명이 타 있었고 신장림역에서 ${q}명이 내렸어요. 더 탈 수 있는 가장 많은 사람 수를 물어요.`, '내린 뒤 열차 안 사람 수부터 구해 볼까요? 그다음 정원까지 몇 명 남았는지 봐요.', `내린 뒤에는 ${s} − ${q} = ${now}명이에요.`, `${K} − ${now} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`내린 뒤 열차 안에는 ${s} − ${q} = ${now}명이 있어요.`, `${K}명까지 탈 수 있으니 ${K} − ${now} = ${ans}명이 더 탈 수 있어요.`, `그래서 많아야 ${ans}명이에요.`],
      alt: [`내리기 전 빈자리는 ${K} − ${s} = ${K - s}명이에요.`, `${q}명이 내려 빈자리가 늘었으니 ${K - s} + ${q} = ${ans}명이에요.`, `어느 길로 해도 답은 ${ro(ans)} 같아요.`],
    },
  };
}

const SECTIONS = ['신장림–장림', '장림–동매', '동매–신평'];
/** 6단계: 표에서 승객이 가장 많았던 구간 */
function t42Level6(s, rows) {
  const counts = [];
  let c = s;
  for (const [on, off] of rows) {
    c = c + on - off;
    counts.push(c);
  }
  const max = Math.max(...counts);
  const ans = SECTIONS[counts.indexOf(max)];
  const maxOn = rows.map((r) => r[0]).indexOf(Math.max(...rows.map((r) => r[0])));
  const names = ['신장림역', '장림역', '동매역'];
  const text = ['열차에 ', V(s), '명이 타고 신장림역에 왔어요.'];
  rows.forEach(([on, off], i) => text.push(` ${names[i]}: 탄 사람 `, V(on), '명, 내린 사람 ', V(off), '명.'));
  text.push(' 열차 안 사람이 가장 많았던 구간은 어디예요?');
  const bl = blankAt(counts[1], 1);
  return {
    text,
    figure: { kind: 'table', columns: ['역', '탄 사람', '내린 사람'], rows: rows.map(([on, off], i) => [names[i], on, off]) },
    input: { kind: 'choice', options: SECTIONS },
    answer: ans,
    discriminators: SECTIONS[maxOn] !== ans ? [{ value: SECTIONS[maxOn], category: '읽기', feedback: '탄 사람만 봤나요? 표에 차례로 적어 봐요.' }] : [],
    hints: [
      `처음 ${s}명이 신장림역에 왔고, 신장림·장림·동매역에서 사람이 타고 내렸어요. 역과 역 사이에서 열차 안 사람이 가장 많았던 구간을 물어요.`,
      '역을 지날 때마다 열차 안 사람 수를 표에 적어 볼까요? 세 구간의 수를 견주어 봐요.',
      `신장림역을 지난 뒤에는 ${counts[0]}명이에요.`,
      `장림역을 지난 뒤: ${counts[0]} + ${rows[1][0]} − ${rows[1][1]} = ${bl.blank}`,
    ],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '가장 많았던 구간은 어디예요?',
    explain: {
      why: [`구간마다 열차 안 사람은 ${counts[0]}명, ${counts[1]}명, ${counts[2]}명이에요.`, `가장 큰 수는 ${ieyo(max)}.`, `그래서 가장 많았던 구간은 ${ans} 구간이에요.`],
      alt: ['역마다 늘어난 수와 줄어든 수만 따져도 돼요.', `어느 길로 해도 답은 ${ans} 구간으로 같아요.`],
    },
  };
}

/** 7단계: 두 조건을 모두 만족하는 □ 모두 */
function t42Level7(s, q, K, T) {
  const opts = [10, 20, 30, 40, 50, 60, 70, 80, 90];
  const ok1 = (x) => s + x <= K;
  const ok2 = (x) => s + x - q > T;
  const answer = opts.filter((x) => ok1(x) && ok2(x));
  const low = answer[0];
  const high = answer.at(-1);
  const edge = T + q - s;
  const discs = [
    { value: opts.filter(ok1), category: '개념', feedback: '장림역을 지난 뒤도 확인했나요?' },
    { value: opts.filter(ok2), category: '개념', feedback: '신장림역을 지난 뒤도 확인했나요?' },
    { value: [edge, ...answer], category: '개념', feedback: `${T}명보다 많아야 해요. 같아도 될까요?` },
  ];
  return {
    text: ['열차에 ', V(s), '명이 타 있었어요. 신장림역에서 ', unknown('□'), '명이 타고, 장림역에서 ', V(q), '명이 내렸어요. 신장림역을 지난 뒤 열차 안 사람은 ', V(K), '명을 넘지 않았고, 장림역을 지난 뒤에는 ', V(T), '명보다 많았어요. □에 들어갈 수 있는 수를 보기에서 모두 골라요.'],
    figure: { kind: 'stations', stations: ['신장림', '장림'] },
    input: { kind: 'multi', options: opts },
    answer,
    discriminators: discs,
    grade: multiGrade(answer, discs),
    hints: [
      `처음 ${s}명, 신장림역에서 □명이 타고 장림역에서 ${q}명이 내려요. 신장림역 뒤에는 ${K}명 이하, 장림역 뒤에는 ${T}명 초과여야 해요. 들어갈 수 있는 □를 모두 물어요.`,
      '조건을 하나씩 따져 볼까요? 보기의 수를 넣어 표를 채워 봐요.',
      `신장림역을 지난 뒤 ${K}명을 넘지 않으려면 □는 ${K - s}보다 클 수 없어요.`,
      `들어갈 수 있는 수: ${low}부터 ☐0까지`,
    ],
    blank: `${low}부터 ☐0까지`,
    blankAnswer: String(high / 10),
    explain: {
      why: [`신장림역 뒤 ${K}명 이하: □는 ${K - s}까지예요.`, `장림역 뒤 ${T}명 초과: ${s} + □ − ${q}가 ${T}보다 커야 하니 □는 ${edge}보다 커야 해요.`.replace(`${q}가`, `${q}${jo(q, '이', '가')}`), `그래서 들어갈 수 있는 수는 ${answer.join(', ')}이에요.`],
      alt: ['보기의 수를 하나씩 넣어 두 조건을 모두 확인해도 돼요.', `어느 길로 해도 답은 ${answer.join(', ')}${roOnly(high)} 같아요.`],
    },
  };
}
const roOnly = (x) => (fin(x) === 'c' ? '으로' : '로');

/** T4-2 타고 내리는 승객 (문장 + 표) — 1~7단계 */
const T4_2 = {
  id: 'T4-2',
  node: 'N04',
  title: '타고 내리는 승객',
  repr: '문장',
  minLevel: 1,
  maxLevel: 7,
  generate(rng, level) {
    const trio = (okExtra) =>
      draw(
        rng,
        () => [rng.int(160, 320), rng.int(60, 160), rng.int(40, 130)],
        ([s, p, q]) => {
          if (p === q || Math.abs(p - q) < 8 || s - q < 50) return false;
          const vals = [s, p, q];
          const all = [s + p + q, s + p - q, s + p, s - q, s + q];
          if (all.some((v) => vals.includes(v))) return false;
          return okExtra(s, p, q);
        },
        [245, 128, 76],
      );
    if (level === 1) {
      const [s, p, q] = trio((a, b, c) => a + b + c <= 999);
      return t42Level1(s, p, q);
    }
    if (level === 2) {
      const [s, p, q] = trio(() => true);
      return t42Level2(s, p, q, rng.next() < 0.5);
    }
    if (level === 3) {
      const [s, p, q] = trio(() => true);
      return t42Level3(s, p, q, rng.next() < 0.5);
    }
    if (level === 4) {
      const [s, p, q] = trio((a, b, c) => ![a + b - c].includes(a));
      return t42Level4(s, p, q, rng.next() < 0.5);
    }
    if (level === 5) {
      const [K, s, q] = draw(
        rng,
        () => {
          const k = rng.int(28, 34) * 10;
          return [k, rng.int(200, k - 15), rng.int(30, 95)];
        },
        ([k, s, q]) => {
          const ans = k - s + q;
          return ![k, s, q, k - s, s - q, k - s - q].includes(ans) && ![k, s].includes(q) && ans < k;
        },
        [300, 245, 76],
      );
      return t42Level5(K, s, q);
    }
    if (level === 6) {
      const [s, rows] = draw(
        rng,
        () => [rng.int(150, 300), [0, 1, 2].map(() => [rng.int(20, 150), rng.int(20, 150)])],
        ([s, rows]) => {
          const counts = [];
          let c = s;
          for (const [on, off] of rows) {
            c = c + on - off;
            counts.push(c);
          }
          if (counts.some((x) => x < 50 || x > 600)) return false;
          const max = Math.max(...counts);
          if (counts.filter((x) => x === max).length > 1) return false;
          const sorted = [...counts].sort((a, b) => b - a);
          if (sorted[0] - sorted[1] < 5) return false;
          const ons = rows.map((r) => r[0]);
          const maxOn = ons.indexOf(Math.max(...ons));
          return ons.filter((x) => x === Math.max(...ons)).length === 1 && maxOn !== counts.indexOf(max);
        },
        [210, [[95, 40], [30, 85], [120, 50]]],
      );
      return t42Level6(s, rows);
    }
    const [s, q, K, T] = (() => {
      for (let t = 0; t < 50; t++) {
        const ss = rng.int(15, 30) * 10;
        const qq = rng.int(3, 9) * 10;
        const high = rng.int(4, 7) * 10; // 가장 큰 □
        const low = high - rng.int(1, 3) * 10; // 가장 작은 □
        const TT = ss + low - 10 - qq; // 경계값(low − 10)은 답이 아님
        if (low - 10 < 10 || TT < 50) continue;
        return [ss, qq, ss + high, TT];
      }
      return [240, 60, 300, 210];
    })();
    return t42Level7(s, q, K, T);
  },
};

/** 급행 통과 진단 */
const D1 = {
  id: 'N04-D1',
  node: 'N04',
  title: '급행 진단: 어림으로 판단',
  repr: '문장',
  minLevel: 2,
  maxLevel: 2,
  diagnostic: true,
  generate() {
    return { ...t41Level2(548, 379, 1827), hints: [], blank: null };
  },
};
const D2 = {
  id: 'N04-D2',
  node: 'N04',
  title: '급행 진단: 내리고 타는 승객',
  repr: '문장',
  minLevel: 2,
  maxLevel: 2,
  diagnostic: true,
  generate() {
    return { ...t42Level2(245, 128, 76, true), hints: [], blank: null };
  },
};
const D3 = {
  id: 'N04-D3',
  node: 'N04',
  title: '급행 진단(예비): 세 단체',
  repr: '문장',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...t41Level3(280, 118, 107, 86), hints: [], blank: null };
  },
};

// ── T4-3 검산식으로 확인하기 (식) — 09-templates-additions.md 4절 ──
// 화면의 compound는 칸 안에 equation을 그리지 않으므로, 검산식을 수 칸·기호 고르기 칸으로 나눠 받는다.
// 검산식이 맞아야 판단을 채점한다(검산식이 틀리면 판단과 상관없이 '식').
const num43 = (v) => Number(String(v ?? '').trim());
const blank43 = (v) => v === undefined || v === null || String(v).trim() === '';
const sign43 = (o) => {
  const t = String(o ?? '').trim();
  return t === '+' ? 1 : t === '−' || t === '-' ? -1 : 0;
};
const OPS43 = ['+', '−'];
const JUDGE43 = ['맞아요', '틀려요'];
const JUDGE_LABEL = '친구의 계산';
const careless43 = (feedback = '답을 먼저 써 볼까요?') => ({ correct: false, flags: { careless: true }, feedback });

/** 1·2단계: a − b = c 를 c + b = a 로 검산 */
function t43Sub(a, b, c) {
  const d = a - b;
  const right = c === d;
  const judge = right ? '맞아요' : '틀려요';
  const back = c + b;
  const bl = blankAt(back, 0);
  const fields = [
    { key: 'left', label: '검산식 첫 수' },
    { key: 'op', label: '기호', options: OPS43 },
    { key: 'right', label: '검산식 둘째 수' },
    { key: 'result', label: '= 계산 결과' },
    { key: 'judge', label: JUDGE_LABEL, options: JUDGE43 },
  ];
  const wrongJudge = right
    ? { key: 'judge', value: '틀려요', category: '개념', feedback: `검산 결과 ${eun(back)} 처음 수와 같지 않나요?` }
    : { key: 'judge', value: '맞아요', category: '개념', feedback: `검산 결과 ${eun(back)} 처음 수와 같나요?` };
  const subCheck = { key: 'op', value: '−', category: '식', feedback: '뺄셈의 검산은 덧셈으로 해요' };
  return {
    text: ['친구가 신장림역에서 남은 승객을 계산했어요. 열차에 ', V(a), '명이 있었고 ', V(b), '명이 내려서 ', n(a), ' − ', n(b), ' = ', n(c), jo(c, '이라고', '라고'), ' 했어요. 검산식을 쓰고 맞는지 판단해요.'],
    figure: null,
    input: { kind: 'compound', fields },
    answer: { left: c, op: '+', right: b, result: back, judge },
    discriminators: [wrongJudge, subCheck],
    grade(r) {
      if (fields.every((f) => blank43(r?.[f.key]))) return careless43();
      const L = num43(r?.left);
      const R = num43(r?.right);
      const s = sign43(r?.op);
      const pairOk = s === 1 && ((L === c && R === b) || (L === b && R === c));
      if (pairOk && num43(r?.result) === back) {
        if (blank43(r?.judge)) return careless43('맞아요, 틀려요도 골라 볼까요?');
        if (String(r.judge).trim() === judge) return { correct: true };
        return { correct: false, category: wrongJudge.category, feedback: wrongJudge.feedback };
      }
      if (pairOk) return { correct: false, category: '식', feedback: '검산식을 다시 계산해 볼까요?' };
      if (s === -1 && L === c && R === b) return { correct: false, category: '식', feedback: subCheck.feedback };
      return { correct: false, category: '식', feedback: '친구의 답에서 처음 수로 되돌아가는 식일까요?' };
    },
    hints: [
      `친구는 ${a} − ${b} = ${c}${jo(c, '이라고', '라고')} 했어요. 검산식을 쓰고 맞는지 물어요.`,
      '뺄셈의 답에 빼는 수를 더하면 무엇이 나와야 할까요?',
      `${c} + ${eul(b)} 계산해요. 일의 자리는 ${c % 10} + ${b % 10} = ${ieyo((c % 10) + (b % 10))}.`,
      `${c} + ${b} = ${bl.blank}`,
    ],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '친구의 계산이 맞아요, 틀려요?',
    explain: {
      why: right
        ? ['뺄셈이 맞으면 답에 빼는 수를 더할 때 처음 수가 나와요.', `${c} + ${b} = ${ieyo(back)}.`, `처음 수 ${wa(a)} 같아요.`, '그래서 친구의 계산은 맞아요.']
        : ['뺄셈이 맞으면 답에 빼는 수를 더할 때 처음 수가 나와요.', `${c} + ${b} = ${back}인데 처음 수는 ${a}${jo(a, '이라서', '라서')} ${back - a}만큼 차이 나요.`, '그래서 친구의 계산은 틀렸어요.'],
      alt: right
        ? [`직접 계산하면 ${a} − ${b} = ${ieyo(d)}.`, '친구의 답과 같아요.', "두 방법 모두 '맞아요'예요."]
        : [`직접 계산하면 ${a} − ${b} = ${ieyo(d)}.`, `친구의 답 ${wa(c)} 달라요.`, "두 방법 모두 '틀려요'예요."],
    },
  };
}

/** 3단계: 처음 s명, p명 탐, q명 내림 → r명. r + q − p = s 로 되돌려 검산 */
function t43Three(s, p, q) {
  const r = s + p - q;
  const fields = [
    { key: 'n1', label: '검산식 첫 수' },
    { key: 'op1', label: '첫 기호', options: OPS43 },
    { key: 'n2', label: '둘째 수' },
    { key: 'op2', label: '둘째 기호', options: OPS43 },
    { key: 'n3', label: '셋째 수' },
    { key: 'result', label: '= 계산 결과' },
    { key: 'judge', label: JUDGE_LABEL, options: JUDGE43 },
  ];
  const key = (terms) => terms.map(([sg, v]) => `${sg}:${v}`).sort().join('|');
  const want = key([[1, r], [1, q], [-1, p]]);
  const forward = key([[1, s], [1, p], [-1, q]]);
  const bl = blankAt(s, 1);
  return {
    text: ['신장림역에 열차가 오기 전에 ', V(s), '명이 타 있었어요. 신장림역에서 ', V(p), '명이 타고 ', V(q), '명이 내렸어요. 친구는 지금 열차 안 사람이 ', n(r), '명이라고 했어요. 처음 수로 되돌아가는 검산식을 쓰고 맞는지 판단해요.'],
    figure: null,
    input: { kind: 'compound', fields },
    answer: { n1: r, op1: '+', n2: q, op2: '−', n3: p, result: s, judge: '맞아요' },
    discriminators: [{ key: 'judge', value: '틀려요', category: '개념', feedback: `검산 결과 ${eun(s)} 처음 수와 같지 않나요?` }],
    grade(res) {
      if (fields.every((f) => blank43(res?.[f.key]))) return careless43();
      const terms = [
        [1, num43(res?.n1)],
        [sign43(res?.op1), num43(res?.n2)],
        [sign43(res?.op2), num43(res?.n3)],
      ];
      const got = key(terms);
      if (got === want && num43(res?.result) === s) {
        if (blank43(res?.judge)) return careless43('맞아요, 틀려요도 골라 볼까요?');
        if (String(res.judge).trim() === '맞아요') return { correct: true };
        return { correct: false, category: '개념', feedback: `검산 결과 ${eun(s)} 처음 수와 같지 않나요?` };
      }
      if (got === want) return { correct: false, category: '식', feedback: '검산식을 다시 계산해 볼까요?' };
      if (got === forward) return { correct: false, category: '식', feedback: '처음부터 다시 계산했어요. 거꾸로 되돌려 볼까요?' };
      return { correct: false, category: '식', feedback: '탄 사람과 내린 사람을 거꾸로 되돌렸나요?' };
    },
    hints: [
      `처음 ${s}명에서 ${p}명이 타고 ${q}명이 내렸어요. 친구는 ${r}명이라고 했어요. 처음 수로 되돌아가는 검산식을 쓰고 맞는지 물어요.`,
      '내린 사람은 다시 태우고, 탄 사람은 다시 내리게 해 볼까요? 거꾸로 하면 처음 수가 나와야 해요.',
      `${r} + ${q} = ${ieyo(r + q)}.`,
      `${r + q} − ${p} = ${bl.blank}`,
    ],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '친구의 계산이 맞아요, 틀려요?',
    explain: {
      why: ['지금 사람 수에서 내린 사람은 더하고 탄 사람은 빼면 처음 수가 나와야 해요.', `${r} + ${q} − ${p} = ${ieyo(s)}.`, `처음 수 ${wa(s)} 같아요.`, '그래서 친구의 계산은 맞아요.'],
      alt: [`${r} − ${p} + ${q}처럼 순서를 바꿔도 ${ieyo(s)}.`, `직접 계산해도 ${s} + ${p} − ${q} = ${ieyo(r)}.`, "두 방법 모두 '맞아요'예요."],
    },
  };
}

/** T4-3 검산식으로 확인하기 (식) — 1~3단계 */
const T4_3 = {
  id: 'T4-3',
  node: 'N04',
  title: '검산식으로 확인하기',
  repr: '식',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level <= 2) {
      const [a, b] = draw(
        rng,
        () => {
          const x = rng.int(300, 979);
          return [x, rng.int(111, x - 100)];
        },
        ([x, y]) => x - y >= 100 && x - y !== y && y % 10 !== 0 && borrowPos(x, y).includes(0) && x + 10 <= 999,
        [523, 187],
      );
      return t43Sub(a, b, level === 1 ? a - b : a - b + 10);
    }
    const [s, p, q] = draw(
      rng,
      () => [rng.int(150, 400), rng.int(60, 199), rng.int(30, 150)],
      ([x, y, z]) => {
        const r = x + y - z;
        return y !== z && r >= 100 && r <= 999 && r !== x && new Set([x, y, z, r]).size === 4 && x % 10 !== 0 && y % 10 !== 0 && z % 10 !== 0;
      },
      [245, 128, 76],
    );
    return t43Three(s, p, q);
  },
};

export default [T4_1, T4_2, T4_3, D1, D2, D3];
