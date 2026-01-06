'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, Navigation, Maximize, ChevronDown, ChevronRight } from 'lucide-react';
import { useMapStore } from '../../stores/useMapStore';
import { useReportStore } from '../../stores/useReportStore';
import { IndustryData } from '../../mocks/industry';

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
  const [isIndustryModalOpen, setIsIndustryModalOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsIndustryModalOpen(false);
        setExpandedCategory(null);
      }
    };

    if (isIndustryModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isIndustryModalOpen]);

  const handleIndustrySelect = (industryCode: string, industryName: string) => {
    if (selectedArea?.code && selectedArea?.name) {
      openReport({
        regionCode: selectedArea.code,
        regionName: selectedArea.name,
        industryCode,
        industryName,
      });
      setIsIndustryModalOpen(false);
      setExpandedCategory(null);
    }
  };
  
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
      <div className="flex items-center gap-4 relative">
        <button 
          onClick={() => setIsIndustryModalOpen(!isIndustryModalOpen)}
          disabled={!selectedArea?.code}
          className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-semibold text-sm text-gray-700 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700 transition-all shadow-xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
          <span>분석 보고서</span>
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${isIndustryModalOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* 업종 선택 모달 */}
        {isIndustryModalOpen && (
          <div 
            ref={modalRef}
            className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-700">업종 선택</h3>
              <p className="text-xs text-gray-500 mt-0.5">분석할 업종을 선택해주세요</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {IndustryData.map((category) => (
                <div key={category.code} className="border-b border-gray-50 last:border-b-0">
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === category.code ? null : category.code)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-sm text-gray-700">{category.name}</span>
                    <ChevronRight 
                      size={16} 
                      className={`text-gray-400 transition-transform ${expandedCategory === category.code ? 'rotate-90' : ''}`} 
                    />
                  </button>
                  {expandedCategory === category.code && category.children && (
                    <div className="bg-gray-50/50 border-t border-gray-100">
                      {category.children.map((child) => (
                        <button
                          key={child.code}
                          onClick={() => handleIndustrySelect(child.code, child.name)}
                          className="w-full text-left px-6 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          {child.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
