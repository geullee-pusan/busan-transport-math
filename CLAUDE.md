# CLAUDE.md

## 프로젝트
부산 교통 수학. 부산 도시철도 노선도를 따라가며 배우는 초등 수학 학습 앱이다. 대상은 대중교통과 기차를 좋아하는 부산의 초등학생이고, 태블릿 브라우저에서 오프라인으로 돌아간다.

- 기획서: `docs/SPEC.md` (작업 전에 1~4절과 관련 절을 읽는다)
- 사실 확인표: `docs/FACTS.md` / 교육과정: `docs/CURRICULUM.md`
- 커리큘럼 자문 산출물: `docs/curriculum/` (개념 그래프 `concept-graph.json`, 역별 문제 템플릿 문서 `07-…`, `08-…`)
- UX 자문 산출물: `docs/design/`
- 학생 세션 피드백과 결정 기록: `docs/student-feedback.md`
- 형제 프로젝트: `C:\Subway game` (busan-subway-design). 배포 방식과 부산 데이터를 이어받았다. 그 저장소는 고치지 않는다.

## 절대 규칙
- **학년이 아니라 실력에 맞춘다.** 학년은 선수 관계와 순서에만 쓰고, 아이 화면에 학년을 보이지 않는다(SPEC 1절).
- 부산 교통·지리 사실은 `docs/FACTS.md`의 값만 쓴다. 기억으로 채우지 않는다. 확인이 안 되면 `TODO(확인 필요)`로 남긴다.
- 문제 속 숫자는 모두 `n()`으로 감싸고 꼬리표를 단다: `{ real: true, source }` = FACTS 값, `{ virtual: true }` = 지어낸 이야기 숫자, 꼬리표 없음 = 순수 계산(`src/content/README.md`).
- 모든 문제의 정답은 채점 함수와 테스트로 검증한다(`tests/templates.test.js`).
- `src/engine/`과 `src/content/`는 순수 함수만 둔다. DOM에 접근하지 않고 `Math.random`을 쓰지 않는다. 날짜는 인자(`day`)로만 받는다. 같은 입력이면 같은 출력.
- 동기 장치 원칙(SPEC 2.2): 쓰지 않는 것 — 뽑기·무작위 보상, 순위·비교, 놓치면 잃는 연속 기록, **시간 측정을 보상에 쓰는 것**, 타이머·카운트다운, 알림, 자동으로 이어지는 다음 운행, 큰 실패 연출(빨간 X, 땡 소리).
- 꼼수 원칙: 꼼수로 가는 길의 보상은 정직한 길보다 항상 작게. 벌주지 말고 효과가 없게.
- 광고, 외부 링크, 결제, 사용 추적 없음. 배포물은 네트워크 요청 없이 동작한다(`scripts/check-dist.mjs`가 검사).
- `localStorage`는 늘 try/catch로 감싼다.
- 화면 문구: 초3 눈높이 "~해요"체, 한 문장에 한 가지 뜻. 정답·오답에 색을 쓰지 않는다(노선 색과 겹침, ✓/⏸ 모양과 문구로).
- 실제 지하철 녹음은 공공데이터 3033578(이용 제한 없음)의 열차진입 안내음·진입 방송만 쓴다. 차내 방송·멜로디 녹음은 쓰지 않는다.

## 기준 기기
갤럭시 탭 S8 울트라(CSS 1480×924 가로 / 924×1480 세로, 2배율, S Pen). 화면은 이 크기에 먼저 맞추고, 작은 태블릿·세로·휴대폰 폭에서도 깨지지 않게 한다(SPEC 9.3).

## 명령
- `npm run dev` — 개발 서버
- `npm test` — 엔진·템플릿 테스트
- `npm run build` — `dist/index.html` 한 파일 + 설치용 파일, 배포물 검사
- `npm run data` — 형제 프로젝트 데이터에서 `src/data/*.json`을 다시 만든다
- `npm run graph` — 개념 그래프 검사
- `npm run icons` — 홈 화면 아이콘

## 배포
`master`에 푸시하면 GitHub Actions(`.github/workflows/pages.yml`)가 테스트 → 빌드 → GitHub Pages 배포를 한다. 저장소: `geullee-pusan/busan-transport-math`.

## 폴더
- `src/engine/` 엔진(상태, 칸·개통, 운행, 급행·시승, 채점, 씨앗값 난수)
- `src/content/` 문제 템플릿(`templates/N01.js` …), 차량 카드, 숫자 꼬리표 도우미
- `src/ui/` 화면
- `src/data/` 형제 프로젝트에서 뽑은 부산 데이터(손으로 고치지 않음)
- `public/` manifest, 서비스 워커, 아이콘
- `docs/sources/` 교육부 원문(git에 넣지 않음)
