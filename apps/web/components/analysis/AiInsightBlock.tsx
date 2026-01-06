'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface AiInsightBlockProps {
  topic: 'location' | 'population' | 'revenue' | 'industry' | 'risk';
  areaName: string;
  metrics: string;
  period?: string;
}

export default function AiInsightBlock({
  topic,
  areaName,
  metrics,
  period,
}: AiInsightBlockProps) {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const topicLabels: Record<string, string> = {
    population: '인구 유동 특성',
    revenue: '매출 수익 구조',
    industry: '업종 분석',
    risk: '경쟁 리스크 분석',
  };

  useEffect(() => {
    async function fetchAiAnalysis() {
      if (!metrics) return;

      setLoading(true);
      try {
        const response = await fetch('/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic,
            areaName,
            metrics,
          }),
        });

        if (response.ok) {
          const result = await response.text();
          setInsight(result);
        } else {
          setInsight('분석 결과를 불러오는 중에 문제가 발생했습니다.');
        }
      } catch (error) {
        console.error('AI Analysis fetch error:', error);
        setInsight('AI 분석 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchAiAnalysis();
  }, [topic, areaName, metrics]);

  return (
    <div className="bg-linear-to-br from-blue-50 to-indigo-50/30 p-5 rounded-2xl border border-blue-100/50 shadow-sm transition-all hover:shadow-md animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 shadow-sm">
          <Sparkles className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
              AI {topicLabels[topic] || '상권 분석'}
              <span className="text-[10px] text-blue-600 font-extrabold bg-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Insight
              </span>
            </p>
            {period && (
              <span className="text-[10px] font-bold text-gray-400">
                {period} 기준
              </span>
            )}
          </div>

          <div className="text-[14px] text-gray-700 leading-relaxed font-medium">
            {loading ? (
              <div className="flex items-center gap-2 text-blue-400 min-h-[40px]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>데이터를 바탕으로 상권을 정밀 분석하고 있어요...</span>
              </div>
            ) : (
              <p className="animate-in fade-in duration-700">
                {insight || '분석을 준비하고 있습니다.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
