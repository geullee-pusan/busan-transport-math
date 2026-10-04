// 장면·부품 그림(시각 자문 4차 docs/visual/assets/v2/scenes.mjs를 옮김). 순수 함수: SVG/HTML 문자열.
// 원칙(visual-review-04 2절): 풀이 자리(문제 판·작업대)에는 장식을 넣지 않는다. 풍부한 그림은 띠·홈·일지·차고·처음 화면에.

const INK = '#1F3342';

/** 띠 안 작은 차량(44×26): 옆모습 한 칸, 앞 = 오른쪽. kind: 'bus' | 'rail'. band = 아이가 고른 색(지붕 띠) */
export function bandVehicle({ kind = 'bus', band = INK, w = 44 } = {}) {
  const body = kind === 'bus'
    ? `<path d="M3 4H36Q42 4 43 10V20Q43 22 41 22H3Q1 22 1 20V6Q1 4 3 4Z" fill="#F6F8F9" stroke="${INK}" stroke-width="2"/><rect x="5" y="8" width="24" height="7" rx="1.5" fill="#2F4252"/><path d="M33 8H38Q41 9 41 13V15H33Z" fill="#2F4252"/><circle cx="11" cy="22" r="3.6" fill="#3A4650" stroke="${INK}" stroke-width="1.5"/><circle cx="34" cy="22" r="3.6" fill="#3A4650" stroke="${INK}" stroke-width="1.5"/>`
    : `<path d="M3 4H34Q42 4 43 12V20Q43 22 41 22H3Q1 22 1 20V6Q1 4 3 4Z" fill="#E4E9ED" stroke="${INK}" stroke-width="2"/><rect x="5" y="8" width="24" height="7" rx="1.5" fill="#2F4252"/><path d="M33 7H37Q41 9 41 14H33Z" fill="#2F4252"/><circle cx="9" cy="23" r="2.6" fill="#3A4650"/><circle cx="15" cy="23" r="2.6" fill="#3A4650"/><circle cx="30" cy="23" r="2.6" fill="#3A4650"/><circle cx="36" cy="23" r="2.6" fill="#3A4650"/>`;
  return `<svg class="band-car-svg" viewBox="0 0 44 27" width="${w}" height="${(w * 27) / 44}" aria-hidden="true">${body}<rect x="4" y="5" width="${kind === 'bus' ? 30 : 28}" height="2.5" rx="1" fill="${band}"/></svg>`;
}
