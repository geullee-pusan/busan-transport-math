// N17 남포 — 분수만큼은 얼마(이산량) [4수01-09·10]. 천장 6.
// 기준: docs/curriculum/08-line1-templates-11-20.md 17절(1호선 8량, 40역, 남포 = 17번째 역), 09 끝 보강 후보(빈칸: □의 □/□는 □). 피드백 꼬리표 kind: 'check' | 'nudge'(10 문서 2절).
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

const FORTY = () => n(40, { real: true, source: SRC_L1 });
const NAMPO = () => n(17, { real: true, source: SRC_ORDER });
const fr = (a, b) => `${a}/${b}`;
const blankOf = (v) => (v >= 10 ? blankAt(v, 0) : { blank: '☐', blankAnswer: String(v) });

// ── T17-1 8량과 40역의 분수만큼 (그림 → 문장) — 1~6단계 ──

/** 1단계: 8량의 1/k(칸 색칠) */
function t171Level1(k) {
  const ans = 8 / k;
  return {
    text: [L1(), '호선 열차는 ', CARS(), '량이에요. 열차의 ', n(fr(1, k)), '만큼 칸을 색칠해요. 몇 량이에요?'],
    figure: { kind: 'train', cars: 8, paint: true },
    input: { kind: 'paint', cells: 8 },
    answer: ans,
    discriminators: uniq([{ value: k, category: '개념', kind: 'check', feedback: `${k}량은 8량의 얼마만큼일까요?` }], ans),
    hints: [`열차는 8량이에요. 그 ${fr(1, k)}만큼이 몇 량인지 물어요.`, `8량을 똑같이 ${k}묶음으로 나눠 볼까요? 그중 1묶음이 ${fr(1, k)}이에요.`, `${k}묶음 중 1묶음을 색칠해요.`, `${k} × ☐ = 8`],
    blank: `${k} × ☐ = 8`,
    blankAnswer: String(ans),
    blankThen: '칸을 색칠해요.',
    explain: {
      why: [`8량을 똑같이 ${k}묶음으로 나누면 한 묶음이 ${ans}량이에요.`, `${fr(1, k)}${jo(1, '은', '는')} 그중 1묶음이에요.`, `그래서 8량의 ${fr(1, k)}${jo(1, '은', '는')} ${ans}량이에요.`],
      alt: [`8 ÷ ${k} = ${ro(ans)} 구해도 돼요.`, `두 풀이 모두 ${ans}량이에요.`],
    },
  };
}

