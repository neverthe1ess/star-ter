'use client';

import React from 'react';
import {
  MapPin,
  Users,
  TrendingUp,
  Building2,
  DollarSign,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'location', label: '위치·공간 정보', icon: <MapPin size={14} /> },
  { id: 'population', label: '인구 유동 특성', icon: <Users size={14} /> },
  { id: 'revenue', label: '매출 수익 구조', icon: <TrendingUp size={14} /> },
  { id: 'industry', label: '업종 분석', icon: <Building2 size={14} /> },
  { id: 'cost', label: '창업 비용·손익', icon: <DollarSign size={14} /> },
  { id: 'risk', label: '경쟁·리스크 분석', icon: <AlertTriangle size={14} /> },
  { id: 'trend', label: '트렌드·외부 신호', icon: <Sparkles size={14} /> },
];

interface CategoryTabsProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export default function CategoryTabs({
  activeTab = 'population',
  onTabChange,
}: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 px-6 py-4 bg-white border-b border-gray-100">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${
                isActive
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
