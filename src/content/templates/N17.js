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

// ── T17-1 8칸과 40역의 분수만큼 (그림 → 문장) — 1~6단계 ──

/** 힌트 ③(묶음이 하나뿐일 때): 한 묶음의 수가 곧 빈칸 값이라, 첫 번 나눠 놓기의 결과만 말한다(0.9절). */
const dealHint = (total, b, each, unitWord) => `${b}묶음에 ${each}${unitWord}씩 놓으면 ${total - b * each}${unitWord}${unitWord ? '이' : jo(total - b * each, '이', '가')} 남아요.`;

/** 1단계: 8칸의 1/k(칸 색칠) */
function t171Level1(k) {
  const ans = 8 / k;
  return {
    text: [L1(), '호선 열차는 ', CARS(), '칸이에요. 열차의 ', n(fr(1, k)), '만큼 칸을 색칠해요. 몇 칸이에요?'],
    figure: { kind: 'train', cars: 8, paint: true },
    input: { kind: 'paint', cells: 8 },
    answer: ans,
    discriminators: uniq([{ value: k, category: '개념', kind: 'check', feedback: `${k}칸은 8칸의 얼마만큼일까요?` }], ans),
    hints: [`구하는 것: 열차의 ${fr(1, k)}만큼인 칸 수 / 알고 있는 것: 열차는 8칸`, `8칸을 똑같이 ${k}묶음으로 나눠 볼까요? 그중 1묶음이 ${fr(1, k)}이에요.`, dealHint(8, k, 1, '칸'), `${k} × ☐ = 8`],
    blank: `${k} × ☐ = 8`,
    blankAnswer: String(ans),
    blankThen: '칸을 색칠해요.',
    explain: {
      why: [`8칸을 똑같이 ${k}묶음으로 나누면 한 묶음이 ${ans}칸이에요.`, `${fr(1, k)}${jo(1, '은', '는')} 그중 1묶음이에요.`, `그래서 열차의 ${fr(1, k)}만큼은 ${ans}칸이에요.`],
      alt: [`8 ÷ ${k} = ${ro(ans)} 구해도 돼요.`, `어느 길로 해도 답은 ${ans}칸이에요.`],
    },
  };
}

