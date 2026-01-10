/**
 * 【useStoreLocations 커스텀 훅】
 *
 * 업종별 점포 위치 데이터를 가져오는 커스텀 훅
 *
 * 📚 이 훅의 역할:
 * - 선택된 업종 카테고리에 해당하는 점포 위치를 API에서 가져옴
 * - 'ALL' 선택 시 전체 점포 조회
 * - 카테고리 변경 시 자동으로 재조회
 *
 * @param regionCode - 지역 코드 (상권 코드)
 * @param industryCode - 업종 대분류 코드 (예: 'I2', 'ALL')
 * @param enabled - 조회 활성화 여부 (analysis 모드일 때만 true)
 */

import { useState, useEffect, useCallback } from 'react';

// 점포 위치 데이터 타입
export interface StoreLocation {
  lng: number;
  lat: number;
  name: string;
  address: string;
}

// 훅 반환 타입
interface UseStoreLocationsReturn {
  stores: StoreLocation[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useStoreLocations(
  regionCode: string | undefined,
  industryCode: string | undefined,
  enabled: boolean = true,
): UseStoreLocationsReturn {
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // fetch 함수를 useCallback으로 메모이제이션
  const fetchStores = useCallback(async () => {
    if (!regionCode || !industryCode || !enabled) {
      setStores([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

      // 'ALL'이면 industryCode 없이 전체 조회
      const industryParam =
        industryCode === 'ALL' ? '' : `industryCode=${industryCode}&`;

      const url = `${API_URL}/store/locations?${industryParam}areaCode=${regionCode}&level=commercial&limit=500`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Failed to fetch stores: ${res.status}`);
      }

      const data = await res.json();
      setStores(data.stores || []);
    } catch (err) {
      console.error('[useStoreLocations] Error:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [regionCode, industryCode, enabled]);

  // 의존성 변경 시 자동 fetch
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return { stores, loading, error, refetch: fetchStores };
}