/** 2단계: 진분수만큼 */
function t171Level2(total, a, b) {
  const u = total / b;
  const ans = u * a;
  const f = fr(a, b);
  const bl = blankOf(ans);
  const head = total === 8 ? [L1(), '호선 열차는 ', CARS(), '량이에요. '] : [L1(), '호선 ', CARS(), '량 열차 두 대는 모두 ', n(16), '량이에요. '];
  return {
    text: [...head, n(total), '량의 ', n(f), jo(f, '은', '는'), ' 몇 량이에요?'],
    figure: total === 8 ? { kind: 'train', cars: 8 } : { kind: 'trains', trains: [{ name: '', cars: 8 }, { name: '', cars: 8 }], coupled: true },
    input: { kind: 'number', unit: '량' },
    answer: ans,
    discriminators: uniq(
      [
        { value: u, category: '식', kind: 'nudge', feedbackCheck: `${f}만큼을 다시 볼까요?`, feedback: `${fr(1, b)}이 ${u}량이면 ${eun(f)}요?` },
        { value: a, category: '개념', kind: 'nudge', feedbackCheck: `${a}량은 ${total}량의 얼마만큼일까요?`, feedback: `${total}량을 ${b}묶음 해 볼까요?` },
        { value: total * a, category: '식', kind: 'check', feedback: `${total}량보다 많아질까요?` },
      ],
      ans,
    ),
    hints: [`칸은 모두 ${total}량이에요. 그 ${f}만큼이 몇 량인지 물어요.`, `${total}량을 똑같이 ${b}묶음으로 나눠 볼까요? 그중 ${a}묶음이 ${f}예요.`.replace(`${f}예요`, `${f}${jo(f, '이에요', '예요')}`), `한 묶음은 ${u}량이에요.`, `${u}량씩 ${a}묶음: ${bl.blank}량`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${total}량을 똑같이 ${b}묶음으로 나누면 한 묶음이 ${u}량이에요.`, `${eun(f)} 그중 ${a}묶음이라 ${u} × ${a} = ${ans}량이에요.`, `그래서 ${total}량의 ${eun(f)} ${ans}량이에요.`],
      alt: [`${total}량의 ${fr(1, b)}이 ${u}량이니 ${fr(b, b)}는 ${total}량이에요. ${eun(f)} ${total}량에서 ${fr(b - a, b)}만큼인 ${u * (b - a)}량을 뺀 ${ans}량이에요.`, `두 풀이 모두 ${ans}량이에요.`],
    },
  };
}

/** 3단계: 40역의 분수만큼과 남포까지 17역 비교 */
function t171Level3(a, b) {
  const part = (40 / b) * a;
  const f = fr(a, b);
  const cmp = 17 > part ? '많아요' : '적어요';
  const answer = { part, cmp };
  const bl = blankOf(part);
  const discs = [{ key: 'cmp', value: cmp === '많아요' ? '적어요' : '많아요', category: '개념', kind: 'check', feedback: '두 수를 다시 견주어 볼까요?' }];
  if (a > 1) discs.push({ key: 'part', value: 40 / b, category: '식', kind: 'nudge', feedbackCheck: `${f}만큼을 다시 볼까요?`, feedback: `${fr(1, b)}이 ${40 / b}역이면 ${eun(f)}요?` });
  return {
    text: [L1(), '호선은 ', FORTY(), '역이에요. 다대포해수욕장부터 남포까지는 ', NAMPO(), '역이에요. 남포까지의 역 수는 ', FORTY(), '역의 ', n(f), '보다 많아요, 적어요?'],
    figure: { kind: 'stations', stations: ['다대포해수욕장', '…', '남포', '…', '노포'] },
    input: { kind: 'compound', fields: [{ key: 'part', label: `40역의 ${f}` }, { key: 'cmp', label: '남포까지는', options: ['많아요', '적어요'] }] },
    answer,
    discriminators: uniqK(discs, answer),
    hints: [`1호선은 40역, 다대포해수욕장부터 남포까지는 17역이에요. 17역이 40역의 ${f}보다 많은지 적은지 물어요.`, `40역을 똑같이 ${b}묶음으로 나눠 볼까요? 그중 ${a}묶음을 구해요.`, `${b}묶음 중 ${a}묶음이에요.`, `40역의 ${f}: ${bl.blank}역`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '남포까지는 많아요, 적어요?',
    explain: {
      why: [`40역을 ${b}묶음으로 나누면 한 묶음이 ${40 / b}역이고, ${eun(f)} ${part}역이에요.`, `17${jo(17, '은', '는')} ${part}보다 ${17 > part ? '커요' : '작아요'}.`, `그래서 남포까지는 40역의 ${f}보다 ${cmp}.`],
      alt: [`${40 / b} × ${a} = ${ro(part)} 구해도 같아요.`, `두 풀이 모두 ${cmp}.`],
    },
  };
}

/** 4단계: 부분 → 전체 */
function t171Level4(a, b, u) {
  const part = a * u;
  const total = b * u;
  const f = fr(a, b);
  const bl = blankOf(total);
  return {
    text: ['어느 날 남포역에서 열차 한 칸의 승객 중 ', n(f), '인 ', V(part), '명이 내렸어요. 그 칸의 승객은 처음에 모두 몇 명이었어요?'],
    figure: null,
    input: { kind: 'number', unit: '명' },
    answer: total,
    discriminators: uniq(
      [
        { value: u, category: '식', kind: 'nudge', feedbackCheck: '무엇을 물었는지 다시 볼까요?', feedback: `${fr(1, b)}이 ${u}명이면 ${eun(fr(b, b))}요?` },
        { value: part * a, category: '개념', kind: 'check', feedback: `${part}명이 전체의 얼마만큼이에요?` },
        { value: part * b, category: '개념', kind: 'check', feedback: `${part}명이 전체의 얼마만큼이에요?` },
      ],
      total,
    ),
    hints: [`내린 사람 ${part}명은 한 칸 승객의 ${f}예요. 그 칸의 승객 수를 물어요.`.replace(`${f}예요`, `${f}${jo(f, '이에요', '예요')}`), `승객을 ${b}묶음으로 나누면 ${part}명은 그중 ${a}묶음이에요. 한 묶음은 몇 명일까요?`, `한 묶음은 ${part} ÷ ${a} = ${u}명이에요.`, `${u}명씩 ${b}묶음: ${bl.blank}명`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${part}명이 ${b}묶음 중 ${a}묶음이니 한 묶음은 ${u}명이에요.`, `전체는 ${b}묶음이라 ${u} × ${b} = ${total}명이에요.`, `그래서 그 칸의 승객은 모두 ${total}명이에요.`],
      alt: [`${total}명의 ${eun(f)} ${part}명이 맞는지 확인해요.`, `두 풀이 모두 ${total}명이에요.`],
    },
  };
}

