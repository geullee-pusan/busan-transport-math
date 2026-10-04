// N15 토성 — 나머지가 있는 나눗셈 [4수01-06]. 천장 11.
// 기준: docs/curriculum/08-line1-templates-11-20.md 15절(04 사다리를 이 구간에 맞춘 1~11단계), 09 끝 보강 후보(빈칸: 세로식 + 확인식 칸). 피드백 꼬리표 kind: 'check' | 'nudge'(10 문서 2절).
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
const LINE1 = ['다대포해수욕장', '다대포항', '낫개', '신장림', '장림', '동매', '신평', '하단', '당리', '사하', '괴정', '대티', '서대신', '동대신', '토성', '자갈치', '남포', '중앙', '부산역', '초량', '부산진', '좌천', '범일', '범내골', '서면', '부전', '양정', '시청', '연산', '교대', '동래', '명륜', '온천장', '부산대', '장전', '구서', '두실', '남산', '범어사', '노포'];
const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';
const dropTens = (N, d) => Math.floor(Math.floor(N / 10) / d) * 10 + Math.floor((N % 10) / d);
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

// ── T15-1 몫과 나머지 (그림 → 식) — 1~5단계 ──

/** 1단계: 사람 그림, d명씩 줄 */
function t151Level1(N, d) {
  const q = Math.floor(N / d);
  const r = N % d;
  const answer = { rows: q, left: r };
  return {
    text: ['어느 날 승강장에 ', V(N), '명이 있었어요. ', V(d), '명씩 줄을 섰어요. 꽉 찬 줄은 몇 줄이고, 몇 명이 남았어요?'],
    figure: { kind: 'groups', items: N, groupSize: d },
    input: { kind: 'compound', fields: [{ key: 'rows', label: '꽉 찬 줄' }, { key: 'left', label: '남은 사람' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'rows', value: q + 1, category: '개념', kind: 'check', feedback: '마지막 줄도 꽉 찼나요?' },
        { key: 'rows', value: r, category: '읽기', kind: 'check', feedback: '줄 수와 남은 사람을 다시 볼까요?' },
        { key: 'left', value: r + d, category: '개념', kind: 'check', feedback: `남은 ${r + d}명으로 줄을 하나 더 설 수 있나요?` },
      ],
      answer,
    ),
    hints: [`구하는 것: 꽉 찬 줄 수와 남은 사람 수 / 알고 있는 것: 승강장에 ${N}명, ${d}명씩 줄을 섬`, `그림에서 ${d}명씩 묶어 볼까요? 묶음을 하나씩 세어 봐요.`, `${d}명씩 두 줄이면 ${2 * d}명이에요.`, '꽉 찬 줄: ☐줄'],
    blank: '꽉 찬 줄: ☐줄',
    blankAnswer: String(q),
    blankThen: '남은 사람도 써요.',
    explain: {
      why: [`${N}명을 ${d}명씩 묶으면 ${q}묶음이고 ${r}명이 남아요.`, `이것을 ${N} ÷ ${d} = ${q} … ${r}${jo(r, '이라고', '라고')} 써요.`, `그래서 꽉 찬 줄은 ${q}줄, 남은 사람은 ${r}명이에요.`],
      alt: [`${d} × ${q} = ${d * q}, ${d * q} + ${r} = ${N}${roOnly(N)} 확인해요.`, '확인해 보면 답이 맞아요.'],
    },
  };
}

/** 2단계: 몫·나머지·확인 계산 */
function t151Level2(N, d) {
  const q = Math.floor(N / d);
  const r = N % d;
  const answer = { q, r, chk: N };
  return {
    text: ['토성역 승강장에 있는 ', V(N), '명을 ', V(d), '명씩 묶어요. 몫과 나머지를 구하고, 맞는지 확인 계산도 해요.'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'q', label: '몫' }, { key: 'r', label: '나머지' }, { key: 'chk', label: '확인: (나누는 수) × (몫) + (나머지)' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'r', value: r + d, category: '개념', kind: 'nudge', feedbackCheck: '나머지를 다시 볼까요?', feedback: `남은 ${r + d}명으로 한 묶음 더 될까요?` },
        { key: 'q', value: q - 1, category: '개념', kind: 'check', feedback: '몫을 다시 볼까요?' },
        { key: 'chk', value: d * q, category: '식', kind: 'nudge', feedbackCheck: '확인 계산을 다시 볼까요?', feedback: '나머지도 더했나요?' },
      ],
      answer,
    ),
    hints: [`구하는 것: 몫, 나머지, 확인 계산의 값 / 알고 있는 것: ${N}명을 ${d}명씩 묶음`, `${d}단의 곱 중에서 ${N}${jo(N, '과', '와')} 같거나 작은 가장 큰 수를 찾아볼까요? 남은 사람이 나머지예요.`, `${d} × ${q} = ${ieyo(d * q)}.`, `${N} − ${d * q} = ☐`],
    blank: `${N} − ${d * q} = ☐`,
    blankAnswer: String(r),
    blankThen: '몫, 나머지, 확인 계산을 써요.',
    explain: {
      why: [`${d} × ${q} = ${d * q}${jo(d * q, '이고', '고')}, ${N}에서 ${r}명이 남아요.`, `그래서 ${N} ÷ ${d} = ${q} … ${r}, 확인하면 ${d} × ${q} + ${r} = ${ieyo(N)}.`],
      alt: [`${N}에서 ${d}씩 덜어 내면 ${q}번 덜고 ${r}${jo(r, '이', '가')} 남아요.`, `어느 길로 해도 몫은 ${q}, 나머지는 ${ieyo(r)}.`],
    },
  };
}

