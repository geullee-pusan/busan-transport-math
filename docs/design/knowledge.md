# UX 자문 지식 노트 — 아동 UX, 학습 앱 화면, 큰 태블릿, 수학 문제 화면

> 작성: UX 자문, 2026-10-04. 웹 자료를 직접 열어 읽은 것만 적었다. 원문을 못 열고 검색 요약으로만 본 것은 **[미검증]**.
> 기기 환산(탭 S8 울트라, 14.6", 가로 1480 CSS px ≈ 31.4cm): **1cm ≈ 47 CSS px**. 공개 규격으로 계산한 근사치이며 실측 아님.
> 각 항목 끝의 **→ 이 앱**은 우리 앱에 옮길 때의 해석이다. SPEC 원칙(만화 캐릭터 칭찬 없음, 정답·오답에 색 없음, 장식 금지)과 부딪히는 사례는 **⚠ 원칙 충돌**로 표시했다.

---

## 1. 아동 사용성 (나이별 차이)

| 근거 | 내용 | 출처 |
|---|---|---|
| NN/g 아동 웹사이트 연구(2001·2010·2018, 아동 125명) | 3~5 / 6~8 / 9~12세로 나눠 설계. 6~8세는 **더듬어 읽고**, 9~12세는 훑어 읽음. 중복·여러 겹 내비게이션은 아동을 "매우 혼란"시킴. 아동은 애니메이션·소리를 좋아하고 기대함. 광고와 콘텐츠를 구분 못 함 | Sherwin & Nielsen, 2019 — https://www.nngroup.com/articles/childrens-websites-usability-issues/ |
| NN/g 신체 발달 | 9세 미만 터치 목표 **최소 2cm × 2cm**(성인 1cm). 6~8세 소근육·협응 제한. 터치의 탭·스와이프·드래그는 쉬운 편이나 같은 일을 여러 입력으로 할 수 있게 | Liu, 2018 — https://www.nngroup.com/articles/children-ux-physical-development/ |
| NN/g 아동 인지 | 작업 기억이 작다 → 설명 없이 쓰이는 화면. 지시는 단계적으로, 소리 + 시각 시범 함께. 미묘한 피드백(표정 변화 등)은 알아채지 못함 → 직설적으로. 맥락 없는 숫자는 혼란 | Liu, 2018 — https://www.nngroup.com/articles/kids-cognition/ (요약 모델 거쳐 읽음, 세부는 원문 대조 권장) |
| NN/g 터치 목표 일반 | 크기 먼저, 그다음 목표 사이 간격 | Harley, 2019 — https://www.nngroup.com/articles/touch-target-size/ |

→ 이 앱: 초3(8~9세)은 6~8과 9~12의 경계다. **"더듬어 읽는 아이"를 기준**으로 설계한다(문장 2~3줄, 그림이 조건을 말함, 🔊). 내비게이션은 화면마다 한 겹.

## 2. 아동 터치 목표·제스처 실험 수치

| 근거 | 수치 | 출처 |
|---|---|---|
| Anthony 외 2013(아동 44명 6~17세 + 성인 30명, 스마트폰) | 6.4mm 목표 첫 시도 **놓침 7~10세 30%**(성인 12%), 12.7mm 목표 약 5% 이하. "어릴수록 더 큰 목표". **홀드오버**(화면이 바뀐 뒤 이전 목표 자리를 다시 누름): 7~10세 3.93%, 성인 0.56% → 화면 전환 직후 이전 자리 터치는 무시하라. 화면 가장자리 10px 틈에서 놓침 2배 → 목표를 가장자리에 붙이거나 틈 터치를 가장 가까운 목표로. **활성 영역을 보이는 경계보다 크게** | https://lisa-anthony.com/wp-content/uploads/2013/04/anthony-et-al-jpuc2013.pdf |
| Woodward 외 2017(5~10세, 13.3" 펜 태블릿) | 놓침 **터치 41%, 펜 32%**. 펜이 정확하지만 느림(1641ms vs 1159ms). 손을 뗄 때 밀림 펜 9px·터치 6.4px → 밀림 허용. **화면 위쪽 목표 놓침 50%, 가운데·아래 38%** → 자주 누르는 것은 아래쪽에. 태블릿 홀드오버 9.9%. 0.7인치(약 1.8cm) 이상에서 나이 차 사라짐 | https://init.cise.ufl.edu/wp-content/uploads/sites/378/2017/12/Woodward-et-al-ICMI2017.pdf |
| TIDRC(Soni 외 2019, 근거 기반 권고 57개) | 7~11세 글자 14pt 이상. 목표 밖 **10mm까지 탭 인정**. 드래그는 부분 완료 인정. 위계형 메뉴 피하기. 3~5초 무반응이면 다음 행동 안내. 터치 접수 피드백은 "더 크고 길게". 포인트 같은 외적 보상에 과하게 기대지 말 것. 튜토리얼보다 과제 중 안내 | https://init.cise.ufl.edu/wp-content/uploads/sites/378/2019/04/TIDRC-Framework-soni-et-al-IDC19-final.pdf |
| Sesame Workshop 2012(미취학, 50개 이상 연구) | 탭이 가장 직관적. 더블탭은 반응 없다고 오해(부모 영역처럼 막아야 할 곳에만). 세로 스크롤은 개념적으로 어려움 → 중요한 것은 첫 화면에. 무반응 안내: 게임형 6~8초. 오답은 3단계(알림+격려 → 목표 다시 + 힌트 → 정답 강조) | https://joanganzcooneycenter.org/wp-content/uploads/2020/02/SesameWorkshop-2012.pdf |
| [미검증] Hourcade 외 2004 | 4~5세 마우스 포인팅, 목표 크기·나이 효과 유의 | 검색 요약만 |

→ 이 앱 환산: **2cm ≈ 94px, 1.8cm ≈ 84px, 10mm 허용 ≈ 47px.** 지금 규격(최소 48, 주요 72~80)은 성인 기준에 가깝다. 자주 누르는 키패드·답 내기·선택지는 **84px 이상**, 그 밖은 보이는 크기를 유지하되 활성 영역을 넓힌다. "답 내기 → 다음 문제"가 **같은 자리**에 나오면 홀드오버로 정답 피드백을 건너뛸 수 있다.

## 3. 인지 부하와 문제 제시

| 근거 | 내용 | 출처 |
|---|---|---|
| Ayres & Sweller 2005(주의 분산 효과) | 그림과 글이 떨어져 있으면 머릿속에서 맞추느라 작업 기억을 쓴다. 풀이·수치를 **그림 속 해당 자리에 붙이면** 오류·시간 감소(Tarmizi & Sweller 1988, Ward & Sweller 1990). 단 ① 둘이 각자로는 이해 안 될 때만 ② 어려운 자료에서만 ③ 숙련자에겐 역효과 가능 | https://www.davidlewisphd.com/courses/EDD8121/readings/2006-AyersSweller.pdf |
| Mayer 2014(멀티미디어 원리 효과 크기) | 공간 근접성 중앙값 d = 1.12, **일관성(관계없는 흥미 요소 빼기) d = 1.66**, 배경음악은 학습 저하 d = 1.11, 중복 d = 0.72 저하, 신호(굵게·화살표) d = 0.52, 분할(나눠서 "계속") d ≈ 0.8~1.0, 사전 훈련 d ≈ 0.85, 글 대신 음성 d = 1.02 | https://eddl.tru.ca/wp-content/uploads/2020/01/mayer-multimedia-instruction.pdf |
| [미검증] Mayer 2017 JCAL | 근접성 0.79, 일관성 0.70, 중복 0.87 | 검색 요약만(Wiley 403) |

→ 이 앱: ① 문제 속 수치는 그림의 해당 칸 옆에 라벨로(근접성). ② **풀이 화면에는 셀 대상 말고 장식을 두지 않는다**(일관성 d = 1.66 — 가장 큰 효과). 풍성한 그림은 홈·일지·차고·출발 장면에 쓴다. ③ 🔊로 읽어 줄 때 긴 글을 또 띄우지 말고 읽는 어절만 강조. ④ 해설은 문장 단위로 나눠 "다음"(분할).

## 4. 난독 경향·읽기

| 근거 | 내용 | 출처 |
|---|---|---|
| British Dyslexia Association Style Guide 2018 | 산세리프. 16~19px 이상(더 크게 원하는 독자 있음). 줄 간격 1.5. 기울임·밑줄 피하고 굵게로 강조. 제목은 본문보다 20% 이상 크게. **흰색 대신 크림·옅은 단색 바탕**, 무늬 바탕 금지, 빨강/분홍–초록 조합 피하기. 왼쪽 정렬, 양쪽 맞춤·다단 금지, 한 줄 60~70자. 짧은 능동문, 이중 부정 금지 | https://iped-editors.org/wp-content/uploads/2021/05/British-Dyslexia-Association-Style-Guide-2018.pdf |
| 조재형·엄우용 2013, 『아동교육』 22(1) | 초6 284명 서체 선호, 32명 읽기 속도: 문장 수준에서 굴림 선호·가독 시간 최단, 목판체 최장(인쇄물, 초6) | https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART001745580 |
- 초3 태블릿 화면의 한국어 가독성 연구는 찾지 못했다.

→ 이 앱: 지금 규격(26px·1.6·왼쪽 정렬·keep-all)은 기준을 넘는다. **"밑줄 강조"는 피하라는 권고**가 있어 피드백이 짚는 곳을 밑줄 대신 **굵게 + 옅은 바탕 띠**로 바꾸는 것을 검토. 문제 판 바탕은 순백보다 아주 옅은 크림(시각 토큰과 맞춰 대비 유지).

## 5. 피드백·칭찬·보상

| 근거 | 내용 | 출처 |
|---|---|---|
| Shute 2008(형성 피드백 리뷰) | 어렵고 새로운 과제·성취 낮은 학습자에겐 **즉시** 피드백. 다른 학생과 비교 금지. 칭찬은 아껴서(주의를 "자기"로 돌림). 몰입 중에 끊지 말 것. 시도 전에 정답 보이지 말 것. 힌트가 늘 정답으로 끝나면 남용 → 장치 필요. 글만이 아니라 소리·그림으로도 | https://andymatuschak.org/files/papers/Shute%20-%202008%20-%20Focus%20on%20Formative%20Feedback.pdf |
| Dweck 2008(Mueller & Dweck 1998 요약) | "똑똑하구나" 칭찬 집단은 쉬운 과제를 고르고, 어려움 뒤 성적 하락, 점수 거짓 보고 약 40%(노력 칭찬 집단 약 10%). 전략·끈기·향상을 칭찬 | https://teaching.temple.edu/sites/teaching/files/resource/pdf/Dweck-Perils%20&%20Promises%20of%20Praise.pdf |
| TIDRC #33·#54 | 외적 보상 과의존 경계. 선택·꾸미기는 내적 동기를 높임 | 위 TIDRC PDF |
| [미검증] Lepper, Greene & Nisbett 1973 | 미리 약속한 보상이 이후 자발적 활동을 줄임(과잉 정당화) | 검색 요약만 |

→ 이 앱: 지금 원칙(사실형 피드백, 비교 금지, 즉시 피드백, 해설은 끝난 뒤)과 맞다. 일지의 "다시 생각해서 맞힌 문제" 같은 **과정 칭찬**은 근거가 있다(문구는 사실형 유지).

## 6. 잘 만든 학습 앱의 화면 (공개 자료로 확인한 범위)

| 앱 | 확인한 것 | 출처 |
|---|---|---|
| **Duolingo** | 그림은 둥근 기본 도형 3가지, 그림당 모양 약 15개, 평면 투시, 최소 디테일 + 분명한 실루엣 + 흰 여백. 캐릭터가 문장을 "말함", 연속 정답 사이에 보상 장면. 맨 위 진행 막대(퍼센트 없음) | https://blog.duolingo.com/shape-language-duolingos-art-style/ , https://blog.duolingo.com/building-character/ , https://ixd.prattsi.org/2021/09/design-critique-duolingo-web-app/ |
| **Duolingo Math** | 같은 덧셈도 블록·정수·문장제 등 **맥락마다 다른 시각 표현**. 실생활 맥락 문제 유형. 그림을 **코드로 생성**(한 클래스로 수천 변형), M×N 격자 컴포넌트를 넓이·둘레·소수·좌표에 함께 씀. 3학년 곱셈은 수직선·문장제·빈칸, 관련 식을 한 화면에 | https://blog.duolingo.com/developing-math , https://blog.duolingo.com/3rd-grade-math/ |
| Duolingo(외부 리뷰) | 그림자·그라데이션 없음, 오리지널 그림 많음, 손글씨 숫자 인식·식 조립 드래그 | https://fueled.com/blog/duolingo-math/ |
| Duolingo(3자 가이드, 공식 아님) | 눌리는 입체 단추(아래 4px), 정답 초록·오답 빨강 배너 ⚠ 원칙 충돌 | https://blakecrosley.com/guides/design/duolingo |
| **Khan Academy Kids** | 홈: 큰 시작 단추 하나 → 개인화 학습 경로, 아래에 캐릭터 5종(과목별 방). 수학: 사물을 탭하면 숫자가 뜸(1:1 대응), 지시에 따라 사물 드래그 | https://apps.apple.com/us/app/khan-academy-kids/id1378467217 , https://blog.khanacademy.org/free-kindergarten-math-games/ (고객센터는 403, 검색 요약) |
| **DragonBox** | 수백 시간 아이 플레이 테스트. Numbers: 수가 막대 캐릭터(Noom, 길이 = 수). Big Numbers: 1·10·100 묶음 자원으로 마을 짓기 — **진행이 세계 안의 사물로 쌓임**, 대사 없음 | https://dragonboxapp.com/about/story-story , https://www.gamesforyoungminds.com/blog/2018/3/16/dragonbox-numbers , https://www.commonsensemedia.org/app-reviews/kahoot-big-numbers-dragonbox |
| **Prodigy** | 배경 위 문제 겹침, 색연필(풀이 낙서)·숫자 패드·**넉넉한 풀이 공간**. 한 번 틀리면 힌트·설명, 두 번 틀리면 정답 보이고 넘어감. 비평: 판타지 포장과 달리 문제는 **"평범하고 건조한 드릴"** — 맨 계산식을 화려한 배경에 얹는 것만으로는 부족하다는 근거 | https://thecanadianhomeschooler.com/prodigy-a-math-rpg-game/ , https://www.commonsensemedia.org/app-reviews/prodigy-kids-math-game |
| Brilliant | 재미와 깊은 집중 사이 균형이 리디자인 핵심. 경로 노드·축하·격려 애니메이션 | https://ustwo.com/work/brilliant/ , https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations |
| Toca Boca(시각 품질) | 아이 눈높이, "너무 완벽하지 않게", 소품이 완성된 환경 안에 | https://motionographer.com/2016/04/27/the-design-process-behind-toca-bocas-infectious-apps/ |
| 밀크T(천재교육) | 2024 개편: 상단 내비게이션, "오늘의 학습"으로 학습량 한눈에, 디지털 상장 | https://www.segye.com/newsView/20241118504560 |
| 아이스크림 홈런 | 5~6학년용으로 캐릭터를 "성장"(비율·복장·대사) — 학년에 맞는 성숙도 | https://www.etnews.com/20190207000141 |
| 웅진스마트올 | 2025.10 대개편: 1~2학년은 게임형 카드 먼저, 3~6학년은 하루·주간 학습량과 미션. 연속 출석·랜덤 티켓 ⚠ 원칙 충돌(SPEC 2.2 금지 항목) | https://www.hankyung.com/article/2025102119761 |
| 엘리하이 | 저학년 캐릭터 4종, 쨍한 색·큰 글자·큰 단추(검색 요약) | https://m.segye.com/view/20201215504312 |
- 국내 앱의 실제 문제 풀이 화면 배치는 공개 글로 확인하지 못했다.

## 7. 큰 태블릿 배치

| 근거 | 내용 | 출처 |
|---|---|---|
| Android 창 크기 클래스 | 너비 Expanded 840~1199dp, Large 1200~1599dp. 가로 태블릿 대부분이 높이 Medium(480~899dp) | https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes |
| Android 정석 배치 | **Supporting pane**: 주 영역 약 2/3 + 보조 영역(Expanded에서 70:30). List-detail | https://developer.android.com/develop/adaptive-apps/guides/canonical-layouts |
| Samsung One UI 큰 화면 | 너비 960dp 이상에서 **38:62 분할**. 그냥 늘린 배치는 가독성·공간 활용 모두 나쁨. 가로에서 3분할도 | https://developer.samsung.com/one-ui/largescreen-and-foldable/intro.html |
| Android 앱 품질(Tier 2) | 늘어나거나 적응 덜 된 UI 피하기 | https://developer.android.com/docs/quality-guidelines/adaptive-app-quality |
- Material 3 사이트(m3.material.io)는 자바스크립트 렌더링이라 본문을 읽지 못했다.

→ 이 앱: 1480×924는 **너비 Large · 높이 Expanded 경계**. 운행 화면은 늘린 2단(지금)이 아니라 **주 영역(문제 장면 + 작업대) 62 : 보조 영역(답·힌트·피드백) 38**의 supporting pane이 정석이다.

## 8. 이 앱의 원칙과 충돌하는 사례 정리
| 흔한 패턴 | 우리 결정 | 이유 |
|---|---|---|
| 마스코트가 문제를 읽고 칭찬(Duolingo, Khan Kids, 엘리하이) | 쓰지 않음. 대신 **실제 철도 사물**(역명판, 안내 방송, 운전석·계기판, 내 차량)이 그 역할 | SPEC 2.1 "만화 캐릭터 칭찬 없음", 도윤 "유치한 것 싫음", 홈런의 "학년에 맞는 성숙도" |
| 초록·빨강 정답/오답 배너 | 쓰지 않음(모양 + 문구) | 노선 색 충돌(ux-02), SPEC |
| 연속 출석·랜덤 티켓 | 쓰지 않음 | SPEC 2.2 |
| 풍성한 배경 장면(Toca, Prodigy) | **풀이 화면 밖에서만** | Mayer 일관성 d = 1.66, Prodigy "건조한 드릴" 비평 |
