// 부산 교통 수학 — 차량 일러스트 체계(옆모습) (시각 자문 1차, visual-review-01.md 6절)
// 원칙
//  1. 모든 차량은 같은 '부품'으로 그린다: 몸통(흰 채움 + 진한 선 2px), 창 띠(옅은 채움 + 1.5px), 앞 유리(진한 채움),
//     바퀴(버스) 또는 대차(열차), 바닥 선(도로·선로). 앞은 늘 오른쪽(노선도 진행 방향과 같게).
//  2. 차량을 서로 구분하는 것은 ① 원형(archetype) 모양 ② 칸 수 ③ 카드의 이름 글자다. 색으로 구분하지 않는다.
//  3. 색 띠는 '노선이 있는 차량'(도시철도·경전철·동해선)에만, 그 노선 공식 색으로. 그 밖의 차량은 띠 없음.
//     실제 도색(차체 색)은 FACTS에 없으므로 칠하지 않는다 — TODO(확인 필요).
//  4. 앞모양의 세부(코 길이 차이, 문 개수, 전조등 모양)는 확인된 자료가 없어 원형마다 하나로 통일한다.
//     KTX-이음·산천·청룡은 같은 '고속열차' 원형 + 칸 수 + 이름으로 구분한다(지어낸 차이를 그리지 않는다).
//  5. 칸 수는 FACTS 값만(1호선 8, 동해선 4, 경전철 2, 이음 6, 산천 10, 청룡 8, KTX 20, ITX-마음 4·6·8 중 하나).
//     9칸 이상은 앞 3칸 + 생략 표시 + 끝 1칸으로 그리고, 칸 수는 카드 글자로 쓴다.
// 순수 함수: SVG 문자열을 돌려준다.

const INK = '#1F3342';
const PAPER = '#FFFFFF';
const GLASS = '#DDE4E8';
const MUTE = '#7A8691';

const H = 64;         // 그림 높이(사용자 단위)
const GROUND = 54;    // 바닥 선 y
const CAR_W = 72;     // 열차 한 칸 길이
const CAR_H = 32;     // 열차 몸통 높이
const GAP = 4;        // 칸 사이(연결부)

/** 원형 정의. FACTS·형제 앱 자료로 확인된 것만 '확인됨'에 적는다. */
export const ARCHETYPES = {
  bus:        { name: '시내버스형', confirmed: '버스라는 종류(1000번대 급행, 3000번대 도시고속 등 번호 체계)', todo: '차체 색, 문 개수, 저상 여부' },
  doubleDeck: { name: '2층 버스형', confirmed: '부산시티투어버스는 2층 버스(citytourbusan.com)', todo: '앞모양, 지붕 개방 여부' },
  metro:      { name: '도시 전동차형', confirmed: '칸 수(1호선 8, 동해선 4, 김해경전철 2), 노선 색', todo: '차체 색, 문 개수, 앞모양' },
  intercity:  { name: '간선 전동차형', confirmed: 'ITX-마음 4·6·8량(🟡)', todo: '앞모양, 도색' },
  highspeed:  { name: '고속열차형', confirmed: '칸 수(이음 6, 산천 10, 청룡 8, KTX 20 🟡)', todo: '형식별 앞모양 차이, 도색, 동력차 여부' },
  locoHauled: { name: '기관차 + 객차형', confirmed: '무궁화호는 기관차 + 객차(🟡, 열차마다 칸 수 다름)', todo: '기관차 모양, 객차 수' },
  capsule:    { name: '작은 객실형', confirmed: '스카이캡슐 4인승 80대, 높이 7~10m(bluelinepark.com)', todo: '선로에 매달리는지 위에 얹히는지, 객실 모양' },
};

const f = (n) => Math.round(n * 10) / 10;

function bogies(x, w) {
  // 열차 대차: 칸 양 끝 가까이에 바퀴 두 개씩(작은 원 4개). 바퀴 수 자체는 뜻이 없음(장식 최소)
  const y = GROUND - 4;
  return [x + 12, x + 22, x + w - 22, x + w - 12].map((cx) => `<circle cx="${f(cx)}" cy="${y}" r="3.6" fill="${INK}"/>`).join('');
}

