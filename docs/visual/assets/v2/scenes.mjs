// 부산 교통 수학 — v2 장면·컴포넌트 시안(시각 자문 4차, visual-review-04.md 4절)
// UX 8차 배치(ux-review-08.md)에 맞춘 모양: 운행 띠(차내 안내 화면) · 역명판 카드 · 차량 고르기 · 피드백 · 일지 큰 소식 · 차고 카드 · 축약 노선
// 원칙(knowledge.md): 풀이 화면(문제 판·작업대)에는 장식을 넣지 않는다. 풍부함은 띠·홈·일지·차고에.
// 순수 함수: HTML/SVG 문자열. CSS는 v2.css.
import { vehicleArtV2, VEHICLES_V2 } from './vehicle-art-v2.mjs';
import { svgIcon } from '../icons.mjs';

const INK = '#1F3342';
const L1 = '#F7941D';

/** 띠 안 작은 차량(44×26): 옆모습 한 칸, 앞 = 오른쪽. kind: 'bus' | 'rail'. band = 아이가 고른 색(지붕 띠) */
export function bandVehicle({ kind = 'bus', band = INK } = {}) {
  const body = kind === 'bus'
    ? `<path d="M3 4H36Q42 4 43 10V20Q43 22 41 22H3Q1 22 1 20V6Q1 4 3 4Z" fill="#F6F8F9" stroke="${INK}" stroke-width="2"/><rect x="5" y="8" width="24" height="7" rx="1.5" fill="#2F4252"/><path d="M33 8H38Q41 9 41 13V15H33Z" fill="#2F4252"/><circle cx="11" cy="22" r="3.6" fill="#3A4650" stroke="${INK}" stroke-width="1.5"/><circle cx="34" cy="22" r="3.6" fill="#3A4650" stroke="${INK}" stroke-width="1.5"/>`
    : `<path d="M3 4H34Q42 4 43 12V20Q43 22 41 22H3Q1 22 1 20V6Q1 4 3 4Z" fill="#E4E9ED" stroke="${INK}" stroke-width="2"/><rect x="5" y="8" width="24" height="7" rx="1.5" fill="#2F4252"/><path d="M33 7H37Q41 9 41 14H33Z" fill="#2F4252"/><circle cx="9" cy="23" r="2.6" fill="#3A4650"/><circle cx="15" cy="23" r="2.6" fill="#3A4650"/><circle cx="30" cy="23" r="2.6" fill="#3A4650"/><circle cx="36" cy="23" r="2.6" fill="#3A4650"/>`;
  return `<svg class="band-car" viewBox="0 0 44 26" width="44" height="26" aria-hidden="true">${body}<rect x="4" y="5" width="${kind === 'bus' ? 30 : 28}" height="2.5" rx="1" fill="${band}"/></svg>`;
}

/**
 * 운행 띠 v2(높이 104): "차내 안내 화면" 느낌의 진한 판. 실제 부산 차내 화면을 베끼지 않고 패턴만 빌림(도착역을 늘 위에 고정, 지나온 것은 흐리게, 지금 위치 표지 하나).
 * prev/next: 앞 역·다음 역 이름, halves: 채운 반 칸 수(0~8), litCount/total: 켜진 역 수, line: 노선 표지 글자
 */
export function runBand({ prev = '다대포항', next = '낫개', halves = 5, litCount = 3, total = 40, line = '1', lineColor = L1, car = 'bus', carColor = '#00798C', tag = '' }) {
  const cells = Array.from({ length: 4 }, (_, i) => {
    const h = halves - i * 2;
    const st = h >= 2 ? 'full' : h === 1 ? 'half' : i === Math.floor(halves / 2) ? 'target' : 'empty';
    return `<i class="cell ${st}"></i>`;
  }).join('');
  const carPos = Math.min(halves, 8) / 8; // 차량은 채운 만큼 앞으로(칸 위)
  const pct = Math.round((litCount / total) * 100);
  return `<header class="v2-band" role="group" aria-label="운행 안내">
  <button class="band-x" aria-label="운행 멈추기">${svgIcon('close', { size: 28 })}</button>
  <div class="band-route">
    <span class="band-badge" style="--lc:${lineColor}">${line}</span>
    <span class="band-prev"><small>지난 역</small>${prev}</span>
    <div class="band-seg">
      <span class="seg-dot done" style="--lc:${lineColor}"></span>
      <div class="seg-track" style="--lc:${lineColor}"><div class="seg-fill" style="width:${carPos * 100}%"></div>
        <div class="seg-cells">${cells}</div>
        <div class="seg-car" style="left:calc(${carPos * 100}% - 22px)">${bandVehicle({ kind: car, band: carColor })}</div>
      </div>
      <span class="seg-dot next"></span>
    </div>
    <span class="band-next"><small>다음 역</small><b>${next}</b></span>
  </div>
  <div class="band-side">
    ${tag ? `<span class="band-tag">${tag}</span>` : ''}
    <div class="band-total" aria-label="${total}역 중 ${litCount}역 켜짐"><div class="tot-bar"><i style="width:${pct}%;background:${lineColor}"></i><b style="left:${pct}%">▲</b></div><small>${total}역 중 ${litCount}역 켜짐</small></div>
    <button class="band-rest">쉬기</button>
  </div>
</header>`;
}

