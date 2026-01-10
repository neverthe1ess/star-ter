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
 *
 * 【타입 정의 개념】
 * - interface: 객체의 형태(shape)를 정의하는 TypeScript 문법
 * - API 응답 데이터의 구조를 명시하여 타입 안전성 확보
 * - null 허용: 데이터베이스에서 값이 없을 수 있으므로 `| null` 사용
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
 * 상세 페이지에서 사용하는 통합 데이터
 */
export interface LocationDetailData {
  basicInfo: CommercialBasicInfo | null;
  analytics: MarketAnalytics | null;
  realEstate: RealEstateItem[];
  error?: string;
}