/** 3단계: 엘리베이터(나머지가 있으면 한 번 더) */
function t151Level3(N, c) {
  const q = Math.floor(N / c);
  const r = N % c;
  const ans = q + 1;
  return {
    text: ['토성역 엘리베이터에 한 번에 ', V(c), '명이 탈 수 있다고 해 봐요. ', V(N), '명이 모두 올라가려면 적어도 몇 번 올라가야 해요?'],
    figure: { kind: 'groups', items: N, groupSize: c },
    input: { kind: 'number', unit: '번' },
    answer: ans,
    discriminators: uniq(
      [
        { value: q, category: '개념', kind: 'check', feedback: `${N}명이 모두 올라갔나요?` },
        { value: r, category: '읽기', kind: 'check', feedback: '무엇을 물었는지 다시 볼까요?' },
      ],
      ans,
    ),
    hints: [`구하는 것: 엘리베이터가 올라가는 횟수 / 알고 있는 것: 한 번에 ${c}명, 모두 ${N}명`, `${c}명씩 묶어 볼까요? 남은 사람도 올라가야 해요.`, `${N} ÷ ${c} = ${q} … ${ieyo(r)}.`, '모두 올라가는 데 필요한 횟수: ☐번'],
    blank: '필요한 횟수: ☐번',
    blankAnswer: String(ans),
    explain: {
      why: [`${N} ÷ ${c} = ${q} … ${ieyo(r)}.`, `${q}번 꽉 차게 올라가도 ${r}명이 남아서 한 번 더 올라가야 해요.`, `그래서 ${ans}번이에요.`],
      alt: [`${Array.from({ length: ans }, (_, i) => c * (i + 1)).join(', ')}으로 늘려 봐요. ${N}명은 ${c * q}명보다 많으니 ${ans}번이에요.`.replace('으로 늘려', `${roOnly(c * ans)} 늘려`), `어느 길로 해도 답은 ${ans}번이에요.`],
    },
  };
}

/** 4단계: 처음 수 구하기 → 다시 나누기 */
function t151Level4(a, m, r, b) {
  const N = a * m + r;
  const q2 = Math.floor(N / b);
  const r2 = N % b;
  const answer = { q2, r2 };
  return {
    text: ['토성역 승강장의 승객을 ', V(a), '명씩 모았더니 ', V(m), '묶음이고 ', V(r), '명이 남았어요. ', V(b), '명씩 모으면 몇 묶음이고 몇 명이 남아요?'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'q2', label: '묶음' }, { key: 'r2', label: '남은 사람' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'r2', value: (a * m) % b, category: '개념', kind: 'nudge', feedbackCheck: `${r}명은 어디에 들어갔나요?`, feedback: `남은 ${r}명도 승객에 넣었나요?` },
        { key: 'q2', value: Math.floor((a * m) / b), category: '개념', kind: 'nudge', feedbackCheck: `${r}명은 어디에 들어갔나요?`, feedback: `남은 ${r}명도 승객에 넣었나요?` },
        { key: 'q2', value: N, category: '식', kind: 'nudge', feedbackCheck: '무엇을 물었는지 다시 볼까요?', feedback: `승객 ${N}명을 찾았어요. 다음엔요?` },
      ],
      answer,
    ),
    hints: [`구하는 것: ${b}명씩 모을 때 묶음 수와 남은 사람 수 / 알고 있는 것: ${a}명씩 모으면 ${m}묶음, ${r}명 남음`, '승객이 모두 몇 명인지부터 구해 볼까요?', `승객은 ${a} × ${m} + ${r} = ${N}명이에요.`, `${N} ÷ ${b}의 몫: ☐`],
    blank: '몫: ☐',
    blankAnswer: String(q2),
    blankThen: '묶음과 남은 사람을 써요.',
    explain: {
      why: [`승객은 ${a} × ${m} + ${r} = ${N}명이에요.`, `${N} ÷ ${b} = ${q2} … ${ieyo(r2)}.`, `그래서 ${q2}묶음이 되고 ${r2}명이 남아요.`],
      alt: [`${b} × ${q2} + ${r2} = ${N}${roOnly(N)} 확인해요.`, '확인해 보면 답이 맞아요.'],
    },
  };
}

