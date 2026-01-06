'use client';

import { useRef, useEffect } from 'react';
import { initProj4, convertCoord } from '../../utils/map-utils';
import { KakaoPolygon, KakaoLatLng } from '../../types/map-types';
import { useKakaoMap } from '../../hooks/useKakaoMap';
import { usePopulationLayer } from '../../hooks/usePopulationLayer';
import { usePopulationVisual } from '../../hooks/usePopulationVisual';
import { useMapStore } from '../../stores/useMapStore';
import { useSeoulBoundary } from '../../hooks/useSeoulBoundary';
import { useRealEstateMarkers } from '../../hooks/useRealEstateMarkers';
import { useStoreMarkers, StoreLocation } from '../../hooks/useStoreMarkers';
import { RealEstateItem } from '../../types/map-store-types';
import polylabel from '@mapbox/polylabel';

initProj4();

interface BBox {
  minx: number;
  miny: number;
  maxx: number;
  maxy: number;
}

interface AnalysisMapProps {
  onBoundsChange?: (bbox: BBox) => void;
  realEstateData?: RealEstateItem[];
  onMarkerClick?: (item: RealEstateItem) => void;
  hoveredItemId?: string | null;
  showPopulationHeatmap?: boolean;
  // 외부에서 유동인구 레이어 토글 가능
  showPopulationLayer?: boolean;
  populationFilters?: {
    genderFilter?: 'Male' | 'Female' | 'Total';
    ageFilter?: string;
    timeFilter?: string;
  };
  // 업종별 매장 마커 (치킨, 카페 등)
  storeMarkers?: StoreLocation[];
  onStoreMarkerClick?: (store: StoreLocation) => void;
}

