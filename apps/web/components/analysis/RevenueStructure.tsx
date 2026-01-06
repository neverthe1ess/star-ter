'use client';

import React from 'react';
import { CreditCard, Coins, TrendingUp, Crown } from 'lucide-react';
import RevenuePatternChart from './RevenuePatternChart';
import AiInsightBlock from './AiInsightBlock';
import { SummaryReportResponse } from '../../types/api-responses';

interface RevenueStructureProps {
  data: SummaryReportResponse;
  selectedIndustry: { code: string; name: string } | null;
  onIndustrySelect: (code: string, name: string) => void;
}

export default function RevenueStructure({ 
  data, 
  selectedIndustry, 
  onIndustrySelect 
}: RevenueStructureProps) {
  if (!data.revenueAnalysis) return null;

  // AI 분석용 metrics 문자열 생성
  const revenueMetrics = `
객단가: ${data.revenueAnalysis.avgTransactionPrice.toLocaleString()}원
월 평균 결제건수: ${data.revenueAnalysis.totalTransactionCount.toLocaleString()}건
주중 매출 비중: ${data.revenueAnalysis.weekdayComparison.weekday}%
주말 매출 비중: ${data.revenueAnalysis.weekdayComparison.weekend}%
TOP 매출 업종: ${data.topIndustries?.slice(0, 3).map(i => `${i.industryName}(${i.salesAmount >= 100000000 ? (i.salesAmount / 100000000).toFixed(1) + '억' : Math.round(i.salesAmount / 10000).toLocaleString() + '만'})`).join(', ') || '정보 없음'}
${data.revenueAnalysis.weekdayComparison.weekday > data.revenueAnalysis.weekdayComparison.weekend ? '주중 집중형 상권' : '주말 집중형 상권'}
  `.trim();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* AI 매출 분석 */}
      <AiInsightBlock
        topic="revenue"
        areaName={data.locationInfo?.dongName || data.meta?.region || '해당 상권'}
        metrics={revenueMetrics}
      />

      {/* TOP 매출 업종 선택 */}
      {data.topIndustries && data.topIndustries.length > 0 && (
        <div className="p-5 bg-linear-to-r from-amber-50 to-orange-50 rounded-3xl border border-amber-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Crown size={18} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900">매출 TOP 업종</h3>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {data.topIndustries.map((item) => {
              const isActive = selectedIndustry?.code === item.industryCode;
              // 금액 포맷: 1억 이상이면 억 단위, 아니면 만원 단위
              const salesDisplay = item.salesAmount >= 100000000
                ? `${(item.salesAmount / 100000000).toFixed(1)}억`
                : `${Math.round(item.salesAmount / 10000).toLocaleString()}만`;
              return (
                <button
                  key={`top-${item.rank}-${item.industryCode}`}
                  onClick={() => onIndustrySelect(item.industryCode, item.industryName)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[13px] font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-200 scale-105'
                      : 'bg-white text-gray-600 hover:text-amber-700 border border-amber-100 hover:border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isActive ? 'bg-white/20' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {item.rank}
                  </span>
                  {item.industryName}
                  <span className={`text-[10px] ${
                    isActive ? 'text-amber-200' : 'text-gray-400'
                  }`}>
                    {salesDisplay}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 매출 핵심 지표 카드 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm group hover:border-blue-200 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
              <CreditCard size={18} />
            </div>
            <span className="text-[13px] font-black text-gray-400 uppercase tracking-wider">객단가</span>
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tight">
            {data.revenueAnalysis.avgTransactionPrice.toLocaleString()}
            <span className="text-sm font-bold text-gray-400 ml-1">원</span>
          </p>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm group hover:border-emerald-200 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
              <Coins size={18} />
            </div>
            <span className="text-[13px] font-black text-gray-400 uppercase tracking-wider">평균 결제건수</span>
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tight">
            {data.revenueAnalysis.totalTransactionCount.toLocaleString()}
            <span className="text-sm font-bold text-gray-400 ml-1">건/월</span>
          </p>
        </div>
      </div>

      {/* 주중/주말 비중 섹션 */}
      <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-600" />
            주중 · 주말 매출 비중
          </h3>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
            {data.revenueAnalysis.weekdayComparison.weekday > data.revenueAnalysis.weekdayComparison.weekend ? '주중 집중형' : '주말 집중형'}
          </span>
        </div>
        
        <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-blue-600 transition-all duration-1000 ease-out"
            style={{ width: `${data.revenueAnalysis.weekdayComparison.weekday}%` }}
          />
          <div 
            className="h-full bg-indigo-300 transition-all duration-1000 ease-out"
            style={{ width: `${data.revenueAnalysis.weekdayComparison.weekend}%` }}
          />
        </div>
        <div className="flex justify-between mt-3 px-1">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase">주중</span>
            <span className="text-sm font-black text-blue-600">{data.revenueAnalysis.weekdayComparison.weekday}%</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-gray-400 uppercase">주말</span>
            <span className="text-sm font-black text-indigo-400">{data.revenueAnalysis.weekdayComparison.weekend}%</span>
          </div>
        </div>
      </div>

      {/* 패턴 차트 */}
      <RevenuePatternChart 
        dailyRatio={data.revenueAnalysis.dailyRatio}
        timePeriodRatio={data.revenueAnalysis.timePeriodRatio}
      />
    </div>
  );
}
