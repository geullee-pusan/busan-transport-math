// 부산 교통 수학 — 홈 노선도 v2(시안): 지형 바탕 + 1호선 + 개통 예정 노선 + 산 이름 + 내 차량
// 시각 자문 4차(docs/visual/visual-review-04.md 3.1). 표지는 ../map-marks.mjs, 지형은 terrain-busan.json.
// 좌표: 노선도 칸 단위(src/data/busan.json의 x, y) = 지형 격자 칸 단위. 화면 배율 S(칸 1 = S px)는 보기마다 정한다.
// 순수 함수: SVG 문자열을 돌려준다.
import { stationMark, stationTail, trackPath, lineBadge, vehicleMarker, sizeTier, TIERS, INK, PAPER } from '../map-marks.mjs';

/** 지형 색: 형제 앱 SPEC 7.1과 같은 값 + 해안선·물결 */
export const TERRAIN = {
  land: '#EDF1EC', sea: '#B9D4E6', seaDeep: '#A9C9DF', coast: '#8DB3CF', river: '#9FC6DC',
  hill: '#DCE3D2', mountain: '#C8D6BD', high: '#9DB38E', ridge: '#86A077',
};

/**
 * @param {object} o
 * @param {object} o.data   src/data/busan.json
 * @param {object} o.terrain terrain-busan.json
 * @param {Set<string>} o.lit 켜진 역 id, o.confirmed 확정 역 id, o.passed 통과역 id, o.check 점검 역 id
 * @param {string} o.dest 목적지 역 id
 * @param {number} o.progress 목적지까지 진행(0~1, 칸 반쪽 단위 / 4)
 * @param {[number,number,number,number]} [o.view] 보이는 범위(칸 단위 x, y, w, h). 없으면 1호선 전체
 * @param {number} o.width 화면 폭(px)
 * @param {string} [o.carColor] 아이가 고른 차량 색(지붕 띠)
 * @param {Array<{name:string,x:number,y:number,note?:string}>} [o.peaks] 산 이름(FACTS ✅만)
 * @param {string} [o.idp] 한 문서에 지도가 여럿일 때 id 앞 글자
 * @param {Record<string,{x:number,y:number}>} [o.geo] 실제 역 좌표(격자 칸 단위, 공공데이터 15043686 — 형제 앱 stations.json). 있으면 노선을 실제 모양으로 그린다(학생 #1: 직선 대각선은 가짜로 보임)
 */
