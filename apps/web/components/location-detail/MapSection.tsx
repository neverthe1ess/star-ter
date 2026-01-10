"use client";

import { useRef, useEffect, useState } from "react";
import { useKakaoMap, type KakaoPolygon, type KakaoCustomOverlay } from "../../hooks/useKakaoMap";
import { PolygonData, RealEstateItem } from "./types";
import { PriceFilterBar } from "./PriceFilterBar";
import { IndustryAnalysisBar, type IndustryId } from "./IndustryAnalysisBar";

/**
 * 【MapSection 컴포넌트】
 * @param mode - 현재 활성화된 탭 ('realestate'일 때 마커 표시, 'analysis'일 때 업종 분석)
 * @param polygonData - GeoJSON MultiPolygon 형태의 폴리곤 데이터
 * @param centerX - 중심점 경도 (longitude)
 * @param centerY - 중심점 위도 (latitude)
 * @param realEstateItems - 부동산 매물 리스트 (마커 표시용)
 */

/**
 * 【MapSectionProps 인터페이스】
 * 
 * 컴포넌트가 받을 수 있는 props(속성)들을 타입으로 정의합니다.
 * TypeScript의 인터페이스를 사용하면 잘못된 props 전달을 컴파일 타임에 감지할 수 있습니다.
 */
interface MapSectionProps {
  mode?: "matching" | "traffic" | "analysis" | "realestate";
  polygonData: PolygonData | null;
  centerX?: number;
  centerY?: number;
  realEstateItems?: RealEstateItem[];
  selectedItemId?: string | null;
  onMarkerClick?: (item: RealEstateItem) => void;
  // 【가격 필터 Props】
  priceFilter?: {
    minDeposit: number;
    maxDeposit: number;
    minRent: number;
    maxRent: number;
    depositRange: [number, number];
    rentRange: [number, number];
  };
  onDepositChange?: (range: [number, number]) => void;
  onRentChange?: (range: [number, number]) => void;
  onBoundsChange?: (bounds: { sw: { lat: number; lng: number }; ne: { lat: number; lng: number } }) => void;
  filteredCount?: number;
  totalCount?: number;
  // 【업종 분석 카테고리 선택 Props】
  selectedAnalysisCategory?: string;
  regionCode?: string;
}

