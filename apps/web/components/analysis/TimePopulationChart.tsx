'use client';

import React from 'react';
import { Users, Clock, CalendarDays } from 'lucide-react';
import { SummaryReportResponse } from '../../types/api-responses';
import AiInsightBlock from './AiInsightBlock';
import WeeklyPopulationChart from './WeeklyPopulationChart';

interface TimePopulationChartProps {
  data: SummaryReportResponse;
  areaName?: string;
}

export default function TimePopulationChart({
  data,
  areaName,
}: TimePopulationChartProps) {
  const chartData = data.hourlyFlow.data;

  // 데이터가 없거나 모든 값이 0인 경우 처리
  const hasData =
    chartData.length > 0 && chartData.some((d) => d.intensity > 0);
  const maxValue = Math.max(...chartData.map((d) => d.intensity), 10);

  // 핵심 지표 정보 (상단 카드 대체)
  const metrics = [
    {
      label: '일일 유동인구',
      value: `약 ${(data.keyMetrics?.floatingPopulation?.count || 0).toLocaleString()}명`,
      icon: <Users className="w-4 h-4 text-blue-600" />,
      bgColor: 'bg-blue-50',
    },
    {
      label: '피크 시간대',
      value: data.keyMetrics?.floatingPopulation?.mainTime || '데이터 부족',
      icon: <Clock className="w-4 h-4 text-amber-600" />,
      bgColor: 'bg-amber-50',
    },
    {
      label: '주요 방문 요일',
      value: data.keyMetrics?.mainVisitDays?.days?.[0]
        ? `${data.keyMetrics.mainVisitDays.days[0]}요일`
        : '데이터 부족',
      icon: <CalendarDays className="w-4 h-4 text-emerald-600" />,
      bgColor: 'bg-emerald-50',
    },
  ];

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
    .map(
      (d: { intensity: number }, i: number) =>
        `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.intensity)}`,
    )
    .join(' ');

  // 영역 패스 (그라데이션용)
  const areaPath =
    chartData.length > 0
      ? `${linePath} L ${xScale(chartData.length - 1)} ${padding.top + innerHeight} L ${xScale(0)} ${padding.top + innerHeight} Z`
      : '';

  // Y축 눈금
  const yTicks = [0, maxValue / 2, maxValue];

  return (
    <div className="space-y-4">
      {/* 1. AI 분석 박스 (최상단) */}
      {hasData && (
        <AiInsightBlock
          topic="population"
          areaName={areaName || data.meta.region}
          metrics={chartData
            .map(
              (d) => `${d.timeRange}: ${d.intensity.toFixed(1)}% (${d.level})`,
            )
            .join('\n')}
          period={data.meta.period}
        />
      )}

      {/* 2. 핵심 지표 그리드 */}
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-2 transition-all hover:border-blue-100"
          >
            <div className="flex items-center gap-2">
              <div className={`p-1.5 ${metric.bgColor} rounded-lg`}>
                {metric.icon}
              </div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                {metric.label}
              </span>
            </div>
            <p className="text-[16px] font-extrabold text-gray-900 tracking-tight">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {/* 3. 차트 영역 */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs transition-all hover:shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[14px] font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            시간대별 방문 비중 상세
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span className="text-[10px] font-bold text-gray-500">
                방문 비중(%)
              </span>
            </div>
          </div>
        </div>

        {!hasData ? (
          <div className="flex items-center justify-center h-48 text-gray-300 text-[13px] font-medium border-2 border-dashed border-gray-50 rounded-xl">
            데이터 수집 중입니다.
          </div>
        ) : (
          <div className="relative">
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

              {/* Y축 눈금 */}
              {yTicks.map((tick) => (
                <g key={tick}>
                  <line
                    x1={padding.left}
                    y1={yScale(tick)}
                    x2={chartWidth - padding.right}
                    y2={yScale(tick)}
                    stroke="#f8fafc"
                    strokeWidth="1.5"
                  />
                  <text
                    x={padding.left - 15}
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
                  className="fill-gray-400 text-[10px] font-bold"
                >
                  {d.timeRange}
                </text>
              ))}

              {/* 그라데이션 및 라인 */}
              <path d={areaPath} fill="url(#chartGradient)" />
              <path
                d={linePath}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-sm"
              />

              {/* 데이터 포인트 */}
              {chartData.map((d: { intensity: number }, i: number) => (
                <g key={i} className="group cursor-pointer">
                  <circle
                    cx={xScale(i)}
                    cy={yScale(d.intensity)}
                    r="5"
                    fill="white"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    className="transition-all group-hover:r-6 shadow-sm"
                  />
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>

      {/* 4. 요일별 유동인구 차트 */}
      {data.weeklyFlow && <WeeklyPopulationChart data={data.weeklyFlow} />}
    </div>
  );
}
