// N20 초량 — 10000 이상의 큰 수: 자릿값, 읽고 쓰기 [4수01-01]. 천장 7.
// 기준: docs/curriculum/08-line1-templates-11-20.md 20절(지하철 하루 87만 3천 명, 1년 3억 1,877만 명 — FACTS ✅), 09 끝 보강 후보(그림: 수직선 뛰어 세기). 반올림은 쓰지 않는다.
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
// 숫자 입력 칸은 8자리까지라 아홉 자리 수(318770000)를 쓰는 2단계는 바르게 쓴 수 고르기로 바꿨다.

const SRC_RIDE = 'FACTS: 부산 지하철 2025년 하루 평균 87만 3천 명, 1년 3억 1,877만 명, 2024년 하루 평균 86만 2천 명(1~4호선, 부산교통공사 운영실적, 2026-10-04 확인)';
const R = (v) => n(v, { real: true, source: SRC_RIDE });
const Y = (y) => label(String(y), { source: SRC_RIDE });
const DAY = { 2025: [87, 3], 2024: [86, 2] };
const YEAR_TOTAL = 318770000;
const comma = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const PLACES = ['일의 자리', '십의 자리', '백의 자리', '천의 자리', '만의 자리', '십만의 자리', '백만의 자리', '천만의 자리', '억의 자리'];

/** 우리말 수 읽기(1억 미만은 만 단위, 그 위는 억 단위). 1은 천·백·십 앞에서 읽지 않는다. */
function korean(v) {
  const NAME = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const UNIT = ['', '십', '백', '천'];
  const BIG = ['', '만', '억', '조'];
  const group = (g) => {
    let out = '';
    const ds = String(g).padStart(4, '0').split('').map(Number);
    ds.forEach((d, i) => {
      const pos = 3 - i;
      if (d === 0) return;
      out += (d === 1 && pos > 0 ? '' : NAME[d]) + UNIT[pos];
    });
    return out;
  };
  const parts = [];
  let x = v;
  let k = 0;
  while (x > 0) {
    const g = x % 10000;
    if (g > 0) parts.unshift(group(g) + BIG[k]);
    x = Math.floor(x / 10000);
    k++;
  }
  return parts.join(' ') || '영';
}
/** 쉼표(세 자리) 묶음을 만·억 단위로 잘못 읽은 것 */
function commaWrong(v) {
  const gs = comma(v).split(',').map(Number).reverse();
  return korean(gs.reduce((acc, g, i) => acc + g * 10000 ** i, 0));
}
const split4 = (v) => {
  const s = String(v);
  const out = [];
  for (let i = s.length; i > 0; i -= 4) out.unshift(s.slice(Math.max(0, i - 4), i));
  return out;
};
const blankOf = (v) => (v >= 10 ? blankAt(v, 0) : { blank: '☐', blankAnswer: String(v) });
const manNudge = (a) => ({ category: '개념', kind: 'nudge', feedbackCheck: '만의 자리를 다시 볼까요?', feedback: `${a}만은 만이 ${a}개예요.` });

// ── T20-1 큰 수 읽고 쓰기 (빈칸) — 1~7단계 ──

/** 1단계: 하루 이용객을 숫자로 */
function t201Level1(year) {
  const [a, b] = DAY[year];
  const ans = a * 10000 + b * 1000;
  return {
    text: [Y(year), '년 부산 지하철을 하루에 평균 ', R(a), '만 ', R(b), '천 명이 탔어요. 이 수를 숫자로 써요.'],
    figure: null,
    input: { kind: 'number', unit: '명' },
    answer: ans,
    discriminators: uniq(
      [
        { value: a * 100000 + b * 1000, ...manNudge(a) },
        { value: a * 1000 + b * 100, ...manNudge(a) },
        { value: a * 100000 + b * 10000, ...manNudge(a) },
      ],
      ans,
    ),
    hints: [`${year}년 하루 이용객 ${a}만 ${b}천 명을 숫자로 쓰는 문제예요.`, `${a}만과 ${b}천을 따로 숫자로 써 볼까요?`, `만이 ${a}개인 수는 ${ieyo(a * 10000)}.`, `${a * 10000} + ${b * 1000} = ${blankAt(ans, 3).blank}`],
    blank: blankAt(ans, 3).blank,
    blankAnswer: blankAt(ans, 3).blankAnswer,
    explain: {
      why: [`${a}만은 ${a * 10000}, ${b}천은 ${ieyo(b * 1000)}.`, `둘을 합치면 ${ieyo(ans)}.`, `그래서 ${a}만 ${b}천은 ${ieyo(ans)}.`],
      alt: [`만 앞에 ${a}, 만 뒤 네 자리에 ${b}000을 써도 ${ieyo(ans)}.`, `두 풀이 모두 ${ieyo(ans)}.`],
    },
  };
}

