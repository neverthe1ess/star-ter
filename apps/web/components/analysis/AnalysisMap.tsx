'use client';

import { useRef, useEffect } from 'react';
import { initProj4, convertCoord } from '../../utils/map-utils';
import { KakaoMarker, KakaoPolygon, KakaoLatLng } from '../../types/map-types';
import { useKakaoMap } from '../../hooks/useKakaoMap';
import { usePopulationLayer } from '../../hooks/usePopulationLayer';
import { usePopulationVisual } from '../../hooks/usePopulationVisual';
import { useMapStore } from '../../stores/useMapStore';
import { useSeoulBoundary } from '../../hooks/useSeoulBoundary';
import { useRealEstateMarkers } from '../../hooks/useRealEstateMarkers';
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
}

export default function AnalysisMap({
  onBoundsChange,
  realEstateData = [],
  onMarkerClick,
  hoveredItemId,
}: AnalysisMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<KakaoMarker[]>([]);
  const polygonsRef = useRef<KakaoPolygon[]>([]);

  const { map } = useKakaoMap(mapRef);

  // 부동산 마커 렌더링
  useRealEstateMarkers(map, realEstateData, onMarkerClick, hoveredItemId);
  const {
    center,
    zoom,
    markers,
    setZoom,
    setCenter,
    clearMarkers,
    isMoving,
    selectedArea,
  } = useMapStore();
  const population = usePopulationVisual();

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

  usePopulationLayer(
    map,
    population.timeFilter,
    population.genderFilter,
    population.ageFilter,
    population.showLayer,
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
        id="kakao-map-analysis"
        className="w-full h-full bg-gray-100"
      />
    </div>
  );
}
