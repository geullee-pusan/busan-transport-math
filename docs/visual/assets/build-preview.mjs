// 견본 페이지와 아이콘 스프라이트를 만든다: node docs/visual/assets/build-preview.mjs
// 결과: docs/visual/assets/preview.html(바깥 파일 없이 혼자 열림), docs/visual/assets/icons.svg
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ICONS, svgIcon, iconSprite } from './icons.mjs';
import { stationMark, stationTail, transferMark, lineBadge, trackPath, vehicleMarker, miniMap, sizeTier, TIERS } from './map-marks.mjs';
import { vehicleArt, VEHICLES, ARCHETYPES } from './vehicle-art.mjs';
import { FIG, hatchDefs, peopleRow, figCar } from './figure-kit.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(here, 'tokens.css'), 'utf8') + readFileSync(resolve(here, 'components.css'), 'utf8');
writeFileSync(resolve(here, 'icons.svg'), iconSprite());

const L1 = '#F7941D';
const lines = [['1', '#F7941D'], ['2', '#AFD46B'], ['3', '#D69B3D'], ['4', '#6E8CC0'], ['BGL', '#895FA7'], ['동해', '#0065B3']];

// ── 아이콘 표 ──
const groups = {};
for (const [k, v] of Object.entries(ICONS)) (groups[v.group] ??= []).push([k, v]);
const iconHtml = Object.entries(groups).map(([g, list]) => `<h3>${g}</h3><div class="icon-grid">${list.map(([k, v]) => `
  <figure><div class="ic-row">${svgIcon(k, { size: 24 })}${svgIcon(k, { size: 28 })}${svgIcon(k, { size: 32 })}</div>
  <figcaption><b>${v.label}</b><code>${k}</code>${v.note ? `<small>${v.note}</small>` : ''}</figcaption></figure>`).join('')}</div>`).join('');

// ── 노선도 표지 ──
const states = [['locked', '아직 못 감'], ['reachable', '갈 수 있음'], ['dest', '목적지 = 다음 역'], ['lit', '개통'], ['passed', '통과역'], ['confirmed', '확정']];
// 한 줄 노선 견본: 간격 g(화면 px)마다 같은 상태 순서를 그린다. 화면 px = 사용자 단위(u = 1)
const seq = ['lit', 'lit', 'confirmed', 'passed', 'lit', 'dest', 'reachable', 'locked', 'locked', 'locked', 'locked', 'lit', 'locked', 'locked'];
const DONE = new Set(['lit', 'passed', 'confirmed']);
function lineDemo(g, y = 40) {
  const tier = sizeTier(g);
  const x0 = 30;
  const pts = seq.map((_, i) => [x0 + i * g, y]);
  const out = [trackPath(`M${pts[0][0]} ${y}H${pts.at(-1)[0]}`, 'empty')];
  for (let i = 0; i < seq.length - 1; i++) if (DONE.has(seq[i]) && DONE.has(seq[i + 1])) out.push(`<line x1="${pts[i][0]}" y1="${y}" x2="${pts[i + 1][0]}" y2="${y}" stroke="${L1}" stroke-width="7"/>`);
  // 목적지까지 진행(칸 2/4)
  out.push(`<line x1="${pts[4][0]}" y1="${y}" x2="${pts[4][0] + g * 0.5}" y2="${y}" stroke="${L1}" stroke-width="7"/>`);
  seq.forEach((s, i) => { if (DONE.has(s)) out.push(stationTail(pts[i][0], y, pts[i - 1] ?? null, pts[i + 1] ?? null, L1, tier)); });
  // 목적지는 맨 위: 먼저 나머지, 그다음 목적지
  seq.forEach((s, i) => { if (s !== 'dest') out.push(stationMark(pts[i][0], y, s, L1, tier)); });
  const destMarks = seq.map((s, i) => (s === 'dest' ? stationMark(pts[i][0], y, s, L1, tier) : '')).join('');
  out.push(vehicleMarker(pts[4][0] + g * 0.5, y, { kind: 'bus', band: '#00798C', normal: [0, -1], dot: g >= 20 }));
  out.push(destMarks); // 목적지는 늘 맨 위
  return `<svg viewBox="0 0 ${x0 * 2 + (seq.length - 1) * g} ${y + 26}" class="mapdemo" style="background:#EDF1EC;max-width:${x0 * 2 + (seq.length - 1) * g}px">${out.join('')}</svg>`;
}
const markSvg = () => [37, 26, 15].map((g) => `<p class="small">g = ${g}px (${g >= 32 ? '확대 보기' : g >= 20 ? '중간' : '1호선 전체, 촘촘한 구간'}) — 켜짐 · 켜짐 · 확정 · 통과 · 켜짐 · 목적지(진행 2/4, 내 차량) · 갈 수 있음 · 못 감 … · 혼자 켜진 역(꼬리) · 못 감</p>${lineDemo(g, 52)}`).join('')
  + `<svg viewBox="0 0 760 50" class="mapdemo" style="background:#EDF1EC">${[['locked', '꺼짐'], ['lit', '켜짐'], ['confirmed', '확정'], ['dest', '목적지']].map(([s, n], i) => `${transferMark(40 + i * 150, 25, s, L1)}<text x="${64 + i * 150}" y="30" font-size="14" fill="#1F3342">환승 ${n}</text>`).join('')}${lineBadge(640, 25, '2', '#AFD46B', 24)}${lineBadge(672, 25, '동해', '#0065B3', 24)}</svg>`;
