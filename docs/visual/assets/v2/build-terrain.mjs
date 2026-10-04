// 부산 지형 바탕(노선도 아래)을 만든다: node docs/visual/assets/v2/build-terrain.mjs
// 원자료: 형제 앱 C:\Subway game\data\build\grid.json(1km 격자, 노선도 좌표와 같은 칸 단위 — 칸 (c, r) = [c, c+1] × [r, r+1])
//   - 지형 분류·고도: SRTM(공공 영역) + 형제 앱 규칙, 수면: © OpenStreetMap contributors(ODbL 1.0) → 화면에 출처 표시 필요
// 방법: 칸 가운데 값으로 마칭 스퀘어 → 고리를 이어 붙임 → 차이킨 깎기 3번(네모 칸이 둥근 해안선·산 모양이 됨)
// 결과: v2/terrain-busan.json { viewBox, layers: { sea, river, hill, mountain, high } } (경로 좌표는 격자 칸 단위)
// 실제 반영은 프로젝트 규칙대로 scripts/build-data.mjs(npm run data)에 같은 처리를 넣어 src/data로 뽑는다. 이 파일은 시안용.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const grid = JSON.parse(readFileSync('C:/Subway game/data/build/grid.json', 'utf8'));
const { rows, cols, terrain, elevationM } = grid;

const masks = {
  sea: (r, c) => terrain[r][c] === 'sea',
  river: (r, c) => terrain[r][c] === 'river',
  hill: (r, c) => ['hill', 'mountain'].includes(terrain[r][c]), // 언덕 층 = 언덕 + 산(겹쳐 칠해 산 둘레가 언덕으로 번짐)
  mountain: (r, c) => terrain[r][c] === 'mountain',
  high: (r, c) => terrain[r][c] === 'mountain' && (elevationM[r][c] ?? 0) >= 400,
};

function contours(test) {
  // 칸 경계 방식: 안쪽 칸과 바깥 칸 사이의 변을 "안쪽이 오른쪽"이 되게 방향을 정해 모은 뒤 이어 붙인다.
  // 격자 밖 2칸은 가장자리 값을 늘려 둔다(바다가 그림 밖으로 이어지게, 경계가 화면 밖에서 닫히게)
  const PADN = 2;
  const inside = (r, c) => test(Math.min(rows - 1, Math.max(0, r)), Math.min(cols - 1, Math.max(0, c)));
  const edges = new Map(); // 시작점 → [끝점...]
  const add = (x0, y0, x1, y1) => { const k = x0 + ',' + y0; (edges.get(k) ?? edges.set(k, []).get(k)).push([x1, y1]); };
  for (let r = -PADN; r < rows + PADN; r++) for (let c = -PADN; c < cols + PADN; c++) {
    if (!inside(r, c)) continue;
    const out = (rr, cc) => rr < -PADN || cc < -PADN || rr >= rows + PADN || cc >= cols + PADN || !inside(rr, cc);
    if (out(r - 1, c)) add(c, r, c + 1, r);         // 위 변: 왼→오
    if (out(r, c + 1)) add(c + 1, r, c + 1, r + 1); // 오른 변: 위→아래
    if (out(r + 1, c)) add(c + 1, r + 1, c, r + 1); // 아래 변: 오→왼
    if (out(r, c - 1)) add(c, r + 1, c, r);         // 왼 변: 아래→위
  }
  const loops = [];
  const take = (k, prev) => {
    const list = edges.get(k);
    if (!list || !list.length) return null;
    let i = 0;
    if (list.length > 1 && prev) {
      // 갈림(대각 칸): 오른쪽으로 꺾는 쪽을 고른다(안쪽 칸을 오른편에 끼고 돌기)
      const [px, py] = prev; const [cx, cy] = k.split(',').map(Number);
      const dx = cx - px, dy = cy - py;
      i = list.findIndex(([nx, ny]) => (nx - cx) * -dy + (ny - cy) * dx < 0) ; if (i < 0) i = 0;
    }
    return list.splice(i, 1)[0];
  };
  for (const [k0] of edges) {
    while (edges.get(k0)?.length) {
      const start = k0.split(',').map(Number);
      const loop = [start];
      let prev = null, cur = start, guard = 0;
      while (guard++ < 100000) {
        const nxt = take(cur.join(','), prev);
        if (!nxt) break;
        prev = cur; cur = nxt; loop.push(cur);
        if (cur[0] === start[0] && cur[1] === start[1]) break;
      }
      // 곧은 줄의 가운데 점은 뺀다
      const simp = loop.filter((p, i) => { if (i === 0 || i === loop.length - 1) return true; const a = loop[i - 1], b = loop[i + 1]; return !((a[0] === p[0] && p[0] === b[0]) || (a[1] === p[1] && p[1] === b[1])); });
      if (simp.length > 3) loops.push(simp);
    }
  }
  return loops;
}

function chaikin(pts, n = 3) {
  let p = pts.slice(0, -1); // 닫힌 고리(마지막 = 처음)
  for (let k = 0; k < n; k++) {
    const q = [];
    for (let i = 0; i < p.length; i++) {
      const [x0, y0] = p[i], [x1, y1] = p[(i + 1) % p.length];
      q.push([0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1], [0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1]);
    }
    p = q;
  }
  return p;
}

const r2 = (n) => Math.round(n * 10) / 10; // 0.1칸 = 100m
// 계단 펴기: 꼭짓점 사이 가운데 점을 이으면 1칸짜리 계단이 대각선이 된다. 그다음 차이킨으로 둥글게
const mids = (l) => { const p = l.slice(0, -1); const m = p.map((a, i) => { const b2 = p[(i + 1) % p.length]; return [(a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2]; }); return [...m, m[0]]; };
const toPath = (loops) => loops.map((l) => { const p = chaikin(mids(l)); return 'M' + p.map(([x, y]) => `${r2(x)} ${r2(y)}`).join('L') + 'Z'; }).join('');

const out = { viewBox: [0, 0, cols, rows], note: 'grid 칸 단위. fill-rule="evenodd". 출처: SRTM, © OpenStreetMap contributors(ODbL), 형제 앱 grid.json', layers: {} };
for (const [k, test] of Object.entries(masks)) out.layers[k] = toPath(contours(test));
writeFileSync(resolve(here, 'terrain-busan.json'), JSON.stringify(out));
console.log(Object.fromEntries(Object.entries(out.layers).map(([k, d]) => [k, d.length])));
