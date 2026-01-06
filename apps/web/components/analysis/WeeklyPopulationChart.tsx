'use client';

import React from 'react';
import { CalendarDays } from 'lucide-react';

interface WeeklyPopulationChartProps {
  data: {
    day: string;
    value: number;
  }[];
}

export default function WeeklyPopulationChart({
  data,
}: WeeklyPopulationChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 10);
  const chartHeight = 160;

  // 요일 순서 (월~일)
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const sortedData = days.map(
    (day) => data.find((d) => d.day === day) || { day, value: 0 },
  );

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs transition-all hover:shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span>
          요일별 방문 비중 상세
        </h3>
        <div className="flex items-center gap-1.5">
          <CalendarDays size={14} className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-500">
            방문자 수 (명)
          </span>
        </div>
      </div>

      <div className="flex justify-between h-[160px] gap-2 px-2">
        {sortedData.map((d, i) => {
          const height = (d.value / maxValue) * 100;
          const isMax = d.value === maxValue && d.value > 0;
          const isWeekend = d.day === '토' || d.day === '일';

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-2 group h-full"
            >
              <div className="w-full relative flex items-end justify-center flex-1">
                {/* 데이터 레이블 (hover 시 표시) */}
                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                  {d.value.toLocaleString()}명
                </div>

                {/* 막대 그래프 */}
                <div
                  className={`w-full max-w-[24px] rounded-t-lg transition-all duration-500 ease-out group-hover:opacity-90 ${
                    isMax ? 'bg-rose-400' : 'bg-blue-300'
                  }`}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span
                className={`text-xs font-bold ${isWeekend ? 'text-red-500' : 'text-gray-500'}`}
              >
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
