// 부산 교통 수학 — 차량 일러스트 v2("진짜 차량" 단계): 시각 자문 4차(visual-review-04.md 4.3)
// 1차(vehicle-art.mjs)의 원형 체계는 그대로 두고 표현만 올린다.
//  - 어두운 유리(창 띠·앞 유리), 차체 두 톤(윗면 밝게 / 아랫단 한 단계 어둡게 — 그림자 없이 면 색으로 깊이),
//    대차와 바퀴 허브, 선로 + 침목, 앞 전조등. 외곽선은 진한 2px 하나(선 문법 유지).
//  - 색은 "재질"(스테인리스·흰 도장·유리·고무·금속) 색과 노선 색 띠뿐. 도색을 지어내지 않는다.
//  - 확인 등급: 확인 안 된 모양(문 수, 팬터그래프)은 facts가 있는 차량에만 그린다. 🟡(위키)는 FACTS.md에 올린 뒤 쓴다 — 아래 FACTS_PENDING.
// 순수 함수: SVG 문자열.

const INK = '#1F3342';
const M = {
  steel: '#E4E9ED', steelLow: '#C3CCD3', paint: '#F6F8F9', paintLow: '#D5DCE1',
  glass: '#2F4252', glassHi: '#4D6476', rubber: '#3A4650', metal: '#7D8A94', light: '#FFF6D8',
  rail: '#5E6B76', sleeper: '#9AA5AD', ballast: '#D8DCD6',
};

/** FACTS.md에 아직 없는 외관 사실(교통 디자인 조사, 위키 🟡). 등록 전에는 그리지 않게 끌 수 있다. */
export const FACTS_PENDING = {
  line1Doors3: { text: '부산 1호선 1000호대: 한쪽 문 3개', src: 'https://ko.wikipedia.org/wiki/부산교통공사_1000호대_전동차', grade: '🟡' },
  line1Steel: { text: '부산 1호선: 스테인리스 차체', src: '같음', grade: '🟡' },
  line1Panto: { text: '부산 1호선: 1,500V 가공선, 팬터그래프', src: '같음', grade: '🟡' },
  line4NoPanto: { text: '부산 4호선: 제3궤조, 팬터그래프 없음, 고무바퀴', src: 'https://ko.wikipedia.org/wiki/부산_도시철도_4호선', grade: '🟡' },
};

const f = (n) => Math.round(n * 10) / 10;

function track(width, y) {
  // 자갈 띠 + 침목(짧은 막대) + 레일 한 줄 — 옆에서 본 선로
  const sl = [];
  for (let x = 6; x < width - 4; x += 14) sl.push(`<rect x="${x}" y="${y + 3}" width="8" height="3" rx="1" fill="${M.sleeper}"/>`);
  return `<rect x="0" y="${y + 2}" width="${width}" height="7" fill="${M.ballast}"/>${sl.join('')}<rect x="0" y="${y}" width="${width}" height="3" fill="${M.rail}"/>`;
}

function bogie(cx, y) {
  // 대차: 진한 틀 + 바퀴 두 개(허브 점)
  return `<rect x="${cx - 17}" y="${y - 7}" width="34" height="6" rx="2" fill="${M.rubber}"/>`
    + [cx - 9, cx + 9].map((x) => `<circle cx="${x}" cy="${y - 1}" r="5.5" fill="${M.rubber}" stroke="${INK}" stroke-width="1.5"/><circle cx="${x}" cy="${y - 1}" r="1.6" fill="${M.metal}"/>`).join('');
}

/**
 * 도시 전동차 한 칸(옆, 앞 = 오른쪽). opts: { role:'front'|'mid'|'rear', band, doors(0이면 안 그림), panto, steel }
 */