/** 5단계: 나머지의 범위(가장 큰 나머지) */
function t151Level5(d, m) {
  const left = d - 1;
  const total = d * m + left;
  const answer = { left, total };
  return {
    text: ['승객을 ', V(d), '명씩 모았더니 꽉 찬 묶음이 ', V(m), '개이고 몇 명이 남았어요. 남은 사람이 가장 많을 때, 남은 사람과 승객은 몇 명이에요?'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'left', label: '남은 사람(가장 많을 때)' }, { key: 'total', label: '승객' }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'left', value: d, category: '개념', kind: 'nudge', feedbackCheck: '나머지를 다시 볼까요?', feedback: `${d}명이 남으면 한 묶음 더 되나요?` },
        { key: 'total', value: d * m + d, category: '개념', kind: 'check', feedback: '남은 사람 수를 다시 볼까요?' },
        { key: 'total', value: d * m, category: '개념', kind: 'nudge', feedbackCheck: '남은 사람은 어디에 들어갔나요?', feedback: '남은 사람도 승객에 넣었나요?' },
        { key: 'total', value: d * m + 1, category: '읽기', kind: 'check', feedback: '남은 사람이 1명일 때가 가장 많을까요?' },
      ],
      answer,
    ),
    hints: [`구하는 것: 남은 사람이 가장 많을 때 남은 사람 수와 승객 수 / 알고 있는 것: ${d}명씩 모아 꽉 찬 묶음 ${m}개`, `남은 사람이 ${d}명이 되면 어떻게 될까요? 남을 수 있는 수를 1부터 적어 봐요.`, `남은 사람은 ${d}명보다 적어야 해요.`, '남은 사람이 가장 많을 때: ☐명'],
    blank: '가장 많을 때: ☐명',
    blankAnswer: String(left),
    blankThen: '승객 수도 써요.',
    explain: {
      why: [`${d}명이 남으면 한 묶음이 더 생기니, 남을 수 있는 사람은 1명부터 ${left}명까지예요.`, `가장 많이 남을 때 승객은 ${d} × ${m} + ${left} = ${total}명이에요.`, `그래서 남은 사람은 ${left}명, 승객은 ${total}명이에요.`],
      alt: [`${total} ÷ ${d} = ${m} … ${left}${roOnly(left)} 확인해요.`, '확인해 보면 답이 맞아요.'],
    },
  };
}

const T15_1 = {
  id: 'T15-1',
  node: 'N15',
  title: '몫과 나머지',
  repr: '그림',
  minLevel: 1,
  maxLevel: 5,
  generate(rng, level) {
    if (level === 1) {
      const [N, d] = draw(rng, () => [rng.int(13, 34), rng.int(3, 4)], ([NN, dd]) => NN % dd !== 0 && Math.floor(NN / dd) <= 9 && Math.floor(NN / dd) !== dd, [23, 4]);
      return t151Level1(N, d);
    }
    if (level === 2) {
      const [N, d] = draw(rng, () => [rng.int(20, 59), rng.int(5, 9)], ([NN, dd]) => NN % dd !== 0 && Math.floor(NN / dd) >= 2 && Math.floor(NN / dd) <= 9 && Math.floor(NN / dd) !== NN % dd, [38, 6]);
      return t151Level2(N, d);
    }
    if (level === 3) {
      const [N, c] = draw(rng, () => [rng.int(15, 50), rng.int(6, 9)], ([NN, cc]) => NN % cc !== 0 && Math.floor(NN / cc) + 1 <= 9 && Math.floor(NN / cc) + 1 !== cc && Math.floor(NN / cc) >= 2, [27, 8]);
      return t151Level3(N, c);
    }
    if (level === 4) {
      const [a, m, r, b] = draw(
        rng,
        () => [rng.int(4, 9), rng.int(3, 9), rng.int(1, 8), rng.int(4, 9)],
        ([aa, mm, rr, bb]) => rr < aa && aa !== bb && aa * mm + rr <= 99 && Math.floor((aa * mm + rr) / bb) <= 9 && (aa * mm + rr) % bb !== 0 && (aa * mm) % bb !== (aa * mm + rr) % bb && Math.floor((aa * mm + rr) / bb) !== bb,
        [6, 7, 5, 8],
      );
      return t151Level4(a, m, r, b);
    }
    const [d, m] = draw(rng, () => [rng.int(4, 9), rng.int(5, 9)], ([dd, mm]) => dd !== mm, [7, 8]);
    return t151Level5(d, m);
  },
};

// ── T15-2 주기와 나머지 (문장 + 노선 그림) — 6~9단계 ──
// 6단계 그림은 새 종류: { kind: 'cycle', stops: 정류장 수, start: 출발 번호 } — 원 위에 정류장 점을 1번부터 차례로 찍는다(화면이 아직 못 그리면 문장만으로 풀 수 있다).

