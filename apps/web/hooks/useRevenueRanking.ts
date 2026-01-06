import { useState, useEffect } from 'react';
import { geocodeAddress } from '@/services/geocoding/geocoding.service';
import { useMapStore } from '@/stores/useMapStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type RankItem = {
  code: string;
  name: string;
  amount: number;
  count: number;
  changeType?: string;
  fluctuationRate?: number;
};

type RevenueRankingResponse = {
  level: 'gu' | 'dong' | 'commercial';
  industryCode?: string;
  items: RankItem[];
};

interface UseRevenueRankingProps {
  level: 'gu' | 'dong' | 'commercial';
  parentGuCode?: string;
  industryCode?: string;
  industryCodes?: string;
}

interface UseRevenueRankingReturn {
  items: RankItem[];
  isLoading: boolean;
  error: string | null;
  isMoving: boolean;
  handleSelect: (name: string, code?: string, type?: 'gu' | 'dong' | 'commercial') => Promise<void>;
  formatAmount: (amount: number) => string;
}

export const useRevenueRanking = ({
  level,
  parentGuCode,
  industryCode,
  industryCodes,
}: UseRevenueRankingProps): UseRevenueRankingReturn => {
  const { selectArea } = useMapStore();
  const [isMoving, setIsMoving] = useState(false);
  const [items, setItems] = useState<RankItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_BASE_URL) {
      setError('API_BASE_URL이 설정되지 않았습니다.');
      return;
    }

    const controller = new AbortController();
    const url = new URL(`${API_BASE_URL}/revenue/ranking`);
    url.searchParams.set('level', level);
    if (industryCode) url.searchParams.set('industryCode', industryCode);
    if (industryCodes) url.searchParams.set('industryCodes', industryCodes);
    if (level === 'dong' && parentGuCode) {
      url.searchParams.set('parentGuCode', parentGuCode);
    }

    setIsLoading(true);
    setError(null);

    fetch(url.toString(), { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('순위 데이터를 불러오지 못했습니다.');
        return res.json();
      })
      .then(async (data: RevenueRankingResponse) => {
        setItems(data.items || []);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError('순위 데이터를 불러오지 못했습니다.');
        setItems([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [level, parentGuCode, industryCode, industryCodes]);

    const handleSelect = async (
    name: string,
    code?: string,
    type?: 'gu' | 'dong' | 'commercial',
  ) => {
    if (isMoving) return;
    setIsMoving(true);
    try {
      // 상권(commercial)의 경우 시 이름을 붙이지 않는 것이 검색 결과가 더 정확할 수 있음
      const geocodeQuery = type === 'commercial' ? name : `서울특별시 ${name}`;
      const result = await geocodeAddress(geocodeQuery);
      
      const targetType = type || level;
      
      // 지오코딩 성공/실패 여부와 관계없이 selectArea 호출
      // 지오코딩 실패 시 서울 중심 좌표를 기본값으로 사용 (code가 있으면 분석 페이지에서 정상 조회 가능)
      const coords = result 
        ? { lat: result.lat, lng: result.lng }
        : { lat: 37.5665, lng: 126.9780 }; // 서울 중심 기본 좌표
      
      // 코드가 있으면 타입에 따라 폴리곤 데이터 가져오기
      let polygonData: number[][][][] | number[][][] | number[][] | undefined;
      if (code) {
        try {
          let polygonEndpoint = '';
          if (targetType === 'commercial') {
            polygonEndpoint = `${API_BASE_URL}/polygon/commercial/code?code=${code}`;
          } else if (targetType === 'dong') {
            polygonEndpoint = `${API_BASE_URL}/polygon/dong/code?code=${code}`;
          } else if (targetType === 'gu') {
            polygonEndpoint = `${API_BASE_URL}/polygon/gu/code?code=${code}`;
          }
          
          if (polygonEndpoint) {
            const polygonRes = await fetch(polygonEndpoint);
            if (polygonRes.ok) {
              const polygonJson = await polygonRes.json();
              // 상권은 polygons.coordinates, 행정구역은 polygons 직접 사용
              if (polygonJson?.polygons?.coordinates) {
                polygonData = polygonJson.polygons.coordinates;
              } else if (polygonJson?.polygons) {
                polygonData = polygonJson.polygons;
              }
            }
          }
        } catch (err) {
          console.error('Failed to fetch polygon data:', err);
        }
      }
      
      selectArea({
        name: name,
        coords: coords,
        type: targetType,
        code: code,
      }, polygonData ? { 
        commercialName: name,
        commercialCode: code,
        x: coords.lng,
        y: coords.lat,
        polygons: polygonData,
        level: targetType,
      } : undefined);
    } finally {
      setIsMoving(false);
    }
  };

  const formatAmount = (amount: number) => {
    const revenueInOk = amount / 100000000;
    return `${revenueInOk.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}억`;
  };

  return {
    items,
    isLoading,
    error,
    isMoving,
    handleSelect,
    formatAmount,
  };
};
