'use client';

import React from 'react';

interface SaturationItem {
  name: string;
  value: number;
  color: string;
}

interface SaturationGridProps {
  data: SaturationItem[];
}

export default function SaturationGrid({ data }: SaturationGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 h-full p-2">
      {data.map((item, index) => (
        <div
          key={index}
          className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow cursor-default group"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-gray-800 text-lg">
              {item.name.split(' ')[0]}
            </span>
            <div
              className={`w-4 h-4 rounded-full shadow-sm ring-2 ring-offset-1 ${
                item.value >= 80
                  ? 'ring-red-100'
                  : item.value >= 50
                  ? 'ring-orange-100'
                  : 'ring-green-100'
              }`}
              style={{ backgroundColor: item.color }}
            />
          </div>
          <div>
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs text-gray-400 font-medium">포화도</span>
              <span className="text-sm font-bold" style={{ color: item.color }}>
                {item.value >= 80
                  ? '진입 자제'
                  : item.value >= 60
                  ? '경쟁 심화'
                  : '진입 추천'}
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${item.value}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
