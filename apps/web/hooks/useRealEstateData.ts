import { useState, useCallback } from 'react';

import { RealEstateItem } from '../types/map-store-types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

interface BBox {
  minx: number;
  miny: number;
  maxx: number;
  maxy: number;
}

export function useRealEstateData() {
  const [data, setData] = useState<RealEstateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByBBox = useCallback(async (bbox: BBox) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        minx: bbox.minx.toString(),
        miny: bbox.miny.toString(),
        maxx: bbox.maxx.toString(),
        maxy: bbox.maxy.toString(),
      });

      const res = await fetch(`${API_BASE_URL}/real-estate?${params}`);
      if (!res.ok) throw new Error('부동산 데이터를 불러오지 못했습니다.');

      const json = await res.json();
      setData(json);
      return json;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '오류가 발생했습니다.';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setData([]);
    setError(null);
  }, []);

  return { data, loading, error, fetchByBBox, clearData };
}
