'use client';

import React from 'react';

// 목 데이터: 시간대별 유동 인구
const mockData = [
  { time: '00:00', value: 2500 },
  { time: '03:00', value: 1200 },
  { time: '06:00', value: 8500 },
  { time: '09:00', value: 25000 },
  { time: '12:00', value: 32000 },
  { time: '15:00', value: 28000 },
  { time: '18:00', value: 45000 },
  { time: '21:00', value: 18000 },
];

const maxValue = 60000;

export default function TimePopulationChart() {
  // SVG 좌표 계산
  const chartWidth = 600;
  const chartHeight = 200;
  const padding = { top: 20, right: 40, bottom: 40, left: 60 };

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const xScale = (index: number) =>
    padding.left + (index / (mockData.length - 1)) * innerWidth;
  const yScale = (value: number) =>
    padding.top + (1 - value / maxValue) * innerHeight;

  // 라인 패스 생성
  const linePath = mockData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.value)}`)
    .join(' ');

  // Y축 눈금
  const yTicks = [0, 15000, 30000, 45000, 60000];

  return (
    <div className="px-6 py-4">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          시간대별 유동 인구
        </h3>

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto"
        >
          {/* Y축 눈금선 및 라벨 */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={yScale(tick)}
                x2={chartWidth - padding.right}
                y2={yScale(tick)}
                stroke="#e5e7eb"
                strokeDasharray="4,4"
              />
              <text
                x={padding.left - 10}
                y={yScale(tick)}
                textAnchor="end"
                alignmentBaseline="middle"
                className="fill-gray-500 text-xs"
              >
                {tick.toLocaleString()}
              </text>
            </g>
          ))}

          {/* X축 라벨 */}
          {mockData.map((d, i) => (
            <text
              key={d.time}
              x={xScale(i)}
              y={chartHeight - 10}
              textAnchor="middle"
              className="fill-gray-500 text-xs"
            >
              {d.time}
            </text>
          ))}

          {/* 라인 그래프 */}
          <path
            d={linePath}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 데이터 포인트 */}
          {mockData.map((d, i) => (
            <circle
              key={d.time}
              cx={xScale(i)}
              cy={yScale(d.value)}
              r="4"
              fill="white"
              stroke="#6366f1"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
