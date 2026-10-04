# 커리큘럼 자문 산출물

> 역할: 초등 수학 교육과정·교과서 개발, 영재·경시 지도 커리큘럼 자문 (Claude 세션)
> 기준: 기획서(학년이 아니라 실력 원칙 반영본), FACTS.md, CURRICULUM.md(별책 8 원문 대조), 학생 피드백 1~3차
> v3 (2026-10-04): 템플릿·그래프 JSON 추가, 학생 4차·UX 3차 반영(정비창 곁가지, 힌트 ① = 혼자, 칸 방식 개통 기준)
> v2 (2026-10-04): 성취기준 코드 반영, MVP = 1호선 전체(3~6학년 수와 연산 31개 성취기준), 학년 잠금 제거, 1~2학년 기초 노드 추가

| 파일 | 내용 |
|---|---|
| [01-risks-and-policy.md](01-risks-and-policy.md) | 교육적 위험 3가지 + 우선순위, **선수 그래프 정밀도 규칙, 숙달 판정 기준, 급행 통과**, 경시 원칙 |
| [02-concept-graph.md](02-concept-graph.md) | 1~2학년 기초(B01~B11) + 3~6학년 노선별 노드, 코드, 단계 붙은 선수 조건, 환승 융합, 중학교 확장 |
| [03-line1-mvp-map.md](03-line1-mvp-map.md) | MVP 1호선 지도 40역(다대포해수욕장→노포), 31개 성취기준 배치, 학생 연결 아이디어 판정 |
| [04-difficulty-ladder.md](04-difficulty-ladder.md) | 11단계 기준표, 나머지가 있는 나눗셈 1~11단계 예시(검산 완료) |
| [05-misconceptions-hints.md](05-misconceptions-hints.md) | 오개념 → 판별 오답 → 분류, 힌트 4단계 작성 틀 |
| [06-questions-for-students.md](06-questions-for-students.md) | 학생 세션에게 물어볼 질문 3개(4차에서 답 받음) |
| [07-line1-templates.md](07-line1-templates.md) | **MVP 구현용**: 1호선 앞 10역 템플릿(변수·단계 규칙·채점·판별 오답·힌트 문구·급행 통과 진단·해설), 곁가지 진단 |
| [08-line1-templates-11-20.md](08-line1-templates-11-20.md) | **MVP 구현용**: 1호선 11~20역(괴정~초량) 템플릿, 07과 같은 형식. 토성 1~11단계 전부 |
| [09-templates-additions.md](09-templates-additions.md) | 1~10역 일반 템플릿 보강(역마다 표현 3가지 이상), 11~20역 보강 후보 |
| [concept-graph.json](concept-graph.json) | 엔진이 읽는 개념 그래프 137노드(B11·N40·G43·R10·D10·X23) |
| [concept-graph.schema.json](concept-graph.schema.json) | 그래프 JSON 스키마 |
| [tools/validate-graph.mjs](tools/validate-graph.mjs) | 그래프 검사(순환, 없는 선수, 노선 순서 위반, 단계 조건). `node docs/curriculum/tools/validate-graph.mjs --verbose` |

## 남은 확인 사항
1. 중학교 확장 노드의 2022 개정 중1 성취기준 코드(`02-concept-graph.md` 7절)
2. 생선 가격, 배차 간격 등 FACTS에 없는 값은 모두 "(가상)"으로 쓴다. 실제 값을 쓰려면 FACTS에 추가 검증이 필요하다
