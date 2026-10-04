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

/**
 * 순환 노선(N15 T15-2 6단계 { kind: 'cycle', stops: K, start: 1 }) — 시각 자문 4차.
 * 원 하나 + 정류장 점 K개(번호 글자) + 출발 꼬리표 + 도는 방향 화살 하나. 답(도착 정류장)·바퀴 수·지나는 길은 그리지 않는다.
 * - 정류장 1번(start)이 맨 위(12시), 시계 방향으로 2, 3, … (방향은 화살 하나로만 — 정류장 사이마다 화살을 두면 아이가 화살을 센다)
 * - 원은 버스 노선이라 노선 색 없이 진한 선 3. 점은 흰 원 r15 + 진한 테 2 + 번호 16 굵게(번호가 곧 답의 형식이라 모두 쓴다)
 * - 출발: 1번 점 위쪽 밖에 [출발] 꼬리표(테 1.5, 둥근 네모, 16px)와 점까지 짧은 선. 이중 고리는 쓰지 않는다(노선도의 "목적지"와 헷갈림)
 * - 정류장 사이 호 길이 ≥ 44(점 지름 30 + 틈 14) → 반지름 R = max(84, K × 44 / 2π). K = 8~10이면 R 84, 그림 260×268
 * - 정류장 점은 누를 수 없다(그림). 원 위에 점을 찍는 입력(SPEC 9.4)은 따로 정한다
 */
export function cycleFig({ stops: K, start = 1 }) {
  const R = Math.max(84, (K * 44) / (2 * Math.PI));
  const C = R + 46; // 가운데(위쪽에 출발 꼬리표 자리)
  const W = C * 2, Hh = C * 2 + 8;
  const at = (i, rr = R) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / K; return [C + rr * Math.cos(a), C + 8 + rr * Math.sin(a)]; };
  const out = [`<circle cx="${C}" cy="${C + 8}" r="${R}" fill="none" stroke="${FIG.ink}" stroke-width="3"/>`];
  // 방향 화살: 원 밖, 1번과 2번 사이 호를 따라 짧게(시계 방향)
  const a0 = -Math.PI / 2 + (0.28 * 2 * Math.PI) / K, a1 = -Math.PI / 2 + (0.72 * 2 * Math.PI) / K, ro = R + 20;
  const p0 = [C + ro * Math.cos(a0), C + 8 + ro * Math.sin(a0)], p1 = [C + ro * Math.cos(a1), C + 8 + ro * Math.sin(a1)];
  const tan = [-Math.sin(a1), Math.cos(a1)], nrm = [Math.cos(a1), Math.sin(a1)];
  const tip = [p1[0] + tan[0] * 2, p1[1] + tan[1] * 2];
  out.push(`<path d="M${p0[0]} ${p0[1]} A${ro} ${ro} 0 0 1 ${p1[0]} ${p1[1]}" fill="none" stroke="${FIG.ink}" stroke-width="2" stroke-linecap="round"/>`);
  out.push(`<path d="M${tip[0] - tan[0] * 9 + nrm[0] * 5} ${tip[1] - tan[1] * 9 + nrm[1] * 5}L${tip[0]} ${tip[1]}L${tip[0] - tan[0] * 9 - nrm[0] * 5} ${tip[1] - tan[1] * 9 - nrm[1] * 5}" fill="none" stroke="${FIG.ink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`);
  for (let i = 0; i < K; i++) {
    const [x, y] = at(i);
    const n = ((start - 1 + i) % K) + 1;
    out.push(`<circle cx="${x}" cy="${y}" r="15" fill="${FIG.paper}" stroke="${FIG.ink}" stroke-width="2"/><text x="${x}" y="${y}" dy="0.36em" text-anchor="middle" font-size="16" font-weight="700" fill="${FIG.ink}">${n}</text>`);
  }
  // 출발 꼬리표
  const [sx, sy] = at(0);
  out.push(`<line x1="${sx}" y1="${sy - 15}" x2="${sx}" y2="${sy - 24}" stroke="${FIG.ink}" stroke-width="1.5"/><rect x="${sx - 24}" y="${sy - 46}" width="48" height="22" rx="6" fill="${FIG.paper}" stroke="${FIG.ink}" stroke-width="1.5"/><text x="${sx}" y="${sy - 35}" dy="0.36em" text-anchor="middle" font-size="15" font-weight="700" fill="${FIG.ink}">출발</text>`);
  return `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="정류장 ${K}곳을 도는 순환 노선, ${start}번에서 출발">${out.join('')}</svg>`;
}
