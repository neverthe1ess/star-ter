"use client";

import React from "react";

/**
 * RevenueChart - 매출/수익 분석 차트 컴포넌트
 * 
 * chart.revenue 액션 타입에 대응
 * 백엔드 API에서 데이터를 받아 시각화
 */

interface RevenueData {
  revenue: number;      // 월 예상 매출
  rent: number;         // 임대료
  variableCost: number; // 변동비
  netProfit: number;    // 순이익
  profitMargin: number; // 이익률 (%)
  rentCostRatio?: number; // 임대료 비율 (%)
}

interface RevenueChartProps {
  data: RevenueData | null;
  isLoading?: boolean;
  areaName?: string;
}

// 화폐 포맷팅 함수
const formatCurrency = (amount: number): string => {
  if (amount >= 100000000) {
    const uk = Math.floor(amount / 100000000);
    const man = Math.floor((amount % 100000000) / 10000);
    return `${uk}억 ${man.toLocaleString()}만원`;
  }
  return `${Math.floor(amount / 10000).toLocaleString()}만원`;
};

export function RevenueChart({ data, isLoading, areaName }: RevenueChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-slate-100 rounded"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-slate-500">
        데이터를 불러올 수 없습니다.
      </div>
    );
  }

  const { revenue, rent, variableCost, netProfit, profitMargin, rentCostRatio } = data;
  const totalCost = rent + variableCost;

  // 비용 구성 비율 계산
  const rentPercent = revenue > 0 ? (rent / revenue) * 100 : 0;
  const variablePercent = revenue > 0 ? (variableCost / revenue) * 100 : 0;
  const profitPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 my-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800">
          📊 수익 분석 {areaName && <span className="text-slate-500">- {areaName}</span>}
        </h3>
        {rentCostRatio && rentCostRatio > 15 && (
          <span className="text-sm px-2 py-1 bg-red-100 text-red-700 rounded-full">
            ⚠️ 임대료 비중 높음
          </span>
        )}
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600 mb-1">월 예상 매출</div>
          <div className="text-xl font-bold text-blue-900">{formatCurrency(revenue)}</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-sm text-red-600 mb-1">총 비용</div>
          <div className="text-xl font-bold text-red-900">{formatCurrency(totalCost)}</div>
        </div>
        <div className={`rounded-lg p-4 ${netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={`text-sm mb-1 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            순이익
          </div>
          <div className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
            {formatCurrency(netProfit)}
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-purple-600 mb-1">이익률</div>
          <div className="text-xl font-bold text-purple-900">{profitMargin}%</div>
        </div>
      </div>

      {/* 비용 구조 바 차트 */}
      <div className="mb-4">
        <div className="text-sm text-slate-600 mb-2">비용 구조</div>
        <div className="h-8 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-orange-400 h-full flex items-center justify-center text-xs text-white font-medium"
            style={{ width: `${rentPercent}%` }}
          >
            {rentPercent > 10 && '임대료'}
          </div>
          <div
            className="bg-yellow-400 h-full flex items-center justify-center text-xs text-slate-700 font-medium"
            style={{ width: `${variablePercent}%` }}
          >
            {variablePercent > 10 && '변동비'}
          </div>
          <div
            className="bg-green-400 h-full flex items-center justify-center text-xs text-white font-medium"
            style={{ width: `${Math.max(0, profitPercent)}%` }}
          >
            {profitPercent > 10 && '순이익'}
          </div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>임대료 {rentPercent.toFixed(1)}%</span>
          <span>변동비 {variablePercent.toFixed(1)}%</span>
          <span>순이익 {profitPercent.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
