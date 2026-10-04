// 부산 교통 수학 — 노선도 표지(역 점, 환승 캡슐, 노선 선, 배지, 차량 표지)
// 시각 자문 1차 + 2차 갱신(docs/visual/visual-review-02.md). 모양 규칙: ux-review-02 1.3·1.4, ux-review-06 2.2.
// ■ 크기 단위는 '화면 px'이다. 지도를 확대·축소해도 표지는 같은 화면 크기를 지킨다.
//   map.js는 지도 축척 scale(사용자 단위 1 = 화면 scale px)을 알고 있으므로 u = 1 / scale을 넘긴다
//   → 모든 반지름·굵기에 u를 곱해 사용자 단위로 그린다.
// ■ 크기 단계는 축척이 아니라 '화면 위 이웃 역 간격 g'로 고른다(ux-review-06 2.2): sizeTier(g).
//   원 지름(테 포함) ≤ 0.8g. 예외는 목적지 하나(이웃 ①② 점을 숨기고 위에 그림).
// 순수 함수: 문자열만 돌려준다(map.js에서는 같은 속성으로 s()를 부르면 된다).

export const INK = '#1F3342';
export const PAPER = '#FFFFFF';
export const MUTE = '#7A8691'; // 꺼진 것(그래픽 3:1 이상)

const LIGHT_TEXT = new Set(['#895FA7', '#0065B3']); // 흰 글자를 쓰는 노선 색(ux-review-02 1.1)

/** 크기 단계 세 가지. 값은 화면 px. r = 반지름, sw = 테 굵기, inner = 안쪽(목적지 안 고리 / 확정 노선 색 점) */
export const TIERS = {
  // g ≥ 32: 확대 보기(홈 첫 화면, 목적지 앞뒤 약 6역)
  zoom: {
    locked: { r: 5.5, sw: 2 }, reachable: { r: 6.5, sw: 2.5 }, dest: { r: 11, inner: 5, sw: 2.5 },
    lit: { r: 8, sw: 3.5 }, confirmed: { r: 8.5, inner: 3.5 }, pass: 10, names: 'all',
  },
  // 20 ≤ g < 32
  mid: {
    locked: { r: 4, sw: 1.5 }, reachable: { r: 5, sw: 2 }, dest: { r: 9, inner: 4, sw: 2.5 },
    lit: { r: 6, sw: 3 }, confirmed: { r: 6.5, inner: 2.5 }, pass: 8, names: 'lit+dest',
  },
  // g < 20: 1호선 전체 보기(촘촘한 구간 g ≈ 15)
  dense: {
    locked: null, reachable: null, dest: { r: 8, inner: 3.5, sw: 2.5 },
    lit: { r: 4.5, sw: 2.2 }, confirmed: { r: 5, inner: 0 }, pass: 0, names: 'ends', // 지름 11.2·11.5 ≤ 0.8 × 15 = 12
    // names 'ends' = 목적지, 켜진 역 중 가장 앞·가장 뒤, 환승역, 종점만. 통과역은 이름 옆 ≫(passMark)로
  },
};

/** 이웃 역 간격 g(화면 px)로 크기 단계 고르기 */
export const sizeTier = (g) => (g >= 32 ? TIERS.zoom : g >= 20 ? TIERS.mid : TIERS.dense);

/** 역 상태 6가지(SPEC 9.5b)의 뜻 — 모양 설명(흑백 구분은 채움·속 색·테 굵기가 맡는다) */
export const STATION = {
  locked: '아직 못 감: 가는 회색 빈 원(촘촘하면 그리지 않음)',
  reachable: '갈 수 있음: 진한 빈 원(촘촘하면 그리지 않음)',
  dest: '목적지(= 다음 역): 이중 고리, 늘 맨 위에',
  lit: '개통: 흰 원 + 굵은 진한 테 + 양옆 노선 색 꼬리',
  passed: '통과역: 개통 + ≫',
  confirmed: '확정: 진한 꽉 찬 원(+ 넓을 때 가운데 노선 색 점) + 꼬리',
};

/**
 * 켜진 역 양옆의 노선 색 꼬리(ux-review-06 1절). 혼자 켜진 역도 늘 "색 위의 흰 점"이 되게.
 * prev/next: 이웃 역 좌표(없으면 null). 길이 = 반지름 + 6px, 그 구간 절반을 넘지 않음.
 * 선로 바깥 테두리는 이미 그려져 있으므로 속선(7px)만 칠한다. 역 점보다 먼저 그린다.
 */
