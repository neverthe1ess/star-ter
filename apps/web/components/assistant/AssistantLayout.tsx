'use client';

import React, { useState, useCallback } from 'react';
import AppHeader from '@/components/header/AppHeader';
import AssistantMapSection from './AssistantMapSection';
import AssistantChat from './AssistantChat';

// 레이아웃 상수
const MIN_MAP_WIDTH = 20; // 최소 지도 너비 (%)
const MAX_MAP_WIDTH = 60; // 최대 지도 너비 (%)
const DEFAULT_MAP_WIDTH = 33; // 기본 지도 너비 (%)

// AI 어시스턴트 레이아웃 컴포넌트
// - 왼쪽: 지도 섹션 (리사이즈 가능)
// - 가운데: 리사이즈 핸들 (드래그로 크기 조절)
// - 오른쪽: 채팅 섹션
export default function AssistantLayout() {
  // 지도 너비 상태 (퍼센트)
  const [mapWidth, setMapWidth] = useState(DEFAULT_MAP_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  // 지도 액션 상태 (LLM 응답에서 받은 액션)
  const [mapAction, setMapAction] = useState<{
    type: 'showMarker' | 'highlightPolygon' | 'compare' | null;
    data?: {
      code?: string;
      codes?: string[];
      coordinates?: [number, number];
    };
  }>({ type: null });

  // 리사이즈 핸들 드래그 처리
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isResizing) return;
      e.preventDefault();
      // 마우스 X 좌표를 퍼센트로 변환
      const containerWidth = document.body.clientWidth;
      const newWidthPercent = (e.clientX / containerWidth) * 100;
      // 최소/최대 범위 제한
      if (newWidthPercent >= MIN_MAP_WIDTH && newWidthPercent <= MAX_MAP_WIDTH) {
        setMapWidth(newWidthPercent);
      }
    },
    [isResizing]
  );

  // LLM 응답에서 지도 액션 처리
  const handleMapAction = useCallback(
    (action: typeof mapAction) => {
      setMapAction(action);
    },
    []
  );

  return (
    <div className="flex flex-col h-screen w-full bg-white">
      {/* 헤더 */}
      <AppHeader />

      {/* 메인 컨텐츠 */}
      <div
        className="flex flex-1 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsResizing(false)}
        onMouseLeave={() => setIsResizing(false)}
      >
        {/* 왼쪽 - 지도 영역 */}
        <div
          className="h-full overflow-hidden"
          style={{ width: `${mapWidth}%` }}
        >
          <AssistantMapSection mapAction={mapAction} />
        </div>

        {/* 리사이즈 핸들 */}
        <div
          className="w-1 cursor-col-resize bg-transparent hover:bg-blue-400 active:bg-blue-600 transition-colors z-20 flex flex-col justify-center items-center group"
          onMouseDown={() => setIsResizing(true)}
        >
          <div className="h-12 w-1 rounded-full bg-gray-200 group-hover:bg-blue-300" />
        </div>

        {/* 오른쪽 - 채팅 영역 */}
        <div
          className="h-full overflow-hidden bg-gray-50"
          style={{ width: `${100 - mapWidth}%` }}
        >
          <AssistantChat onMapAction={handleMapAction} />
        </div>
      </div>
    </div>
  );
}
