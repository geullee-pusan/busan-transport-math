// 역의 칸과 개통(숙달) 판정. SPEC 3.1절, 3.4절.
// 칸은 반 칸 단위(halves)로 센다: 4칸 = 8.
//   - "혼자"(힌트 없이 또는 힌트 ①만) 정답 = 한 칸(2), 힌트 ②~④ 정답 = 반 칸(1)
//   - 2단계 이상만 칸을 채운다. 1단계 정답은 "준비 구간" 점(prep)을 하나 간다.
//   - 마지막 칸: 3단계 이상을 힌트 없이 맞혀야 채워진다.
//   - 다양성: 칸을 채운 문제의 표현이 2가지 이상.
//   - 정확도: 마지막 칸을 채울 때 이 역 최근 5문제 중 정답 3개 이상.
//   - 칸은 줄지 않는다.

export const FULL = 8;

export function emptyNode() {
  return { status: 'open', halves: 0, prep: 0, rating: 2, attempts: [], reprs: [], litDay: null, confirmedDay: null, reviewDay: null, passed: false };
}

/**
 * 시도 하나를 반영한다(원래 객체를 바꾸지 않고 새 객체를 돌려준다).
 * @param {object} ns 노드 상태
 * @param {{ correct: boolean, hint: number, level: number, repr: string, counted?: boolean }} a
 *   hint: 0 = 힌트 없음, 1~4 = 쓴 힌트의 가장 높은 단계. counted=false면 칸에 넣지 않는 문제(쉬운 끼워넣기).
 * @param {number} day  오늘(날짜 번호)
 * @returns {{ node: object, gained: number, lit: boolean, pending: string|null }}
 */
export function applyAttempt(ns, a, day) {
  // h = 칸 무게용 힌트 값(다시 시도한 정답은 2로 셈), o = 아이가 실제로 연 힌트(부모 화면·일지용, 게이미피케이션 04 P0)
  const node = { ...ns, attempts: [...ns.attempts, { c: a.correct, h: a.hint, o: a.opened ?? a.hint, l: a.level, r: a.repr, d: day }].slice(-20), reprs: ns.reprs.slice() };
  node.rating = nextRating(ns.rating, a);
  let gained = 0;
  let lit = false;
  let pending = null;

  if (a.correct && a.counted !== false && node.status === 'open') {
    if (a.level < 2) {
      node.prep += 1;
    } else {
      const solo = a.hint <= 1;
      let add = solo ? 2 : 1;
      const room = FULL - node.halves;
      if (add >= room) {
        // 마지막 칸을 채우려는 시도
        const strict = a.level >= 3 && a.hint === 0;
        const reprsAfter = new Set([...node.reprs, a.repr]);
        const recent = node.attempts.slice(-5);
        const accurate = recent.filter((x) => x.c).length >= 3;
        if (strict && reprsAfter.size >= 2 && accurate) {
          add = room;
          lit = true;
        } else {
          add = Math.max(0, room - 1); // 마지막 반 칸은 남겨 둔다
          pending = !strict ? 'solo3' : reprsAfter.size < 2 ? 'repr' : 'accuracy';
        }
      }
      if (add > 0) {
        node.halves += add;
        gained = add;
        if (!node.reprs.includes(a.repr)) node.reprs.push(a.repr);
      }
      if (lit) {
        node.status = 'lit';
        node.litDay = day;
        node.reviewDay = day + 1;
      }
    }
  }
  node.pending = lit ? null : pending ?? (gained > 0 ? null : ns.pending ?? null);
  return { node, gained, lit, pending };
}

/** 남은 조건을 아이 말로 */
export function pendingText(code) {
  // 아이 화면에서 "혼자"라는 낱말은 쓰지 않는다(아동 심리 자문 1차 H4).
  if (code === 'solo3' || code === 'accuracy') return '이 역에 도착하려면 힌트 없이 한 문제를 더 풀어요';
  if (code === 'repr') return '이 역에 도착하려면 다른 모양 문제를 하나 더 풀어요';
  return null;
}

/**
 * 실력 추정(단계 단위). 계단식 갱신의 평형 정답률 p는 내리는 폭 / (올리는 폭 + 내리는 폭)이다(Levitt 1971).
 * 목표 75%: 올리는 폭 0.15, 내리는 폭 0.45 (0.45 / 0.6 = 0.75). 게이미피케이션 자문 1차 결함 D.
 */
export const RATING_UP = 0.15;
export const RATING_DOWN = 0.45;
export function nextRating(r, a) {
  if (a.correct && a.hint <= 1) return r + RATING_UP;
  if (a.correct) return r + 0.05;
  return Math.max(1, r - RATING_DOWN);
}

export const LONG_GAPS = [14, 30, 60];

/** 확정: 개통한 역을 다른 날 임시 정차에서 다시 맞힘(힌트 ① 허용). 틀려도 불은 꺼지지 않는다. */
export function applyReview(ns, correct, hint, day) {
  const node = { ...ns };
  if (correct && hint <= 1 && ns.litDay !== null && day > ns.litDay && ns.status !== 'confirmed') {
    node.status = 'confirmed';
    node.confirmedDay = day;
    node.inferred = false; // 시승으로 추정해 켠 역도 여기서 확인된다
    node.longStage = 0;
    node.reviewDay = day + LONG_GAPS[0];
  } else if (ns.status === 'confirmed') {
    // 확정된 역도 14·30·60일 간격으로 다시 만난다(몇 달 뒤 "알던 걸 틀리는" 좌절 방지, 게이미피케이션 자문 결함 C).
    // 틀리면 내일 다시, 맞히면 다음 간격. 불은 꺼지지 않는다.
    const stage = correct ? Math.min((ns.longStage ?? 0) + 1, LONG_GAPS.length - 1) : ns.longStage ?? 0;
    node.longStage = stage;
    node.reviewDay = correct ? day + LONG_GAPS[stage] : day + 1;
  } else if (!correct) {
    node.reviewDay = day + 1;
  } else {
    node.reviewDay = day + 3;
  }
  return node;
}
