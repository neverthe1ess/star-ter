'use client';

import {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
} from 'react';
import {
  useKakaoMap,
  type KakaoCustomOverlay,
  type KakaoPolygon,
  type KakaoBounds,
} from '../../hooks/useKakaoMap';
import { type MapCommand } from './actions/commandTypes';
import { usePopulationLayer } from '../location-detail/hooks/usePopulationLayer';
import { type MarkerData } from './types/markerTypes';
import { type BuildingInfo, type AreaInfo } from './types/mapTypes';
import { MapInfoPanel } from './MapInfoPanel';
import { useBuildingPolygons } from './hooks/useBuildingPolygons';
import { PolygonData, Coordinate } from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

/**
 * ChatMapSection 컴포넌트
 *
 * - 지도 라이프사이클 관리 (로드, 리사이즈)
 * - 부모 컴포넌트(ChatPage)로부터 액션을 받아 지도 제어 수행
 */

export interface ChatMapSectionRef {
  executeCommand: (command: MapCommand) => void;
}

interface ChatMapSectionProps {
  isOpen: boolean;
}

// ----------------------------------------------------------------------
// [설정] 최소/최대 너비 상수
const MIN_WIDTH = 400;
const MAX_WIDTH = 800;
const FIT_BOUNDS_MIN_WIDTH = 320;
// ----------------------------------------------------------------------

export const ChatMapSection = forwardRef<
  ChatMapSectionRef,
  ChatMapSectionProps
