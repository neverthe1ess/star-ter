"use client";

import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useKakaoMap } from "../../hooks/useKakaoMap";
import { type AiAction } from "../../lib/api/ai";

/**
 * ChatMapSection 컴포넌트
 * 
 * - 지도 라이프사이클 관리 (로드, 리사이즈)
 * - 부모 컴포넌트(ChatPage)로부터 액션을 받아 지도 제어 수행
 */

export interface ChatMapSectionRef {
  executeAction: (action: AiAction) => void;
}

interface ChatMapSectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatMapSection = forwardRef<ChatMapSectionRef, ChatMapSectionProps>(
  ({ isOpen, onClose }, ref) => {
    // 지도 DOM 참조
    const mapRef = useRef<HTMLDivElement>(null);
    
    // 카카오맵 훅 사용
    const { map, loaded, error } = useKakaoMap(mapRef, {
      center: { lat: 37.566826, lng: 126.9786567 }, // 서울시청 기본 중심
      level: 4, 
    });

    // 부모 컴포넌트에 메서드 노출
    useImperativeHandle(ref, () => ({
      executeAction: (action: AiAction) => {
        if (!map || !loaded) {
          console.warn("Map is not ready yet.");
          return;
        }

        console.log("[ChatMapSection] Executing action:", action);

        try {
           // 1. 지도 이동 및 줌
           if (action.payload?.lat && action.payload?.lng) {
             const moveLatLon = new window.kakao.maps.LatLng(action.payload.lat, action.payload.lng);
             map.panTo(moveLatLon);
             
             if (action.payload.zoom) {
                map.setLevel(action.payload.zoom);
             }
           }
           
           // TODO: 추후 마커 표시 등 다른 액션 처리 로직 추가 가능
        } catch (e) {
          console.error("Failed to execute map action:", e);
        }
      }
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
      });

      observer.observe(mapRef.current);

      return () => observer.disconnect();
    }, [map]);

    return (
      <div 
        className={`relative bg-white rounded-2xl shadow-lg overflow-hidden
                    transition-all duration-300 ${
                      isOpen 
                        ? "w-[400px] h-full" 
                        : "w-0 h-full opacity-0 pointer-events-none"
                    }`}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm 
                     hover:bg-white rounded-lg shadow-md transition-colors"
          title="지도 닫기"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* 지도 영역 */}
        <div ref={mapRef} className="h-full w-full">
          {!loaded && !error && (
            <div className="h-full flex items-center justify-center bg-slate-100">
              <div className="text-center text-slate-400">
                <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm">지도 로딩 중...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="h-full flex items-center justify-center bg-red-50">
              <div className="text-center text-red-500">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ChatMapSection.displayName = "ChatMapSection";
