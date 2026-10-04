// 차량 그림 v2(시각 자문 4차, docs/visual/assets/v2/vehicle-art-v2.mjs를 옮김).
//  - 어두운 유리, 두 톤 차체(윗면 밝게 / 아랫단 한 단계 어둡게), 대차·허브, 선로·침목, 전조등. 외곽선은 진한 2px 하나.
//  - 색은 재질(스테인리스·흰 도장·유리·고무·금속)과 노선 색 띠뿐. 도색을 지어내지 않는다.
//  - 1호선 외관(한쪽 3문·스테인리스·팬터그래프)은 FACTS 미확인(🟡)이라 facts를 비우고 문·팬터그래프 없이 그린다(2026-10-04 결정).
//  - 무궁화호(기관차 + 객차)·ITX-마음(간선형)은 1차 원형(vehicle-art.mjs)의 모양을 v2 표현으로 그린다.
//  - silhouette: 못 얻은 카드 — 윤곽만(흰 채움 + 회색 선, 점선 바닥).
// 순수 함수(그림마다 clipPath id가 겹치지 않게 부르는 순서로 번호만 붙인다): SVG 문자열.

const INK = '#1F3342';
const MUTE = '#7A8691';
const M = {
  steel: '#E4E9ED', steelLow: '#C3CCD3', paint: '#F6F8F9', paintLow: '#D5DCE1',
  glass: '#2F4252', glassHi: '#4D6476', rubber: '#3A4650', metal: '#7D8A94', light: '#FFF6D8',
  rail: '#5E6B76', sleeper: '#9AA5AD', ballast: '#D8DCD6',
};
let uid = 0;
const f = (n) => Math.round(n * 10) / 10;

function track(width, y, sil) {
  if (sil) return `<path d="M0 ${y + 1}H${width}" stroke="${MUTE}" stroke-width="2" stroke-dasharray="6 4"/>`;
  const sl = [];
  for (let x = 6; x < width - 4; x += 14) sl.push(`<rect x="${x}" y="${y + 3}" width="8" height="3" rx="1" fill="${M.sleeper}"/>`);
  return `<rect x="0" y="${y + 2}" width="${width}" height="7" fill="${M.ballast}"/>${sl.join('')}<rect x="0" y="${y}" width="${width}" height="3" fill="${M.rail}"/>`;
}

function bogie(cx, y, sil) {
  if (sil) return [cx - 9, cx + 9].map((x) => `<circle cx="${x}" cy="${y - 1}" r="5.5" fill="#fff" stroke="${MUTE}" stroke-width="1.5"/>`).join('');
  return `<rect x="${cx - 17}" y="${y - 7}" width="34" height="6" rx="2" fill="${M.rubber}"/>`
    + [cx - 9, cx + 9].map((x) => `<circle cx="${x}" cy="${y - 1}" r="5.5" fill="${M.rubber}" stroke="${INK}" stroke-width="1.5"/><circle cx="${x}" cy="${y - 1}" r="1.6" fill="${M.metal}"/>`).join('');
}

