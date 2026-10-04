// N05 장림 — 나눗셈의 의미 [4수01-05]. 천장 5.
// 기준: docs/curriculum/07-line1-templates.md v2 5절. 상황과 다른 식(값은 맞음)은 판별 오답(식)으로 다시 묻는다(0.7절).
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
const num = (v) => Number(String(v ?? '').trim());
const SITUATION = '이 식은 어떤 상황이에요?';

/** 상황과 다른 식(값은 맞음)을 찾는 판별 오답. 0.7절: N05·N06에서는 정답이 아니다. */
function mismatch(N, d, q, nameOf = '이 식은 어떤 상황이에요?') {
  return [
    { match: (r) => r?.op === '÷' && num(r.left) === N && num(r.right) === q && num(r.result) === d, category: '식', kind: 'check', feedback: nameOf },
    { match: (r) => r?.op === '×' && num(r.result) === N && ((num(r.left) === d && num(r.right) === q) || (num(r.left) === q && num(r.right) === d)), category: '식', kind: 'check', feedback: nameOf },
  ];
}

/** T5-1 1단계: 그림에서 똑같이 나눠 타기(톡-톡 놓기) */
function t51Level1(q) {
  const total = 8 * q;
  return {
    text: ['장림역에서 ', V(total), '명이 ', L1(), '호선 열차 ', CARS(), '칸에 똑같이 나눠 탔어요. 한 칸에 몇 명이에요?'],
    figure: { kind: 'groups', items: total, groups: 8, train: true },
    input: { kind: 'place', items: total, groups: 8 },
    answer: q,
    discriminators: uniq(
      [
        { value: total * 8, category: '식', kind: 'check', feedback: '한 칸 사람 수가 전체보다 많을까요?' },
        { value: total - 8, category: '식', kind: 'check', feedback: '8을 뺐나요? 똑같이 나누는 문제예요.' },
        { value: 8, category: '읽기', kind: 'check', feedback: '8은 칸 수예요. 무엇을 물었을까요?' },
      ],
      q,
    ),
    hints: [`구하는 것: 한 칸에 탄 사람 수 / 알고 있는 것: ${total}명, 8칸에 똑같이 나눠 탐`, '칸마다 한 명씩 차례로 놓아 볼까요? 다 놓을 때까지 몇 바퀴인지 세어 봐요.', '한 바퀴 돌면 8명, 두 바퀴 돌면 16명이 놓여요.', `8 × ☐ = ${total}`],
    blank: `8 × ☐ = ${total}`,
    blankAnswer: String(q),
    explain: {
      why: [`한 칸에 한 명씩 나눠 주면 8명씩 ${q}번 만에 다 나눠져요.`, `이것을 ${total} ÷ 8 = ${q}${jo(q, '이라고', '라고')} 써요.`, `그래서 한 칸에 ${q}명이에요.`],
      alt: [`곱셈구구 8단에서 ${eul(total)} 찾아요.`, `8 × ${q} = ${total}이니 ${total} ÷ 8 = ${ieyo(q)}.`, `어느 길로 해도 답은 ${q}명이에요.`],
    },
  };
}

/** T5-1 2단계: 식과 답 */
function t51Level2(q) {
  const N = 8 * q;
  return {
    text: ['아침에 ', V(N), '명이 ', L1(), '호선 열차 ', CARS(), '칸에 똑같이 나눠 탔어요. 한 칸에 몇 명인지 식과 답을 써요.'],
    figure: { kind: 'train', cars: 8 },
    input: { kind: 'equation' },
    answer: { left: N, op: '÷', right: 8, result: q },
    discriminators: [
      ...mismatch(N, 8, q),
      { match: (r) => r?.op === '×' && num(r.left) === N, category: '식', kind: 'check', feedback: '한 칸 사람 수가 전체보다 많을까요?' },
      { match: (r) => r?.op === '-', category: '식', kind: 'check', feedback: '똑같이 나누는 식은 뺄셈일까요?' },
    ],
    hints: [`구하는 것: 한 칸에 탄 사람 수의 식과 답 / 알고 있는 것: ${N}명, 8칸에 똑같이 나눠 탐`, '전체를 칸 수만큼 똑같이 나누는 식이에요. 곱셈구구 8단을 떠올려 봐요.', `8 × ${q - 1} = ${ieyo(8 * (q - 1))}.`, `${N} ÷ 8 = ☐`],
    blank: `${N} ÷ 8 = ☐`,
    blankAnswer: String(q),
    explain: {
      why: [`${N}명을 8칸에 똑같이 나누는 상황이에요.`, `8 × ${q} = ${N}이니 한 칸에 ${q}명씩이에요.`, `그래서 식은 ${N} ÷ 8 = ${ieyo(q)}.`],
      alt: [`${N}에서 8씩 빼면 ${q}번 만에 0이 돼요.`, `어느 길로 해도 답은 ${ieyo(q)}.`],
    },
  };
}