export function MapSection({ 
  mode = "matching", 
  polygonData,
  centerX,
  centerY,
  realEstateItems = [],
  selectedItemId,
  onMarkerClick,
  priceFilter,
  onDepositChange,
  onRentChange,
  onBoundsChange,
  filteredCount = 0,
  totalCount = 0,
  selectedAnalysisCategory,
  regionCode,
}: MapSectionProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const polygonRef = useRef<KakaoPolygon | null>(null);
  const markersRef = useRef<KakaoCustomOverlay[]>([]);
  const industryMarkersRef = useRef<KakaoCustomOverlay[]>([]);  // 업종 분석 마커용
  const isDraggingRef = useRef(false);  // 드래그 상태 추적
  
  // 【업종 분석 상태】
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryId | null>(null);
  
  const { map, loaded } = useKakaoMap(mapRef);

  // 폴리곤 렌더링 + 드래그/idle 이벤트 등록
  useEffect(() => {
    if (!map || !loaded) return;

    // 드래그 이벤트 리스너 등록 (마커 클릭 방지용)
    window.kakao.maps.event.addListener(map, 'dragstart', () => {
      isDraggingRef.current = true;
    });
    window.kakao.maps.event.addListener(map, 'dragend', () => {
      setTimeout(() => { isDraggingRef.current = false; }, 100);
    });

    // 지도 이동/줌 완료 시 bounds 콜백 호출
    window.kakao.maps.event.addListener(map, 'idle', () => {
      if (onBoundsChange) {
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        onBoundsChange({
          sw: { lat: sw.getLat(), lng: sw.getLng() },
          ne: { lat: ne.getLat(), lng: ne.getLng() }
        });
      }
    });

    if (!polygonData) return;

    const polygonRings = polygonData.coordinates[0];
    const exteriorRing = polygonRings[0];

    const centerLat = centerY ?? exteriorRing[0][1];
    const centerLng = centerX ?? exteriorRing[0][0];
    const centerLatLng = new window.kakao.maps.LatLng(centerLat, centerLng);

    map.setCenter(centerLatLng);
    map.setLevel(3);

    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }

    const kakaoPath = exteriorRing.map(
      (coord) => new window.kakao.maps.LatLng(coord[1], coord[0])
    );

    const kakaoPolygon = new window.kakao.maps.Polygon({
      path: kakaoPath,
      strokeWeight: 3,
      strokeColor: "#3B82F6",
      strokeOpacity: 1,
      strokeStyle: "solid",
      fillColor: "#ffffff",
      fillOpacity: 0.3,
    });

    kakaoPolygon.setMap(map);
    polygonRef.current = kakaoPolygon;

    return () => {
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
        polygonRef.current = null;
      }
    };
  }, [map, loaded, polygonData, centerX, centerY, onBoundsChange]);

  /**
   * 【업종 분석 모드: 점도표(Dot Markers) 렌더링】
   * 선택된 업종 카테고리(selectedAnalysisCategory)의 점포를 API에서 가져와 표시
   */
  useEffect(() => {
    if (!map || !loaded) return;

    // 기존 업종 마커 제거
    industryMarkersRef.current.forEach(marker => marker.setMap(null));
    industryMarkersRef.current = [];

    // analysis 모드가 아니거나 카테고리가 선택되지 않았으면 종료
    if (mode !== 'analysis' || !selectedAnalysisCategory || !regionCode) {
      return;
    }

    // API 호출
    const fetchStores = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
        // 'ALL'이면 industryCode 없이 전체 조회, 아니면 해당 업종으로 필터
        const industryParam = selectedAnalysisCategory === 'ALL' 
          ? '' 
          : `industryCode=${selectedAnalysisCategory}&`;
        const url = `${API_URL}/store/locations?${industryParam}areaCode=${regionCode}&level=commercial&limit=500`;
        
        const res = await fetch(url);
        if (!res.ok) {
          console.error('[MapSection] Failed to fetch stores:', res.status);
          return;
        }
        
        const data = await res.json();
        const stores: {lng: number; lat: number; name: string; address: string}[] = data.stores || [];

        // 점포 마커 렌더링
        stores.forEach((store) => {
          const position = new window.kakao.maps.LatLng(store.lat, store.lng);
          
          const content = `
            <div style="
              width: 12px;
              height: 12px;
              background: #3B82F6;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              cursor: pointer;
              transition: transform 0.2s;
            " 
            onmouseenter="this.style.transform='scale(1.3)'"
            onmouseleave="this.style.transform='scale(1)'"
            title="${store.name}\n${store.address}"
            ></div>
          `;

          const overlay = new window.kakao.maps.CustomOverlay({
            position: position,
            content: content,
            yAnchor: 0.5,
            xAnchor: 0.5,
            zIndex: 1,
          });

          overlay.setMap(map);
          industryMarkersRef.current.push(overlay);
        });
      } catch (error) {
        console.error('[MapSection] Error fetching stores:', error);
      }
    };

    fetchStores();

    return () => {
      industryMarkersRef.current.forEach(marker => marker.setMap(null));
      industryMarkersRef.current = [];
    };
  }, [map, loaded, mode, selectedAnalysisCategory, regionCode]);

  /**
   * 【중요 개념: 카카오맵 CustomOverlay와 클릭 이벤트】
   * - CustomOverlay는 HTML 문자열을 content로 받습니다
   * - React의 onClick이 아닌 순수 HTML의 onclick 속성 사용
   * - 클릭 핸들러는 window 전역 객체에 함수로 등록해야 함
   */
  useEffect(() => {
    if (!map || !loaded) return;

    // 기존 마커 제거 
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 'realestate' 모드가 아니면 종료
    if (mode !== 'realestate' || realEstateItems.length === 0) return;

    // 전역 함수 저장용 배열 (cleanup 시 제거하기 위함)
    const globalFunctionNames: string[] = [];

    // 새로운 마커 생성
    realEstateItems.forEach(item => {
      if (!item.centerlatitude || !item.centerlongitude) return;

      const position = new window.kakao.maps.LatLng(
        item.centerlatitude, 
        item.centerlongitude
      );

      // 가격 포맷팅 (만원 단위)
      const depositMan = item.deposit ? Math.round(item.deposit / 10) : 0;
      const rentMan = item.monthlyrent ? Math.round(item.monthlyrent / 10) : 0;
      
      // 【선택 상태에 따른 스타일 분기】
      // 선택된 마커: 파란 배경 + 흰 글씨 (반전)
      // 기본 마커: 흰 배경 + 파란 글씨
      const isSelected = selectedItemId === item.id;
      const bgColor = isSelected ? '#2563EB' : '#FFFFFF';
      const textColor = isSelected ? '#FFFFFF' : '#2563EB';
      const borderWidth = isSelected ? '2px' : '1px';
      const scale = isSelected ? 'scale(1.1)' : 'scale(1)';
      
      // 【전역 함수 등록】
      // CustomOverlay의 onclick에서 호출할 수 있도록 window에 함수 등록
      const funcName = `__markerClick_${item.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
      globalFunctionNames.push(funcName);
      (window as unknown as Record<string, () => void>)[funcName] = () => {
        if (isDraggingRef.current) return;  // 드래그 중이면 클릭 무시
        onMarkerClick?.(item);
      };

      const content = `
        <div 
          onclick="window.${funcName}()" 
          style="
            padding: 4px 8px; 
            background: ${bgColor}; 
            color: ${textColor}; 
            font-size: 15px; 
            font-weight: bold; 
            border: ${borderWidth} solid #2563EB; 
            border-radius: 6px; 
            white-space: nowrap; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            cursor: pointer;
            transition: transform 0.2s;
            transform: ${scale};
          "
        >
          ${depositMan} / ${rentMan}
        </div>
      `;

      const overlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: content,
        yAnchor: 1.2,
        zIndex: isSelected ? 100 : 1  // 선택된 마커가 위에 표시되도록
      });

      overlay.setMap(map);
      markersRef.current.push(overlay);
    });

    // 【Cleanup 함수】
    // 컴포넌트 언마운트 또는 의존성 변경 시 전역 함수 정리
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [map, loaded, mode, realEstateItems, selectedItemId, onMarkerClick]);

  return (
    <div className="w-full h-full relative">
      {/* 지도 로딩 전 플레이스홀더 */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-[32px]">
          <div className="text-slate-400 text-sm">지도 로딩 중...</div>
        </div>
      )}

      {/* 카카오맵 컨테이너 */}
      <div
        ref={mapRef}
        className="w-full h-full rounded-[32px] overflow-hidden"
      />

      {/* 가격 필터 슬라이더 (realestate 모드일 때만 표시) */}
      {mode === 'realestate' && priceFilter && onDepositChange && onRentChange && (
        <PriceFilterBar
          minDeposit={priceFilter.minDeposit}
          maxDeposit={priceFilter.maxDeposit}
          minRent={priceFilter.minRent}
          maxRent={priceFilter.maxRent}
          depositRange={priceFilter.depositRange}
          rentRange={priceFilter.rentRange}
          onDepositChange={onDepositChange}
          onRentChange={onRentChange}
          totalCount={totalCount}
          filteredCount={filteredCount}
        />
      )}

      {/* 업종 분석 바 (analysis 모드일 때만 표시) */}
      {mode === 'analysis' && (
        <IndustryAnalysisBar
          selectedIndustry={selectedIndustry}
          onSelectIndustry={setSelectedIndustry}
        />
      )}
    </div>
  );
}

