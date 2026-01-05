'use client';

import React from 'react';
import { Users, Clock, CreditCard, TrendingUp } from 'lucide-react';

interface SummaryCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  mainValue: string;
  subValue?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

// 목 데이터
const mockCards: SummaryCard[] = [
  {
    id: 'population',
    icon: <Users size={18} className="text-purple-600" />,
    title: '평균 유동 인구',
    mainValue: '일 평균 28,500명',
    trend: {
      value: '전월 대비 12.5%',
      isPositive: true,
    },
  },
  {
    id: 'peak',
    icon: <Clock size={18} className="text-green-600" />,
    title: '피크 시간대',
    mainValue: '18:00 - 21:00',
    subValue: '평균 42,000명',
  },
  {
    id: 'payment',
    icon: <CreditCard size={18} className="text-blue-600" />,
    title: '주 결제 시간',
    mainValue: '저녁 (18-21시)',
    subValue: '6,890건/일',
  },
];

export default function SummaryCards() {
  return (
    <div className="grid grid-cols-3 gap-4 px-6 py-4">
      {mockCards.map((card) => (
        <div
          key={card.id}
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-gray-50 rounded-lg">{card.icon}</div>
            <span className="text-sm font-medium text-gray-600">
              {card.title}
            </span>
          </div>

          <div className="text-lg font-bold text-gray-900">{card.mainValue}</div>

          {card.trend && (
            <div
              className={`flex items-center gap-1 mt-1 text-sm ${
                card.trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <TrendingUp size={14} />
              <span>{card.trend.value}</span>
            </div>
          )}

          {card.subValue && (
            <div className="text-sm text-gray-500 mt-1">{card.subValue}</div>
          )}
        </div>
      ))}
    </div>
  );
}
