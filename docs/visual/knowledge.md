# 시각 디자인 지식 노트 (웹 조사, 2026-10-04)

> 시각 자문이 판단할 때 쓰는 근거다. 원칙과 관찰만 내 말로 적었다. 남의 그림·에셋은 옮기지 않았고, 인용은 15단어 이내로 줄였다.
> 조사 범위는 네 가지다: 아동 학습 앱의 시각 언어, 교통 정보 디자인, 아동 시지각·수학 표상 연구, 일러스트 체계.
> 출처 등급은 이렇게 표시한다.
> - [논문]·[공식]: 연구 논문, 운영사·지자체·공식 지침
> - [언론]
> - [제3자]: 남이 정리하거나 추출한 자료
> - [위키]: 위키백과·나무위키
> UX 자문의 조사는 `docs/design/knowledge.md`에 따로 있다. 겹치는 부분은 그쪽을 따른다.

---

## A. 이 앱에 바로 쓰는 원칙 12개 (요약)

1. **풀이하는 자리는 조용히, 그 둘레는 진짜 철도처럼.** 상관없는 장식은 학습을 해친다(일관성 원리, 유혹적 세부). 반면 학습 대상을 따뜻하게 그리는 것은 도움이 된다(감정 디자인). 그래서 풍부한 그림은 띠·홈·일지·차고에 둔다. 문제 판과 작업대에는 두지 않는다. [A1–A5]
2. **"기차 앱"이 되려면 진짜를 정확히 그린다. 만화 기차는 그리지 않는다.** 아이들은 "아기용"을 아주 민감하게 거부한다. 한 아이는 만화와 기차가 나온다는 이유로 사이트를 아기용으로 판정했다. 노선 기호, 역 번호, 차량 형식처럼 실제 철도 문법이 철도 좋아하는 아이에게는 매력이다. [B1, B2]
3. **좋아하는 대상(열차)을 세는 단위로 쓸 때는 담백하게.** 실감 나거나 익숙한 대상으로 그리면 세기와 전이가 나빠진다. 문제 그림의 칸·사람은 중립적인 모양으로 둔다. 열차는 맥락(장면 테두리)으로만 쓴다. [C1–C3]
4. **단계에 따라 구체에서 도식으로(concreteness fading).** 낮은 단계에서는 알아볼 수 있는 실루엣으로 시작한다. 높은 단계로 가면서 막대·수직선, 다시 식으로 옮긴다. 넘어갈 때는 두 표현을 잠깐 함께 보여 준다. 1~2학년에게는 풍부한 그림이 유리했고, 4~5학년에게는 담백한 그림이 유리했다. [C4, C5]
5. **진행의 주인공은 한 화면에 하나, 그리고 크게.** 홈은 노선도 점등, 운행 화면은 띠의 칸과 차량, 일지는 개통 장면이 주인공이다. 그 밖의 것은 크기와 대비로 한 단계 낮춘다. [D1, D2]
6. **켜짐은 색이 아니라 "채움 + 빛"으로.** 노선 색은 정체성이다. 켜짐은 노선 색으로 채운 굵은 고리와 빛 테가 맡는다. 꺼짐은 흰 빈 원이다. 흑백에서도 채움과 빈 것으로 구분된다. 색만으로 구분하지 않는다(WCAG 1.4.1). [E5, D3]
7. **노선도는 지리를 조금 남긴다.** 바다·강·산 같은 지형지물이 "부산"을 만든다. 런던은 템스강만 남겼고, 서울 새 노선도는 강·해안선을 넣었다. 지리를 다 지운 1972 뉴욕 지도는 시민 반발로 바뀌었다. [E1–E3]
8. **차내 안내 화면 문법을 띠에 빌린다.** 도착역은 늘 위에 고정한다. 지나온 것은 흐리게 하고, 지금 위치 표지는 하나만 둔다. 줄어드는 시간 표시(카운트다운)는 쓰지 않는다. [E6, E7]
9. **역명판 위계를 빌린다.** 노선 원 → 한글 역명(가장 큼) → 역 번호 → 영문(작게) → 앞·뒤 역 화살 순서다. 실제 부산 역명판의 배치·비율은 베끼지 않는다. [E8, E9]
10. **일러스트는 한 가족으로 만든다.** 기본 도형 몇 가지, 선 굵기 하나, 모서리 반경 두 단계, 그림당 2~3색 + 중립색으로 제한한다. 그림자·그라데이션 대신 면 색 두 톤으로 깊이를 준다. 그림 하나에 도형은 10~20개 안팎이다. [F1–F5]
11. **누르면 반응하고, 반응은 대상에서 나온다.** 정답 연출은 그 계산이 노선 위에서 일어나는 모습(칸이 차고 차량이 나아감), 300~600ms다. 화면 전체 축포·캐릭터 칭찬은 쓰지 않는다. 마찰을 없애는 것(Oil)이 효과를 더하는 것(Juice)보다 먼저다. [A6, B3, B4]
12. **크기는 아이 손과 눈에 맞춘다.** 터치 대상은 약 2cm다(기준 기기 약 84~96px). 끌기에는 탭으로도 할 수 있는 길을 둔다. 7~9세는 큰 글자에서 더 빨리 읽고, 단계가 올라가도 글자를 줄이지 않는다. 행간은 약 160%다. [D4–D7]