const trackSvg = `<svg viewBox="0 0 760 220" class="mapdemo" style="background:#EDF1EC">
  <rect x="0" y="120" width="760" height="100" fill="#B9D4E6"/>
  ${trackPath('M40 40H330', 'lit', L1)}<text x="350" y="46" font-size="15" fill="#1F3342">켜진 구간: 테두리 10 + 노선 색 7</text>
  ${trackPath('M40 85H330', 'empty')}<text x="350" y="91" font-size="15" fill="#1F3342">빈 선로: 테두리 10 + 흰 속 7 (한 줄로 그림)</text>
  ${trackPath('M40 140H330', 'lit', '#AFD46B')}<text x="350" y="146" font-size="15" fill="#1F3342">2호선 연두도 바다 위에서 보임(테두리 덕분)</text>
  ${trackPath('M40 180H330', 'planned')}<text x="350" y="186" font-size="15" fill="#1F3342">개통 예정: #5E6B76 3px 점선 6/4 (바다 위 3.55)</text>
  ${trackPath('M40 205H200', 'branch')}<text x="350" y="210" font-size="15" fill="#1F3342">정비창 곁가지: 진한 3px 점선</text>
</svg>`;
const mini = miniMap([[20, 125], [40, 110], [62, 92], [80, 70], [92, 50], [100, 30], [110, 14]], 0.32, 0.36, L1);
const markerSvg = `<div class="row" style="align-items:flex-start">${mini}<p class="small" style="max-width:420px">미니맵(확대 보기 구석, 140px): 1호선 전체 가는 선 + 채운 길이 + 지금 위치 ▲. 역 점·이름 없음. 누르면 [1호선 전체 ⤢]와 같은 동작. 좌표는 견본용 단순화.</p></div>`;
const badges = `<svg viewBox="0 0 520 60" class="mapdemo" style="background:#FFFFFF">${lines.map(([l, c], i) => lineBadge(30 + i * 80 + (l.length > 1 ? 10 : 0), 30, l, c, 32)).join('')}</svg>`;

// ── 차량 ──
const tierCards = Object.entries(VEHICLES).filter(([k]) => /^\d+$/.test(k)).map(([k, v]) => `<figure class="veh">${vehicleArt({ ...v, title: v.name })}<figcaption>${k}. ${v.name}${v.note ? `<small>${v.note}</small>` : ''}</figcaption></figure>`).join('');
const specials = [...Object.values(VEHICLES.special), ...Object.values(VEHICLES.history)].map((v) => `<figure class="veh">${vehicleArt({ ...v, title: v.name })}<figcaption>${v.name}${v.todo ? `<small>TODO(확인 필요): ${v.todo}</small>` : ''}</figcaption></figure>`).join('');
const archeTable = Object.entries(ARCHETYPES).map(([k, a]) => `<tr><td><code>${k}</code></td><td>${a.name}</td><td>${a.confirmed}</td><td>${a.todo}</td></tr>`).join('');

