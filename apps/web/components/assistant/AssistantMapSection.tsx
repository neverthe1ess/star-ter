'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import AnalysisMap from '@/components/analysis/AnalysisMap';
import { useMapStore } from '@/stores/useMapStore';
import ActionInfoBar from './ActionInfoBar';
import type { AssistantAction, FrontendActionType, ActionPayload } from '@/types/assistant-types';
import { RealEstateItem } from '@/types/map-store-types';
import { StoreLocation } from '@/hooks/useStoreMarkers';
import { convertSeoulCodeToDbCode } from '@/utils/industry-code-map';
import { geocodeAddress } from '@/services/geocoding/geocoding.service';

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
  showRanking: async (payload, { moveToLocation }) => { 
    // 랭킹은 특정 위치 없이도 동작하지만, 좌표가 있으면 이동
    if (payload.coordinates) {
      const [lat, lng] = payload.coordinates;
      moveToLocation({ lat, lng }, payload.areaName || '랭킹', 4);
    }
  },
  filterPopulation: async (payload, { moveToLocation }) => { 
    // 좌표가 있으면 해당 위치로 이동
    if (payload.coordinates) {
      const [lat, lng] = payload.coordinates;
      moveToLocation({ lat, lng }, payload.areaName || '유동인구', 3); // 줌 3으로 히트맵 잘 보이게
    } else if (payload.lat && payload.lng) {
      moveToLocation({ lat: payload.lat, lng: payload.lng }, payload.areaName || '유동인구', 3);
    }
    // 좌표가 없어도 레이어는 AssistantMapSection에서 활성화됨
    console.log('[filterPopulation] 유동인구 레이어 활성화됨. 줌 레벨 1~4에서 히트맵 표시.');
  },
  openAnalysisPanel: async (payload, { moveToLocation, selectArea }) => { 
    // 분석 패널 열기 + 지도 이동 + 영역 선택
    if (payload.coordinates) {
      const [lat, lng] = payload.coordinates;
      moveToLocation({ lat, lng }, payload.areaName || '분석 위치', 4);
      
      // 상권 코드가 있으면 영역도 선택
      if (payload.code || payload.areaCode) {
        const code = payload.code || payload.areaCode;
        try {
          const res = await fetch(`${API_BASE_URL}/polygon/commercial/code?code=${code}`);
          if (res.ok) {
            const data = await res.json();
            selectArea(
              {
                name: data.commercialName || payload.areaName || '상권',
                coords: { lat: data.y || lat, lng: data.x || lng },
                type: payload.level || 'commercial',
                code: code,
              },
              {
                polygons: data.polygons?.coordinates || data.polygons,
                level: payload.level || 'commercial',
                x: data.x,
                y: data.y,
              }
            );
          }
        } catch (error) {
          console.error('Failed to fetch area for analysis:', error);
        }
      }
    } else if (payload.lat && payload.lng) {
      moveToLocation({ lat: payload.lat, lng: payload.lng }, payload.areaName || '분석 위치', 4);
    }
  },
  calculateRent: async (payload, { moveToLocation }) => { 
    if (payload.coordinates) {
      const [lat, lng] = payload.coordinates;
      moveToLocation({ lat, lng }, payload.areaName || '임대료 분석', 4);
    }
  },
  generateReport: async (payload, { moveToLocation }) => { 
    if (payload.coordinates) {
      const [lat, lng] = payload.coordinates;
      moveToLocation({ lat, lng }, payload.areaName || '리포트', 4);
    }
  },
};

