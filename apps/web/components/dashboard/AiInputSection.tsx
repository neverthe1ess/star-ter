'use client';

import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function AiInputSection() {
  return (
    <div className="w-full bg-white px-6 py-8 border-b border-gray-100">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
        {/* Title / Greeting */}
        <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-600 fill-blue-100" />
                <span>무엇을 도와드릴까요?</span>
            </h1>
            <p className="text-gray-500 text-sm">
                상권 분석, 창업 추천, 매출 예측 등 궁금한 점을 자연스럽게 물어보세요.
            </p>
        </div>

        {/* Large Chat Input */}
        <div className="w-full relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center bg-white rounded-2xl border border-gray-200 shadow-sm transition-all focus-within:shadow-md focus-within:border-blue-400">
            <textarea
              placeholder="예: 강남역에서 30대 여성이 좋아하는 카페 창업하려면?"
              rows={1}
              className="w-full bg-transparent px-6 py-4 pr-14 text-base placeholder:text-gray-400 focus:outline-none resize-none overflow-hidden min-h-[60px] "
              onInput={(e) => {
                e.currentTarget.style.height = 'auto';
                e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
              }}
            />
            <button className="absolute right-3 p-2 bg-gray-900 rounded-xl text-white hover:bg-black transition-colors">
                <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Large Suggestion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {[
              {
                icon: '☕️',
                title: '카페 창업 분석',
                desc: '성수동 카페거리 임대료와 20대 유동인구 분석해줘',
              },
              {
                icon: '🍗',
                title: '매출 비교',
                desc: '강남역 인근 프랜차이즈 치킨집 평균 매출 비교해줘',
              },
              {
                icon: '🔥',
                title: '뜨는 상권',
                desc: '최근 3개월간 2030 유입이 가장 많이 늘어난 곳은?',
              },
              {
                icon: '📉',
                title: '폐업률 점검',
                desc: '홍대 입구 역세권 최근 1년 요식업 폐업률 현황',
              },
            ].map((item) => (
                <button 
                  key={item.title}
                  className="flex flex-col items-start p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-all text-left group"
                >
                    <div className="bg-white w-10 h-10 rounded-xl shadow-sm flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                    </div>
                    <span className="font-bold text-gray-900 text-sm mb-1 group-hover:text-blue-700">
                        {item.title}
                    </span>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium group-hover:text-blue-600/70">
                        {item.desc}
                    </p>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
}
