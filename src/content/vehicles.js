// 차량 등급(면허) 11단계와 카드. 제원은 docs/FACTS.md 값만 쓴다. 확인 못 한 값은 null("—"로 보임).
// SPEC 3.3절, 9.6절(카드 표기: 지금 달리는 최고속도 / 설계 속도).

export const TIERS = [
  { tier: 1, name: '시내버스', short: '시내버스', kind: 'bus', color: '#3D7FBF', facts: { note: '부산 시내버스(일반)' }, source: '부산시 시내버스 현황' },
  { tier: 2, name: '급행버스', short: '급행버스', kind: 'bus', color: '#C8342B', facts: { note: '1000번대 급행버스' }, source: '부산시 시내버스 현황' },
  { tier: 3, name: '도시고속버스', short: '도시고속', kind: 'bus', color: '#6B4FA0', facts: { note: '3000번대, 2025년 7월 새로 생김' }, source: '부산시 보도자료(2025 노선 개편)' },
  { tier: 4, name: '부산김해경전철', short: '김해경전철', kind: 'rail', color: '#895FA7', facts: { cars: 2, seats: '좌석 64 + 입석 120 = 184명', route: '사상–가야대, 21역', since: 2011, note: '무인운전' }, source: '부산김해경전철 운영사(bglrt.com), 2026-10-04 확인' },
  { tier: 5, name: '부산 도시철도', short: '도시철도', kind: 'rail', color: '#F7941D', facts: { cars: 8, route: '1호선 다대포해수욕장–노포, 40역, 39.9km' }, source: '부산교통공사 운영실적, 공공데이터 3033564' },
  { tier: 6, name: '동해선 광역전철', short: '동해선', kind: 'rail', color: '#0065B3', facts: { cars: 4, route: '부전–태화강, 23역, 63.8km' }, source: '코레일 광역철도 운영노선' },
  { tier: 7, name: '무궁화호', short: '무궁화호', kind: 'rail', color: '#C0392B', facts: { route: '부산역·부전역에서 출발', since: 1984 }, source: '위키백과(보조), 2026-10-04 확인' },
  { tier: 8, name: 'ITX-마음', short: 'ITX-마음', kind: 'rail', color: '#2E8B57', facts: { speedNow: 150, seats: 264, route: '부전–청량리, 부전–강릉', since: 2023 }, source: '위키백과(보조), 언론 2024-12' },
  { tier: 9, name: 'KTX-이음', short: 'KTX-이음', kind: 'rail', color: '#1F6FB2', facts: { speedNow: 260, speedDesign: 286, cars: 6, seats: 381, route: '부전–청량리', since: 2021 }, source: '위키백과, 아주경제 2021-01-05' },
  { tier: 10, name: 'KTX-산천', short: 'KTX-산천', kind: 'rail', color: '#5B6770', facts: { speedNow: 305, speedDesign: 330, cars: 10, since: 2010 }, source: '위키백과(보조)' },
  { tier: 11, name: 'KTX-청룡', short: 'KTX-청룡', kind: 'rail', color: '#1B4F72', facts: { speedNow: 300, speedDesign: 352, cars: 8, seats: 515, route: '서울–부산', since: 2024, why: '지금은 선로 사정으로 300 km/h까지 달려요. 앞으로 320 km/h까지 올릴 예정이에요(2028년 이후).' }, source: '위키백과, 비즈워치·아주경제 2024-04-22' },
];

export const tierOf = (t) => TIERS[Math.max(1, Math.min(11, t)) - 1];

/** 금테 카드가 되는 데 필요한 금 도장 수(낮은 단계 5개 → 높은 단계 10개) */
export const goldNeeded = (tier) => (tier <= 5 ? 5 : tier <= 8 ? 7 : 10);
