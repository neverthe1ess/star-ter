'use client';

import React, { useState } from 'react';
import { RankingItem, METRIC_DATA, MOCK_NEWS, MOCK_SNS, MOCK_BLOGS, METRIC_INSIGHTS, MetricType, METRIC_TYPES } from './mock-data';
import SectorChart from './charts/SectorChart';
import SaturationGrid from './charts/SaturationGrid';
import GrowthChart from './charts/GrowthChart';
import DemographicsRadar from './charts/DemographicsRadar';
import PopulationChart from './charts/PopulationChart';

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

  const status = getStatusBadge(item.fluctuation);

  const renderChart = () => {
    switch (chartMetric) {
      case '잘나가는 업종':
        return <SectorChart data={METRIC_DATA.sectors} />;
      case '업종 포화도':
        return <SaturationGrid data={METRIC_DATA.saturation} />;
      case '매출 성장성':
        return <GrowthChart data={METRIC_DATA.growth} />;
      case '성별/연령':
        return <DemographicsRadar data={METRIC_DATA.radar} />;
      case '유동인구':
        return <PopulationChart data={METRIC_DATA.population} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 p-6 overflow-y-auto">
      {/* Header Info */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
           <img 
             src={`https://api.dicebear.com/7.x/initials/svg?seed=${item.name}`} 
             alt="logo" 
             className="w-10 h-10 rounded-full bg-gray-100"
           />
           <div>
             <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
             <span className="text-base text-gray-500">{item.code.toUpperCase()} · {item.category}</span>
           </div>
        </div>
        
        <div className="flex items-center gap-3 mt-4">
           <span className="text-3xl font-bold text-gray-900">
             {item.revenue.toLocaleString()}원
           </span>
           <span className={`px-3 py-1 rounded-full text-sm font-bold ${status.className}`}>
             {status.label}
           </span>
        </div>
        <p className="text-md text-gray-600 mt-1">평균 매출(월)</p>
        
        {/* AI Summary Comment */}
        <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
           <div className="flex items-center gap-2 mb-2">
             <span className="text-xl">🤖</span>
             <span className="font-bold text-blue-900 text-base">AI 상권 요약</span>
           </div>
           <p className="text-base text-gray-700 leading-relaxed font-medium">
             {item.summary || "데이터를 분석중입니다..."}
           </p>
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
           <div className="bg-blue-50/80 border border-blue-100 rounded-xl py-3 px-4 text-center">
              <p className="text-sm text-gray-800 tracking-tight">
                 <span className="font-bold text-blue-700 text-lg mr-1">
                    {METRIC_INSIGHTS[chartMetric].highlight}
                 </span>
                 {METRIC_INSIGHTS[chartMetric].text}
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

