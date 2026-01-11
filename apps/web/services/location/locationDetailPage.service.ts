// Location Detail 페이지용 서버 사이드 데이터 페칭 서비스
// Next.js Server Component에서 호출됨

import type {
  CommercialBasicInfo,
  MarketAnalytics,
  RealEstateItem,
  LocationDetailData,
  PolygonData,
  FootTrafficAnalysis,
} from '@/components/location-detail/types';

// @ts-expect-error: polylabel 타입 정의 없음
import polylabel from '@mapbox/polylabel';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

/**
 * 폴리곤 데이터에서 중심점(x, y) 좌표 계산
 *
 * @param polygons - GeoJSON MultiPolygon 데이터
 * @returns { x: 경도, y: 위도 } 또는 null
 */
function calculatePolygonCenter(
  polygons: PolygonData | null,
): { x: number; y: number } | null {
  if (!polygons?.coordinates) return null;

  try {
    // MultiPolygon 구조: coordinates[폴리곤인덱스][링인덱스][좌표인덱스]
    // coordinates[0] = 첫 번째 폴리곤
    // coordinates[0][0] = 외부 링 (exterior ring)
    const polygonRings = polygons.coordinates[0];

    if (!polygonRings || polygonRings.length === 0) return null;

    // polylabel: 폴리곤 링 배열과 정밀도(1.0)를 받아 중심점 반환
    // 반환값: [경도(lng), 위도(lat)]
    const center = polylabel(polygonRings, 1.0) as [number, number];

    return {
      x: center[0], // 경도 (longitude)
      y: center[1], // 위도 (latitude)
    };
  } catch (error) {
    console.error('Failed to calculate polygon center:', error);
    return null;
  }
}

/**
 * 상권 기본 정보 조회 (폴리곤 포함)
 *
 * 【서버 사이드 데이터 페칭】
 * Next.js Server Component에서 호출되어 서버에서 API 요청
 * - 클라이언트에 API URL 노출 안 됨
 * - 서버 간 통신으로 더 빠름
 * - SEO에 유리 (데이터가 초기 HTML에 포함)
 *
 * @param code 상권 고유 코드
 */
export async function getCommercialBasicInfo(
  code: string,
): Promise<CommercialBasicInfo | null> {
  try {
    const res = await fetch(`${API_URL}/polygon/commercial/code?code=${code}`, {
      next: { revalidate: 3600 }, // 1시간 캐시
    });

    if (!res.ok) {
      console.error(`Failed to fetch commercial info: ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (!data) return null;

    // 폴리곤에서 중심점 계산
    const center = calculatePolygonCenter(data.polygons);

    return {
      code: data.code || code,
      name: data.properties?.commercialName || '알 수 없는 상권',
      guName: data.properties?.guCode || '',
      dongName: data.properties?.dongCode || '',
      // 중심점 좌표 (부동산 조회, 지도 중심 설정 등에 사용)
      x: center?.x ?? 0,
      y: center?.y ?? 0,
      polygons: data.polygons,
    };
  } catch (error) {
    console.error('Error fetching commercial basic info:', error);
    return null;
  }
}

/**
 * 매출/분석 데이터 조회
 * @param code 상권 고유 코드
 */
export async function getCommercialAnalytics(
  code: string,
): Promise<MarketAnalytics | null> {
  try {
    const res = await fetch(
      `${API_URL}/revenue/analytics?level=commercial&code=${code}`,
      { next: { revalidate: 3600 } },
    );

    if (!res.ok) {
      console.error(`Failed to fetch analytics: ${res.status}`);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
}

/**
 * 유동인구 분석 데이터 조회
 *
 * 【report/summary API 호출】
 * 이 API는 매출, 유동인구, 점포 정보 등 종합 리포트를 반환합니다.
 * 여기서는 footTrafficAnalysis 필드만 추출하여 사용합니다.
 *
 * @param code 상권 고유 코드
 */
export async function getFootTrafficAnalysis(
  code: string,
): Promise<FootTrafficAnalysis | null> {
  try {
    // industryCode=ALL로 호출하여 전체 업종 기준 유동인구 데이터 조회
    const res = await fetch(
      `${API_URL}/report/summary?regionCode=${code}&industryCode=ALL`,
      { next: { revalidate: 3600 } }, // 1시간 캐시
    );

    if (!res.ok) {
      console.error(`Failed to fetch foot traffic: ${res.status}`);
      return null;
    }

    const data = await res.json();

    // 응답에서 footTrafficAnalysis 필드만 추출
    return data.footTrafficAnalysis || null;
  } catch (error) {
    console.error('Error fetching foot traffic analysis:', error);
    return null;
  }
}

/**
 * 부동산 매물 조회 (좌표 기반)
 * @param x 중심점 경도
 * @param y 중심점 위도
 * @param radius 반경 (기본 0.005 ≈ 약 500m)
 */
export async function getRealEstateByLocation(
  x: number,
  y: number,
  radius: number = 0.005,
): Promise<RealEstateItem[]> {
  try {
    const params = new URLSearchParams({
      minx: String(x - radius),
      miny: String(y - radius),
      maxx: String(x + radius),
      maxy: String(y + radius),
    });

    const res = await fetch(`${API_URL}/real-estate?${params}`, {
      next: { revalidate: 1800 }, // 30분 캐시
    });

    if (!res.ok) {
      console.error(`Failed to fetch real estate: ${res.status}`);
      return [];
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching real estate:', error);
    return [];
  }
}

/**
 * 상세 페이지 데이터 통합 조회
 * Server Component에서 병렬로 호출하여 성능 최적화
 * @param code 상권 고유 코드
 */
export async function getLocationDetailData(
  code: string,
): Promise<LocationDetailData> {
  // 1. 먼저 기본 정보 조회 (좌표 필요)
  const basicInfo = await getCommercialBasicInfo(code);

  if (!basicInfo) {
    return {
      basicInfo: null,
      analytics: null,
      realEstate: [],
      footTraffic: null,
      error: '상권을 찾을 수 없습니다.',
    };
  }

  // 2. 나머지 데이터 병렬 조회 (footTraffic 추가)
  const [analytics, realEstate, footTraffic] = await Promise.all([
    getCommercialAnalytics(code),
    getRealEstateByLocation(basicInfo.x, basicInfo.y),
    getFootTrafficAnalysis(code), // 유동인구 데이터 병렬 조회
  ]);

  return {
    basicInfo,
    analytics,
    realEstate,
    footTraffic,
  };
}