/**
 * 역명판 카드(홈 오른쪽 칸, 다음 역). 이 앱만의 모양: 위 노선 색 띠(4px) + 왼쪽 노선 원과 역 번호 + 큰 역 이름 + 아래 앞·뒤 역 화살.
 * 실제 부산교통공사 역명판(흰 원판·주황 테 등)의 배치·비율을 따라 하지 않는다. 역 번호(095~134)는 공공데이터의 역 코드.
 */
export function stationSign({ name = '낫개', nameEn = 'Natgae', code = '097', prev = '다대포항', next = '신장림', line = '1', lineColor = L1, halves = 5, island = false }) {
  const cells = Array.from({ length: 4 }, (_, i) => { const h = halves - i * 2; return `<i class="cell ${h >= 2 ? 'full' : h === 1 ? 'half' : 'empty'}"></i>`; }).join('');
  return `<section class="v2-sign" style="--lc:${lineColor}" aria-label="다음 역 ${name}">
  <div class="sign-top"><span class="sign-kicker">다음 역</span>${island ? '<span class="sign-kicker">미리 켠 역 다음</span>' : ''}</div>
  <div class="sign-main"><span class="sign-badge">${line}<small>${code}</small></span><div class="sign-name"><b>${name}</b><small>${nameEn}</small></div></div>
  <div class="sign-arrows"><span>← ${prev}</span><span class="sign-cells" aria-label="${halves / 2}칸 채움">${cells}</span><span>${next} →</span></div>
</section>`;
}

/** 처음 화면 차량 고르기: 같은 차량 그림 5~6대, 아이가 고른 색은 지붕 띠에만(노선 색·정오답 색과 안 겹치게) */
export const CAR_COLORS = [
  { c: '#1F3342', name: '남색' }, { c: '#00798C', name: '청록' }, { c: '#6D597A', name: '자주' },
  { c: '#9C6644', name: '갈색' }, { c: '#4F5D75', name: '회청' }, { c: '#B08A2E', name: '겨자' },
];
export function carPicker(chosen = 1) {
  return `<div class="v2-picker" role="radiogroup" aria-label="내 차량 색">${CAR_COLORS.map((k, i) => `<button class="pick${i === chosen ? ' chosen' : ''}" role="radio" aria-checked="${i === chosen}"><svg viewBox="0 0 64 40" width="96" height="60" aria-hidden="true"><path d="M5 6H50Q61 6 62 16V31Q62 34 59 34H5Q2 34 2 31V9Q2 6 5 6Z" fill="#F6F8F9" stroke="${INK}" stroke-width="2"/><rect x="5" y="8" width="44" height="5" rx="1.5" fill="${k.c}"/><rect x="7" y="16" width="34" height="9" rx="2" fill="#2F4252"/><path d="M46 15H54Q59 16 60 23H46Z" fill="#2F4252"/><circle cx="15" cy="34" r="5" fill="#3A4650" stroke="${INK}" stroke-width="1.5"/><circle cx="50" cy="34" r="5" fill="#3A4650" stroke="${INK}" stroke-width="1.5"/></svg><span>${k.name}</span></button>`).join('')}</div>`;
}

