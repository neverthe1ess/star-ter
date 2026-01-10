'use client';

import { useState, useEffect } from 'react';
import { Activity, Store, TrendingUp, TrendingDown } from 'lucide-react';
import type { MarketAnalytics } from './types';
import { MAJOR_CATEGORIES } from './constants/category';

interface AnalysisContentProps {
  analytics: MarketAnalytics | null;
  regionCode?: string;
  /** 카테고리 선택 변경 시 호출되는 콜백 (지도에 점포 표시용) */
  onCategoryChange?: (categoryCode: string) => void;
}



import { formatRevenue } from './utils';

interface VitalityData {
  opbizRt: number;
  clsbizRt: number;
  opbizStoreCount: number;
  clsbizStoreCount: number;
}

export function AnalysisContent({ analytics, regionCode, onCategoryChange }: AnalysisContentProps) {
  // 선택된 대분류 탭
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  // 개폐업 데이터
  const [vitality, setVitality] = useState<VitalityData | null>(null);
  const [vitalityLoading, setVitalityLoading] = useState(false);

  // 카테고리 변경 시 부모에 알림
  useEffect(() => {
    onCategoryChange?.(selectedCategory);
  }, [selectedCategory, onCategoryChange]);

  // 【useEffect: 탭 변경 시 해당 대분류 데이터 fetch】
  useEffect(() => {
    if (!regionCode) return;

    const fetchVitality = async () => {
      setVitalityLoading(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      
        const url = `${API_URL}/report/summary?regionCode=${regionCode}&industryCode=${selectedCategory}`;
        const res = await fetch(url);
        
        if (res.ok) {
          const data = await res.json();
          setVitality(data.marketTrends);
        }
      } catch (error) {
        console.error('Failed to fetch vitality data:', error);
      } finally {
        setVitalityLoading(false);
      }
    };

    fetchVitality();
  }, [regionCode, selectedCategory]);

  // 섹터 데이터 가공
  const sectors = analytics?.sectors || [];
  const totalRevenue = sectors.reduce((sum, s) => sum + s.value, 0);
  const sortedSectors = [...sectors].sort((a, b) => b.value - a.value).slice(0, 5);

  // 순증감 계산
  const netChange = vitality ? vitality.opbizStoreCount - vitality.clsbizStoreCount : 0;

  return (
    <div className="space-y-8">
      {/* 업종별 개업/폐업 현황 섹션 */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          업종별 개업 / 폐업 현황
        </h2>

        {/* 대분류 탭 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {MAJOR_CATEGORIES.map((cat) => (
            <button
              key={cat.code}
              onClick={() => setSelectedCategory(cat.code)}
              className={`px-4 py-2 rounded-xl text-lg font-bold transition-all duration-200 ${
                selectedCategory === cat.code
                  ? 'bg-blue-950 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.code === 'ALL' && <span className="mr-1">●</span>}
              {cat.name}
            </button>
          ))}
        </div>

        {/* 두 카드 레이아웃 */}
        {vitalityLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            <div className="h-48 bg-gray-50 rounded-2xl" />
            <div className="h-48 bg-gray-50 rounded-2xl" />
          </div>
        ) : vitality ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 시장 활성도 카드 (개업 VS 폐업) */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full border-blue-950 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-950" />
                </div>
                <h3 className="font-bold text-gray-900 text-xl">시장 활성도</h3>
                <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-full">개업 VS 폐업</span>
              </div>

              <div className="flex justify-between items-end mb-5 px-1">
                {/* 개업 */}
                <div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-extrabold text-blue-600 tracking-tight">
                      {vitality.opbizStoreCount.toLocaleString()}
                    </span>
                    <span className="text-gray-500 font-medium text-sm">개소</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-md font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      개업
                    </span>
                    <span className="text-gray-600 text-md">
                      {vitality.opbizRt.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {/* 폐업 */}
                <div className="text-right">
                  <div className="flex items-baseline gap-1 justify-end mb-1">
                    <span className="text-3xl font-extrabold text-rose-500 tracking-tight">
                      {vitality.clsbizStoreCount.toLocaleString()}
                    </span>
                    <span className="text-gray-500 font-medium text-sm">개소</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-md font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">
                      폐업
                    </span>
                    <span className="text-gray-600 text-md">
                      {vitality.clsbizRt.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 비교 바 */}
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex mb-5 ring-1 ring-gray-100">
                <div 
                  className="h-full bg-blue-500 transition-all duration-700 ease-out relative group"
                  style={{ width: `${(vitality.opbizStoreCount / (vitality.opbizStoreCount + vitality.clsbizStoreCount + 0.001)) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
                </div>
                <div 
                  className="h-full bg-rose-400 transition-all duration-700 ease-out relative group"
                  style={{ width: `${(vitality.clsbizStoreCount / (vitality.opbizStoreCount + vitality.clsbizStoreCount + 0.001)) * 100}%` }}
                >
                   <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
                </div>
              </div>

              {/* 결론 메시지 */}
              <div className={`text-center py-3 rounded-xl border ${
                netChange >= 0 
                  ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' 
                  : 'bg-orange-50/50 border-orange-100 text-orange-700'
              }`}>
                {netChange >= 0 ? (
                  <p className="font-bold text-lg flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    성장하는 시장입니다<span className="text-emerald-600/70 font-semibold text-md ml-1">(진입 추천)</span>
                  </p>
                ) : (
                  <p className="font-bold text-lg flex items-center justify-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    위축되는 시장입니다 <span className="text-orange-600/70 font-semibold text-md ml-1">(주의 필요)</span>
                  </p>
                )}
              </div>
            </div>

            {/* 경쟁 밀집도 카드 (점포수 증감) */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                    <Store className="w-6 h-6 text-blue-950" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-xl">경쟁 밀집도</h3>
                  <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-full">점포수 증감</span>
                </div>

                <div className="flex items-center gap-5 mb-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm border ${
                    netChange >= 0 
                      ? '' 
                      : ''
                  }`}>
                     {netChange >= 0 ? (
                       <TrendingUp className="w-8 h-8 text-emerald-600" />
                     ) : (
                       <TrendingDown className="w-8 h-8 text-orange-500" />
                     )}
                  </div>
                  <div>
                    <p className="text-md font-bold text-gray-500 mb-1">신규 - 폐업 (순증감)</p>
                    <div className="flex items-baseline gap-1">
                      <p className={`text-4xl font-extrabold tracking-tight ${
                        netChange >= 0 ? 'text-emerald-600' : 'text-orange-500'
                      }`}>
                        {netChange > 0 ? '+' : ''}{netChange.toLocaleString()}
                      </p>
                      <span className="text-lg font-bold text-gray-400">개</span>
                    </div>
                  </div>
                </div>
              </div>

               <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-blue-950 font-bold text-xl leading-relaxed">
                  지난 분기 동안 <span className="font-bold text-blue-600">{vitality.opbizStoreCount.toLocaleString()}개</span>가 새로 생기고,<br/>
                  <span className="font-bold text-rose-500">{vitality.clsbizStoreCount.toLocaleString()}개</span>가 문을 닫았습니다.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
            <Store className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">개폐업 데이터가 없습니다</p>
          </div>
        )}
      </div>

      {/* 업종별 매출 분석 섹션 */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          업종별 매출 분석
        </h2>
        <p className="text-gray-500 text-sm mb-6">
        </p>

        {sortedSectors.length > 0 ? (
          <div className="space-y-4">
            {sortedSectors.map((item, index) => {
              const share = totalRevenue > 0 ? Math.round((item.value / totalRevenue) * 100) : 0;
              // 1등은 Orange, 나머지는 Blue
              const colorClass = index === 0 ? 'bg-orange-500' : 'bg-blue-900';
              
              return (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${colorClass}`} />
                      <span className="font-semibold text-gray-900">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">
                        {formatRevenue(item.value)}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({share}%)
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${colorClass}`}
                      style={{ width: `${Math.min(share, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* 총 매출 표시 */}
            <div className="pt-4 mt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">총 매출</span>
                <span className="text-xl font-bold text-gray-900">{formatRevenue(totalRevenue)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            매출 데이터가 없습니다
          </div>
        )}
      </div>

      {/* 업종별 포화도 섹션 (있을 경우) */}
      {analytics?.saturation && analytics.saturation.length > 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            업종별 경쟁 강도
          </h2>
          <p className="text-gray-500 text-sm mb-6">
          </p>

          <div className="grid grid-cols-2 gap-3">
            {analytics.saturation.slice(0, 4).map((item) => {
              const statusColor = {
                '위험': 'bg-red-500 text-white',
                '경계': 'bg-yellow-500 text-white',
                '추천': 'bg-green-500 text-white',
              }[item.status] || 'bg-gray-500 text-white';

              return (
                <div key={item.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-2xl font-bold text-blue-950 p-4">{item.name}</span>
                  <span className={`px-3 py-1 rounded-full text-md font-bold ${statusColor}`}>
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
