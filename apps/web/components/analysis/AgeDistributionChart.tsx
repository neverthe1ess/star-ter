'use client';

import React from 'react';
import { User, Users } from 'lucide-react';
import { SummaryReportResponse } from '../../types/api-responses';

interface AgeDistributionChartProps {
  data: SummaryReportResponse['ageDistribution'];
}

export default function AgeDistributionChart({
  data,
}: AgeDistributionChartProps) {
  // 데이터 변환 및 최대값 계산
  const chartData = [
    { label: '10대', value: data.age10, key: '10' },
    { label: '20대', value: data.age20, key: '20' },
    { label: '30대', value: data.age30, key: '30' },
    { label: '40대', value: data.age40, key: '40' },
    { label: '50대+', value: data.age50Plus, key: '50+' },
  ];

  const maxValue = Math.max(...chartData.map((d) => d.value), 10);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs transition-all hover:shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[14px] font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
          연령대별 방문 비중 상세
        </h3>
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-500">방문 비율 (%)</span>
        </div>
      </div>

      <div className="flex justify-between h-[160px] gap-2 px-4">
        {chartData.map((d, i) => {
          const height = (d.value / maxValue) * 100;
          const isMax = d.value === maxValue && d.value > 0;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-2 group h-full"
            >
              <div className="w-full relative flex items-end justify-center flex-1">
                {/* 데이터 레이블 (hover 시 표시) */}
                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                  {d.value.toFixed(1)}%
                </div>

                {/* 막대 그래프 */}
                <div
                  className={`w-full max-w-[32px] rounded-t-lg transition-all duration-500 ease-out group-hover:opacity-90 ${
                    isMax ? 'bg-red-400' : 'bg-blue-300'
                  }`}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span
                className={`text-xs font-bold ${isMax ? 'text-red-400' : 'text-gray-500'}`}
              >
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
