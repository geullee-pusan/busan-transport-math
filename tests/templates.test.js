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

        // 한 문제 안의 판별 오답 값끼리 겹치면 안 된다(같은 답에 피드백이 둘이면 앞의 것만 나간다).
        // 숫자는 값으로, 배열·객체·문자열은 JSON으로 비교한다. key(칸)가 다르면 별개다. match(식 판별)만 있는 것은 뺀다.
        const seen = new Map();
        for (const d of p.discriminators ?? []) {
          if (d.value === undefined) continue;
          const v = typeof d.value === 'number' ? `n:${Math.round(d.value * 1e9) / 1e9}` : `j:${JSON.stringify(d.value)}`;
          const k = `${d.key ?? ''}|${v}`;
          assert.ok(!seen.has(k), `판별 오답 값이 겹침 ${where} (${d.key ? `${d.key}: ` : ''}${JSON.stringify(d.value)} — "${seen.get(k)}" / "${d.feedback}")`);
          seen.set(k, d.feedback);
        }

        // nudge(도움) 판별 오답에는 첫 오답용 점검 문구(feedbackCheck)가 있어야 한다(10 문서 2절).
        for (const d of p.discriminators ?? []) {
          if (d.kind !== 'nudge') continue;
          assert.ok(typeof d.feedbackCheck === 'string' && d.feedbackCheck.trim() !== '', `nudge에 feedbackCheck 없음 ${where} ("${d.feedback}")`);
        }

        // 우연 겹침: 숫자 답이 문제 속 숫자와 같으면 안 된다(07 문서 0.4-4).
        if (typeof p.answer === 'number' && !p.allowAnswerInText) {
          assert.ok(!numbersIn(p.text).includes(p.answer), `답이 문제 속 숫자와 같음 ${where}`);
        }

        // 숫자는 모두 n()으로 감싸야 한다(문자열 조각 안에 숫자 금지). 단위 속 한 글자 예외는 없다.
        for (const piece of p.text) {
          if (typeof piece === 'string') assert.ok(!/\d/.test(piece), `문장 조각에 감싸지 않은 숫자 ${where}: "${piece}"`);
        }

        // 아이 화면에 "(가상)" 글자를 쓰지 않는다. 가정은 "~라고 해 봐요", "이 문제의 ~"처럼 문장으로(07 0.4-13).
        const shownText = [plainText(p.text), ...(p.hints ?? []), JSON.stringify(p.figure ?? null), JSON.stringify(p.explain ?? null)].join(' ');
        assert.ok(!shownText.includes('(가상)'), `"(가상)" 글자 ${where}`);

        // 힌트 ④는 빈칸의 값을 다른 표현(자릿값 말, 완성된 답)으로도 알려 주지 않는다(UX 7차 A-2).
        if (!t.diagnostic && typeof p.blank === 'string' && p.blankAnswer != null && p.hints?.[3]) {
          const rest = p.hints[3].split(p.blank).join(' ');
          if (typeof p.answer === 'number' && String(p.answer).length >= 2) assert.ok(!new RegExp(`(^|[^\\d])${p.answer}([^\\d]|$)`).test(rest), `힌트 ④에 답이 그대로 있음 ${where}: ${p.hints[3]}`);
          if (/^[\d☐]+$/.test(p.blank)) {
            const place = ['일', '십', '백', '천', '만'][p.blank.length - 1 - p.blank.indexOf('☐')];
            if (place) assert.ok(!new RegExp(`${place}(의 자리| 모형)? ${p.blankAnswer}개`).test(rest), `힌트 ④가 빈칸 자리(${place}) 값을 알려 줌 ${where}: ${p.hints[3]}`);
          }
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
