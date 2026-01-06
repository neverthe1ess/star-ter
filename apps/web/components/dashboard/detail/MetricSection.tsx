'use client';

import React from 'react';
import { MetricType, METRIC_TYPES } from '../mock-data';
import { MarketAnalyticsResponse } from '@/services/revenue.service';
import { formatShortNumber } from '@/utils/currency-convert-format';
import SectorChart from '../charts/SectorChart';
import SaturationGrid from '../charts/SaturationGrid';
import GrowthChart from '../charts/GrowthChart';
import DemographicsRadar from '../charts/DemographicsRadar';
import PopulationChart from '../charts/PopulationChart';

interface MetricSectionProps {
  data: MarketAnalyticsResponse | null;
  isLoading: boolean;
  error: Error | null;
  chartMetric: MetricType;
  setChartMetric: (metric: MetricType) => void;
}

// 차트 색상 상수
const SECTOR_COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];
const STATUS_COLORS: Record<string, string> = {
  위험: '#ef4444',
  경계: '#f59e0b',
  추천: '#10b981',
  default: '#3b82f6',
};

/**
 * MetricSection 컴포넌트
 * 
 * 상권 주요 지표(Market Vital) 섹션을 담당합니다.
 * - 지표 선택 버튼 (잘나가는 업종, 업종 포화도, 매출 성장성, 성별/연령, 유동인구)
 * - 선택된 지표에 대한 인사이트 텍스트
 * - 해당 지표 차트 렌더링
 */
export default function MetricSection({
  data,
  isLoading,
  error,
  chartMetric,
  setChartMetric,
}: MetricSectionProps) {
  // 실제 데이터 기반 동적 인사이트 생성
  const getMetricInsight = (metric: MetricType): { highlight: string; text: string } => {
    if (!data) return { highlight: '-', text: '데이터를 분석중입니다...' };

    switch (metric) {
      case '잘나가는 업종': {
        const top = data.sectors[0];
        if (!top) return { highlight: '-', text: '업종 데이터가 없습니다.' };
        return {
          highlight: top.name,
          text: `업종이 ${formatShortNumber(top.value)}원으로 매출 1위를 기록하고 있어요.`,
        };
      }
      case '업종 포화도': {
        const danger = data.saturation.find((s) => s.status === '위험');
        const warn = data.saturation.find((s) => s.status === '경계');
        if (danger)
          return { highlight: danger.name, text: '업종은 이미 포화 상태라 진입에 주의가 필요해요.' };
        if (warn)
          return { highlight: warn.name, text: '업종은 경계 수준이에요. 시장 조사가 필요합니다.' };
        return { highlight: '안정', text: '이 지역은 상대적으로 경쟁이 덜한 편이에요.' };
      }
      case '매출 성장성': {
        if (data.growth.length < 2) return { highlight: '-', text: '성장 데이터가 부족합니다.' };
        const latest = data.growth[data.growth.length - 1];
        const previous = data.growth[data.growth.length - 2];
        const growthRate =
          previous.amount > 0
            ? Math.round(((latest.amount - previous.amount) / previous.amount) * 100)
            : 0;
        const trend = growthRate > 0 ? '상승' : growthRate < 0 ? '하락' : '정체';
        return {
          highlight: `${Math.abs(growthRate)}%`,
          text: `지난 분기 대비 매출이 ${trend}했어요.`,
        };
      }
      case '성별/연령': {
        if (!data.demographics.length) return { highlight: '-', text: '인구 데이터가 없습니다.' };
        const topAge = data.demographics.reduce((max, curr) =>
          curr.male + curr.female > max.male + max.female ? curr : max,
        );
        const total = data.demographics.reduce((sum, d) => sum + d.male + d.female, 0);
        const percentage = total > 0 ? Math.round(((topAge.male + topAge.female) / total) * 100) : 0;
        return {
          highlight: topAge.subject,
          text: `고객 비중이 ${percentage}%로 가장 높아요.`,
        };
      }
      case '유동인구': {
        if (!data.population.length) return { highlight: '-', text: '유동인구 데이터가 없습니다.' };
        const peak = data.population.reduce((max, curr) => (curr.value > max.value ? curr : max));
        return {
          highlight: `${peak.time}시`,
          text: `시간대에 ${formatShortNumber(peak.value)}명으로 유동인구가 가장 많아요.`,
        };
      }
      default:
        return { highlight: '-', text: '' };
    }
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (error || !data) {
      return (
        <div className="h-full flex items-center justify-center text-gray-400">
          데이터를 불러올 수 없습니다.
        </div>
      );
    }

    // 데이터 변환
    const sectorData = data.sectors.map((item, index) => ({
      ...item,
      color: SECTOR_COLORS[index % SECTOR_COLORS.length],
    }));

    const saturationData = data.saturation.map((item) => ({
      ...item,
      color: STATUS_COLORS[item.status] || STATUS_COLORS.default,
    }));

    const growthData = data.growth.map((item) => ({
      name: item.period,
      value: item.amount,
    }));

    const populationData = data.population.map((item) => ({
      name: item.time,
      value: item.value,
    }));

    // 차트 렌더링 (MetricType에 따라)
    switch (chartMetric) {
      case '잘나가는 업종':
        return <SectorChart data={sectorData} />;
      case '업종 포화도':
        return <SaturationGrid data={saturationData} />;
      case '매출 성장성':
        return <GrowthChart data={growthData} />;
      case '성별/연령':
        return <DemographicsRadar data={data.demographics} />;
      case '유동인구':
        return <PopulationChart data={populationData} />;
      default:
        return null;
    }
  };

  const insight = getMetricInsight(chartMetric);

  return (
    <div className="mb-10">
      <div className="flex flex-col gap-4 mb-4">
        {/* 섹션 제목 */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">상권 주요 지표 (Market Vital)</h3>
          <span className="text-sm text-gray-500">예비 창업자를 위한 핵심 데이터 분석</span>
        </div>

        {/* 지표 선택 버튼 */}
        <div className="flex flex-wrap gap-2">
          {METRIC_TYPES.map((metric) => (
            <button
              key={metric}
              onClick={() => setChartMetric(metric)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                chartMetric === metric
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              {metric}
            </button>
          ))}
        </div>

        {/* 인사이트 박스 */}
        <div className="border border-blue-100 rounded-xl py-3 px-4 text-center">
          <p className="text-md text-gray-800 tracking-tight">
            <span className="font-bold text-red-500 text-lg mr-1">{insight.highlight}</span>
            {insight.text}
          </p>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="h-64 w-full bg-white rounded-2xl border border-gray-100 p-4">
        {renderChart()}
      </div>
    </div>
  );
}