/** T5-1 3단계: 두 상황 중 똑같이 나누기 */
function t51Level3(N, k, eqFirst) {
  const eqL = eqFirst ? '(가)' : '(나)';
  const otL = eqFirst ? '(나)' : '(가)';
  const sEq = [V(N), '명이 ', L1(), '호선 열차 ', CARS(), '칸에 똑같이 나눠 타요.'];
  const sOt = [V(N), '명이 승강장에 ', V(k), '명씩 줄을 서요.'];
  const [first, second] = eqFirst ? [sEq, sOt] : [sOt, sEq];
  const q = N / 8;
  return {
    text: ['"똑같이 나누기"는 어느 쪽이에요? (가) ', ...first, ' (나) ', ...second],
    figure: null,
    input: { kind: 'choice', options: ['(가)', '(나)'] },
    answer: eqL,
    discriminators: [{ value: otL, category: '개념', kind: 'nudge', feedbackCheck: '두 이야기를 다시 읽어 볼까요?', feedback: '칸 수가 정해진 쪽은 어디일까요?' }],
    hints: [
      eqFirst ? `구하는 것: "똑같이 나누기"인 쪽 / 알고 있는 것: (가) ${N}명이 8칸에 탐, (나) ${N}명이 ${k}명씩 줄을 섬` : `구하는 것: "똑같이 나누기"인 쪽 / 알고 있는 것: (가) ${N}명이 ${k}명씩 줄을 섬, (나) ${N}명이 8칸에 탐`,
      '묶음의 수가 정해져 있는지, 한 묶음의 크기가 정해져 있는지 봐요.',
      `${eqL}에서는 칸 수 8이 정해져 있어요.`,
      `${N} ÷ 8 = ☐`,
    ],
    blank: `${N} ÷ 8 = ☐`,
    blankAnswer: String(q),
    blankThen: '어느 쪽이 "똑같이 나누기"예요?',
    explain: {
      why: ['"똑같이 나누기"는 몇 묶음으로 나눌지 정해 두고 한 묶음의 수를 구해요.', `${eqL}는 8칸이 정해져 있고, 한 칸의 사람 수를 구해요.`, `${otL}는 ${k}명씩 묶어 몇 줄인지 구해요.`, `${otL}처럼 하는 것은 "몇씩 묶어 덜어 내기"예요.`, `그래서 답은 ${eqL}예요.`],
      alt: [`식으로 써 보면 ${eqL}는 ${N} ÷ 8 = ${q}, 한 칸에 ${q}명이에요.`, `${otL}는 ${N} ÷ ${k} = ${N / k}, ${N / k}줄이에요.`, `나누는 수가 묶음의 수인 쪽은 ${eqL}예요.`],
    },
  };
}

