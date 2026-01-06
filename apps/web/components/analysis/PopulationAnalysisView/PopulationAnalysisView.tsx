'use client';

import React, { useState, useEffect } from 'react';
import { Users, MapPin, Loader2 } from 'lucide-react';
import { useMapStore } from '../../../stores/useMapStore';
import { usePopulationVisual } from '../../../hooks/usePopulationVisual';
import AiInsightBlock from '../AiInsightBlock';
import { SummaryReportResponse } from '../../../types/api-responses';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const GENDER_COLORS = ['#3b82f6', '#ec4899']; // Blue, Pink
const AGE_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e']; // Indigo, Sky, Emerald, Amber, Rose

export default function PopulationAnalysisView() {
  const { selectedArea } = useMapStore();
  const population = usePopulationVisual();
  const [data, setData] = useState<SummaryReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const areaName = selectedArea?.name || '서울시';

  useEffect(() => {
    if (!selectedArea?.code) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const url = `/api/report/summary?regionCode=${selectedArea.code}&industryCode=ALL&industryName=업종전체&regionName=${encodeURIComponent(selectedArea.name)}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch summary data for charts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedArea?.code, selectedArea?.name]);

  // AI 분석용 metrics 구성
  const populationMetrics = `
지역: ${areaName} (코드: ${selectedArea?.code || '알 수 없음'})
성별 비중: ${data?.customerComposition ? `남성 ${data.customerComposition.malePercentage}%, 여성 ${data.customerComposition.femalePercentage}%` : '데이터 중'}
연령대 비중: ${data?.ageDistribution ? `10대 ${data.ageDistribution.age10}%, 20대 ${data.ageDistribution.age20}%, 30대 ${data.ageDistribution.age30}%, 40대 ${data.ageDistribution.age40}%, 50대+ ${data.ageDistribution.age50Plus}%` : '데이터 중'}
필터 상태: ${population.genderFilter}/${population.ageFilter}/${population.timeFilter}
  `.trim();

  const genderData = data?.customerComposition
    ? [
        { name: '남성', value: data.customerComposition.malePercentage },
        { name: '여성', value: data.customerComposition.femalePercentage },
      ]
    : [];

  const ageData = data?.ageDistribution
    ? [
        { name: '10대', value: data.ageDistribution.age10 },
        { name: '20대', value: data.ageDistribution.age20 },
        { name: '30대', value: data.ageDistribution.age30 },
        { name: '40대', value: data.ageDistribution.age40 },
        { name: '50대+', value: data.ageDistribution.age50Plus },
      ]
    : [];

  return (
    <div className="relative h-full flex flex-col p-6 bg-white">
      <div className="relative flex-1 rounded-2xl overflow-hidden border border-gray-100 shadow-inner flex flex-col bg-white">
        {/* 헤더 */}
        <div className="p-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                <span className="text-blue-600">{areaName}</span> 유동인구
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin size={12} />
                실시간 유동인구 분석
              </p>
            </div>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* AI 유동인구 분석 */}
          <AiInsightBlock
            topic="population"
            areaName={areaName}
            metrics={populationMetrics}
          />

          {/* 인구 통계 차트 영역 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
              인구 통계 분석
            </h3>
            
            {isLoading ? (
              <div className="h-70 flex items-center justify-center text-blue-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span className="text-sm font-medium">데이터 로딩 중...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {/* 성별 비율 */}
                <div className="flex flex-col items-center">
                  <p className="text-[16px] font-bold text-gray-600 mb-2">성별 비율</p>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={85}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {genderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 연령별 분포 */}
                <div className="flex flex-col items-center">
                  <p className="text-[16px] font-bold text-gray-600 mb-2">연령별 분포</p>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ageData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={85}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {ageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '15px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 범례 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3">🌈 히트맵 범례</h3>
            <div className="flex items-center gap-2">
              <div 
                className="flex-1 h-4 rounded-full" 
                style={{ 
                  background: 'linear-gradient(to right, #0a0a32, #0064ff, #00dcc8, #ffe600, #ff6400, #ffffff)' 
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-[11px] font-bold text-gray-500">
              <span>적음</span>
              <span className="translate-x-[-50%]">보통</span>
              <span>많음</span>
            </div>
          </div>

          {/* 안내 */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <p className="text-xs text-blue-600">
              💡 지도를 확대/축소하면 더 상세한 유동인구 정보를 볼 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