function metroCar(x, top, w, opts) {
  const h = 46, bot = top + h, rail = bot + 12;
  const nose = opts.role === 'front' ? 10 : 0, tail = opts.role === 'rear' ? 10 : 0;
  const up = opts.steel ? M.steel : M.paint, low = opts.steel ? M.steelLow : M.paintLow;
  const body = `M${x + tail} ${top}H${x + w - nose}Q${x + w} ${top} ${x + w} ${top + 12}V${bot - 3}Q${x + w} ${bot} ${x + w - 3} ${bot}H${x + 3}Q${x} ${bot} ${x} ${bot - 3}V${top + 12}Q${x} ${top} ${x + tail} ${top}Z`;
  const g = [];
  g.push(`<clipPath id="c${f(x)}"><path d="${body}"/></clipPath>`);
  g.push(`<path d="${body}" fill="${up}"/>`);
  g.push(`<rect x="${x}" y="${bot - 11}" width="${w}" height="11" fill="${low}" clip-path="url(#c${f(x)})"/>`); // 아랫단
  // 창 띠(어두운 유리) + 비스듬한 반사 두 줄
  const wx0 = x + Math.max(6, tail + 4), wx1 = x + w - Math.max(6, nose + 12);
  g.push(`<rect x="${wx0}" y="${top + 8}" width="${wx1 - wx0}" height="15" rx="3" fill="${M.glass}"/>`);
  for (let k = wx0 + 10; k < wx1 - 8; k += 26) g.push(`<path d="M${k} ${top + 22}l7 -13h5l-7 13z" fill="${M.glassHi}"/>`);
  // 문: 확인된 차량만(문 = 세로 판 + 문 창). 창 띠 위에 겹쳐 그린다
  if (opts.doors) {
    const span = (wx1 - wx0) / opts.doors;
    for (let i = 0; i < opts.doors; i++) {
      const cx = wx0 + span * (i + 0.5);
      g.push(`<rect x="${f(cx - 7)}" y="${top + 5}" width="14" height="${h - 9}" rx="1.5" fill="${up}" stroke="${INK}" stroke-width="1.2"/><rect x="${f(cx - 4.5)}" y="${top + 9}" width="9" height="13" rx="1.5" fill="${M.glass}"/><path d="M${f(cx)} ${top + 5}V${bot - 4}" stroke="${INK}" stroke-width="0.8"/>`);
    }
  }
  if (opts.band) g.push(`<rect x="${x + 1}" y="${top + 27}" width="${w - 2}" height="5" fill="${opts.band}" clip-path="url(#c${f(x)})"/>`);
  if (opts.role === 'front') {
    g.push(`<path d="M${x + w - nose - 9} ${top + 6}H${x + w - 6}Q${x + w - 1} ${top + 8} ${x + w - 1} ${top + 14}V${top + 26}H${x + w - nose - 9}Z" fill="${M.glass}"/>`);
    g.push(`<circle cx="${x + w - 4}" cy="${bot - 7}" r="2.4" fill="${M.light}" stroke="${INK}" stroke-width="1"/>`);
  }
  if (opts.role === 'rear') g.push(`<circle cx="${x + 4}" cy="${bot - 7}" r="2" fill="${M.paintLow}" stroke="${INK}" stroke-width="1"/>`);
  g.push(`<path d="${body}" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`);
  if (opts.panto) g.push(`<path d="M${x + w * 0.35} ${top}l8 -9h14l8 9M${x + w * 0.35 + 8} ${top - 9}l7 -5 7 5" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><rect x="${x + w * 0.35 + 6}" y="${top - 15}" width="18" height="2.5" rx="1" fill="${INK}"/>`);
  g.push(bogie(x + w * 0.2, rail), bogie(x + w * 0.8, rail));
  return g.join('');
}

