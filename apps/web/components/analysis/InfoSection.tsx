'use client';

import React from 'react';
import { Users, BarChart3, Sparkles } from 'lucide-react';
import AnalysisHeader from './AnalysisHeader';
import CategoryTabs from './CategoryTabs';
import SummaryCards from './SummaryCards';
import TimePopulationChart from './TimePopulationChart';
import PaymentStatus from './PaymentStatus';

import { useMapStore } from '../../stores/useMapStore';
import { SummaryReportResponse } from '../../types/api-responses';

export default function InfoSection() {
  const [activeTab, setActiveTab] = React.useState('population');
  const { selectedArea, hasHydrated } = useMapStore();
  const [data, setData] = React.useState<SummaryReportResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!selectedArea?.code) {
      setData(null);
      setError(null);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = `/api/report/summary?regionCode=${selectedArea.code}&industryCode=CS100001&industryName=${encodeURIComponent('한식 음식점')}&regionName=${encodeURIComponent(selectedArea.name)}`;
        const res = await fetch(url);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const message =
            errorData.message ||
            res.statusText ||
            '데이터를 불러오는데 실패했습니다.';
          throw new Error(message);
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch summary report:', err);
        setError(
          err instanceof Error
            ? err.message
            : '데이터를 불러오는 중 오류가 발생했습니다.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedArea?.code, selectedArea?.name]);

  if (!hasHydrated) {
    return (
      <div className="relative h-full flex flex-col p-6 bg-white">
        <div className="relative flex-1 rounded-2xl overflow-hidden border border-gray-100 shadow-inner flex flex-col bg-white">
          <div className="h-24 animate-pulse bg-gray-50 border-b border-gray-100" />
          <div className="h-12 animate-pulse bg-gray-50 border-b border-gray-100" />
          <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="h-28 bg-gray-100 rounded-2xl animate-pulse"></div>
              <div className="h-28 bg-gray-100 rounded-2xl animate-pulse"></div>
              <div className="h-28 bg-gray-100 rounded-2xl animate-pulse"></div>
              <div className="h-28 bg-gray-100 rounded-2xl animate-pulse"></div>
            </div>
            <div className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
            <div className="h-48 bg-gray-100 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col p-6 bg-white">
      <div className="relative flex-1 rounded-2xl overflow-hidden border border-gray-100 shadow-inner flex flex-col bg-white">
        {/* 헤더 */}
        <AnalysisHeader />

        {/* 카테고리 탭 */}
        <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* 컨텐츠 영역 (내부 스크롤) */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-400 text-sm font-medium animate-pulse">
                상권 데이터를 분석하고 있습니다...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-2">
              <p className="text-rose-500 font-bold">오류 발생</p>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          ) : data ? (
            <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* 요약 카드 (유동인구 탭 제외) */}
              {activeTab !== 'population' && (
                <SummaryCards data={data} activeTab={activeTab} />
              )}

              <div className="px-6 py-2 space-y-4">
                {activeTab === 'population' && (
                  <div className="animate-in zoom-in-95 duration-300">
                    <TimePopulationChart
                      data={data}
                      areaName={selectedArea?.name}
                    />
                  </div>
                )}

                {activeTab === 'revenue' && (
                  <div className="animate-in zoom-in-95 duration-300 space-y-4">
                    <PaymentStatus data={data} />
                  </div>
                )}

                {(activeTab === 'industry' || activeTab === 'risk') &&
                  data.competitionAnalysis && (
                    <div className="animate-in zoom-in-95 duration-300 space-y-4">
                      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <BarChart3 size={18} className="text-emerald-600" />
                          업종 및 경쟁 분석 인사이트
                        </h3>
                        {data.competitionAnalysis.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50"
                          >
                            <p className="text-xs text-emerald-600 font-bold mb-1 uppercase tracking-wider">
                              {item.category}
                            </p>
                            <p className="text-sm text-gray-700 font-bold mb-1">
                              {item.summary}
                            </p>
                            <p className="text-[13px] text-gray-500 leading-relaxed">
                              {item.implication}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {(activeTab === 'cost' || activeTab === 'risk') &&
                  data.conclusion && (
                    <div className="animate-in zoom-in-95 duration-300 space-y-4">
                      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Sparkles size={18} className="text-amber-600" />
                          최종 전략 제언
                        </h3>
                        <div className="space-y-3">
                          {data.conclusion.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                            >
                              <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-amber-100 text-amber-700 rounded-lg font-bold text-xs group-hover:scale-110 transition-transform">
                                {idx + 1}
                              </div>
                              <div>
                                <p className="text-xs text-amber-600 font-bold mb-0.5">
                                  {item.category}
                                </p>
                                <p className="text-sm text-gray-700 font-medium leading-relaxed">
                                  {item.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 space-y-2 text-gray-400">
              <div className="p-4 bg-gray-100/50 rounded-full opacity-50">
                <Users size={32} />
              </div>
              <p className="font-medium">
                {!hasHydrated
                  ? '데이터를 불러오는 중...'
                  : selectedArea?.code
                    ? '조회된 데이터가 없습니다.'
                    : '지역을 선택하여 분석을 시작하세요.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
