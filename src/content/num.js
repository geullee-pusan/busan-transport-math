/**
 * 문장 속 숫자. 세 종류로 나눈다(07 v2 0.2절 숫자 꼬리표):
 *   real    — FACTS.md ✅ 값. source를 단다. 누르면 출처가 보인다.
 *   virtual — 문제 이야기를 위해 지어낸 값(승객 수, 값 등). 화면에서 점선 밑줄(SPEC 9.5c).
 *   math    — 순수 계산 식의 수(예: 368 + 275). 표시 없음.
 * @param {number|string} value
 * @param {{ real?: boolean, virtual?: boolean, source?: string }} [opts]  아무것도 없으면 math
 */
export function n(value, opts = {}) {
  const tag = opts.real ? 'real' : opts.virtual ? 'virtual' : 'math';
  return { num: value, tag, real: tag === 'real', source: opts.source ?? null };
}
/** 문장 조각 배열을 그냥 글자로 붙인다(테스트·읽어주기용). */
export function plainText(text) {
  return text.map((t) => (typeof t === 'string' ? t : t.unknown ?? t.label ?? String(t.num))).join('');
}

/** 문장 속 숫자 값 목록(대충 낸 답 판정에 쓴다). */
export function numbersIn(text) {
  return text.filter((t) => typeof t === 'object' && t !== null && 'num' in t).map((t) => Number(t.num));
}

/**
 * 모르는 자리가 있는 수(예: '4□7'). 화면은 □를 회색 바탕 실선 네모로 그린다(누를 수 없음).
 * 힌트 ④의 빈칸(☐, 점선)과 다르게 보여야 한다(UX 자문 4차 F2).
 */
export function unknown(pattern) {
  return { unknown: pattern };
}

/**
 * 이름 속 숫자(예: "1호선"의 1). 문장에 그대로 보이지만 문제 속 숫자로 세지 않는다(대충 낸 답 판정에서 빠짐).
 * 실제 값이면 source를 단다(누르면 출처).
 */
export function label(text, opts = {}) {
  return { label: String(text), source: opts.source ?? null };
}
