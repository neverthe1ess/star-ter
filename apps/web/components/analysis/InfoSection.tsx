'use client';

import React from 'react';
import CategoryTabs from './CategoryTabs';
import SummaryCards from './SummaryCards';
import AnalysisHeader from './AnalysisHeader';
import { Navigation, Map, Maximize, Target, MapPin, BarChart3, Sparkles, Users } from 'lucide-react';
import TimePopulationChart from './TimePopulationChart';
import PaymentStatus from './PaymentStatus';

import { useMapStore } from '../../stores/useMapStore';
import { SummaryReportResponse } from '../../types/api-responses';

export default function InfoSection() {
  const [activeTab, setActiveTab] = React.useState('location');
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
              {/* 요약 카드 (모든 탭에서 성격에 맞게 표시) */}
              <SummaryCards data={data} activeTab={activeTab} />

              <div className="px-6 py-2 space-y-4">
                {activeTab === 'location' && (
                  <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                          <MapPin size={28} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                            위치 및 공간 상세 분석
                          </h3>
                          <p className="text-sm text-gray-400 font-bold mt-0.5">상권의 물리적 특성 및 공간 분포 정보</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mt-4">
                      {/* 상권 유형 */}
                      <div className="group relative p-8 bg-linear-to-br from-gray-50/50 to-white rounded-[2.5rem] border border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 cursor-default overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100/50 transition-colors duration-500" />
                        <div className="relative flex flex-col gap-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-2xl shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                              <Navigation size={22} className="text-blue-500" />
                            </div>
                            <span className="text-[15px] text-gray-400 font-black uppercase tracking-[0.2em]">상권 유형</span>
                          </div>
                          <p className="text-3xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                            {data.locationInfo?.areaTypeName || '정보 없음'}
                          </p>
                        </div>
                      </div>

                      {/* 소속 지역 */}
                      <div className="group relative p-8 bg-linear-to-br from-gray-50/50 to-white rounded-[2.5rem] border border-gray-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 cursor-default overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-100/50 transition-colors duration-500" />
                        <div className="relative flex flex-col gap-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-2xl shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                              <Map size={22} className="text-indigo-500" />
                            </div>
                            <span className="text-[15px] text-gray-400 font-black uppercase tracking-[0.2em]">소속 지역</span>
                          </div>
                          <p className="text-3xl font-black text-gray-900 tracking-tight whitespace-nowrap">
                            {data.locationInfo?.guName} <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8 decoration-4">{data.locationInfo?.dongName}</span>
                          </p>
                        </div>
                      </div>

                      {/* 상권 면적 */}
                      <div className="group relative p-8 bg-linear-to-br from-gray-50/50 to-white rounded-[2.5rem] border border-gray-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-500 cursor-default overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/30 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-100/50 transition-colors duration-500" />
                        <div className="relative flex flex-col gap-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-2xl shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                              <Maximize size={22} className="text-emerald-500" />
                            </div>
                            <span className="text-[15px] text-gray-400 font-black uppercase tracking-[0.2em]">면적</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-black text-gray-900 tracking-tighter">
                                {data.locationInfo?.area?.toLocaleString()}
                              </span>
                              <span className="text-lg font-black text-gray-400 uppercase">㎡</span>
                            </div>
                            <p className="text-base font-black text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-xl mt-2 drop-shadow-sm">
                              약 {Math.round((data.locationInfo?.area || 0) / 3.3057).toLocaleString()}평
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 분석 반경 */}
                      <div className="group relative p-8 bg-linear-to-br from-gray-50/50 to-white rounded-[2.5rem] border border-gray-100 hover:border-amber-200 hover:shadow-2xl hover:shadow-amber-100 transition-all duration-500 cursor-default overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/30 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-100/50 transition-colors duration-500" />
                        <div className="relative flex flex-col gap-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-2xl shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                              <Target size={22} className="text-amber-500" />
                            </div>
                            <span className="text-[15px] text-gray-400 font-black uppercase tracking-[0.2em]">분석 반경</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-gray-900 tracking-tighter italic">
                              {data.meta?.radius}
                            </span>
                            <span className="text-2xl font-black text-gray-300 uppercase tracking-tighter">m</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'population' && (
                  <div className="animate-in zoom-in-95 duration-300">
                    <TimePopulationChart
                      data={data}
                      areaName={selectedArea?.name}
                    />
                  </div>
                )}

                {activeTab === 'revenue' && (
                  <div className="animate-in zoom-in-95 duration-300">
                    <PaymentStatus data={data} />
                  </div>
                )}

                {(activeTab === 'industry' || activeTab === 'risk') &&
                  data.competitionAnalysis && (
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
                  )}

                {(activeTab === 'cost' || activeTab === 'risk') &&
                  data.conclusion && (
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