/** 축약 노선(3단계 이상, UX 8차 ⑤): 처음 두 역 + "역 N개" 생략 칸 + 끝 역. 생략 칸은 선로 위 "덮개 판" — 셀 수 없게 점을 그리지 않는다 */
export function shortRoute({ names = ['남포', '자갈치'], hidden = 9, last = '서면', lineColor = L1, k = 1.5 }) {
  const W = 520, y = 34;
  const xs = [30, 120, 400, 490];
  const out = [`<line x1="${xs[0]}" y1="${y}" x2="${xs[3]}" y2="${y}" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><line x1="${xs[0]}" y1="${y}" x2="${xs[3]}" y2="${y}" stroke="${lineColor}" stroke-width="7" stroke-linecap="round"/>`];
  // 생략 판: 선로를 덮는 흰 둥근 판 + 양쪽 물결 끊김 + 글자
  out.push(`<rect x="170" y="${y - 20}" width="180" height="40" rx="20" fill="#fff" stroke="${INK}" stroke-width="2"/>`);
  out.push(`<path d="M160 ${y - 14}q5 7 0 14t0 14M360 ${y - 14}q5 7 0 14t0 14" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`);
  out.push(`<text x="260" y="${y + 7}" text-anchor="middle" font-size="18" font-weight="800" fill="${INK}">역 ${hidden}개</text>`);
  [[xs[0], names[0]], [xs[1], names[1]], [xs[3], last]].forEach(([x, nm]) => out.push(`<circle cx="${x}" cy="${y}" r="7" fill="#fff" stroke="${INK}" stroke-width="2.5"/><text x="${x}" y="${y + 34}" text-anchor="middle" font-size="16" font-weight="700" fill="${INK}">${nm}</text>`));
  return `<svg viewBox="0 0 ${W} 76" width="${W * k}" style="max-width:100%" role="img" aria-label="${names[0]}에서 ${last}까지, 사이 역 ${hidden}개">${out.join('')}</svg>`;
}

/** 일지 큰 소식 — 역 개통 장면(높이 약 360): 승강장 + 역명판(불이 켜짐) + 들어온 열차. 애니메이션은 v2.css(.open-scene) */
export function openingScene({ name = '낫개', code = '097', prev = '다대포항', next = '신장림', vehicle = VEHICLES_V2[5] }) {
  const train = vehicleArtV2({ ...vehicle, shown: 3 });
  return `<figure class="v2-opening" aria-label="${name}역 개통">
  <svg class="op-bg" viewBox="0 0 900 340" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <rect width="900" height="340" fill="#EAF0F3"/>
    <rect y="40" width="900" height="16" fill="#CBD4DA"/>${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 96 + 30}" y="56" width="60" height="10" rx="3" fill="#FFF6D8" stroke="#CBD4DA"/>`).join('')}
    <rect y="270" width="900" height="70" fill="#D8DDD9"/><rect y="266" width="900" height="6" fill="#B9C2C8"/>
  </svg>
  <div class="op-sign"><span class="op-badge">1<small>${code}</small></span><b>${name}</b><span class="op-arrows">← ${prev} · ${next} →</span></div>
  <div class="op-train">${train}</div>
  <figcaption class="op-caption">${name}역 개통!</figcaption>
</figure>`;
}

/** 차고 카드 v2: 그림 영역(하늘색 바탕 + 선로) + 이름 + 대표 숫자 + 금 도장 칸. 종류(locked/normal/golden/special/history)는 components.css 테두리 규칙 그대로 */
export function garageCard({ tier = 5, kind = '', title, big, sub, gold = [3, 5], strip = '' }) {
  const v = VEHICLES_V2[tier];
  const art = vehicleArtV2({ ...v, shown: 2 });
  const locked = kind.includes('locked');
  return `<article class="card v2-card ${kind}">${strip}<div class="art${locked ? ' silhouette' : ''}">${art}</div><div class="body"><div class="card-name">${title ?? v.name}</div>${big ? `<div class="card-big">${big}</div>` : ''}${sub ? `<div>${sub}</div>` : ''}${gold && !locked ? `<div class="gold-track">${Array.from({ length: gold[1] }, (_, i) => `<i class="${i < gold[0] ? 'on' : ''}"></i>`).join('')}</div>` : ''}</div></article>`;
}

/** 견본 페이지 구역들 */
export function previewSections() {
  const cards = [
    garageCard({ tier: 1, big: '시내버스', sub: '부산 시내버스(일반)', gold: [3, 5] }),
    garageCard({ tier: 5, kind: 'golden', big: '8량', sub: '<b>금테 완성</b>', gold: null }),
    garageCard({ tier: 4, kind: 'locked', big: null, sub: '면허가 김해경전철 단계가 되면 받아요', gold: null }),
    garageCard({ tier: 9, big: '260 km/h', sub: '6량 · 381석', gold: [1, 10] }),
  ].join('');
  return `