/** 5단계: 40역의 □/b가 T역보다 적은 □ */
function t171Level5(b, T) {
  const unit = 40 / b;
  const answer = [];
  for (let k = 1; k < b; k++) if (unit * k < T) answer.push(k);
  const k = answer.at(-1);
  const options = Array.from({ length: b - 1 }, (_, i) => i + 1);
  const discs = [];
  if (T % unit === 0 && T / unit < b) discs.push({ value: [...answer, T / unit], category: '개념', kind: 'check', feedback: `40역의 ${fr(T / unit, b)}${jo(T / unit, '은', '는')} ${T}역보다 적나요?` });
  if (answer.length >= 2) discs.push({ value: answer.slice(0, -1), category: '개념', kind: 'nudge', feedbackCheck: '빠진 것이 없나요?', feedback: `40역의 ${fr(k, b)}도 계산해 봤나요?` });
  return {
    text: [FORTY(), '역의 ', unknown(`□/${b}`), jo(1, '이', '이'), ' ', n(T), '역보다 적어요. □에 들어갈 수 있는 수를 모두 골라요.'],
    figure: null,
    input: { kind: 'multi', options },
    answer,
    discriminators: uniq(discs, answer),
    grade: multiGrade(answer, discs),
    hints: [`40역의 □/${b}이 ${T}역보다 적게 되는 □를 모두 물어요.`, `40역의 ${fr(1, b)}부터 구해 볼까요? □가 하나 커질 때마다 얼마씩 늘어나는지 봐요.`, `40역의 ${eun(fr(1, b))} ${unit}역이에요.`, '1부터 ☐까지'],
    blank: '1부터 ☐까지',
    blankAnswer: String(k),
    explain: {
      why: [`40역의 ${eun(fr(1, b))} ${unit}역이라 40역의 □/${b}${jo(1, '은', '은')} ${unit} × □역이에요.`, `${unit} × ${k} = ${ro(unit * k)} ${T}보다 적고, ${unit} × ${k + 1} = ${unit * (k + 1)}${jo(unit * (k + 1), '은', '는')} 적지 않아요.`, `그래서 □는 1부터 ${k}까지예요.`],
      alt: [`□에 1부터 차례로 넣어 40역의 □/${b}${jo(1, '을', '을')} 적어 봐도 돼요.`, `어느 길로 해도 답은 1부터 ${k}까지로 같아요.`],
    },
  };
}