/** T5-1 4단계: 몰려 탄 칸 → 고르게 */
function t51Level4(m, x) {
  const all = m * x;
  const ans = all / 8;
  return {
    text: [L1(), '호선 열차 앞 ', V(m), '칸에만 ', V(x), '명씩 몰려 탔어요. 이 사람들이 ', CARS(), '칸에 똑같이 나눠 타면 한 칸에 몇 명이에요?'],
    figure: { kind: 'train', cars: 8, crowded: m },
    input: { kind: 'number', unit: '명' },
    answer: ans,
    discriminators: uniq(
      [
        { value: x, category: '읽기', kind: 'nudge', feedbackCheck: '문제가 무엇을 물었는지 다시 볼까요?', feedback: `${x}명은 몰렸을 때예요. 똑같이 나누면요?` },
        { value: (x * 8) / m, category: '식', kind: 'nudge', feedbackCheck: '문제가 무엇을 물었는지 다시 볼까요?', feedback: '8칸에 퍼지면 한 칸은 늘까요?' },
        { value: all, category: '식', kind: 'nudge', feedbackCheck: '무엇을 물었는지 다시 볼까요?', feedback: `${all}명을 찾았어요. 8칸에 나누면요?` },
      ],
      ans,
    ),
    hints: [`구하는 것: 8칸에 똑같이 탈 때 한 칸 사람 수 / 알고 있는 것: 앞 ${m}칸에 ${x}명씩 탐`, '먼저 모두 몇 명인지 구해 볼까요? 그다음 8칸에 똑같이 나눠요.', `모두 ${x} × ${m} = ${all}명이에요.`, `${all} ÷ 8 = ☐`],
    blank: `${all} ÷ 8 = ☐`,
    blankAnswer: String(ans),
    explain: {
      why: [`앞 ${m}칸에 ${x}명씩이면 모두 ${x} × ${m} = ${all}명이에요.`, `${all}명이 8칸에 똑같이 나눠 타면 ${all} ÷ 8 = ${ans}명씩이에요.`, `그래서 한 칸에 ${ans}명이에요.`],
      alt: [m === 4 ? '칸 수가 두 배가 되면 한 칸에 탄 사람은 반이 돼요.' : '칸 수가 네 배가 되면 한 칸에 탄 사람은 4로 나눈 수가 돼요.', `한 칸에 ${x}명이던 것이 ${ans}명이 돼요.`, `어느 길로 해도 답은 ${ans}명이에요.`],
    },
  };
}

/** T5-1 5단계: 남는 사람 없이 줄 세우기 */
function t51Level5(k, L) {
  const answer = [];
  for (let v = k; v < L; v += k) answer.push(v);
  const options = Array.from({ length: L }, (_, i) => i + 1);
  const discs = [{ value: answer.slice(1), category: '개념', kind: 'nudge', feedbackCheck: '빠진 것이 없나요?', feedback: '한 줄만 서도 남는 사람이 없나요?' }];
  if (L % k === 0) discs.push({ value: [...answer, L], category: '개념', kind: 'check', feedback: `${L - 1}명까지예요. ${L}도 될까요?` });
  const last = answer.at(-1);
  const blank = [...answer.slice(0, -1), '☐'].join(', ');
  return {
    text: ['승강장에서 ', V(k), '명씩 줄을 서요. ', V(L - 1), '명까지의 수 중에서 남는 사람 없이 설 수 있는 인원을 모두 골라요.'],
    figure: null,
    input: { kind: 'multi', options },
    answer,
    discriminators: discs,
    grade: multiGrade(answer, discs),
    hints: [`구하는 것: 남는 사람 없이 줄을 설 수 있는 인원 모두 / 알고 있는 것: 한 줄에 ${k}명, ${L - 1}명까지`, `${k}명씩 한 줄, 두 줄, 세 줄로 늘려 볼까요? 그때 인원을 차례로 적어 봐요.`, `한 줄이면 ${k}명, 두 줄이면 ${2 * k}명이에요.`, blank],
    blank,
    blankAnswer: String(last),
    explain: {
      why: [`${k}명씩 줄을 서면 인원은 ${k}단의 수예요.`, `${L - 1}까지의 수 중에서 ${k}단의 수를 모두 찾아요.`, `그래서 답은 ${answer.join(', ')}명이에요.`],
      alt: [`1부터 ${L - 1}까지 ${k}씩 묶어 남는 것이 없는 수를 찾아도 돼요.`, `어느 길로 해도 답은 ${answer.join(', ')}명이에요.`],
    },
  };
}

/** T5-1 똑같이 나누기 (그림 → 식) — 1~5단계 */
const T5_1 = {
  id: 'T5-1',
  node: 'N05',
  title: '똑같이 나누기',
  repr: '그림',
  minLevel: 1,
  maxLevel: 5,
  generate(rng, level) {
    if (level === 1) return t51Level1(rng.int(2, 5));
    if (level === 2) return t51Level2(rng.pick([3, 4, 5, 6, 7, 9]));
    if (level === 3) {
      const [N, k] = draw(rng, () => [rng.pick([16, 24, 32, 40, 48]), rng.pick([2, 3, 4, 6])], ([a, b]) => a % b === 0 && a / b !== a / 8 && a / b <= 12, [24, 4]);
      return t51Level3(N, k, rng.next() < 0.5);
    }
    if (level === 4) {
      const [m, x] = rng.pick([
        [4, 4],
        [4, 6],
        [4, 10],
        [4, 12],
        [2, 12],
        [2, 16],
      ]);
      return t51Level4(m, x);
    }
    const [k, L] = draw(
      rng,
      () => {
        const kk = rng.int(3, 6);
        const cnt = rng.int(3, 5);
        return [kk, kk * cnt + rng.int(1, kk)];
      },
      ([kk, ll]) => ll <= 30,
      [4, 20],
    );
    return t51Level5(k, L);
  },
};

