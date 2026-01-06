'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { useMapStore } from '../../stores/useMapStore';


export default function AnalysisHeader() {
  const { selectedArea, hasHydrated } = useMapStore();
  
  if (!hasHydrated) return <div className="h-24 animate-pulse bg-gray-50 border-b border-gray-100" />;
  
  // 동적 브레드크럼 생성
  const getBreadcrumb = () => {
    if (!selectedArea) return '지역을 선택해주세요';

    const { name } = selectedArea;
    // '서울 중구 을지로동' -> '서울 > 중구 > 을지로동'
    if (name.includes(' ')) {
      return name.split(' ').join(' > ');
    }

    // 이름이 단일 명칭인 경우 (예: '강남구')
    return `서울특별시 > ${name}`;
  };

  const areaName = selectedArea?.name || '미선택 지역';
  const breadcrumb = getBreadcrumb();

  return ( 
    <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
      {/* 좌측: 타이틀 + 브레드크럼 */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-6 bg-blue-600 rounded-full hidden md:block"></div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            <span className="text-blue-600">{areaName}</span> 분석
          </h1>
        </div>
        <p className="text-xs font-medium text-gray-400 flex items-center gap-1.5 ml-0.5 md:ml-4">
          <span>{breadcrumb}</span>
        </p> 
      </div>

      {/* 우측: 액션 버튼들 */}
      <div className="flex items-center gap-4">
        <button className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-semibold text-sm text-gray-700 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700 transition-all shadow-xs active:scale-95">
          <Download size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
          <span>보고서 다운로드</span>
        </button>
      </div>
    </div>
  );
}
