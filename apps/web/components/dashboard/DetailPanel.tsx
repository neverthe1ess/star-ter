'use client';

import React from 'react';
import { RankingItem, CHART_DATA } from './mock-data';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface DetailPanelProps {
  item: RankingItem;
}

export default function DetailPanel({ item }: DetailPanelProps) {
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
             <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
             <span className="text-sm text-gray-500">{item.code.toUpperCase()} · {item.category}</span>
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
        <p className="text-sm text-gray-400 mt-1">어제보다 12% 방문자 증가</p>
      </div>

      {/* Chart Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
           <h3 className="font-semibold text-gray-700">실시간 유동인구 추이</h3>
           <span className="text-xs text-gray-400">최근 5분 기준</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CHART_DATA}>
               <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#9ca3af'}} 
                dy={10}
              />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#ef4444" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Community / News Section */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-4">커뮤니티</h3>
        <div className="space-y-4">
            <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0" />
               <div className="bg-gray-50 rounded-2xl rounded-tl-none p-3 text-sm text-gray-700">
                  <p className="font-bold mb-1">순동222 <span className="text-gray-400 font-normal text-xs">1시간 전</span></p>
                  <p>여기 주말에 사람 진짜 많음. 카페 자리 잡기 힘들어서 3군데 돌아다님 ㅠㅠ</p>
               </div>
            </div>
             <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-green-100 flex-shrink-0" />
               <div className="bg-gray-50 rounded-2xl rounded-tl-none p-3 text-sm text-gray-700">
                  <p className="font-bold mb-1">창업준비중 <span className="text-gray-400 font-normal text-xs">3시간 전</span></p>
                  <p>임대료가 너무 올랐어요. 작년 대비 15%는 오른듯?</p>
               </div>
            </div>
            
             {/* Meme Image Placeholder */}
             <div className="mt-4 rounded-xl overflow-hidden border border-gray-100">
                <div className="bg-gray-200 h-48 w-full flex items-center justify-center text-gray-500">
                    Image Placeholder
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}
