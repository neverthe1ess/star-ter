'use client';

import React, { useState } from 'react';
import { RankingItem, MOCK_NEWS, MOCK_SNS, MOCK_BLOGS, MetricType, METRIC_TYPES } from './mock-data';
import { formatShortNumber, formatKoreanCurrency } from '@/utils/currency-convert-format';
import SectorChart from './charts/SectorChart';
import SaturationGrid from './charts/SaturationGrid';
import GrowthChart from './charts/GrowthChart';
import DemographicsRadar from './charts/DemographicsRadar';
import PopulationChart from './charts/PopulationChart';
import { useMarketAnalytics } from '@/hooks/use-market-analytics';
import { RevenueLevel } from '@/services/revenue.service';
import { Sparkles } from 'lucide-react';
import { fetchAiSummary, formatMetricsForAi } from '@/services/ai.service';

interface DetailPanelProps {
  item: RankingItem;
}

/* TODO: DB 로직으로 수정하기 */
const getStatusBadge = (fluctuation: number) => {
  if (fluctuation >= 10) return { label: '뜨는 상권', className: 'bg-blue-100 text-blue-700' };
  if (fluctuation >= 3) return { label: '변동 상권', className: 'bg-amber-100 text-amber-700' };
  if (fluctuation <= -3) return { label: '위험 상권', className: 'bg-red-100 text-red-700' };
  return { label: '정체 상권', className: 'bg-gray-100 text-gray-700' };
};