/** 전동차·객차·기관차 한 칸(옆, 앞 = 오른쪽). o: { role, band, nose, loco, sil } */
function railCar(x, top, w, o) {
  const h = 46, bot = top + h, rail = bot + 12;
  const nose = o.role === 'front' ? o.nose ?? 10 : 0, tail = o.role === 'rear' ? o.nose ?? 10 : 0;
  const body = `M${x + tail} ${top}H${x + w - nose}Q${x + w} ${top} ${x + w} ${top + 12}V${bot - 3}Q${x + w} ${bot} ${x + w - 3} ${bot}H${x + 3}Q${x} ${bot} ${x} ${bot - 3}V${top + 12}Q${x} ${top} ${x + tail} ${top}Z`;
  if (o.sil) return `<path d="${body}" fill="#fff" stroke="${MUTE}" stroke-width="2" stroke-linejoin="round"/>` + bogie(x + w * 0.2, rail, true) + bogie(x + w * 0.8, rail, true);
  const id = `va${++uid}`;
  const g = [`<clipPath id="${id}"><path d="${body}"/></clipPath>`, `<path d="${body}" fill="${M.paint}"/>`, `<rect x="${x}" y="${bot - 11}" width="${w}" height="11" fill="${M.paintLow}" clip-path="url(#${id})"/>`];
  const wx0 = x + Math.max(6, tail + 4), wx1 = x + w - Math.max(6, nose + 12);
  if (o.loco && o.role === 'front') {
    // 기관차: 창 띠 없이 운전실 창 + 옆 환기창 줄(1차 locoHauled 원형)
    for (let i = 0; i < 4; i++) g.push(`<rect x="${x + 10 + i * 13}" y="${top + 10}" width="7" height="16" rx="1.5" fill="none" stroke="${INK}" stroke-width="1.4"/>`);
  } else {
    g.push(`<rect x="${wx0}" y="${top + 8}" width="${wx1 - wx0}" height="15" rx="3" fill="${M.glass}"/>`);
    for (let k = wx0 + 10; k < wx1 - 8; k += 26) g.push(`<path d="M${k} ${top + 22}l7 -13h5l-7 13z" fill="${M.glassHi}"/>`);
  }
  if (o.band) g.push(`<rect x="${x + 1}" y="${top + 27}" width="${w - 2}" height="5" fill="${o.band}" clip-path="url(#${id})"/>`);
  if (o.role === 'front') {
    g.push(`<path d="M${x + w - nose - 9} ${top + 6}H${x + w - 6}Q${x + w - 1} ${top + 8} ${x + w - 1} ${top + 14}V${top + 26}H${x + w - nose - 9}Z" fill="${M.glass}"/>`);
    g.push(`<circle cx="${x + w - 4}" cy="${bot - 7}" r="2.4" fill="${M.light}" stroke="${INK}" stroke-width="1"/>`);
  }
  if (o.role === 'rear') g.push(`<circle cx="${x + 4}" cy="${bot - 7}" r="2" fill="${M.paintLow}" stroke="${INK}" stroke-width="1"/>`);
  g.push(`<path d="${body}" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`);
  g.push(bogie(x + w * 0.2, rail), bogie(x + w * 0.8, rail));
  return g.join('');
}

/** 고속열차 칸: 긴 코 + 낱 창 줄. 형식별 앞모양 차이는 확인 전이라 그리지 않는다 */
function highspeedCar(x, top, w, role, sil) {
  const h = 44, bot = top + h, rail = bot + 12;
  const nose = role === 'front' ? 46 : 0, tail = role === 'rear' ? 46 : 0;
  const body = role === 'front'
    ? `M${x} ${top}H${x + w - nose}C${x + w - nose * 0.4} ${top} ${x + w} ${top + h * 0.55} ${x + w} ${bot - 4}Q${x + w} ${bot} ${x + w - 4} ${bot}H${x}Z`
    : role === 'rear'
    ? `M${x + tail} ${top}H${x + w}V${bot}H${x + 4}Q${x} ${bot} ${x} ${bot - 4}C${x} ${top + h * 0.55} ${x + tail * 0.4} ${top} ${x + tail} ${top}Z`
    : `M${x} ${top}H${x + w}V${bot}H${x}Z`;
  if (sil) return `<path d="${body}" fill="#fff" stroke="${MUTE}" stroke-width="2" stroke-linejoin="round"/>` + bogie(x + w * 0.22, rail, true) + bogie(x + w * 0.78, rail, true);
  const id = `va${++uid}`;
  const g = [`<clipPath id="${id}"><path d="${body}"/></clipPath>`, `<path d="${body}" fill="${M.paint}"/>`, `<rect x="${x}" y="${bot - 10}" width="${w}" height="10" fill="${M.paintLow}" clip-path="url(#${id})"/>`];
  const wx0 = x + (role === 'rear' ? tail + 6 : 8), wx1 = x + w - (role === 'front' ? nose + 4 : 8);
  for (let k = wx0; k < wx1 - 10; k += 15) g.push(`<rect x="${k}" y="${top + 11}" width="10" height="10" rx="2.5" fill="${M.glass}"/>`);
  if (role === 'front') g.push(`<path d="M${x + w - nose + 4} ${top + 6}C${x + w - nose * 0.45} ${top + 4} ${x + w - 14} ${top + 12} ${x + w - 8} ${top + 22}L${x + w - nose + 4} ${top + 22}Z" fill="${M.glass}"/><circle cx="${x + w - 9}" cy="${bot - 9}" r="2.4" fill="${M.light}" stroke="${INK}" stroke-width="1"/>`);
  g.push(`<path d="${body}" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`);
  g.push(bogie(x + w * 0.22, rail), bogie(x + w * 0.78, rail));
  return g.join('');
}

