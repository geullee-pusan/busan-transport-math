// v2 시안 견본: node docs/visual/assets/v2/build-preview-v2.mjs → docs/visual/assets/v2/preview-v2.html
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homeMap } from './home-map.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../../..');
const data = JSON.parse(readFileSync(resolve(root, 'src/data/busan.json'), 'utf8'));
const terrain = JSON.parse(readFileSync(resolve(here, 'terrain-busan.json'), 'utf8'));
const css = ['../tokens.css', '../components.css', 'v2.css'].map((f) => { try { return readFileSync(resolve(here, f), 'utf8'); } catch { return ''; } }).join('\n');
const parts = import('./scenes.mjs').catch(() => null);

const geo = Object.fromEntries(JSON.parse(readFileSync('C:/Subway game/data/build/stations.json', 'utf8')).stations.map((s) => [s.id, { x: s.x, y: s.y }]));
const l1 = data.lines.find((l) => l.id === '1').stations.map((s) => ({ ...s, ...geo[s.id] }));
const id = (code) => l1.find((s) => s.code === String(code)).id;
const seomyeon = l1.find((s) => s.name === '서면');
// FACTS ✅: 금정산은 서면에서 거의 정북쪽 약 14km(고당봉 801.5m), 황령산은 거의 정동쪽 약 2km(427m). 격자 1칸 = 1km
const peaks = [{ name: '금정산', x: seomyeon.x, y: seomyeon.y - 14 }, { name: '황령산', x: seomyeon.x + 2, y: seomyeon.y }];

const state = {
  lit: new Set([95, 96, 97, 98, 99, 100, 101, 105, 106].map(id)), // 105·106 = 시승으로 미리 켠 섬
  confirmed: new Set([95, 96].map(id)),
  passed: new Set([100].map(id)),
  check: new Set([99].map(id)),
  dest: id(102), progress: 0.5,
};
const full = homeMap({ data, terrain, geo, ...state, width: 860, peaks, carColor: '#00798C' });
const d = l1.find((s) => s.id === state.dest);
const zoom = homeMap({ data, terrain, geo, idp: 'z-', ...state, width: 860, peaks, carColor: '#00798C', view: [d.x - 5, d.y - 3.6, 10, 7.4] });

const scenes = await parts;
const extra = scenes ? scenes.previewSections({ data, terrain }) : '';

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>시각 v2 견본</title><style>${css}
body{margin:0;padding:24px;max-width:1480px;margin:auto}
h1{font-size:28px;margin:0 0 6px} h2{font-size:22px;margin:36px 0 10px;border-bottom:2px solid var(--ink);padding-bottom:4px}
.lead{color:var(--ink-2);font-size:16px}
.maps{display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start}
.maps figure{margin:0;background:#fff;border-radius:18px;overflow:hidden;border:1.5px solid var(--ink)}
.row{display:flex;gap:16px;flex-wrap:wrap;align-items:center;margin:10px 0}.small{font-size:16px;color:var(--ink-2)}
.maps figcaption{padding:8px 12px;font-size:15px;color:var(--ink-2)}
.gray-on{filter:grayscale(1)} .toggle-bw{position:fixed;right:16px;top:16px;z-index:5}
</style></head><body>
<button class="secondary toggle-bw" onclick="document.body.classList.toggle('gray-on')">흑백으로 보기</button>
<h1>부산 교통 수학 — 시각 v2 시안</h1>
<p class="lead">시각 자문 4차(docs/visual/visual-review-04.md). 1480×924 기준 기기 크기 그대로(배율 1). node docs/visual/assets/v2/build-preview-v2.mjs로 다시 만든다.</p>
<h2>1. 홈 노선도 — 지형 바탕</h2>
<div class="maps"><figure>${zoom}<figcaption>확대 보기(홈 첫 화면): 목적지 앞뒤, 역 간격 g ≈ 37 → 모든 역 이름</figcaption></figure>
<figure>${full}<figcaption>1호선 전체 보기: 촘촘 단계, 켜진 역 양 끝·목적지·환승·종점 이름만</figcaption></figure></div>
${extra}
</body></html>`;
writeFileSync(resolve(here, 'preview-v2.html'), html);
console.log('preview-v2.html', html.length);
