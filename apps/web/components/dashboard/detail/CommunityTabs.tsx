'use client';

import React, { useState } from 'react';
import { MOCK_NEWS, MOCK_SNS, MOCK_BLOGS } from '../mock-data';

type TabType = '뉴스' | 'SNS' | '블로그';

const TAB_LIST: TabType[] = ['뉴스', 'SNS', '블로그'];

/**
 * CommunityTabs 컴포넌트
 * 
 * 뉴스, SNS, 블로그 탭을 표시하는 커뮤니티 섹션입니다.
 * - 탭 전환 UI
 * - 각 탭별 콘텐츠 렌더링 (뉴스 목록, SNS 그리드, 블로그 카드)
 */
export default function CommunityTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('뉴스');

  return (
    <div>
      {/* 탭 헤더 */}
      <div className="flex items-center gap-4 border-b border-gray-100 mb-4">
        {TAB_LIST.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
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

      {/* 탭 콘텐츠 */}
      <div className="space-y-4">
        {/* 뉴스 탭 */}
        {activeTab === '뉴스' && (
          <div className="space-y-3">
            {MOCK_NEWS.map((news) => (
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

        {/* SNS 탭 */}
        {activeTab === 'SNS' && (
          <div className="grid grid-cols-2 gap-2">
            {MOCK_SNS.map((sns) => (
              <div
                key={sns.id}
                className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer"
              >
                <img
                  src={sns.imageUrl}
                  alt="sns feed"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute bottom-2 left-2 text-white text-xs font-bold flex flex-col gap-0.5">
                  <span>♥ {sns.likes}</span>
                  <span className="opacity-80 text-[10px]">{sns.author}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 블로그 탭 */}
        {activeTab === '블로그' && (
          <div className="space-y-3">
            {MOCK_BLOGS.map((blog) => (
              <div
                key={blog.id}
                className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100"
              >
                <span className="text-[10px] font-bold text-gray-500 mb-1 block">
                  {blog.author}
                </span>
                <h4 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">
                  {blog.title}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{blog.snippet}</p>
                <div className="mt-2 text-xs text-gray-400">{blog.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
