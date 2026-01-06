'use client';

import React, { useEffect } from 'react';
import AnalysisMap from '@/components/analysis/AnalysisMap';
import { useMapStore } from '@/stores/useMapStore';

// MapAction 타입 정의
interface MapAction {
  type: 'showMarker' | 'highlightPolygon' | 'compare' | null;
  data?: {
    code?: string;
    codes?: string[];
    coordinates?: [number, number];
    name?: string;
  };
}

interface AssistantMapSectionProps {
  mapAction: MapAction;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

// AI 어시스턴트용 지도 섹션
// - 기존 AnalysisMap 재사용
// - useMapStore의 selectArea/moveToLocation 활용
// - LLM 응답의 mapAction에 따라 지도 인터랙션 실행
export default function AssistantMapSection({ mapAction }: AssistantMapSectionProps) {
  // 기존 useMapStore 훅 재사용
  const { selectArea, moveToLocation, setCenter, setZoom } = useMapStore();

  // mapAction 변경 감지 → 지도 인터랙션 실행
  useEffect(() => {
    if (!mapAction.type || !mapAction.data) return;

    const handleMapAction = async () => {
      switch (mapAction.type) {
        case 'showMarker':
          // 좌표가 있으면 해당 위치로 이동
          if (mapAction.data?.coordinates) {
            const [lat, lng] = mapAction.data.coordinates;
            moveToLocation(
              { lat, lng },
              mapAction.data.name || '선택된 위치',
              4
            );
          }
          // 코드가 있으면 API로 좌표 조회 후 이동
          else if (mapAction.data?.code) {
            try {
              const res = await fetch(`${API_BASE_URL}/polygon/commercial/code?code=${mapAction.data.code}`);
              if (res.ok) {
                const data = await res.json();
                if (data.x && data.y) {
                  selectArea(
                    {
                      name: data.commercialName || mapAction.data.name || '상권',
                      coords: { lat: data.y, lng: data.x },
                      type: 'commercial',
                      code: mapAction.data.code,
                    },
                    data.polygons ? { 
                      polygons: data.polygons.coordinates || data.polygons,
                      x: data.x,
                      y: data.y
                    } : undefined
                  );
                }
              }
            } catch (error) {
              console.error('Failed to fetch area data:', error);
            }
          }
          break;

        case 'highlightPolygon':
          // 코드로 폴리곤 조회 후 표시
          if (mapAction.data?.code) {
            try {
              const res = await fetch(`${API_BASE_URL}/polygon/commercial/code?code=${mapAction.data.code}`);
              if (res.ok) {
                const data = await res.json();
                selectArea(
                  {
                    name: data.commercialName || mapAction.data.name || '상권',
                    coords: { lat: data.y, lng: data.x },
                    type: 'commercial',
                    code: mapAction.data.code,
                  },
                  { 
                    commercialName: data.commercialName,
                    commercialCode: mapAction.data.code,
                    x: data.x,
                    y: data.y,
                    polygons: data.polygons?.coordinates || data.polygons,
                    level: 'commercial',
                  }
                );
              }
            } catch (error) {
              console.error('Failed to fetch polygon data:', error);
            }
          }
          break;

        case 'compare':
          // 여러 상권 코드로 첫 번째 상권 표시 (추후 비교 UI 확장 가능)
          if (mapAction.data?.codes && mapAction.data.codes.length > 0) {
            const firstCode = mapAction.data.codes[0];
            try {
              const res = await fetch(`${API_BASE_URL}/polygon/commercial/code?code=${firstCode}`);
              if (res.ok) {
                const data = await res.json();
                selectArea(
                  {
                    name: data.commercialName || '비교 상권 1',
                    coords: { lat: data.y, lng: data.x },
                    type: 'commercial',
                    code: firstCode,
                  },
                  { 
                    polygons: data.polygons?.coordinates || data.polygons,
                    level: 'commercial',
                    x: data.x,
                    y: data.y,
                    commercialName: data.commercialName,
                    commercialCode: firstCode
                  }
                );
              }
            } catch (error) {
              console.error('Failed to fetch comparison data:', error);
            }
          }
          break;
      }
    };

    handleMapAction();
  }, [mapAction, selectArea, moveToLocation, setCenter, setZoom]);

  return (
    <div className="relative h-full flex flex-col p-4 bg-white">
      {/* 지도 영역 */}
      <div className="relative flex-1 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
        <div className="absolute inset-0 z-0">
          <AnalysisMap />
        </div>

        {/* 지도 액션 표시 (디버그용 배지) */}
        {mapAction.type && (
          <div className="absolute top-4 left-4 z-10 glass rounded-lg px-3 py-2 shadow-lg text-sm">
            <span className="font-medium text-blue-600">
              {mapAction.type === 'showMarker' && '📍 마커 표시'}
              {mapAction.type === 'highlightPolygon' && '🔷 폴리곤 하이라이트'}
              {mapAction.type === 'compare' && '⚖️ 상권 비교'}
            </span>
            {mapAction.data?.name && (
              <span className="text-gray-500 ml-2">{mapAction.data.name}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