/** 2단계: 1년 이용객을 숫자로(바르게 쓴 수 고르기) */
function t201Level2(order) {
  const ans = String(YEAR_TOTAL);
  const pool = { ok: ans, short: '31877000', long: '3187700000', gap: '318077000' };
  const options = order.map((k) => pool[k]);
  return {
    text: [Y(2025), '년 한 해 동안 부산 지하철을 탄 사람은 ', R(3), '억 ', R('1,877'), '만 명이에요. 이 수를 숫자로 바르게 쓴 것을 골라요.'],
    figure: null,
    input: { kind: 'choice', options },
    answer: ans,
    discriminators: [
      { value: pool.short, category: '개념', kind: 'check', feedback: '3억은 몇 자리 수일까요?' },
      { value: pool.long, category: '개념', kind: 'check', feedback: '3억은 몇 자리 수일까요?' },
      { value: pool.gap, category: '개념', kind: 'check', feedback: '만 앞의 네 자리를 다시 볼까요?' },
    ],
    hints: ['3억 1,877만을 숫자로 바르게 쓴 것을 물어요.', '억, 만, 일의 묶음이 네 자리씩이에요. 묶음마다 칸을 채워 볼까요?', '1억은 1 뒤에 0이 8개인 수예요.', '3억 1877만은 모두 ☐자리 수'],
    blank: '모두 ☐자리 수',
    blankAnswer: '9',
    blankThen: '바르게 쓴 수를 골라요.',
    explain: {
      why: ['억 자리에 3, 만 앞 네 자리에 1877, 만 뒤 네 자리에 0000을 써요.', '3 | 1877 | 0000을 이어 쓰면 318770000이에요.', '그래서 바르게 쓴 수는 318770000이에요.'],
      alt: ['300000000 + 18770000 = 318770000으로 생각해도 돼요.', '두 풀이 모두 318770000이에요.'],
    },
  };
}

/** 3단계: 숫자의 자리와 값 */
function t201Level3(X, pos) {
  const d = Math.floor(X / 10 ** pos) % 10;
  const value = d * 10 ** pos;
  const place = PLACES[pos];
  const options = [PLACES[pos + 1], place, PLACES[pos - 1], PLACES[pos - 2]].filter(Boolean);
  const answer = { place, value };
  return {
    text: [R(comma(X)), '에서 숫자 ', n(d), jo(d, '은', '는'), ' 어느 자리이고, 얼마를 나타내요?'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'place', label: '자리', options }, { key: 'value', label: '나타내는 값' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'place', value: PLACES[pos + 1], category: '개념', kind: 'check', feedback: `숫자 ${d}의 자리를 다시 볼까요?` },
        { key: 'place', value: PLACES[pos - 1], category: '개념', kind: 'check', feedback: `숫자 ${d}의 자리를 다시 볼까요?` },
        { key: 'value', value: d, category: '개념', kind: 'check', feedback: `숫자 ${d}${jo(d, '이', '가')} 나타내는 값을 물었어요.` },
        { key: 'value', value: value * 10, category: '개념', kind: 'check', feedback: '0의 개수를 다시 볼까요?' },
        { key: 'value', value: value / 10, category: '개념', kind: 'check', feedback: '0의 개수를 다시 볼까요?' },
      ].filter((x) => x.value !== undefined),
      answer,
    ),
    hints: [`${comma(X)}에서 숫자 ${d}의 자리와 그 값을 물어요.`, '오른쪽 끝 일의 자리부터 자리 이름을 차례로 붙여 볼까요?', '일, 십, 백, 천, 만, 십만, 백만, 천만, 억의 자리 순서예요.', `숫자 ${d}${jo(d, '은', '는')} 오른쪽에서 ☐번째 자리`],
    blank: '☐번째 자리',
    blankAnswer: String(pos + 1),
    blankThen: '자리와 값을 써요.',
    explain: {
      why: [`숫자 ${d}${jo(d, '은', '는')} 오른쪽에서 ${pos + 1}번째, ${jw(place, '이에요', '예요')}.`, `${place}의 ${d}${jo(d, '은', '는')} ${ieyo(value)}.`, `그래서 ${place}, ${ieyo(value)}.`],
      alt: [`네 자리씩 끊으면 ${split4(X).join(' | ')}, 끊은 곳을 만·억으로 읽어서 자리를 찾아도 돼요.`, `두 풀이 모두 ${place}, ${ieyo(value)}.`],
    },
  };
}

