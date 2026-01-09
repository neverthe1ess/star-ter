// TODO: 추후 store/use-app-store.ts의 Location 타입으로 통합 필요 (현재는 중복 정의됨)
export interface Location {
  id: string;
  name: string;
  district: string;
  category: string;
  revenue: string;
  growthRate: number;
  badge: string;
  badgeType: 'explosive' | 'rapid' | 'stable';
  imageUrl: string;
  rank?: number;
}