---

## B. 아동 학습 앱 관찰

| 앱 | 관찰(내 말로) | 우리에게 |
|---|---|---|
| Duolingo / ABC | 모든 그림을 둥근 기본 도형 세 가지로 만든다. 그림 하나에 도형 약 15개, 원근은 평면, 실루엣을 먼저 챙긴다. 버튼 아래에 같은 색 계열의 단단한 "턱"이 있어 누르면 내려간다. 진도는 한 줄 경로이지만 "캔디크러시 같다"는 반발도 있었다 | 도형 수 상한, 누름 깊이. 진도 지도는 실제 노선도로(게임 지도 금지) |
| Khan Academy Kids | 시범 동작이 마스코트가 아니라 학습 대상에 주의를 모은다. "다시 해 보자"와 "끝났다"의 표현을 분명히 나눈다 | ✓와 ⏸의 움직임을 같은 모양으로 겹치지 않게 |
| DragonBox | 수를 그 크기의 막대로 그린다(쿠이즈네르식). 그림 기호를 차츰 x, 숫자로 바꾼다. 보상은 기분 좋지만 폭발적이지 않다 | 수 크기 = 그림 크기, 구체→기호 사다리 |
| Endless Numbers | 바탕은 차분한 모눈, 대상만 선명하다. 맞히면 그 수의 의미 장면이 나온다 | 정답 연출 = 의미 장면(칸이 차고 차량이 감) |
| Toca Boca | 규칙·점수·시간 제한이 없다. "장난감"이라 부른다. 너무 완벽하지 않은 일상을 그린다 | 당기는 장치 없음과 같은 방향 |
| Prodigy | 픽셀에서 래스터 일러스트로 바꿨고, RPG·상점이 화면을 차지한다 | 반대 사례(절제형인 우리와 정반대) |
| 아이스크림 홈런 2.0 | 과한 캐릭터와 유치한 색을 일부러 피했다. 성취를 숫자 대신 자라는 비유로 보인다 | 실력을 숫자로 직접 보이지 않음 = 노선 점등 |
| 밀크T | 저학년과 고학년 메인 화면을 분명히 나눈다 | — |
| 똑똑수학탐험대 | 섬 지도 탐험 + 카드 수집·재화 | 수집·재화는 우리가 피하는 장치 |

