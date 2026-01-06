'use client';

import React from 'react';
import { Download, Navigation, Maximize } from 'lucide-react';
import { useMapStore } from '../../stores/useMapStore';
import { useReportStore } from '../../stores/useReportStore';

interface AnalysisHeaderProps {
  locationInfo?: {
    areaType: string;
    areaTypeName: string;
    guName: string;
    dongName: string;
    area: number;
  };
  meta?: {
    radius: number;
  };
}

export default function AnalysisHeader({ locationInfo, meta }: AnalysisHeaderProps) {
  const { selectedArea, hasHydrated } = useMapStore();
  const { openReport } = useReportStore();
  
  if (!hasHydrated) return <div className="h-24 animate-pulse bg-gray-50 border-b border-gray-100" />;
  
  const areaName = selectedArea?.name || '미선택 지역';
  
  // 상세 경로 생성
  const detailedPath = locationInfo 
    ? `서울특별시 > ${locationInfo.guName} > ${locationInfo.dongName}`
    : selectedArea?.name.includes(' ') 
      ? `서울특별시 > ${selectedArea.name.split(' ').join(' > ')}`
      : selectedArea?.name ? `서울특별시 > ${selectedArea.name}` : '';

  return ( 
    <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
      {/* 좌측: 타이틀 + 상세 경로 + 상권 정보 뱃지 */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                <span className="text-blue-600">{areaName}</span> 분석
              </h1>
              
              {locationInfo && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-700">
                  <div className="h-3 w-px bg-gray-200 mx-1"></div>
                  
                  {/* 상권 유형 태그 */}
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                    <Navigation size={10} className="fill-blue-600/10" />
                    <span className="text-[12px] font-black uppercase tracking-wider">{locationInfo.areaTypeName}</span>
                  </div>

                  {/* 면적 정보 */}
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                    <Maximize size={10} />
                    <span className="text-[12px] font-black whitespace-nowrap">
                      {locationInfo.area.toLocaleString()}㎡ 
                      <span className="opacity-60 ml-1">(약 {Math.round(locationInfo.area / 3.3057)}평)</span>
                    </span>
                  </div>
                  
                  {/* 분석 반경 */}
                  <div className="text-[12px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                    반경 {meta?.radius}m 
                  </div>
                </div>
              )}
            </div>
            
            {/* 상권 이름 아래 상세 경로 */}
            <p className="text-[11px] font-bold text-gray-400 mt-0.5 leading-none">
              {detailedPath}
            </p>
          </div>
        </div>
      </div>

      {/* 우측: 액션 버튼들 */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => {
            if (selectedArea?.code && selectedArea?.name) {
              openReport({
                regionCode: selectedArea.code,
                regionName: selectedArea.name,
                industryCode: 'CS100001',
                industryName: '한식 음식점',
              });
            }
          }}
          disabled={!selectedArea?.code}
          className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-semibold text-sm text-gray-700 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700 transition-all shadow-xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
          <span>분석 보고서</span>
        </button>
      </div>
    </div>
  );
}
