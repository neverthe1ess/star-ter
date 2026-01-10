// Location Detail 페이지용 서버 사이드 데이터 페칭 서비스
// Next.js Server Component에서 호출됨

import type {
  CommercialBasicInfo,
  MarketAnalytics,
  RealEstateItem,
  LocationDetailData,
} from '@/components/location-detail/types';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

/**
 * 상권 기본 정보 조회 (폴리곤 포함)
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

    return {
      code: data.code || code,
      name: data.properties?.commercialName || '알 수 없는 상권',
      guName: data.properties?.guCode || '',
      dongName: data.properties?.dongCode || '',
      x: data.properties.x || '',
      y: data.properties.y || '',
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
      maxx: String(x + radius),
      miny: String(y - radius),
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
      error: '상권을 찾을 수 없습니다.',
    };
  }

  // 2. 나머지 데이터 병렬 조회
  const [analytics, realEstate] = await Promise.all([
    getCommercialAnalytics(code),
    getRealEstateByLocation(basicInfo.x, basicInfo.y),
  ]);

  return {
    basicInfo,
    analytics,
    realEstate,
  };
}
