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

        // "어느 날"(07 0.4-14): 한 문제에 한 번만. 그 문장의 첫 숫자가 실제 값이면 안 되고, 제원(배차, 좌석 수, 정원) 문장에도 쓰지 않는다. "정거장 간격"·"앉아 있던 사람" 같은 상황 말은 걸리지 않게 붙은 말로 본다.
        const story = plainText(p.text);
        assert.ok((story.match(/어느 날/g) ?? []).length <= 1, `"어느 날"이 두 번 이상 ${where}`);
        const at = p.text.findIndex((x) => typeof x === 'string' && x.includes('어느 날'));
        if (at >= 0) {
          const firstNum = p.text.slice(at + 1).find((x) => x && typeof x === 'object' && 'num' in x);
          assert.ok(!firstNum || firstNum.tag !== 'real', `"어느 날" 문장의 첫 숫자가 실제 값 ${where}`);
          const sentence = story.slice(story.indexOf('어느 날')).split(/[.?]/)[0];
          assert.ok(!/배차|좌석 수|좌석은|좌석이 모두|정원은|정원이|칸 정원/.test(sentence), `"어느 날"을 제원 문장에 씀 ${where}: ${sentence}`);
        }

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

// 교통 장면 검사(보호자 피드백 2026-10-04: 시승 첫 문제 "68 × 7 = ?"가 계산식만 있었음).
// 모든 문제(진단 포함)의 문장은 숫자·기호·공백을 뺀 글자가 6자 이상이고, 교통 낱말이 하나 있어야 한다.
// 계산식 연습("식" 표현)도 식은 그대로 두고 앞에 그 역의 교통 장면 한 문장을 둔다.
const TRANSPORT_WORD = /역|열차|버스|칸|량|승객|탔|내렸|노선|정류장|환승|기차|KTX|호선|승강장|정거장|기관사|차량|지하철|교통카드/;
// 교통 낱말 검사에서 빼는 것:
//  - 도전 문제(challenge: true): 장소와 관계없는 순수 계산 퍼즐이라 교통 이야기를 억지로 붙이지 않는다(07 0.2절).
//  - 아래 목록: 이 검사를 넣을 때(2026-10-04) 이미 문장은 있었지만 교통 낱말이 없던 문제(노드 템플릿: 단계).
//    분수 띠·수 모형·숫자 읽기·시장·승차권처럼 다른 소재를 쓰는 문제들이다. 고치면 목록에서 지운다. 새 템플릿은 넣지 않는다.
const NO_TRANSPORT_WORD_YET = {
  'N04 T4-1': [2], 'N04 N04-D1': [2], 'N05 T5-2': [2], 'N05 T5-3': [2], 'N06 T6-1': [2, 3], 'N08 T8-1': [3, 6], 'N08 T8-2': [1, 2], 'N08 N08-D2': [3],
  'N09 T9-1': [2, 3], 'N09 T9-2': [2, 3, 4], 'N09 N09-D1': [2], 'N09 N09-D3': [4], 'N10 T10-1': [2, 4, 5], 'N10 N10-D1': [2], 'N10 N10-D3': [5],
  'N11 T11-1': [2, 3, 4], 'N11 T11-2': [1, 2, 3], 'N11 N11-D1': [1], 'N11 N11-D2': [4], 'N11 N11-D3': [3], 'N12 T12-4': [1, 2, 3],
  'N14 T14-3': [1, 2, 3], 'N15 T15-1': [2], 'N15 T15-4': [1, 2, 3], 'N15 N15-D1': [1], 'N16 T16-2': [1, 2, 3, 4], 'N16 T16-4': [1, 2, 3],
  'N16 N16-D2': [3], 'N16 N16-D3': [4], 'N17 T17-2': [1, 2, 3], 'N18 T18-1': [2, 3, 5, 6], 'N18 T18-3': [1, 2, 3], 'N18 N18-D1': [3],
  'N18 N18-D2': [3], 'N18 N18-D3': [6], 'N19 T19-1': [2, 3], 'N19 T19-2': [9], 'N19 T19-4': [1, 2, 3], 'N19 N19-D2': [2], 'N20 T20-1': [3, 5, 6],
  'N20 T20-3': [1, 2, 3], 'N20 N20-D1': [5], 'N20 N20-D2': [3], 'N20 N20-D3': [6], 'B02 B02-P': [1, 2, 3], 'B02 B02-D1': [2], 'B02 B02-D2': [2],
  'B11 B11-D2': [2], 'B12 B12-D1': [2], 'B12 B12-D2': [2], 'B13 B13-D1': [2], 'B13 B13-D2': [2], 'G14 T14-3': [1, 2, 3], 'G16 T16-1': [1, 2, 3],
  'G16 T16-2': [1, 2, 3], 'G16 T16-3': [1, 3], 'G16 G16-D1': [3], 'G16 G16-D2': [3], 'G16 G16-D3': [3], 'G17 T17-2': [1, 2],
};

test('모든 문제에 교통 장면(계산식만 있는 문제 없음)', () => {
  const bad = new Map();
  for (const t of allTemplates()) {
    for (let level = t.minLevel; level <= t.maxLevel; level++) {
      for (let s = 0; s < SEEDS; s++) {
        const p = t.generate(createRng(hashSeed(t.id, level, s)), level);
        const txt = plainText(p.text);
        const words = txt.replace(/[\d\s.,=?□+−×÷()/:]+/g, '').length; // 숫자·기호·공백을 뺀 글자 수(단위 글자 cm·km도 셈)
        const exempt = p.challenge || t.challenge || NO_TRANSPORT_WORD_YET[`${t.node} ${t.id}`]?.includes(level);
        const why = words < 6 ? '글자 6자 미만' : !exempt && !TRANSPORT_WORD.test(txt) ? '교통 낱말 없음' : null;
        const key = `${t.node} ${t.id} L${level}${t.diagnostic ? ' [진단]' : ''}`;
        if (why && !bad.has(key)) bad.set(key, `${why}: ${txt}`);
      }
    }
  }
  assert.equal(bad.size, 0, `교통 장면이 없는 문제 ${bad.size}개\n${[...bad].map(([k, v]) => `${k} — ${v}`).join('\n')}`);
});
