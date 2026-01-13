"use client";

import React from "react";

/**
 * SurvivalGauge - 생존 점수 게이지 컴포넌트
 * 
 * chart.survival 액션 타입에 대응
 * predict_survival_rate 도구 결과를 시각화
 */

interface SurvivalData {
  score: number;           // 생존 점수 (1-99)
  interpretation: string;   // 해석 메시지
  closingRate: number;      // 폐업률 (%)
  avgOperationMonths: number; // 평균 영업 기간 (월)
  changeStatus?: string;    // 상권 상태
  dataSource?: string;      // 데이터 출처
}

interface SurvivalGaugeProps {
  data: SurvivalData | null;
  isLoading?: boolean;
  areaName?: string;
}

// 점수에 따른 색상 결정
const getScoreColor = (score: number): string => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
};

const getProgressColor = (score: number): string => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
};

const getStatusEmoji = (score: number): string => {
  if (score >= 80) return "🚀";
  if (score >= 60) return "✅";
  if (score >= 40) return "⚡";
  return "⚠️";
};

export function SurvivalGauge({ data, isLoading, areaName }: SurvivalGaugeProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-slate-100 rounded"></div>
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

  const { score, interpretation, closingRate, avgOperationMonths, changeStatus, dataSource } = data;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 my-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800">
          {getStatusEmoji(score)} 생존 점수 {areaName && <span className="text-slate-500">- {areaName}</span>}
        </h3>
        {dataSource && (
          <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
            {dataSource}
          </span>
        )}
      </div>

      {/* 메인 점수 */}
      <div className="text-center mb-6">
        <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
          {score}
          <span className="text-2xl text-slate-400">/99</span>
        </div>
        <div className="text-slate-600 mt-2">{interpretation}</div>
      </div>

      {/* 게이지 바 */}
      <div className="mb-6">
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor(score)} transition-all duration-500`}
            style={{ width: `${(score / 99) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>위험</span>
          <span>보통</span>
          <span>안전</span>
        </div>
      </div>

      {/* 세부 지표 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="text-sm text-slate-500">폐업률</div>
          <div className={`text-lg font-semibold ${closingRate > 10 ? 'text-red-600' : 'text-slate-800'}`}>
            {closingRate}%
          </div>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="text-sm text-slate-500">평균 영업</div>
          <div className="text-lg font-semibold text-slate-800">
            {avgOperationMonths}개월
          </div>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="text-sm text-slate-500">상권 상태</div>
          <div className="text-lg font-semibold text-slate-800">
            {changeStatus || '-'}
          </div>
        </div>
      </div>
    </div>
  );
}