/** 6단계: 40역의 분수만큼과 남포까지 17역, 어느 쪽이 몇 역 더 많은지 */
function t171Level6(a, b) {
  const part = (40 / b) * a;
  const f = fr(a, b);
  const optA = `40역의 ${f}`;
  const more = part > 17 ? optA : '남포까지';
  const answer = { part, more, diff: Math.abs(part - 17) };
  const bl = blankOf(part);
  const discs = [{ key: 'more', value: more === optA ? '남포까지' : optA, category: '개념', kind: 'check', feedback: '두 수를 다시 견주어 볼까요?' }];
  if (a > 1) discs.push({ key: 'part', value: 40 / b, category: '식', kind: 'nudge', feedbackCheck: `${f}만큼을 다시 볼까요?`, feedback: `${fr(1, b)}이 ${40 / b}역이면 ${eun(f)}요?` });
  return {
    text: [L1(), '호선 ', FORTY(), '역의 ', n(f), jo(f, '과', '와'), ', 다대포해수욕장부터 남포까지의 ', NAMPO(), '역 중 어느 쪽이 몇 역 더 많아요?'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'part', label: optA }, { key: 'more', label: '더 많은 쪽', options: [optA, '남포까지'] }, { key: 'diff', label: '몇 역 더' }] },
    answer,
    discriminators: uniqK(discs, answer),
    hints: [`40역의 ${wa(f)} 남포까지의 17역을 견주어 어느 쪽이 몇 역 더 많은지 물어요.`, `40역의 ${f}부터 구해 볼까요? 40역을 똑같이 ${b}묶음으로 나눠요.`, a === 1 ? `${b}묶음 중 1묶음이에요.` : `40역의 ${eun(fr(1, b))} ${40 / b}역이에요.`, `40역의 ${f}: ${bl.blank}역`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '어느 쪽이 몇 역 더 많아요?',
    explain: {
      why: [`40역의 ${eun(f)} ${40 / b} × ${a} = ${part}역이에요.`, `${part}${jo(part, '과', '와')} 17의 차는 ${ieyo(Math.abs(part - 17))}.`, `그래서 ${more === optA ? `40역의 ${f}` : '남포까지'} 쪽이 ${Math.abs(part - 17)}역 더 많아요.`],
      alt: ['수직선에 두 수를 찍어 사이를 세어도 돼요.', `두 풀이 모두 ${Math.abs(part - 17)}역이에요.`],
    },
  };
}

const T17_1 = {
  id: 'T17-1',
  node: 'N17',
  title: '8량과 40역의 분수만큼',
  repr: '그림',
  minLevel: 1,
  maxLevel: 6,
  generate(rng, level) {
    if (level === 1) return t171Level1(rng.pick([2, 4]));
    if (level === 2) return t171Level2(...rng.pick([[8, 3, 4], [16, 3, 8], [16, 5, 8], [16, 3, 4], [16, 7, 8]]));
    if (level === 3) return t171Level3(...rng.pick([[1, 2], [1, 4], [2, 5], [3, 5]]));
    if (level === 4) {
      const [a, b, u] = draw(
        rng,
        () => {
          const [aa, bb] = rng.pick([[2, 5], [3, 4], [2, 3], [3, 5], [3, 8], [4, 5]]);
          return [aa, bb, rng.int(6, 15)];
        },
        ([aa, bb, uu]) => bb * uu <= 120 && ![8, bb, aa * uu].includes(bb * uu),
        [2, 5, 12],
      );
      return t171Level4(a, b, u);
    }
    if (level === 5) {
      const [b, T] = draw(
        rng,
        () => [rng.pick([4, 5, 8]), rng.int(12, 36)],
        ([bb, TT]) => {
          const c = Array.from({ length: bb - 1 }, (_, i) => i + 1).filter((k) => (40 / bb) * k < TT).length;
          return c >= 2 && c <= bb - 2;
        },
        [8, 20],
      );
      return t171Level5(b, T);
    }
    return t171Level6(...rng.pick([[3, 8], [1, 4], [2, 5], [3, 5]]));
  },
};