<h2>2. 운행 띠 — 차내 안내 화면처럼 (높이 104, UX 8차 2.1 A)</h2>
${runBand({})}
<div style="height:10px"></div>
${runBand({ prev: '장림', next: '신평', halves: 2, litCount: 7, car: 'rail', carColor: '#6D597A', tag: '급행' })}
<p class="small">진한 판 위 흰 글자(13:1). 칸 56×22: 채움(흰) · 반 칸(빗금) · 지금 칸(점선 테 = 아직) · 빈칸(테만). 차량 44×26이 채운 만큼 칸 위를 간다. 오른쪽 40역 막대는 노선 색 채움 + ▲.</p>

<h2>3. 홈 오른쪽 — 역명판 카드 + 출발</h2>
<div class="row" style="align-items:flex-start;gap:24px"><div style="width:520px;display:grid;gap:12px">${stationSign({})}<button class="primary big v2-go">${svgIcon('depart', { size: 28 })} 출발</button></div>
<div style="width:520px">${stationSign({ name: '신평', nameEn: 'Sinpyeong', code: '102', prev: '동매', next: '하단', halves: 0, island: true })}</div></div>

<h2>4. 처음 화면 — 차량 고르기(그림 6대, 색은 지붕 띠만)</h2>
${carPicker(1)}

<h2>5. 피드백 — 도움 자리(C 위)에서</h2>
<div class="row" style="gap:24px;align-items:stretch">
 <div class="v2-help ok"><div class="fb-line">${svgIcon('check', { size: 36 })}<b>맞았어요 · 한 칸 앞으로</b></div><div class="mini-seg"><i class="cell full"></i><i class="cell full pop"></i><i class="cell empty"></i><i class="cell empty"></i>${bandVehicle({ kind: 'bus', band: '#00798C' })}</div></div>
 <div class="v2-help wait"><div class="fb-line">${svgIcon('pause', { size: 36 })}<b>버스가 잠깐 멈췄어요.</b></div><p>십의 자리도 일의 자리에 빌려 줬어요. 몇이 남았나요?</p><p class="mark-demo">400 − 2<span class="hl">3</span>7</p></div>
</div>
<p class="small">✓: 아이콘이 한 번 튀고(200ms) 새로 채운 칸이 왼쪽에서 차오름(400ms), 띠의 차량이 앞으로(600ms). ⏸: 아이콘만 서서히 나타남, 차량은 제자리에서 살짝 멈칫(브레이크, 3px). 빨강·흔들기·소리 큰 연출 없음. 짚는 곳은 밑줄 대신 굵게 + 옅은 바탕 띠(UX 8차, BDA).</p>

<h2>6. 일지 큰 소식 — 역 개통 장면</h2>
${openingScene({})}

<h2>7. 차고 카드 v2</h2>
<div class="cards v2-cards">${cards}</div>
<p class="small">1호선 차량의 스테인리스·한쪽 3문·팬터그래프는 위키(🟡) 자료다. docs/FACTS.md에 올린 뒤 쓴다(vehicle-art-v2.mjs FACTS_PENDING).</p>

<h2>8. 축약 노선 그림(3단계 이상)</h2>
${shortRoute({})}
<p class="small">생략 판이 선로를 덮는다. 판 안에는 점을 그리지 않는다(셀 수 없게). 개수는 글자로만. 양쪽 물결 = "이어져 있어요".</p>

<h2>9. 문제 판 오른쪽 위 도구 · 바탕</h2>
<div class="v2-problem"><div class="pp-tools"><button class="pp-tool" aria-label="읽어 주기">${svgIcon('read', { size: 28 })}<span>읽어 주기</span></button><button class="pp-tool" aria-label="이 문제 이상해요">${svgIcon('report', { size: 28 })}<span>이상해요</span></button></div>
<p class="problem-text">다대포해수욕장역에서 <b>373</b>명, 다대포항역에서 <b>108</b>명이 탔어요. 두 역에서 탄 사람은 모두 몇 명이에요?</p></div>
<p class="small">문제 판 바탕 #FFFDF8(아주 옅은 크림): 글자 대비 12.8:1(흰 바탕 13.0과 거의 같음). 도구는 보이는 크기 56, 누르는 영역 84(판 모서리까지).</p>
`;
}