export function stationTail(x, y, prev, next, color, tier, { u = 1 } = {}) {
  const want = (tier.lit.r + 6) * u;
  return [prev, next].filter(Boolean).map(([px, py]) => {
    const dx = px - x, dy = py - y;
    const len = Math.hypot(dx, dy) || 1;
    const l = Math.min(want, len / 2);
    return `<line x1="${x}" y1="${y}" x2="${x + (dx / len) * l}" y2="${y + (dy / len) * l}" stroke="${color}" stroke-width="${7 * u}" stroke-linecap="butt"/>`;
  }).join('');
}

/** 역 점 하나. state: STATION 키. tier: sizeTier(g). u: 화면 px → 사용자 단위. 그리지 않는 상태면 '' */
export function stationMark(x, y, state, color, tier = TIERS.zoom, { u = 1, terminal = false, angle = 0 } = {}) {
  const key = state === 'passed' ? 'lit' : state;
  const S = tier[key];
  if (!S) return '';
  const r = S.r * u, sw = (S.sw ?? 0) * u;
  const out = [];
  if (terminal) out.push(`<line x1="${x - 11 * u}" y1="${y}" x2="${x + 11 * u}" y2="${y}" transform="rotate(${angle} ${x} ${y})" stroke="${INK}" stroke-width="${4 * u}" stroke-linecap="round"/>`);
  if (state === 'locked') out.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${PAPER}" stroke="${MUTE}" stroke-width="${sw}"/>`);
  else if (state === 'reachable') out.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${PAPER}" stroke="${INK}" stroke-width="${sw}"/>`);
  else if (state === 'dest') {
    out.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${PAPER}" stroke="${INK}" stroke-width="${sw}"/>`);
    out.push(`<circle cx="${x}" cy="${y}" r="${S.inner * u}" fill="${PAPER}" stroke="${INK}" stroke-width="${sw}"/>`);
  } else if (state === 'confirmed') {
    out.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}" stroke="${PAPER}" stroke-width="${1.5 * u}"/>`);
    if (S.inner) out.push(`<circle cx="${x}" cy="${y}" r="${S.inner * u}" fill="${color}"/>`);
  } else {
    // lit, passed: 흰 원 + 굵은 진한 테. 노선 색 고리는 같은 색 선로에 묻혀서 쓰지 않는다
    out.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${PAPER}" stroke="${INK}" stroke-width="${sw}"/>`);
    if (state === 'passed' && tier.pass) out.push(passMark(x + (r + 3 * u), y - (r + 6 * u), u * (tier.pass / 10)));
  }
  return out.join('');
}