/** 고속열차 앞 칸: 긴 코 + 이어지는 앞 유리. 형식별 차이는 확인 전이라 그리지 않는다 */
function highspeedCar(x, top, w, role) {
  const h = 44, bot = top + h, rail = bot + 12;
  const nose = role === 'front' ? 46 : 0, tail = role === 'rear' ? 46 : 0;
  const body = role === 'front'
    ? `M${x} ${top}H${x + w - nose}C${x + w - nose * 0.4} ${top} ${x + w} ${top + h * 0.55} ${x + w} ${bot - 4}Q${x + w} ${bot} ${x + w - 4} ${bot}H${x}Z`
    : role === 'rear'
    ? `M${x + tail} ${top}H${x + w}V${bot}H${x + 4}Q${x} ${bot} ${x} ${bot - 4}C${x} ${top + h * 0.55} ${x + tail * 0.4} ${top} ${x + tail} ${top}Z`
    : `M${x} ${top}H${x + w}V${bot}H${x}Z`;
  const g = [`<clipPath id="h${f(x)}"><path d="${body}"/></clipPath>`, `<path d="${body}" fill="${M.paint}"/>`, `<rect x="${x}" y="${bot - 10}" width="${w}" height="10" fill="${M.paintLow}" clip-path="url(#h${f(x)})"/>`];
  const wx0 = x + (role === 'rear' ? tail + 6 : 8), wx1 = x + w - (role === 'front' ? nose + 4 : 8);
  for (let k = wx0; k < wx1 - 10; k += 15) g.push(`<rect x="${k}" y="${top + 11}" width="10" height="10" rx="2.5" fill="${M.glass}"/>`); // 고속열차는 낱 창(작은 창이 줄지음)
  if (role === 'front') g.push(`<path d="M${x + w - nose + 4} ${top + 6}C${x + w - nose * 0.45} ${top + 4} ${x + w - 14} ${top + 12} ${x + w - 8} ${top + 22}L${x + w - nose + 4} ${top + 22}Z" fill="${M.glass}"/><circle cx="${x + w - 9}" cy="${bot - 9}" r="2.4" fill="${M.light}" stroke="${INK}" stroke-width="1"/>`);
  g.push(`<path d="${body}" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`);
  g.push(bogie(x + w * 0.22, rail), bogie(x + w * 0.78, rail));
  return g.join('');
}

function busRich(x, top, { tag } = {}) {
  const w = 190, h = 62, bot = top + h, road = bot + 10;
  const body = `M${x + 8} ${top}H${x + w - 16}Q${x + w - 2} ${top} ${x + w} ${top + 16}V${bot - 6}Q${x + w} ${bot} ${x + w - 6} ${bot}H${x + 6}Q${x} ${bot} ${x} ${bot - 6}V${top + 8}Q${x} ${top} ${x + 8} ${top}Z`;
  const g = [`<rect x="${x - 6}" y="${road - 2}" width="${w + 12}" height="6" rx="3" fill="${M.ballast}"/>`, `<clipPath id="b${x}"><path d="${body}"/></clipPath>`, `<path d="${body}" fill="${M.paint}"/>`, `<rect x="${x}" y="${bot - 14}" width="${w}" height="14" fill="${M.paintLow}" clip-path="url(#b${x})"/>`];
  g.push(`<rect x="${x + 10}" y="${top + 9}" width="${w - 52}" height="22" rx="3" fill="${M.glass}"/>`);
  for (let k = x + 22; k < x + w - 50; k += 34) g.push(`<path d="M${k} ${top + 30}l9 -20h6l-9 20z" fill="${M.glassHi}"/>`);
  g.push(`<path d="M${x + w - 38} ${top + 7}H${x + w - 16}Q${x + w - 5} ${top + 9} ${x + w - 3} ${top + 22}V${top + 40}H${x + w - 38}Z" fill="${M.glass}"/>`); // 앞 유리
  g.push(`<rect x="${x + w - 36}" y="${top + 3}" width="22" height="5" rx="1" fill="${INK}"/>`); // 행선지 판(글자 없음)
  g.push(`<rect x="${x + w - 36}" y="${top + 42}" width="14" height="${h - 46}" rx="1.5" fill="${M.paint}" stroke="${INK}" stroke-width="1.2"/>`); // 앞문(어느 버스에나 있는 문 하나만)
  g.push(`<circle cx="${x + w - 5}" cy="${bot - 10}" r="2.6" fill="${M.light}" stroke="${INK}" stroke-width="1"/>`);
  if (tag) g.push(`<rect x="${x + 60}" y="${top + 37}" width="${tag.length * 11 + 14}" height="17" rx="3" fill="${M.paint}" stroke="${INK}" stroke-width="1.5"/><text x="${x + 67}" y="${top + 50}" font-size="12" font-weight="800" fill="${INK}">${tag}</text>`);
  g.push(`<path d="${body}" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`);
  for (const cx of [x + 38, x + w - 46]) g.push(`<circle cx="${cx}" cy="${bot}" r="11" fill="${M.rubber}" stroke="${INK}" stroke-width="2"/><circle cx="${cx}" cy="${bot}" r="4.5" fill="${M.metal}"/>`);
  return { svg: g.join(''), w: w + 12, h: road + 6 };
}