// ── T17-2 □의 □/□는 □ (빈칸) — 1~3단계, 09 보강 후보 ──
function t172(N, a, b, findWhole) {
  const u = N / b;
  const part = a * u;
  const f = fr(a, b);
  if (findWhole) {
    const bl = blankOf(N);
    return {
      text: [unknown('□'), '의 ', n(f), jo(f, '은', '는'), ' ', n(part), jo(part, '이에요', '예요'), '. □에 알맞은 수를 써요.'],
      figure: { kind: 'groups', items: part },
      input: { kind: 'number' },
      answer: N,
      discriminators: uniq(
        [
          { value: u, category: '식', kind: 'nudge', feedbackCheck: '□가 무엇인지 다시 볼까요?', feedback: `${fr(1, b)}이 ${ieyo(u)}. ${eun(fr(b, b))}요?` },
          { value: part * b, category: '개념', kind: 'check', feedback: `${part}${jo(part, '이', '가')} □의 얼마만큼이에요?` },
        ],
        N,
      ),
      hints: [`어떤 수의 ${eun(f)} ${ieyo(part)}. 그 어떤 수를 물어요.`, `${eun(part)} ${b}묶음 중 ${a}묶음이에요. 한 묶음은 얼마일까요?`, `한 묶음은 ${part} ÷ ${a} = ${ieyo(u)}.`, `${u} × ${b} = ${bl.blank}`],
      blank: bl.blank,
      blankAnswer: bl.blankAnswer,
      explain: {
        why: [`${eun(part)} □를 ${b}묶음으로 나눈 것 중 ${a}묶음이에요.`, `한 묶음은 ${u}, 전체 ${b}묶음은 ${u} × ${b} = ${ieyo(N)}.`, `그래서 □는 ${ieyo(N)}.`],
        alt: [`${N}의 ${f}${jo(f, '을', '를')} 구해 보면 ${part}${jo(part, '이', '가')} 나와요.`, `두 풀이 모두 ${ieyo(N)}.`],
      },
    };
  }
  const bl = a === 1 ? { blank: `${b} × ☐ = ${N}`, blankAnswer: String(u) } : blankOf(part);
  return {
    text: [n(N), '의 ', n(f), jo(f, '은', '는'), ' ', unknown('□'), '예요. □에 알맞은 수를 써요.'],
    figure: { kind: 'groups', items: N },
    input: { kind: 'number' },
    answer: part,
    discriminators: uniq(
      [
        ...(a > 1 ? [{ value: u, category: '식', kind: 'nudge', feedbackCheck: `${f}만큼을 다시 볼까요?`, feedback: `${fr(1, b)}이 ${u}이면 ${eun(f)}요?` }] : []),
        { value: b, category: '개념', kind: 'check', feedback: '한 묶음에 몇 개인지 다시 볼까요?' },
        { value: N * a, category: '식', kind: 'check', feedback: `${N}보다 커질까요?` },
      ],
      part,
    ),
    hints: [`${N}의 ${f}만큼이 얼마인지 물어요.`, `${eul(N)} 똑같이 ${b}묶음으로 나눠 볼까요? 그중 ${a}묶음이 ${f}${jo(f, '이에요', '예요')}.`, a === 1 ? `${b}묶음 중 1묶음이에요.` : `한 묶음은 ${ieyo(u)}.`, a === 1 ? `${b} × ☐ = ${N}` : `${u} × ${a} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${eul(N)} ${b}묶음으로 나누면 한 묶음이 ${ieyo(u)}.`, `${eun(f)} ${a}묶음이라 ${u} × ${a} = ${ieyo(part)}.`, `그래서 □는 ${ieyo(part)}.`],
      alt: [`${N} ÷ ${b} × ${a} = ${ro(part)} 구해도 같아요.`, `두 풀이 모두 ${ieyo(part)}.`],
    },
  };
}

const T17_2 = {
  id: 'T17-2',
  node: 'N17',
  title: '□의 □/□는 □',
  repr: '빈칸',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const [N, a, b] = draw(
      rng,
      () => {
        const bb = rng.int(2, 6);
        const aa = level === 1 ? 1 : rng.int(2, bb - 1 || 1);
        return [bb * rng.int(2, 9), aa, bb];
      },
      ([NN, aa, bb]) => {
        const u = NN / bb;
        const part = aa * u;
        if (level >= 2 && (aa < 2 || aa >= bb)) return false;
        const g = (x, y) => (y === 0 ? x : g(y, x % y));
        return g(aa, bb) === 1 && u !== bb && part !== NN && part !== aa && part !== bb && NN !== aa && NN !== bb;
      },
      level === 1 ? [12, 1, 3] : level === 2 ? [15, 2, 3] : [24, 3, 4],
    );
    return t172(N, a, b, level === 3);
  },
};

