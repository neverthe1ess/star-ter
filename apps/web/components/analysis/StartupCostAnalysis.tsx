'use client';

import React, { useState } from 'react';
import { Calculator, DollarSign, Users, Store, PiggyBank, Briefcase, Clock } from 'lucide-react';
import { SummaryReportResponse } from '../../types/api-responses';

interface StartupCostAnalysisProps {
  data: SummaryReportResponse;
}

export default function StartupCostAnalysis({ data }: StartupCostAnalysisProps) {
  // 사용자 입력 상태 (문자열로 관리하여 빈 값 허용)
  // 초기 투자 비용
  const [deposit, setDeposit] = useState<string>('2000'); // 보증금 (만원)
  const [interiorCost, setInteriorCost] = useState<string>('2000'); // 인테리어 (만원)
  
  // 월 고정 비용
  const [monthlyRent, setMonthlyRent] = useState<string>('200');
  const [monthlyLabor, setMonthlyLabor] = useState<string>('100');
  const [otherCost, setOtherCost] = useState<string>('50');

  // 예상 월매출 (사용자 입력)
  const [expectedSales, setExpectedSales] = useState<string>('500'); // 만원

  // 숫자 변환 (빈 값은 0으로 처리)
  const depositNum = Number(deposit) || 0;
  const interiorNum = Number(interiorCost) || 0;
  const rentNum = Number(monthlyRent) || 0;
  const laborNum = Number(monthlyLabor) || 0;
  const otherNum = Number(otherCost) || 0;
  const expectedSalesNum = Number(expectedSales) || 0;

  // 원 단위 변환
  const userMonthlySales = expectedSalesNum * 10000;
  const totalInitialInvestment = (depositNum + interiorNum) * 10000;
  const totalFixedCost = (rentNum + laborNum + otherNum) * 10000;

  // API 데이터 (참고용)
  const dataMonthlySales = data.revenueAnalysis?.monthlyTotal || 0;
  
  // 핵심 계산: 월 순이익 = 월매출 - 월 고정비
  const estimatedMonthlyProfit = userMonthlySales - totalFixedCost;
  
  // 투자금 회수 기간 (개월)
  const paybackPeriod = estimatedMonthlyProfit > 0 
    ? Math.ceil(totalInitialInvestment / estimatedMonthlyProfit) 
    : 0;

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
    if (Math.abs(value) >= 10000) return `${Math.round(value / 10000).toLocaleString()}만`;
    return value.toLocaleString();
  };

  // 공통 입력 스타일 (스피너 숨김 포함)
  const inputClassName = "w-full px-3 py-2.5 pr-12 text-base font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* 사용 가이드 */}
      <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Calculator size={18} className="text-blue-600" />
          </div>
          <h3 className="text-base font-black text-gray-900">손익 계산기 사용법</h3>
        </div>
        
        <div className="space-y-3 text-[13px] text-gray-600 leading-relaxed">
          <p><span className="font-bold text-blue-600">📌 목적:</span> 창업 시 예상 수익과 투자금 회수 기간을 미리 계산해볼 수 있습니다.</p>
          
          <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-2">
            <p className="font-bold text-gray-700 text-sm">� 계산 공식</p>
            <div className="space-y-1.5">
              <p className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded font-bold text-xs">월 순이익</span>
                <span>=</span>
                <span>예상 월매출 - 월 고정비</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded font-bold text-xs">투자금 회수</span>
                <span>=</span>
                <span>초기 투자금 ÷ 월 순이익</span>
              </p>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">💡 아래에 비용과 예상 매출을 입력하면 자동으로 계산됩니다.</p>
        </div>
      </div>

      {/* 손익분기점 계산기 */}
      <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
            <Calculator size={16} className="text-blue-600" />
            손익분기점 계산기
          </h3>
          <span className={`text-xs font-bold px-2 py-1 rounded-md border ${
            estimatedMonthlyProfit >= 0 
              ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
              : 'text-rose-600 bg-rose-50 border-rose-100'
          }`}>
            {estimatedMonthlyProfit >= 0 ? '흑자 예상' : '적자 예상'}
          </span>
        </div>

        {/* 초기 투자 비용 입력 */}
        <div className="mb-6">
          <p className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-1.5">
            <Briefcase size={12} className="text-violet-500" />
            초기 창업 비용
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">보증금</label>
              <div className="relative">
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="3000"
                  className={inputClassName}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">인테리어/시설</label>
              <div className="relative">
                <input
                  type="number"
                  value={interiorCost}
                  onChange={(e) => setInteriorCost(e.target.value)}
                  placeholder="5000"
                  className={inputClassName}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">총 초기 투자: <span className="font-bold text-violet-600">{formatCurrency(totalInitialInvestment)}원</span></p>
        </div>

        {/* 월 고정비용 입력 */}
        <div className="mb-6">
          <p className="text-[11px] font-bold text-gray-500 mb-3 flex items-center gap-1.5">
            <DollarSign size={12} className="text-blue-500" />
            월 고정 비용
          </p>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                <Store size={10} /> 임대료
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  placeholder="0"
                  className={inputClassName}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                <Users size={10} /> 인건비
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={monthlyLabor}
                  onChange={(e) => setMonthlyLabor(e.target.value)}
                  placeholder="0"
                  className={inputClassName}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-cenetr gap-1">
                <DollarSign size={10} /> 기타
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={otherCost}
                  onChange={(e) => setOtherCost(e.target.value)}
                  placeholder="0"
                  className={inputClassName}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
              </div>
            </div>
          </div>
        </div>

        {/* 예상 월매출 입력 */}
        <div className="mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
          <p className="text-[11px] font-bold text-emerald-700 mb-3 flex items-center gap-1.5">
            💰 예상 월매출 입력
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="number"
                value={expectedSales}
                onChange={(e) => setExpectedSales(e.target.value)}
                placeholder="3000"
                className={inputClassName}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">💡 본인의 예상 월매출을 직접 입력하세요. 상권 평균은 참고용입니다.</p>
        </div>

        {/* 결과 카드 - 2컬럼 */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-5 rounded-2xl border ${
            estimatedMonthlyProfit >= 0 
              ? 'bg-emerald-50 border-emerald-100' 
              : 'bg-rose-50 border-rose-100'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <PiggyBank size={16} className={estimatedMonthlyProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
              <span className={`text-[11px] font-black uppercase ${
                estimatedMonthlyProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>예상 월 순이익</span>
            </div>
            <p className={`text-2xl font-black ${estimatedMonthlyProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {estimatedMonthlyProfit >= 0 ? '+' : ''}{formatCurrency(estimatedMonthlyProfit)}<span className="text-sm text-gray-400 ml-1">원</span>
            </p>
            <p className="text-[10px] text-gray-500 mt-2">= 월매출 {formatCurrency(userMonthlySales)}원 - 고정비 {formatCurrency(totalFixedCost)}원</p>
          </div>
          <div className="p-5 bg-violet-50 rounded-2xl border border-violet-100">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-violet-600" />
              <span className="text-[11px] font-black text-violet-600 uppercase">투자금 회수 기간</span>
            </div>
            <p className="text-2xl font-black text-gray-900">
              {paybackPeriod > 0 ? (
                <>
                  {paybackPeriod < 12 ? `${paybackPeriod}개월` : `${Math.floor(paybackPeriod / 12)}년 ${paybackPeriod % 12}개월`}
                </>
              ) : (
                <span className="text-rose-500">계산불가</span>
              )}
            </p>
            <p className="text-[10px] text-gray-500 mt-2">= 초기투자 {formatCurrency(totalInitialInvestment)}원 ÷ 월 순이익</p>
          </div>
        </div>
      </div>
    </div>
  );
}