function windows(x, y, w, h, { door = false } = {}) {
  // 창 띠 하나(낱낱의 창을 그리지 않는다: 셀 거리가 생기면 아이가 창을 센다)
  return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${h}" rx="2" fill="${GLASS}" stroke="${INK}" stroke-width="1.5"/>` + (door ? '' : '');
}

/** 열차 한 칸. role: 'front' | 'mid' | 'rear'. nose: 앞모양 길이(0 = 반듯) */
function railCar(x, role, arche, { band, silhouette }) {
  const w = CAR_W;
  const top = GROUND - 8 - CAR_H;
  const bot = GROUND - 8;
  const nose = role === 'front' ? { metro: 6, intercity: 14, highspeed: 26, locoHauled: 4 }[arche] ?? 6 : 0;
  const tail = role === 'rear' ? { metro: 6, intercity: 14, highspeed: 26, locoHauled: 0 }[arche] ?? 6 : 0;
  // 몸통: 앞(오른쪽)은 nose만큼 비스듬히 내려옴, 뒤(왼쪽)도 끝 칸이면 같은 모양(양쪽 운전석)
  const d = [
    `M${f(x + tail)} ${top}`,
    `H${f(x + w - nose)}`,
    nose ? `Q${f(x + w)} ${f(top + 2)} ${f(x + w)} ${f(bot - 6)}` : `Q${f(x + w)} ${top} ${f(x + w)} ${f(top + 4)}`,
    `V${f(bot - 3)}Q${f(x + w)} ${bot} ${f(x + w - 3)} ${bot}`,
    `H${f(x + 3)}Q${x} ${bot} ${x} ${f(bot - 3)}`,
    tail ? `V${f(bot - 6)}Q${x} ${f(top + 2)} ${f(x + tail)} ${top}Z` : `V${f(top + 4)}Q${x} ${top} ${f(x + 4)} ${top}Z`,
  ].join('');
  const fill = silhouette ? PAPER : PAPER;
  const stroke = silhouette ? MUTE : INK;
  const out = [`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>`];
  if (silhouette) return out.join('');
  const wx0 = x + Math.max(8, tail + 4);
  const wx1 = x + w - Math.max(8, nose + 6);
  if (arche === 'locoHauled' && role === 'front') {
    // 기관차: 창 띠 없이 운전실 창 하나 + 옆 환기창 줄(가는 선 3개)
    out.push(`<rect x="${f(x + w - 18)}" y="${f(top + 5)}" width="10" height="9" rx="1.5" fill="${INK}"/>`);
    for (let i = 0; i < 3; i++) out.push(`<path d="M${f(x + 12 + i * 12)} ${f(top + 8)}v10" stroke="${INK}" stroke-width="1.5"/>`);
  } else {
    out.push(windows(wx0, top + 6, wx1 - wx0, 9));
  }
  if (band) out.push(`<rect x="${f(x + Math.max(3, tail * 0.6))}" y="${f(top + 19)}" width="${f(w - Math.max(3, tail * 0.6) - Math.max(3, nose * 0.6))}" height="5" fill="${band}" stroke="${INK}" stroke-width="1"/>`);
  if (role === 'front' && arche !== 'locoHauled') {
    // 앞 유리: 진한 채움(앞이 어느 쪽인지 흑백에서도 보이게)
    const gx = x + w - nose - 2;
    out.push(nose > 10
      ? `<path d="M${f(gx - 4)} ${f(top + 4)}H${f(x + w - nose * 0.55)}Q${f(x + w - 2)} ${f(top + 6)} ${f(x + w - 1)} ${f(top + 15)}H${f(gx - 4)}Z" fill="${INK}"/>`
      : `<rect x="${f(x + w - 9)}" y="${f(top + 5)}" width="6" height="11" rx="1.5" fill="${INK}"/>`);
  }
  out.push(bogies(x, w));
  return out.join('');
}

function breakMark(x) {
  // 생략 표시: 기울어진 두 줄(≈). 칸 수는 글자로 알린다
  return `<path d="M${x - 5} ${GROUND - 4}l6 -36M${x + 3} ${GROUND - 4}l6 -36" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
}

function rail(width) {
  return `<path d="M2 ${GROUND}H${width - 2}" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
}

