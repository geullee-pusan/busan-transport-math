// 홈 노선도 v2(시각 자문 4차 3.1, 시안 docs/visual/assets/v2/home-map.mjs): 지형 바탕 + 실제 모양 1호선 + 개통 예정 노선
//   + 확인된 산 이름 + 환승역 배지 + 이름 겹침 피하기 + 확대 보기·미니맵 + 북쪽 표시 + 지형 출처.
// ■ 모양: 실제 역 좌표(공공데이터 15043686, busan.json의 gx, gy)로 그린다. 형제 앱의 직선화 노선도와 다르다(SPEC 9.6, 2026-10-04 결정).
// ■ 크기: 표지는 화면 px 고정. 그릴 때 지도 칸의 실제 크기(W×H)를 재서 그 크기 그대로 그린다(ResizeObserver).
//   크기 단계는 화면 위 이웃 역 간격 g(하위 20% 값)로 고른다(art/marks.js sizeTier, 시각 2차 2절). 전체 보기(g<20)는 점검·통과 표시를 생략.
// ■ 역 상태(SPEC 9.5b, art/marks.js): 꺼진 역 = 회색 빈 원(목적지가 아니면 늘 "아직", UX 8차 5a), 목적지 = 이중 고리,
//   켜짐 = 노선 색 고리(흰 구멍) + 진한 테 + 빛 테, 통과 = 켜짐 + ≫, 점검 = 켜짐 + 바깥 점선, 확정 = 꽉 참.
// ■ "지금 위치"는 내 차량 표지 하나가 맡는다. 차량은 늘 목적지 앞(미리 켠 섬 사이의 역은 회색 = 아직).
import { h } from './dom.js';
import { LINES, LINE1_NODES, stationOf, TRANSFERS } from '../engine/world.js';
import { line2Open, playableNodes } from '../engine/run.js';
import { nodeState } from '../engine/state.js';
import { FULL } from '../engine/mastery.js';
import { tierOf } from '../content/vehicles.js';
import { stationMark, stationTail, lineBadge, vehicleMarker, miniMap, sizeTier, TIERS, INK, PAPER } from './art/marks.js';
import terrain from '../data/terrain.json' with { type: 'json' };

const DONE = new Set(['lit', 'passed', 'confirmed']);
/** 지형 색: 형제 앱 SPEC 7.1과 같은 값 + 해안선(시안 TERRAIN) */
const T = { land: '#EDF1EC', sea: '#B9D4E6', coast: '#8DB3CF', river: '#9FC6DC', hill: '#DCE3D2', mountain: '#C8D6BD', high: '#9DB38E', ridge: '#86A077' };
const BADGE = { BGL: '김해', DH: '동해' }; // 'BGL'은 아이가 모르는 말(학생 #3)
const geo = (s) => ({ x: s.gx ?? s.x, y: s.gy ?? s.y });
let mapCount = 0;

/**
 * @param {object} state 앱 상태
 * @param {object} o
 * @param {string} [o.destId] 목적지 노드
 * @param {(stationId: string) => void} [o.onAnyStation] 역을 누르면(역 이야기 시트)
 * @param {boolean} [o.off] 처음 화면 배경: 모든 역이 꺼진 노선도, 차량은 다대포해수욕장 앞
 * @param {string} [o.carColor] 차량 지붕 띠 색(없으면 상태의 색)
 * @returns {HTMLElement & { setCarColor?: (c: string) => void }}
 */