export default function AnalysisMap({
  onBoundsChange,
  realEstateData = [],
  onMarkerClick,
  hoveredItemId,
  showPopulationHeatmap = false,
  showPopulationLayer: externalShowLayer,
  populationFilters,
  storeMarkers = [],
  onStoreMarkerClick,
}: AnalysisMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const polygonsRef = useRef<KakaoPolygon[]>([]);

  const { map } = useKakaoMap(mapRef);

  // 부동산 마커 렌더링
  useRealEstateMarkers(map, realEstateData, onMarkerClick, hoveredItemId);
  
  // 업종별 매장 마커 렌더링 (치킨, 카페 등)
  useStoreMarkers(map, storeMarkers, onStoreMarkerClick);
  const {
    zoom,
    setZoom,
    setCenter,
    clearMarkers,
    isMoving,
    selectedArea,
  } = useMapStore();
  const population = usePopulationVisual();
  
  // 외부 prop이 있으면 외부 값 사용, 없으면 내부 상태 사용
  const effectiveShowLayer = externalShowLayer !== undefined ? externalShowLayer : (showPopulationHeatmap || population.showLayer);
  const effectiveGenderFilter = populationFilters?.genderFilter || population.genderFilter;
  const effectiveAgeFilter = populationFilters?.ageFilter || population.ageFilter;
  const effectiveTimeFilter = populationFilters?.timeFilter || population.timeFilter;

  useSeoulBoundary(map);

  useEffect(() => {
    if (!map) return;

    polygonsRef.current.forEach((poly) => poly.setMap(null));
    polygonsRef.current = [];

    const polygonData = selectedArea?.fullData?.polygons;
    if (!polygonData || !Array.isArray(polygonData) || polygonData.length === 0)
      return;

    try {
      let rings: number[][][] = [];
      const first = polygonData[0];

      let isLevel4 = false;
      let isLevel2 = false;

      if (Array.isArray(first)) {
        const second = first[0];
        if (Array.isArray(second)) {
          const third = second[0];
          if (Array.isArray(third)) {
            isLevel4 = true;
          }
        } else if (typeof second === 'number') {
          isLevel2 = true;
        }
      }

      if (isLevel4) {
        (polygonData as number[][][][]).forEach((poly) => {
          if (Array.isArray(poly)) {
            poly.forEach((ring) => rings.push(ring));
          }
        });
      } else if (isLevel2) {
        rings.push(polygonData as unknown as number[][]);
      } else {
        rings = polygonData as number[][][];
      }

      const [lng, lat] = polylabel(rings, 1.0);
      const centerPoint = convertCoord(lng, lat);

      const position = new window.kakao.maps.LatLng(
        centerPoint.getLat(),
        centerPoint.getLng(),
      );
      map.setCenter(position);
      map.setLevel(zoom);

      rings.forEach((ring) => {
        const path: KakaoLatLng[] = ring.map((c: number[]) =>
          convertCoord(c[0], c[1]),
        );

        const polygon = new window.kakao.maps.Polygon({
          path: path,
          strokeWeight: 3,
          strokeColor: '#3B82F6',
          strokeOpacity: 1,
          fillColor: '#ffffff',
          fillOpacity: 0.3,
        });

        polygon.setMap(map);
        polygonsRef.current.push(polygon);
      });
    } catch (error) {
      console.error('Failed to draw polygon:', error);
    }
  }, [map, selectedArea, zoom]);

  // Store 상태(center, markers) 변경 시 지도 이동 처리
  useEffect(() => {
    if (!map || !center) return;

    const moveLatLon = new window.kakao.maps.LatLng(center.lat, center.lng);
    
    // 현재 중심과 다를 경우에만 이동 (불필요한 애니메이션 방지)
    const currentCenter = map.getCenter();
    if (
      Math.abs(currentCenter.getLat() - center.lat) > 0.0001 || 
      Math.abs(currentCenter.getLng() - center.lng) > 0.0001
    ) {
      map.panTo(moveLatLon);
    }

    if (zoom && map.getLevel() !== zoom) {
        map.setLevel(zoom, { animate: true });
    }
  }, [map, center, zoom]);

  usePopulationLayer(
    map,
    (effectiveTimeFilter || 'All') as '0-8' | '8-16' | '16-24' | 'All',
    (effectiveGenderFilter || 'Total') as 'Male' | 'Female' | 'Total',
    (effectiveAgeFilter || 'Total') as 'Total' | '10대' | '20대' | '30대' | '40대' | '50대' | '60대+',
    effectiveShowLayer,
    population.getPopulationValue,
  );

  useEffect(() => {
    if (!map) return;

    const syncZoom = () => {
      if (isMoving) return;
      setZoom(map.getLevel());
    };

    const syncCenter = () => {
      if (isMoving) return;
      const c = map.getCenter();
      setCenter({ lat: c.getLat(), lng: c.getLng() });
    };

    const onDragStart = () => clearMarkers();

    // Bounds 변경 시 콜백 호출 (부동산 모드용)
    const handleBoundsChange = () => {
      if (!onBoundsChange) return;
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      onBoundsChange({
        minx: sw.getLng(),
        miny: sw.getLat(),
        maxx: ne.getLng(),
        maxy: ne.getLat(),
      });
    };

    window.kakao.maps.event.addListener(map, 'zoom_changed', syncZoom);
    window.kakao.maps.event.addListener(map, 'center_changed', syncCenter);
    window.kakao.maps.event.addListener(map, 'dragstart', onDragStart);
    window.kakao.maps.event.addListener(map, 'idle', handleBoundsChange);

    // 초기 로드 시에도 bbox 전송
    if (onBoundsChange) {
      handleBoundsChange();
    }

    return () => {
      window.kakao.maps.event.removeListener(map, 'zoom_changed', syncZoom);
      window.kakao.maps.event.removeListener(map, 'center_changed', syncCenter);
      window.kakao.maps.event.removeListener(map, 'dragstart', onDragStart);
      window.kakao.maps.event.removeListener(map, 'idle', handleBoundsChange);
    };
  }, [map, isMoving, setCenter, setZoom, clearMarkers, onBoundsChange]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapRef}
        id="kakao-map"
        className="w-full h-full bg-gray-100"
      />
    </div>
  );
}