export function homeMap(o) {
  const at = (s) => (o.geo?.[s.id] ? { ...s, ...o.geo[s.id] } : s);
  const l1 = o.data.lines.find((l) => l.id === '1');
  const sts = l1.stations.map(at);
  const xs = sts.map((p) => p.x), ys = sts.map((p) => p.y);
  const pad = 2.2;
  const [vx, vy, vw, vh] = o.view ?? [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + pad * 2, Math.max(...ys) - Math.min(...ys) + pad * 2];
  const S = o.width / vw; // 칸 1 = S px
  const W = o.width, H = vh * S;
  const P = (p) => [(p.x - vx) * S, (p.y - vy) * S];
  const u = 1; // 사용자 단위 = 화면 px로 그린다(표지는 화면 크기를 지킴)

  // 화면 위 역 간격 g: 보이는 구간의 가장 작은 간격
  const pos = sts.map(P);
  const inView = (p) => p[0] > -20 && p[0] < W + 20 && p[1] > -20 && p[1] < H + 20;
  const gaps = pos.slice(1).map((p, i) => (inView(p) || inView(pos[i]) ? Math.hypot(p[0] - pos[i][0], p[1] - pos[i][1]) : Infinity));
  // 실제 좌표는 역 간격이 고르지 않다 → 가장 작은 값 대신 하위 20% 값으로(한두 곳 촘촘해도 화면 전체 단계가 내려가지 않게)
  const fin = gaps.filter(Number.isFinite).sort((a, b) => a - b);
  const g = fin.length ? fin[Math.floor(fin.length * 0.2)] : 40;
  const tier = sizeTier(g);

  const out = [];
  const idp = o.idp ?? 'hm-';
  // ── 지형 ──
  const T = TERRAIN;
  out.push(`<defs><path id="${idp}sea" d="${o.terrain.layers.sea}" fill-rule="evenodd"/><clipPath id="${idp}seaclip"><use href="#${idp}sea" clip-rule="evenodd"/></clipPath></defs>`);
  const tf = `transform="translate(${-vx * S} ${-vy * S}) scale(${S})"`;
  out.push(`<rect width="${W}" height="${H}" fill="${T.land}"/>`);
  out.push(`<g ${tf}>`);
  out.push(`<path d="${o.terrain.layers.hill}" fill="${T.hill}" fill-rule="evenodd"/>`);
  out.push(`<path d="${o.terrain.layers.mountain}" fill="${T.mountain}" fill-rule="evenodd"/>`);
  out.push(`<path d="${o.terrain.layers.high}" fill="${T.high}" fill-rule="evenodd"/>`);
  out.push(`<path d="${o.terrain.layers.river}" fill="${T.river}" fill-rule="evenodd" stroke="${T.coast}" stroke-width="${1 / S}" />`);
  // 바다: 해안선(진한 물색 1.5px) + 해안에서 떨어진 곳은 한 단계 짙게(바다의 깊이감, 그림자 없이)
  out.push(`<use href="#${idp}sea" fill="${T.sea}" stroke="${T.coast}" stroke-width="${1.5 / S}" stroke-linejoin="round"/>`);
  out.push('</g>');
  // 바다 물결: 해안선을 따라 안쪽으로 번지는 흰 띠(옅게) — 지도다운 느낌, 셀 대상 아님
  out.push(`<g ${tf} clip-path="url(#${idp}seaclip)"><use href="#${idp}sea" fill="none" stroke="${PAPER}" stroke-opacity="0.35" stroke-width="${10 / S}" stroke-linejoin="round"/></g>`);

  // ── 산 이름(FACTS ✅ 값만) ──
  for (const pk of o.peaks ?? []) {
    const [x, y] = P(pk);
    if (!inView([x, y])) continue;
    out.push(`<g aria-hidden="true"><path d="M${x - 9} ${y + 6}L${x} ${y - 8}L${x + 9} ${y + 6}Z" fill="${T.ridge}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`
      + `<text x="${x + 13}" y="${y + 5}" font-size="15" font-weight="700" fill="#3F5531" paint-order="stroke" stroke="${T.land}" stroke-width="4">${pk.name}</text></g>`);
  }

  // ── 개통 예정 노선 ──
  for (const line of o.data.lines) {
    if (line.id === '1') continue;
    const pts = line.stations.map(at).map(P);
    out.push(trackPath('M' + pts.map((p) => p.join(' ')).join('L'), 'planned', line.color, { u }));
    // 개통 예정 노선에도 역 점(작은 회색 빈 원) — 확대 보기에서만. 이름은 쓰지 않음(1호선과 눈길을 다투지 않게)
    if (tier === TIERS.zoom) for (const p of pts) if (inView(p)) out.push(`<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${PAPER}" stroke="#5E6B76" stroke-width="1.5"/>`);
    const end = pts.at(-1);
    if (inView(end)) out.push(lineBadge(end[0], end[1] - 22, line.label, line.color, 24, { u }));
  }

  // ── 1호선 ──
  const d = 'M' + pos.map((p) => p.join(' ')).join('L');
  const done = (id) => o.lit.has(id) || o.confirmed?.has(id) || o.passed?.has(id) || o.check?.has(id);
  out.push(`<path d="${d}" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`);
  out.push(`<path d="${d}" fill="none" stroke="${PAPER}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`);
  for (let i = 0; i < sts.length - 1; i++) if (done(sts[i].id) && done(sts[i + 1].id)) out.push(`<line x1="${pos[i][0]}" y1="${pos[i][1]}" x2="${pos[i + 1][0]}" y2="${pos[i + 1][1]}" stroke="${l1.color}" stroke-width="7" stroke-linecap="round"/>`);
  const di = sts.findIndex((s) => s.id === o.dest);
  let car = null;
  if (di > 0) {
    const [a, b] = [pos[di - 1], pos[di]];
    car = [a[0] + (b[0] - a[0]) * o.progress, a[1] + (b[1] - a[1]) * o.progress];
    if (o.progress > 0) out.push(`<line x1="${a[0]}" y1="${a[1]}" x2="${car[0]}" y2="${car[1]}" stroke="${l1.color}" stroke-width="7" stroke-linecap="round"/>`);
  } else if (di === 0) car = pos[0];
  sts.forEach((s, i) => { if (done(s.id)) out.push(stationTail(...pos[i], pos[i - 1] ?? null, pos[i + 1] ?? null, l1.color, tier, { u })); });

  // 역 점(목적지는 맨 위에 따로)
  // 섬 사이 역(학생 #1 ⑥): 목적지 뒤, 마지막 켜진 역 앞의 꺼진 역 = "갈 수 있음"(진한 빈 원). 섬 밖은 "아직 못 감"(회색)
  const lastLit = Math.max(-1, ...sts.map((s, i) => (done(s.id) ? i : -1)));
  const stateOf = (s, i = sts.indexOf(s)) => (s.id === o.dest ? (o.check?.has(s.id) ? 'check-dest' : 'dest') : o.confirmed?.has(s.id) ? 'confirmed' : o.check?.has(s.id) ? 'check' : o.passed?.has(s.id) ? 'passed' : o.lit.has(s.id) ? 'lit' : i > di && i < lastLit ? 'reachable' : 'locked');
  sts.forEach((s, i) => { if (s.id !== o.dest) out.push(stationMark(...pos[i], stateOf(s), l1.color, tier, { u, terminal: i === 0 || i === sts.length - 1 })); });

  // 역 이름: 단계에 따라(zoom = 모두, 그 밖 = 켜진 역 양 끝·목적지·종점·환승). 흰 테두리로 지형 위에서도 읽힘
  const transfer = new Set(o.data.transfers.flatMap((t) => t.stations));
  const litIdx = sts.map((s, i) => (done(s.id) ? i : -1)).filter((i) => i >= 0);
  const showName = (s, i) => tier === TIERS.zoom || s.id === o.dest || i === 0 || i === sts.length - 1 || transfer.has(s.id) || (tier === TIERS.mid && done(s.id)) || i === litIdx[0] || i === litIdx.at(-1);
  // 이름 겹침 피하기(학생 #1 ④): 중요한 이름부터 자리를 잡고, 이미 잡힌 상자와 겹치면 반대쪽(오른쪽)에 한 번 더 시도, 그래도 겹치면 뺀다
  const boxes = [];
  const hit = (bx) => boxes.some((q) => bx[0] < q[2] && bx[2] > q[0] && bx[1] < q[3] && bx[3] > q[1]);
  const rank = (s, i) => (s.id === o.dest ? 0 : done(s.id) ? 1 : transfer.has(s.id) || i === 0 || i === sts.length - 1 ? 2 : 3);
  const order = sts.map((s, i) => i).filter((i) => showName(sts[i], i) && inView(pos[i])).sort((p, q) => rank(sts[p], p) - rank(sts[q], q));
  for (const i of order) {
    const s = sts[i];
    const bold = done(s.id) || s.id === o.dest;
    const size = s.id === o.dest ? 20 : bold ? 18 : 16;
    const wTxt = s.name.length * size * 0.95;
    const [x, y] = pos[i];
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? x - 16 - wTxt : x + 16;
      const bx = [x0 - 2, y - size * 0.7, x0 + wTxt + 2, y + size * 0.5];
      if (hit(bx)) continue;
      boxes.push(bx);
      out.push(`<text x="${side < 0 ? x - 16 : x + 16}" y="${y + size * 0.35}" text-anchor="${side < 0 ? 'end' : 'start'}" font-size="${size}" font-weight="${bold ? 800 : 400}" fill="${bold ? INK : '#5E6B76'}" paint-order="stroke" stroke="${PAPER}" stroke-width="4" stroke-linejoin="round">${s.name}</text>`);
      break;
    }
  }
  // 환승역 다른 노선 배지(1호선 위 서면 2, 연산 3, 교대 동해, 동래 4) — 기대를 만드는 장치(ux-02 2.3)
  for (const t of o.data.transfers) {
    const s1 = sts.find((s) => t.stations.includes(s.id));
    // (좌표는 at()을 거친 sts에서 가져오므로 실제 모양과 맞음)
    if (!s1) continue;
    const other = t.stations.find((id) => id !== s1.id);
    const line = o.data.lines.find((l) => l.stations.some((s) => s.id === other));
    const [x, y] = P(s1);
    if (inView([x, y])) out.push(lineBadge(x + 22, y, line.label, line.color, 22, { u }));
  }
  if (di >= 0) out.push(stationMark(...pos[di], stateOf(sts[di]), l1.color, tier, { u }));
  if (car) {
    const b = pos[Math.min(di + 1, pos.length - 1)], a = pos[Math.max(di - 1, 0)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nrm = [(b[1] - a[1]) / len, -(b[0] - a[0]) / len]; // 진행 방향의 오른쪽(이름은 왼쪽)
    out.push(vehicleMarker(car[0], car[1], { kind: 'bus', band: o.carColor ?? INK, normal: nrm[1] > 0 ? [-nrm[0], -nrm[1]] : nrm, dot: tier !== TIERS.dense, u }));
    if (di >= 0) out.push(stationMark(...pos[di], stateOf(sts[di]), l1.color, tier, { u })); // 목적지는 늘 맨 위
  }
  // 북쪽 표시 + 지형 출처(13px, 오른쪽 아래)
  out.push(`<g transform="translate(${W - 34} 34)" aria-hidden="true"><circle r="18" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/><path d="M0 -12L6 6L0 2L-6 6Z" fill="${INK}"/><text y="-21" text-anchor="middle" font-size="13" font-weight="800" fill="${INK}" dy="-2">N</text></g>`);
  out.push(`<text x="${W - 10}" y="${H - 10}" text-anchor="end" font-size="13" fill="#4A5C69" paint-order="stroke" stroke="${PAPER}" stroke-width="3">지형: SRTM · © OpenStreetMap contributors</text>`);
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="부산 도시철도 노선도">${out.join('')}</svg>`;
}
