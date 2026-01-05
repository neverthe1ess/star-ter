'use client';

import React from 'react';
import { RANKING_DATA, RankingItem } from './mock-data';
import { Heart } from 'lucide-react';

interface RankingListProps {
  onSelect: (item: RankingItem) => void;
  selectedId: string | null;
}

export default function RankingList({ onSelect, selectedId }: RankingListProps) {
  return (
    <div className="flex flex-col bg-white">
      {/* List Header */}
      <div className="grid grid-cols-12 gap-4 border-b border-gray-100 px-6 py-3 text-xs font-medium text-gray-500">
        <div className="col-span-1 text-center">순위</div>
        <div className="col-span-4">상권명</div>
        <div className="col-span-3 text-right">매출 (월)</div>
        <div className="col-span-2 text-right">등락률</div>
        <div className="col-span-2 text-right">유동인구</div>
      </div>

      {/* List Items */}
      <div className="flex-1 overflow-y-auto">
        {RANKING_DATA.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className={`group grid cursor-pointer grid-cols-12 items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50 ${
              selectedId === item.id ? 'bg-blue-50/60' : ''
            }`}
          >
            {/* Rank & Favorite */}
            <div className="col-span-1 flex items-center justify-center gap-2">
              <span className="font-bold text-gray-900">{item.rank}</span>
              <Heart
                className={`h-4 w-4 ${
                  item.isFavorite
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-300 group-hover:text-gray-400'
                }`}
              />
            </div>

            {/* Name & Category */}
            <div className="col-span-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden">
                {/* Logo Placeholder */}
                {item.name.slice(0, 1)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">
                  {item.name}
                </span>
                <span className="text-xs text-gray-500">{item.category}</span>
              </div>
            </div>

            {/* Revenue */}
            <div className="col-span-3 text-right font-medium text-gray-900">
              {(item.revenue / 10000).toLocaleString()}만원
            </div>

            {/* Fluctuation */}
            <div className="col-span-2 text-right">
              <span
                className={`rounded px-2 py-1 text-xs font-bold ${
                  item.fluctuation > 0
                    ? 'bg-red-50 text-red-600'
                    : item.fluctuation < 0
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-gray-50 text-gray-600'
                }`}
              >
                {item.fluctuation > 0 ? '+' : ''}
                {item.fluctuation}%
              </span>
            </div>

            {/* Volume */}
            <div className="col-span-2 text-right text-xs text-gray-600 relative">
               {/* Bar Indicator */}
               <div className="absolute top-1/2 right-0 h-1 w-full bg-gray-100 -translate-y-1/2 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-blue-200" 
                     style={{ width: `${(item.volume / 1200000) * 100}%` }}
                   />
               </div>
               <span className="relative z-10">{item.volume.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