/** 4단계: 단위 개수 → 수, 어느 이용객인지 */
function t201Level4(variant) {
  const [a, b] = variant === 'A' ? DAY[2025] : DAY[variant];
  const ans = a * 10000 + b * 1000;
  const options = variant === 'A' ? ['하루 이용객', '1년 이용객'] : ['2024년 하루 이용객', '2025년 하루 이용객'];
  const what = variant === 'A' ? '하루 이용객' : `${variant}년 하루 이용객`;
  const answer = { num: ans, what };
  const lead = variant === 'A' ? [Y(2025), '년 부산 지하철 이용객은 하루 평균 ', R(87), '만 ', R(3), '천 명, ', n(1), '년 ', R(3), '억 ', R('1,877'), '만 명이에요. '] : ['부산 지하철 하루 평균 이용객은 ', Y(2024), '년 ', R(86), '만 ', R(2), '천 명, ', Y(2025), '년 ', R(87), '만 ', R(3), '천 명이에요. '];
  const bl = blankAt(ans, 3);
  return {
    text: [...lead, n(10000), '이 ', n(a), '개, ', n(1000), '이 ', n(b), '개인 수는 얼마이고, 이 수와 같은 것은 무엇이에요?'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'num', label: '수' }, { key: 'what', label: '같은 것', options }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'num', value: a * 100000 + b * 1000, ...manNudge(a) },
        { key: 'num', value: a * 1000 + b * 100, ...manNudge(a) },
        { key: 'what', value: options.find((o) => o !== what), category: '개념', kind: 'check', feedback: '구한 수와 이용객 수를 다시 견주어 볼까요?' },
      ],
      answer,
    ),
    hints: [`10000이 ${a}개, 1000이 ${b}개인 수와, 그 수가 어느 이용객 수와 같은지 물어요.`, '10000이 몇 개인 수와 1000이 몇 개인 수를 따로 구해 볼까요?', `10000이 ${a}개면 ${ieyo(a * 10000)}.`, `${a * 10000} + ${b * 1000} = ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '같은 것을 골라요.',
    explain: {
      why: [`10000이 ${a}개면 ${a}만, 1000이 ${b}개면 ${b}천이에요.`, `${a}만 ${b}천은 ${ieyo(ans)}.`, `그래서 수는 ${ans}, ${what}${jw(what, '과', '와').slice(what.length)} 같아요.`],
      alt: [`${a * 10000} + ${b * 1000} = ${ieyo(ans)}.`, `두 풀이 모두 ${ieyo(ans)}.`],
    },
  };
}

/** 5단계: 우리말로 쓴 수 → 숫자(0이 여러 군데) */
function t201Level5(M, L) {
  const ans = M * 10000 + L;
  const kor = korean(ans);
  const korM = korean(M);
  const korL = korean(L);
  const s = String(ans);
  const idx = String(M).length;
  const blank = `${s.slice(0, idx)}☐${s.slice(idx + 1)}`;
  return {
    text: [`"${kor}"${bat(kor) ? '을' : '를'} 숫자로 써요.`],
    figure: null,
    input: { kind: 'number' },
    answer: ans,
    discriminators: uniq(
      [
        { value: M * 1000 + L, category: '개념', kind: 'nudge', feedbackCheck: '만 뒤의 자리 수를 다시 볼까요?', feedback: '만 뒤에 네 칸을 채웠나요?' },
        { value: M * 100000 + L, category: '개념', kind: 'nudge', feedbackCheck: '만 뒤의 자리 수를 다시 볼까요?', feedback: '만 뒤에 네 칸을 채웠나요?' },
      ],
      ans,
    ),
    hints: [`"${kor}"${bat(kor) ? '을' : '를'} 숫자로 쓰는 문제예요.`, `만 앞(${korM})과 만 뒤(${korL})를 나눠서 자리 칸에 넣어 볼까요?`, '만 뒤는 네 자리를 다 채워야 해요.', blank],
    blank,
    blankAnswer: s[idx],
    explain: {
      why: ['우리말 큰 수는 네 자리씩 끊어요.', `${korM}만은 ${M} 다음에 네 자리가 오고, ${korL}${bat(korL) ? '은' : '는'} 그 네 자리에 ${String(L).padStart(4, '0')}${roOnly(L)} 들어가요.`, `그래서 ${ieyo(ans)}.`],
      alt: [`${M * 10000} + ${L} = ${ro(ans)} 생각해도 같아요.`, `두 풀이 모두 ${ieyo(ans)}.`],
    },
  };
}

/** 6단계: 쉼표 수를 우리말로 읽기 */
function t201Level6(X, order) {
  const pool = { ok: korean(X), comma: commaWrong(X), big: korean(X * 10), small: korean(X / 10) };
  if (pool.big === pool.comma) pool.big = korean(X * 100);
  if (pool.small === pool.comma) pool.small = korean(X / 100);
  const options = order.map((k) => pool[k]);
  const groups = split4(X);
  return {
    text: [R(comma(X)), '을 소리 내어 읽은 것을 골라요.'],
    figure: null,
    input: { kind: 'choice', options },
    answer: pool.ok,
    discriminators: [
      { value: pool.comma, category: '개념', kind: 'nudge', feedbackCheck: '어디서 끊어 읽었는지 다시 볼까요?', feedback: '우리말은 네 자리씩 끊어 읽어요.' },
      { value: pool.big, category: '개념', kind: 'check', feedback: '자리 수를 다시 세어 볼까요?' },
      { value: pool.small, category: '개념', kind: 'check', feedback: '자리 수를 다시 세어 볼까요?' },
    ],
    hints: [`${comma(X)}을 바르게 읽은 것을 물어요.`, '쉼표 말고, 오른쪽부터 네 자리씩 끊어 볼까요? 끊은 곳에 만, 억을 붙여요.', `${comma(X)}${jo(0, '은', '은')} ${String(X).length}자리 수예요.`, '네 자리씩 끊은 묶음: 모두 ☐개'],
    blank: '모두 ☐개',
    blankAnswer: String(groups.length),
    blankThen: '바르게 읽은 것을 골라요.',
    explain: {
      why: [`쉼표는 세 자리마다, 우리말은 네 자리마다 끊어요.`, `네 자리씩 끊으면 ${groups.join(' | ')}이라 ${pool.ok}${bat(pool.ok) ? '이라고' : '라고'} 읽어요.`, `그래서 답은 "${pool.ok}"예요.`],
      alt: [`쉼표대로 끊어 읽으면 "${pool.comma}"처럼 틀려요.`, `두 풀이 모두 "${pool.ok}"예요.`],
    },
  };
}

/** 7단계(도전): 숫자 카드로 조건에 맞는 가장 작은 일곱 자리 수 */
function t201Level7(cards, D) {
  const rest = [...cards];
  rest.splice(rest.indexOf(D), 1);
  rest.sort((x, y) => x - y);
  const ans = Number(`${D}${rest.join('')}`);
  const nz = [...cards].filter((c) => c > 0).sort((x, y) => x - y);
  const minAll = (() => {
    const r = [...cards];
    r.splice(r.indexOf(nz[0]), 1);
    return Number(`${nz[0]}${r.sort((x, y) => x - y).join('')}`);
  })();
  const maxD = Number(`${D}${[...rest].sort((x, y) => y - x).join('')}`);
  const firstNz = rest.find((c) => c > 0);
  const text = ['숫자 카드 '];
  cards.forEach((c, i) => {
    text.push(n(c));
    text.push(i < cards.length - 1 ? ', ' : jo(c, '을', '를'));
  });
  text.push(' 한 번씩 써서 일곱 자리 수를 만들어요. 백만의 자리가 ', n(D), '인 가장 작은 수는 얼마예요?');
  return {
    text,
    figure: { kind: 'cards', cards },
    challenge: true,
    input: { kind: 'number' },
    answer: ans,
    discriminators: uniq(
      [
        { value: minAll, category: '읽기', kind: 'check', feedback: '백만의 자리 조건을 다시 볼까요?' },
        { value: maxD, category: '읽기', kind: 'check', feedback: '가장 작은 수를 물었어요.' },
      ],
      ans,
    ),
    hints: [`카드 일곱 장으로 백만의 자리가 ${D}인 일곱 자리 수 중 가장 작은 수를 물어요.`, `백만의 자리에 ${D}${jo(D, '을', '를')} 놓고, 남은 자리는 높은 자리부터 작은 숫자를 놓아 볼까요?`, `남은 카드는 ${rest.join(', ')}${jo(rest.at(-1), '이에요', '예요')}.`, `${D}00 다음에 오는 숫자: ☐`],
    blank: '다음에 오는 숫자: ☐',
    blankAnswer: String(firstNz),
    blankThen: '가장 작은 수를 써요.',
    explain: {
      why: [`백만의 자리에 ${D}${jo(D, '을', '를')} 놓아요.`, `남은 ${rest.join(', ')}${jo(rest.at(-1), '을', '를')} 작은 것부터 높은 자리에 놓으면 가장 작아요(0도 앞자리에 놓을 수 있어요).`, `그래서 가장 작은 수는 ${ieyo(ans)}.`],
      alt: [`가장 큰 수는 ${maxD}, 조건 없이 가장 작은 수는 ${ieyo(minAll)}. 조건을 지키면 ${ieyo(ans)}.`, `어느 길로 해도 답은 ${ro(ans)} 같아요.`],
    },
  };
}

const T20_1 = {
  id: 'T20-1',
  node: 'N20',
  title: '큰 수 읽고 쓰기',
  repr: '빈칸',
  minLevel: 1,
  maxLevel: 7,
  generate(rng, level) {
    if (level === 1) return t201Level1(rng.pick([2025, 2024]));
    if (level === 2) return t201Level2(rng.shuffle(['ok', 'short', 'long', 'gap']));
    if (level === 3) return t201Level3(...rng.pick([[YEAR_TOTAL, 7], [YEAR_TOTAL, 6], [873000, 5], [873000, 4], [873000, 3], [862000, 5], [862000, 4], [862000, 3]]));
    if (level === 4) return t201Level4(rng.pick(['A', 2024, 2025]));
    if (level === 5) {
      const [M, L] = draw(
        rng,
        () => {
          const h = rng.int(1, 9);
          const zeroTens = rng.next() < 0.5;
          const M2 = zeroTens ? h * 100 + rng.int(1, 9) : h * 100 + rng.int(1, 9) * 10;
          const L2 = rng.pick([rng.int(1, 9) * 10, rng.int(1, 9), rng.int(1, 9) * 100, rng.int(11, 99)]);
          return [M2, L2];
        },
        ([M2, L2]) => L2 < 1000 && M2 % 100 !== 0,
        [302, 50],
      );
      return t201Level5(M, L);
    }
    if (level === 6) return t201Level6(rng.pick([YEAR_TOTAL, 873000, 862000]), rng.shuffle(['ok', 'comma', 'big', 'small']));
    const digits = rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 5);
    const D = digits.filter((x) => x !== Math.min(...digits))[rng.int(0, 3)];
    return t201Level7(rng.shuffle([0, 0, ...digits]), D);
  },
};

// ── T20-2 뉴스 속 큰 수 (문장) — 1~3단계 ──
function t202Level1(year) {
  const [a, b] = DAY[year];
  const answer = { man: a, cheon: b };
  const bl = blankAt(a, 0);
  return {
    text: [Y(year), '년 부산 지하철 하루 평균 이용객 ', R(comma(a * 10000 + b * 1000)), '명은 만 명이 몇 개, 천 명이 몇 개인 수예요?'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'man', label: '만 명' }, { key: 'cheon', label: '천 명' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'man', value: Math.floor(a / 10), category: '개념', kind: 'check', feedback: '만의 자리를 다시 볼까요?' },
        { key: 'man', value: a * 10 + b, category: '개념', kind: 'check', feedback: '만 명 묶음의 수를 다시 볼까요?' },
        { key: 'cheon', value: a * 10 + b, category: '개념', kind: 'check', feedback: '천의 자리를 다시 볼까요?' },
      ],
      answer,
    ),
    hints: [`하루 이용객 ${comma(a * 10000 + b * 1000)}명을 만 명과 천 명의 개수로 나타내는 문제예요.`, '오른쪽부터 네 자리를 끊으면 만 앞의 수가 보여요. 끊어 볼까요?', '만의 자리는 오른쪽에서 다섯 번째 자리예요.', `만 명이 ${bl.blank}개`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '천 명의 개수도 써요.',
    explain: {
      why: [`${comma(a * 10000 + b * 1000)}을 네 자리씩 끊으면 ${a} | ${b}000이에요.`, `만 앞이 ${a}, 천의 자리가 ${ieyo(b)}.`, `그래서 만 명이 ${a}개, 천 명이 ${b}개예요.`],
      alt: [`${a}만 ${b}천 명이라고 읽어도 같아요.`, `두 풀이 모두 ${a}개와 ${b}개예요.`],
    },
  };
}

function t202Level2() {
  const answer = { more: '2025년', diff: 11000 };
  return {
    text: ['부산 지하철 하루 평균 이용객은 ', Y(2024), '년 ', R(86), '만 ', R(2), '천 명, ', Y(2025), '년 ', R(87), '만 ', R(3), '천 명이에요. 어느 해가 하루에 몇 명 더 많아요?'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'more', label: '더 많은 해', options: ['2024년', '2025년'] }, { key: 'diff', label: '몇 명 더' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'more', value: '2024년', category: '개념', kind: 'check', feedback: '두 수를 다시 견주어 볼까요?' },
        { key: 'diff', value: 1100, category: '개념', kind: 'check', feedback: '만과 천의 자리를 다시 볼까요?' },
        { key: 'diff', value: 10100, category: '개념', kind: 'check', feedback: '만과 천의 자리를 다시 볼까요?' },
        { key: 'diff', value: 11, category: '개념', kind: 'check', feedback: '몇 명인지 숫자로 써 볼까요?' },
      ],
      answer,
    ),
    hints: ['2024년은 86만 2천 명, 2025년은 87만 3천 명이에요. 어느 해가 몇 명 더 많은지 물어요.', '만끼리, 천끼리 견주어 볼까요?', '만끼리는 1만, 천끼리는 1천 차이예요.', '천 명이 모두 1☐개'],
    blank: '1☐개',
    blankAnswer: '1',
    blankThen: '몇 명인지 숫자로 써요.',
    explain: {
      why: ['87만 − 86만 = 1만, 3천 − 2천 = 1천이에요.', '1만 1천은 11000이에요.', '그래서 2025년이 하루에 11000명 더 많아요.'],
      alt: ['873000 − 862000 = 11000으로 계산해도 같아요.', '두 풀이 모두 11000명이에요.'],
    },
  };
}

function t202Level3() {
  const ans = 31877;
  return {
    text: [Y(2025), '년 한 해 동안 부산 지하철을 탄 사람은 ', R(3), '억 ', R('1,877'), '만 명이에요. 이 수는 만 명이 몇 개인 수예요?'],
    figure: null,
    input: { kind: 'number', unit: '개' },
    answer: ans,
    discriminators: [
      { value: 1877, category: '개념', kind: 'nudge', feedbackCheck: '3억은 만이 몇 개일까요?', feedback: '3억 안에도 만이 들어 있어요.' },
      { value: 3187, category: '개념', kind: 'check', feedback: '자리를 다시 볼까요?' },
      { value: 318770000, category: '읽기', kind: 'check', feedback: '만 명이 몇 개인지 물었어요.' },
    ],
    hints: ['3억 1,877만 명이 만 명 몇 개인지 물어요.', '1억은 만이 몇 개일까요? 3억과 1877만을 나눠 생각해 봐요.', '1억은 만이 10000개예요.', '30000 + 1877 = 3☐877'],
    blank: '3☐877',
    blankAnswer: '1',
    explain: {
      why: ['1억은 만이 10000개라서 3억은 만이 30000개예요.', '여기에 만이 1877개 더 있어요.', '그래서 만 명이 31877개인 수예요.'],
      alt: ['318770000에서 끝의 네 자리 0000을 떼면 만의 개수 31877이 남아요.', '두 풀이 모두 31877개예요.'],
    },
  };
}

const T20_2 = {
  id: 'T20-2',
  node: 'N20',
  title: '뉴스 속 큰 수',
  repr: '문장',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 1) return t202Level1(rng.pick([2025, 2024]));
    if (level === 2) return t202Level2();
    return t202Level3();
  },
};

// ── T20-3 수직선 뛰어 세기 (그림) — 1~3단계, 09 보강 후보 ──
function t203Level1(X, k) {
  const ans = X + k * 1000;
  return {
    text: ['수직선의 양 끝은 ', n(X), jo(X, '과', '와'), ' ', n(X + 10000), '이에요. 화살표가 가리키는 수는 얼마예요?'],
    figure: { kind: 'numberline', from: X, to: X + 10000, ticks: 10, mark: ans },
    input: { kind: 'number' },
    answer: ans,
    discriminators: uniq(
      [
        { value: X + k * 100, category: '개념', kind: 'check', feedback: '눈금 한 칸은 얼마일까요?' },
        { value: X + k * 10000, category: '개념', kind: 'check', feedback: '눈금 한 칸은 얼마일까요?' },
        { value: X + k, category: '개념', kind: 'check', feedback: '눈금 한 칸은 얼마일까요?' },
      ],
      ans,
    ),
    hints: [`양 끝이 ${wa(X)} ${X + 10000}인 수직선에서 화살표가 가리키는 수를 물어요.`, '두 끝 사이가 몇 칸인지, 한 칸이 얼마인지 볼까요?', '두 끝의 차는 10000이고, 10칸으로 나뉘어 있어요.', '눈금 한 칸: ☐000'],
    blank: '☐000',
    blankAnswer: '1',
    blankThen: '화살표가 가리키는 수를 써요.',
    explain: {
      why: ['10000을 10칸으로 나누었으니 한 칸은 1000이에요.', `화살표는 ${X}에서 ${k}칸 간 곳이라 ${X} + ${k * 1000}이에요.`, `그래서 ${ieyo(ans)}.`],
      alt: [`${X + 10000}에서 거꾸로 ${10 - k}칸 와도 ${ieyo(ans)}.`, `두 풀이 모두 ${ieyo(ans)}.`],
    },
  };
}

function t203Level2(S, step, c) {
  const ans = S + step * c;
  const pos = Math.round(Math.log10(step));
  const bl = blankAt(ans, pos);
  return {
    text: [n(S), '에서 ', n(step), '씩 ', n(c), '번 뛰어 세면 얼마예요?'],
    figure: { kind: 'numberline', from: S, to: S + step * 10, ticks: 10 },
    input: { kind: 'number' },
    answer: ans,
    discriminators: uniq(
      [
        { value: S + (step / 10) * c, category: '개념', kind: 'check', feedback: '몇씩 뛰어 세었는지 다시 볼까요?' },
        { value: S + step * 10 * c, category: '개념', kind: 'check', feedback: '몇씩 뛰어 세었는지 다시 볼까요?' },
        { value: S + step * (c - 1), category: '계산', kind: 'check', feedback: '몇 번 뛰었는지 다시 세어 볼까요?' },
      ],
      ans,
    ),
    hints: [`${S}에서 ${step}씩 ${c}번 뛰어 센 수를 물어요.`, `${step}씩 뛰면 어느 자리 숫자가 바뀌는지 볼까요?`, `${S}에서 한 번 뛰면 ${ieyo(S + step)}.`, bl.blank],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${step}씩 뛰면 ${PLACES[pos]} 숫자가 1씩 커져요.`, `${c}번 뛰면 ${step} × ${c} = ${step * c}만큼 커져요.`, `그래서 ${S} + ${step * c} = ${ieyo(ans)}.`],
      alt: [`${Array.from({ length: c + 1 }, (_, i) => S + step * i).join(', ')}처럼 차례로 적어도 돼요.`, `두 풀이 모두 ${ieyo(ans)}.`],
    },
  };
}