/** 6단계: 순환 버스(+1 함정) */
function t152Level6(K, S) {
  const q = Math.floor(S / K);
  const r = S % K;
  const ans = r + 1;
  return {
    text: ['정류장 ', V(K), '곳을 ', label('1'), '번부터 차례로 도는 순환 버스가 있다고 해 봐요. ', label('1'), '번 정류장에서 출발해 ', V(S), '정거장을 가면 몇 번 정류장에 있어요?'],
    figure: { kind: 'cycle', stops: K, start: 1 },
    input: { kind: 'number', unit: '번' },
    answer: ans,
    counting: true,
    discriminators: uniq(
      [
        { value: r, category: '개념', kind: 'nudge', feedbackCheck: `1번에서 ${r}번까지 몇 정거장인지 세어 볼까요?`, feedback: '1번에서 출발했어요. 0정거장이면 몇 번?' },
        { value: q, category: '개념', kind: 'nudge', feedbackCheck: '무엇을 물었는지 다시 볼까요?', feedback: `${eun(q)} 돈 바퀴 수예요. 정류장 번호는요?` },
      ],
      ans,
    ),
    hints: [`구하는 것: 도착한 정류장 번호 / 알고 있는 것: 정류장 ${K}곳, 1번에서 출발, ${S}정거장`, `${K}정거장을 가면 처음 정류장으로 돌아와요. 바퀴를 다 돌고 남는 정거장 수를 세어 볼까요?`, `${S} ÷ ${K} = ${q} … ${ieyo(r)}.`, `1번에서 ${r}정거장 더 가면: ☐번`],
    blank: '☐번',
    blankAnswer: String(ans),
    explain: {
      why: [`${S} ÷ ${K} = ${q} … ${r}, ${q}바퀴를 돌면 다시 1번이에요.`, `1번에서 ${r}정거장 더 가면 ${ans}번이에요(0정거장이면 1번).`, `그래서 ${ans}번 정류장에 있어요.`],
      alt: [`${K}정거장마다 1번으로 돌아오니 ${K * q}정거장째에 1번이에요. 남은 ${r}정거장을 세어도 ${ans}번이에요.`, `어느 길로 해도 답은 ${ans}번이에요.`],
    },
  };
}