/** T5-2 1단계: 몇 명씩 줄(톡-톡 놓기) */
function t52Level1(k, m) {
  const N = k * m;
  return {
    text: ['승강장 문 앞에 ', V(k), '명씩 줄을 서요. ', V(N), '명이면 몇 줄이에요?'],
    figure: { kind: 'groups', items: N, groupSize: k },
    input: { kind: 'place', items: N, groupSize: k },
    answer: m,
    discriminators: uniq(
      [
        { value: N - k, category: '식', kind: 'nudge', feedbackCheck: '줄 수를 물었어요. 다시 볼까요?', feedback: `${k}명씩 몇 번 묶을 수 있나요?` },
        { value: k, category: '읽기', kind: 'check', feedback: `${k}명은 한 줄의 사람 수예요. 몇 줄일까요?` },
        { value: N * k, category: '식', kind: 'check', feedback: '줄 수가 사람 수보다 많을까요?' },
      ],
      m,
    ),
    hints: [`구하는 것: 줄의 수 / 알고 있는 것: ${N}명, 한 줄에 ${k}명씩`, `${k}명씩 묶어 볼까요? 묶음이 몇 개인지 세어 봐요.`, `${k}명씩 두 줄이면 ${2 * k}명이에요.`, `${k} × ☐ = ${N}`],
    blank: `${k} × ☐ = ${N}`,
    blankAnswer: String(m),
    explain: {
      why: [`${N}명을 ${k}명씩 묶으면 ${m}묶음이에요.`, `이것을 ${N} ÷ ${k} = ${m}${jo(m, '이라고', '라고')} 써요.`, `그래서 ${m}줄이에요.`],
      alt: [`${N}에서 ${k}씩 빼면 ${m}번 만에 0이 돼요.`, `어느 길로 해도 답은 ${m}줄이에요.`],
    },
  };
}

/** T5-2 2단계: 뺄셈 횟수 ↔ 나눗셈식 */
function t52Level2(k, m) {
  const N = k * m;
  const seq = Array.from({ length: m + 1 }, (_, i) => N - k * i);
  return {
    text: [n(N), '에서 ', n(k), jo(k, '을', '를'), ' 몇 번 빼면 ', n(0), '이 될까요? 그 횟수를 몫으로 하는 나눗셈식을 써요.'],
    figure: null,
    input: { kind: 'equation' },
    answer: { left: N, op: '÷', right: k, result: m },
    discriminators: [
      { match: (r) => r?.op === '÷' && num(r.left) === N && num(r.right) === m && num(r.result) === k, category: '식', kind: 'check', feedback: SITUATION },
      { match: (r) => r?.op === '×', category: '식', kind: 'nudge', feedbackCheck: '이 식은 어떤 상황이에요?', feedback: '나눗셈식으로 써 볼까요?' },
    ],
    hints: [`구하는 것: 덜어 낸 횟수를 몫으로 하는 나눗셈식 / 알고 있는 것: ${N}에서 ${k}씩 덜어 내어 0이 됨`, `${N}, ${N - k}처럼 차례로 적어 볼까요? 몇 번 만에 0이 되는지 세어 봐요.`, `${N} − ${k} = ${N - k}, ${N - k} − ${k} = ${ieyo(N - 2 * k)}.`, `${N} ÷ ${k} = ☐`],
    blank: `${N} ÷ ${k} = ☐`,
    blankAnswer: String(m),
    explain: {
      why: [`${seq.join(', ')}. ${k}씩 ${m}번 빼면 0이 돼요.`, `${k}씩 묶으면 ${m}묶음이라는 뜻이에요.`, `그래서 ${N} ÷ ${k} = ${ieyo(m)}.`],
      alt: [`곱셈구구로 ${k} × ${m} = ${eul(N)} 떠올려도 돼요.`, `어느 길로 해도 답은 ${ieyo(m)}.`],
    },
  };
}