function t203Level3(E, step, c) {
  const ans = E - step * c;
  const pos = Math.round(Math.log10(step));
  const bl = blankAt(ans, pos);
  return {
    text: ['어떤 수에서 ', n(step), '씩 ', n(c), '번 뛰어 셌더니 ', n(E), jo(E, '이', '가'), ' 되었어요. 처음 수는 얼마예요?'],
    figure: { kind: 'numberline', from: E - step * 10, to: E, ticks: 10, mark: E },
    input: { kind: 'number' },
    answer: ans,
    discriminators: uniq(
      [
        { value: E + step * c, category: '개념', kind: 'nudge', feedbackCheck: '처음 수와 뛰어 센 뒤의 수를 다시 읽어 볼까요?', feedback: '거꾸로 뛰어 세어 볼까요?' },
        { value: E - step * (c - 1), category: '계산', kind: 'check', feedback: '몇 번 뛰었는지 다시 세어 볼까요?' },
        { value: E - (step / 10) * c, category: '개념', kind: 'check', feedback: '몇씩 뛰었는지 다시 볼까요?' },
      ],
      ans,
    ),
    hints: [`어떤 수에서 ${step}씩 ${c}번 뛰어 센 수가 ${ieyo(E)}. 처음 수를 물어요.`, `${E}에서 거꾸로 ${step}씩 뛰어 볼까요?`, `한 번 거꾸로 뛰면 ${ieyo(E - step)}.`, bl.blank],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    explain: {
      why: [`${step}씩 ${c}번 뛰면 ${step * c}만큼 커져요.`, `처음 수는 ${E}에서 ${step * c}만큼 작은 수예요.`, `그래서 ${E} − ${step * c} = ${ieyo(ans)}.`],
      alt: [`${ans}에서 ${step}씩 ${c}번 뛰면 ${E}${jo(E, '이', '가')} 되는지 확인해요.`, `두 풀이 모두 ${ieyo(ans)}.`],
    },
  };
}