// ── 카드 5종 + 면허증 ──
const v5 = VEHICLES[5];
const card = (cls, strip, extra) => `<article class="card ${cls}">${strip ?? ''}<div class="art">${vehicleArt({ ...v5, shown: 3, silhouette: cls === 'locked' })}</div><div class="body"><div class="card-name">부산 도시철도</div>${extra}</div><div class="card-src">출처: 부산교통공사 운영실적 · 2026년 10월 기준</div></article>`;
const gold = (n, need) => `<div class="gold-track" aria-label="금 도장 ${n} / ${need}">${Array.from({ length: need }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div><div>금 도장 ${n} / ${need}</div>`;
const cards = [
  card('locked', null, '<div class="how-to-get">면허가 도시철도 단계가 되면 받아요</div>'),
  card('', null, `<div class="card-big">8량</div>${gold(3, 5)}`),
  card('golden', null, '<div class="card-big">8량</div><div><b>금테 완성</b></div>'),
  card('', '<div class="strip"><span>특별</span></div>', '<div class="card-big">8량</div><div>환승역 3곳을 켜서 받았어요</div>'),
  card('history', '<div class="strip"><span>운행 기록 2016.12–2026.8</span></div>', '<div class="card-big">300 km/h로 달렸어요</div>'),
  card('history golden', '<div class="strip"><span>운행 기록 2016.12–2026.8</span><span>★</span></div>', '<div class="card-big">300 km/h로 달렸어요</div><div><b>금테 완성</b></div>'),
].join('');
const license = `<article class="license-card"><div class="lc-head"><span>운행 면허</span><span>부산 교통 수학</span></div><div class="lc-art">${vehicleArt({ ...VEHICLES[9], shown: 2 })}</div><div class="lc-body"><div>도윤 기관사</div><div class="lc-tier">KTX-이음 운행 허가</div><div>발급 2026년 10월 4일</div><div class="why-off">시청 · 연산 · 교대역에서 이 단계 문제를 풀어서 올랐어요.</div></div></article>`;

// ── 문제 그림 ──
const trainFig = `<svg viewBox="0 0 470 50" class="figdemo"><defs>${hatchDefs}</defs>${Array.from({ length: 8 }, (_, i) => figCar(10 + (7 - i) * 56, 10, 52, 30, { state: i < 3 ? 'full' : i === 3 ? 'half' : 'empty', front: i === 0, mark: i === 6 })).join('')}</svg>`;
const peopleFig = `<svg viewBox="0 0 300 70" class="figdemo">${peopleRow(13, 6, 4, 22)}</svg>`;
const ticks = `<div style="display:flex;gap:6px"><i class="tick full"></i><i class="tick full"></i><i class="tick half"></i><i class="tick"></i></div>`;

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>시각 체계 견본</title><style>${css}
body{margin:0;padding:24px;max-width:1440px;margin:auto}
h1{font-size:28px;margin:0 0 4px} h2{font-size:22px;margin:40px 0 8px;border-bottom:2px solid var(--ink);padding-bottom:4px} h3{font-size:18px;margin:20px 0 8px}
.lead{font-size:16px;color:var(--ink-2)}
.icon-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.icon-grid figure{margin:0;background:var(--paper);border-radius:12px;padding:12px;display:grid;gap:6px}
.ic-row{display:flex;gap:14px;align-items:end;color:var(--ink)}
figcaption{display:grid;gap:2px;font-size:15px} figcaption small{color:var(--ink-2);font-size:13px} code{font-size:12px;color:var(--ink-3)}
.mapdemo{width:100%;max-width:900px;display:block;border-radius:12px;margin:8px 0}
.row{display:flex;gap:16px;flex-wrap:wrap;align-items:center;margin:10px 0}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
.veh-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:12px}
.veh{margin:0;background:var(--paper);border-radius:12px;padding:10px;display:grid;gap:6px} .veh svg{width:100%;height:72px}
table{border-collapse:collapse;font-size:14px;background:var(--paper)} td,th{border:1px solid var(--soft);padding:6px 8px;text-align:left}
.figdemo{width:100%;max-width:520px;background:var(--paper);border-radius:12px;display:block;margin:6px 0}
.gray-on{filter:grayscale(1)}
.toggle-bw{position:fixed;right:16px;top:16px;z-index:5}
.swatch-row{display:flex;flex-wrap:wrap;gap:8px}.sw{width:150px;border-radius:10px;overflow:hidden;background:var(--paper);font-size:13px}.sw i{display:block;height:44px}.sw span{display:block;padding:6px 8px}
.license-card{max-width:560px}
</style></head><body>
${iconSprite()}
<button class="secondary toggle-bw" onclick="document.body.classList.toggle('gray-on')">흑백으로 보기</button>
<h1>부산 교통 수학 — 시각 체계 견본</h1>
<p class="lead">시각 자문 1차(docs/visual/visual-review-01.md)의 조각을 한 장에 모았다. "흑백으로 보기"로 모든 상태가 모양만으로 구분되는지 확인한다. 이 파일은 node docs/visual/assets/build-preview.mjs로 다시 만든다.</p>

