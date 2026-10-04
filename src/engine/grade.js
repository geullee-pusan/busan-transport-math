// 공통 채점. 순서는 docs/curriculum/07-line1-templates.md 0.6절을 따른다.
//   1. 대충 낸 답(빈칸, 정답이 0이 아닐 때 0, 문제 속 숫자 그대로) → careless (분류하지 않음)
//   2. 정답
//   3. 판별 오답 → 그 분류와 피드백
//   4. 식 입력: 식이 틀림 → 식 / 식은 맞고 값이 틀림 → 계산
//   5. 정답 ± 1 → 세기 문제면 개념, 아니면 계산
//   6. 문제 속 다른 수와 같음 → 식
//   7. 그 밖 → 보류
import { numbersIn } from '../content/num.js';

const toNumber = (v) => {
  if (typeof v === 'number') return v;
  if (typeof v !== 'string') return NaN;
  const s = v.trim().replace(/,/g, '');
  if (s === '') return NaN;
  if (/^-?\d*\.?\d+$/.test(s)) return Number(s);
  const frac = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (frac && Number(frac[2]) !== 0) return Number(frac[1]) / Number(frac[2]);
  return NaN;
};

const same = (a, b) => {
  if (typeof b === 'number') return Math.abs(toNumber(a) - b) < 1e-9;
  return String(a ?? '').trim() === String(b).trim();
};

const isBlank = (r) => r === undefined || r === null || (typeof r === 'string' && r.trim() === '');

/**
 * @param {object} problem  템플릿이 만든 문제 객체
 * @param {*} response      아이의 답(number/string, compound면 { key: value }, equation이면 { left, op, right, result })
 * @returns {{ correct: boolean, category: string|null, feedback: string|null, flags: { careless?: boolean } }}
 */
export function grade(problem, response) {
  if (typeof problem.grade === 'function') {
    const r = problem.grade(response);
    return { correct: Boolean(r.correct), category: r.category ?? null, feedback: r.feedback ?? null, kind: r.kind ?? null, feedbackCheck: r.feedbackCheck ?? null, flags: r.flags ?? {} };
  }

  const kind = problem.input?.kind ?? 'number';

  if (kind === 'compound') {
    const fields = problem.input.fields;
    if (fields.every((f) => isBlank(response?.[f.key]))) return careless();
    const wrong = fields.filter((f) => !same(response?.[f.key], problem.answer[f.key]));
    if (wrong.length === 0) return ok();
    // 칸별 판별 오답
    for (const d of problem.discriminators ?? []) {
      if (d.key && same(response?.[d.key], d.value)) return missD(d);
    }
    return miss(null, wrong.length === 1 ? `"${wrong[0].label}" 칸을 다시 볼까요?` : `다시 볼 칸: ${wrong.map((f) => f.label).join(' · ')}`);
  }

  if (kind === 'equation') {
    const { left, op, right, result } = response ?? {};
    if ([left, op, right, result].every(isBlank)) return careless();
    const want = problem.answer; // { left, op, right, result, commutative? }
    const exprOk =
      op === want.op &&
      ((same(left, want.left) && same(right, want.right)) ||
        (want.commutative && same(left, want.right) && same(right, want.left)));
    if (exprOk && same(result, want.result)) return ok();
    for (const d of problem.discriminators ?? []) {
      if (d.match && d.match(response)) return missD(d);
    }
    if (!exprOk) return miss('식', null);
    return miss('계산', null);
  }

  if (kind === 'choice') {
    if (isBlank(response)) return careless();
    if (same(response, problem.answer)) return ok();
    const d = (problem.discriminators ?? []).find((x) => same(response, x.value));
    return d ? missD(d) : miss(null, null);
  }

  // number / decimal / fraction
  if (isBlank(response)) return careless();
  const value = toNumber(response);
  if (Number.isNaN(value)) return careless();
  const answer = typeof problem.answer === 'number' ? problem.answer : toNumber(problem.answer);
  if (value === 0 && answer !== 0) return careless('0이 맞는지 다시 볼까요?');
  if (Math.abs(value - answer) < 1e-9) return ok();

  const d = (problem.discriminators ?? []).find((x) => typeof x.value === 'number' && Math.abs(x.value - value) < 1e-9);
  if (d) return missD(d);

  const textNums = numbersIn(problem.text ?? []);
  if (textNums.some((x) => Math.abs(x - value) < 1e-9)) return careless('문제에 있는 수를 그대로 썼어요');

  if (Math.abs(value - answer) === 1) return miss(problem.counting ? '개념' : '계산', null);
  return miss(null, null);
}

const ok = () => ({ correct: true, category: null, feedback: null, flags: {} });
const careless = (feedback = '답을 먼저 써 볼까요?') => ({ correct: false, category: null, feedback, flags: { careless: true } });
const miss = (category, feedback) => ({ correct: false, category, feedback, kind: null, feedbackCheck: null, flags: {} });
/** 판별 오답: 피드백 종류(check 점검 / nudge 도움)와 점검 문구를 함께 넘긴다(커리큘럼 자문 10 2절). */
const missD = (d) => ({ correct: false, category: d.category ?? null, feedback: d.feedback ?? null, kind: d.kind ?? null, feedbackCheck: d.feedbackCheck ?? null, flags: {} });
