"use client";

import { useRef, useEffect } from "react";
import { useKakaoMap, type KakaoPolygon } from "../../hooks/useKakaoMap";
import { PolygonData } from "./types";

/**
 * 【MapSection 컴포넌트】
 * 
 * LocationDetailPage 내에서 사용되는 카카오맵 컴포넌트
 * 
 * 📚 핵심 개념: Props로 데이터 전달
 * - centerX, centerY: 부모에서 계산된 중심점 좌표 (서버에서 계산됨)
 * - polygonData: 지도에 그릴 폴리곤 데이터
 * 
 * 📚 리팩토링 포인트:
 * - 기존: 컴포넌트 내부에서 polylabel로 중심점 계산
 * - 변경: 서버에서 계산된 좌표를 props로 받음
 * - 이점: 중심점을 다른 곳(부동산 조회 등)에서도 재사용 가능
 * 
 * @param mode - 현재 활성화된 탭 (추후 탭별 오버레이 구현 예정)
 * @param polygonData - GeoJSON MultiPolygon 형태의 폴리곤 데이터
 * @param centerX - 중심점 경도 (longitude)
 * @param centerY - 중심점 위도 (latitude)
 */

interface MapSectionProps {
  mode?: "matching" | "traffic" | "analysis" | "realestate";
  polygonData: PolygonData | null;
  centerX?: number;  // 중심점 경도
  centerY?: number;  // 중심점 위도
}

export function MapSection({ 
  mode = "matching", 
  polygonData,
  centerX,
  centerY,
}: MapSectionProps) {
  // 【useRef 훅】
  // DOM 요소나 값을 컴포넌트 생명주기 동안 유지
  // - mapRef: 지도가 렌더링될 DOM 요소
  // - polygonRef: 현재 그려진 폴리곤 객체 (cleanup용)
  const mapRef = useRef<HTMLDivElement>(null);
  const polygonRef = useRef<KakaoPolygon | null>(null);
  
  // 【커스텀 훅】
  // useKakaoMap: 카카오맵 초기화 및 상태 관리
  const { map, loaded } = useKakaoMap(mapRef);

  // 【useEffect 훅】
  // 의존성 배열의 값이 변경될 때마다 실행
  // - map, loaded, polygonData, centerX, centerY 중 하나라도 변경되면 재실행
  useEffect(() => {
    // 조건 체크: 맵 로드 완료 + 폴리곤 데이터 존재
    if (!map || !loaded || !polygonData) return;

    const polygonRings = polygonData.coordinates[0]; // 첫 번째 폴리곤의 링 배열
    const exteriorRing = polygonRings[0]; // 외부 링 (좌표 배열)

    // 중심점 설정: props로 받은 좌표 사용, 없으면 폴리곤 첫 좌표 사용
    const centerLat = centerY ?? exteriorRing[0][1];
    const centerLng = centerX ?? exteriorRing[0][0];
    const centerLatLng = new window.kakao.maps.LatLng(centerLat, centerLng);

    map.setCenter(centerLatLng);
    map.setLevel(3);

    // 기존 폴리곤 제거 (메모리 누수 방지)
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }

    // 【GeoJSON → Kakao 좌표 변환】
    // GeoJSON: [경도, 위도] 순서
    // Kakao Maps: LatLng(위도, 경도) → 순서가 반대!
    const kakaoPath = exteriorRing.map(
      (coord) => new window.kakao.maps.LatLng(coord[1], coord[0])
    );

    // 【Kakao Polygon 생성】
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

    // 【Cleanup 함수】
    // 컴포넌트 언마운트 또는 의존성 변경 시 실행
    // 이전에 그린 폴리곤을 제거하여 메모리 누수 방지
    return () => {
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
        polygonRef.current = null;
      }
    };
  }, [map, loaded, polygonData, centerX, centerY]);

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
