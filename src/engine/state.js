// 학습 상태: 만들기, 저장, 불러오기, 백업. localStorage는 늘 try/catch로 감싼다.
import { emptyNode } from './mastery.js';
import { NODES, FAR_FROM_EVIDENCE, MUST_CHECK } from './world.js';

const KEY = 'busan-transport-math:v1';

export function createState() {
  return {
    version: 1,
    profile: { nickname: '', color: '#00798C', homeStation: null },
    placementDone: false,
    placement: null, // 시승 결과 { passes, misses, farthest(줄기별), any } — 처음 보는 역의 시작 실력에 쓴다
    license: 1,
    goldTotal: 0,
    cardGold: {}, // 차량 단계 → 그 카드에 모은 금 도장
    cards: [1],
    activeCard: 1, // 아이가 고른 운행 차량. 금 도장이 이 카드에 쌓인다.
    meters: 0,
    runs: 0,
    nodes: {},
    parked: null, // { node, templateId, level, seed } 중간에 끈 문제
    redo: [], // 다음 운행 임시 정차로 다시 낼 문제 [{ node, templateId, level, seed }]
    reports: [], // "이 문제 이상해요" 신고
    logs: [], // 운행 일지(부모 화면)
    settings: { sound: true, wrongSound: true, readAloud: null, leftHand: false, dailyRuns: 2 },
    runDays: {}, // 날짜 번호 → 그날 시작한 운행 수(시승 운행은 세지 않음)
    extraToday: null, // 부모가 "오늘 한 번 더"를 허락한 날짜 번호
  };
}

/**
 * 처음 보는 역의 시작 실력(커리큘럼 자문 01 2.4.2절).
 *   시승에서 통과가 없으면 2, 있으면 3(개통 판정 단계).
 *   3.5(4단계부터)는 같은 줄기에서 틀림 없이 2번 이상 통과했고, 통과한 가장 먼 역에서 6역 안이고,
 *   단계 조건이 붙은 선수 역(minLevel)이 추정으로만 켜진 것이 아닐 때만.
 */
export function startRatingOf(state, id) {
  const pl = state.placement;
  if (!pl?.any) return 2;
  const node = NODES.get(id);
  // 필수 확인 역은 판별 오답이 가장 흔한 곳이라 늘 3에서 시작한다(4·5단계부터면 오개념을 놓친다, 커리큘럼 11 검토 8).
  if (!node || node.line !== 'L1' || FAR_FROM_EVIDENCE.has(id) || MUST_CHECK.has(id)) return 3;
  const s = node.strand;
  const near = node.order - (pl.farthest[s] ?? -99) <= 6;
  const weakPrereq = (node.prereqs ?? []).some((p) => p.minLevel && state.nodes[p.node]?.inferred);
  return (pl.passes[s] ?? 0) >= 2 && !pl.misses[s] && near && !weakPrereq ? 3.5 : 3;
}

/** 처음 보는 역은 시승 결과로 정한 시작 실력에서 출발한다. */
export function nodeState(state, id) {
  return state.nodes[id] ?? { ...emptyNode(), rating: startRatingOf(state, id) };
}

export function load(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return createState();
    const s = JSON.parse(raw);
    if (s?.version !== 1) return createState();
    return { ...createState(), ...s, settings: { ...createState().settings, ...s.settings } };
  } catch {
    return createState();
  }
}

export function save(state, storage = globalThis.localStorage) {
  try {
    storage?.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** 부모 화면의 백업(JSON 글자) */
export function exportBackup(state) {
  const { parentPin, ...rest } = state; // 부모 번호는 백업에 넣지 않는다
  return JSON.stringify({ app: 'busan-transport-math', savedAt: new Date().toISOString(), state: rest });
}

export function importBackup(text) {
  const parsed = JSON.parse(text);
  if (parsed?.app !== 'busan-transport-math' || parsed.state?.version !== 1) throw new Error('이 앱의 백업 파일이 아니에요.');
  return { ...createState(), ...parsed.state };
}

/** 날짜 번호(현지 날짜 기준). 엔진은 이 값을 인자로만 받는다(같은 입력 → 같은 출력). */
export function dayNumber(date = new Date()) {
  return Math.floor((date.getTime() - date.getTimezoneOffset() * 60000) / 86400000);
}

/** 오늘 남은 운행 수. 못 한 운행은 다음 날로 쌓이지 않는다(아동 심리 자문 1차 2절 "막차"). */
export function runsLeftToday(state, day) {
  const limit = (state.settings.dailyRuns ?? 2) + (state.extraToday === day ? 1 : 0);
  return Math.max(0, limit - (state.runDays?.[day] ?? 0));
}

export function countRun(state, day) {
  const days = Object.fromEntries(Object.entries(state.runDays ?? {}).filter(([d]) => Number(d) >= day - 30));
  const backwards = typeof state.lastRunDay === 'number' && day < state.lastRunDay;
  return { ...state, lastRunDay: Math.max(day, state.lastRunDay ?? day), dateWentBack: state.dateWentBack || backwards, runDays: { ...days, [day]: (days[day] ?? 0) + 1 } };
}

/** 부모 번호: 숫자 4자리 */
export const isPin = (v) => /^\d{4}$/.test(String(v ?? '').trim());