<h2>1. 선 문법</h2>
<div class="row">
 <button class="secondary" style="border-style:dashed;border-color:var(--line-mute);background:var(--mist);color:var(--ink-3)">점선 = 아직</button>
 <span style="font-size:24px">KTX-청룡 515석 중 <b class="num virtual">278</b>석</span><span class="small">← 점점이 = 만든 숫자(이 뜻 하나)</span>
 <button class="secondary">실선 2px = 있음</button>
 <button class="choice chosen" style="min-width:140px">(가)</button><span class="small">← 굵은 4px + ✓ = 고름</span>
 <div class="license-card" style="width:120px;height:56px"></div><span class="small">← 이중선 = 기록</span>
 ${ticks}<span class="small">← 채움 / 빗금(반 칸) / 빈칸</span>
</div>

<h2>2. 색 토큰</h2>
<div class="swatch-row">${[['--ink', '#1F3342', '글자·선 13.0'], ['--ink-2', '#4A5C69', '보조 글자 6.9'], ['--ink-3', '#5E6B76', '흐린 글자 5.5'], ['--line-mute', '#7A8691', '꺼진 선 3.7(글자 금지)'], ['--soft', '#DDE4E8', '장식선'], ['--mist', '#F4F6F7', '비활성 바탕'], ['--bg', '#EDF1EC', '바탕 = 육지'], ['--fig-fill', '#7F93A3', '칠함 3.2'], ['--gold', '#E3B341', '금(채움만)'], ...lines.map(([l, c]) => [`노선 ${l}`, c, '노선에만'])].map(([n, c, d]) => `<div class="sw"><i style="background:${c}"></i><span><b>${n}</b> ${c}<br>${d}</span></div>`).join('')}</div>

<h2>3. 아이콘 (24 격자, 선 2px · 24 / 28 / 32px로 그림)</h2>
${iconHtml}
<h3>도구 막대에서</h3>
<div class="tools row" style="background:var(--bg)">
 <button class="tool">${svgIcon('read', { size: 28 })}읽어 주기</button><button class="tool">${svgIcon('pad', { size: 28 })}연습장</button><button class="tool">${svgIcon('hint', { size: 28 })}힌트</button><button class="tool wanted">${svgIcon('hintOn', { size: 28 })}힌트</button><button class="tool">${svgIcon('soundOn', { size: 28 })}소리</button><button class="tool quiet" style="margin-left:auto">${svgIcon('report', { size: 28 })}이 문제 이상해요</button>