/**
 * 차량 그림 v2. 1차 vehicleArt와 같은 설정(VEHICLES)을 받는다 + facts(확인된 외관)
 * @param {{arche:string, cars?:number, band?:string, tag?:string, shown?:number, facts?:{doors?:number, panto?:boolean, steel?:boolean}, title?:string}} v
 */
export function vehicleArtV2(v) {
  const a11y = v.title ? `role="img" aria-label="${v.title}"` : 'aria-hidden="true"';
  if (v.arche === 'bus') {
    const b = busRich(6, 4, { tag: v.tag });
    return `<svg ${a11y} viewBox="0 0 ${b.w} ${b.h}">${b.svg}</svg>`;
  }
  const n = Math.max(1, v.cars ?? 1);
  const shown = Math.min(n, v.shown ?? 3);
  const W = v.arche === 'highspeed' ? 150 : 96, top = 18;
  const parts = [];
  let x = 4;
  const roles = Array.from({ length: shown }, (_, i) => (i === shown - 1 ? 'front' : i === 0 && shown === n ? 'rear' : 'mid'));
  const cut = shown < n; // 뒤가 잘림: 왼쪽 끝에 생략 표시
  if (cut) { parts.push(`<path d="M${x + 2} ${top + 50}l7 -40M${x + 10} ${top + 50}l7 -40" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`); x += 22; }
  roles.forEach((role, i) => {
    parts.push(v.arche === 'highspeed' ? highspeedCar(x, top, W, role) : metroCar(x, top, W, { role, band: v.band, doors: v.facts?.doors ?? 0, panto: v.facts?.panto && i % 2 === 1, steel: v.facts?.steel }));
    x += W + 3;
  });
  const width = x + 2;
  return `<svg ${a11y} viewBox="0 0 ${width} 90">${track(width, top + 58)}${parts.join('')}</svg>`;
}

/** 11단계 v2 설정: 1차 VEHICLES 그대로 + 확인된 외관(facts). 🟡 항목은 FACTS 등록 전이면 facts를 빼고 쓴다 */
export const VEHICLES_V2 = {
  1: { name: '시내버스', arche: 'bus' },
  2: { name: '급행버스', arche: 'bus', tag: '1000번대' },
  3: { name: '도시고속버스', arche: 'bus', tag: '3000번대' },
  4: { name: '부산김해경전철', arche: 'metro', cars: 2, band: '#895FA7' },
  5: { name: '부산 도시철도(1호선)', arche: 'metro', cars: 8, band: '#F7941D', facts: { doors: 3, panto: true, steel: true }, pending: ['line1Doors3', 'line1Steel', 'line1Panto'] },
  6: { name: '동해선 광역전철', arche: 'metro', cars: 4, band: '#0065B3' },
  7: { name: '무궁화호', arche: 'metro', cars: 4, note: '기관차 원형은 1차 vehicle-art.mjs의 locoHauled를 쓴다(이 파일은 v2 표현 예시만)' },
  8: { name: 'ITX-마음', arche: 'highspeed', cars: 6, note: '간선형 — 앞모양 확인 전까지 고속 원형의 짧은 코로 그리지 말고 1차 intercity를 쓴다' },
  9: { name: 'KTX-이음', arche: 'highspeed', cars: 6 },
  10: { name: 'KTX-산천', arche: 'highspeed', cars: 10 },
  11: { name: 'KTX-청룡', arche: 'highspeed', cars: 8 },
};
