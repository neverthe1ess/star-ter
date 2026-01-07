'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

interface RevenuePatternChartProps {
  dailyRatio: { day: string; ratio: number }[];
  timePeriodRatio: { timeRange: string; ratio: number }[];
}

export default function RevenuePatternChart({
  dailyRatio,
  timePeriodRatio,
}: RevenuePatternChartProps) {
  const [activeTab, setActiveTab] = React.useState<'day' | 'time'>('day');

  // 컬러 팔레트 - 요일별 (Active한 요일 강조)
  const maxDailyRatio = Math.max(...dailyRatio.map((d) => d.ratio));

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 탭 헤더 */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">매출 패턴 분석</h3>
        <div className="flex p-1 bg-gray-100/80 rounded-xl">
          <button
            onClick={() => setActiveTab('day')}
            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
              activeTab === 'day'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            요일별
          </button>
          <button
            onClick={() => setActiveTab('time')}
            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
              activeTab === 'time'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            시간대별
          </button>
        </div>
      </div>

      <div className="p-8 h-80">
        {activeTab === 'day' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyRatio} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/90 backdrop-blur-md border border-gray-100 p-3 rounded-2xl shadow-xl flex flex-col gap-1">
                        <span className="text-[11px] font-black text-gray-400">{payload[0].payload.day}요일</span>
                        <span className="text-sm font-black text-blue-600">{payload[0].value}% 비중</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="ratio" radius={[6, 6, 0, 0]} barSize={32}>
                {dailyRatio.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.ratio === maxDailyRatio ? 'url(#barGradient)' : '#f1f5f9'}
                    className="transition-all duration-500 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timePeriodRatio} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="timeRange"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/90 backdrop-blur-md border border-gray-100 p-3 rounded-2xl shadow-xl flex flex-col gap-1">
                        <span className="text-[11px] font-black text-gray-400">{payload[0].payload.timeRange}</span>
                        <span className="text-sm font-black text-blue-600">{payload[0].value}% 매출</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="ratio"
                stroke="#2563eb"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#areaGradient)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="px-6 py-4 bg-gray-50/50 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
        <p className="text-[11px] font-bold text-gray-500">
          {activeTab === 'day' 
            ? `${dailyRatio.find(d => d.ratio === maxDailyRatio)?.day}요일에 매출이 가장 높게 발생하고 있습니다.`
            : `주요 결제가 발생하는 시간대를 확인하여 효율적인 매장 운영을 계획하세요.`}
        </p>
      </div>
    </div>
  );
}
