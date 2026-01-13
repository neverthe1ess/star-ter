"use client";

import React from "react";
import { TrendingUp, AlertTriangle } from "lucide-react";

/**
 * BreakEvenCard - 손익분기점 분석 카드 컴포넌트
 *
 * chart.breakeven 액션 타입에 대응
 * calc_break_even_with_listing, calc_break_even 도구 결과를 시각화
 */

interface BreakEvenData {
  bepRevenue: number; // 손익분기 매출
  totalFixedCost: number; // 총 고정비
  rent: number; // 임대료
  laborCost?: number; // 인건비
  variableRate: number; // 변동비율
  deposit?: number; // 보증금
  paybackMonths?: number; // 손익분기 도달 개월
}

interface BreakEvenCardProps {
  data: BreakEvenData | null;
  isLoading?: boolean;
  listingId?: string;
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

export function BreakEvenCard({
  data,
  isLoading,
  listingId,
}: BreakEvenCardProps) {
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

  const {
    bepRevenue,
    totalFixedCost,
    rent,
    laborCost,
    variableRate,
    deposit,
    paybackMonths,
  } = data;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 my-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-800">
            손익분기점 분석
          </h3>
        </div>
        {paybackMonths && paybackMonths > 24 && (
          <span className="flex items-center gap-1 text-base px-3 py-1 text-yellow-700 rounded-full">
            <AlertTriangle className="w-4 h-4" />
            <span>회수기간 긴 편</span>
          </span>
        )}
      </div>

      {/* 메인 BEP 수치 */}
      <div className="bg-blue-50 rounded-xl p-6 mb-6">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-950 mb-2">월 손익분기 매출액</div>
          <div className="text-5xl font-bold text-blue-900">
            {formatCurrency(bepRevenue)}
          </div>
          {paybackMonths && (
            <div className="mt-3 text-xl text-blue-950">
              약 <span className="font-bold">{paybackMonths}개월</span> 후
              손익분기 도달
            </div>
          )}
        </div>
      </div>

      {/* 비용 구조 */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-slate-600">비용 구조</h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-lg text-slate-600">총 고정비</span>
            <span className="text-lg font-semibold text-slate-800">
              {formatCurrency(totalFixedCost)}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-lg text-slate-600">변동비율</span>
            <span className="text-lg font-semibold text-slate-800">
              {(variableRate * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* 고정비 세부 */}
        <div className="p-4 bg-orange-50 rounded-lg">
          <div className="text-base text-orange-600 mb-2">고정비 내역</div>
          <div className="space-y-2">
            <div className="flex justify-between text-base">
              <span className="text-lg text-slate-600">임대료</span>
              <span className="text-lg font-semibold text-slate-800">
                {formatCurrency(rent)}
              </span>
            </div>
            {laborCost && (
              <div className="flex justify-between text-base">
                <span className="text-lg text-slate-600">인건비</span>
                <span className="text-lg font-semibold text-slate-800">
                  {formatCurrency(laborCost)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 보증금 (있는 경우) */}
        {deposit && deposit > 0 && (
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg text-purple-600">보증금</span>
              <span className="text-lg font-semibold text-purple-900">
                {formatCurrency(deposit)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