function bus(x, top, { tag, roof, sil } = {}) {
  const w = 190, h = 62, bot = top + h, road = bot + 10;
  const body = `M${x + 8} ${top}H${x + w - 16}Q${x + w - 2} ${top} ${x + w} ${top + 16}V${bot - 6}Q${x + w} ${bot} ${x + w - 6} ${bot}H${x + 6}Q${x} ${bot} ${x} ${bot - 6}V${top + 8}Q${x} ${top} ${x + 8} ${top}Z`;
  if (sil) return { svg: `<path d="M${x - 6} ${road}H${x + w + 6}" stroke="${MUTE}" stroke-width="2" stroke-dasharray="6 4"/><path d="${body}" fill="#fff" stroke="${MUTE}" stroke-width="2" stroke-linejoin="round"/>` + [x + 38, x + w - 46].map((cx) => `<circle cx="${cx}" cy="${bot}" r="11" fill="#fff" stroke="${MUTE}" stroke-width="2"/>`).join(''), w: w + 12, h: road + 6 };
  const id = `va${++uid}`;
  const g = [`<rect x="${x - 6}" y="${road - 2}" width="${w + 12}" height="6" rx="3" fill="${M.ballast}"/>`, `<clipPath id="${id}"><path d="${body}"/></clipPath>`, `<path d="${body}" fill="${M.paint}"/>`, `<rect x="${x}" y="${bot - 14}" width="${w}" height="14" fill="${M.paintLow}" clip-path="url(#${id})"/>`];
  if (roof) g.push(`<rect x="${x + 4}" y="${top + 2}" width="${w - 40}" height="5" rx="1.5" fill="${roof}"/>`); // 아이가 고른 색은 지붕 띠에만
  g.push(`<rect x="${x + 10}" y="${top + 9}" width="${w - 52}" height="22" rx="3" fill="${M.glass}"/>`);
  for (let k = x + 22; k < x + w - 50; k += 34) g.push(`<path d="M${k} ${top + 30}l9 -20h6l-9 20z" fill="${M.glassHi}"/>`);
  g.push(`<path d="M${x + w - 38} ${top + 7}H${x + w - 16}Q${x + w - 5} ${top + 9} ${x + w - 3} ${top + 22}V${top + 40}H${x + w - 38}Z" fill="${M.glass}"/>`);
  g.push(`<rect x="${x + w - 36}" y="${top + 3}" width="22" height="5" rx="1" fill="${INK}"/>`);
  g.push(`<rect x="${x + w - 36}" y="${top + 42}" width="14" height="${h - 46}" rx="1.5" fill="${M.paint}" stroke="${INK}" stroke-width="1.2"/>`);
  g.push(`<circle cx="${x + w - 5}" cy="${bot - 10}" r="2.6" fill="${M.light}" stroke="${INK}" stroke-width="1"/>`);
  if (tag) g.push(`<rect x="${x + 60}" y="${top + 37}" width="${tag.length * 11 + 14}" height="17" rx="3" fill="${M.paint}" stroke="${INK}" stroke-width="1.5"/><text x="${x + 67}" y="${top + 50}" font-size="12" font-weight="800" fill="${INK}">${tag}</text>`);
  g.push(`<path d="${body}" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`);
  for (const cx of [x + 38, x + w - 46]) g.push(`<circle cx="${cx}" cy="${bot}" r="11" fill="${M.rubber}" stroke="${INK}" stroke-width="2"/><circle cx="${cx}" cy="${bot}" r="4.5" fill="${M.metal}"/>`);
  return { svg: g.join(''), w: w + 12, h: road + 6 };
}

