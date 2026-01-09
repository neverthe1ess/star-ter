"use client";

import { useRef, useEffect } from "react";
// @ts-expect-error: polylabel 타입 정의 생략
import polylabel from "@mapbox/polylabel";
import { useKakaoMap, type KakaoPolygon } from "../../hooks/useKakaoMap";
import { PolygonData } from "./types";

/**
 * GeoJSON MultiPolygon 형태의 폴리곤 데이터
 * 
 * API에서 받아오는 형식:
 * - type: "MultiPolygon"
 * - coordinates: [ [ [ [lng, lat], ... ] ] ]
 *   - coordinates[0]: 첫 번째 폴리곤 (항상 1개만 존재)
 *   - coordinates[0][0]: 외부 링 (좌표 배열)
 */

interface MapSectionProps {
  mode?: "matching" | "traffic" | "analysis" | "realestate";
  polygonData: PolygonData | null;
}

/**
 * LocationDetailPage 내에서 사용되는 카카오맵 컴포넌트
 * 
 * - 폴리곤 데이터를 받아 지도에 영역을 표시
 * - polylabel을 사용해 폴리곤의 시각적 중심점 계산
 * - 중심점으로 지도 이동
 * 
 * @param mode - 현재 활성화된 탭 (추후 탭별 오버레이 구현 예정)
 * @param polygonData - GeoJSON MultiPolygon 형태의 폴리곤 데이터
 */
export function MapSection({ mode = "matching", polygonData }: MapSectionProps) {
  // 지도 DOM 요소 참조
  const mapRef = useRef<HTMLDivElement>(null);
  const polygonRef = useRef<KakaoPolygon | null>(null);
  const { map, loaded } = useKakaoMap(mapRef);

  useEffect(() => {
    // 조건 체크: 맵 로드 완료 + 폴리곤 데이터 존재
    if (!map || !loaded || !polygonData) return;

    const polygonRings = polygonData.coordinates[0]; // 첫 번째 폴리곤의 링 배열
    const exteriorRing = polygonRings[0]; // 외부 링 (좌표 배열)

    const center = polylabel(polygonRings, 1.0) as [number, number];
    const centerLatLng = new window.kakao.maps.LatLng(center[1], center[0]);

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

    // Cleanup: 컴포넌트 언마운트 또는 의존성 변경 시 폴리곤 제거
    return () => {
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
        polygonRef.current = null;
      }
    };
  }, [map, loaded, polygonData]);

  // TODO: mode에 따른 오버레이 렌더링 로직 추가 예정
  // - matching: 매칭 점수 마커
  // - traffic: 유동인구 히트맵
  // - analysis: 업종 분포 마커
  // - realestate: 부동산 매물 마커
  void mode; // 현재 미사용, lint 경고 방지

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
    </div>
  );
}
