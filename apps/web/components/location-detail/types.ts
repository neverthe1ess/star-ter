// Location Detail 페이지용 타입 정의
// Next.js App Router 정석 패턴: Server Component에서 받아온 데이터 타입

/**
 * 상권 기본 정보 (폴리곤 API에서)
 * API: GET /polygon/commercial/code?code={code}
 */
export interface PolygonData {
  type: 'MultiPolygon';
  coordinates: number[][][][];
}
export interface CommercialBasicInfo {
  code: string;
  name: string;
  guName: string;
  dongName: string;
  x: number; // 중심점 경도 (폴리곤에서 계산 필요)
  y: number; // 중심점 위도
  polygons: PolygonData | null; // 지도에 영역 그리기용
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
  id: string; // 매물 고유 ID
  name: string | null; // 건물/매물명
  address: string | null; // 지번 주소
  roadaddress: string | null; // 도로명 주소
  centerlatitude: number | null; // 위도 (지도 표시용)
  centerlongitude: number | null; // 경도 (지도 표시용)
  title: string | null; // 매물 제목
  deposit: number | null; // 보증금 (천원 단위)
  monthlyrent: number | null; // 월세 (천원 단위)
  maintenancefee: number | null; // 관리비 (천원 단위)
  premium: number | null; // 권리금 (천원 단위)
  areaprice: number | null; // 평당가
  size: number | null; // 면적 (m² 단위)
  floor: number | null; // 해당 층
  groundfloor: number | null; // 건물 총 층수
  businesslargecodename: string | null; // 업종 대분류
  businessmiddlecodename: string | null; // 업종 중분류
  nearsubwaystation: string | null; // 인근 지하철역
  ismoveindate: boolean | null; // 즉시 입주 가능 여부
  previewphotourl: string | null; // 미리보기 이미지 URL
}

/**
 * 유동인구 분석 데이터 (report/summary API에서)
 * API: GET /report/summary?regionCode={code}&industryCode=ALL
 *
 * 【백엔드 DTO와 동일한 구조】
 * 효율적인 API 응답 처리를 위해 프론트엔드에서도 동일한 타입을 정의합니다.
 */
export interface FootTrafficAnalysis {
  /** 일일 총 유동인구 */
  dailyTotal: number;
  /** 피크 시간대 (예: "17~21시") */
  peakTimeSlot: string;
  /** 피크 요일 (예: "화요일") */
  peakDay: string;

  /** 성별 비율 (%) */
  genderRatio: {
    male: number;
    female: number;
  };

  /** 시간대별 방문 비중 */
  timeSlotRatio: {
    timeRange: string;
    ratio: number;
    count: number;
  }[];

  /** 연령대별 방문 비중 */
  ageGroupRatio: {
    ageGroup: string;
    ratio: number;
    count: number;
  }[];
}

/**
 * 상세 페이지에서 사용하는 통합 데이터
 */
export interface LocationDetailData {
  basicInfo: CommercialBasicInfo | null;
  analytics: MarketAnalytics | null;
  realEstate: RealEstateItem[];
  footTraffic?: FootTrafficAnalysis | null;
  error?: string;
}

// =========================================
// 유동인구 히트맵 필터 타입 (TrafficFilterBar용)
// =========================================

/** 시간대 필터 (3개 구간: 새벽/낮/밤) */
export type TimeFilter =
  | 'dawn' // 새벽: 0~8시
  | 'day' // 낮: 8~16시
  | 'night'; // 밤: 16~24시

/** 성별 필터 */
export type GenderFilter = 'all' | 'male' | 'female';

/** 연령대 필터 */
export type AgeFilter =
  | 'all'
  | 'age_10' // 10대
  | 'age_20' // 20대
  | 'age_30' // 30대
  | 'age_40' // 40대
  | 'age_50' // 50대
  | 'age_60'; // 60대 이상

/** 시간대 정보 상수 (라벨 및 순서) */
export const TIME_SLOTS: {
  filter: TimeFilter;
  label: string;
  apiKey: string;
}[] = [
  { filter: 'dawn', label: '새벽 (0~8시)', apiKey: '0-8' },
  { filter: 'day', label: '낮 (8~16시)', apiKey: '8-18' },
  { filter: 'night', label: '밤 (16~24시)', apiKey: '18-24' },
];

// =========================================
// 유동인구 히트맵 API 응답 타입
// =========================================

/** GeoJSON Geometry (simplified) */
export interface PopulationGeometry {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
}

/** 개별 그리드 셀 Feature */
export interface CombinedFeature {
  cell_id: string;
  geometry: PopulationGeometry;
  center?: { lat: number; lng: number };
  time_slots?: TimeSlotData[];
  [key: string]: unknown;
}

/** 시간대별 슬롯 데이터 */
export interface TimeSlotData {
  time_slot: string;
  avg_population: number;
  sum_population: number;
  male_total: number;
  female_total: number;
  age_10s_total: number;
  age_20s_total: number;
  age_30s_total: number;
  age_40s_total: number;
  age_50s_total: number;
  age_60s_plus_total: number;
  [key: string]: unknown;
}

/** API 응답 최상위 타입 */
export interface CombinedLayerResponse {
  features: CombinedFeature[];
}