/** T5-2 3단계: 차량 기지의 차량으로 8량 열차 만들기 */
function t52Level3(m) {
  const total = 8 * m;
  return {
    text: [L1(), '호선 열차는 ', CARS(), '칸이에요. 차량 기지에 떼어 놓은 칸이 ', V(total), '칸 있으면 열차를 몇 대 만들 수 있어요?'],
    figure: null,
    input: { kind: 'number', unit: '대' },
    answer: m,
    discriminators: uniq(
      [
        { value: 8, category: '읽기', kind: 'check', feedback: '8칸은 열차 한 대예요. 몇 대일까요?' },
        { value: total - 8, category: '식', kind: 'nudge', feedbackCheck: '몇 대를 물었는지 다시 볼까요?', feedback: '8칸씩 몇 번 묶을 수 있나요?' },
        { value: total * 8, category: '식', kind: 'check', feedback: '열차가 칸 수보다 많을까요?' },
      ],
      m,
    ),
    hints: [`구하는 것: 만들 수 있는 열차 수 / 알고 있는 것: 열차 한 대는 8칸, 칸은 모두 ${total}칸`, '8칸씩 묶으면 몇 묶음일까요?', '8칸씩 두 대면 16칸이에요.', `8 × ☐ = ${total}`],
    blank: `8 × ☐ = ${total}`,
    blankAnswer: String(m),
    explain: {
      why: [`${total}칸을 8칸씩 묶어요.`, `8 × ${m} = ${total}이니 ${total} ÷ 8 = ${ieyo(m)}.`, `그래서 열차를 ${m}대 만들 수 있어요.`],
      alt: [`${total}에서 8씩 빼면 ${m}번 만에 0이 돼요.`, `어느 길로 해도 답은 ${m}대예요.`],
    },
  };
}

/** T5-2 몇씩 묶어 덜어 내기 (그림 → 뺄셈 → 식) — 1~3단계 */
const T5_2 = {
  id: 'T5-2',
  node: 'N05',
  title: '몇씩 묶어 덜어 내기',
  repr: '문장',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 3) return t52Level3(rng.int(2, 7));
    const [k, m] = draw(rng, () => [rng.int(3, 5), rng.int(3, 6)], ([a, b]) => a !== b, [4, 5]);
    return level === 1 ? t52Level1(k, m) : t52Level2(k, m);
  },
};

/** 급행 통과 진단 */
const D1 = {
  id: 'N05-D1',
  node: 'N05',
  title: '급행 진단: 똑같이 나누기 고르기',
  repr: '문장',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...t51Level3(24, 4, true), hints: [], blank: null };
  },
};
const D2 = {
  id: 'N05-D2',
  node: 'N05',
  title: '급행 진단: 똑같이 나눠 타기',
  repr: '문장',
  minLevel: 4,
  maxLevel: 4,
  diagnostic: true,
  generate() {
    return { ...t51Level4(4, 6), hints: [], blank: null };
  },
};
const D3 = {
  id: 'N05-D3',
  node: 'N05',
  title: '급행 진단(예비): 열차 몇 대',
  repr: '문장',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...t52Level3(6), hints: [], blank: null };
  },
};

// ── T5-3 식에 맞는 이야기 고르기 (문장) — 09-templates-additions.md 5절 ──
// 상황과 다른 연산(뺄셈·덧셈) 이야기를 고르면 0.7절대로 '식' + "이 식은 어떤 상황이에요?"(다시 고르면 반 칸).
const STORY_LABELS = ['㉠', '㉡', '㉢'];

function storiesText(head, stories) {
  const text = [...head];
  stories.forEach((st, i) => text.push(` ${STORY_LABELS[i]} `, ...st.parts));
  return text;
}

