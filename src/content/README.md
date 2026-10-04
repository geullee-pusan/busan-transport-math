# 문제 템플릿 규격

문제 내용의 기준은 `docs/curriculum/07-line1-templates.md`(커리큘럼 자문)와 `docs/SPEC.md` 4절이다.
템플릿 파일은 `src/content/templates/<노드>.js`에 둔다(예: `N01.js`). 한 파일에 그 역의 템플릿을 모두 넣고 `export default [ ... ]`로 내보낸다.
`src/content/index.js`가 모든 파일을 모아 노드 id로 찾게 해 준다.

## 템플릿 객체
```js
{
  id: 'T1-2',            // 07 문서의 템플릿 번호
  node: 'N01',           // concept-graph.json 노드 id
  title: '열차 좌석',
  repr: '문장',          // 표현 태그: '그림' | '문장' | '식' | '빈칸'
  minLevel: 1,
  maxLevel: 6,           // 이 템플릿이 만들 수 있는 단계(역의 천장을 넘지 않음)
  diagnostic: false,     // 급행 통과 진단 문항이면 true (직접 입력만)
  generate(rng, level) { return problem; },
}
```
- `rng`는 `src/engine/rng.js`의 씨앗값 난수(`rng.int(a, b)`, `rng.pick(arr)`, `rng.next()`)다. **`Math.random`을 쓰지 않는다.** 같은 씨앗값 + 단계면 같은 문제가 나와야 한다.
- `reject` 조건(07 문서)은 generate 안에서 다시 뽑는 반복으로 구현한다(최대 50번, 넘으면 고정 예시 문제를 낸다).

## 문제 객체 (generate가 돌려주는 것)
```js
{
  text: [ '한 편성은 ', n(381, { real: true, source: 'FACTS: KTX-이음 381석' }), '석이에요. …' ],
  figure: null | { kind: 'train', cars: 6, ... },   // 화면이 그릴 수 있는 그림(없으면 null)
  input: { kind: 'number' }                         // 'number' | 'choice' | 'equation' | 'compound' | 'fraction' | 'decimal'
       // choice:   { kind:'choice', options:['예','아니요'] }
       // compound: { kind:'compound', fields:[{ key:'small', label:'가장 작은 수' }, { key:'answer', label:'그때 답' }] }
       // equation: { kind:'equation' }  → 응답 { left, op, right, result }
  estimateFirst: false,  // true면 "대충 몇백쯤일까요? 약 [ ]" 칸을 먼저 받는다(SPEC 4절)
  answer: 762,           // number | string | { key: value } (compound)
  discriminators: [ { value: 381, category: '읽기', feedback: '한 편성만 더했어요. 몇 편성이에요?' } ],
  hints: [ '①…', '②…', '③…', '④…' ],   // ①은 연산어·중간 수 금지(SPEC 4절)
  blank: '7☐2',          // 힌트 ④의 빈칸 틀(문자열, ☐ 자리를 아이가 채움). 없으면 null
  explain: { why: ['…', '…', '그래서 …예요.'], alt: ['…'] },  // 한 문장씩, 마지막은 결론
  meta: { level, templateId, seed }
}
```
- `n(value, opts)`은 `src/content/num.js`의 도우미다. **문장 속 모든 숫자**를 이걸로 감싼다. 세 종류: `n(v, { real: true, source })` = FACTS.md ✅ 값, `n(v, { virtual: true })` = 이야기를 위해 지어낸 값(화면에서 점선 밑줄), `n(v)` = 순수 계산 식의 수(표시 없음).
- 분류(category): `'식' | '계산' | '읽기' | '개념'` (SPEC 3.5).
- 피드백 문구는 두 줄 이내, 한 줄 18자 안팎, 물음 하나(SPEC 9.5c).

## 채점
채점은 엔진 공통 함수(`src/engine/grade.js`)가 07 문서 0.6절 순서로 한다. 템플릿은 `answer`와 `discriminators`만 정확히 주면 된다. 특수한 채점이 필요하면 문제 객체에 `grade(response) → { correct, category?, feedback? }`를 넣는다.