function busBody(x, { tall = false, band, silhouette, tag }) {
  const w = 150;
  const top = tall ? 4 : 10;
  const bot = GROUND - 6;
  const stroke = silhouette ? MUTE : INK;
  const d = `M${x + 6} ${top}H${x + w - 14}Q${x + w - 2} ${top} ${x + w} ${top + 14}V${bot - 4}Q${x + w} ${bot} ${x + w - 4} ${bot}H${x + 4}Q${x} ${bot} ${x} ${bot - 4}V${top + 6}Q${x} ${top} ${x + 6} ${top}Z`;
  const out = [`<path d="${d}" fill="${PAPER}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>`];
  if (!silhouette) {
    if (tall) {
      out.push(windows(x + 8, top + 6, w - 26, 10));
      out.push(windows(x + 8, top + 24, w - 30, 10));
    } else out.push(windows(x + 8, top + 5, w - 30, 11));
    // 앞 유리(오른쪽), 행선지 판(진한 띠)
    out.push(`<path d="M${x + w - 17} ${top + 5}H${x + w - 11}Q${x + w - 4} ${top + 7} ${x + w - 2} ${top + 18}V${top + 26}H${x + w - 17}Z" fill="${INK}"/>`);
    if (band) out.push(`<rect x="${x + 4}" y="${bot - 14}" width="${w - 8}" height="5" fill="${band}" stroke="${INK}" stroke-width="1"/>`);
    if (tag) { const ty = tall ? top + 39 : top + 20; out.push(`<rect x="${x + 44}" y="${ty}" width="${tag.length * 11.5 + 10}" height="14" rx="3" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/><text x="${x + 49}" y="${ty + 11}" font-size="11" font-weight="800" fill="${INK}">${tag}</text>`); }
  }
  for (const cx of [x + 30, x + w - 32]) out.push(`<circle cx="${cx}" cy="${bot}" r="8" fill="${silhouette ? PAPER : INK}" stroke="${stroke}" stroke-width="2"/><circle cx="${cx}" cy="${bot}" r="3" fill="${PAPER}"/>`);
  return { svg: out.join(''), w };
}

function capsuleArt(silhouette) {
  // 높은 보 위의 작은 객실(4인승). 매달림/얹힘은 확인 필요 → 지금은 얹힘으로 그리고 TODO
  const stroke = silhouette ? MUTE : INK;
  return [
    `<path d="M4 22H176" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>`,
    `<path d="M30 22V${GROUND}M150 22V${GROUND}" stroke="${stroke}" stroke-width="2"/>`,
    `<path d="M2 ${GROUND}H178" stroke="${stroke}" stroke-width="2"/>`,
    `<rect x="70" y="2" width="40" height="18" rx="7" fill="${PAPER}" stroke="${stroke}" stroke-width="2"/>`,
    silhouette ? '' : `<rect x="77" y="6" width="26" height="7" rx="2" fill="${GLASS}" stroke="${INK}" stroke-width="1.5"/>`,
  ].join('');
}

/**
 * 차량 그림 하나.
 * @param {object} o
 * @param {'bus'|'doubleDeck'|'metro'|'intercity'|'highspeed'|'locoHauled'|'capsule'} o.arche 원형
 * @param {number} [o.cars] 칸 수(열차). 9 이상이면 줄여 그림
 * @param {string} [o.band] 노선 색(노선 차량만)
 * @param {string} [o.tag] 버스 옆 작은 글자(예: '급행', '1000') — 번호 체계는 FACTS ✅
 * @param {boolean} [o.silhouette] 못 얻은 카드: 윤곽만(채움 없음, 회색 선)
 */
