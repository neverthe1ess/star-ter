'use client';

import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  Building2,
  DollarSign,
  AlertTriangle,
  GitCompare,
} from 'lucide-react';
import ComparisonModal from './ComparisonModal';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'population', label: '인구 유동 특성', icon: <Users size={14} /> },
  { id: 'revenue', label: '매출 수익 구조', icon: <TrendingUp size={14} /> },
  { id: 'industry', label: '업종 분석', icon: <Building2 size={14} /> },
  { id: 'cost', label: '창업 비용·손익', icon: <DollarSign size={14} /> },
  { id: 'risk', label: '경쟁·리스크 분석', icon: <AlertTriangle size={14} /> },
];

interface CategoryTabsProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export default function CategoryTabs({
  activeTab = 'population',
  onTabChange,
}: CategoryTabsProps) {
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-1.5 px-8 py-3 bg-white border-b border-gray-100 sticky top-0 z-20 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold transition-all whitespace-nowrap active:scale-95
                ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100 border border-blue-600'
                    : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100 hover:text-gray-700'
                }
              `}
            >
              <span className={isActive ? 'text-white' : 'text-gray-400'}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* 상권 비교 버튼 */}
        <button
          onClick={() => setIsComparisonModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold transition-all whitespace-nowrap active:scale-95 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700 ml-auto"
        >
          <GitCompare size={14} />
          <span>상권 비교</span>
        </button>
      </div>

      {/* 상권 비교 모달 */}
      <ComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
      />
    </>
  );
}
