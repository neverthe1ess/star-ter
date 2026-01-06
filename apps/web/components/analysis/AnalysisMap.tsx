'use client';

import { useRef, useEffect } from 'react';
import { initProj4 } from '../../utils/map-utils';
import { KakaoMarker } from '../../types/map-types';
import { useKakaoMap } from '../../hooks/useKakaoMap';
import { usePolygonData } from '../../hooks/usePolygonData';
import { usePopulationLayer } from '../../hooks/usePopulationLayer';
import { usePopulationVisual } from '../../hooks/usePopulationVisual';
import { useMapStore } from '../../stores/useMapStore';
import { useSeoulBoundary } from '../../hooks/useSeoulBoundary';

initProj4();

export default function AnalysisMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<KakaoMarker[]>([]);

  const { map } = useKakaoMap(mapRef);
  const { center, zoom, markers, setZoom, setCenter, clearMarkers, isMoving } = useMapStore();
  const population = usePopulationVisual();

  // 폴리곤 데이터 로드 (클릭 핸들러 없음)
  usePolygonData(map, () => {}, null, null);
  useSeoulBoundary(map);

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