/** 1단계: N ÷ 8 = q (똑같이 나누기) */
function t53Level1(q, order) {
  const N = 8 * q;
  const pool = {
    share: [V(N), '명이 ', L1(), '호선 열차 ', CARS(), '칸에 똑같이 나눠 타면 한 칸에 ', V(q), '명이에요.'],
    mult: ['한 칸에 ', V(8), '명씩 ', V(q), '칸이면 ', V(N), '명이에요.'],
    sub: [V(N), '명 중 ', V(8), '명이 내리면 ', V(N - 8), '명이에요.'],
  };
  const stories = order.map((id) => ({ id, parts: pool[id] }));
  const lab = (id) => STORY_LABELS[order.indexOf(id)];
  const ans = lab('share');
  return {
    text: storiesText(['식 ', n(N), ' ÷ ', n(8), ' = ', n(q), '에 맞는 이야기를 골라요.'], stories),
    figure: null,
    input: { kind: 'choice', options: STORY_LABELS },
    answer: ans,
    discriminators: [
      { value: lab('mult'), category: '개념', kind: 'nudge', feedbackCheck: '이야기를 다시 읽어 볼까요?', feedback: `${eul(N)} 나누는 이야기일까요, 만드는 이야기일까요?` },
      { value: lab('sub'), category: '식', kind: 'check', feedback: SITUATION },
    ],
    hints: [
      '식 하나와 이야기 세 개가 있어요. 식에 맞는 이야기를 물어요.',
      `이야기마다 ${N}${jo(N, '이', '가')} 나뉘는지, 만들어지는지 볼까요?`,
      `${lab('mult')}은 ${N}명을 만드는 이야기, ${lab('sub')}은 빼는 이야기예요.`,
      `${N}명을 8칸에 똑같이 나누면 한 칸에 ☐명`,
    ],
    blank: '한 칸에 ☐명',
    blankAnswer: String(q),
    blankThen: '식에 맞는 이야기는 어느 것이에요?',
    explain: {
      why: [`${N} ÷ 8 = ${q}${jo(q, '은', '는')} ${eul(N)} 8묶음으로 똑같이 나누면 한 묶음이 ${q}${jo(q, '이라는', '라는')} 뜻이에요.`, `${ans}은 ${N}명을 8칸에 똑같이 나눠서 한 칸에 ${q}명이에요.`, `그래서 답은 ${ieyo(ans)}.`],
      alt: [`식을 거꾸로 생각해요. ${q} × 8 = ${ieyo(N)}.`, `8칸에 ${q}명씩이면 ${N}명이니, ${N}명을 8칸에 나눈 이야기가 ${ieyo(ans)}.`, `어느 길로 해도 답은 ${ieyo(ans)}.`],
    },
  };
}

/** 2단계: N ÷ k = m (몇씩 묶어 덜어 내기) */
function t53Level2(k, m, order) {
  const N = k * m;
  const pool = {
    group: [V(N), '명이 승강장에 ', V(k), '명씩 줄을 서면 ', V(m), '줄이에요.'],
    add: [V(N), '명에서 ', V(k), '명이 더 오면 ', V(N + k), '명이에요.'],
    mult: [V(k), '줄에 ', V(m), '명씩 서면 ', V(N), '명이에요.'],
  };
  const stories = order.map((id) => ({ id, parts: pool[id] }));
  const lab = (id) => STORY_LABELS[order.indexOf(id)];
  const ans = lab('group');
  return {
    text: storiesText(['식 ', n(N), ' ÷ ', n(k), ' = ', n(m), '에 맞는 이야기를 골라요.'], stories),
    figure: null,
    input: { kind: 'choice', options: STORY_LABELS },
    answer: ans,
    discriminators: [
      { value: lab('mult'), category: '개념', kind: 'nudge', feedbackCheck: '이야기를 다시 읽어 볼까요?', feedback: `${eul(N)} 나누는 이야기일까요, 만드는 이야기일까요?` },
      { value: lab('add'), category: '식', kind: 'check', feedback: SITUATION },
    ],
    hints: [
      '식 하나와 이야기 세 개가 있어요. 식에 맞는 이야기를 물어요.',
      `이야기마다 ${N}${jo(N, '이', '가')} 나뉘는지, 만들어지는지 볼까요?`,
      `${lab('mult')}은 ${N}명을 만드는 이야기, ${lab('add')}은 더하는 이야기예요.`,
      `${N}명을 ${k}명씩 묶으면 ☐줄`,
    ],
    blank: `${k}명씩 묶으면 ☐줄`,
    blankAnswer: String(m),
    blankThen: '식에 맞는 이야기는 어느 것이에요?',
    explain: {
      why: [`${N} ÷ ${k} = ${m}${jo(m, '은', '는')} ${eul(N)} ${k}씩 묶으면 ${m}묶음이라는 뜻이에요.`, `${ans}은 ${N}명이 ${k}명씩 줄을 서서 ${m}줄이에요.`, `그래서 답은 ${ieyo(ans)}.`],
      alt: [`${N}에서 ${k}씩 빼면 ${m}번 만에 0이 돼요.`, `${k}명씩 ${m}번 덜어 내는 이야기가 ${ieyo(ans)}.`, `어느 길로 해도 답은 ${ieyo(ans)}.`],
    },
  };
}

