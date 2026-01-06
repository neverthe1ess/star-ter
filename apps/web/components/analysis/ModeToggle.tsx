'use client';

import React from 'react';
import { PieChart, Building2 } from 'lucide-react';

interface ModeToggleProps {
  mode: 'analysis' | 'real-estate';
  onModeChange: (mode: 'analysis' | 'real-estate') => void;
}

/**
 * 지도 모드 토글 버튼
 */
export default function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="absolute top-4 left-4 z-10 flex gap-1 p-1 bg-white rounded-lg shadow-lg border border-gray-200">
      <button
        onClick={() => onModeChange('analysis')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === 'analysis'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <PieChart className="h-4 w-4" />
        상권분석
      </button>
      <button
        onClick={() => onModeChange('real-estate')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === 'real-estate'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Building2 className="h-4 w-4" />
        부동산
      </button>
    </div>
  );
}