## C. 연구 근거 (수학 그림·멀티미디어)
- **유혹적 세부.** 흥미롭지만 상관없는 요소가 기억과 전이를 해친다(메타분석 g ≈ −0.33). 해를 끼치는 것은 문제와 주의를 다투는 요소다. [A2, A3]
- **교실 장식.** 장식이 많은 교실에서 유치원생의 주의 이탈이 늘고 성과가 떨어졌다. 15주가 지나도 익숙해지지 않았다. [A4]
- **신호.** 굵기·화살표·테두리로 어디를 볼지 짚으면 기억(g ≈ 0.53)과 전이(g ≈ 0.33)가 좋아진다. 강조는 결과값이 아니라 구조를 향하게 한다. [A7]
- **공간 근접.** 낱말은 그림 바로 옆에 둔다(g = 0.63). 범례 대신 직접 이름표를 붙인다. [A8]
- **분절.** 아이가 직접 넘기는 단위로 나눈다. 자동으로 넘기지 않는다. [A9]
- **막대그래프 안 그림.** 막대 안에 그림을 넣어 배운 아이들은 높이를 읽지 않고 그림 개수를 세는 오류를 더 냈다. [C1]
- **실감과 익숙함.** 진짜 돈 같은 그림은 오류를 늘렸고(단, 개념 오류는 덜했다), 익숙한 장난감 같은 물건은 세기를 방해했다. [C2, C3]
- **나이에 따른 차이.** 1~2학년은 실감 나는 그림, 4~5학년은 담백한 그림에서 더 넓게 일반화했다. [C4]
- **구체에서 도식으로.** 기초 수학에서 대체로 효과가 확인됐다. [C5]
- **선형 배치.** 직선 판 게임이 원형 판보다 수 크기 이해를 높였다. 노선도는 좋은 수직선이 된다. 순환 노선 그림은 주기·나머지에만 쓴다. [C6]
- **분수.** 수직선이 핵심 표상이고, 넓이 모델은 분수 나눗셈에서 덜 도움이 됐다. [C7]
- **막대 모델.** 문장제 구조를 보이게 해 준다. 다만 완성본을 주면 그림이 대신 생각한다. [C8]
- **문장제 삽화.** 무관하거나 중복되는 삽화는 약 9.5세의 수행을 떨어뜨렸다. 작업기억이 약할수록 크다. [C9]

## D. 시지각·가독성·터치
- **글자 크기.** 7~9세는 x-height 5.0mm 글자를 4.2mm보다 약 9% 빨리 읽었다. 시험 중 글자를 줄이지 않으면 측정된 읽기 연령이 4개월 높았다. [D4]
- **행간과 글꼴.** 어린이 화면 가독성은 행간 160% 조합이 가장 좋았다. 획이 단순하고 글자끼리 차이가 큰 고딕이 유리했다. 장식체는 느리다. 1·7, 6·9가 분명히 구별되는 숫자를 쓴다. [D5, D6]
- **한눈에 읽는 범위.** 한글 읽기의 시각 폭은 학년이 오르며 넓어진다. 숫자와 단위는 짧은 덩어리로 묶는다. [D7]
- **연령대.** 3~5, 6~8, 9~12세로 나눈다. 아이들은 애니메이션·소리를 좋아하고 반응을 기대한다. [B1]
- **터치 대상.** 약 2cm × 2cm, 버튼 사이 간격, 끌기·탭 둘 다 허용. 가장자리 단추는 가장자리까지 누를 수 있게 한다. [B2, D8]
- **위계.** 한 화면에 가장 큰 것 하나. 위계는 크기·대비·묶음으로 만든다. 큰 화면을 꼭 채울 필요는 없다(빈 공간도 주의를 지킨다). [D1, D2]
- **보기 좋은 화면.** 더 쓰기 쉬워 보이게 하지만 큰 결함은 덮지 못한다. 테스트에서는 아이의 말보다 행동을 본다. [D3]

