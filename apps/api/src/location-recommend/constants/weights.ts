// Score Weights (총 100점)
// Industry/Vitality 제외하고 4개 요소로 재분배
export const WEIGHTS = {
  age: 25, // 연령대: 20 → 25
  region: 30, // 지역테마: 25 → 30
  time: 15, // 시간대: 15 (유지)
  rent: 30, // 임대료: 25 → 30
  // 여기 업종이 들어올 수 있음 -> 가중치 재조정 필요
} as const;