/** 2단계: 진분수만큼 */
function t171Level2(total, a, b) {
  const u = total / b;
  const ans = u * a;
  const f = fr(a, b);
  const bl = blankOf(ans);
  const head = total === 8 ? [L1(), '호선 열차는 ', CARS(), '칸이에요. '] : [L1(), '호선 ', CARS(), '칸 열차 두 대는 모두 ', n(16), '칸이에요. '];
  return {
    text: [...head, n(total), '칸의 ', n(f), jo(f, '은', '는'), ' 몇 칸이에요?'],
    figure: total === 8 ? { kind: 'train', cars: 8 } : { kind: 'trains', trains: [{ name: '', cars: 8 }, { name: '', cars: 8 }], coupled: true },
    input: { kind: 'number', unit: '칸' },
    answer: ans,
    discriminators: uniq(
      [
        { value: u, category: '식', kind: 'nudge', feedbackCheck: `${f}만큼을 다시 볼까요?`, feedback: `${fr(1, b)}이 ${u}칸이면 ${eun(f)}요?` },
        { value: a, category: '개념', kind: 'nudge', feedbackCheck: `${a}칸은 ${total}칸의 얼마만큼일까요?`, feedback: `${total}칸을 ${b}묶음으로 나눠 볼까요?` },
        { value: total * a, category: '식', kind: 'check', feedback: `${total}칸보다 많아질까요?` },
      ],
      ans,
    ),
    hints: [`구하는 것: ${total}칸의 ${f}만큼인 칸 수 / 알고 있는 것: ${total === 8 ? '열차 한 대는 8칸' : '열차 두 대는 모두 16칸'}`, `${total}칸을 똑같이 ${b}묶음으로 나눠 볼까요? 그중 ${a}묶음이 ${f}${jo(f, '이에요', '예요')}.`, `한 묶음은 ${u}칸이에요.`, `${u}칸씩 ${a}묶음: ${bl.blank}칸`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${total}칸을 똑같이 ${b}묶음으로 나누면 한 묶음이 ${u}칸이에요.`, `${eun(f)} 그중 ${a}묶음이라 ${u} × ${a} = ${ans}칸이에요.`, `그래서 ${total}칸의 ${eun(f)} ${ans}칸이에요.`],
      alt: [`${total}칸의 ${fr(1, b)}이 ${u}칸이니 ${eun(fr(b, b))} ${total}칸이에요. ${eun(f)} ${total}칸에서 ${fr(b - a, b)}만큼인 ${u * (b - a)}칸을 뺀 ${ans}칸이에요.`, `어느 길로 해도 답은 ${ans}칸이에요.`],
    },
  };
}

/** 3단계: 40역의 분수만큼과 남포까지 17역 비교 */
function t171Level3(a, b) {
  const u = 40 / b;
  const part = u * a;
  const f = fr(a, b);
  const cmp = 17 > part ? '많아요' : '적어요';
  const answer = { part, cmp };
  const bl = blankOf(part);
  const discs = [{ key: 'cmp', value: cmp === '많아요' ? '적어요' : '많아요', category: '개념', kind: 'check', feedback: '두 수를 다시 비교해 볼까요?' }];
  if (a > 1) discs.push({ key: 'part', value: u, category: '식', kind: 'nudge', feedbackCheck: `${f}만큼을 다시 볼까요?`, feedback: `${fr(1, b)}이 ${u}역이면 ${eun(f)}요?` });
  const q = Math.floor(17 / u);
  const r = 17 % u;
  return {
    text: [L1(), '호선 ', FORTY(), '역 중 다대포해수욕장부터 남포까지는 ', NAMPO(), '역이에요. 이 역 수는 ', FORTY(), '역의 ', n(f), '보다 많아요, 적어요?'],
    figure: { kind: 'stations', stations: ['다대포해수욕장', '…', '남포', '…', '노포'] },
    input: { kind: 'compound', fields: [{ key: 'part', label: `40역의 ${f}` }, { key: 'cmp', label: '남포까지는', options: ['많아요', '적어요'] }] },
    answer,
    discriminators: uniqK(discs, answer),
    hints: [`구하는 것: 남포까지의 17역이 40역의 ${f}보다 많은지 적은지 / 알고 있는 것: 1호선 40역, 다대포해수욕장부터 남포까지 17역`, `40역을 똑같이 ${b}묶음으로 나눠 볼까요? 그중 ${a}묶음을 구해요.`, a === 1 ? dealHint(40, b, 5, '역') : `한 묶음은 ${u}역이에요.`, `40역의 ${f}: ${bl.blank}역`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '남포까지는 많아요, 적어요?',
    explain: {
      why: [
        ...(a === 1 ? [`40역을 ${b}묶음으로 나누면 한 묶음이 ${u}역이라 ${eun(f)} ${part}역이에요.`] : [`40역을 ${b}묶음으로 나누면 한 묶음이 ${u}역이에요.`, `${eun(f)} ${a}묶음이라 ${u} × ${a} = ${part}역이에요.`]),
        `17역은 ${part}역보다 ${cmp}.`,
        `그래서 남포까지는 40역의 ${f}보다 ${cmp}.`,
      ],
      alt: [
        a === 1
          ? `17역이 ${b}개면 ${17 * b}역으로 40역보다 ${17 * b > 40 ? '많아요' : '적어요'}. 그래서 17역은 40역의 ${f}보다 ${cmp}.`
          : `17역 안에 ${u}역이 ${q}번 들어가${r ? `고 ${r}역이 남아요` : '요'}. 그래서 17역은 40역의 ${f}보다 ${cmp}.`,
        `어느 길로 해도 답은 '${cmp}'예요.`,
      ],
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
    text: ['남포역에서 한 칸의 승객 중 ', n(f), '인 ', V(part), '명이 내렸어요. 처음에 그 칸에는 몇 명이 있었어요?'],
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
    hints: [`구하는 것: 처음에 그 칸에 있던 승객 수 / 알고 있는 것: 내린 사람 ${part}명은 그 칸 승객의 ${f}`, `승객을 ${b}묶음으로 나누면 ${part}명은 그중 ${a}묶음이에요. 한 묶음은 몇 명일까요?`, `한 묶음은 ${part} ÷ ${a} = ${u}명이에요.`, `${u}명씩 ${b}묶음: ${bl.blank}명`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${part}명이 ${b}묶음 중 ${a}묶음이니 한 묶음은 ${u}명이에요.`, `전체는 ${b}묶음이라 ${u} × ${b} = ${total}명이에요.`, `확인해 보면 ${total}명의 ${eun(f)} ${u} × ${a} = ${part}명이에요.`, `그래서 처음에 그 칸에는 ${total}명이 있었어요.`],
      alt: [],
    },
  };
}