export default function DetailPanel({ item }: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'뉴스' | 'SNS' | '블로그'>('뉴스');
  const [chartMetric, setChartMetric] = useState<MetricType>('잘나가는 업종');
  
  // 지역 코드 길이로 level 결정
  // 5자리 = 자치구 (signgu_cd), 8자리 = 행정동 (adstrd_cd)
  // 7자리 및 기타 = 상권 (trdar_cd)
  let level: RevenueLevel = 'commercial'; // 기본값: 상권
  if (item.code.length === 5) level = 'gu';
  else if (item.code.length === 8) level = 'dong'; 

  const { data, isLoading, error } = useMarketAnalytics(level, item.code);

  const [aiSummary, setAiSummary] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  React.useEffect(() => {
    // Reset summary when item changes
    setAiSummary('');
  }, [item.code]);

  React.useEffect(() => {
    if (data && item && !isLoading) {
      const fetchSummary = async () => {
        setIsAiLoading(true);
        try {
          const metrics = formatMetricsForAi(
            item.name,
            data.sectors,
            data.saturation,
            data.growth,
            data.demographics,
            data.population
          );
          const summary = await fetchAiSummary(item.name, metrics);
          setAiSummary(summary);
        } catch (error) {
          console.error('Failed to fetch AI summary', error);
        } finally {
          setIsAiLoading(false);
        }
      };
      
      const timer = setTimeout(() => {
        fetchSummary();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [data, item, isLoading]);

  const status = getStatusBadge(item.fluctuation);

  // 실제 데이터 기반 동적 인사이트 생성
  const getMetricInsight = (metric: MetricType): { highlight: string; text: string } => {
    if (!data) return { highlight: '-', text: '데이터를 분석중입니다...' };

    switch (metric) {
      case '잘나가는 업종': {
        const top = data.sectors[0];
        if (!top) return { highlight: '-', text: '업종 데이터가 없습니다.' };
        return {
          highlight: top.name,
          text: `업종이 ${formatShortNumber(top.value)}원으로 매출 1위를 기록하고 있어요.`
        };
      }
      case '업종 포화도': {
        const danger = data.saturation.find(s => s.status === '위험');
        const warn = data.saturation.find(s => s.status === '경계');
        if (danger) return { highlight: danger.name, text: '업종은 이미 포화 상태라 진입에 주의가 필요해요.' };
        if (warn) return { highlight: warn.name, text: '업종은 경계 수준이에요. 시장 조사가 필요합니다.' };
        return { highlight: '안정', text: '이 지역은 상대적으로 경쟁이 덜한 편이에요.' };
      }
      case '매출 성장성': {
        if (data.growth.length < 2) return { highlight: '-', text: '성장 데이터가 부족합니다.' };
        const latest = data.growth[data.growth.length - 1];
        const previous = data.growth[data.growth.length - 2];
        const growthRate = previous.amount > 0 
          ? Math.round(((latest.amount - previous.amount) / previous.amount) * 100) 
          : 0;
        const trend = growthRate > 0 ? '상승' : growthRate < 0 ? '하락' : '정체';
        return {
          highlight: `${Math.abs(growthRate)}%`,
          text: `지난 분기 대비 매출이 ${trend}했어요.`
        };
      }
      case '성별/연령': {
        if (!data.demographics.length) return { highlight: '-', text: '인구 데이터가 없습니다.' };
        const topAge = data.demographics.reduce((max, curr) => 
          (curr.male + curr.female) > (max.male + max.female) ? curr : max
        );
        const total = data.demographics.reduce((sum, d) => sum + d.male + d.female, 0);
        const percentage = total > 0 ? Math.round(((topAge.male + topAge.female) / total) * 100) : 0;
        return {
          highlight: topAge.subject,
          text: `고객 비중이 ${percentage}%로 가장 높아요.`
        };
      }
      case '유동인구': {
        if (!data.population.length) return { highlight: '-', text: '유동인구 데이터가 없습니다.' };
        const peak = data.population.reduce((max, curr) => curr.value > max.value ? curr : max);
        return {
          highlight: `${peak.time}시`,
          text: `시간대에 ${formatShortNumber(peak.value)}명으로 유동인구가 가장 많아요.`
        };
      }
      default:
        return { highlight: '-', text: '' };
    }
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center text-gray-400">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (error || !data) {
       return (
         <div className="h-full flex items-center justify-center text-gray-400">
             데이터를 불러올 수 없습니다.
         </div>
       );
    }

    const sectorData = data.sectors.map((item, index) => ({
      ...item,
      color: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'][index % 5],
    }));

    const saturationData = data.saturation.map(item => {
      let color = '#3b82f6'; // Default Blue
      if(item.status === '위험') color = '#ef4444';
      else if(item.status === '경계') color = '#f59e0b';
      else if(item.status === '추천') color = '#10b981';
      return { ...item, color };
    });

    const growthData = data.growth.map(item => ({
      name: item.period,
      value: item.amount
    }));

    const populationData = data.population.map(item => ({
      name: item.time,
      value: item.value
    }));

    switch (chartMetric) {
      case '잘나가는 업종':
        return <SectorChart data={sectorData} />;
      case '업종 포화도':
        return <SaturationGrid data={saturationData} />;
      case '매출 성장성':
        return <GrowthChart data={growthData} />;
      case '성별/연령':
        return <DemographicsRadar data={data.demographics} />;
      case '유동인구':
        return <PopulationChart data={populationData} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 p-6 overflow-y-auto">
      {/* Header Info */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
           <div>
             <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
             <span className="text-base text-gray-500">{item.code.toUpperCase()} · {item.category}</span>
           </div>
        </div>
        
        <div className="flex items-center gap-3 mt-4">
           <span className="text-3xl font-bold text-gray-900">
             {formatKoreanCurrency(item.revenue, { showWon: true })}
           </span>
           <span className={`px-3 py-1 rounded-full text-sm font-bold ${status.className}`}>
             {status.label}
           </span>
        </div>
        <p className="text-md text-gray-600 mt-1">평균 매출(월)</p>
        
        {/* AI Summary Comment */}
        <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 min-h-[120px]">
           <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                 {isAiLoading ? (
                   <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
                 ) : (
                   <Sparkles className="w-4 h-4 text-blue-600" />
                 )}
              </div>
              <div className="flex-1">
                 <p className="text-md font-bold text-gray-900 mb-1">AI 상권 요약</p>
                 {isAiLoading ? (
                   <div className="space-y-2 animate-pulse mt-2">
                     <div className="h-3 bg-blue-200/50 rounded w-3/4"></div>
                     <div className="h-3 bg-blue-200/50 rounded w-full"></div>
                     <div className="h-3 bg-blue-200/50 rounded w-5/6"></div>
                   </div>
                 ) : (
                   <p className="text-md text-black-600 leading-relaxed whitespace-pre-line">
                      {aiSummary || item.summary || "데이터를 분석하고 있어요..."}
                   </p>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Unified Chart Section */}
      <div className="mb-10">
        <div className="flex flex-col gap-4 mb-4">
           <div>
             <h3 className="text-lg font-bold text-gray-900 mb-1">상권 주요 지표 (Market Vital)</h3>
             <span className="text-sm text-gray-500">예비 창업자를 위한 핵심 데이터 분석</span>
           </div>
           
           {/* Metric Badges */}
           <div className="flex flex-wrap gap-2">
              {METRIC_TYPES.map((metric) => (
                <button
                  key={metric}
                  onClick={() => setChartMetric(metric)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    chartMetric === metric
                      ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {metric}
                </button>
              ))}
           </div>
           
           {/* Metric Insight Box */}
           <div className="border border-blue-100 rounded-xl py-3 px-4 text-center">
              <p className="text-md text-gray-800 tracking-tight">
                 <span className="font-bold text-red-500 text-lg mr-1">
                    {getMetricInsight(chartMetric).highlight}
                 </span>
                 {getMetricInsight(chartMetric).text}
              </p>
           </div>
        </div>

        <div className="h-64 w-full bg-white rounded-2xl border border-gray-100 p-4">
            {renderChart()}
        </div>
      </div>

      {/* Community / News Section */}
      <div>
        <div className="flex items-center gap-4 border-b border-gray-100 mb-4">
             {['뉴스', 'SNS', '블로그'].map((tab) => (
                 <button 
                     key={tab}
                     onClick={() => setActiveTab(tab as '뉴스' | 'SNS' | '블로그')}
                     className={`flex-1 py-3 text-base font-bold transition-colors relative text-center ${
                         activeTab === tab 
                         ? 'text-gray-900 bg-gray-50 rounded-t-lg' 
                         : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
                     }`}
                  >
                     {tab}
                     {activeTab === tab && (
                         <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900" />
                     )}
                  </button>
             ))}
        </div>

        <div className="space-y-4">
            {activeTab === '뉴스' && (
                <div className="space-y-3">
                    {MOCK_NEWS.map(news => (
                        <div key={news.id} className="group cursor-pointer py-2">
                            <h4 className="text-base font-bold text-gray-800 group-hover:text-blue-600 group-hover:underline decoration-blue-200 underline-offset-2 leading-relaxed">
                                {news.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-500">
                                <span>{news.press}</span>
                                <span>·</span>
                                <span>{news.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'SNS' && (
                <div className="grid grid-cols-2 gap-2">
                    {MOCK_SNS.map(sns => (
                        <div key={sns.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer">
                             <img src={sns.imageUrl} alt="sns feed" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                             <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                             <div className="absolute bottom-2 left-2 text-white text-xs font-bold flex flex-col gap-0.5">
                                 <span>♥ {sns.likes}</span>
                                 <span className="opacity-80 text-[10px]">{sns.author}</span>
                             </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === '블로그' && (
                 <div className="space-y-3">
                    {MOCK_BLOGS.map(blog => (
                        <div key={blog.id} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100">
                             <span className="text-[10px] font-bold text-gray-500 mb-1 block">{blog.author}</span>
                             <h4 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">{blog.title}</h4>
                             <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{blog.snippet}</p>
                             <div className="mt-2 text-xs text-gray-400">{blog.date}</div>
                        </div>
                    ))}
                 </div>
            )}
        </div>
      </div>
    </div>
  );
}
