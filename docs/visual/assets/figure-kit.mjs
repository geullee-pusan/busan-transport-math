// 부산 교통 수학 — 문제 그림(figures.js) 시각 규칙 조각 (시각 자문 1차, visual-review-01.md 7절)
// figures.js의 숫자(선 1.2·1.4·1.6·0.6, 칸 34px, 색 #9FB3C1)를 이 표 하나로 모은다.
// 원칙: "그림은 셀 수 있는 것만 또렷하게, 나머지는 지운다." 장식(창문·그림자·색)은 세는 대상과 겹치면 뺀다.

export const FIG = {
  ink: '#1F3342',
  paper: '#FFFFFF',
  fill: '#7F93A3',      // 칠함: 흰 3.18 / 그 위 진한 선 4.10 (지금 #9FB3C1은 2.17로 그래픽 기준 미달)
  mute: '#7A8691',      // 보조선(수 모형 안 격자, 작은 눈금)
  outline: 2,           // 세는 대상의 바깥선(칸, 조각, 사람, 모형) — 모든 그림 공통
  divider: 1.5,         // 대상 안쪽 나눔선(띠의 칸 경계, 넓이 모형 안쪽 선)
  grid: 1,              // 수 모형 안 격자(보조, --mute)
  mark: 4,              // 짚는 표시(highlight): 색이 아니라 굵기. 칠함과 함께 써도 구분됨
  label: 16,            // 그림 속 글자 최소(지금 13 → 16)
  minCell: 40,          // 누르거나 세는 칸 최소 화면 크기(px). 색칠 입력 칸은 56(SPEC 9.4)
  group: 5,             // 사람·점·배열은 5개마다 틈(한눈에 세기)
  groupGap: 8,          // 5개 묶음 사이 틈(보통 틈의 2배)
};

/** 반 칸·서행·"일부" 빗금 무늬. <defs> 안에 한 번 넣고 fill="url(#fig-hatch)" */
export const hatchDefs = `<pattern id="fig-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#FFFFFF"/><rect width="2" height="6" fill="#1F3342"/></pattern>`;

/** 사람 하나(셀 대상): 머리 원 + 어깨 둥근 몸. 크기 s(화면 px)에서 최소 20. 채움 진한색(흑백에서 가장 또렷) */
export function person(cx, cy, s = 22, { chosen = false } = {}) {
  const k = s / 22;
  const head = `<circle cx="${cx}" cy="${cy - 6 * k}" r="${4.2 * k}" fill="${FIG.ink}"/>`;
  const body = `<path d="M${cx - 7 * k} ${cy + 9 * k}v-4a${7 * k} ${6 * k} 0 0 1 ${14 * k} 0v4z" fill="${FIG.ink}"/>`;
  const ring = chosen ? `<rect x="${cx - 10 * k}" y="${cy - 12 * k}" width="${20 * k}" height="${23 * k}" rx="${4 * k}" fill="none" stroke="${FIG.ink}" stroke-width="2.5"/>` : '';
  return head + body + ring;
}

/** 사람 n명을 5명 묶음으로 줄 세움(한 줄 최대 10명 = 5+5). 칸 안 숫자는 쓰지 않는다 */
export function peopleRow(n, x0, y0, s = 22) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 10);
    const col = i % 10;
    const x = x0 + col * (s + 4) + (col >= 5 ? FIG.groupGap : 0) + s / 2;
    const y = y0 + row * (s + 10) + s / 2;
    out.push(person(x, y, s));
  }
  return out.join('');
}

/** 열차 칸(그림용). state: 'empty' | 'full' | 'half' | 'mark'. 창문 없음(칠함을 셀 때 방해),
 *  방향은 맨 앞 칸 앞 유리 하나로만. 칸 사이 연결부는 짧은 선 */
export function figCar(x, y, w = 48, h = 28, { state = 'empty', front = false, mark = false } = {}) {
  const fill = state === 'full' ? FIG.fill : state === 'half' ? 'url(#fig-hatch)' : FIG.paper;
  const nose = front ? 8 : 0;
  const d = `M${x + 3} ${y}H${x + w - nose}Q${x + w} ${y} ${x + w} ${y + nose + 4}V${y + h - 3}Q${x + w} ${y + h} ${x + w - 3} ${y + h}H${x + 3}Q${x} ${y + h} ${x} ${y + h - 3}V${y + 3}Q${x} ${y} ${x + 3} ${y}Z`;
  const parts = [`<path d="${d}" fill="${fill}" stroke="${FIG.ink}" stroke-width="${mark ? FIG.mark : FIG.outline}" stroke-linejoin="round"/>`];
  if (front) parts.push(`<rect x="${x + w - 9}" y="${y + 5}" width="5" height="9" rx="1.5" fill="${FIG.ink}"/>`);
  return parts.join('');
}
