// km 이정표. 누적 거리가 이 값을 처음 넘으면 운행 일지에 한 번 알린다(도달했을 때만, SPEC 3.8).
// 넘은 순간의 누적 거리는 이정표보다 길 수 있으므로 "~만큼"이 아니라 "~보다 더 달렸어요"로 쓴다(학생 #3).
// 값은 docs/FACTS.md ✅ 값만 쓴다(게이미피케이션 자문 1차 제안 목록).
export const MILESTONES = [
  { km: 1.5, text: '해운대 백사장 길이(1.5 km)보다 더 달렸어요' },
  { km: 2.0, text: '스카이캡슐 길(2.0 km)보다 더 달렸어요' },
  { km: 4.8, text: '해변열차 길(4.8 km)보다 더 달렸어요' },
  { km: 12.0, text: '4호선 전체(12.0 km)보다 더 달렸어요' },
  { km: 18.1, text: '3호선 전체(18.1 km)보다 더 달렸어요' },
  { km: 23.9, text: '부산김해경전철 전체(23.9 km)보다 더 달렸어요' },
  { km: 39.9, text: '1호선 전체(39.9 km)보다 더 달렸어요' },
  { km: 45.2, text: '2호선 전체(45.2 km)보다 더 달렸어요' },
  { km: 63.8, text: '동해선 전체(63.8 km)보다 더 달렸어요' },
  { km: 115.2, text: '1~4호선을 모두 합한 길(115.2 km)보다 더 달렸어요' },
];

/** 이번 운행에서 새로 넘은 이정표 */
export function milestonesCrossed(fromMeters, toMeters) {
  return MILESTONES.filter((m) => fromMeters < m.km * 1000 && toMeters >= m.km * 1000);
}