// ── T17-3 남포역에서 내린 사람 (문장) — 1~3단계 ──
function t173(N, a, b, askLeft) {
  const u = N / b;
  const off = a * u;
  const f = fr(a, b);
  const ans = askLeft ? N - off : off;
  const bl = blankOf(ans);
  return {
    text: ['어느 날 남포역에서 한 칸의 승객 ', V(N), '명 중 ', n(f), '만큼이 내렸어요. ', askLeft ? '칸에 남은 사람은 몇 명이에요?' : '내린 사람은 몇 명이에요?'],
    figure: null,
    input: { kind: 'number', unit: '명' },
    answer: ans,
    discriminators: uniq(
      [
        ...(askLeft ? [{ value: off, category: '읽기', kind: 'check', feedback: '무엇을 물었는지 다시 볼까요?' }] : []),
        ...(a > 1 ? [{ value: u, category: '식', kind: 'nudge', feedbackCheck: `${f}만큼을 다시 볼까요?`, feedback: `${fr(1, b)}이 ${u}명이면 ${eun(f)}요?` }] : []),
        { value: b, category: '개념', kind: 'check', feedback: '한 묶음에 몇 명인지 다시 볼까요?' },
      ],
      ans,
    ),
    hints: [`한 칸에 ${N}명이 있었고, 그 ${f}만큼이 내렸어요. ${askLeft ? '칸에 남은 사람 수' : '내린 사람 수'}를 물어요.`, `${N}명을 똑같이 ${b}묶음으로 나눠 볼까요? 내린 사람은 그중 ${a}묶음이에요.`, askLeft ? `내린 사람은 ${off}명이에요.` : `${b}묶음 중 ${a}묶음이에요.`, askLeft ? `${N} − ${off} = ${bl.blank}` : `${N}명의 ${f}: ${bl.blank}명`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${N}명을 ${b}묶음으로 나누면 한 묶음이 ${u}명이고, 내린 사람은 ${u} × ${a} = ${off}명이에요.`, askLeft ? `남은 사람은 ${N} − ${off} = ${ans}명이에요.` : `${N}명의 ${eun(f)} ${off}명이에요.`, `그래서 답은 ${ans}명이에요.`],
      alt: [askLeft ? `남은 사람은 ${fr(b - a, b)}만큼이라 ${u} × ${b - a} = ${ans}명이에요.` : `${N} ÷ ${b} × ${a} = ${ro(off)} 구해도 같아요.`, `두 풀이 모두 ${ans}명이에요.`],
    },
  };
}

const T17_3 = {
  id: 'T17-3',
  node: 'N17',
  title: '남포역에서 내린 사람',
  repr: '문장',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const [N, a, b] = draw(
      rng,
      () => {
        const bb = rng.int(3, 6);
        const aa = level === 1 ? 1 : rng.int(2, bb - 1);
        return [bb * rng.int(4, 12), aa, bb];
      },
      ([NN, aa, bb]) => {
        const u = NN / bb;
        const ans = level === 3 ? NN - aa * u : aa * u;
        const g = (x, y) => (y === 0 ? x : g(y, x % y));
        return ans !== NN && ans !== bb && u !== bb && ans !== aa && (level < 3 || ans !== aa * u) && g(aa, bb) === 1;
      },
      level === 1 ? [30, 1, 5] : level === 2 ? [36, 3, 4] : [40, 3, 5],
    );
    return t173(N, a, b, level === 3);
  },
};

// ── 급행 통과 진단 ──
const D1 = {
  id: 'N17-D1',
  node: 'N17',
  title: '급행 진단: 8량의 3/4',
  repr: '그림',
  minLevel: 2,
  maxLevel: 2,
  diagnostic: true,
  generate() {
    return { ...t171Level2(8, 3, 4), hints: [], blank: null };
  },
};
const D2 = {
  id: 'N17-D2',
  node: 'N17',
  title: '급행 진단: 40역의 1/2과 남포',
  repr: '그림',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...t171Level3(1, 2), hints: [], blank: null };
  },
};
const D3 = {
  id: 'N17-D3',
  node: 'N17',
  title: '급행 진단(예비): 2/5가 24명',
  repr: '그림',
  minLevel: 4,
  maxLevel: 4,
  diagnostic: true,
  generate() {
    return { ...t171Level4(2, 5, 12), hints: [], blank: null };
  },
};

export default [T17_1, T17_2, T17_3, D1, D2, D3];
