export class ScoredLocation {
  id: string; // 상권 코드
  name: string; // 상권 이름
  totalScore: number;
  scores: {
    age: number;
    region: number;
    time: number;
    rent: number;
  };
}

export class RecommendResponseDto {
  locations: ScoredLocation[];
}
