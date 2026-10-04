// 장면·부품 그림(시각 자문 4차 docs/visual/assets/v2/scenes.mjs를 옮김). 순수 함수: SVG/HTML 문자열.
// 원칙(visual-review-04 2절): 풀이 자리(문제 판·작업대)에는 장식을 넣지 않는다. 풍부한 그림은 띠·홈·일지·차고·처음 화면에.

const INK = '#1F3342';

/** 띠 안 작은 차량(44×26): 옆모습 한 칸, 앞 = 오른쪽. kind: 'bus' | 'rail'. band = 아이가 고른 색(지붕 띠) */
export function bandVehicle({ kind = 'bus', band = INK, w = 44 } = {}) {
  const body = kind === 'bus'
    ? `<path d="M3 4H36Q42 4 43 10V20Q43 22 41 22H3Q1 22 1 20V6Q1 4 3 4Z" fill="#F6F8F9" stroke="${INK}" stroke-width="2"/><rect x="5" y="8" width="24" height="7" rx="1.5" fill="#2F4252"/><path d="M33 8H38Q41 9 41 13V15H33Z" fill="#2F4252"/><circle cx="11" cy="22" r="3.6" fill="#3A4650" stroke="${INK}" stroke-width="1.5"/><circle cx="34" cy="22" r="3.6" fill="#3A4650" stroke="${INK}" stroke-width="1.5"/>`
    : `<path d="M3 4H34Q42 4 43 12V20Q43 22 41 22H3Q1 22 1 20V6Q1 4 3 4Z" fill="#E4E9ED" stroke="${INK}" stroke-width="2"/><rect x="5" y="8" width="24" height="7" rx="1.5" fill="#2F4252"/><path d="M33 7H37Q41 9 41 14H33Z" fill="#2F4252"/><circle cx="9" cy="23" r="2.6" fill="#3A4650"/><circle cx="15" cy="23" r="2.6" fill="#3A4650"/><circle cx="30" cy="23" r="2.6" fill="#3A4650"/><circle cx="36" cy="23" r="2.6" fill="#3A4650"/>`;
  return `<svg class="band-car-svg" viewBox="0 0 44 27" width="${w}" height="${(w * 27) / 44}" aria-hidden="true">${body}<rect x="4" y="5" width="${kind === 'bus' ? 30 : 28}" height="2.5" rx="1" fill="${band}"/></svg>`;
}

/** 처음 화면 차량 고르기 색(시각 4차 3.4): 노선 색·정오답 관습 색과 겹치지 않는 6색. 실제 열차 색 이름은 쓰지 않는다(FACTS에 없음) */
export const CAR_COLORS = [
  { c: '#1F3342', name: '남색' }, { c: '#00798C', name: '청록' }, { c: '#6D597A', name: '자주' },
  { c: '#9C6644', name: '갈색' }, { c: '#4F5D75', name: '회청' }, { c: '#B08A2E', name: '겨자' },
];

