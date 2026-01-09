"use client";

import { useRef } from "react";
import { useKakaoMap } from "../../hooks/useKakaoMap";

// MapSection의 Props 타입 정의
// mode: 현재 활성화된 탭 (추후 탭별 오버레이 구현 시 사용)
// center: 지도 중심 좌표 (선택적)
interface MapSectionProps {
  mode?: "matching" | "traffic" | "analysis" | "realestate";
  center?: { lat: number; lng: number };
}

/**
 * MapSection 컴포넌트
 *
 * LocationDetailPage 내에서 사용되는 단순화된 카카오맵 컴포넌트입니다.
 * 기본적인 지도 표시 기능만 제공하며, 추후 mode에 따라 오버레이를 추가할 수 있습니다.
 *
 * @param mode - 현재 활성화된 탭 (matching, traffic, analysis, realestate)
 * @param center - 지도 중심 좌표 { lat, lng }
 */
export function MapSection({ mode = "matching", center }: MapSectionProps) {
  // 지도 DOM 요소 참조
  const mapRef = useRef<HTMLDivElement>(null);

  // 카카오맵 초기화 훅 사용
  const { map, loaded } = useKakaoMap(mapRef);

  // TODO: mode에 따른 오버레이 렌더링 로직 추가 예정
  // - matching: 매칭 점수 마커
  // - traffic: 유동인구 히트맵
  // - analysis: 업종 분포 마커
  // - realestate: 부동산 매물 마커

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
