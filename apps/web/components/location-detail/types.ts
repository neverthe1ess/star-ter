// Location Detail 페이지용 타입 정의
// Next.js App Router 정석 패턴: Server Component에서 받아온 데이터 타입

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

/**
 * 상권 기본 정보 (폴리곤 API에서)
 * API: GET /polygon/commercial/code?code={code}
 */
export interface CommercialBasicInfo {
  code: string;
  name: string;
  guCode: string;
  dongCode: string;
  x: number; // 중심점 경도 (폴리곤에서 계산 필요)
  y: number; // 중심점 위도
  polygons?: unknown; // 지도에 영역 그리기용
}

/**
 * 매출/분석 데이터 (revenue/analytics에서)
 * API: GET /revenue/analytics?level=commercial&code={code}
 */
export interface MarketAnalytics {
  sectors: { name: string; value: number }[];
  saturation: { name: string; value: number; status: string }[];
  growth: { period: string; amount: number }[];
  demographics: {
    subject: string;
    male: number;
    female: number;
    fullMark: number;
  }[];
  population: { time: string; value: number }[];
}

/**
 * 부동산 매물 정보 (real-estate에서)
 * API: GET /real-estate?minx=...&maxy=...
 */
export interface RealEstateItem {
  id: string;
  name: string | null;
  address: string | null;
  deposit: number | null; // 보증금 (천원)
  monthlyrent: number | null; // 월세 (천원)
  size: number | null; // 면적 (m²)
  areaprice: number | null; // 평당가
  previewphotourl: string | null;
}

/**
 * 상세 페이지에서 사용하는 통합 데이터
 */
export interface LocationDetailData {
  basicInfo: CommercialBasicInfo | null;
  analytics: MarketAnalytics | null;
  realEstate: RealEstateItem[];
  error?: string;
}
