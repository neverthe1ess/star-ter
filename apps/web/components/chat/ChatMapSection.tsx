"use client";

import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from "react";
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
}

// ----------------------------------------------------------------------
// [설정] 최소/최대 너비 상수
const MIN_WIDTH = 400;
const MAX_WIDTH = 800; 
// ----------------------------------------------------------------------

export const ChatMapSection = forwardRef<ChatMapSectionRef, ChatMapSectionProps>(
  ({ isOpen}, ref) => {
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
        width: width
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

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }, [isResizing]);

    
    return (
      <div 
        className={`relative bg-white rounded-2xl shadow-lg
                    transition-all duration-300 flex flex-col`}
        style={{
           // isOpen일 때는 width state 사용, 아니면 0
           width: isOpen ? width : 0,
           height: "100%",
           opacity: isOpen ? 1 : 0,
           pointerEvents: isOpen ? "auto" : "none",
           // 리사이즈 중에는 transition 없애서 버벅임 방지
           transition: isResizing ? "none" : "width 300ms ease, opacity 300ms ease" 
        }}
      >
        {/* 리사이즈 핸들 (오른쪽 가장자리) */}
        <div
          onMouseDown={startResizing}
          className={`absolute top-0 right-0 w-4 h-full cursor-col-resize z-50 flex items-center justify-center
                      hover:bg-blue-500/10 transition-colors group`}
          // 드래그 영역을 좀 더 넓게 잡기 위해 -right-2 등으로 조정 가능하나, 
          // 여기서는 심플하게 오른쪽 끝 내부 4px + 외부 확장은 CSS로 처리하거나 현재 유지
          style={{ right: 0 }} 
        >
          {/* 핸들 시각적 표시 (작은 바) */}
          <div className="w-1 h-8 bg-slate-300 rounded-full group-hover:bg-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
        </div>

        {/* 지도 영역 (60%) - 패딩 적용 */}
        <div className="h-[60%] w-full p-4 pb-0">
          <div ref={mapRef} className="h-full w-full rounded-2xl overflow-hidden shadow-sm border border-slate-100 relative bg-slate-100">
            {!loaded && !error && (
              <div className="h-full flex items-center justify-center">
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

        {/* 부가 정보 영역 (나머지 40%) */}
        <div className="flex-1 w-full p-4 overflow-y-auto">
           <div className="h-full bg-slate-50 rounded-2xl border border-slate-100 p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-2">상권 상세 정보</h3>
              <p className="text-sm text-slate-500">
                지도에서 지역을 선택하면<br/>
                상세 분석 데이터가 여기에 표시됩니다.
              </p>
           </div>
        </div>
      </div>
    );
  }
);

ChatMapSection.displayName = "ChatMapSection";