>(({ isOpen }, ref) => {
  useEffect(() => {
    const styleId = 'chat-map-pin-style';
    if (typeof document === 'undefined') return;
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .chat-map-pin-drop {
        animation: chatMapPinDrop 680ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }
      @keyframes chatMapPinDrop {
        0% {
          transform: translateY(-24px) scale(0.9);
          opacity: 0;
        }
        55% {
          transform: translateY(2px) scale(1.02);
          opacity: 1;
        }
        75% {
          transform: translateY(-2px) scale(0.99);
        }
        100% {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  // 지도 DOM 참조
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<KakaoCustomOverlay[]>([]);
  const commercialPolygonRef = useRef<KakaoPolygon | null>(null);
  const pendingCommandsRef = useRef<MapCommand[]>([]);
  const pendingBoundsRef = useRef<{
    bounds: KakaoBounds;
  } | null>(null);
  
  // fetchAreaForMarker 함수 참조 (선언 순서 문제 해결용)
  const fetchAreaForMarkerRef = useRef<((areaCode: string) => void) | null>(null);

  // 카카오맵 훅 사용
  const { map, loaded, error } = useKakaoMap(mapRef, {
    center: { lat: 37.566826, lng: 126.9786567 }, // 서울시청 기본 중심
    level: 4,
  });

  // 상태 관리
  const [isHeatmapVisible, setIsHeatmapVisible] = useState(false);
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  // 건물/상권 선택 상태 (MapInfoPanel용)
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingInfo | null>(
    null,
  );
  const [selectedArea, setSelectedArea] = useState<AreaInfo | null>(null);
  const [isInfoLoading, setIsInfoLoading] = useState(false);

  // 건물 클릭 시 점포 정보 가져오기
  const handleBuildingClick = useCallback(
    async (building: { id: string; name: string; polygonWkt: string }) => {
      setIsInfoLoading(true);
      setSelectedArea(null); // 상권 선택 해제

      try {
        // WKT 폴리곤으로 점포 조회
        const params = new URLSearchParams({
          latitude: '0', // 폴리곤 사용 시 필요 없지만 API가 요구함
          longitude: '0',
          polygon: building.polygonWkt,
        });

        const response = await fetch(`${API_BASE_URL}/market/stores?${params}`);
        if (!response.ok) throw new Error('Failed to fetch stores');

        const data = await response.json();

        setSelectedBuilding({
          id: building.id,
          name: building.name,
          polygonWkt: building.polygonWkt,
          stores: data.stores || [],
        });
      } catch (error) {
        console.error(
          '[ChatMapSection] Failed to fetch building stores:',
          error,
        );
        setSelectedBuilding({
          id: building.id,
          name: building.name,
          stores: [],
        });
      } finally {
        setIsInfoLoading(false);
      }
    },
    [],
  );

  // 건물 폴리곤 훅 사용 (줄 레벨 3 이하에서 표시)
  useBuildingPolygons({
    map,
    loaded,
    zoomThreshold: 3,
    onBuildingClick: handleBuildingClick,
  });

  // 유동인구 히트맵 훅 사용
  usePopulationLayer({
    map,
    hour: 12, // 기본값 12시
    genderFilter: 'all',
    ageFilter: 'all',
    isVisible: isHeatmapVisible && loaded,
    containerId: 'chat-map-container',
  });

  // 마커 렌더링 효과
  useEffect(() => {
    if (!map || !loaded) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    if (markers.length === 0) return;

    // 전역 함수 저장용 (클릭 이벤트)
    const globalFunctionNames: string[] = [];

    markers.forEach((item) => {
      const position = new window.kakao.maps.LatLng(item.lat, item.lng);

      // 클릭 핸들러 등록
      const funcName = `__chatMarkerClick_${item.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
      globalFunctionNames.push(funcName);
      (window as unknown as Record<string, () => void>)[funcName] = () => {
        const focusLevel = 4;
        if (map && map.getLevel() >= focusLevel) {
          map.setLevel(focusLevel, { animate: true });
          map.panTo(position, { animate: true });
        }
        
        // 유사 상권 마커(default 타입)인 경우 상권 정보 fetch + 폴리곤 표시
        // item.id에 areaCode가 저장되어 있음
        if (item.type === 'default' || item.type === undefined) {
          fetchAreaForMarkerRef.current?.(item.id);
        }
        
        item.onClick?.();
      };

      // 마커 스타일 결정
      const isCompetitor = item.type === 'competitor';
      const bgColor = isCompetitor ? '#EF4444' : '#2563EB';
      const markerLabel = item.label ? String(item.label) : '';

      const content = `
          <div
            class="chat-map-pin-drop"
            onclick="window.${funcName}()"
            style="
              position: relative;
              width: 40px;
              height: 40px;
              cursor: pointer;
            "
          >
            <div
              style="
                position: absolute;
                left: 50%;
                top: 0;
                width: 28px;
                height: 28px;
                background: ${bgColor};
                border: 2px solid #FFFFFF;
                border-radius: 50% 50% 50% 0;
                transform: translateX(-50%) rotate(-45deg);
                box-shadow: 0 6px 14px rgba(0,0,0,0.25);
                display: flex;
                align-items: center;
                justify-content: center;
              "
            >
              <div
                style="
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transform: rotate(45deg);
                  color: #FFFFFF;
                  font-size: 12px;
                  font-weight: 700;
                  font-family: 'SF Pro Text', -apple-system, 'Segoe UI', sans-serif;
                  line-height: 1;
                "
              >
                ${markerLabel}
              </div>
            </div>
          </div>
        `;

      const overlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: content,
        xAnchor: 0.5,
        yAnchor: 1,
        zIndex: 10,
      });

      overlay.setMap(map);
      markersRef.current.push(overlay);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      // 전역 함수 정리는 여기서 생략하거나 필요시 추가
    };
  }, [map, loaded, markers]);

  const clearCommercialPolygon = useCallback(() => {
    if (!commercialPolygonRef.current) return;

    if (Array.isArray(commercialPolygonRef.current)) {
      commercialPolygonRef.current.forEach((polygon: KakaoPolygon) =>
        polygon.setMap(null),
      );
    } else {
      commercialPolygonRef.current.setMap(null);
    }

    commercialPolygonRef.current = null;
  }, []);

  const drawCommercialPolygon = useCallback(
    (polygon: PolygonData) => {
      if (!map || !loaded) return;

      clearCommercialPolygon();

      const polygonStyle = {
        strokeWeight: 3,
        strokeColor: '#3B82F6',
        strokeOpacity: 1,
        strokeStyle: 'solid',
        fillColor: '#ffffff',
        fillOpacity: 0.3,
      };

      const polygons: KakaoPolygon[] = [];
      const coords = polygon.coordinates;

      if (polygon.type === 'MultiPolygon') {
        (coords as Coordinate[][][]).forEach((polygonCoords) => {
          const outerRing = polygonCoords[0];
          const path = outerRing.map(
            (coord: Coordinate) =>
              new window.kakao.maps.LatLng(coord[1], coord[0]),
          );

          const polygonItem = new window.kakao.maps.Polygon({
            path,
            ...polygonStyle,
          });
          polygonItem.setMap(map);
          polygons.push(polygonItem);
        });
      } else {
        const pathCoords = (coords as Coordinate[][])[0];
        const path = pathCoords.map(
          (coord: Coordinate) =>
            new window.kakao.maps.LatLng(coord[1], coord[0]),
        );

        const polygonItem = new window.kakao.maps.Polygon({
          path,
          ...polygonStyle,
        });
        polygonItem.setMap(map);
        polygons.push(polygonItem);
      }

      commercialPolygonRef.current = polygons as unknown as KakaoPolygon;
    },
    [map, loaded, clearCommercialPolygon],
  );

  /**
   * 마커 클릭 시 상권 정보를 가져와서 MapInfoPanel 갱신 + 폴리곤 표시
   * - 유사 상권 마커를 클릭했을 때 호출됨
   * - item.id가 areaCode로 사용됨
   */
  const fetchAreaForMarker = useCallback(
    async (areaCode: string) => {
      setIsInfoLoading(true);
      setSelectedBuilding(null); // 건물 선택 해제

      clearCommercialPolygon();

      try {
        // 1. 상권 폴리곤 가져오기
        const polygonResponse = await fetch(
          `${API_BASE_URL}/polygon/commercial/code?code=${encodeURIComponent(areaCode)}`,
        );

        if (!polygonResponse.ok) {
          throw new Error('Failed to fetch polygon');
        }

        const polygonData = await polygonResponse.json();

        // 2. 폴리곤 그리기 + 해당 영역으로 줌/이동
        if (polygonData?.polygons) {
          const polygon: PolygonData = {
            type: polygonData.polygons.type,
            coordinates: polygonData.polygons.coordinates,
          };
          drawCommercialPolygon(polygon);

          // 폴리곤 중심점 계산 후 줌 + 이동 (마커 클릭과 동일한 UX)
          if (map && polygon.coordinates && polygon.coordinates.length > 0) {
            // MultiPolygon 구조: coordinates[0] = 첫 번째 폴리곤, coordinates[0][0] = outer ring
            let coords: [number, number][] = [];
            const firstPolygon = polygon.coordinates[0];
            
            if (Array.isArray(firstPolygon) && firstPolygon.length > 0) {
              // MultiPolygon인 경우: firstPolygon[0]이 실제 좌표 배열
              if (Array.isArray(firstPolygon[0]) && Array.isArray(firstPolygon[0][0])) {
                coords = firstPolygon[0] as [number, number][];
              } else {
                // Polygon인 경우: firstPolygon이 바로 좌표 배열
                coords = firstPolygon as [number, number][];
              }
            }
            
            if (coords && coords.length > 0) {
              let sumLat = 0, sumLng = 0;
              coords.forEach((coord) => {
                sumLng += coord[0];
                sumLat += coord[1];
              });
              const centerLat = sumLat / coords.length;
              const centerLng = sumLng / coords.length;
              
              const focusLevel = 4;
              const position = new window.kakao.maps.LatLng(centerLat, centerLng);
              if (map.getLevel() >= focusLevel) {
                map.setLevel(focusLevel, { animate: true });
              }
              map.panTo(position);
            }
          }
        }

        // 3. 상권 요약 정보 가져오기
        const summaryResponse = await fetch(
          `${API_BASE_URL}/ai/area/summary?areaCd=${encodeURIComponent(areaCode)}`,
        );
        const summaryData = await summaryResponse.json();

        // 4. AreaInfo 구성 및 MapInfoPanel 갱신
        const areaName =
          polygonData?.properties?.commercialName ??
          polygonData?.properties?.commercialname ??
          areaCode;

        const areaInfo: AreaInfo = {
          code: areaCode,
          name: areaName,
          type: 'commercial',
        };

        // 요약 데이터가 있으면 추가
        if (summaryData?.success && summaryData?.data) {
          areaInfo.name = summaryData.data.areaName || areaInfo.name;
          areaInfo.revenue = summaryData.data.revenue;
          areaInfo.floatingPopulation = summaryData.data.floatingPopulation;
          areaInfo.storeCount = summaryData.data.storeCount;
        }

        setSelectedArea(areaInfo);
      } catch (error) {
        console.error('[ChatMapSection] Failed to fetch area info:', error);
        // 에러 시에도 기본 정보라도 표시
        setSelectedArea({
          code: areaCode,
          name: areaCode,
          type: 'commercial',
        });
      } finally {
        setIsInfoLoading(false);
      }
    },
    [drawCommercialPolygon, clearCommercialPolygon, map],
  );

  // ref에 함수 할당 (마커 클릭 핸들러에서 사용)
  fetchAreaForMarkerRef.current = fetchAreaForMarker;

  const runMapCommand = useCallback(
    (command: MapCommand) => {
      if (!map || !loaded) return;

      try {
        if (command.type === 'map.pan_to') {
          const moveLatLon = new window.kakao.maps.LatLng(
            command.payload.lat,
            command.payload.lng,
          );
          if (command.payload.zoom) {
            map.setLevel(command.payload.zoom, { animate: false });
            map.setCenter(moveLatLon);
          } else {
            map.panTo(moveLatLon);
          }
          return;
        }

        if (command.type === 'map.setLayer') {
          if (command.payload.layer === 'footTraffic') {
            const visible = command.payload.visible !== false;
            setIsHeatmapVisible(visible);
          }
          return;
        }

        if (command.type === 'map.setMarkers') {
          setMarkers(command.payload.markers);
          if (command.payload.fitBounds && command.payload.markers.length > 0) {
            const bounds = new window.kakao.maps.LatLngBounds();
            command.payload.markers.forEach((marker) => {
              bounds.extend(
                new window.kakao.maps.LatLng(marker.lat, marker.lng),
              );
            });
            const container = mapRef.current?.getBoundingClientRect();
            if (
              container &&
              Math.round(container.width) < FIT_BOUNDS_MIN_WIDTH
            ) {
              pendingBoundsRef.current = { bounds };
              return;
            }
            pendingBoundsRef.current = null;
            map.relayout();
            map.setBounds(bounds);
          } else {
            pendingBoundsRef.current = null;
          }
          return;
        }

        if (command.type === 'map.showCommercialArea') {
          drawCommercialPolygon(command.payload.polygon);
          setSelectedBuilding(null);
          setSelectedArea(command.payload.area);
          setIsInfoLoading(false);
          return;
        }

        // SimilarAreasCard 아이템 클릭 시 상권 정보 fetch
        if (command.type === 'map.fetchArea') {
          fetchAreaForMarker(command.payload.areaCode);
          return;
        }
      } catch (e) {
        console.error('Failed to execute map command:', e);
      }
    },
    [map, loaded, drawCommercialPolygon, fetchAreaForMarker],
  );

  useEffect(() => {
    if (!map || !loaded || pendingCommandsRef.current.length === 0) return;
    const queued = [...pendingCommandsRef.current];
    pendingCommandsRef.current = [];
    queued.forEach((command) => runMapCommand(command));
  }, [map, loaded, runMapCommand]);

  // 부모 컴포넌트에 메서드 노출
  useImperativeHandle(ref, () => ({
    executeCommand: (command: MapCommand) => {
      if (!map || !loaded) {
        pendingCommandsRef.current.push(command);
        return;
      }

      runMapCommand(command);
    },
  }));

  // [Map Resize Handler]
  // 지도를 담고 있는 div의 크기가 변할 때(예: 사이드바 열림/닫힘)
  // map.relayout()을 호출하여 지도가 깨지지 않도록 함
  useEffect(() => {
    if (!map || !mapRef.current) return;

    const observer = new ResizeObserver(() => {
      map.relayout();
      try {
        // 리사이즈 시 중심점 유지
        const center = map.getCenter();
        map.setCenter(center);
      } catch {
        // ignore
      }
      const container = mapRef.current?.getBoundingClientRect();
      const pending = pendingBoundsRef.current;
      if (
        pending &&
        container &&
        Math.round(container.width) >= FIT_BOUNDS_MIN_WIDTH
      ) {
        pendingBoundsRef.current = null;
        map.relayout();
        map.setBounds(pending.bounds);
      }
    });

    observer.observe(mapRef.current);

    return () => observer.disconnect();
  }, [map]);

  // ========================================================================
  // [Resize Logic] 너비 조절 로직
  // ========================================================================
  const [width, setWidth] = useState(MIN_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  // 리사이즈 시작 시점의 값들을 저장하기 위한 ref
  const resizeStartRef = useRef({ x: 0, width: 0 });

  // 드래그 시작
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    // 시작 시점의 마우스 위치와 현재 너비 저장
    resizeStartRef.current = {
      x: e.clientX,
      width: width,
    };
  };

  // 드래그 중 및 종료 (Window 이벤트)
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // 이동한 거리(delta) 계산
      const deltaX = e.clientX - resizeStartRef.current.x;

      // 기존 너비 + 이동 거리 적용
      let newWidth = resizeStartRef.current.width + deltaX;

      // 최소/최대 너비 제한 적용
      if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
      if (MAX_WIDTH > 0 && newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;

      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div
      className={`relative bg-background rounded-2xl shadow-lg
                    transition-all duration-300 flex flex-col`}
      style={{
        // isOpen일 때는 width state 사용, 아니면 0
        width: isOpen ? width : 0,
        marginRight: isOpen ? '1rem' : 0,
        height: '100%',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        // 리사이즈 중에는 transition 없애서 버벅임 방지
        transition: isResizing
          ? 'none'
          : 'width 300ms ease, margin-right 300ms ease, opacity 300ms ease',
      }}
    >
      {/* 리사이즈 핸들 (오른쪽 가장자리) */}
      <div
        onMouseDown={startResizing}
        className={`absolute top-0 right-0 w-4 h-full cursor-col-resize z-50 flex items-center justify-center
                      hover:bg-primary/10 transition-colors group`}
        // 드래그 영역을 좀 더 넓게 잡기 위해 -right-2 등으로 조정 가능하나,
        // 여기서는 심플하게 오른쪽 끝 내부 4px + 외부 확장은 CSS로 처리하거나 현재 유지
        style={{ right: 0 }}
      >
        {/* 핸들 시각적 표시 (작은 바) */}
        <div className="w-1 h-8 bg-border rounded-full group-hover:bg-primary opacity-0 group-hover:opacity-100 transition-all" />
      </div>

      {/* 지도 영역 (60%) - 패딩 적용 */}
      <div className="h-[60%] w-full p-4 pb-0">
        <div
          id="chat-map-container"
          ref={mapRef}
          className="h-full w-full rounded-2xl overflow-hidden shadow-sm border border-border relative bg-muted"
        >
          {!loaded && !error && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin mx-auto mb-2" />
                <p className="text-caption">지도 로딩 중...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="h-full flex items-center justify-center bg-destructive/10">
              <div className="text-center text-destructive">
                <p className="text-body">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 부가 정보 영역 (나머지 40%) */}
      <div className="flex-1 w-full p-4 overflow-y-auto">
        <MapInfoPanel
          selectedBuilding={selectedBuilding}
          selectedArea={selectedArea}
          isLoading={isInfoLoading}
        />
      </div>
    </div>
  );
});

ChatMapSection.displayName = 'ChatMapSection';