/** 통과 표시 ≫: 글자가 아니라 선(기기마다 글꼴이 달라도 같은 모양). 흰 테두리로 선로 위에서도 보이게. */
export function passMark(x, y, k = 1) {
  const d = `M${x - 5 * k} ${y - 4.5 * k}l${4 * k} ${4.5 * k}-${4 * k} ${4.5 * k}M${x + 0.5 * k} ${y - 4.5 * k}l${4 * k} ${4.5 * k}-${4 * k} ${4.5 * k}`;
  return `<path d="${d}" fill="none" stroke="${PAPER}" stroke-width="${5 * k}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${INK}" stroke-width="${2.2 * k}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** 환승역 캡슐. 상태 규칙은 역 점과 같고 모양만 둥근 사각. angle = 노선 방향(도). 크기는 단계별(화면 px) */
const CAPSULE = { zoom: [26, 16], mid: [20, 13], dense: [16, 11] };
export function transferMark(x, y, state, color, tier = TIERS.zoom, { angle = 0, u = 1 } = {}) {
  const key = tier === TIERS.dense ? 'dense' : tier === TIERS.mid ? 'mid' : 'zoom';
  // 촘촘해도 환승역은 그린다(늘 보이는 기준점)
  const [w, h] = CAPSULE[key].map((v) => v * u);
  const sw = (key === 'zoom' ? 3.5 : key === 'mid' ? 3 : 2.5) * u;
  const rect = (pad, fill, extra = '') => `<rect x="${x - w / 2 - pad}" y="${y - h / 2 - pad}" width="${w + pad * 2}" height="${h + pad * 2}" rx="${h / 2 + pad}" fill="${fill}" ${extra}/>`;
  const g = [];
  if (state === 'locked') g.push(rect(0, PAPER, `stroke="${MUTE}" stroke-width="${2 * u}"`));
  else if (state === 'reachable' || state === 'dest') {
    g.push(rect(0, PAPER, `stroke="${INK}" stroke-width="${2.5 * u}"`));
    if (state === 'dest') g.push(rect(-h * 0.28, PAPER, `stroke="${INK}" stroke-width="${2.5 * u}"`));
  } else if (state === 'confirmed') {
    g.push(rect(0, INK, `stroke="${PAPER}" stroke-width="${1.5 * u}"`));
    if (key !== 'dense') g.push(rect(-h * 0.3, color));
  } else g.push(rect(0, PAPER, `stroke="${INK}" stroke-width="${sw}"`));
  const body = `<g transform="rotate(${angle} ${x} ${y})">${g.join('')}</g>`;
  return state === 'passed' && tier.pass ? body + passMark(x + w / 2 + 3 * u, y - h / 2 - 6 * u, u * (tier.pass / 10)) : body;
}

/** 노선 번호 배지. 한 글자 = 원, 두 글자 이상 = 캡슐(ux-review-02a 2절). size(화면 px): 32(홈·띠) / 24(카드·일지·전체 보기) */
export function lineBadge(x, y, label, color, size = 32, { u = 1 } = {}) {
  const S = size * u;
  const wide = label.length > 1;
  const fs = wide ? S * 0.5 : S * 0.62;
  const txt = LIGHT_TEXT.has(color.toUpperCase()) ? PAPER : INK;
  const w = wide ? fs * 0.62 * label.length + S * 0.6 + (/[가-힣]/.test(label) ? fs * 0.35 * label.length : 0) : S;
  const shape = wide
    ? `<rect x="${x - w / 2}" y="${y - S / 2}" width="${w}" height="${S}" rx="${S / 2}" fill="${color}" stroke="${INK}" stroke-width="${1.5 * u}"/>`
    : `<circle cx="${x}" cy="${y}" r="${S / 2}" fill="${color}" stroke="${INK}" stroke-width="${1.5 * u}"/>`;
  return `<g class="line-badge">${shape}<text x="${x}" y="${y}" dy="0.36em" text-anchor="middle" font-size="${fs}" font-weight="800" fill="${txt}">${label}</text></g>`;
}

/** 노선 선. kind: 'lit'(켜짐) / 'empty'(빈 선로) / 'planned'(개통 예정) / 'branch'(정비창 곁가지). 굵기는 화면 px 고정(u) */
export function trackPath(d, kind, color, { u = 1 } = {}) {
  if (kind === 'planned') return `<path d="${d}" fill="none" stroke="#5E6B76" stroke-width="${3 * u}" stroke-dasharray="${6 * u} ${4 * u}" stroke-linecap="round"/>`;
  if (kind === 'branch') return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${3 * u}" stroke-dasharray="${6 * u} ${4 * u}" stroke-linecap="round"/>`;
  // 바깥 10px 진한 테두리 + 속 7px. 빈 선로는 속이 흰색. 반드시 '한 줄(path 하나)'로 그린다
  // — 역마다 끊어 그리면 둥근 끝이 겹쳐 사다리 무늬가 생긴다(배포판 홈에서 보임).
  // 그리는 순서: 바깥 테두리 → 흰 속선 → 켜진 구간 속선 → 진행 속선 → 꼬리(stationTail) → 역 점 → 이름 → 차량
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${10 * u}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${kind === 'lit' ? color : PAPER}" stroke-width="${7 * u}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/**
 * 내 차량 표지 — "지금 위치"는 이것 하나가 맡는다(지금 역 고리는 없앰, ux-review-06 2.3).
 * 흰 몸통 + 진한 테두리 + 아이가 고른 색은 지붕 띠에만. kind: 'bus' | 'rail'. dir: 1(오른쪽) / -1.
 * (x, y) = 선로 위 진행 자리(사용자 단위). 표지는 선로 수직 방향 normal(단위 벡터)으로 18px 띄우고 지시선으로 잇는다
 * — 목적지 점과 이웃 역을 가리지 않게. normal은 역 이름이 있는 쪽의 반대쪽. 표지 크기는 화면 px 고정(u).
 */
export function vehicleMarker(x, y, { kind = 'bus', band = INK, dir = 1, parked = false, normal = [0, -1], u = 1, dot = true } = {}) {
  const w = 30, h = 18;
  const nose = kind === 'bus' ? 3 : 7;
  const x0 = -w / 2, y0 = -h / 2;
  const [nx, ny] = normal;
  const off = 18 + h / 2;
  const cx = x + nx * off * u, cy = y + ny * off * u;
  const body = `M${x0 + 3} ${y0}H${w / 2 - nose}Q${w / 2} ${y0} ${w / 2} ${y0 + nose}V${h / 2 - 3}Q${w / 2} ${h / 2} ${w / 2 - 3} ${h / 2}H${x0 + 3}Q${x0} ${h / 2} ${x0} ${h / 2 - 3}V${y0 + 3}Q${x0} ${y0} ${x0 + 3} ${y0}Z`;
  const parts = [
    `<path d="${body}" fill="${PAPER}" stroke="${PAPER}" stroke-width="6" stroke-linejoin="round"/>`,
    `<path d="${body}" fill="${PAPER}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`,
    `<rect x="${x0 + 2}" y="${y0 + 2}" width="${w - 4 - nose / 2}" height="4" rx="1" fill="${band}"/>`,
    `<rect x="${x0 + 4}" y="${y0 + 8}" width="6" height="5" rx="1" fill="none" stroke="${INK}" stroke-width="1.5"/>`,
    `<rect x="${x0 + 12}" y="${y0 + 8}" width="6" height="5" rx="1" fill="none" stroke="${INK}" stroke-width="1.5"/>`,
    kind === 'bus'
      ? `<circle cx="${x0 + 7}" cy="${h / 2 + 1}" r="2.6" fill="${INK}"/><circle cx="${w / 2 - 7}" cy="${h / 2 + 1}" r="2.6" fill="${INK}"/>`
      : `<rect x="${w / 2 - 9}" y="${y0 + 7}" width="6" height="6" rx="1" fill="${INK}"/>`,
  ];
  const park = parked ? `<g transform="translate(${dir * (w / 2 + 12)} ${-h / 2 - 6})"><circle r="8" fill="${PAPER}" stroke="${INK}" stroke-width="2"/><path d="M-2.2 -3.2v6.4M2.2 -3.2v6.4" stroke="${INK}" stroke-width="2" stroke-linecap="round"/></g>` : '';
  // 지시선: 선로 위 진행 자리의 작은 진한 점(r 3.5) → 표지 가장자리. 진한 2px + 흰 테
  const ex = x + nx * 18 * u, ey = y + ny * 18 * u;
  const lead = `<line x1="${x}" y1="${y}" x2="${ex}" y2="${ey}" stroke="${PAPER}" stroke-width="${5 * u}" stroke-linecap="round"/><line x1="${x}" y1="${y}" x2="${ex}" y2="${ey}" stroke="${INK}" stroke-width="${2 * u}" stroke-linecap="round"/>` + (dot ? `<circle cx="${x}" cy="${y}" r="${3.5 * u}" fill="${INK}" stroke="${PAPER}" stroke-width="${1.5 * u}"/>` : '');
  return `<g class="my-train">${lead}<g transform="translate(${cx} ${cy}) scale(${u})"><g transform="scale(${dir} 1)">${parts.join('')}</g>${park}</g></g>`;
}

/** 역 이름 글자(화면 px). 어떤 이름을 쓸지는 tier.names: zoom = 모두, mid = 켜진 역·목적지·환승·종점, dense = 목적지·켜진 역 양 끝·환승·종점 */
export const STATION_NAME = {
  'regular-mute': { size: 16, weight: 400, fill: '#5E6B76' },
  regular: { size: 16, weight: 400, fill: INK },
  bold: { size: 18, weight: 800, fill: INK },
  dest: { size: 20, weight: 800, fill: INK }, // 목적지 + "다음 역 · N칸"
  halo: { stroke: PAPER, width: 4 }, // 이름 뒤 흰 테두리(paint-order: stroke)
};

/**
 * 미니맵(확대 보기 구석, ux-review-06 3절): 1호선 전체를 가는 선으로. 채운 길이 + 지금 위치 ▲. 역 점·이름 없음.
 * points: 미니맵 상자(w×h) 안으로 맞춘 [x, y] 배열(노선 순서). lit: 채운 길이 비율(0~1, 켜진 구간 끝까지의 노선 길이 비율)
 * here: 지금 위치 비율(0~1). 누르면 [1호선 전체 ⤢]와 같은 동작.
 */
export function miniMap(points, lit, here, color, { w = 140, h = 140 } = {}) {
  const d = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('');
  const lens = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  const total = lens.reduce((a, b) => a + b, 0);
  let left = total * here, k = 0;
  while (k < lens.length - 1 && left > lens[k]) left -= lens[k++];
  const a = points[k], b = points[k + 1] ?? points[k];
  const t = lens[k] ? Math.min(1, left / lens[k]) : 0;
  const [hx, hy] = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="1호선 전체에서 지금 위치">`
    + `<rect x="0.75" y="0.75" width="${w - 1.5}" height="${h - 1.5}" rx="10" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>`
    + `<path d="${d}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="${d}" fill="none" stroke="${PAPER}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`
    + (lit > 0 ? `<path d="${d}" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="butt" stroke-linejoin="round" pathLength="1" stroke-dasharray="${lit} 2"/>` : '')
    + `<path d="M${hx} ${hy - 5}l-6 -10h12z" fill="${INK}" stroke="${PAPER}" stroke-width="1.5" stroke-linejoin="round"/>`
    + `</svg>`;
}
