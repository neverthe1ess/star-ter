'use client';

import React, { useState } from 'react';
import { RankingItem, METRIC_DATA, MOCK_NEWS, MOCK_SNS, MOCK_BLOGS, METRIC_DESCRIPTIONS } from './mock-data';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line
} from 'recharts';

interface DetailPanelProps {
  item: RankingItem;
}

export default function DetailPanel({ item }: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'뉴스' | 'SNS' | '블로그'>('뉴스');
  const [chartMetric, setChartMetric] = useState<'잘나가는 업종' | '업종 포화도' | '매출 성장성' | '성별/연령' | '유동인구'>('잘나가는 업종');

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
        
        <div className="flex items-end gap-3 mt-4">
           <span className="text-3xl font-bold text-gray-900">
             {item.revenue.toLocaleString()}원
           </span>
           <span className={`text-lg font-bold mb-1 ${item.fluctuation > 0 ? 'text-red-500': 'text-blue-500'}`}>
             {item.fluctuation > 0 ? '+' : ''}{item.fluctuation}%
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
              {['잘나가는 업종', '업종 포화도', '매출 성장성', '성별/연령', '유동인구'].map((metric) => (
                <button
                  key={metric}
                  onClick={() => setChartMetric(metric as '잘나가는 업종' | '업종 포화도' | '매출 성장성' | '성별/연령' | '유동인구')}
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
           
           {/* Metric Description */}
           <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm text-gray-600 leading-relaxed">
              💡 {METRIC_DESCRIPTIONS[chartMetric]}
           </div>
        </div>

        <div className="h-64 w-full bg-white rounded-2xl border border-gray-100 p-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartMetric === '잘나가는 업종' ? (
                <BarChart layout="vertical" data={METRIC_DATA.sectors} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tick={{fontSize: 16, fontWeight: 600}} width={50} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
            ) : chartMetric === '업종 포화도' ? (
                <BarChart layout="vertical" data={METRIC_DATA.saturation} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tick={{fontSize: 12}} width={80} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {METRIC_DATA.saturation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            ) : chartMetric === '매출 성장성' ? (
                <AreaChart data={METRIC_DATA.growth}>
                    <defs>
                        <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                    <YAxis hide />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none'}} />
                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorGrowth)" />
                </AreaChart>
            ) : chartMetric === '성별/연령' ? (
                <PieChart>
                    <Pie
                        data={METRIC_DATA.demographics}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {METRIC_DATA.demographics.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none'}} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
            ) : (
                <LineChart data={METRIC_DATA.population}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                    <YAxis hide />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none'}} />
                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} dot={{r: 4, fill: '#ef4444'}} activeDot={{r: 6}} />
                </LineChart>
            )}
          </ResponsiveContainer>
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

