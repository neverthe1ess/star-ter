'use client';

import React from 'react';
import CategoryTabs from './CategoryTabs';
import AnalysisHeader from './AnalysisHeader';
import { Users, MapPin } from 'lucide-react';
import TimePopulationChart from './TimePopulationChart';
import RevenueStructure from './RevenueStructure';
import StartupCostAnalysis from './StartupCostAnalysis';
import CompetitionAnalysisSection from './CompetitionAnalysisSection';
import AnalysisSkeleton from './AnalysisSkeleton';

import { useMapStore } from '../../stores/useMapStore';
import { SummaryReportResponse } from '../../types/api-responses';

export default function InfoSection() {
  const [activeTab, setActiveTab] = React.useState('population');
  const { selectedArea, hasHydrated } = useMapStore();
  const [data, setData] = React.useState<SummaryReportResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = React.useState<{
    code: string;
    name: string;
  }>({ name: '업종전체', code: 'ALL' });

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
        const url = `/api/report/summary?regionCode=${selectedArea.code}&industryCode=${selectedIndustry.code}&industryName=${encodeURIComponent(selectedIndustry.name)}&regionName=${encodeURIComponent(selectedArea.name)}`;
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
  }, [selectedArea?.code, selectedArea?.name, selectedIndustry]);

  if (!hasHydrated) return null;

  if (!selectedArea) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 bg-gray-50/50 rounded-2xl mx-6 my-4 border-2 border-dashed border-gray-100">
        <div className="p-4 bg-white rounded-full shadow-sm">
          <MapPin size={32} className="text-gray-300" />
        </div>
        <div>
          <p className="text-gray-600 font-bold">분석할 지역을 선택해 주세요</p>
          <p className="text-gray-400 text-sm mt-1">
            지도를 클릭하거나 검색을 통해 시작할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col p-6 bg-white">
      <div className="relative flex-1 rounded-2xl overflow-hidden border border-gray-100 shadow-inner flex flex-col bg-white">
        {/* 헤더 */}
        <AnalysisHeader
          locationInfo={data?.locationInfo}
          meta={data?.meta}
          currentIndustry={selectedIndustry || undefined}
        />

        {/* 카테고리 탭 */}
        <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* 컨텐츠 영역 (내부 스크롤) */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30">
          {isLoading && !data ? (
            activeTab === 'industry' || activeTab === 'risk' ? (
              <AnalysisSkeleton />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm font-medium animate-pulse">
                  상권 데이터를 분석하고 있습니다...
                </p>
              </div>
            )
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-2">
              <p className="text-rose-500 font-bold">오류 발생</p>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          ) : data ? (
            <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="px-6 py-2 space-y-4">
                {activeTab === 'population' && (
                  <div className="animate-in zoom-in-95 duration-300">
                    <TimePopulationChart
                      data={data}
                      areaName={selectedArea?.name}
                    />
                  </div>
                )}

                {/* 매출 분석 */}
                {activeTab === 'revenue' && data.revenueAnalysis && (
                  <RevenueStructure
                    data={data}
                    selectedIndustry={selectedIndustry}
                    onIndustrySelect={(code, name) =>
                      setSelectedIndustry({ code, name })
                    }
                  />
                )}

                {(activeTab === 'industry' || activeTab === 'risk') && (
                  <CompetitionAnalysisSection
                    data={data}
                    areaName={selectedArea?.name}
                    topic={activeTab as 'industry' | 'risk'}
                    selectedIndustry={selectedIndustry}
                    onIndustryChange={(ind) => setSelectedIndustry(ind)}
                    isLoading={isLoading}
                  />
                )}

                {activeTab === 'cost' && data.revenueAnalysis && (
                  <StartupCostAnalysis data={data} />
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
