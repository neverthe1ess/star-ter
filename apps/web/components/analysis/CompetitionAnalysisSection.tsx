import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Store,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { SummaryReportResponse } from '../../types/api-responses';
import AiInsightBlock from './AiInsightBlock';

interface CompetitionAnalysisSectionProps {
  data: SummaryReportResponse; // 전체 데이터를 받아서 필요한 정보를 추출
  areaName?: string;
  period?: string;
  topic: 'industry' | 'risk';
  selectedIndustry: { name: string; code: string };
  onIndustryChange: (industry: { name: string; code: string }) => void;
}

export default function CompetitionAnalysisSection({
  data,
  areaName,
  period,
  topic,
  selectedIndustry,
  onIndustryChange,
}: CompetitionAnalysisSectionProps) {
  if (!data.competitionAnalysis) return null;

  const { marketTrends, topIndustries } = data;
  const analysisItems = data.competitionAnalysis;

  // 대분류 업종 리스트
  const availableIndustries = [
    { name: '업종전체', code: 'ALL' },
    { name: '음식', code: 'I2' },
    { name: '교육', code: 'P1' },
    { name: '의료·건강', code: 'Q1' },
    { name: '오락·스포츠', code: 'R1' },
    { name: '생활서비스', code: 'S2' },
    { name: '숙박', code: 'I1' },
    { name: '소매', code: 'G2' },
  ];

  return (
    <div className="animate-in zoom-in-95 duration-300 space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 size={20} className="text-indigo-600" />
          업종 및 경쟁 분석
        </h3>
      </div>

      {/* 1. AI 분석 박스 (Context) */}
      <AiInsightBlock
        topic={topic}
        areaName={areaName || ''}
        metrics={analysisItems
          .map((item) => `${item.category}: ${item.summary}`)
          .join('\n')}
        period={period}
      />

      {/* 1.5 내부 업종 선택기 (토글 버튼) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {availableIndustries.map((ind) => (
          <button
            key={ind.code}
            onClick={() => onIndustryChange(ind)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
              selectedIndustry.code === ind.code
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            {selectedIndustry.code === ind.code && <CheckCircle2 size={12} />}
            {ind.name}
          </button>
        ))}
      </div>

      {/* 2. 시장 생존율 (Risk) & 경쟁 강도 */}
      {marketTrends && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1">
              <TrendingUp size={12} /> 시장 활성도 (개업 vs 폐업)
            </h4>
            <div className="flex items-end justify-between mb-2">
              <div>
                <span className="text-2xl font-black text-emerald-500">
                  {marketTrends.opbizStoreCount}
                </span>
                <span className="text-xs text-gray-400 font-medium ml-1">
                  개소 개업
                </span>
                <div className="text-[10px] text-emerald-600/70 font-medium mt-0.5">
                  (개업률 {marketTrends.opbizRt.toFixed(2)}%)
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-rose-500">
                  {marketTrends.clsbizStoreCount}
                </span>
                <span className="text-xs text-gray-400 font-medium ml-1">
                  개소 폐업
                </span>
                <div className="text-[10px] text-rose-600/70 font-medium mt-0.5">
                  (폐업률 {marketTrends.clsbizRt.toFixed(2)}%)
                </div>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-400 transition-all duration-1000"
                style={{
                  width: `${(marketTrends.opbizStoreCount / (marketTrends.opbizStoreCount + marketTrends.clsbizStoreCount || 1)) * 100}%`,
                }}
              />
              <div className="h-full bg-rose-400 flex-1 transition-all duration-1000" />
            </div>
            <p className="mt-3 text-[11px] text-gray-500 text-center font-medium bg-gray-50 py-1.5 rounded-lg">
              {marketTrends.opbizStoreCount > marketTrends.clsbizStoreCount ? (
                <span className="text-emerald-600 flex items-center justify-center gap-1">
                  <CheckCircle2 size={10} /> 성장하는 시장입니다 (진입 추천)
                </span>
              ) : marketTrends.opbizStoreCount <
                marketTrends.clsbizStoreCount ? (
                <span className="text-rose-600 flex items-center justify-center gap-1">
                  <AlertTriangle size={10} /> 쇠퇴하는 시장입니다 (진입 주의)
                </span>
              ) : (
                <span className="text-gray-500 flex items-center justify-center gap-1">
                  <TrendingUp size={10} /> 변동이 적은 안정적 시장입니다
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-col bg-white p-5 rounded-2xl border border-gray-100 shadow-sm justify-between">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1">
              <Store size={12} /> 경쟁 밀집도 (점포수 증감)
            </h4>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Store size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold">
                  신규 - 폐업 (순증감)
                </p>
                <p className="text-xl font-black text-gray-900">
                  {marketTrends.opbizStoreCount -
                    marketTrends.clsbizStoreCount >
                  0
                    ? '+'
                    : ''}
                  {(
                    marketTrends.opbizStoreCount - marketTrends.clsbizStoreCount
                  ).toLocaleString()}
                  <span className="text-xs font-medium text-gray-400 ml-1">
                    개
                  </span>
                </p>
              </div>
            </div>
            <p className="text-[12px] text-gray-500 leading-tight">
              지난 분기 동안{' '}
              <span className="font-bold text-gray-800">
                {marketTrends.opbizStoreCount}개
              </span>
              가 생기고,{' '}
              <span className="font-bold text-gray-800">
                {marketTrends.clsbizStoreCount}개
              </span>
              가 사라졌습니다.
            </p>
          </div>
        </div>
      )}

      {/* 3. 주요 경쟁 업종 (Top Competitors) */}
      {topIndustries && topIndustries.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            상권 내 주요 업종 분포 (Top 5)
          </h4>
          <div className="space-y-3">
            {topIndustries.slice(0, 5).map((ind, idx) => (
              <div key={idx} className="group">
                <div className="flex items-center justify-between text-xs font-bold text-gray-600 mb-1.5">
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-gray-100 text-gray-500 flex items-center justify-center text-[9px]">
                      {idx + 1}
                    </span>
                    {ind.industryName}
                  </span>
                  <span>{ind.salesAmount.toLocaleString()}원</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 group-hover:bg-indigo-500 transition-colors"
                    style={{
                      width: `${(ind.salesAmount / (topIndustries[0].salesAmount || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. 기존 텍스트 분석 (Insights) */}
      <div className="space-y-3">
        {analysisItems.map((item, idx) => (
          <div
            key={idx}
            className="p-4 bg-gray-50/50 rounded-xl border border-gray-100/80 hover:border-indigo-100 transition-colors"
          >
            <p className="text-xs text-indigo-600 font-bold mb-1 uppercase tracking-wider">
              {item.category}
            </p>
            <p className="text-sm text-gray-800 font-bold mb-1">
              {item.summary}
            </p>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              {item.implication}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
