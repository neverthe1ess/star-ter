'use client';

import { useRef, useEffect } from 'react';
import { initProj4, convertCoord } from '../../utils/map-utils';
import { KakaoMarker, KakaoPolygon, KakaoLatLng } from '../../types/map-types';
import { useKakaoMap } from '../../hooks/useKakaoMap';
import { usePopulationLayer } from '../../hooks/usePopulationLayer';
import { usePopulationVisual } from '../../hooks/usePopulationVisual';
import { useMapStore } from '../../stores/useMapStore';
import { useSeoulBoundary } from '../../hooks/useSeoulBoundary';

initProj4();

export default function AnalysisMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<KakaoMarker[]>([]);
  const polygonsRef = useRef<KakaoPolygon[]>([]);

  const { map } = useKakaoMap(mapRef);
  const { center, zoom, markers, setZoom, setCenter, clearMarkers, isMoving, selectedArea } = useMapStore();
  const population = usePopulationVisual();

  useSeoulBoundary(map);

  useEffect(() => {
    if (!map) return;

    polygonsRef.current.forEach((poly) => poly.setMap(null));
    polygonsRef.current = [];

    const polygonData = selectedArea?.fullData?.polygons;
    if (!polygonData || !Array.isArray(polygonData) || polygonData.length === 0) return;

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

      rings.forEach((ring) => {
        const path: KakaoLatLng[] = ring.map((c: number[]) => convertCoord(c[0], c[1]));
        
        const polygon = new window.kakao.maps.Polygon({
          path: path,
          strokeWeight: 3,
          strokeColor: '#3B82F6',
          strokeOpacity: 1,
          fillColor: '#3B82F6',
          fillOpacity: 0.3,
        });

        polygon.setMap(map);
        polygonsRef.current.push(polygon);
      });
    } catch (error) {
      console.error('Failed to draw polygon:', error);
    }
  }, [map, selectedArea]);

  useEffect(() => {
    if (!map || !center) return;

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

    map.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
    if (zoom > 0) {
      map.setLevel(zoom);
    }
  }, [center, zoom, markers, map]);

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