// -----------------------------------------
// AI 어시스턴트용 지도 섹션
// -----------------------------------------
export default function AssistantMapSection({ action }: AssistantMapSectionProps) {
  const { selectArea, moveToLocation, center } = useMapStore();
  const [isLoading, setIsLoading] = useState(false);
  const prevActionRef = useRef<AssistantAction | null>(null);
  
  // 유동인구 레이어 상태
  const [showPopulationLayer, setShowPopulationLayer] = useState(false);
  const [populationFilters, setPopulationFilters] = useState<{
    genderFilter?: 'Male' | 'Female' | 'Total';
    ageFilter?: string;
    timeFilter?: string;
  }>({});
  
  // 업종 마커 표시용 상태
  const [industryCode, setIndustryCode] = useState<string | undefined>(undefined);
  const [storeMarkers, setStoreMarkers] = useState<StoreLocation[]>([]);

  // 부동산 매물 마커 표시용 상태
  const [realEstateList, setRealEstateList] = useState<RealEstateItem[]>([]);
  const { setSelectedRealEstateItem, hoveredRealEstateItemId, selectedRealEstateItem } = useMapStore();

  /**
   * 업종별 매장 위치 API 호출
   */
  const fetchStoreLocations = useCallback(async (seoulCode: string, areaCode?: string, level?: string) => {
    const dbCode = convertSeoulCodeToDbCode(seoulCode);
    if (!dbCode) {
      console.warn(`[AssistantMapSection] 업종 코드 변환 실패: ${seoulCode}`);
      return;
    }

    try {
      console.log(`[AssistantMapSection] 매장 위치 조회: ${seoulCode} → ${dbCode}, Area: ${areaCode} (${level})`);
      
      const queryParams = new URLSearchParams({
        industryCode: dbCode,
        limit: '1000'
      });
      
      if (areaCode) queryParams.append('areaCode', areaCode);
      if (level) queryParams.append('level', level);

      const res = await fetch(`${API_BASE_URL}/store/locations?${queryParams.toString()}`);
      
      if (res.ok) {
        const data = await res.json();
        console.log(`[AssistantMapSection] ${data.count}개 매장 조회됨`);
        setStoreMarkers(data.stores || []);
      } else {
        console.error('[AssistantMapSection] 매장 위치 API 오류:', res.status);
        setStoreMarkers([]);
      }
    } catch (error) {
      console.error('[AssistantMapSection] 매장 위치 조회 실패:', error);
      setStoreMarkers([]);
    }
  }, []);

  const fetchRealEstate = useCallback(async (
    lat: number, 
    lng: number, 
    filters: { maxDeposit?: number; maxMonthlyRent?: number; minSize?: number; keywords?: string }
  ) => {
    try {
      // 반경 약 2km (0.02도) 검색
      const delta = 0.02;
      const params = new URLSearchParams({
        minx: (lng - delta).toString(),
        miny: (lat - delta).toString(),
        maxx: (lng + delta).toString(),
        maxy: (lat + delta).toString(),
      });

      if (filters.maxDeposit) params.append('maxDeposit', filters.maxDeposit.toString());
      if (filters.maxMonthlyRent) params.append('maxMonthlyRent', filters.maxMonthlyRent.toString());
      if (filters.minSize) params.append('minSize', filters.minSize.toString());
      if (filters.keywords) params.append('keywords', filters.keywords);

      console.log(`[AssistantMapSection] 부동산 매물 조회: ${params.toString()}`);
      const res = await fetch(`${API_BASE_URL}/real-estate?${params.toString()}`);
      
      if (res.ok) {
        const data = await res.json();
        console.log(`[AssistantMapSection] ${data.length}개 매물 조회됨`);
        setRealEstateList(data);
      } else {
        console.error('[AssistantMapSection] 부동산 API 오류:', res.status);
        setRealEstateList([]);
      }
    } catch (error) {
      console.error('[AssistantMapSection] 부동산 조회 실패:', error);
      setRealEstateList([]);
    }
  }, []);

  // 업종 코드 변경 시 매장 위치 조회
  useEffect(() => {
    if (industryCode) {
      const { areaCode, level } = action?.payload || {};
      fetchStoreLocations(industryCode, areaCode, level);
    } else {
      setStoreMarkers([]);
    }
  }, [industryCode, fetchStoreLocations, action]);

  // 액션 변경 감지 → 핸들러 실행
  useEffect(() => {
    if (!action || action === prevActionRef.current) return;
    prevActionRef.current = action;

    // 디버깅: recommendRealEstate 액션 페이로드 확인
    if (action.type === 'recommendRealEstate') {
      console.log('[AssistantMapSection] recommendRealEstate payload:', action.payload);
    }
    
    // filterPopulation 액션일 때 레이어 활성화
    if (action.type === 'filterPopulation') {
      setShowPopulationLayer(true);
      setPopulationFilters({
        genderFilter: action.payload.genderFilter,
        ageFilter: action.payload.ageFilter,
        timeFilter: action.payload.timeFilter,
      });
    } else {
      // 다른 액션으로 변경되면 유동인구 레이어 비활성화
      setShowPopulationLayer(false);
    }
    
    // openAnalysisPanel 액션일 때 업종 코드 저장 (마커 표시용)
    if (action.type === 'openAnalysisPanel' && action.payload.industryCode) {
      setIndustryCode(action.payload.industryCode);
    }

    const handlers: Partial<Record<FrontendActionType, ActionHandler>> = {
      ...ACTION_HANDLERS,
      recommendRealEstate: async (payload, { moveToLocation }) => {
        // 부동산 매물 표시 시 업종 마커 초기화 (마커 충돌 방지)
        setStoreMarkers([]);
        setIndustryCode(undefined);
        
        let lat = payload.lat;
        let lng = payload.lng;
        if (payload.coordinates) {
          [lat, lng] = payload.coordinates;
        }

        // 🆕 areaName이 있고 좌표가 없으면 geocoding으로 좌표 변환
        // (예: "홍대입구역" → { lat: 37.5577, lng: 126.9237 })
        if ((!lat || !lng) && payload.areaName) {
          console.log('[AssistantMapSection] areaName을 좌표로 변환 시도:', payload.areaName);
          const geocodeResult = await geocodeAddress(payload.areaName);
          if (geocodeResult) {
            lat = geocodeResult.lat;
            lng = geocodeResult.lng;
            console.log('[AssistantMapSection] geocoding 성공:', { lat, lng, address: geocodeResult.address });
          } else {
            console.warn('[AssistantMapSection] geocoding 실패:', payload.areaName);
          }
        }

        // fallback: geocoding도 실패하면 현재 지도 중심 또는 서울 시청 사용
        if (!lat || !lng) {
          if (center) {
            lat = center.lat;
            lng = center.lng;
            console.log('[AssistantMapSection] 위치 미지정 → 현재 지도 중심 사용:', center);
          } else {
            // 기본값: 서울 시청
            lat = 37.5665;
            lng = 126.9780;
            console.log('[AssistantMapSection] 위치 미지정 → 서울 시청 기본값 사용');
          }
        }

        moveToLocation({ lat, lng }, payload.areaName || '매물 추천', 3);
        await fetchRealEstate(lat, lng, {
          maxDeposit: payload.maxDeposit,
          maxMonthlyRent: payload.maxMonthlyRent,
          minSize: payload.minSize,
          keywords: payload.keywords,
        });
      }
    };

    const handler = handlers[action.type];
    if (handler) {
      let isCancelled = false;
      
      requestAnimationFrame(() => {
        if (!isCancelled) setIsLoading(true);
      });
      
      handler(action.payload, { selectArea, moveToLocation })
        .finally(() => {
          if (!isCancelled) setIsLoading(false);
        });
      
      return () => { isCancelled = true; };
    }
  }, [action, selectArea, moveToLocation, fetchStoreLocations, fetchRealEstate]);

  return (
    <div className="relative h-full flex flex-col p-4 bg-white">
      {/* 지도 영역 */}
      <div className="relative flex-1 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
        <div className="absolute inset-0 z-0">
          <AnalysisMap 
            showPopulationLayer={showPopulationLayer}
            populationFilters={populationFilters}
            storeMarkers={storeMarkers}
            realEstateData={realEstateList}
            onMarkerClick={setSelectedRealEstateItem}
            hoveredItemId={hoveredRealEstateItemId}
          />
        </div>

        {/* Dynamic Island 스타일 정보바 (하단) */}
        <ActionInfoBar 
          action={action} 
          isLoading={isLoading} 
          selectedRealEstateItem={selectedRealEstateItem} 
          showPopulationLayer={showPopulationLayer}
          onTogglePopulationLayer={setShowPopulationLayer}
        />
      </div>
    </div>
  );
}