/** 5단계: 40역의 □/b가 T역보다 적은 □ */
function t171Level5(b, T) {
  const unit = 40 / b;
  const answer = [];
  for (let k = 1; k < b; k++) if (unit * k < T) answer.push(k);
  const k = answer.at(-1);
  const next = unit * (k + 1);
  const options = Array.from({ length: b - 1 }, (_, i) => i + 1);
  const discs = [];
  if (T % unit === 0 && T / unit < b) discs.push({ value: [...answer, T / unit], category: '개념', kind: 'check', feedback: `40역의 ${fr(T / unit, b)}${jo(T / unit, '은', '는')} ${T}역보다 적나요?` });
  if (answer.length >= 2) discs.push({ value: answer.slice(0, -1), category: '개념', kind: 'nudge', feedbackCheck: '빠진 것이 없나요?', feedback: `40역의 ${fr(k, b)}도 계산해 봤나요?` });
  return {
    text: [L1(), '호선 ', FORTY(), '역의 ', unknown(`□/${b}`), jo(1, '이', '이'), ' ', n(T), '역보다 적어요. □에 들어갈 수 있는 수를 모두 골라요.'],
    figure: null,
    input: { kind: 'multi', options },
    answer,
    discriminators: uniq(discs, answer),
    grade: multiGrade(answer, discs),
    hints: [`구하는 것: 40역의 □/${b}이 ${T}역보다 적게 되는 □ 모두 / 알고 있는 것: 1호선 40역`, `40역의 ${fr(1, b)}부터 구해 볼까요? □가 하나 커질 때마다 얼마씩 늘어나는지 봐요.`, `40역의 ${eun(fr(1, b))} ${unit}역이에요.`, '1부터 ☐까지'],
    blank: '1부터 ☐까지',
    blankAnswer: String(k),
    explain: {
      why: [
        `40역의 ${eun(fr(1, b))} ${unit}역이라 40역의 □/${b}${jo(1, '은', '은')} ${unit} × □역이에요.`,
        `${unit} × ${k} = ${ro(unit * k)} ${T}보다 적어요. ${unit} × ${k + 1} = ${next > T ? `${eun(next)} ${T}보다 많아요` : `${eun(next)} ${wa(T)} 같아요`}.`,
        `그래서 □는 1부터 ${k}까지예요.`,
      ],
      alt: [`□에 1부터 차례로 넣어 40역의 □/${b}${jo(1, '을', '을')} 적어 봐도 돼요.`, `어느 길로 해도 답은 1부터 ${k}까지예요.`],
    },
  };
}

/** 6단계: 40역의 분수만큼과 남포까지 17역, 어느 쪽이 몇 역 더 많은지 */
function t171Level6(a, b) {
  const u = 40 / b;
  const part = u * a;
  const f = fr(a, b);
  const optA = `40역의 ${f}`;
  const more = part > 17 ? optA : '남포까지';
  const diff = Math.abs(part - 17);
  const answer = { part, more, diff };
  const bl = blankOf(part);
  const discs = [{ key: 'more', value: more === optA ? '남포까지' : optA, category: '개념', kind: 'check', feedback: '두 수를 다시 비교해 볼까요?' }];
  if (a > 1) discs.push({ key: 'part', value: u, category: '식', kind: 'nudge', feedbackCheck: `${f}만큼을 다시 볼까요?`, feedback: `${fr(1, b)}이 ${u}역이면 ${eun(f)}요?` });
  return {
    text: [L1(), '호선 ', FORTY(), '역의 ', n(f), jo(f, '과', '와'), ' 다대포해수욕장부터 남포까지의 ', NAMPO(), '역 중 어느 쪽이 몇 역 더 많아요?'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'part', label: optA }, { key: 'more', label: '더 많은 쪽', options: [optA, '남포까지'] }, { key: 'diff', label: '몇 역 더' }] },
    answer,
    discriminators: uniqK(discs, answer),
    hints: [`구하는 것: 어느 쪽이 몇 역 더 많은지 / 알고 있는 것: 40역의 ${f}, 다대포해수욕장부터 남포까지 17역`, `40역의 ${f}부터 구해 볼까요? 40역을 똑같이 ${b}묶음으로 나눠요.`, a === 1 ? dealHint(40, b, 5, '역') : `40역의 ${eun(fr(1, b))} ${u}역이에요.`, `40역의 ${f}: ${bl.blank}역`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '어느 쪽이 몇 역 더 많아요?',
    explain: {
      why: [
        a === 1 ? `40역을 ${b}묶음으로 나누면 한 묶음이 ${u}역이라 40역의 ${eun(f)} ${part}역이에요.` : `40역의 ${eun(fr(1, b))} ${u}역이라 ${eun(f)} ${u} × ${a} = ${part}역이에요.`,
        `${part}역과 17역의 차는 ${diff}역이에요.`,
        `그래서 ${more === optA ? `40역의 ${f}${jo(f, '이', '가')}` : '남포까지의 역 수가'} ${diff}역 더 많아요.`,
      ],
      alt: ['수직선에 두 수를 찍어 사이를 세어도 돼요.', `어느 길로 해도 차는 ${diff}역이에요.`],
    },
  };
}