const T20_3 = {
  id: 'T20-3',
  node: 'N20',
  title: '수직선 뛰어 세기',
  repr: '그림',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    if (level === 1) return t203Level1(rng.pick([860000, 870000, 310000, 420000, 550000]), rng.int(1, 9));
    const step = rng.pick([1000, 10000, 100000]);
    const c = rng.int(2, 5);
    if (level === 2) return t203Level2(draw(rng, () => rng.pick([873000, 862000, 405000, 230000]), (S) => S + step * 10 < 10000000, 873000), step, c);
    const E = draw(rng, () => rng.pick([873000, 862000, 600000, 950000]), (e) => e - step * c > 0 && ![step, c, e].includes(e - step * c), 873000);
    return t203Level3(E, step, c);
  },
};

// ── 급행 통과 진단 ──
const D1 = {
  id: 'N20-D1',
  node: 'N20',
  title: '급행 진단: 삼백이만 오십',
  repr: '빈칸',
  minLevel: 5,
  maxLevel: 5,
  diagnostic: true,
  generate() {
    return { ...t201Level5(302, 50), hints: [], blank: null };
  },
};
const D2 = {
  id: 'N20-D2',
  node: 'N20',
  title: '급행 진단: 숫자 8의 자리',
  repr: '빈칸',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...t201Level3(YEAR_TOTAL, 6), hints: [], blank: null };
  },
};
const D3 = {
  id: 'N20-D3',
  node: 'N20',
  title: '급행 진단(예비): 3억 1877만 읽기',
  repr: '빈칸',
  minLevel: 6,
  maxLevel: 6,
  diagnostic: true,
  generate() {
    return { ...t201Level6(YEAR_TOTAL, ['ok', 'comma', 'big', 'small']), hints: [], blank: null };
  },
};

export default [T20_1, T20_2, T20_3, D1, D2, D3];
