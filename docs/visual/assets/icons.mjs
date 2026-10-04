// 부산 교통 수학 — 아이콘 세트 (시각 자문 1차, docs/visual/visual-review-01.md 3절)
// 규칙: 24×24 격자, 그리는 영역 20×20(가장자리 2px 비움), 선 2px 하나, 끝과 꺾임은 둥글게,
//       색은 currentColor 하나(단추 글자색을 따름). 뜻은 모양이 싣고 색은 싣지 않는다 → 흑백에서도 같다.
//       작은 채움(점, 별, 확정 점)만 fill="currentColor"를 쓴다.
// 쓰는 법(src/ui의 s()로): svgIcon('hint') → <svg viewBox="0 0 24 24" ...>…</svg>
//   단추에는 늘 글자를 함께 쓴다(아이콘만 있는 단추는 ✕ 닫기, ← 뒤로 둘뿐 — 둘 다 aria-label 필수).
// 이 파일은 순수 함수다. DOM이 없어도 문자열로 쓸 수 있다(빌드 때 스프라이트로 굳혀도 된다).

const r = (n) => Math.round(n * 100) / 100;

/** 별: 가운데(cx, cy), 바깥 반지름 R, 안쪽 반지름 k·R. 금 도장·금테에 쓴다. */
export function starPoints(cx, cy, R, k = 0.45) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? R * k : R;
    pts.push(`${r(cx + rr * Math.cos(a))},${r(cy + rr * Math.sin(a))}`);
  }
  return pts.join(' ');
}

/** 톱니바퀴: 이 8개. 바깥 R1, 안 R0 */
function gearPath(cx, cy, R0 = 6.2, R1 = 9, teeth = 8) {
  const d = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step - Math.PI / 2;
    const w = step * 0.22;
    const p = [
      [R0, a - step / 2 + w], [R1, a - w * 0.9], [R1, a + w * 0.9], [R0, a + step / 2 - w],
    ].map(([rr, aa]) => `${r(cx + rr * Math.cos(aa))} ${r(cy + rr * Math.sin(aa))}`);
    d.push(`${i ? 'L' : 'M'}${p[0]} L${p[1]} L${p[2]} L${p[3]}`);
  }
  return d.join(' ') + ' Z';
}

