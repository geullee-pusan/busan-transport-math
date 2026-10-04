// 운행 띠 v2(시각 4차 3.2, UX 8차 2.1 A): 차내 안내 화면 느낌의 진한 판.
//   ✕ · 노선 원 · 지난 역(흐리게) · 구간 선(앞 역 점 → 노선 색으로 차오름 → 다음 역 이중 고리) + 칸 56×22 4개 + 차량 44×26(칸 위를 감)
//   · 다음 역(30px, 오른쪽 고정) · 꼬리표 · 40역 막대 + ▲ · [쉬기]
// 시승은 칸 대신 "시승 운행 · 문제 n / 약 N"(UX 8차 ⑥). "○○ 후보!" 같은 중간 표시는 하지 않는다(SPEC 3.5 M6).
// 실제 부산 차내 화면의 배치는 베끼지 않는다.
import { h } from './dom.js';
import { icon } from './icons.js';
import { bandVehicle } from './art/scenes.js';
import { stationOf, LINE1_NODES, LINE_NODES, NODES, LINES } from '../engine/world.js';
import { nodeState } from '../engine/state.js';
import { FULL } from '../engine/mastery.js';
import { tierOf } from '../content/vehicles.js';

const DONE = ['lit', 'passed', 'confirmed'];

/** 노드 앞 역 이름(그 노선 순서상 바로 앞 노드의 역). 첫 역이면 null */
function prevName(node) {
  const n = NODES.get(node);
  const list = LINE_NODES[n?.line] ?? [];
  const i = list.findIndex((x) => x.id === node);
  return i > 0 ? stationOf(list[i - 1].id)?.name ?? null : null;
}

/**
 * @param {object} o
 * @param {object} o.state  앱 상태
 * @param {object} o.run    운행
 * @param {object|null} o.cur 지금 문제(currentProblem)
 * @param {string|null} o.tag 꼬리표 글자(급행·도전 운행·임시 정차·막차)
 * @param {[number, number]|null} o.trial 시승 진행 [지금 문제 번호, 대략 전체]
 * @param {() => void} o.onExit ✕
 * @param {(() => void)|null} o.onRest [쉬기](부모 번호가 있을 때만)
 * @param {string|null} o.restNote 쉬기를 이미 정했을 때 글자
 */
export function makeBand({ state, run, cur, tag, trial, onExit, onRest, restNote }) {
  const node = cur?.slot.node ?? run.dest;
  const st = stationOf(node);
  const isL2 = NODES.get(node)?.line === 'L2';
  const lineColor = LINES.find((l) => l.id === (isL2 ? '2' : '1'))?.color ?? '#F7941D';
  const ns = nodeState(state, node);
  const showCells = !trial && (run.mode === 'normal' || run.mode === 'challenge');
  const tier = tierOf(state.activeCard ?? state.license);
  const litCount = LINE1_NODES.filter((n) => DONE.includes(nodeState(state, n.id).status)).length;
  const pct = Math.round((litCount / 40) * 100);
  const prev = prevName(node);

  let halves = showCells ? ns.halves : 0;
  const cells = Array.from({ length: 4 }, () => h('i.cell'));
  const fill = h('div.seg-fill');
  const car = h('div.seg-car', { html: bandVehicle({ kind: tier.kind === 'bus' ? 'bus' : 'rail', band: state.profile.color || '#1F3342' }) });
  const paint = (prevHalves = halves) => {
    cells.forEach((c, i) => {
      const hv = halves - i * 2;
      const stt = hv >= 2 ? 'full' : hv === 1 ? 'half' : i === Math.floor(halves / 2) ? 'target' : 'empty';
      const was = prevHalves - i * 2 >= 2 ? 'full' : prevHalves - i * 2 === 1 ? 'half' : '';
      c.className = `cell ${stt}${stt !== was && (stt === 'full' || stt === 'half') && prevHalves !== halves ? ' pop' : ''}`;
    });
    const t = trial ? Math.min(1, (trial[0] - 1) / Math.max(1, trial[1])) : Math.min(halves, FULL) / FULL;
    fill.style.width = `${t * 100}%`;
    car.style.left = `calc(${t * 100}% - 22px)`;
  };
  paint();

  const route = h('div.band-route',
    h('span.band-badge', { style: { '--lc': lineColor }, 'aria-hidden': 'true' }, isL2 ? '2' : '1'),
    h('span.band-prev', h('small', '지난 역'), prev ?? '출발'),
    h('div.band-seg',
      h('span.seg-dot.done', { style: { '--lc': lineColor } }),
      h('div.seg-track', { style: { '--lc': lineColor } }, fill, showCells ? h('div.seg-cells', { 'aria-label': `${Math.floor((FULL - halves) / 2)}칸 남음` }, cells) : null, car),
      h('span.seg-dot.next'),
    ),
    h('span.band-next', h('small', '다음 역'), h('b', st?.name ?? '')),
  );
  const side = h('div.band-side',
    trial ? h('span.band-trial', `시승 운행 · 문제 ${trial[0]} / 약 ${trial[1]}`) : tag ? h('span.band-tag', tag) : null,
    h('div.band-total', { 'aria-label': `40역 중 ${litCount}역 켜짐` }, h('div.tot-bar', h('i', { style: { width: `${pct}%`, background: lineColor } }), h('b', { style: { left: `${pct}%` } }, '▲')), h('small', `40역 중 ${litCount}역 켜짐`)),
    restNote ? h('span.band-note', restNote) : onRest ? h('button.band-rest', { type: 'button', onclick: onRest }, icon('parent'), '쉬기') : null,
  );
  const el = h('header.band.v2-band', { role: 'group', 'aria-label': '운행 안내' }, h('button.band-x', { type: 'button', onclick: onExit, 'aria-label': '운행 멈추기' }, icon('close')), route, side);

  return {
    el,
    /** ✓: 새로 채운 칸이 차오르고(400ms) 차량이 앞으로(600ms). 동작 줄이기면 즉시(CSS) */
    advance(next) {
      if (!showCells) return;
      const before = halves;
      halves = Math.min(FULL, next);
      paint(before);
    },
    /** ⏸: 차량이 제자리에서 3px 멈칫(브레이크) */
    brake() {
      car.classList.remove('brake');
      void car.offsetWidth;
      car.classList.add('brake');
    },
  };
}

/** 노드의 앞·뒤 역 이름(그 노선 순서) */
export function neighborNames(node) {
  const n = NODES.get(node);
  const list = LINE_NODES[n?.line] ?? [];
  const i = list.findIndex((x) => x.id === node);
  return { prev: i > 0 ? stationOf(list[i - 1].id)?.name ?? null : null, next: i >= 0 && i < list.length - 1 ? stationOf(list[i + 1].id)?.name ?? null : null, list, index: i };
}
