'use client';

import React, { useState } from 'react';
import { Search, Home, PieChart, MessageSquare, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import RankingList from './RankingList';
import DetailPanel from './DetailPanel';
import AiInputSection from './AiInputSection';
import { RankingItem } from './mock-data';
import { useAuth } from '@/hooks/useAuth';
import { useModalStore } from '@/stores/useModalStore';

export default function DashboardLayout() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { openModal } = useModalStore();
  const [selectedItem, setSelectedItem] = useState<RankingItem | null>(null);
  const [activeTab, setActiveTab] = useState<'REGION' | 'INDUSTRY'>('REGION');
  const [detailWidth, setDetailWidth] = useState(600);
  const [isResizing, setIsResizing] = useState(false);

  // 부동산 등록 클릭 핸들러 (로그인 체크 + 모달)
  const handleRealEstateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      router.push('/real-estate/register');
    } else {
      openModal({
        type: 'confirm',
        title: '로그인 필요',
        content: '부동산 등록을 위해서는 로그인이 필요합니다.',
        confirmText: '로그인',
        cancelText: '취소',
        onConfirm: () => {
          router.push('/login');
        },
      });
    }
  };

  return (
    <div className="flex flex-col bg-white">
      {/* 1. Global Header */}
      <header className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Star-ter with AI
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            <a href="#" className="flex items-center gap-1 hover:text-gray-900">
              <Home className="h-4 w-4" /> 홈
            </a>
            <a href="#" className="flex items-center gap-1 text-gray-900">
              <PieChart className="h-4 w-4" /> 상권분석
            </a>
            <a href="#" className="flex items-center gap-1 hover:text-gray-900">
              <MessageSquare className="h-4 w-4" /> 커뮤니티
            </a>
            <button
              onClick={handleRealEstateClick}
              className="flex items-center gap-1 hover:text-gray-900"
            >
              <Building2 className="h-4 w-4" /> 부동산 등록
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="지역, 상권, 아파트 검색"
              className="w-full rounded-full bg-gray-100 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button className="flex h-9 w-24 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white hover:bg-blue-700">
            로그인
          </button>
        </div>
      </header>

      {/* 2.5 AI Input Section */}
      <AiInputSection />

      {/* 3. Main Content Split View */}
      <main
        className="flex flex-1 overflow-hidden"
        onMouseMove={(e) => {
          if (!isResizing) return;
          e.preventDefault();
          const newWidth = document.body.clientWidth - e.clientX;
          if (newWidth > 200 && newWidth < 1200) {
            setDetailWidth(newWidth);
          }
        }}
        onMouseUp={() => setIsResizing(false)}
        onMouseLeave={() => setIsResizing(false)}
      >
        {/* Left: Ranking List */}
        <section className="flex-1 flex flex-col min-w-100 border-r border-gray-200">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
            <button
              onClick={() => setActiveTab('REGION')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeTab === 'REGION'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              지역별 매출
            </button>
            <button
              onClick={() => setActiveTab('INDUSTRY')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeTab === 'INDUSTRY'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              업종별 매출
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <RankingList
              key={activeTab}
              onSelect={setSelectedItem}
              activeTab={activeTab}
            />
          </div>
        </section>

        {/* Resizer Handle */}
        <div
          className="w-1 cursor-col-resize bg-transparent hover:bg-blue-400 active:bg-blue-600 transition-colors z-20 flex flex-col justify-center items-center group"
          onMouseDown={() => setIsResizing(true)}
        >
          <div className="h-8 w-1 rounded-full bg-gray-200 group-hover:bg-blue-300" />
        </div>

        {/* Right: Detail Panel */}
        <aside
          className="shrink-0 bg-white shadow-[-4px_0_12px_rgba(0,0,0,0.05)] z-10"
          style={{ width: detailWidth }}
        >
          {selectedItem && <DetailPanel item={selectedItem} />}
        </aside>
      </main>
    </div>
  );
}