/** 고르기 단추 속 버스(흰 몸통, 색은 지붕 띠에만) */
export function pickerBus(color) {
  return `<svg viewBox="0 0 64 40" aria-hidden="true"><path d="M5 6H50Q61 6 62 16V31Q62 34 59 34H5Q2 34 2 31V9Q2 6 5 6Z" fill="#F6F8F9" stroke="${INK}" stroke-width="2"/><rect x="5" y="8" width="44" height="5" rx="1.5" fill="${color}"/><rect x="7" y="16" width="34" height="9" rx="2" fill="#2F4252"/><path d="M46 15H54Q59 16 60 23H46Z" fill="#2F4252"/><circle cx="15" cy="34" r="5" fill="#3A4650" stroke="${INK}" stroke-width="1.5"/><circle cx="50" cy="34" r="5" fill="#3A4650" stroke="${INK}" stroke-width="1.5"/></svg>`;
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/**
 * 역명판 카드(홈 오른쪽, 다음 역 — 시각 4차 3.3). 이 앱만의 모양: 위 노선 색 띠 + 왼쪽 노선 원과 역 번호 + 큰 역 이름(40) + 영문(16)
 * + 아랫줄 "← 앞 역 · 칸 4개 · 다음 역 →". 실제 부산교통공사 역명판의 배치·비율은 따르지 않는다. 역 번호는 공공데이터 역 코드(095~134).
 * island: 목적지 뒤에 미리 켠 역이 있음 → "미리 켠 역 다음" 꼬리표. kicker: 위 왼쪽 글자(다음 역 / 점검할 역)
 */
export function stationSign({ name, nameEn, code, prev, next, line = '1', lineColor = '#F7941D', halves = 0, island = false, kicker = '다음 역', cells = true }) {
  const cellsHtml = Array.from({ length: 4 }, (_, i) => { const hv = halves - i * 2; return `<i class="cell ${hv >= 2 ? 'full' : hv === 1 ? 'half' : 'empty'}"></i>`; }).join('');
  const num = code && /^\d+$/.test(code) ? String(code).padStart(3, '0') : '';
  return `<section class="v2-sign" style="--lc:${lineColor}" aria-label="${esc(kicker)} ${esc(name)}">
  <div class="sign-top"><span class="sign-kicker">${esc(kicker)}</span>${island ? '<span class="sign-kicker sign-tag">미리 켠 역 다음</span>' : ''}</div>
  <div class="sign-main"><span class="sign-badge${line.length > 1 ? ' wide' : ''}">${esc(line)}${num ? `<small>${num}</small>` : ''}</span><div class="sign-name"><b>${esc(name)}</b>${nameEn ? `<small lang="en">${esc(nameEn)}</small>` : ''}</div></div>
  <div class="sign-arrows"><span>${prev ? `← ${esc(prev)}` : ''}</span>${cells ? `<span class="sign-cells" aria-label="4칸 중 ${Math.floor(halves / 2)}칸${halves % 2 ? ' 반' : ''} 채움">${cellsHtml}</span>` : ''}<span>${next ? `${esc(next)} →` : ''}</span></div>
</section>`;
}

/**
 * 일지 큰 소식 — 역 개통 장면(높이 약 360, 시각 4차 3.6): 승강장 + 역명판(꺼짐 → 켜짐 0.6~1.5초) + 들어오는 열차(1.1초) + "○○역 개통!".
 * 동작 줄이기에서는 끝 상태만(CSS). train: 열차 그림 SVG 문자열(art/vehicles.js). caption: 아래 큰 글자
 */
export function openingScene({ name, code, prev, next, line = '1', lineColor = '#F7941D', train = '', caption }) {
  const num = code && /^\d+$/.test(code) ? String(code).padStart(3, '0') : '';
  const lamps = Array.from({ length: 10 }, (_, i) => `<rect x="${i * 96 + 30}" y="56" width="60" height="10" rx="3" fill="#FFF6D8" stroke="#CBD4DA"/>`).join('');
  return `<figure class="v2-opening" style="--lc:${lineColor}" aria-label="${esc(caption)}">
  <svg class="op-bg" viewBox="0 0 900 340" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><rect width="900" height="340" fill="#EAF0F3"/><rect y="40" width="900" height="16" fill="#CBD4DA"/>${lamps}<rect y="270" width="900" height="70" fill="#D8DDD9"/><rect y="266" width="900" height="6" fill="#B9C2C8"/></svg>
  <div class="op-sign"><span class="op-badge">${esc(line)}${num ? `<small>${num}</small>` : ''}</span><b>${esc(name)}</b><span class="op-arrows">${prev ? `← ${esc(prev)}` : ''}${prev && next ? ' · ' : ''}${next ? `${esc(next)} →` : ''}</span></div>
  <div class="op-train">${train}</div>
  <figcaption class="op-caption">${esc(caption)}</figcaption>
</figure>`;
}

/** 일지 큰 소식 — 구간 그림(소식이 없는 운행, UX 8차 4.3): 앞 역 ●━[칸 4개]━○ 다음 역, 내 차량이 채운 만큼 앞에 */
export function segmentScene({ prev, next, halves = 0, lineColor = '#F7941D', car = '' }) {
  const cells = Array.from({ length: 4 }, (_, i) => { const hv = halves - i * 2; return `<i class="cell ${hv >= 2 ? 'full' : hv === 1 ? 'half' : 'empty'}"></i>`; }).join('');
  const t = Math.min(halves, 8) / 8;
  return `<figure class="v2-segment" style="--lc:${lineColor}" aria-label="${esc(prev ?? '')}에서 ${esc(next)}까지 4칸 중 ${Math.floor(halves / 2)}칸${halves % 2 ? ' 반' : ''}">
  <span class="sg-name">${esc(prev ?? '출발')}</span>
  <div class="sg-track"><span class="sg-dot done"></span><div class="sg-line"><div class="sg-fill" style="width:${t * 100}%"></div><div class="sg-car" style="left:calc(${t * 100}% - 33px)">${car}</div><div class="sg-cells">${cells}</div></div><span class="sg-dot next"></span></div>
  <span class="sg-name"><b>${esc(next)}</b></span>
</figure>`;
}

/** 시승 결과 큰 소식: 미리 켠 역이 차례로 켜지는 그림(최대 3역, ux-02 2.4). names: 역 이름들 */
export function placementScene({ names, lineColor = '#F7941D' }) {
  const shown = names.slice(0, 3);
  const items = shown.map((n, i) => `<li style="--d:${0.3 + i * 0.5}s"><svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="${lineColor}" fill-opacity="0.3"/><circle cx="20" cy="20" r="12" fill="${lineColor}" stroke="${INK}" stroke-width="2.5"/><circle cx="20" cy="20" r="5" fill="#fff" stroke="${INK}" stroke-width="1"/></svg><b>${esc(n)}</b></li>`).join('<li class="pl-gap" aria-hidden="true"></li>');
  return `<figure class="v2-placement" style="--lc:${lineColor}"><ol>${items}</ol></figure>`;
}