/** 아이콘 속(24×24 안쪽). 키 = 이름, 값 = { label: 단추 글자·aria, body: SVG 조각, group } */
export const ICONS = {
  // ── 도구 막대(D) ─────────────────────────────────
  read: { group: '도구', label: '읽어 주기', note: '말풍선 + 소리결. 스피커(소리 켬·끔)와 일부러 다르게 — 지금은 🔊가 둘 다 뜻함',
    body: '<path d="M3 6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3.5V14a2 2 0 0 1-2-2z"/><path d="M18 6.5c1.2 1.4 1.2 4.6 0 6"/><path d="M20.5 4.5c2.2 2.6 2.2 8 0 10.5"/>' },
  pad: { group: '도구', label: '연습장', note: '모눈 공책. 연필(✏)은 쓰지 않는다 — 만든 숫자 표시와 헷갈리지 않게(ux-review-04 6.1a)',
    body: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 3v18M15 3v18" stroke-width="1.5"/>' },
  hint: { group: '도구', label: '힌트', note: '전구 윤곽. 힌트가 "눈에 띄게 바뀔 때"(2번 틀림)는 색이 아니라 단추 테두리 4px + 아이콘 채움으로',
    body: '<path d="M9 17.5h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.4.3.6.8.6 1.3V17.5h6v-2.4c0-.5.2-1 .6-1.3A6 6 0 0 0 12 3z"/>' },
  hintOn: { group: '도구', label: '힌트(도움 권함)', note: '2번 틀렸거나 오래 멈췄을 때. 깜박이지 않는다',
    body: '<path d="M9 17.5h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.4.3.6.8.6 1.3V17.5h6v-2.4c0-.5.2-1 .6-1.3A6 6 0 0 0 12 3z" fill="currentColor"/>' },
  report: { group: '도구', label: '이 문제 이상해요', note: '깃발 윤곽, 진한 글자색. 지금 🚩는 빨강이라 "틀림"처럼 읽힘',
    body: '<path d="M5 21V3.5"/><path d="M5 4h12l-2.5 4L17 12H5"/>' },
  settings: { group: '도구', label: '설정',
    body: `<path d="${gearPath(12, 12)}"/><circle cx="12" cy="12" r="2.6"/>` },
  parent: { group: '도구', label: '부모', note: '큰 사람 + 작은 사람. 글자 "부모"를 늘 함께(아이콘만으로는 뜻이 약함)',
    body: '<circle cx="9" cy="6" r="2.6"/><path d="M3.5 20v-3.5a5.5 5.5 0 0 1 11 0V20"/><circle cx="17.5" cy="10.5" r="2"/><path d="M14.8 20v-2.2a2.7 2.7 0 0 1 5.4 0V20"/>' },
  soundOn: { group: '도구', label: '소리 켜짐',
    body: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 6.5a7.5 7.5 0 0 1 0 11"/>' },
  soundOff: { group: '도구', label: '소리 꺼짐', note: '켬과 같은 스피커 + ✕(물결이 사라지고 ✕가 생김). 흑백 구분 됨',
    body: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9.5l5 5M20.5 9.5l-5 5"/>' },
  close: { group: '도구', label: '닫기', body: '<path d="M6 6l12 12M18 6L6 18"/>' },
  back: { group: '도구', label: '뒤로', body: '<path d="M20 12H5M11 5.5L4.5 12 11 18.5"/>' },
  undo: { group: '도구', label: '되돌리기', body: '<path d="M9 7H4.5V2.5"/><path d="M4.8 7A8 8 0 1 1 4 13"/>' },
  backspace: { group: '도구', label: '하나 지우기', note: '키패드 ⌫ 글자 대신(기기마다 모양이 달라짐)',
    body: '<path d="M21 6v12H8.5L3 12l5.5-6z"/><path d="M11.5 9.5l5 5M16.5 9.5l-5 5"/>' },
  more: { group: '도구', label: '더 보기 ▸', body: '<path d="M9 5l7 7-7 7"/>' },

  // ── 상태(피드백 줄, 역, 칩) ───────────────────────
  check: { group: '상태', label: '맞았어요(✓)', note: '원 없이 굵은 체크. 원 안 체크는 "고름"과 헷갈려서 쓰지 않는다',
    body: '<path d="M4.5 12.5l5 5L19.5 6.5" stroke-width="2.5"/>' },
  pause: { group: '상태', label: '잠깐 멈췄어요(⏸)', note: '원 + 두 막대. 지금 글자 ⏸는 기기마다 이모지(색)로 바뀜',
    body: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7M14 8.5v7"/>' },
  info: { group: '상태', label: '안내(ⓘ)', body: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r="1.2" fill="currentColor" stroke="none"/>' },
  pass: { group: '상태', label: '통과(≫)·급행', note: '급행 단추와 통과역 표시가 같은 모양 = "서지 않고 지나가요" 한 뜻',
    body: '<path d="M5 6l6 6-6 6M12.5 6l6 6-6 6"/>' },
  confirmed: { group: '상태', label: '확정(꽉 찬 불)', note: '노선도 확정 역과 같은 모양. 아이 화면에서는 "확정" 낱말 없이 일지 문장과 함께',
    body: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5" fill="currentColor"/>' },
  chosen: { group: '상태', label: '고름 표시', note: '고른 선택지 오른쪽 위 모서리 배지(단추 속 작은 원 + 체크)',
    body: '<circle cx="12" cy="12" r="9" fill="currentColor" stroke="none"/><path d="M7.5 12.3l3 3 6-6.3" stroke="#fff"/>' },

  // ── 보상 ─────────────────────────────────────────
  stamp: { group: '보상', label: '금 도장', note: '이중 원 + ★. 금색은 채움에만, 모양만으로도 "도장"',
    body: `<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="6.8" stroke-width="1.5"/><polygon points="${starPoints(12, 12.3, 4.3)}" fill="currentColor" stroke="none"/>` },
  tool: { group: '보상', label: '정비 완료', note: '스패너. 금 도장의 아래 등급이 아니라 다른 종류 → 원·★ 모양을 쓰지 않음',
    body: '<g transform="rotate(45 12 12)"><path d="M9.6 3.2A4.8 4.8 0 1 0 14.4 3.2V7H9.6Z"/><rect x="10.4" y="11.2" width="3.2" height="10" rx="1.6"/></g>' },
  goldCard: { group: '보상', label: '금테 카드', note: '두꺼운 테(바깥 선 + 안쪽 선 붙임) + 모서리 ★',
    body: `<rect x="4" y="2.5" width="16" height="19" rx="2.5"/><rect x="6.5" y="5" width="11" height="14" rx="1" stroke-width="1.5"/><polygon points="${starPoints(16.2, 6.8, 3.4)}" fill="currentColor" stroke-width="1"/>` },

  // ── 운행 ─────────────────────────────────────────
  depart: { group: '운행', label: '출발', note: '선로 위 앞으로 가는 삼각. 홈의 72px "출발" 단추 글자 왼쪽',
    body: '<path d="M7 4.5v13l10-6.5z"/><path d="M3 21h18"/>' },
  express: { group: '운행', label: '급행', note: 'pass와 같은 모양(≫)에 선로 줄 하나. 단추 안에서만 씀',
    body: '<path d="M4 5l5.5 5.5L4 16M11 5l5.5 5.5L11 16"/><path d="M3 20.5h18"/>' },
  challenge: { group: '운행', label: '도전 운행', note: '산과 깃발. "보스"·불꽃·해골 같은 겁주는 모양 금지',
    body: '<path d="M2.5 20.5L9.5 9l3.5 5.5 2-3 6.5 9z"/><path d="M9.5 9V3.2h4.5l-1.3 1.6 1.3 1.6H9.5"/>' },
  garage: { group: '운행', label: '차고', body: '<path d="M3 20.5V9.5l9-5.5 9 5.5v11"/><path d="M6.5 20.5v-8h11v8M6.5 15.5h11"/>' },
  depot: { group: '운행', label: '정비창', note: '톱니 지붕(공장). 🏭 대신. 차고(박공 지붕)와 지붕 모양으로 구분',
    body: '<path d="M3 20.5V11l5-3.5V11l5-3.5V11l5-3.5v13z"/><path d="M8.5 20.5v-5h7v5"/>' },
  lastTrain: { group: '운행', label: '막차', note: '초승달. 카운트다운·시계 모양 금지(SPEC 2.2)',
    body: '<path d="M19.5 14.6A8 8 0 1 1 9.4 4.5a6.4 6.4 0 0 0 10.1 10.1z"/>' },
  map: { group: '운행', label: '노선도 펼치기', body: '<path d="M4 18.5c4 0 4-5 8-5s4-8 8-8"/><circle cx="4" cy="18.5" r="2"/><circle cx="12" cy="13.5" r="2"/><circle cx="20" cy="5.5" r="2"/>' },
};

/** 아이콘 하나의 <svg>(문자열). size는 화면 px. 단추 안에서는 aria-hidden(글자가 이름을 맡음) */
export function svgIcon(name, { size = 24, title } = {}) {
  const ic = ICONS[name];
  if (!ic) return '';
  const a11y = title ? `role="img" aria-label="${title}"` : 'aria-hidden="true" focusable="false"';
  return `<svg class="icon icon-${name}" ${a11y} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ic.body}</svg>`;
}

/** 스프라이트(<symbol> 묶음). index.html 맨 위에 한 번 넣고 <svg><use href="#i-hint"/></svg>로 쓴다 */
export function iconSprite() {
  const syms = Object.entries(ICONS).map(([k, v]) => `  <symbol id="i-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><title>${v.label}</title>${v.body}</symbol>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${syms.join('\n')}\n</svg>\n`;
}
