'use client';

import React from 'react';
import { SummaryReportResponse } from '../../types/api-responses';

interface TimePopulationChartProps {
  data: SummaryReportResponse;
  areaName?: string;
}

export default function TimePopulationChart({ data, areaName }: TimePopulationChartProps) {
  const chartData = data.hourlyFlow.data;
  
  // 데이터가 없거나 모든 값이 0인 경우 처리
  const hasData = chartData.length > 0 && chartData.some(d => d.intensity > 0);
  const maxValue = Math.max(...chartData.map(d => d.intensity), 10);

  // SVG 좌표 계산
  const chartWidth = 600;
  const chartHeight = 160;
  const padding = { top: 20, right: 40, bottom: 30, left: 50 };

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const xScale = (index: number) =>
    padding.left + (index / (chartData.length - 1 || 1)) * innerWidth;
  const yScale = (value: number) =>
    padding.top + (1 - value / maxValue) * innerHeight;

  // 라인 패스 생성
  const linePath = chartData
    .map((d: { intensity: number }, i: number) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.intensity)}`)
    .join(' ');

  // 영역 패스 (그라데이션용)
  const areaPath = chartData.length > 0 
    ? `${linePath} L ${xScale(chartData.length - 1)} ${padding.top + innerHeight} L ${xScale(0)} ${padding.top + innerHeight} Z`
    : '';

  // Y축 눈금 (비율이므로 0~100 사이 등 적절히 분할)
  const yTicks = [0, maxValue / 2, maxValue];

  return (
    <div className="px-6 py-2">
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            {areaName || '선택 구역'} 시간대별 방문 비중
          </h3>
          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
            {data.meta.period} 기준
          </span>
        </div>

        {!hasData ? (
          <div className="flex items-center justify-center h-25 text-gray-300 text-[12px]">
            시간대별 유동인구 데이터가 부족합니다.
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto overflow-visible"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Y축 눈금선 및 라벨 */}
            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={yScale(tick)}
                  x2={chartWidth - padding.right}
                  y2={yScale(tick)}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 12}
                  y={yScale(tick)}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  className="fill-gray-400 text-[10px] font-bold"
                >
                  {tick.toFixed(0)}%
                </text>
              </g>
            ))}

            {/* X축 라벨 */}
            {chartData.map((d: { timeRange: string }, i: number) => (
              <text
                key={i}
                x={xScale(i)}
                y={chartHeight - 5}
                textAnchor="middle"
                className="fill-gray-400 text-[9px] font-bold"
              >
                {d.timeRange}
              </text>
            ))}

            {/* 영역 그라데이션 */}
            <path d={areaPath} fill="url(#chartGradient)" />

            {/* 라인 그래프 */}
            <path
              d={linePath}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 데이터 포인트 */}
            {chartData.map((d: { intensity: number }, i: number) => (
              <circle
                key={i}
                cx={xScale(i)}
                cy={yScale(d.intensity)}
                r="3.5"
                fill="white"
                stroke="#6366f1"
                strokeWidth="2"
                className="drop-shadow-sm"
              />
            ))}
          </svg>
        )}
      </div>
    </div>
  );
}