const T17_1 = {
  id: 'T17-1',
  node: 'N17',
  title: '8칸과 40역의 분수만큼',
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
      hints: [`구하는 것: 어떤 수 □ / 알고 있는 것: □의 ${f}${jo(f, '이', '가')} ${part}`, `${eun(part)} ${b}묶음 중 ${a}묶음이에요. 한 묶음은 얼마일까요?`, `한 묶음은 ${part} ÷ ${a} = ${ieyo(u)}.`, `${u} × ${b} = ${bl.blank}`],
      blank: bl.blank,
      blankAnswer: bl.blankAnswer,
      explain: {
        why: [`${eun(part)} □를 ${b}묶음으로 나눈 것 중 ${a}묶음이에요.`, `한 묶음은 ${u}, 전체 ${b}묶음은 ${u} × ${b} = ${ieyo(N)}.`, `확인해 보면 ${N}의 ${eun(f)} ${ieyo(part)}.`, `그래서 □는 ${ieyo(N)}.`],
        alt: [],
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
        { value: N * a, category: '식', kind: 'check', feedback: a === 1 ? `${eun(N)} 전체예요. ${fr(1, b)}은 얼마일까요?` : `${N}보다 커질까요?` },
      ],
      part,
    ),
    hints: [`구하는 것: ${N}의 ${f}만큼은 얼마인지 / 알고 있는 것: 전체 ${N}`, `${eul(N)} 똑같이 ${b}묶음으로 나눠 볼까요? 그중 ${a}묶음이 ${f}${jo(f, '이에요', '예요')}.`, a === 1 ? dealHint(N, b, 1, '') : `한 묶음은 ${ieyo(u)}.`, a === 1 ? `${b} × ☐ = ${N}` : `${u} × ${a} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${eul(N)} ${b}묶음으로 나누면 한 묶음이 ${ieyo(u)}.`, a === 1 ? `${eun(f)} 그중 1묶음이에요.` : `${eun(f)} ${a}묶음이라 ${u} × ${a} = ${ieyo(part)}.`, `그래서 □는 ${ieyo(part)}.`],
      alt: [a === 1 ? `${N} ÷ ${b} = ${ro(u)} 구해도 같아요.` : `${N} ÷ ${b} = ${u}, ${u} × ${a} = ${ro(part)} 구해도 같아요.`, `어느 길로 해도 답은 ${ieyo(part)}.`],
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
// 문장 시작을 씨앗값 숫자에 따라 고른다(난수를 더 뽑지 않는다). "어느 날"만 되풀이하지 않게.
const T173_START = ['주말에 ', '오후에 ', '저녁에 '];
function t173(N, a, b, askLeft) {
  const u = N / b;
  const off = a * u;
  const f = fr(a, b);
  const ans = askLeft ? N - off : off;
  const bl = blankOf(ans);
  return {
    text: [T173_START[(u + a) % 3], '남포역에서 한 칸의 승객 ', V(N), '명 중 ', n(f), jo(f, '이', '가'), ' 내렸어요. ', askLeft ? '칸에 남은 사람은 몇 명이에요?' : '내린 사람은 몇 명이에요?'],
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
    hints: [`구하는 것: ${askLeft ? '칸에 남은 사람 수' : '내린 사람 수'} / 알고 있는 것: 한 칸에 ${N}명, 그중 ${f}만큼 내림`, `${N}명을 똑같이 ${b}묶음으로 나눠 볼까요? 내린 사람은 그중 ${a}묶음이에요.`, askLeft ? `내린 사람은 ${off}명이에요.` : a === 1 ? dealHint(N, b, 1, '명') : `한 묶음은 ${u}명이에요.`, askLeft ? `${N} − ${off} = ${bl.blank}` : `${N}명의 ${f}: ${bl.blank}명`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [
        `${N}명을 ${b}묶음으로 나누면 한 묶음이 ${u}명이에요.`,
        a === 1 ? `내린 사람은 1묶음이라 ${off}명이에요.` : `내린 사람은 ${a}묶음이라 ${u} × ${a} = ${off}명이에요.`,
        ...(askLeft ? [`남은 사람은 ${N} − ${off} = ${ans}명이에요.`] : []),
        askLeft ? `그래서 칸에 남은 사람은 ${ans}명이에요.` : `그래서 내린 사람은 ${ans}명이에요.`,
      ],
      alt: [
        askLeft
          ? b - a === 1
            ? `남은 사람은 ${fr(1, b)}만큼, 곧 한 묶음이라 ${ans}명이에요.`
            : `남은 사람은 ${fr(b - a, b)}만큼이라 ${u} × ${b - a} = ${ans}명이에요.`
          : a === 1
            ? `${N} ÷ ${b} = ${ro(off)} 구해도 같아요.`
            : `${N} ÷ ${b} = ${u}, ${u} × ${a} = ${ro(off)} 구해도 같아요.`,
        `어느 길로 해도 답은 ${ans}명이에요.`,
      ],
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
  title: '급행 진단: 8칸의 3/4',
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
