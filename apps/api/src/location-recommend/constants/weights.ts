// Score Weights (총 100점)
// Industry/Vitality 제외하고 4개 요소로 재분배
export const WEIGHTS = {
  age: 20,
  region: 30,
  time: 15,
  rent: 35,
  // 여기 업종이 들어올 수 있음 -> 가중치 재조정 필요
} as const;