export function vehicleArt({ arche, cars = 1, band, tag, silhouette = false, title, shown: maxShown = 8 }) {
  let body = '';
  let width = 0;
  if (arche === 'bus' || arche === 'doubleDeck') {
    const b = busBody(6, { tall: arche === 'doubleDeck', band, silhouette, tag });
    width = b.w + 12;
    body = `<path d="M2 ${GROUND + 2}H${width - 2}" stroke="${silhouette ? MUTE : INK}" stroke-width="1.5" stroke-dasharray="${silhouette ? '6 4' : 'none'}"/>` + b.svg;
  } else if (arche === 'capsule') {
    width = 180;
    body = capsuleArt(silhouette);
  } else {
    const n = Math.max(1, cars);
    // 카드·면허증은 shown: 3(앞 3칸 + 뒤 생략) — 칸이 작아지지 않게. 칸 수는 글자로 쓴다
    const shown = n <= maxShown ? Array.from({ length: n }, (_, i) => i) : maxShown <= 3 ? [...Array.from({ length: maxShown }, (_, i) => i), 'break'] : [0, 1, 2, 'break', n - 1];
    // 앞이 오른쪽: 그리는 순서는 뒤(왼쪽)부터
    const order = shown.slice().reverse();
    let x = 4;
    const parts = [];
    order.forEach((i) => {
      if (i === 'break') { parts.push(breakMark(x + 8)); x += 22; return; }
      const role = n === 1 ? 'front' : i === 0 ? 'front' : i === n - 1 ? 'rear' : 'mid';
      parts.push(railCar(x, role, arche, { band, silhouette }));
      x += CAR_W + GAP;
    });
    width = x + 2;
    body = (silhouette ? `<path d="M2 ${GROUND}H${width - 2}" stroke="${MUTE}" stroke-width="2" stroke-dasharray="6 4"/>` : rail(width)) + parts.join('');
  }
  const a11y = title ? `role="img" aria-label="${title}"` : 'aria-hidden="true"';
  return `<svg ${a11y} viewBox="0 0 ${f(width)} ${H}" preserveAspectRatio="xMidYMid meet">${body}</svg>`;
}

/** 11단계 차량 + 특별·역사 카드의 그림 설정(카드·면허증·출발 장면이 같이 쓴다) */
export const VEHICLES = {
  1: { name: '시내버스', arche: 'bus' },
  2: { name: '급행버스', arche: 'bus', tag: '1000번대' },
  3: { name: '도시고속버스', arche: 'bus', tag: '3000번대' },
  4: { name: '부산김해경전철', arche: 'metro', cars: 2, band: '#895FA7' },
  5: { name: '부산 도시철도(1호선)', arche: 'metro', cars: 8, band: '#F7941D' },
  6: { name: '동해선 광역전철', arche: 'metro', cars: 4, band: '#0065B3' },
  7: { name: '무궁화호', arche: 'locoHauled', cars: 4, note: '객차 수는 열차마다 다름 → 기관차 + 객차 3칸으로 고정(그림일 뿐, 숫자로 쓰지 않음)' },
  8: { name: 'ITX-마음', arche: 'intercity', cars: 6, note: '4·6·8량 중 6량으로 그림. 카드 글자는 "4·6·8량"' },
  9: { name: 'KTX-이음', arche: 'highspeed', cars: 6 },
  10: { name: 'KTX-산천', arche: 'highspeed', cars: 10 },
  11: { name: 'KTX-청룡', arche: 'highspeed', cars: 8 },
  special: {
    seatBus203: { name: '좌석버스 203번', arche: 'bus', tag: '203' },
    nightBus: { name: '심야버스', arche: 'bus', tag: '심야' },
    airport: { name: '공항리무진', arche: 'bus', tag: '리무진' },
    cityTour: { name: '시티투어 2층버스', arche: 'doubleDeck' },
    beachTrain: { name: '해변열차', arche: 'metro', cars: 2, todo: '칸 수·모양 확인 필요 — 확인 전에는 카드에 그림 대신 원형 윤곽만' },
    skyCapsule: { name: '스카이캡슐', arche: 'capsule' },
    ktx1: { name: 'KTX', arche: 'highspeed', cars: 20 },
  },
  history: {
    srt: { name: 'SRT', arche: 'highspeed', cars: 10 },
    mugunghwaDMU: { name: '무궁화호 동차', arche: 'intercity', cars: 3, todo: 'FACTS에 칸 수 없음 → 확인 전까지 칸 수를 그림으로 말하지 않게 3칸 고정 + 카드 글자에 칸 수 쓰지 않음' },
  },
};
