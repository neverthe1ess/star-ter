'use client';

import { useRef, useEffect } from 'react';
import { initProj4 } from '../../utils/map-utils';
import { KakaoMarker, KakaoPolygon } from '../../types/map-types';
import { useKakaoMap } from '../../hooks/useKakaoMap';
import { usePopulationLayer } from '../../hooks/usePopulationLayer';
import { usePopulationVisual } from '../../hooks/usePopulationVisual';
import { useMapStore } from '../../stores/useMapStore';
import { useSeoulBoundary } from '../../hooks/useSeoulBoundary';

initProj4();

export default function AnalysisMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<KakaoMarker[]>([]);
  const polygonRef = useRef<KakaoPolygon | null>(null);

  const { map } = useKakaoMap(mapRef);
  const { center, zoom, markers, setZoom, setCenter, clearMarkers, isMoving, selectedArea } = useMapStore();
  const population = usePopulationVisual();

  // 서울 경계만 표시
  useSeoulBoundary(map);

  // 선택된 지역 폴리곤만 그리기
  useEffect(() => {
    if (!map) return;

    // 기존 폴리곤 제거
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }

    // selectedArea에 폴리곤 데이터가 있으면 그리기
    const polygonData = selectedArea?.fullData?.polygons;
    if (!polygonData) return;

    try {
      // 폴리곤 좌표 변환
      let path: { lat: number; lng: number }[][] = [];
      
      // MultiPolygon 또는 Polygon 형식 처리
      if (Array.isArray(polygonData)) {
        const firstElement = polygonData[0];
        if (Array.isArray(firstElement)) {
          const secondElement = firstElement[0];
          if (Array.isArray(secondElement)) {
            const thirdElement = secondElement[0];
            if (Array.isArray(thirdElement)) {
              // MultiPolygon: number[][][][]
              path = (polygonData as number[][][][]).map((polygon) =>
                polygon[0].map((coord) => ({ lng: coord[0], lat: coord[1] }))
              );
            } else {
              // Polygon: number[][][]
              path = [(polygonData as number[][][])[0].map((coord) => ({ lng: coord[0], lat: coord[1] }))];
            }
          } else {
            // Simple ring: number[][]
            path = [(polygonData as number[][]).map((coord) => ({ lng: coord[0], lat: coord[1] }))];
          }
        }
      }

      if (path.length === 0) return;

      // 카카오맵 폴리곤 생성 (첫 번째 링만 사용)
      const kakaoPath = path[0].map((coord) => new window.kakao.maps.LatLng(coord.lat, coord.lng));

      const polygon = new window.kakao.maps.Polygon({
        path: kakaoPath,
        strokeWeight: 3,
        strokeColor: '#3B82F6',
        strokeOpacity: 1,
        fillColor: '#3B82F6',
        fillOpacity: 0.2,
      });

      polygon.setMap(map);
      polygonRef.current = polygon;
    } catch (error) {
      console.error('Failed to draw polygon:', error);
    }
  }, [map, selectedArea]);

  // 스토어 → 지도 동기화
  useEffect(() => {
    if (!map || !center) return;

    // 마커 갱신
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    markers.forEach((data) => {
      const position = new window.kakao.maps.LatLng(data.coords.lat, data.coords.lng);

      if (data.style === 'pulse') {
        const content = document.createElement('div');
        content.className = 'custom-map-marker';
        content.innerHTML = '<div class="marker-pin"></div><div class="marker-pulse"></div>';
        
        const overlay = new window.kakao.maps.CustomOverlay({
          position,
          content,
          map,
          yAnchor: 0.5,
          zIndex: 3,
        });
        markersRef.current.push(overlay as unknown as KakaoMarker);
      } else {
        const marker = new window.kakao.maps.Marker({ position, map });
        markersRef.current.push(marker);
      }
    });

    // 지도 이동
    map.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
    if (zoom > 0) {
      map.setLevel(zoom);
    }
  }, [center, zoom, markers, map]);

  // 인구 레이어
  usePopulationLayer(
    map,
    population.timeFilter,
    population.genderFilter,
    population.ageFilter,
    population.showLayer,
    population.getPopulationValue,
  );

  // 사용자 조작 → 스토어 동기화
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

    window.kakao.maps.event.addListener(map, 'zoom_changed', syncZoom);
    window.kakao.maps.event.addListener(map, 'center_changed', syncCenter);
    window.kakao.maps.event.addListener(map, 'dragstart', onDragStart);

    return () => {
      window.kakao.maps.event.removeListener(map, 'zoom_changed', syncZoom);
      window.kakao.maps.event.removeListener(map, 'center_changed', syncCenter);
      window.kakao.maps.event.removeListener(map, 'dragstart', onDragStart);
    };
  }, [map, isMoving, setCenter, setZoom, clearMarkers]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} id="kakao-map-analysis" className="w-full h-full bg-gray-100" />
    </div>
  );
}