## E. 교통 정보 디자인
- **Beck 다이어그램.** 가로·세로·45°만 쓰고, 역 간격을 고르게 하고, 꺾임을 줄이고, 복잡한 가운데를 키운다. 역 기호는 두 등급뿐이다. 서울 2023 노선도도 "8선형"을 쓴다. [E1, E2]
- **INAT(Cerovic).** 한 노선은 5번 넘게 꺾이지 않는다. 기호 세트를 고정하고 예외를 두지 않는다. [E3]
- **Vignelli.** 지리를 지운 1972 지도는 1979년에 바뀌었다. 교훈: 아이가 아는 지형지물 몇 개는 남긴다. "점이 없으면 서지 않는다"는 통과역 표현에 맞는다. [E3]
- **지리의 역할.** 이 앱은 지형 위에 **실제 모양** 노선을 그린다(학생 #1: 직선 대각선은 가짜로 보임). 형제 앱 노선도(직선화)와 다르다는 점은 SPEC 9.6 "두 앱이 같아야 한다"와 부딪히므로 결정이 필요하다(visual-review-04 6절).
- **차내 안내 화면.**
  - 1983년 긴자선 01계의 노선도형 표시기가 시작이다(진행 방향 램프, 열리는 문 쪽 깜빡임).
  - 일본은 "다음은 / 곧 / 지금", 한국은 "다음역 / 이번역" 세 상태로 나눈다.
  - 서울은 도착역을 위에 고정하는 쪽으로 바꾸는 중이다(놓치기 쉽다는 민원).
  - 지나온 역은 흐리게, 진행 방향은 화살표 하나로 보인다. [E6, E7]
- **역 번호.** 부산은 백의 자리가 노선이고 1호선은 095~134다(공공데이터 역 코드와 같음). 도쿄는 노선 색 원 안에 알파벳과 번호를 넣는다. [E8]
- **부산 역명 표지.** 2024년 스크린도어 9,728곳에 국문·영문·역 번호를 함께 적은 역명 표지를 붙였다. 명암 대비를 살렸다. [E9]
- **픽토그램.** AIGA/DOT 1974 체계는 면·여백·채움·방향·크기의 일관성을 점검했다. SBB는 그리드 하나 위에 픽토그램·화살·번호를 올렸다. [E10]
- **열차 일러스트 관례.**
  - 옆모습이 기본이다. 지붕·바퀴 중심·레일, 세 가로선이 뼈대다.
  - 대차는 차 끝에서 약 1/3 안쪽에 둔다.
  - 정체성 단서는 효과가 큰 순서로: 앞모양 > 띠 색 > 옆면 문 수 > 팬터그래프 > 칸 수 > 창 띠.
  - 리벳·와이퍼·바닥 밑 기기 세부는 뺀다. 같은 축척으로 늘어놓으면 길이 비교가 수학이 된다. [E11]

## F. 일러스트 체계·SVG
- **Polaris.** 일관성이 깨지면 품질이 낮아 보인다. 그림 하나에 메시지 하나, 2~3색 + 중립색, 주변 UI보다 낮은 채도. [F1]
- **IBM.** 격자·각도·반경의 일관성이 정체성이다. 선 / 평면 / 아이소메트릭을 용도로 나눈다(아이소메트릭은 부피 단원에만). [F2]
- **Material.** 획 굵기 하나. [F3]
- **GOV.UK.** 평평한 색 면을 쓰고, 그림자는 겹침을 보여야 할 때만 쓴다. [F4]
- **Atlassian.** 일러스트는 정해진 자리(빈 상태·축하·안내)에만 두고, 한 화면에 여럿 넣지 않는다. [F5]
- **SVG 기법.**
  - 반복 요소는 `<symbol>`/`<use>`로 한 번만 정의한다.
  - 크기를 바꿔도 선 굵기를 지키려면 `vector-effect: non-scaling-stroke`를 쓴다.
  - 색 말고 다른 구분이 필요하면 `<pattern>`(빗금)을 쓴다.
  - 움직임은 transform·opacity로만 만들고 `prefers-reduced-motion`을 지킨다. [F6]

---

## 출처
- A1 Mayer 원리 요약: https://www.devlinpeck.com/content/mayers-principles-of-multimedia-learning
- A2 Sundararajan & Adesope 2020: https://link.springer.com/article/10.1007/s10648-020-09522-4
- A3 Rey 2012 / 후속: https://onlinelibrary.wiley.com/doi/10.1002/acp.3503 , https://pmc.ncbi.nlm.nih.gov/articles/PMC10176302/
- A4 Fisher·Godwin·Seltman 2014: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4274873/ , https://www.sciencedaily.com/releases/2014/05/140527100646.htm
- A5 Plass 외 2014 감정 디자인: https://nyuscholars.nyu.edu/en/publications/emotional-design-in-multimedia-learning-effects-of-shape-and-colo
- A6 Takacs 외 2015 전자 그림책: https://eric.ed.gov/?id=EJ1081714
- A7 Schneider 외 2018 신호: https://www.learntechlib.org/p/204443/
- A8 Schroeder·Cenkci 2018 공간 근접: https://link.springer.com/article/10.1007/s10648-018-9435-9
- A9 Rey 외 2019 분절: https://maria-wirzberger.de/wp-content/uploads/2019/01/Rey2019_Article_AMeta-analysisOfTheSegmentingE.pdf
- B1 NN/g 아동 인지·사이트: https://www.nngroup.com/articles/kids-cognition/ , https://www.nngroup.com/articles/childrens-websites-usability-issues/ , https://www.nngroup.com/reports/children-on-the-web/
- B2 NN/g 신체 발달: https://www.nngroup.com/articles/children-ux-physical-development/
- B3 Game feel / Juice: https://valdemird.com/blog/game-feel-on-the-web/
- B4 Oil it or spoil it: https://www.gamedeveloper.com/design/oil-it-or-spoil-it-
- B5 Duolingo 모양 언어: https://blog.duolingo.com/shape-language-duolingos-art-style/ , https://design.duolingo.com/illustration
- B6 Duolingo 홈 경로: https://blog.duolingo.com/new-duolingo-home-screen-design , 반응 https://www.nbcnews.com/tech/tech-news/duolingos-update-redesign-luis-von-ahn-interview-rcna44655
- B7 Duolingo 버튼(제3자 추출): https://github.com/nexu-io/open-design/blob/main/design-systems/duolingo/DESIGN.md
- B8 Khan Academy Kids: https://svgapp.ai/app-mascots/khan-academy-kids/ , https://natalie-fitzgerald.com/khan-academy-brand-design
- B9 DragonBox: https://kahoot.com/home/learning-apps/dragonbox/ , https://www.gettingsmart.com/2013/05/24/dragonbox-this-is-how-you-gamify/ , https://www.gamesforyoungminds.com/blog/2018/3/16/dragonbox-numbers
- B10 Prodigy: https://www.nataliathomson.com/prodigy
- B11 Toca Boca: https://www.vice.com/sv/article/meet-toca-boca-the-disney-destroyers-of-the-app-store-831/
- B12 Endless Numbers: https://www.hbook.com/story/endless-numbers-app-review
- B13 아이스크림 홈런: https://design.co.kr/article/450/ , https://www.etnews.com/20190207000141
- B14 밀크T: https://www.segye.com/newsView/20241118504560
- B15 똑똑수학탐험대: https://www.toctocmath.kr/
- C1 Kaminski·Sloutsky(OSU 소개): https://news.osu.edu/look-something-shiny-how-some-textbook-visuals-can-hurt-learning/
- C2 McNeil 외 2009: https://groups.psych.northwestern.edu/uttal/vittae/documents/ShouldyoushowmethemoneyMcNeilUttal.pdf
- C3 Petersen·McNeil 2013: https://onlinelibrary.wiley.com/doi/abs/10.1111/cdev.12028
- C4 Menendez 외 2022: https://files.eric.ed.gov/fulltext/ED622917.pdf
- C5 Fyfe 외 2014: https://link.springer.com/article/10.1007/s10648-014-9249-3 , McNeil·Uttal 2009 https://onlinelibrary.wiley.com/doi/10.1111/j.1750-8606.2009.00093.x
- C6 Siegler·Ramani: https://siegler.tc.columbia.edu/wp-content/uploads/2019/02/sieg-ram09.pdf , Laski·Siegler 2014 https://siegler.tc.columbia.edu/wp-content/uploads/2019/02/2014-Laski-Siegler.pdf
- C7 IES 분수 지침: https://ies.ed.gov/ncee/wwc/docs/practiceguide/fractions_pg_093010.pdf , Sidney 2019 https://www.sciencedirect.com/science/article/abs/pii/S0361476X18305290
- C8 막대 모델: https://files.eric.ed.gov/fulltext/EJ1115069.pdf
- C9 Berends·van Lieshout 2009: https://research.vu.nl/en/publications/the-effect-of-illustrations-in-arithmetic-problem-solving-effects/
- C10 가상 조작물: https://www.researchgate.net/publication/260311379_Effects_of_Virtual_Manipulatives_on_Student_Achievement_and_Mathematics_Learning
- D1 NN/g 시각 위계: https://www.nngroup.com/articles/visual-hierarchy-ux-definition/
- D3 NN/g 심미-사용성: https://www.nngroup.com/articles/aesthetic-usability-effect/
- D4 Wilkins 외 2009: https://visualstress.info/2009-185.pdf
- D5 김선화·김지현 2002: https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART001557075
- D6 조재형·엄우용 2013: https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART001745580
- D7 최영은·유성재 2015: https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE11093853
- D8 WCAG 1.4.1: https://w3.org/WAI/WCAG22/Understanding/use-of-color.html , 터치 크기 https://tetralogical.com/blog/2022/12/20/foundations-target-size/
- E1 Harry Beck / Tube map: https://en.wikipedia.org/wiki/Harry_Beck , https://en.wikipedia.org/wiki/Tube_map
- E2 서울 노선도 개편: https://news.seoul.go.kr/culture/archives/520933
- E3 Vignelli·INAT: https://designobserver.com/mr-vignellis-map/ , https://www.designboom.com/art/jug-cerovic-standardizes-metro-maps-from-around-the-world-04-08-2014/
- E6 車内案内表示器: https://ja.wikipedia.org/wiki/車内案内表示器 , https://rail.hobidas.com/feature/485753/
- E7 서울 차내 도착역 고정: https://economist.co.kr/article/view/ecn202505060017 , https://mediahub.seoul.go.kr/archives/2007957
- E8 역 번호: https://en.wikipedia.org/wiki/Station_numbering , 도쿄메트로 https://www.tokyometro.jp/en/subwaymap/index.html
- E9 부산 스크린도어 역명 표지(철도경제신문 2024-09-19): https://www.redaily.co.kr/news/articleView.html?idxno=10189
- E10 DOT 픽토그램: https://en.wikipedia.org/wiki/DOT_pictograms , SBB https://www.lars-mueller-publishers.com/fahrgastinformationssystempassenger-information-system
- E11 열차 그리기 관례: https://tips.clip-studio.com/ja-jp/articles/8326 , 차량 사실(위키, FACTS 등록 전 확인 필요) https://ko.wikipedia.org/wiki/부산교통공사_1000호대_전동차 , https://ko.wikipedia.org/wiki/부산_도시철도_4호선
- F1 Polaris: https://polaris-react.shopify.com/design/illustrations
- F2 IBM: https://www.ibm.com/design/language/illustration/overview
- F3 Material: https://m3.material.io/styles/icons/designing-icons
- F4 GOV.UK: https://design-system.service.gov.uk/styles/images
- F5 Atlassian: https://atlassian.design/foundations/illustrations
- F6 MDN: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use , https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/pattern , https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/vector-effect

## 확인할 점
- **추정값.** 한글 본문 크기 권장값과 "2cm ≈ 84~100px" 환산은 라틴 문자 연구·기기 환산에서 나온 추정이다. 실제 아이들과 확인해야 한다.
- **2차 정리 자료.** Duolingo 버튼 수치는 제3자 추출이다. Polaris·IBM 페이지는 검색 요약으로 정리했다.
- **차량 외관.**
  - 위키에서 찾은 사실(1호선 스테인리스·한쪽 3문·팬터그래프, 4호선 제3궤조)은 FACTS.md에 올리기 전까지 그림에 쓰지 않는다.
  - 4호선·김해경전철·무궁화호 도색, KTX-이음·청룡 색의 공식 출처는 찾지 못했다.