</div>
<h3>피드백 줄</h3>
<div class="row" style="gap:40px">
 <div class="fb">${svgIcon('check', { size: 32 })}<div class="fb-head">맞았어요 · 한 칸 앞으로</div></div>
 <div class="fb">${svgIcon('pause', { size: 32 })}<div class="fb-head">버스가 잠깐 멈췄어요.</div><div class="fb-more">십의 자리도 일의 자리에 빌려 줬어요. 몇이 남았나요?</div></div>
 <div class="fb">${svgIcon('info', { size: 32 })}<div class="fb-head">문제에 있는 수를 그대로 썼어요.</div></div>
 <div class="fb">${svgIcon('pass', { size: 32 })}<div class="fb-head">하단역 통과!</div></div>
</div>

<h2>4. 노선도 표지</h2>
<h3>역 상태 6가지 — 역 간격 g에 따른 세 단계 (ux-review-06 2.2)</h3>${markSvg()}
<h3>노선 선 네 가지 (육지·바다 위)</h3>${trackSvg}
<h3>미니맵</h3>${markerSvg}
<h3>노선 배지 32px</h3>${badges}

<h2>5. 단추 상태</h2>
<div class="row">
 <button class="secondary">기본</button>
 <button class="secondary" style="transform:translateY(1px);background:var(--soft)">누름</button>
 <button class="choice chosen" style="flex:none;min-width:160px">고름</button>
 <button class="choice chosen" data-order="2" style="flex:none;min-width:160px">순서 고름</button>
 <button class="secondary" disabled>비활성</button>
 <button class="submit" style="min-width:260px">163 — 답 내기</button>
 <button class="submit" disabled style="min-width:260px">답 내기</button>
</div>
<div class="row">
 <div class="answer-box active" style="width:220px">16<span class="caret"></span></div><span class="small">← 키패드 대상(4px + 커서)</span>
 <span style="font-size:32px;font-weight:800">1<span class="blank-slot">&nbsp;</span>3</span><span class="small">← 힌트 ④ 빈칸(점선)</span>
 <span style="font-size:26px">7<span class="unknown-box" style="display:inline-block;width:1em;height:1em;vertical-align:-0.12em"></span>2</span><span class="small">← 문제 속 모르는 수(실선 + 회색)</span>
 <span style="font-size:22px" class="my-answer">263</span><span class="small">← 틀린 답(취소선, 5.5:1)</span>
</div>
<div class="keypad" style="max-width:420px">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button class="key">${n}</button>`).join('')}<span></span><button class="key">0</button><button class="key erase" aria-label="하나 지우기">${svgIcon('backspace', { size: 28 })}</button></div>

<h2>6. 카드 다섯 종류 + 역사 금테 · 면허증</h2>
<div class="cards">${cards}</div>
<h3>면허증</h3>${license}

<h2>7. 차량 일러스트</h2>
<table><tr><th>원형</th><th>이름</th><th>확인된 것</th><th>TODO(확인 필요)</th></tr>${archeTable}</table>
<h3>11단계</h3><div class="veh-grid">${tierCards}</div>
<h3>특별 · 역사</h3><div class="veh-grid">${specials}</div>
<h3>못 얻은 카드(윤곽)</h3><div class="veh-grid"><figure class="veh">${vehicleArt({ ...VEHICLES[11], silhouette: true })}<figcaption>KTX-청룡(윤곽)</figcaption></figure><figure class="veh">${vehicleArt({ ...VEHICLES[2], silhouette: true })}<figcaption>급행버스(윤곽)</figcaption></figure></div>

<h2>8. 문제 그림</h2>
<p class="small">8량 열차: 칠함 3 · 반 칸(빗금) 1 · 빈칸 4 · 짚는 표시(굵은 테) 1. 창문 없음, 앞 유리 하나로 방향.</p>${trainFig}
<p class="small">사람 13명: 5명마다 틈, 한 줄 10명.</p>${peopleFig}
</body></html>`;
writeFileSync(resolve(here, 'preview.html'), html);
console.log('preview.html, icons.svg 만듦');
