"use client";

import React from "react";

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
  similarity: number;  // 유사도 (0-100)
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
  if (similarity >= 90) return "text-green-600 bg-green-50";
  if (similarity >= 80) return "text-blue-600 bg-blue-50";
  if (similarity >= 70) return "text-yellow-600 bg-yellow-50";
  return "text-slate-600 bg-slate-50";
};

// 유사도 아이콘
const getSimilarityIcon = (similarity: number): string => {
  if (similarity >= 90) return "🎯";
  if (similarity >= 80) return "✨";
  if (similarity >= 70) return "👍";
  return "📊";
};

export function SimilarAreasCard({ data, isLoading }: SimilarAreasCardProps) {
  // 로딩 상태
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // 데이터 없음
  if (!data || !data.similarAreas || data.similarAreas.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-slate-500">
        🗺️ 유사한 상권을 찾을 수 없습니다.
      </div>
    );
  }

  const { targetAreaName, similarAreas } = data;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 my-4">
      {/* 헤더 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800">
          🗺️ <span className="text-blue-600">{targetAreaName}</span>과(와) 유사한 상권
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          연령대 분포, 시간대 패턴, 인구 구성 기준
        </p>
      </div>

      {/* 유사 상권 리스트 */}
      <div className="space-y-3">
        {similarAreas.map((area, index) => (
          <div
            key={area.areaCode || index}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {/* 순위 및 상권명 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 font-bold rounded-full">
                {index + 1}
              </div>
              <div>
                <div className="font-medium text-slate-800">
                  {area.areaName}
                </div>
              </div>
            </div>

            {/* 유사도 배지 */}
            <div className={`px-3 py-1 rounded-full font-semibold ${getSimilarityColor(area.similarity)}`}>
              {getSimilarityIcon(area.similarity)} {area.similarity.toFixed(0)}%
            </div>
          </div>
        ))}
      </div>

      {/* 안내 메시지 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
        💡 유사 상권에서 성공 사례를 참고하면 창업 전략 수립에 도움이 됩니다.
      </div>
    </div>
  );
}
