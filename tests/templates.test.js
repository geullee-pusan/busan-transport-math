// 모든 문제 템플릿 검사: 결정론, 정답 채점, 판별 오답, 우연 겹침, 힌트·해설 형식.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allTemplates } from '../src/content/index.js';
import { createRng, hashSeed } from '../src/engine/rng.js';
import { grade } from '../src/engine/grade.js';
import { numbersIn, plainText } from '../src/content/num.js';

const SEEDS = 40;
const OPS = /더해요|더하면|빼요|빼면|곱해요|곱하면|나눠요|나누면|×|÷|\+|−/;

for (const t of allTemplates()) {
  test(`${t.node} ${t.id} ${t.title}`, () => {
    for (let level = t.minLevel; level <= t.maxLevel; level++) {
      for (let s = 0; s < SEEDS; s++) {
        const seed = hashSeed(t.id, level, s);
        const p = t.generate(createRng(seed), level);
        const again = t.generate(createRng(seed), level);
        assert.deepEqual(JSON.stringify(again, (k, v) => (typeof v === 'function' ? String(v) : v)), JSON.stringify(p, (k, v) => (typeof v === 'function' ? String(v) : v)), '같은 씨앗값이면 같은 문제');

        const where = `${t.id} L${level} seed${s}: ${plainText(p.text)}`;
        assert.ok(Array.isArray(p.text) && p.text.length > 0, `문장 없음 ${where}`);
        assert.ok(p.input && p.input.kind, `입력 형식 없음 ${where}`);

        // 정답을 그대로 넣으면 정답이어야 한다.
        const r = grade(p, p.answer);
        assert.equal(r.correct, true, `정답 채점 실패 ${where} → ${JSON.stringify(p.answer)}`);

        // 판별 오답은 정답과 달라야 하고, 넣으면 오답이어야 한다.
        for (const d of p.discriminators ?? []) {
          if (d.key || d.match) continue;
          assert.notEqual(d.value, p.answer, `판별 오답이 정답과 같음 ${where}`);
          assert.equal(grade(p, d.value).correct, false, `판별 오답이 정답 처리됨 ${where} (${d.value})`);
        }

        // 우연 겹침: 숫자 답이 문제 속 숫자와 같으면 안 된다(07 문서 0.4-4).
        if (typeof p.answer === 'number' && !p.allowAnswerInText) {
          assert.ok(!numbersIn(p.text).includes(p.answer), `답이 문제 속 숫자와 같음 ${where}`);
        }

        // 숫자는 모두 n()으로 감싸야 한다(문자열 조각 안에 숫자 금지). 단위 속 한 글자 예외는 없다.
        for (const piece of p.text) {
          if (typeof piece === 'string') assert.ok(!/\d/.test(piece), `문장 조각에 감싸지 않은 숫자 ${where}: "${piece}"`);
        }

        if (!t.diagnostic) {
          assert.equal(p.hints.length, 4, `힌트는 4개 ${where}`);
          assert.ok(!OPS.test(p.hints[0]) || t.repr === '식', `힌트 ①에 연산어 ${where}: ${p.hints[0]}`);
          assert.ok(p.explain && p.explain.why.length > 0, `해설 없음 ${where}`);
          assert.ok(/(이에요|예요|이에요\.|예요\.|어요\.|아요\.|해요\.)$/.test(p.explain.why.at(-1).trim()) || p.explain.why.at(-1).startsWith('그래서'), `해설 마지막은 결론 문장 ${where}`);
        }
      }
    }
  });
}
