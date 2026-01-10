/**
 * 【useVitalityData 커스텀 훅】
 *
 * 업종별 개업/폐업 데이터를 가져오는 커스텀 훅
 *
 * 📚 커스텀 훅이란?
 * - React의 상태(useState)와 효과(useEffect)를 캡슐화하는 함수
 * - 'use'로 시작하는 이름 규칙을 따름
 * - 여러 컴포넌트에서 동일한 로직을 재사용 가능
 * - 컴포넌트를 더 깔끔하게 유지 (관심사 분리)
 *
 * @param regionCode - 지역 코드 (상권 코드)
 * @param industryCode - 업종 대분류 코드 (예: 'I2', 'P1', 'ALL')
 * @returns { vitality, loading, error } - 데이터, 로딩 상태, 에러
 */

import { useState, useEffect } from 'react';

// 개업/폐업 데이터 타입 정의
export interface VitalityData {
  opbizRt: number; // 개업률 (%)
  clsbizRt: number; // 폐업률 (%)
  opbizStoreCount: number; // 개업 점포 수
  clsbizStoreCount: number; // 폐업 점포 수
}

// 훅 반환 타입
interface UseVitalityDataReturn {
  vitality: VitalityData | null;
  loading: boolean;
  error: Error | null;
}

export function useVitalityData(
  regionCode: string | undefined,
  industryCode: string,
): UseVitalityDataReturn {
  // 상태 정의
  const [vitality, setVitality] = useState<VitalityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 데이터 fetch
  useEffect(() => {
    // regionCode가 없으면 fetch 안 함
    if (!regionCode) return;

    const fetchVitality = async () => {
      setLoading(true);
      setError(null);

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
        const url = `${API_URL}/report/summary?regionCode=${regionCode}&industryCode=${industryCode}`;

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Failed to fetch vitality data: ${res.status}`);
        }

        const data = await res.json();
        setVitality(data.marketTrends);
      } catch (err) {
        console.error('[useVitalityData] Error:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchVitality();
  }, [regionCode, industryCode]); // 의존성: regionCode나 industryCode가 바뀌면 재실행

  return { vitality, loading, error };
}