/** 11단계 차량 그림 설정. facts는 비운다(1호선 외관 FACTS 미확인). band = 노선 색(노선 차량만) */
export const VEHICLES_V2 = {
  1: { arche: 'bus' },
  2: { arche: 'bus', tag: '1000번대' },
  3: { arche: 'bus', tag: '3000번대' },
  4: { arche: 'metro', cars: 2, band: '#895FA7' },
  5: { arche: 'metro', cars: 8, band: '#F7941D' },
  6: { arche: 'metro', cars: 4, band: '#0065B3' },
  7: { arche: 'loco', cars: 4 },
  8: { arche: 'intercity', cars: 6 },
  9: { arche: 'highspeed', cars: 6 },
  10: { arche: 'highspeed', cars: 10 },
  11: { arche: 'highspeed', cars: 8 },
};

/**
 * 차량 그림. tier(1~11) 또는 직접 설정.
 * @param {{tier?:number, arche?:string, cars?:number, band?:string, tag?:string, shown?:number, title?:string, silhouette?:boolean, roof?:string}} v
 */
export function vehicleArt(v) {
  const c = { ...(v.tier ? VEHICLES_V2[v.tier] : {}), ...v };
  const sil = !!c.silhouette;
  const a11y = c.title ? `role="img" aria-label="${c.title}"` : 'aria-hidden="true"';
  if (c.arche === 'bus') {
    const b = bus(6, 4, { tag: c.tag, roof: c.roof, sil });
    return `<svg ${a11y} viewBox="0 0 ${b.w} ${b.h}" preserveAspectRatio="xMidYMax meet">${b.svg}</svg>`;
  }
  const n = Math.max(1, c.cars ?? 1);
  const shown = Math.min(n, c.shown ?? 3);
  const hs = c.arche === 'highspeed';
  const W = hs ? 150 : 96, top = 18;
  const parts = [];
  let x = 4;
  const roles = Array.from({ length: shown }, (_, i) => (i === shown - 1 ? 'front' : i === 0 && shown === n ? 'rear' : 'mid'));
  if (shown < n) { parts.push(`<path d="M${x + 2} ${top + 50}l7 -40M${x + 10} ${top + 50}l7 -40" stroke="${sil ? MUTE : INK}" stroke-width="2" stroke-linecap="round"/>`); x += 22; }
  roles.forEach((role) => {
    // 무궁화호: 앞 칸은 기관차(반듯한 앞, 창 띠 없음), 뒤는 객차. 기관차가 앞이므로 뒤 칸은 운전석 모양이 아니다
    const r = c.arche === 'loco' && role === 'rear' ? 'mid' : role;
    parts.push(hs ? highspeedCar(x, top, W, role, sil) : railCar(x, top, W, { role: r, band: c.band, nose: c.arche === 'intercity' ? 18 : c.arche === 'loco' ? 4 : 10, loco: c.arche === 'loco', sil }));
    x += W + 3;
  });
  const width = x + 2;
  return `<svg ${a11y} viewBox="0 0 ${width} 90" preserveAspectRatio="xMidYMax meet">${track(width, top + 58, sil)}${parts.join('')}</svg>`;
}