/** 7단계: 두 조건 모두 찾기 */
function t152Level7(a, r1, b, r2, L) {
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
  const o1 = options.filter((v) => c1(v));
  const o2 = options.filter((v) => c2(v));
  const discs = [
    { value: answer.slice(0, 1), category: '개념', kind: 'check', feedback: `${L}보다 적은 수가 더 있을까요?` },
    { value: o1, category: '개념', kind: 'check', feedback: `${b}명씩 모으는 조건도 맞는지 볼까요?` },
    { value: o2, category: '개념', kind: 'check', feedback: `${a}명씩 모으는 조건도 맞는지 볼까요?` },
  ];
  const first = answer[0];
  const bl = first >= 10 ? blankAt(first, 0) : { blank: '☐', blankAnswer: String(first) };
  return {
    text: ['열차 한 칸의 승객을 ', V(a), '명씩 모으면 ', V(r1), '명이 남고, ', V(b), '명씩 모으면 ', V(r2), '명이 남아요. 승객은 ', V(L), '명보다 적어요. 승객은 몇 명일 수 있어요? 모두 골라요.'],
    figure: null,
    input: { kind: 'multi', options },
    answer,
    discriminators: uniq(discs, answer),
    grade: multiGrade(answer, discs),
    hints: [`구하는 것: 승객이 될 수 있는 수 모두 / 알고 있는 것: ${a}명씩 모으면 ${r1}명, ${b}명씩 모으면 ${r2}명 남음, ${L}명보다 적음`, `${a}명씩 모아 ${r1}명이 남는 수를 차례로 적어 볼까요? 그중 ${b}명씩 조건도 맞는 수를 찾아요.`, `${a}명씩 모아 ${r1}명이 남는 수는 ${r1}, ${a + r1}, ${2 * a + r1}, …예요.`, `두 조건이 다 맞는 가장 작은 수: ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '나머지도 모두 골라요.',
    explain: {
      why: [`${a}명씩 모아 ${r1}명이 남는 수 중 ${b}명씩 모아 ${r2}명이 남는 수를 찾아요.`, `${answer.join(', ')}${jo(answer.at(-1), '이', '가')} 두 조건에 다 맞아요.`, `그래서 승객은 ${answer.join(', ')}명일 수 있어요.`],
      alt: [`가장 작은 ${first}에서 ${(a * b) / gcd(a, b)}씩 커질 때마다 두 조건이 또 맞아요.`, `어느 길로 해도 답은 ${answer.join(', ')}${jo(answer.at(-1), '이에요', '예요')}.`],
    },
  };
}

/** 8단계: 40역 안내판 색(나머지가 개수를 바꿈) */
function t152Level8(colors) {
  const [c1, c2, c3] = colors;
  const answer = { nopo: c1, count: 14 };
  return {
    text: [L1(), '호선 ', FORTY(), '역에 다대포해수욕장부터 노포까지 차례로 안내판을 붙인다고 해 봐요. 색은 ', c1, ', ', c2, ', ', jw(c3, '이', '가'), ' 차례로 돌아가요. 노포역 안내판은 무슨 색이고, ', c1, ' 안내판은 모두 몇 개예요?'],
    figure: { kind: 'stations', stations: ['다대포해수욕장', '다대포항', '낫개', '신장림', '…', '노포'] },
    input: { kind: 'compound', fields: [{ key: 'nopo', label: '노포역 색', options: colors }, { key: 'count', label: `${c1} 안내판` }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'nopo', value: c3, category: '개념', kind: 'check', feedback: '40번째 역의 색을 다시 세어 볼까요?' },
        { key: 'count', value: 13, category: '개념', kind: 'nudge', feedbackCheck: '40번째 역까지 다 세었나요?', feedback: `나머지 1은 무슨 색 안내판이에요?` },
      ],
      answer,
    ),
    hints: [`구하는 것: 노포역 안내판 색과 ${c1} 안내판 수 / 알고 있는 것: 40역, ${c1}, ${c2}, ${c3} 차례로 돌아감`, '세 가지 색이 한 번씩 붙으면 한 묶음이에요. 40역은 몇 묶음이고 몇 역이 남을까요?', '40 ÷ 3 = 13 … 1이에요.', `${c1} 안내판: 1☐개`],
    blank: '1☐개',
    blankAnswer: '4',
    blankThen: '노포역 색과 개수를 써요.',
    explain: {
      why: ['40 ÷ 3 = 13 … 1, 세 가지 색이 13번 돌고 1역이 남아요.', `남은 1역(노포)은 처음 색 ${jw(c1, '이에요', '예요')}.`, `그래서 노포역은 ${c1}, ${c1} 안내판은 13 + 1 = 14개예요.`],
      alt: [`${c1} 안내판은 1, 4, 7, …번째 역이에요. 40번째도 3으로 나누면 나머지가 1이라 ${jw(c1, '이에요', '예요')}.`, `어느 길로 해도 답은 ${c1}, 14개예요.`],
    },
  };
}

/** 9단계: 왕복 주기를 스스로 찾기 */
function t152Level9(S) {
  const p = S - 78;
  const ans = LINE1[p];
  const idxs = [p - 2, p - 1, p, p + 1].filter((i) => i >= 0 && i <= 39);
  const options = idxs.map((i) => LINE1[i]);
  const bl = p >= 10 ? blankAt(p, 0) : { blank: '☐', blankAnswer: String(p) };
  const discs = [];
  if (p - 2 >= 0) discs.push({ value: LINE1[p - 2], category: '개념', kind: 'nudge', feedbackCheck: '한 번 왕복이 몇 정거장인지 다시 세어 볼까요?', feedback: '한 번 왕복은 역 수일까요, 정거장 수일까요?' });
  if (p - 1 >= 0) discs.push({ value: LINE1[p - 1], category: '개념', kind: 'check', feedback: '출발역을 몇 정거장으로 셌나요?' });
  if (p + 1 <= 39) discs.push({ value: LINE1[p + 1], category: '개념', kind: 'check', feedback: '노포에서 돌아오는 곳을 다시 볼까요?' });
  return {
    text: ['열차가 다대포해수욕장과 노포 사이를 쉬지 않고 왕복한다고 해 봐요. 다대포해수욕장에서 출발해 ', V(S), '정거장을 가면 어느 역에 있어요? (', L1(), '호선은 ', FORTY(), '역이에요.)'],
    figure: { kind: 'stations', stations: ['다대포해수욕장', '…', '노포'] },
    input: { kind: 'choice', options },
    answer: ans,
    counting: true,
    discriminators: discs,
    hints: [`구하는 것: ${S}정거장을 간 뒤의 역 / 알고 있는 것: 다대포해수욕장과 노포 사이 왕복, 1호선 40역`, '한 번 왕복하면 몇 정거장일까요? 그만큼 가면 처음 자리로 돌아와요.', '한 번 왕복은 39 + 39 = 78정거장이에요.', `${S} − 78 = ${bl.blank}정거장을 더 가요`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '어느 역에 있어요?',
    explain: {
      why: ['40역 사이의 정거장은 39개라서 한 번 왕복은 78정거장이에요.', `${S} − 78 = ${p}, 다대포해수욕장에서 ${p}정거장 더 가면 ${p + 1}번째 역이에요.`, `그래서 ${jw(ans, '이에요', '예요')}.`],
      alt: [`노포까지 39정거장을 가고, 다시 다대포해수욕장까지 39정거장을 오면 다대포해수욕장이에요.`, `거기서 ${S - 78}정거장을 하나씩 더 세어 가면 ${p + 1}번째 역이에요.`, `어느 길로 해도 답은 ${jw(ans, '이에요', '예요')}.`],
    },
  };
}

const COLORS = ['빨강', '노랑', '초록'];
const T15_2 = {
  id: 'T15-2',
  node: 'N15',
  title: '주기와 나머지',
  repr: '문장',
  minLevel: 6,
  maxLevel: 9,
  generate(rng, level) {
    if (level === 6) {
      const [K, S] = draw(rng, () => [rng.int(8, 10), rng.int(30, 70)], ([KK, SS]) => SS % KK >= 1 && SS % KK <= 8 && SS % KK + 1 !== KK && SS % KK + 1 !== Math.floor(SS / KK), [9, 50]);
      return t152Level6(K, S);
    }
    if (level === 7) {
      const [a, r1, b, r2, L] = draw(
        rng,
        () => {
          const [aa, bb] = rng.pick([[3, 4], [3, 5], [4, 5], [5, 6], [4, 7]]);
          return [aa, rng.int(1, aa - 1), bb, rng.int(1, bb - 1), rng.pick([40, 50, 60, 70])];
        },
        ([aa, rr1, bb, rr2, LL]) => {
          let c = 0;
          for (let v = Math.max(aa, bb) + 1; v < LL; v++) if (v % aa === rr1 && v % bb === rr2) c++;
          return c >= 2 && c <= 4;
        },
        [4, 3, 5, 4, 50],
      );
      return t152Level7(a, r1, b, r2, L);
    }
    if (level === 8) return t152Level8(rng.shuffle(COLORS));
    return t152Level9(rng.int(85, 117));
  },
};

// ── T15-3 경시 (challenge) — 10~11단계 ──

/** 10단계: 하나 더하면 나누어떨어지는 가장 작은 세 자리 수 */
function t153Level10(a, b) {
  const l = (a * b) / gcd(a, b);
  const k = Math.ceil(101 / l);
  const ans = k * l - 1;
  const bl = blankAt(k * l, 0);
  return {
    text: ['승객 수는 세 자리 수예요. ', V(a), '명씩 모으면 ', V(a - 1), '명이 남고, ', V(b), '명씩 모으면 ', V(b - 1), '명이 남아요. 승객이 가장 적을 때는 몇 명이에요?'],
    figure: null,
    challenge: true,
    input: { kind: 'number', unit: '명' },
    answer: ans,
    discriminators: uniq(
      [
        { value: l - 1, category: '읽기', kind: 'check', feedback: '세 자리 수인지 다시 볼까요?' },
        { value: ans + 1, category: '개념', kind: 'check', feedback: `${ans + 1}명을 ${a}명씩 모으면 몇 명이 남아요?` },
      ],
      ans,
    ),
    hints: [`구하는 것: 승객이 가장 적을 때의 수 / 알고 있는 것: 세 자리 수, ${a}명씩 모으면 ${a - 1}명, ${b}명씩 모으면 ${b - 1}명 남음`, '승객이 한 명 더 있으면 어떻게 될까요? 조건에 맞는 수를 몇 개 표로 적어 봐요.', `한 명을 더하면 ${a}명씩으로도 ${b}명씩으로도 남는 사람이 없어요.`, `${a}${jo(a, '과', '와')} ${b}로 모두 나누어떨어지는 수 중 100보다 큰 가장 작은 수: ${bl.blank}`],
    blank: bl.blank,
    blankAnswer: bl.blankAnswer,
    blankThen: '승객은 몇 명이에요?',
    explain: {
      why: [`승객보다 한 명 많은 수는 ${a}${jo(a, '과', '와')} ${b}로 모두 나누어떨어져요.`, `그런 수는 ${l}, ${2 * l}, ${3 * l}, …이고 100보다 큰 가장 작은 수는 ${ieyo(k * l)}.`, `그래서 승객은 ${k * l} − 1 = ${ans}명이에요.`],
      alt: [`${ans} ÷ ${a} = ${Math.floor(ans / a)} … ${a - 1}, ${ans} ÷ ${b} = ${Math.floor(ans / b)} … ${b - 1}${roOnly(b - 1)} 확인해요.`, '확인해 보면 답이 맞아요.'],
    },
  };
}

/** 11단계: 두 열차가 같은 역에 동시에 있는지(홀짝) — 04 문서 11단계 */
function t153Level11() {
  const answer = { ga: '①', min: 40, st: '초량', rule: '2분, 6분, 10분, …' };
  const opts = ['부산역', '초량', '부산진', '중앙'];
  const rules = ['2분, 6분, 10분, …', '2분, 4분, 6분, …', '1분, 3분, 5분, …'];
  return {
    text: [
      '열차 두 대가 다대포해수욕장과 노포 사이를 쉬지 않고 왕복한다고 해 봐요. 한 정거장에 ', V(2), '분씩 걸리고, 역에서 멈추지 않아요. 같은 역에 동시에 있으면 만났다고 해요.',
      '\n',
      '(가) 양 끝에서 동시에 출발하면 만날 때가 있을까요? 이유를 골라요.',
      '\n',
      '① 두 열차 사이의 정거장 수가 늘 홀수라서 없어요',
      '\n',
      '② ', n(39), '를 ', n(2), '로 나누면 나머지가 있어서 ', n(20), '번째 역에서 만나요',
      '\n',
      '③ 언젠가는 꼭 만나요',
      '\n',
      '(나) 다대포해수욕장 열차가 ', V(2), '분 늦게 출발하면, 노포 열차가 출발하고 몇 분 뒤 어느 역에서 처음 만나요?',
      '\n',
      '(다) 몇 분 늦게 출발하면 만날 수 있을까요? 규칙을 골라요.',
    ],
    figure: { kind: 'stations', stations: ['다대포해수욕장', '…', '부산역', '초량', '…', '노포'] },
    challenge: true,
    input: {
      kind: 'compound',
      fields: [
        { key: 'ga', label: '(가) 이유', options: ['①', '②', '③'] },
        { key: 'min', label: '(나) 몇 분 뒤' },
        { key: 'st', label: '(나) 어느 역', options: opts },
        { key: 'rule', label: '(다) 늦게 출발하는 시간', options: rules },
      ],
    },
    answer,
    discriminators: [
      { key: 'ga', value: '②', category: '개념', kind: 'check', feedback: '두 열차가 20번째 역에 같은 때 오나요?' },
      { key: 'ga', value: '③', category: '개념', kind: 'check', feedback: '두 열차 사이의 정거장 수를 세어 볼까요?' },
      { key: 'min', value: 38, category: '개념', kind: 'nudge', feedbackCheck: '노포 열차가 출발한 때부터 세었나요?', feedback: '늦게 출발한 2분도 셌나요?' },
      { key: 'st', value: '부산역', category: '개념', kind: 'check', feedback: '다대포해수욕장 열차가 몇 번째 역에 있나요?' },
      { key: 'rule', value: rules[1], category: '개념', kind: 'nudge', feedbackCheck: '고른 규칙의 시간을 하나 넣어 확인해 볼까요?', feedback: '4분 늦으면 두 열차 사이는 몇 정거장이에요?' },
      { key: 'rule', value: rules[2], category: '개념', kind: 'check', feedback: '홀수 분일 때 열차는 역에 있나요?' },
    ],
    hints: ['구하는 것: (가) 만날 수 있는지와 이유, (나) 2분 늦게 출발할 때 처음 만나는 때와 역, (다) 만날 수 있는 늦은 시간의 규칙 / 알고 있는 것: 양 끝에서 왕복, 한 정거장에 2분', '두 열차 사이의 정거장 수가 2분마다 어떻게 바뀌는지 볼까요?', '동시에 출발하면 두 열차 사이는 39정거장이고, 2분마다 2정거장씩 줄어요.', '(나) 처음 같은 역에 동시에 있는 때: ☐0분'],
    blank: '☐0분',
    blankAnswer: '4',
    blankThen: '네 칸을 모두 채워요.',
    explain: {
      why: [
        '(가) 동시에 출발하면 두 열차 사이는 39, 37, 35, …정거장으로 늘 홀수라서 같은 역에 동시에 있을 수 없어요.',
        '(나) 2분 늦으면 노포 열차가 먼저 1정거장 가서 사이가 38정거장이 되고, 2분마다 2정거장씩 줄어 38분 뒤 처음 같은 역에 와요. 노포 열차가 출발하고 40분 뒤, 20번째 역 초량이에요.',
        '(다) 2분, 6분, 10분처럼 늦으면 사이가 짝수가 되어 만나요. 4분 늦으면 사이가 37정거장으로 홀수예요.',
        '그래서 (가) ①, (나) 40분 뒤 초량, (다) 2분, 6분, 10분, …이에요.',
      ],
      alt: ['정거장 번호로 따져도 돼요. 노포 열차는 40분 뒤 40 − 20 = 20번째, 다대포해수욕장 열차는 38분 동안 19정거장을 가서 20번째 역이에요.', '어느 길로 해도 답은 초량이에요.'],
    },
  };
}

const T15_3 = {
  id: 'T15-3',
  node: 'N15',
  title: '경시: 나머지로 생각하기',
  repr: '식',
  challenge: true,
  minLevel: 10,
  maxLevel: 11,
  generate(rng, level) {
    if (level === 10) {
      const [a, b] = rng.pick([[6, 7], [5, 7], [4, 7], [5, 6], [4, 9], [7, 8], [5, 8]]);
      return t153Level10(a, b);
    }
    return t153Level11();
  },
};

// ── T15-4 세로식과 확인식 칸 (빈칸) — 1~3단계, 09 보강 후보 ──
function t154(N, d, level) {
  const q = Math.floor(N / d);
  const r = N % d;
  const answer = { q, r, chk: N };
  return {
    text: [n(N), ' ÷ ', n(d), ' = ', unknown('□'), ' … ', unknown('□'), '에서 몫과 나머지를 쓰고, 확인식 ', n(d), ' × (몫) + (나머지)의 값도 써요.'],
    figure: null,
    input: { kind: 'compound', fields: [{ key: 'q', label: '몫' }, { key: 'r', label: '나머지' }, { key: 'chk', label: `${d} × (몫) + (나머지)` }] },
    answer,
    discriminators: uniqK(
      [
        { key: 'r', value: r + d, category: '개념', kind: 'nudge', feedbackCheck: '나머지를 다시 볼까요?', feedback: `나머지 ${r + d}${jo(r + d, '이', '가')} ${d}보다 작나요?` },
        ...(level === 3 ? [{ key: 'q', value: dropTens(N, d), category: '개념', kind: 'nudge', feedbackCheck: '십의 자리를 다시 볼까요?', feedback: '십의 자리에서 남은 수는 어디로 갔나요?' }] : []),
        { key: 'q', value: q - 1, category: '개념', kind: 'check', feedback: '몫을 다시 볼까요?' },
        { key: 'chk', value: d * q, category: '식', kind: 'nudge', feedbackCheck: '확인식을 다시 볼까요?', feedback: '나머지도 더했나요?' },
      ].filter((x) => x.value > 0),
      answer,
    ),
    hints: [`${eul(N)} ${d}씩 묶을 때의 몫과 나머지, 확인식의 값을 물어요.`, level === 1 ? `${d}단에서 ${N}을 넘지 않는 가장 큰 수를 찾아볼까요?`.replace(`${N}을`, eul(N)) : '십의 자리부터 나누고, 남은 수는 일의 자리와 합쳐서 다시 나눠 볼까요?', `${d} × ${q} = ${ieyo(d * q)}.`, `${N} − ${d * q} = ☐`],
    blank: `${N} − ${d * q} = ☐`,
    blankAnswer: String(r),
    blankThen: '세 칸을 채워요.',
    explain: {
      why: [`${d} × ${q} = ${d * q}${jo(d * q, '이고', '고')}, ${N} − ${d * q} = ${r}${jo(r, '이', '가')} 남아요.`, `나머지 ${eun(r)} ${d}보다 작아야 해요.`, '확인식 값이 처음 수와 같으면 바르게 나눈 거예요.', `그래서 ${N} ÷ ${d} = ${q} … ${r}, 확인식은 ${d} × ${q} + ${r} = ${ieyo(N)}.`],
      alt: [`${N}에서 ${d}씩 덜어 내면 ${q}번 덜고 ${r}${jo(r, '이', '가')} 남아요.`, `어느 길로 해도 몫은 ${q}, 나머지는 ${ieyo(r)}.`],
    },
  };
}

const T15_4 = {
  id: 'T15-4',
  node: 'N15',
  title: '세로식과 확인식',
  repr: '빈칸',
  minLevel: 1,
  maxLevel: 3,
  generate(rng, level) {
    const [N, d] = draw(
      rng,
      () => [rng.int(13, 99), rng.int(3, 9)],
      ([NN, dd]) => {
        const q = Math.floor(NN / dd);
        const r = NN % dd;
        if (r === 0 || q === dd || q === r) return false;
        if (level === 1) return q >= 2 && q <= 9;
        const tens = Math.floor(NN / 10);
        if (q < 10 || q % 10 === 0) return false;
        if (level === 2) return tens % dd === 0;
        return tens % dd !== 0;
      },
      level === 1 ? [38, 6] : level === 2 ? [47, 4] : [75, 4],
    );
    return t154(N, d, level);
  },
};

// ── 급행 통과 진단 ──
const D1 = {
  id: 'N15-D1',
  node: 'N15',
  title: '급행 진단: 38 ÷ 6',
  repr: '빈칸',
  minLevel: 1,
  maxLevel: 1,
  diagnostic: true,
  generate() {
    return { ...t154(38, 6, 1), hints: [], blank: null };
  },
};
const D2 = {
  id: 'N15-D2',
  node: 'N15',
  title: '급행 진단: 엘리베이터',
  repr: '그림',
  minLevel: 3,
  maxLevel: 3,
  diagnostic: true,
  generate() {
    return { ...t151Level3(27, 8), hints: [], blank: null };
  },
};
const D3 = {
  id: 'N15-D3',
  node: 'N15',
  title: '급행 진단(예비): 다시 모으기',
  repr: '그림',
  minLevel: 4,
  maxLevel: 4,
  diagnostic: true,
  generate() {
    return { ...t151Level4(6, 7, 5, 8), hints: [], blank: null };
  },
};

export default [T15_1, T15_2, T15_3, T15_4, D1, D2, D3];
