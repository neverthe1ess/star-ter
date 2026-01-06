'use client';

import React, { useEffect, useState, useRef } from 'react';
import AnalysisMap from '@/components/analysis/AnalysisMap';
import { useMapStore } from '@/stores/useMapStore';
import ActionInfoBar from './ActionInfoBar';
import type { AssistantAction, FrontendActionType, ActionPayload } from '@/types/assistant-types';

// Props 타입 (공유 타입 사용)
interface AssistantMapSectionProps {
  action: AssistantAction | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

// -----------------------------------------
// 액션 핸들러 타입 (useMapStore 메서드와 호환)
// -----------------------------------------
type SelectAreaFn = (
  area: { name: string; coords: { lat: number; lng: number }; type: 'gu' | 'dong' | 'commercial'; code?: string },
  fullData?: { x: string | number; y: string | number; polygons?: number[][] | number[][][] | number[][][][]; level?: 'gu' | 'dong' | 'commercial'; commercialName?: string; commercialCode?: string }
) => void;

type MoveToLocationFn = (coords: { lat: number; lng: number }, location: string, zoom?: number) => void;

interface MapStoreDeps {
  selectArea: SelectAreaFn;
  moveToLocation: MoveToLocationFn;
}

type ActionHandler = (payload: ActionPayload, deps: MapStoreDeps) => Promise<void>;

// -----------------------------------------
// 핸들러 맵 (새 액션 추가 시 여기만 수정)
// -----------------------------------------
const ACTION_HANDLERS: Partial<Record<FrontendActionType, ActionHandler>> = {
  // 마커 표시 + 지도 이동
  showMarker: async (payload, { moveToLocation, selectArea }) => {
    if (payload.coordinates) {
      const [lat, lng] = payload.coordinates;
      moveToLocation({ lat, lng }, payload.name || '선택된 위치', 4);
    } else if (payload.code) {
      try {
        const res = await fetch(`${API_BASE_URL}/polygon/commercial/code?code=${payload.code}`);
        if (res.ok) {
          const data = await res.json();
          if (data.x && data.y) {
            selectArea(
              {
                name: data.commercialName || payload.name || '상권',
                coords: { lat: data.y, lng: data.x },
                type: 'commercial',
                code: payload.code,
              },
              data.polygons ? { polygons: data.polygons.coordinates || data.polygons, x: data.x, y: data.y } : undefined
            );
          }
        }
      } catch (error) {
        console.error('Failed to fetch area data:', error);
      }
    }
  },

  // 폴리곤 하이라이트
  highlightPolygon: async (payload, { selectArea }) => {
    if (!payload.code) return;
    try {
      const res = await fetch(`${API_BASE_URL}/polygon/commercial/code?code=${payload.code}`);
      if (res.ok) {
        const data = await res.json();
        selectArea(
          {
            name: data.commercialName || payload.name || '상권',
            coords: { lat: data.y, lng: data.x },
            type: 'commercial',
            code: payload.code,
          },
          {
            commercialName: data.commercialName,
            commercialCode: payload.code,
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
  },

  // 상권 비교 (추후 확장)
  compare: async (payload, { selectArea }) => {
    const codes = payload.codes || (payload.compareTargets ? [payload.compareTargets.codeA, payload.compareTargets.codeB] : []);
    if (codes.length === 0) return;
    
    const firstCode = codes[0];
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
            commercialCode: firstCode,
          }
        );
      }
    } catch (error) {
      console.error('Failed to fetch comparison data:', error);
    }
  },

  // 새 기능 핸들러 (Phase 3에서 구현)
  showRanking: async () => { console.log('showRanking: TODO'); },
  filterPopulation: async () => { console.log('filterPopulation: TODO'); },
  openAnalysisPanel: async () => { console.log('openAnalysisPanel: TODO'); },
  calculateRent: async () => { console.log('calculateRent: TODO'); },
  generateReport: async () => { console.log('generateReport: TODO'); },
};

// -----------------------------------------
// AI 어시스턴트용 지도 섹션
// -----------------------------------------
export default function AssistantMapSection({ action }: AssistantMapSectionProps) {
  const { selectArea, moveToLocation } = useMapStore();
  const [isLoading, setIsLoading] = useState(false);
  const prevActionRef = useRef<AssistantAction | null>(null);

  // 액션 변경 감지 → 핸들러 실행
  useEffect(() => {
    // 같은 액션이면 무시
    if (!action || action === prevActionRef.current) return;
    prevActionRef.current = action;

    const handler = ACTION_HANDLERS[action.type];
    if (handler) {
      let isCancelled = false;
      
      // 비동기로 로딩 상태 설정 (requestAnimationFrame 사용)
      requestAnimationFrame(() => {
        if (!isCancelled) setIsLoading(true);
      });
      
      handler(action.payload, { selectArea, moveToLocation })
        .finally(() => {
          if (!isCancelled) setIsLoading(false);
        });
      
      return () => { isCancelled = true; };
    }
  }, [action, selectArea, moveToLocation]);

  return (
    <div className="relative h-full flex flex-col p-4 bg-white">
      {/* 지도 영역 */}
      <div className="relative flex-1 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
        <div className="absolute inset-0 z-0">
          <AnalysisMap />
        </div>

        {/* Dynamic Island 스타일 정보바 (하단) */}
        <ActionInfoBar action={action} isLoading={isLoading} />
      </div>
    </div>
  );
}
