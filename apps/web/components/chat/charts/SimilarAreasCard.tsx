"use client";

import React from "react";
import { Copy, Layers, Sparkles, ThumbsUp, BarChart3 } from "lucide-react";

/**
 * SimilarAreasCard - 유사 상권 리스트 컴포넌트
 *
 * list.similar_areas 액션 타입에 대응
 * find_similar_commercial_areas 도구 결과를 시각화
 */

// 개별 유사 상권 데이터 타입
interface SimilarAreaItem {
  areaCode: string;
  areaName: string;
  similarity: number; // 유사도 (0-100)
  targetName?: string; // 비교 대상 상권명
}

interface SimilarAreasData {
  targetAreaName: string;
  similarAreas: SimilarAreaItem[];
}

interface SimilarAreasCardProps {
  data: SimilarAreasData | null;
  isLoading?: boolean;
}

// 유사도에 따른 색상
const getSimilarityColor = (similarity: number): string => {
  if (similarity >= 90) return "text-green-600";
  if (similarity >= 80) return "text-blue-600";
  if (similarity >= 70) return "text-yellow-600";
  return "text-slate-600 bg-slate-50";
};

// 유사도 아이콘 컴포넌트
const SimilarityIcon = ({ similarity }: { similarity: number }) => {
  if (similarity >= 90) return <Sparkles className="w-5 h-5" />;
  if (similarity >= 80) return <ThumbsUp className="w-5 h-5" />;
  return <BarChart3 className="w-5 h-5" />;
};

export function SimilarAreasCard({ data, isLoading }: SimilarAreasCardProps) {
  // 로딩 상태
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // 데이터 없음
  if (!data || !data.similarAreas || data.similarAreas.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-slate-500">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5" />
          <span>유사한 상권을 찾을 수 없습니다.</span>
        </div>
      </div>
    );
  }

  const { targetAreaName, similarAreas } = data;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 my-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2">
            <Copy className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">
            <span className="text-blue-600">{targetAreaName}</span>과(와) 유사한
            상권
          </h3>
        </div>
      </div>
      <p className="text-base text-slate-500 mb-6 pl-1">
        연령대 분포, 유동인구 시간대, 인구 구성, 임대료 기준
      </p>

      {/* 유사 상권 리스트 */}
      <div className="space-y-3">
        {similarAreas.map((area, index) => (
          <div
            key={area.areaCode || index}
            className="flex items-center justify-between p-5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {/* 순위 및 상권명 */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-700 text-xl font-bold rounded-full">
                {index + 1}
              </div>
              <div>
                <div className="text-xl font-bold text-slate-800">
                  {area.areaName}
                </div>
              </div>
            </div>

            {/* 유사도 배지 */}
            <div
              className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 text-lg ${getSimilarityColor(
                area.similarity
              )}`}
            >
              <SimilarityIcon similarity={area.similarity} />
              {area.similarity.toFixed(0)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