/** 3단계: 같은 수의 두 나눗셈 ↔ 두 이야기 잇기 */
function t53Level3(m, trainFirst) {
  const N = 8 * m;
  const eqA = `${N} ÷ 8 = ${m}`; // 8칸씩 묶기
  const eqB = `${N} ÷ ${m} = 8`; // m줄로 똑같이 나누기
  const sTrain = ['차량 기지의 ', L1(), '호선 칸 ', V(N), '칸으로 ', CARS(), '칸짜리 열차를 몇 대 만들어요?'];
  const sRow = [V(N), '명이 ', V(m), '줄로 똑같이 서면 한 줄에 몇 명이에요?'];
  const [first, second] = trainFirst ? [sTrain, sRow] : [sRow, sTrain];
  const ga = trainFirst ? eqA : eqB;
  const na = trainFirst ? eqB : eqA;
  // 이야기마다 헷갈리기 쉬운 수: 열차 이야기는 8(한 대의 칸 수), 줄 이야기는 m(줄 수)
  const askTrain = (lab) => `${lab}에서 8은 열차 수예요, 한 대의 칸 수예요?`;
  const askRow = (lab) => `${lab}에서 ${eun(m)} 줄 수예요, 한 줄의 사람 수예요?`;
  const askGa = trainFirst ? askTrain('(가)') : askRow('(가)');
  const askNa = trainFirst ? askRow('(나)') : askTrain('(나)');
  const end = (eq) => (eq === eqA ? ieyo(m).slice(String(m).length) : '이에요');
  return {
    text: ['두 식과 두 이야기를 이어요. 식은 ', n(N), ' ÷ ', n(8), ' = ', n(m), jo(m, '과', '와'), ' ', n(N), ' ÷ ', n(m), ' = ', n(8), '이에요. (가) ', ...first, ' (나) ', ...second],
    figure: null,
    input: {
      kind: 'compound',
      fields: [
        { key: 'ga', label: '(가)에 맞는 식', options: [eqA, eqB] },
        { key: 'na', label: '(나)에 맞는 식', options: [eqA, eqB] },
      ],
    },
    answer: { ga, na },
    discriminators: [
      { key: 'ga', value: na, category: '개념', kind: 'check', feedback: askGa },
      { key: 'na', value: ga, category: '개념', kind: 'check', feedback: askNa },
    ],
    hints: [
      '식 두 개와 이야기 두 개가 있어요. 이야기마다 맞는 식을 물어요.',
      '이야기마다 몇씩 묶는지, 몇 묶음으로 똑같이 나누는지 볼까요?',
      `열차 이야기는 ${N}칸을 8칸씩 묶어요.`,
      `${N}칸을 8칸씩 묶으면 ☐대`,
    ],
    blank: '8칸씩 묶으면 ☐대',
    blankAnswer: String(m),
    blankThen: '두 이야기에 맞는 식을 골라요.',
    explain: {
      why: [
        `열차 이야기는 ${N}칸을 8칸씩 묶어 몇 대인지 구하니 ${eqA}${end(eqA)}.`,
        `줄 이야기는 ${N}명을 ${m}줄로 똑같이 나눠 한 줄의 사람 수를 구하니 ${eqB}${end(eqB)}.`,
        `그래서 (가)는 ${ga}, (나)는 ${na}${end(na)}.`,
      ],
      alt: [`확인해 보면 8 × ${m} = ${ieyo(N)}.`, '두 식 모두 맞는 나눗셈이지만, 이야기의 상황에 따라 고르는 식이 달라요.'],
    },
  };
}

/** T5-3 식에 맞는 이야기 고르기 (문장) — 1~3단계 */
const T5_3 = {
  id: 'T5-3',
  node: 'N05',
  title: '식에 맞는 이야기 고르기',
  repr: '문장',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 1) return t53Level1(rng.pick([3, 4, 5, 6, 7]), rng.shuffle(['share', 'mult', 'sub']));
    if (level === 2) {
      const [k, m] = draw(rng, () => [rng.int(3, 6), rng.int(3, 7)], ([a, b]) => a !== b, [4, 5]);
      return t53Level2(k, m, rng.shuffle(['group', 'add', 'mult']));
    }
    return t53Level3(rng.pick([3, 4, 5, 6, 7, 9]), rng.next() < 0.5);
  },
};

export default [T5_1, T5_2, T5_3, D1, D2, D3];
