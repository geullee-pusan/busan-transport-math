// 형제 프로젝트(Subway game)의 검증된 부산 데이터에서 이 앱에 필요한 것만 뽑는다(npm run data).
// 뽑은 결과(src/data/*.json)는 git에 넣는다. 그래서 배포(GitHub Actions)는 형제 프로젝트 없이도 된다.
// 출처는 각 값 옆에 그대로 옮긴다. 사실 확인표는 docs/FACTS.md.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTerrain } from './lib/terrain.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SG = process.env.SUBWAY_GAME_DATA ?? 'C:/Subway game/data/build';
const read = (name) => JSON.parse(readFileSync(resolve(SG, name), 'utf8'));
const OUT = resolve(ROOT, 'src/data');
mkdirSync(OUT, { recursive: true });

const { lines } = read('lines.json');
const { stations } = read('stations.json');
const links = read('links.json').links ?? read('links.json');
const { positions } = read('schematic.json');
const { transfers } = read('transfers.json');

const byId = new Map(stations.map((s) => [s.id, s]));

const outLines = lines.map((l) => ({
  id: l.id,
  label: l.label,
  name: l.name,
  color: l.color,
  colorSource: l.colorSource,
  carsPerTrain: l.carsPerTrain ?? null,
  stations: l.stations.map((id) => {
    const s = byId.get(id);
    const p = positions[id] ?? { x: s.x, y: s.y };
    // x, y = 노선도 좌표(schematic), gx, gy = 실제 좌표(공공데이터 15043686, 같은 격자 칸 단위) — 홈 노선도는 실제 모양 + 지형(2026-10-04 결정)
    return { id, name: s.name, nameEn: s.nameEn, code: s.code, x: p.x, y: p.y, gx: s.x, gy: s.y };
  }),
}));

const outLinks = links.map((k) => ({ line: k.line, from: k.from, to: k.to, distanceM: k.distanceM, source: k.distanceSource }));

const data = {
  _설명: 'scripts/build-data.mjs가 Subway game/data/build에서 뽑았다. 손으로 고치지 않는다.',
  sourceNote: '노선·역·역간거리: 공공데이터포털 3033564 등(Subway game data/SOURCES.md). 노선도 좌표(x, y): Subway game schematic.json. 실제 좌표(gx, gy): 공공데이터 15043686(Subway game stations.json). 노선 색: 부산교통공사 노선도 그림(15054957)에서 뽑음.',
  lines: outLines,
  links: outLinks,
  transfers: transfers.map((t) => ({ name: t.name, stations: t.stations })),
};
writeFileSync(resolve(OUT, 'busan.json'), JSON.stringify(data, null, 1));

// 소리: 열차진입 안내음(갈매기·파도, 뱃고동·파도)과 1호선 끝 역 진입 방송만 가져온다.
const sounds = read('station-sounds.json');
const outSounds = {
  _설명: '공공데이터포털 3033578 부산교통공사_부산도시철도 역사 안내방송_20250831(이용허락범위 제한 없음). Subway game이 MP3를 base64로 바꾼 것을 그대로 가져왔다.',
  source: sounds.source,
  chimes: sounds.chimes,
  approach: Object.fromEntries(Object.entries(sounds.approach).filter(([k]) => k.startsWith('1|'))),
};
writeFileSync(resolve(OUT, 'sounds.json'), JSON.stringify(outSounds));

// 지형(홈 노선도 바탕): 바다·강·언덕·산·높은 산 윤곽. 출처 표시가 필요하다(ODbL) — 홈 지도와 부모 화면 출처 목록
const terrain = buildTerrain(read('grid.json'));
writeFileSync(resolve(OUT, 'terrain.json'), JSON.stringify({ _설명: 'scripts/build-data.mjs가 Subway game/data/build/grid.json에서 뽑았다. 손으로 고치지 않는다.', source: '지형: SRTM · © OpenStreetMap contributors', ...terrain }));

const km = outLinks.filter((k) => k.line === '1').reduce((s, k) => s + k.distanceM, 0) / 1000;
console.log(`노선 ${outLines.length}개, 1호선 ${outLines[0].stations.length}역 ${km}km, 소리 ${Object.keys(outSounds.approach).length + 2}개`);