export function drawMap(state, { destId, onAnyStation, off = false, carColor } = {}) {
  const idp = `hm${++mapCount}-`;
  const l1 = LINES.find((l) => l.id === '1');
  const tracks = [{ nodes: LINE1_NODES, stations: l1.stations, color: l1.color, label: '1' }];
  if (!off && line2Open(state)) {
    const l2 = LINES.find((l) => l.id === '2');
    const nodes = playableNodes('L2');
    tracks.push({ nodes, stations: nodes.map((n) => stationOf(n.id)), color: l2.color, label: '2' });
  }
  const destTrack = off ? null : tracks.find((t) => t.nodes.some((n) => n.id === destId)) ?? null;
  let view = destTrack ? 'zoom' : 'full'; // 첫 보기는 목적지 앞뒤 약 6역 확대(UX 6차 결정)
  let color = carColor ?? state.profile.color ?? INK;
  const tier = tierOf(state.activeCard ?? state.license);
  const carKind = off || tier.kind === 'bus' ? 'bus' : 'rail';

  const svgBox = h('div.hmap-svg');
  const toggle = destTrack ? h('button.hmap-toggle', { type: 'button', onclick: () => { view = view === 'zoom' ? 'full' : 'zoom'; render(); } }) : null;
  const mini = h('button.hmap-mini', { type: 'button', 'aria-label': '1호선 전체 보기', onclick: () => { view = 'full'; render(); } });
  const el = h(`div.hmap${off ? '.off' : ''}`, svgBox, toggle, mini);
  let targets = [];
  let size = [0, 0];

  function render() {
    const [W, H] = size;
    if (!W || !H) return;
    const nsOf = (n) => (off ? { status: 'open', halves: 0 } : nodeState(state, n.id));
    const info = tracks.map((tr) => {
      const nss = tr.nodes.map(nsOf);
      return { ...tr, nss, g: tr.stations.map(geo), di: tr.nodes.findIndex((n) => n.id === destId) };
    });
    // 보이는 범위(격자 칸 단위)
    let pts;
    const dt = destTrack ? info[tracks.indexOf(destTrack)] : null;
    if (view === 'zoom' && dt && dt.di >= 0) pts = dt.g.slice(Math.max(0, dt.di - 6), dt.di + 7);
    else pts = info.flatMap((t) => t.g);
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    const pad = view === 'zoom' ? 1.2 : 1.6;
    let vx = Math.min(...xs) - pad, vy = Math.min(...ys) - pad, vw = Math.max(...xs) - Math.min(...xs) + pad * 2, vh = Math.max(...ys) - Math.min(...ys) + pad * 2;
    const minSpan = view === 'zoom' ? 6 : 10; // 너무 크게 확대하지 않게
    if (vw < minSpan) { vx -= (minSpan - vw) / 2; vw = minSpan; }
    if (vh < minSpan) { vy -= (minSpan - vh) / 2; vh = minSpan; }
    const S = Math.min(W / vw, H / vh);
    const ox = (W - vw * S) / 2 - vx * S, oy = (H - vh * S) / 2 - vy * S;
    const P = (p) => [p.x * S + ox, p.y * S + oy];
    const inView = (p) => p[0] > -20 && p[0] < W + 20 && p[1] > -20 && p[1] < H + 20;

    // 크기 단계: 보이는 1호선 구간의 이웃 역 간격, 하위 20% 값(실제 좌표는 간격이 고르지 않다)
    const pos1 = info[0].g.map(P);
    const gaps = pos1.slice(1).map((p, i) => (inView(p) || inView(pos1[i]) ? Math.hypot(p[0] - pos1[i][0], p[1] - pos1[i][1]) : Infinity)).filter(Number.isFinite).sort((a, b) => a - b);
    const g = gaps.length ? gaps[Math.floor(gaps.length * 0.2)] : 40;
    const tierS = sizeTier(g);

    const out = [];
    const L = terrain.layers;
    // ── 지형 ──
    out.push(`<defs><path id="${idp}sea" d="${L.sea}" fill-rule="evenodd"/><clipPath id="${idp}seaclip"><use href="#${idp}sea" clip-rule="evenodd"/></clipPath></defs>`);
    const tf = `transform="translate(${ox} ${oy}) scale(${S})"`;
    out.push(`<rect width="${W}" height="${H}" fill="${T.land}"/>`);
    out.push(`<g ${tf}><path d="${L.hill}" fill="${T.hill}" fill-rule="evenodd"/><path d="${L.mountain}" fill="${T.mountain}" fill-rule="evenodd"/><path d="${L.high}" fill="${T.high}" fill-rule="evenodd"/>`
      + `<path d="${L.river}" fill="${T.river}" fill-rule="evenodd" stroke="${T.coast}" stroke-width="${1 / S}"/>`
      + `<use href="#${idp}sea" fill="${T.sea}" stroke="${T.coast}" stroke-width="${1.5 / S}" stroke-linejoin="round"/></g>`);
    out.push(`<g ${tf} clip-path="url(#${idp}seaclip)"><use href="#${idp}sea" fill="none" stroke="${PAPER}" stroke-opacity="0.35" stroke-width="${10 / S}" stroke-linejoin="round"/></g>`);

    // ── 개통 예정 노선(회색 점선 + 번호 배지, 확대 보기에서만 작은 회색 빈 원. 이름은 쓰지 않음) ──
    const tg = [];
    for (const line of LINES) {
      if (line.id === '1') continue;
      const pp = line.stations.map(geo).map(P);
      out.push(`<path d="M${pp.map((p) => p.join(' ')).join('L')}" fill="none" stroke="#5E6B76" stroke-width="3" stroke-dasharray="6 4" stroke-linecap="round"/>`);
      if (tierS === TIERS.zoom) for (const p of pp) if (inView(p)) out.push(`<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${PAPER}" stroke="#5E6B76" stroke-width="1.5"/>`);
      const end = pp.at(-1);
      if (inView(end)) out.push(lineBadge(end[0], end[1] - 22, BADGE[line.label] ?? line.label, line.color, 24));
      line.stations.forEach((s, i) => tg.push({ x: pp[i][0], y: pp[i][1], id: s.id, other: true }));
    }

    // ── 켤 수 있는 노선(1호선, 열렸으면 2호선 시범 구간) ──
    // 이름이 놓이면 안 되는 자리: 확대 단추, 미니맵, 북쪽 표시, 출처
    const boxes = [[0, 0, 200, 68], [W - 60, 0, W, 66], [W - 300, H - 30, W, H]];
    if (view === 'zoom' && destTrack && W >= 480) boxes.push([0, H - 160, 162, H]);
    const hit = (bx) => boxes.some((q) => bx[0] < q[2] && bx[2] > q[0] && bx[1] < q[3] && bx[3] > q[1]);
    const transfer = new Set(TRANSFERS.flatMap((t) => t.stations));
    const late = []; // 목적지 점·차량(맨 위)
    for (const t of info) {
      const pos = t.g.map(P);
      const st = t.nss.map((x) => x.status);
      const done = (i) => DONE.has(st[i]);
      const d = 'M' + pos.map((p) => p.join(' ')).join('L');
      out.push(`<path d="${d}" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${PAPER}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`);
      for (let i = 0; i < pos.length - 1; i++) if (done(i) && done(i + 1)) out.push(`<line x1="${pos[i][0]}" y1="${pos[i][1]}" x2="${pos[i + 1][0]}" y2="${pos[i + 1][1]}" stroke="${t.color}" stroke-width="7" stroke-linecap="round"/>`);
      const di = t.di;
      let car = null;
      if (di > 0) {
        const [a, b] = [pos[di - 1], pos[di]];
        const k = t.nss[di].halves / FULL;
        car = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
        if (k > 0) out.push(`<line x1="${a[0]}" y1="${a[1]}" x2="${car[0]}" y2="${car[1]}" stroke="${t.color}" stroke-width="7" stroke-linecap="round"/>`);
      } else if (di === 0) car = pos[0];
      if (off && t.label === '1') car = pos[0];
      pos.forEach((p, i) => { if (done(i)) out.push(stationTail(...p, pos[i - 1] ?? null, pos[i + 1] ?? null, t.color, tierS)); });
      const stateOf = (i) => {
        const insp = done(i) && t.nss[i].inspect;
        if (i === di) return insp ? 'check-dest' : 'dest';
        return insp ? 'check' : done(i) ? st[i] : 'locked';
      };
      const terminal = (i) => t.label === '1' && (i === 0 || i === pos.length - 1);
      pos.forEach((p, i) => { if (i !== di && inView(p)) out.push(stationMark(...p, stateOf(i), t.color, tierS, { terminal: terminal(i) })); });
      // 역 이름: 확대 = 모두, 그 밖 = 목적지·켜진 역 양 끝·환승·종점(중간 단계는 켜진 역 모두). 중요한 이름부터 자리 잡기, 겹치면 반대쪽, 그래도 겹치면 뺀다
      const litIdx = st.map((s, i) => (DONE.has(s) ? i : -1)).filter((i) => i >= 0);
      const showName = (i) => tierS === TIERS.zoom || i === di || terminal(i) || transfer.has(t.stations[i].id) || (tierS === TIERS.mid && done(i)) || i === litIdx[0] || i === litIdx.at(-1);
      const rank = (i) => (i === di ? 0 : done(i) ? 1 : transfer.has(t.stations[i].id) || terminal(i) ? 2 : 3);
      // 차량 표지 자리도 미리 잡아 둔다(이름이 차량 밑에 깔리지 않게)
      let carAt = null;
      if (car) {
        const b = pos[Math.min(Math.max(di, 0) + 1, pos.length - 1)], a = pos[Math.max(Math.max(di, 0) - 1, 0)];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const nrm = [(b[1] - a[1]) / len, -(b[0] - a[0]) / len];
        const normal = nrm[1] > 0 ? [-nrm[0], -nrm[1]] : nrm;
        const cx = car[0] + normal[0] * 27, cy = car[1] + normal[1] * 27;
        boxes.push([cx - 20, cy - 14, cx + 20, cy + 14]);
        carAt = { car, normal };
      }
      const order = pos.map((p, i) => i).filter((i) => showName(i) && inView(pos[i])).sort((p, q) => rank(p) - rank(q));
      for (const i of order) {
        const s = t.stations[i];
        const bold = done(i) || i === di;
        const size = i === di ? 20 : bold ? 18 : 16;
        const wTxt = s.name.length * size * 0.95;
        const [x, y] = pos[i];
        const gap = (i === di ? tierS.dest.r : 10) + 8;
        for (const side of [-1, 1]) {
          const x0 = side < 0 ? x - gap - wTxt : x + gap;
          const bx = [x0 - 2, y - size * 0.7, x0 + wTxt + 2, y + size * 0.5];
          if (hit(bx) || bx[0] < 2 || bx[2] > W - 2) continue;
          boxes.push(bx);
          out.push(`<text x="${side < 0 ? x - gap : x + gap}" y="${y + size * 0.35}" text-anchor="${side < 0 ? 'end' : 'start'}" font-size="${size}" font-weight="${bold ? 800 : 400}" fill="${bold ? INK : '#4A5C69'}" paint-order="stroke" stroke="${PAPER}" stroke-width="4" stroke-linejoin="round">${s.name}</text>`);
          break;
        }
      }
      // 환승역 다른 노선 배지(서면 2, 연산 3, 교대 동해, 동래 4) — 1호선에만
      if (t.label === '1') for (const tr of TRANSFERS) {
        const i = t.stations.findIndex((s) => tr.stations.includes(s.id));
        if (i < 0) continue;
        const other = tr.stations.find((id) => id !== t.stations[i].id);
        const line = LINES.find((l) => l.stations.some((s) => s.id === other));
        const [x, y] = pos[i];
        if (line && inView([x, y])) out.push(lineBadge(x + 22, y + 14, BADGE[line.label] ?? line.label, line.color, 22));
      }
      if (di >= 0) late.push(stationMark(...pos[di], stateOf(di), t.color, tierS));
      if (carAt) late.push(vehicleMarker(carAt.car[0], carAt.car[1], { kind: carKind, band: color, normal: carAt.normal, dot: tierS !== TIERS.dense }));
      if (di >= 0) late.push(stationMark(...pos[di], stateOf(di), t.color, tierS)); // 목적지는 늘 맨 위
      pos.forEach((p, i) => tg.push({ x: p[0], y: p[1], id: t.stations[i].id, node: t.nodes[i].id }));
    }
    out.push(...late);
    // ── 산 이름(FACTS ✅ 위치만: 금정산 = 서면 정북 약 14km, 황령산 = 서면 정동 약 2km. 격자 1칸 = 1km) ──
    const sm = geo(l1.stations.find((s) => s.name === '서면'));
    for (const pk of [{ name: '금정산', x: sm.x, y: sm.y - 14 }, { name: '황령산', x: sm.x + 2, y: sm.y }]) {
      const [x, y] = P(pk);
      const bx = [x - 10, y - 10, x + 14 + pk.name.length * 15, y + 8];
      if (!inView([x, y]) || hit(bx)) continue; // 역 이름이 먼저
      boxes.push(bx);
      out.push(`<g aria-hidden="true"><path d="M${x - 9} ${y + 6}L${x} ${y - 8}L${x + 9} ${y + 6}Z" fill="${T.ridge}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/><text x="${x + 13}" y="${y + 5}" font-size="15" font-weight="700" fill="#3F5531" paint-order="stroke" stroke="${T.land}" stroke-width="4">${pk.name}</text></g>`);
    }

    // 북쪽 표시 + 지형 출처(13px, 오른쪽 아래, ODbL)
    out.push(`<g transform="translate(${W - 34} 40)" aria-hidden="true"><circle r="18" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/><path d="M0 -12L6 6L0 2L-6 6Z" fill="${INK}"/><text y="-23" text-anchor="middle" font-size="13" font-weight="800" fill="${INK}">N</text></g>`);
    out.push(`<text x="${W - 10}" y="${H - 10}" text-anchor="end" font-size="13" fill="#4A5C69" paint-order="stroke" stroke="${PAPER}" stroke-width="3">지형: SRTM · © OpenStreetMap contributors</text>`);
    svgBox.innerHTML = `<svg class="map" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="부산 도시철도 노선도">${out.join('')}</svg>`;
    targets = tg;

    // 확대 보기 단추·미니맵(확대 보기에서만, UX 6차 3절)
    if (toggle) toggle.textContent = view === 'zoom' ? '1호선 전체 보기' : '가까이 보기';
    mini.hidden = !(view === 'zoom' && destTrack) || W < 480; // 휴대폰 폭에서는 미니맵이 지도를 가려서 뺀다(전체 보기 단추는 그대로)
    if (!mini.hidden) {
      const g1 = info[0].g;
      const mx = g1.map((p) => p.x), my = g1.map((p) => p.y);
      const k = Math.min(120 / (Math.max(...mx) - Math.min(...mx)), 120 / (Math.max(...my) - Math.min(...my)));
      const mp = g1.map((p) => [10 + (p.x - Math.min(...mx)) * k + (120 - (Math.max(...mx) - Math.min(...mx)) * k) / 2, 10 + (p.y - Math.min(...my)) * k]);
      const lens = mp.slice(1).map((p, i) => Math.hypot(p[0] - mp[i][0], p[1] - mp[i][1]));
      const total = lens.reduce((a, b) => a + b, 0) || 1;
      const upTo = (i) => lens.slice(0, Math.max(0, i)).reduce((a, b) => a + b, 0);
      const d1 = info[0].di;
      let litN = 0; while (litN < info[0].nss.length && DONE.has(info[0].nss[litN].status)) litN++;
      const here = d1 > 0 ? (upTo(d1 - 1) + lens[d1 - 1] * (info[0].nss[d1].halves / FULL)) / total : d1 === 0 ? 0 : upTo(litN) / total;
      mini.innerHTML = miniMap(mp, litN > 1 ? upTo(litN - 1) / total : 0, here, l1.color, { w: 140, h: 140 });
    }
  }

  // 누른 점에서 가장 가까운 역(반경 24px). 켤 수 있는 노선의 역을 조금 우선
  svgBox.addEventListener('click', (e) => {
    if (!onAnyStation) return;
    const r = svgBox.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    let best = null;
    for (const t of targets) {
      const d = Math.hypot(t.x - x, t.y - y) - (t.other ? 0 : 6);
      if (d <= 24 && (!best || d < best.d)) best = { ...t, d };
    }
    if (best) onAnyStation(best.id);
  });
  new ResizeObserver(() => {
    const w = Math.round(svgBox.clientWidth), hh = Math.round(svgBox.clientHeight);
    if (w === size[0] && hh === size[1]) return;
    size = [w, hh];
    render();
  }).observe(svgBox);
  el.setCarColor = (c) => { color = c; render(); };
  return el;
}
